/**
 * ==============================================================================
 * Component Palette & Scenarios Sidebar
 * ==============================================================================
 * Displays draggable & tappable infrastructure components with icon badges,
 * alongside sorted interview practice scenarios. Fully optimized for touch & mobile.
 */

import { COMPONENT_METADATA } from '../../core/constants.js';
import { SCENARIOS } from '../../ai/scenarios.js';
import { stateManager } from '../../core/state-manager.js';
import { historyManager } from '../../core/history-manager.js';
import { showToast } from '../ui/dialog.js';

export class ComponentPalette {
  constructor(containerElement, canvasRenderer) {
    this.container = containerElement;
    this.renderer = canvasRenderer;
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

      <div class="component-list" id="component-list">
        ${Object.entries(COMPONENT_METADATA).map(([type, meta]) => `
          <div class="component-card" draggable="true" data-type="${type}" role="button" tabindex="0" title="Tap to add ${meta.name} to canvas">
            <div class="component-icon-badge" style="background: ${meta.accentBg}; color: ${meta.color};">
              <span class="component-dot" style="background: ${meta.color};"></span>
            </div>
            <div class="component-info">
              <div class="component-name">${meta.name}</div>
              <div class="component-desc">${meta.description}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="palette-section-divider"></div>

      <div class="palette-instructions">
        <h3 class="section-title">Canvas Gestures</h3>
        <ul class="shortcut-list">
          <li><span>Tap / Click</span> Select component</li>
          <li><span>Drag / Touch</span> Move node or pan</li>
          <li><span>Pinch / Wheel</span> Zoom in/out</li>
          <li><span>Port Touch</span> Wire connection</li>
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
            return `
              <div class="scenario-card" data-scenario-id="${s.id}">
                <div class="scenario-top">
                  <span class="scenario-title">${s.title}</span>
                  <span class="difficulty-badge ${diffClass}">${s.difficulty}</span>
                </div>
                <div class="scenario-tag">${s.tag}</div>
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
    const cards = this.container.querySelectorAll('.component-card');
    cards.forEach(card => {
      // HTML5 Drag for desktop
      card.addEventListener('dragstart', (e) => {
        const type = card.getAttribute('data-type');
        e.dataTransfer.setData('text/plain', type);
        e.dataTransfer.setData('application/x-component-type', type);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      // Tap-to-add for mobile & convenience on desktop
      card.addEventListener('click', () => {
        const type = card.getAttribute('data-type');
        this.addNodeToCanvas(type);
      });
    });
  }

  addNodeToCanvas(componentType) {
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

    showToast(`Added ${meta ? meta.name : componentType} to canvas`, 'success', 2000);

    // On mobile devices, dismiss sidebar after tapping so canvas is visible
    if (window.innerWidth <= 900) {
      this.closeMobileSidebar();
    }
  }

  _bindScenarioEvents() {
    const buttons = this.container.querySelectorAll('.btn-load-scenario');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const scenarioId = btn.getAttribute('data-scenario-id');
        const scenario = SCENARIOS.find(s => s.id === scenarioId);
        if (scenario) {
          stateManager.loadGraph(scenario.graph);
          stateManager.updateSimConfig({ target_rps: scenario.targetRps });

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

