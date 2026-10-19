/**
 * ==============================================================================
 * Sidebar Manager (Resize & Visibility Controller)
 * ==============================================================================
 * Controls:
 * - Fluid drag-resizing with mouse and touch (240px - 650px)
 * - Double-click to reset width to default 300px
 * - Hide & Show sidebar toggles (Toolbar button, sidebar header close, floating canvas tab)
 * - Global keyboard shortcuts: Cmd+[ / Ctrl+[ or Cmd+B / Ctrl+B
 * - LocalStorage persistence for user width and visibility preferences
 * - Automatic synchronization with 60FPS Canvas viewport
 */

import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';
import { showToast } from '../ui/dialog.js';

export class SidebarManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.sidebar = document.getElementById('app-sidebar');
    this.resizer = document.getElementById('sidebar-resizer');
    this.expandBtn = document.getElementById('btn-expand-sidebar');
    this.toolbarToggleBtn = document.getElementById('btn-toolbar-toggle-sidebar');

    this.isDragging = false;
    this.startX = 0;
    this.startWidth = 300;
    this.minWidth = 240;
    this.maxWidth = 650;
    this.defaultWidth = 300;

    this.init();
  }

  init() {
    this._restorePreferences();
    this._bindResizer();
    this._bindToggles();
    this._bindKeyboard();
  }

  _restorePreferences() {
    const savedWidth = localStorage.getItem('sysdesign_sidebar_width');
    if (savedWidth && this.sidebar) {
      const parsed = parseInt(savedWidth, 10);
      if (parsed >= this.minWidth && parsed <= this.maxWidth) {
        this.sidebar.style.width = `${parsed}px`;
        this.sidebar.style.minWidth = `${parsed}px`;
      }
    }

    const savedHidden = localStorage.getItem('sysdesign_sidebar_hidden');
    if (savedHidden === 'true' && window.innerWidth > 900) {
      this.hideSidebar(false);
    }
  }

  _bindResizer() {
    if (!this.resizer || !this.sidebar) return;

    const onPointerDown = (clientX) => {
      this.isDragging = true;
      this.startX = clientX;
      this.startWidth = this.sidebar.offsetWidth;

      this.sidebar.classList.add('sidebar-resizing');
      this.resizer.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    this.resizer.addEventListener('mousedown', (e) => {
      onPointerDown(e.clientX);
    });

    this.resizer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX);
      }
    }, { passive: true });

    const onPointerMove = (clientX) => {
      if (!this.isDragging) return;
      const delta = clientX - this.startX;
      const rawWidth = this.startWidth + delta;

      // Snap-to-hide preview if dragged very small
      if (rawWidth < 180) {
        this.sidebar.style.opacity = '0.5';
      } else {
        this.sidebar.style.opacity = '1';
        const maxLimit = Math.min(this.maxWidth, window.innerWidth * 0.55);
        const clampedWidth = Math.min(Math.max(rawWidth, this.minWidth), maxLimit);
        this.sidebar.style.width = `${clampedWidth}px`;
        this.sidebar.style.minWidth = `${clampedWidth}px`;
      }

      if (this.renderer) {
        this.renderer.resize();
      }
    };

    window.addEventListener('mousemove', (e) => {
      onPointerMove(e.clientX);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX);
      }
    }, { passive: true });

    const onPointerUp = (clientX) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.sidebar.style.opacity = '1';
      this.sidebar.classList.remove('sidebar-resizing');
      this.resizer.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const delta = clientX - this.startX;
      const rawWidth = this.startWidth + delta;

      // If dragged < 200px, collapse it
      if (rawWidth < 200) {
        this.hideSidebar();
      } else {
        const finalWidth = this.sidebar.offsetWidth;
        localStorage.setItem('sysdesign_sidebar_width', finalWidth.toString());
      }

      if (this.renderer) {
        this.renderer.resize();
      }
    };

    window.addEventListener('mouseup', (e) => {
      onPointerUp(e.clientX);
    });

    window.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      if (touch) onPointerUp(touch.clientX);
    });

    // Double-click to reset width
    this.resizer.addEventListener('dblclick', () => {
      this.sidebar.style.width = `${this.defaultWidth}px`;
      this.sidebar.style.minWidth = `${this.defaultWidth}px`;
      localStorage.setItem('sysdesign_sidebar_width', this.defaultWidth.toString());
      if (this.renderer) this.renderer.resize();
      showToast('Sidebar width reset to default (300px)', 'info', 2000);
    });
  }

  _bindToggles() {
    // Toolbar toggle button
    const toolbarBtn = document.getElementById('btn-toolbar-toggle-sidebar');
    if (toolbarBtn) {
      toolbarBtn.addEventListener('click', () => this.toggleSidebar());
    }

    // Floating expand button on canvas
    if (this.expandBtn) {
      this.expandBtn.addEventListener('click', () => this.showSidebar());
    }

    // Header close button inside sidebar
    const closeBtn = document.getElementById('btn-close-sidebar');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.innerWidth <= 900) {
          this.sidebar.classList.remove('mobile-open');
          const backdrop = document.getElementById('sidebar-backdrop');
          if (backdrop) backdrop.classList.remove('active');
        } else {
          this.hideSidebar();
        }
      });
    }
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      // Cmd+[ or Ctrl+[ or Cmd+B / Ctrl+B
      if ((e.metaKey || e.ctrlKey) && (e.key === '[' || e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
  }

  toggleSidebar() {
    if (!this.sidebar) return;
    const isHidden = this.sidebar.classList.contains('sidebar-hidden');
    if (isHidden) {
      this.showSidebar();
    } else {
      this.hideSidebar();
    }
  }

  hideSidebar(notify = true) {
    if (!this.sidebar) return;
    this.sidebar.classList.add('sidebar-hidden');
    localStorage.setItem('sysdesign_sidebar_hidden', 'true');

    const toolbarBtn = document.getElementById('btn-toolbar-toggle-sidebar');
    if (toolbarBtn) toolbarBtn.classList.remove('active');

    if (this.renderer) {
      this.renderer.resize();
      setTimeout(() => this.renderer.resize(), 50);
    }

    eventBus.emit(EVENTS.PANEL_TOGGLED, { panel: 'sidebar', isOpen: false });
    if (notify) {
      showToast('Sidebar hidden (Ctrl+[ to restore)', 'info', 2500);
    }
  }

  showSidebar() {
    if (!this.sidebar) return;
    this.sidebar.classList.remove('sidebar-hidden');
    localStorage.setItem('sysdesign_sidebar_hidden', 'false');

    const toolbarBtn = document.getElementById('btn-toolbar-toggle-sidebar');
    if (toolbarBtn) toolbarBtn.classList.add('active');

    if (this.renderer) {
      this.renderer.resize();
      setTimeout(() => this.renderer.resize(), 50);
    }

    eventBus.emit(EVENTS.PANEL_TOGGLED, { panel: 'sidebar', isOpen: true });
  }
}
