/**
 * ==============================================================================
 * Master Canvas Renderer (60FPS requestAnimationFrame Loop)
 * ==============================================================================
 * Coordinates viewport scaling, DPR resolution compensation, scene graph
 * traversal, particle physics step, and high-frequency UI overlays.
 */

import { Camera } from './camera.js';
import { GridRenderer } from './grid-renderer.js';
import { NodeRenderer } from './node-renderer.js';
import { EdgeRenderer } from './edge-renderer.js';
import { ParticlePool } from './particle-system.js';
import { stateManager } from '../core/state-manager.js';
import { EVENTS } from '../core/constants.js';
import { eventBus } from '../core/event-bus.js';

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { alpha: false });

    this.camera = new Camera(this.canvas);
    this.gridRenderer = new GridRenderer();
    this.nodeRenderer = new NodeRenderer();
    this.edgeRenderer = new EdgeRenderer();
    this.particlePool = new ParticlePool(600);

    // Frame tracking for 60FPS validation
    this.lastFrameTime = performance.now();
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = performance.now();

    // Interaction states
    this.hoveredPort = null;
    this.connectingWire = null; // { startX, startY, currentX, currentY, sourceNodeId, sourceSide }

    this.isRunning = false;
    this._rafId = null;

    this._setupResizeListener();
    this._setupSimulationListener();
  }

  init() {
    this.resize();
    this.isRunning = true;
    this._renderLoop();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // Scale context to DPR
    this.ctx.scale(dpr, dpr);
  }

  _setupResizeListener() {
    window.addEventListener('resize', () => this.resize());
  }

  _setupSimulationListener() {
    // When simulation metrics update, spawn animated particles along active edges
    eventBus.on(EVENTS.SIM_METRICS_UPDATED, (report) => {
      if (!stateManager.simConfig.isRunning) return;

      for (const edge of stateManager.edges.values()) {
        const fromNode = stateManager.nodes.get(edge.from);
        const toNode = stateManager.nodes.get(edge.to);
        if (!fromNode || !toNode) continue;

        const points = this.edgeRenderer.calculateOptimalBezier(fromNode, toNode);
        const fromMetrics = report.node_metrics[fromNode.id];
        const isError = fromMetrics && fromMetrics.cpu_utilization > 1.0;

        // Spawn multiple packets proportional to traffic
        const count = Math.min(4, Math.max(1, Math.floor((stateManager.simConfig.target_rps || 10000) / 40000)));
        for (let i = 0; i < count; i++) {
          this.particlePool.spawn({
            edgeId: edge.id,
            startX: points.startX,
            startY: points.startY,
            endX: points.endX,
            endY: points.endY,
            cp1X: points.cp1X,
            cp1Y: points.cp1Y,
            cp2X: points.cp2X,
            cp2Y: points.cp2Y,
            isError: isError && Math.random() < 0.35,
            speed: 0.012 + Math.random() * 0.008
          });
        }
      }
    });
  }

  _renderLoop() {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaMs = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate FPS
    this.frameCount++;
    if (now - this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = now;
    }

    // Update particles
    this.particlePool.update(deltaMs);

    // Continuous simulation step during active run
    if (stateManager.simConfig.isRunning && Math.random() < 0.15) {
      stateManager.stepSimulation();
    }

    // Render frame
    this.draw();

    this._rafId = requestAnimationFrame(() => this._renderLoop());
  }

  draw() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const theme = stateManager.theme;
    const isDark = theme === 'dark';

    // 1. Clear background
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    ctx.save();
    ctx.fillStyle = isDark ? '#13151F' : '#F8FAFC';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // 2. Render dot grid
    this.gridRenderer.render(ctx, this.camera, theme);

    // 3. Apply Camera transform to world space
    ctx.save();
    this.camera.applyTransform(ctx);

    // 4. Render Edges
    const edges = Array.from(stateManager.edges.values());
    for (const edge of edges) {
      const fromNode = stateManager.nodes.get(edge.from);
      const toNode = stateManager.nodes.get(edge.to);
      const isSelected = stateManager.selectedEdgeId === edge.id;

      this.edgeRenderer.renderEdge(ctx, edge, fromNode, toNode, {
        isSelected,
        theme
      });
    }

    // 5. Render active connection wire if dragging
    if (this.connectingWire) {
      this.edgeRenderer.renderDragPreview(
        ctx,
        this.connectingWire.startX,
        this.connectingWire.startY,
        this.connectingWire.currentX,
        this.connectingWire.currentY
      );
    }

    // 6. Render Traffic Particles (Flowing along Bezier curves)
    this.particlePool.render(ctx);

    // 7. Render Nodes
    const nodes = Array.from(stateManager.nodes.values());
    const simReport = stateManager.simReport;
    const analysis = stateManager.analysisReport;

    const spofSet = new Set(
      analysis && Array.isArray(analysis.spofs)
        ? analysis.spofs.map(s => s.node_id)
        : []
    );

    for (const node of nodes) {
      const isSelected = stateManager.selectedNodeId === node.id;
      const metrics = simReport && simReport.node_metrics ? simReport.node_metrics[node.id] : null;
      const isSpof = spofSet.has(node.id);

      this.nodeRenderer.renderNode(ctx, node, {
        isSelected,
        metrics,
        isSpof,
        theme,
        hoveredPort: this.hoveredPort
      });
    }

    ctx.restore(); // Restore world camera transform

    // 8. Render HUD: FPS and status badge in corner
    this._renderHud(ctx, cssWidth, cssHeight, isDark);

    ctx.restore();
  }

  _renderHud(ctx, width, height, isDark) {
    ctx.save();
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = isDark ? '#64748B' : '#94A3B8';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.fps} FPS · WebAssembly Core`, width - 16, height - 16);
    ctx.restore();
  }

  destroy() {
    this.isRunning = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }
}
