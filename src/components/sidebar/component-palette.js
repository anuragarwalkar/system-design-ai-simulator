/**
 * ==============================================================================
 * Component Palette & Scenarios Sidebar
 * ==============================================================================
 * Displays draggable & tappable infrastructure components with icon badges,
 * alongside sorted interview practice scenarios. Fully optimized for touch & mobile.
 */

import { COMPONENT_METADATA, EVENTS, COMPONENT_MODELS, BRAND_PROVIDERS } from '../../core/constants.js';
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
    this.selectedBrandFilter = 'ALL';
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

      <!-- Traffic Simulation Section (Moved from canvas to left panel) -->
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

      <!-- Cloud Brand Filter Pills -->
      <div class="brand-filter-bar">
        <button class="brand-filter-pill ${this.selectedBrandFilter === 'ALL' ? 'active' : ''}" data-brand="ALL">All Models</button>
        <button class="brand-filter-pill ${this.selectedBrandFilter === 'AWS' ? 'active' : ''}" data-brand="AWS" style="--brand-accent: #FF9900;">AWS</button>
        <button class="brand-filter-pill ${this.selectedBrandFilter === 'Cloudflare' ? 'active' : ''}" data-brand="Cloudflare" style="--brand-accent: #F38020;">Cloudflare</button>
        <button class="brand-filter-pill ${this.selectedBrandFilter === 'OSS' ? 'active' : ''}" data-brand="OSS" style="--brand-accent: #10B981;">Open Source</button>
        <button class="brand-filter-pill ${this.selectedBrandFilter === 'GCP' ? 'active' : ''}" data-brand="GCP" style="--brand-accent: #4285F4;">GCP</button>
      </div>

      <div class="component-list" id="component-list">
        ${Object.entries(COMPONENT_METADATA).map(([type, meta]) => {
          const models = COMPONENT_MODELS[type] || [];
          const activeModel = (this.selectedBrandFilter !== 'ALL'
            ? models.find(m => m.brand === this.selectedBrandFilter)
            : null) || models[0] || null;

          const displayName = activeModel ? activeModel.name : meta.name;
          const displayDesc = activeModel ? activeModel.description : meta.description;
          const brandShort = activeModel ? activeModel.brandInfo.shortName : '';
          const brandColor = activeModel ? activeModel.brandInfo.color : '#64748B';
          const brandBg = activeModel ? activeModel.brandInfo.bg : 'rgba(100, 116, 139, 0.15)';
          const modelId = activeModel ? activeModel.id : '';

          return `
            <div class="component-card" draggable="true" data-type="${type}" data-model-id="${modelId}" role="button" tabindex="0" title="Tap to add ${displayName} to canvas">
              <div class="component-icon-badge" style="background: ${meta.accentBg}; color: ${meta.color};">
                <span class="component-dot" style="background: ${meta.color};"></span>
              </div>
              <div class="component-info">
                <div class="component-name-row">
                  <span class="component-name">${displayName}</span>
                  <div class="component-card-badges">
                    ${brandShort && brandShort !== 'Standard' ? `
                      <span class="brand-badge-pill" style="color: ${brandColor}; background: ${brandBg}; border-color: ${brandColor};">
                        ${brandShort}
                      </span>
                    ` : ''}
                    <button class="btn-component-learn" data-type="${type}" title="Learn about ${displayName}">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <span>Learn</span>
                    </button>
                  </div>
                </div>
                <div class="component-desc">${displayDesc}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

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
    this._bindDragAndClickEvents();
    this._bindScenarioEvents();
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

  _bindDragAndClickEvents() {
    // Brand filter pill tabs
    const brandPills = this.container.querySelectorAll('.brand-filter-pill');
    brandPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const brand = pill.getAttribute('data-brand');
        if (this.selectedBrandFilter !== brand) {
          this.selectedBrandFilter = brand;
          this.render();
        }
      });
    });

    const cards = this.container.querySelectorAll('.component-card');
    cards.forEach(card => {
      // HTML5 Drag for desktop
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

      // Tap-to-add for mobile & convenience on desktop
      card.addEventListener('click', (e) => {
        // Ignore if clicking the Learn button
        if (e.target.closest('.btn-component-learn')) return;
        const type = card.getAttribute('data-type');
        const modelId = card.getAttribute('data-model-id') || '';
        this.addNodeToCanvas(type, modelId);
      });
    });

    // Learn info buttons on component cards
    const learnButtons = this.container.querySelectorAll('.btn-component-learn');
    learnButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-type');
        showConceptModal(type, (t) => this.addNodeToCanvas(t));
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

