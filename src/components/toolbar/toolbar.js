/**
 * ==============================================================================
 * Top Navigation Toolbar
 * ==============================================================================
 * Provides primary actions: Reset, Undo/Redo, Zoom to Fit, JSON Import/Export,
 * Light/Dark Theme toggle, and AI Assistant toggles.
 */

import { stateManager } from '../../core/state-manager.js';
import { historyManager } from '../../core/history-manager.js';
import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';
import { showConfirmModal, showToast } from '../ui/dialog.js';

export class Toolbar {
  constructor(containerElement, canvasRenderer) {
    this.container = containerElement;
    this.renderer = canvasRenderer;
    this.render();
    this._bindEvents();
  }

  render() {
    const isDark = stateManager.theme === 'dark';

    this.container.innerHTML = `
      <div class="toolbar-left">
        <div class="brand">
          <div class="brand-logo">⚡</div>
          <div class="brand-text">
            <span class="brand-title">SysDesign</span>
            <span class="brand-badge">WASM 60FPS</span>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <div class="btn-group">
          <button id="btn-undo" class="toolbar-btn" title="Undo (Cmd+Z)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            <span>Undo</span>
          </button>
          <button id="btn-redo" class="toolbar-btn" title="Redo (Cmd+Y)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            <span>Redo</span>
          </button>
        </div>

        <div class="btn-group">
          <button id="btn-fit" class="toolbar-btn" title="Fit Content to View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <span>Fit View</span>
          </button>
          <button id="btn-reset" class="toolbar-btn text-danger" title="Clear Canvas">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- Live Resilience Score Pill -->
        <button id="btn-toggle-eval" class="eval-score-pill" title="View Real-Time SPOF & Architecture Analysis">
          <span class="score-indicator-dot" id="score-dot"></span>
          <span>Health Score:</span>
          <strong id="toolbar-score-val">100%</strong>
        </button>

        <div class="btn-group">
          <button id="btn-export-json" class="toolbar-btn" title="Export Architecture JSON">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Save</span>
          </button>
          <label class="toolbar-btn" title="Import Architecture JSON">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Load</span>
            <input type="file" id="input-import-json" accept=".json" style="display: none;">
          </label>
        </div>

        <!-- Theme Toggle Switch -->
        <button id="btn-theme" class="theme-toggle-btn" title="Toggle Light / Dark Mode">
          ${isDark
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`}
        </button>

        <!-- AI Assistant Toggle Button -->
        <button id="btn-toggle-ai" class="btn-ai-sparkle" title="Toggle AI Architect (LangChain)">
          <span class="ai-sparkle-icon">✨</span>
          <span>AI Architect</span>
        </button>
      </div>
    `;
  }

  _bindEvents() {
    // Reset Canvas
    this.container.querySelector('#btn-reset').addEventListener('click', async () => {
      const confirmed = await showConfirmModal({
        title: 'Reset Architecture?',
        message: 'This will clear all components, connection wires, and live traffic from the canvas. You can undo this action with Cmd+Z.',
        confirmText: 'Reset Canvas',
        cancelText: 'Cancel',
        isDanger: true
      });

      if (confirmed) {
        stateManager.clearGraph();
        showToast('Canvas reset successfully', 'info');
      }
    });

    // Undo / Redo
    this.container.querySelector('#btn-undo').addEventListener('click', () => historyManager.undo());
    this.container.querySelector('#btn-redo').addEventListener('click', () => historyManager.redo());

    // Fit View
    this.container.querySelector('#btn-fit').addEventListener('click', () => {
      this.renderer.camera.fitToContent(stateManager.nodes);
    });

    // Theme Toggle
    this.container.querySelector('#btn-theme').addEventListener('click', () => {
      stateManager.toggleTheme();
      this.render();
      this._bindEvents();
    });

    // AI Drawer Toggle
    this.container.querySelector('#btn-toggle-ai').addEventListener('click', () => {
      eventBus.emit(EVENTS.PANEL_TOGGLED, { panel: 'ai' });
    });

    // Evaluation Drawer Toggle
    this.container.querySelector('#btn-toggle-eval').addEventListener('click', () => {
      eventBus.emit(EVENTS.PANEL_TOGGLED, { panel: 'evaluation' });
    });

    // Export JSON
    this.container.querySelector('#btn-export-json').addEventListener('click', () => {
      const data = {
        nodes: Array.from(stateManager.nodes.values()),
        edges: Array.from(stateManager.edges.values()),
        targetRps: stateManager.simConfig.target_rps
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-design-architecture-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Architecture exported to JSON', 'success');
    });

    // Import JSON
    this.container.querySelector('#input-import-json').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          stateManager.loadGraph(parsed);
          if (parsed.targetRps) {
            stateManager.updateSimConfig({ target_rps: parsed.targetRps });
          }
          showToast('Architecture loaded successfully', 'success');
        } catch (err) {
          showToast('Failed to parse architecture JSON: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    });

    // Listen to analysis updates to update Health Score pill
    eventBus.on(EVENTS.ANALYSIS_UPDATED, (report) => {
      const scoreVal = this.container.querySelector('#toolbar-score-val');
      const scoreDot = this.container.querySelector('#score-dot');
      if (scoreVal && scoreDot) {
        scoreVal.textContent = `${report.architecture_score}%`;
        scoreDot.style.background =
          report.architecture_score >= 80 ? '#10B981' : (report.architecture_score >= 60 ? '#F59E0B' : '#EF4444');
      }
    });
  }
}
