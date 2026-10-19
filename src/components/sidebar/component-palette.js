/**
 * ==============================================================================
 * Component Palette & Scenarios Sidebar
 * ==============================================================================
 * Displays draggable & tappable infrastructure components with a clean,
 * simple, uncluttered UX. Each component displays its role and an inline
 * brand-grouped model selector (AWS, Cloudflare, OSS, GCP, etc.).
 * Fully optimized for touch & mobile.
 */

import { COMPONENT_METADATA, EVENTS, COMPONENT_MODELS, BRAND_PROVIDERS, COMPONENT_ICONS_SVG } from '../../core/constants.js';
import { SCENARIOS } from '../../ai/scenarios.js';
import { stateManager } from '../../core/state-manager.js';
import { historyManager } from '../../core/history-manager.js';
import { showToast } from '../ui/dialog.js';
import { showConceptModal } from '../ui/concept-modal.js';
import { eventBus } from '../../core/event-bus.js';

export class ComponentPalette {
  constructor(containerElement, canvasRenderer) {
    this.container = containerElement;
    this.renderer = canvasRenderer;

    // Per-component selected model tracking (defaults to first model)
    this.selectedModels = {};
    for (const type of Object.keys(COMPONENT_METADATA)) {
      const models = COMPONENT_MODELS[type] || [];
      this.selectedModels[type] = {
        modelId: models[0]?.id || null
      };
    }

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="palette-header">
        <div class="palette-header-row">
          <div>
            <h2 class="palette-title">Components</h2>
            <p class="palette-subtitle">Tap or drag to add to system</p>
          </div>
          <button id="btn-close-sidebar" class="btn-close-sidebar" title="Close Components">✕</button>
        </div>
      </div>

      <!-- Traffic Simulation Section -->
      <div class="sidebar-load-section">
        <div class="sidebar-section-header">
          <h3 class="section-title">Traffic Simulation</h3>
        </div>
        <div class="sidebar-load-hud" id="load-hud"></div>
      </div>

      <div class="palette-section-divider"></div>

      <div class="sidebar-section-header">
        <h3 class="section-title">Infrastructure Components</h3>
      </div>

      <div class="component-list" id="component-list"></div>

      <div class="palette-section-divider"></div>

      <div class="palette-instructions">
        <h3 class="section-title">Canvas Gestures</h3>
        <ul class="shortcut-list">
          <li><span>Tap / Click</span> Select component or wire</li>
          <li><span>Drag / Touch</span> Move node or pan canvas</li>
          <li><span>Pinch / Wheel</span> Zoom in/out</li>
          <li><span>Port Touch</span> Wire connection between nodes</li>
          <li><span>Cmd / Ctrl + Z</span> Undo action</li>
        </ul>
      </div>

      <div class="palette-section-divider"></div>

      <div class="scenarios-section">
        <div class="scenarios-header">
          <h3 class="section-title">Interview Scenarios</h3>
          <span class="badge-count">${SCENARIOS.length}</span>
        </div>
        <p class="scenarios-subtitle">Practice common system design questions sorted by difficulty:</p>

        <div class="scenarios-list" id="scenarios-list">
          ${SCENARIOS.map(s => {
            const diffClass = s.difficulty.toLowerCase();
            const objCount = (s.learningObjectives || []).length;
            return `
              <div class="scenario-card" data-scenario-id="${s.id}">
                <div class="scenario-top">
                  <span class="scenario-title">${s.title}</span>
                  <span class="difficulty-badge ${diffClass}">${s.difficulty}</span>
                </div>
                <div class="scenario-tag">${s.tag}</div>
                ${s.description ? `<p class="scenario-desc-snippet">${s.description}</p>` : ''}

                <!-- Learning Objectives Collapsible Accordion -->
                <button class="btn-toggle-objectives" data-scenario-id="${s.id}">
                  <span class="obj-btn-text">📘 Learning Objectives (${objCount})</span>
                  <span class="chevron-icon">▾</span>
                </button>

                <div class="scenario-objectives-drawer" id="objectives-${s.id}" style="display: none;">
                  <ul class="scenario-objectives-list">
                    ${(s.learningObjectives || []).map(obj => `
                      <li><span class="obj-check">✓</span> <span>${obj}</span></li>
                    `).join('')}
                  </ul>
                  <div class="scenario-meta-details">
                    <span>Target: <strong>${(s.targetRps / 1000).toFixed(0)}k RPS</strong></span>
                    <span>Ratio: <strong>${((s.readWriteRatio || 0.8) * 100).toFixed(0)}% reads</strong></span>
                  </div>
                </div>

                <div class="scenario-actions">
                  <span class="scenario-load-target">${(s.targetRps / 1000).toFixed(0)}k rps</span>
                  <button class="btn-load-scenario" data-scenario-id="${s.id}">Load Architecture</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this._bindCloseButton();
    this.renderComponentList();
    this._bindScenarioEvents();
  }

  renderComponentList() {
    const listContainer = this.container.querySelector('#component-list');
    if (!listContainer) return;

    listContainer.innerHTML = Object.entries(COMPONENT_METADATA).map(([type, meta]) => {
      const models = COMPONENT_MODELS[type] || [];
      const selState = this.selectedModels[type] || { modelId: models[0]?.id || null };
      const activeModelId = selState.modelId || models[0]?.id || '';

      // Group models by brand for clean, readable optgroups
      const brandGroups = {};
      for (const m of models) {
        const brandName = m.brandInfo?.name || m.brand || 'Standard';
        if (!brandGroups[brandName]) {
          brandGroups[brandName] = [];
        }
        brandGroups[brandName].push(m);
      }

      return `
        <div class="component-clean-card" draggable="true" data-type="${type}" data-model-id="${activeModelId}" role="button" tabindex="0" title="Tap or drag to add ${meta.name} to canvas">
          <div class="component-icon-badge" style="background: ${meta.accentBg}; color: ${meta.color};">
            ${COMPONENT_ICONS_SVG[type] || `<span class="component-dot" style="background: ${meta.color};"></span>`}
          </div>
          <div class="component-info">
            <div class="component-name-row">
              <span class="component-name">${meta.name}</span>
              <button class="btn-component-learn" data-type="${type}" title="Learn about ${meta.name}" aria-label="Learn about ${meta.name}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </button>
            </div>
            ${models.length > 0 ? `
              <select class="component-model-select-compact" data-type="${type}" title="Choose engine model">
                ${Object.entries(brandGroups).map(([brandName, brandModels]) => `
                  <optgroup label="${brandName}">
                    ${brandModels.map(m => `
                      <option value="${m.id}" ${m.id === activeModelId ? 'selected' : ''}>
                        ${m.name}
                      </option>
                    `).join('')}
                  </optgroup>
                `).join('')}
              </select>
            ` : `
              <div class="component-desc">${meta.description}</div>
            `}
          </div>
        </div>
      `;
    }).join('');

    this._bindComponentListEvents();
  }

  _bindCloseButton() {
    const closeBtn = this.container.querySelector('#btn-close-sidebar');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeMobileSidebar());
    }
  }

  closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  _bindComponentListEvents() {
    // 1. Model select dropdown change
    const modelSelects = this.container.querySelectorAll('.component-model-select-compact');
    modelSelects.forEach(select => {
      // Prevent clicking the dropdown from triggering card click (which adds node)
      select.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      select.addEventListener('change', (e) => {
        e.stopPropagation();
        const type = select.getAttribute('data-type');
        const modelId = select.value;
        if (!type) return;

        this.selectedModels[type] = this.selectedModels[type] || {};
        this.selectedModels[type].modelId = modelId;

        // Update card data-model-id
        const card = select.closest('.component-clean-card');
        if (card) {
          card.setAttribute('data-model-id', modelId);
        }
      });
    });

    // 2. Drag & Drop on component cards
    const cards = this.container.querySelectorAll('.component-clean-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        const type = card.getAttribute('data-type');
        const modelId = card.getAttribute('data-model-id') || '';
        e.dataTransfer.setData('text/plain', type);
        e.dataTransfer.setData('application/x-component-type', type);
        if (modelId) {
          e.dataTransfer.setData('application/x-model-id', modelId);
        }
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      // Tap or Click card to add to canvas
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-component-learn') || e.target.closest('.component-model-select-compact')) return;
        const type = card.getAttribute('data-type');
        const modelId = card.getAttribute('data-model-id') || '';
        this.addNodeToCanvas(type, modelId);
      });
    });

    // 3. Learn info modal button
    const learnButtons = this.container.querySelectorAll('.btn-component-learn');
    learnButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-type');
        const selModelId = this.selectedModels[type]?.modelId || null;
        showConceptModal(type, (t) => this.addNodeToCanvas(t, selModelId));
      });
    });
  }

  addNodeToCanvas(componentType, modelId = null) {
    const meta = COMPONENT_METADATA[componentType];
    const snap = 40;

    // Place near current camera viewport center with gentle randomized offset
    let targetX = 0;
    let targetY = 0;

    if (this.renderer && this.renderer.camera) {
      const jitterX = (Math.random() - 0.5) * 80;
      const jitterY = (Math.random() - 0.5) * 80;
      targetX = Math.round((this.renderer.camera.x - 70 + jitterX) / snap) * snap;
      targetY = Math.round((this.renderer.camera.y - 45 + jitterY) / snap) * snap;
    }

    // Avoid stacking directly on top of an existing node
    const existingNodes = stateManager.nodes || [];
    let attempts = 0;
    while (attempts < 10 && existingNodes.some(n => Math.abs(n.x - targetX) < 160 && Math.abs(n.y - targetY) < 80)) {
      targetY += 80;
      targetX += 40;
      attempts++;
    }

    const nodeSpec = {
      component_type: componentType,
      x: targetX,
      y: targetY
    };
    if (modelId) {
      nodeSpec.model_id = modelId;
    }

    let createdNodeId = null;
    historyManager.execute({
      description: `Add ${meta ? meta.name : componentType}`,
      execute: () => {
        const n = stateManager.addNode(nodeSpec);
        createdNodeId = n.id;
        stateManager.selectNode(n.id);
      },
      undo: () => {
        if (createdNodeId) stateManager.removeNode(createdNodeId);
      }
    });

    const displayTitle = nodeSpec.model_id
      ? (COMPONENT_MODELS[componentType]?.find(m => m.id === modelId)?.name || meta?.name || componentType)
      : (meta ? meta.name : componentType);
    showToast(`Added ${displayTitle} to canvas`, 'success', 2000);

    // On mobile devices, dismiss sidebar after tapping so canvas is visible
    if (window.innerWidth <= 900) {
      this.closeMobileSidebar();
    }
  }

  _bindScenarioEvents() {
    // Objectives toggle accordions
    const toggleBtns = this.container.querySelectorAll('.btn-toggle-objectives');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const scenarioId = btn.getAttribute('data-scenario-id');
        const drawer = this.container.querySelector(`#objectives-${scenarioId}`);
        if (drawer) {
          const isOpen = drawer.style.display !== 'none';
          drawer.style.display = isOpen ? 'none' : 'block';
          btn.classList.toggle('expanded', !isOpen);
        }
      });
    });

    const buttons = this.container.querySelectorAll('.btn-load-scenario');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const scenarioId = btn.getAttribute('data-scenario-id');
        const scenario = SCENARIOS.find(s => s.id === scenarioId);
        if (scenario) {
          stateManager.activeScenario = scenario;
          stateManager.loadGraph(scenario.graph);
          stateManager.updateSimConfig({ target_rps: scenario.targetRps });

          eventBus.emit(EVENTS.SCENARIO_SELECTED, scenario);

          if (this.renderer && this.renderer.camera) {
            setTimeout(() => {
              this.renderer.camera.fitToContent(stateManager.nodes);
            }, 100);
          }

          showToast(`Loaded scenario: ${scenario.title}`, 'info');

          // Close sidebar on mobile
          if (window.innerWidth <= 900) {
            this.closeMobileSidebar();
          }
        }
      });
    });
  }
}
