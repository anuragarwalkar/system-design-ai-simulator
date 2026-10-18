/**
 * ==============================================================================
 * Component Palette & Scenarios Sidebar
 * ==============================================================================
 * Displays draggable infrastructure components with icon badges and metadata,
 * alongside sorted interview practice scenarios.
 */

import { COMPONENT_METADATA } from '../../core/constants.js';
import { SCENARIOS } from '../../ai/scenarios.js';
import { stateManager } from '../../core/state-manager.js';

export class ComponentPalette {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="palette-header">
        <h2 class="palette-title">Components</h2>
        <p class="palette-subtitle">Drag and drop to add to your system</p>
      </div>

      <div class="component-list" id="component-list">
        ${Object.entries(COMPONENT_METADATA).map(([type, meta]) => `
          <div class="component-card" draggable="true" data-type="${type}">
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
        <h3 class="section-title">Canvas Shortcuts</h3>
        <ul class="shortcut-list">
          <li><span>Drag wire</span> Connect ports</li>
          <li><span>Click edge</span> Select / Inspect</li>
          <li><span>Del / Backspace</span> Remove item</li>
          <li><span>Cmd / Ctrl + Z</span> Undo action</li>
          <li><span>Space + Drag</span> Pan canvas</li>
          <li><span>Wheel</span> Zoom in/out</li>
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

    this._bindDragEvents();
    this._bindScenarioEvents();
  }

  _bindDragEvents() {
    const cards = this.container.querySelectorAll('.component-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        const type = card.getAttribute('data-type');
        e.dataTransfer.setData('text/plain', type);
        e.dataTransfer.setData('application/x-component-type', type);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });
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
        }
      });
    });
  }
}
