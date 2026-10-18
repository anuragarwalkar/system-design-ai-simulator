/**
 * ==============================================================================
 * Mobile Bottom Navigation Controller
 * ==============================================================================
 * Provides native app-like bottom tab navigation for mobile and tablet screens:
 * - Components Palette toggle
 * - Synthetic Load Injector HUD toggle
 * - Real-time Telemetry Metrics HUD toggle
 * - Node Inspector toggle (with active selection badge indicator)
 * - AI Architect Chat drawer toggle
 * - Backdrop overlay management
 */

import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';
import { stateManager } from '../../core/state-manager.js';

export class MobileNav {
  constructor(containerElement) {
    this.container = containerElement;
    this.sidebar = document.getElementById('app-sidebar');
    this.inspector = document.getElementById('app-inspector');
    this.sidebarBackdrop = document.getElementById('sidebar-backdrop');
    this.inspectorBackdrop = document.getElementById('inspector-backdrop');
    this.loadHud = document.getElementById('load-hud');
    this.metricsHud = document.getElementById('metrics-hud');

    this.render();
    this._bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <button id="mobile-nav-components" class="mobile-nav-btn" title="Open Components Palette">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </span>
        <span class="mobile-nav-label">Components</span>
      </button>

      <button id="mobile-nav-load" class="mobile-nav-btn" title="Toggle Synthetic Load">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </span>
        <span class="mobile-nav-label">Traffic Load</span>
      </button>

      <button id="mobile-nav-metrics" class="mobile-nav-btn" title="Toggle Metrics Telemetry">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </span>
        <span class="mobile-nav-label">Metrics</span>
      </button>

      <button id="mobile-nav-inspect" class="mobile-nav-btn" title="Configure Selected Node">
        <span class="mobile-nav-badge" id="mobile-inspect-badge"></span>
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </span>
        <span class="mobile-nav-label">Inspect</span>
      </button>

      <button id="mobile-nav-ai" class="mobile-nav-btn" title="Open AI Architect">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
          </svg>
        </span>
        <span class="mobile-nav-label">AI Chat</span>
      </button>
    `;
  }

  _bindEvents() {
    const btnComponents = this.container.querySelector('#mobile-nav-components');
    const btnLoad = this.container.querySelector('#mobile-nav-load');
    const btnMetrics = this.container.querySelector('#mobile-nav-metrics');
    const btnInspect = this.container.querySelector('#mobile-nav-inspect');
    const btnAi = this.container.querySelector('#mobile-nav-ai');
    const inspectBadge = this.container.querySelector('#mobile-inspect-badge');

    // 1. Components Tab
    btnComponents.addEventListener('click', () => {
      this.closeInspector();
      this.toggleSidebar();
    });

    // 2. Load Injector Tab
    btnLoad.addEventListener('click', () => {
      this.closeInspector();
      this.openSidebar();
      const loadSection = document.getElementById('load-hud');
      if (loadSection) {
        loadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Expand if collapsed
        const inner = loadSection.querySelector('.load-card');
        if (inner && inner.classList.contains('collapsed')) {
          const collapseBtn = loadSection.querySelector('#btn-collapse-load');
          if (collapseBtn) collapseBtn.click();
        }
      }
    });

    // 3. Metrics Tab
    btnMetrics.addEventListener('click', () => {
      if (!this.metricsHud) return;
      const isHidden = this.metricsHud.classList.toggle('mobile-hidden');
      btnMetrics.classList.toggle('active', !isHidden);
    });

    // 4. Inspect Tab
    btnInspect.addEventListener('click', () => {
      this.closeSidebar();
      this.toggleInspector();
    });

    // 5. AI Assistant Tab
    btnAi.addEventListener('click', () => {
      this.closeSidebar();
      this.closeInspector();
      eventBus.emit(EVENTS.PANEL_TOGGLED, { panel: 'ai' });
    });

    // Backdrop clicks to close drawers
    if (this.sidebarBackdrop) {
      this.sidebarBackdrop.addEventListener('click', () => this.closeSidebar());
    }
    if (this.inspectorBackdrop) {
      this.inspectorBackdrop.addEventListener('click', () => {
        stateManager.clearSelection();
        this.closeInspector();
      });
    }

    // Update Inspect Badge when node is selected
    eventBus.on(EVENTS.SELECTION_CHANGED, ({ node }) => {
      if (inspectBadge) {
        inspectBadge.classList.toggle('active', !!node);
      }
    });
  }

  toggleSidebar() {
    if (!this.sidebar) return;
    const isOpen = this.sidebar.classList.toggle('mobile-open');
    if (this.sidebarBackdrop) {
      this.sidebarBackdrop.classList.toggle('active', isOpen);
    }
  }

  openSidebar() {
    if (!this.sidebar) return;
    this.sidebar.classList.add('mobile-open');
    if (this.sidebarBackdrop) {
      this.sidebarBackdrop.classList.add('active');
    }
  }

  closeSidebar() {
    if (this.sidebar) this.sidebar.classList.remove('mobile-open');
    if (this.sidebarBackdrop) this.sidebarBackdrop.classList.remove('active');
  }

  toggleInspector() {
    if (!this.inspector) return;
    const isOpen = this.inspector.classList.toggle('mobile-open');
    if (this.inspectorBackdrop) {
      this.inspectorBackdrop.classList.toggle('active', isOpen);
    }
  }

  closeInspector() {
    if (this.inspector) this.inspector.classList.remove('mobile-open');
    if (this.inspectorBackdrop) this.inspectorBackdrop.classList.remove('active');
  }
}
