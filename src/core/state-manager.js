/**
 * ==============================================================================
 * Centralized State Manager
 * ==============================================================================
 * Single Source of Truth for the application. Coordinates reactive updates,
 * synchronizes state with the WASM bridge, records undo/redo history, and
 * broadcasts granular domain events over the EventBus.
 */

import { eventBus } from './event-bus.js';
import { wasmBridge } from './wasm-bridge.js';
import { EVENTS, COMPONENT_METADATA } from './constants.js';

export class StateManager {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.selectedNodeId = null;
    this.selectedEdgeId = null;

    this.theme = localStorage.getItem('sds_theme') || 'dark';

    this.simConfig = {
      target_rps: 50000,
      profile: 'Constant',
      duration_seconds: 60,
      read_write_ratio: 0.85,
      isRunning: false
    };

    this.simReport = null;
    this.analysisReport = null;
    this.activeScenario = null;

    // Viewport camera transform
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0
    };

    // Auto-analysis debounce timer
    this._analysisDebounceTimer = null;
    this._autoSaveTimer = null;
  }

  /**
   * Initializes state and syncs with wasm bridge
   */
  async init() {
    await wasmBridge.init();
    this.applyTheme(this.theme);
  }

  // ============================================================================
  // GRAPH MUTATIONS
  // ============================================================================

  /**
   * Add a new node to the graph
   * @param {Object} nodeSpec
   * @returns {Object} Added node
   */
  addNode(nodeSpec) {
    const id = nodeSpec.id || `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const meta = COMPONENT_METADATA[nodeSpec.component_type] || {};

    const node = {
      id,
      name: nodeSpec.name || meta.name || 'Component',
      component_type: nodeSpec.component_type,
      x: Math.round(nodeSpec.x || 100),
      y: Math.round(nodeSpec.y || 100),
      config: { ...(nodeSpec.config || {}) },
      custom_capacity_rps: nodeSpec.custom_capacity_rps || null
    };

    this.nodes.set(id, node);
    wasmBridge.addNode(node);

    eventBus.emit(EVENTS.NODE_ADDED, node);
    this.triggerRealtimeAnalysis();
    this.scheduleAutoSave();
    return node;
  }

  /**
   * Remove a node by ID and its connected edges
   * @param {string} nodeId
   */
  removeNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Collect connected edges to remove
    const edgesToRemove = [];
    for (const edge of this.edges.values()) {
      if (edge.from === nodeId || edge.to === nodeId) {
        edgesToRemove.push(edge.id);
      }
    }

    for (const edgeId of edgesToRemove) {
      this.removeEdge(edgeId);
    }

    this.nodes.delete(nodeId);
    wasmBridge.removeNode(nodeId);

    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
      eventBus.emit(EVENTS.SELECTION_CHANGED, { node: null, edge: null });
    }

    eventBus.emit(EVENTS.NODE_REMOVED, { id: nodeId, node });
    this.triggerRealtimeAnalysis();
    this.scheduleAutoSave();
  }

  /**
   * Update node position
   * @param {string} nodeId
   * @param {number} x
   * @param {number} y
   */
  updateNodePosition(nodeId, x, y) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    node.x = Math.round(x);
    node.y = Math.round(y);

    eventBus.emit(EVENTS.NODE_MOVED, { id: nodeId, x: node.x, y: node.y });
    this.scheduleAutoSave();
  }

  /**
   * Update node configuration properties
   * @param {string} nodeId
   * @param {Object} partialConfig
   */
  updateNodeConfig(nodeId, partialConfig) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    node.config = {
      ...node.config,
      ...partialConfig
    };

    wasmBridge.addNode(node); // updates wasm shadow
    eventBus.emit(EVENTS.NODE_UPDATED, node);
    this.triggerRealtimeAnalysis();
    this.scheduleAutoSave();
  }

  /**
   * Rename a node
   * @param {string} nodeId
   * @param {string} newName
   */
  renameNode(nodeId, newName) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    node.name = newName;
    wasmBridge.addNode(node);
    eventBus.emit(EVENTS.NODE_UPDATED, node);
    this.scheduleAutoSave();
  }

  /**
   * Add a directed edge between two nodes
   * @param {Object} edgeSpec - { from, to, protocol }
   * @returns {Object|null}
   */
  addEdge(edgeSpec) {
    if (!this.nodes.has(edgeSpec.from) || !this.nodes.has(edgeSpec.to)) {
      console.warn('[StateManager] Cannot connect invalid node IDs:', edgeSpec);
      return null;
    }

    // Disallow self-loops
    if (edgeSpec.from === edgeSpec.to) {
      return null;
    }

    // Check if edge already exists
    for (const existing of this.edges.values()) {
      if (existing.from === edgeSpec.from && existing.to === edgeSpec.to) {
        return existing;
      }
    }

    const id = edgeSpec.id || `edge_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const edge = {
      id,
      from: edgeSpec.from,
      to: edgeSpec.to,
      protocol: edgeSpec.protocol || 'HTTP/REST',
      latency_overhead_ms: edgeSpec.latency_overhead_ms || 1.0
    };

    this.edges.set(id, edge);
    wasmBridge.addEdge(edge);

    eventBus.emit(EVENTS.EDGE_ADDED, edge);
    this.triggerRealtimeAnalysis();
    this.scheduleAutoSave();
    return edge;
  }

  /**
   * Update edge configuration properties (e.g. protocol, latency overhead)
   * @param {string} edgeId
   * @param {Object} partialConfig
   */
  updateEdgeConfig(edgeId, partialConfig) {
    const edge = this.edges.get(edgeId);
    if (!edge) return;

    Object.assign(edge, partialConfig);
    wasmBridge.addEdge(edge);

    eventBus.emit(EVENTS.EDGE_UPDATED, edge);
    this.triggerRealtimeAnalysis();
    this.scheduleAutoSave();
  }

  /**
   * Remove an edge
   * @param {string} edgeId
   */
  removeEdge(edgeId) {
    const edge = this.edges.get(edgeId);
    if (!edge) return;

    this.edges.delete(edgeId);
    wasmBridge.removeEdge(edgeId);

    if (this.selectedEdgeId === edgeId) {
      this.selectedEdgeId = null;
      eventBus.emit(EVENTS.SELECTION_CHANGED, { node: null, edge: null });
    }

    eventBus.emit(EVENTS.EDGE_REMOVED, { id: edgeId, edge });
    this.triggerRealtimeAnalysis();
    this.scheduleAutoSave();
  }

  /**
   * Clear all nodes and edges
   * @param {boolean} clearPersisted
   */
  clearGraph(clearPersisted = true) {
    this.nodes.clear();
    this.edges.clear();
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    wasmBridge.clear();

    if (clearPersisted) {
      this.clearSavedGraph();
    }

    eventBus.emit(EVENTS.GRAPH_CLEARED);
    eventBus.emit(EVENTS.SELECTION_CHANGED, { node: null, edge: null });
    this.triggerRealtimeAnalysis();
  }

  /**
   * Load a full graph snapshot (from template/scenario/localStorage)
   * @param {Object} graphData - { nodes: [], edges: [] }
   * @param {boolean} shouldAutoSave
   */
  loadGraph(graphData, shouldAutoSave = true) {
    this.clearGraph(false);

    if (Array.isArray(graphData.nodes)) {
      for (const node of graphData.nodes) {
        this.addNode(node);
      }
    }

    if (Array.isArray(graphData.edges)) {
      for (const edge of graphData.edges) {
        this.addEdge(edge);
      }
    }

    eventBus.emit(EVENTS.GRAPH_LOADED, { nodes: this.nodes, edges: this.edges });
    this.triggerRealtimeAnalysis();

    if (shouldAutoSave) {
      this.scheduleAutoSave();
    }
  }

  // ============================================================================
  // LOCALSTORAGE AUTOSAVE & RESTORATION
  // ============================================================================

  scheduleAutoSave() {
    clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => {
      this.saveToLocalStorage();
    }, 400);
  }

  saveToLocalStorage() {
    try {
      if (this.nodes.size === 0 && this.edges.size === 0) {
        localStorage.removeItem('sds_autosave_graph');
        return;
      }
      const data = {
        nodes: Array.from(this.nodes.values()),
        edges: Array.from(this.edges.values()),
        simConfig: {
          target_rps: this.simConfig.target_rps,
          profile: this.simConfig.profile,
          duration_seconds: this.simConfig.duration_seconds,
          read_write_ratio: this.simConfig.read_write_ratio
        },
        savedAt: Date.now()
      };
      localStorage.setItem('sds_autosave_graph', JSON.stringify(data));
    } catch (err) {
      console.warn('[StateManager] Failed to auto-save to localStorage:', err);
    }
  }

  restoreFromLocalStorage() {
    try {
      const raw = localStorage.getItem('sds_autosave_graph');
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (Array.isArray(data.nodes) && data.nodes.length > 0) {
        this.loadGraph(data, false);
        if (data.simConfig) {
          this.updateSimConfig(data.simConfig);
        }
        return true;
      }
    } catch (err) {
      console.warn('[StateManager] Failed to restore from localStorage:', err);
    }
    return false;
  }

  clearSavedGraph() {
    try {
      localStorage.removeItem('sds_autosave_graph');
    } catch (e) {
      // ignore
    }
  }

  // ============================================================================
  // SELECTION
  // ============================================================================

  selectNode(nodeId) {
    this.selectedNodeId = nodeId;
    this.selectedEdgeId = null;
    const node = nodeId ? this.nodes.get(nodeId) || null : null;
    eventBus.emit(EVENTS.SELECTION_CHANGED, { node, edge: null });
  }

  selectEdge(edgeId) {
    this.selectedEdgeId = edgeId;
    this.selectedNodeId = null;
    const edge = edgeId ? this.edges.get(edgeId) || null : null;
    eventBus.emit(EVENTS.SELECTION_CHANGED, { node: null, edge });
  }

  clearSelection() {
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    eventBus.emit(EVENTS.SELECTION_CHANGED, { node: null, edge: null });
  }

  // ============================================================================
  // SIMULATION & LOAD INJECTION
  // ============================================================================

  updateSimConfig(partialConfig) {
    this.simConfig = { ...this.simConfig, ...partialConfig };
    eventBus.emit(EVENTS.SIM_CONFIG_CHANGED, this.simConfig);

    // If simulation is active, re-run simulation tick
    if (this.simConfig.isRunning) {
      this.stepSimulation();
    }
  }

  startSimulation() {
    this.simConfig.isRunning = true;
    eventBus.emit(EVENTS.SIM_STARTED, this.simConfig);
    this.stepSimulation();
  }

  pauseSimulation() {
    this.simConfig.isRunning = false;
    eventBus.emit(EVENTS.SIM_PAUSED, this.simConfig);
  }

  stepSimulation() {
    const report = wasmBridge.runSimulation(this.simConfig);
    this.simReport = report;
    eventBus.emit(EVENTS.SIM_METRICS_UPDATED, report);
    return report;
  }

  // ============================================================================
  // ARCHITECTURAL ANALYSIS (SPOF & Anti-Pattern Check)
  // ============================================================================

  triggerRealtimeAnalysis() {
    clearTimeout(this._analysisDebounceTimer);
    this._analysisDebounceTimer = setTimeout(() => {
      // Run quick simulation first to populate metrics
      this.stepSimulation();
      const report = wasmBridge.analyzeGraph();
      this.analysisReport = report;
      eventBus.emit(EVENTS.ANALYSIS_UPDATED, report);
    }, 200);
  }

  // ============================================================================
  // THEME MANAGEMENT
  // ============================================================================

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem('sds_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    eventBus.emit(EVENTS.THEME_CHANGED, theme);
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }
}

// Global shared singleton instance
export const stateManager = new StateManager();
