/**
 * ==============================================================================
 * SystemFlow - Progressive Web App (PWA) Manager
 * ==============================================================================
 * Handles Service Worker lifecycle, offline readiness, update toasts,
 * and the browser install prompt banner/buttons.
 */

import { eventBus } from './event-bus.js';
import { showToast } from '../components/ui/dialog.js';

class PwaManager {
  constructor() {
    this.deferredPrompt = null;
    this.isStandalone = false;
    this._checkStandalone();
    this._initServiceWorker();
    this._bindInstallPrompt();
  }

  _checkStandalone() {
    this.isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
  }

  _initServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        // Register sw.js relative to base
        navigator.serviceWorker
          .register('./sw.js')
          .then((registration) => {
            console.log('[SystemFlow PWA] Service Worker registered. Scope:', registration.scope);

            // Listen for waiting updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (!installingWorker) return;

              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showToast('New version of SystemFlow available. Refresh to update!', 'info', 5000);
                }
              };
            };
          })
          .catch((err) => {
            console.warn('[SystemFlow PWA] Service Worker registration failed:', err);
          });
      });
    }
  }

  _bindInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent standard mini-infobar on mobile
      event.preventDefault();
      this.deferredPrompt = event;
      console.log('[SystemFlow PWA] App install prompt captured');
      this._updateInstallButtons(true);
      eventBus.emit('pwa:install-ready');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isStandalone = true;
      this._updateInstallButtons(false);
      console.log('[SystemFlow PWA] App installed successfully');
      showToast('SystemFlow installed to your device!', 'success');
      eventBus.emit('pwa:installed');
    });
  }

  _updateInstallButtons(visible) {
    const desktopBtn = document.getElementById('btn-pwa-install');
    const mobileBtn = document.getElementById('menu-opt-pwa-install');

    if (desktopBtn) {
      desktopBtn.style.display = visible && !this.isStandalone ? 'inline-flex' : 'none';
    }
    if (mobileBtn) {
      mobileBtn.style.display = visible && !this.isStandalone ? 'flex' : 'none';
    }
  }

  get canInstall() {
    return !!this.deferredPrompt && !this.isStandalone;
  }

  async promptInstall() {
    if (!this.deferredPrompt) {
      showToast('SystemFlow is already installed or your browser does not support installation prompts directly.', 'info');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      console.log('[SystemFlow PWA] User install choice:', choiceResult.outcome);

      if (choiceResult.outcome === 'accepted') {
        showToast('Installing SystemFlow...', 'info');
      }

      this.deferredPrompt = null;
      this._updateInstallButtons(false);
      return choiceResult.outcome === 'accepted';
    } catch (err) {
      console.error('[SystemFlow PWA] Error displaying install prompt:', err);
      return false;
    }
  }
}

export const pwaManager = new PwaManager();
