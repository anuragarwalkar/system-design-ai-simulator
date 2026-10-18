/**
 * ==============================================================================
 * Synthetic Load Injector Widget (Floating Canvas HUD)
 * ==============================================================================
 * Floating interactive controller matching the reference design:
 * - Play / Pause toggle
 * - Dual-bound slider and numeric input for exact RPS control (100 - 1,000,000+)
 * - Traffic injection profiles: Constant, Spike / Flash Sale, Sinusoidal wave
 */

import { stateManager } from '../../core/state-manager.js';
import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';

export class LoadInjector {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    this._bindEvents();
  }

  render() {
    const isRunning = stateManager.simConfig.isRunning;
    const rps = stateManager.simConfig.target_rps;

    this.container.innerHTML = `
      <div class="load-card">
        <div class="load-card-header">
          <button id="btn-toggle-sim" class="btn-sim-play ${isRunning ? 'active' : ''}" title="${isRunning ? 'Pause Simulation' : 'Start Simulation'}">
            ${isRunning
              ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
              : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`}
          </button>
          <div class="load-title-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="load-title">Synthetic User Load</span>
          </div>
        </div>

        <div class="load-controls-row">
          <input type="range" id="load-slider" class="load-slider" min="1000" max="1000000" step="5000" value="${rps}" />
          <div class="load-input-wrap">
            <input type="number" id="load-number-input" class="load-num-field" min="100" max="5000000" step="1000" value="${rps}" />
            <span class="load-unit">req/s</span>
          </div>
        </div>

        <div class="load-profiles-row">
          <button class="profile-chip active" data-profile="Constant">Constant</button>
          <button class="profile-chip" data-profile="Spike">⚡ Flash Spike</button>
          <button class="profile-chip" data-profile="Sinusoidal">🌊 Diurnal Wave</button>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const playBtn = this.container.querySelector('#btn-toggle-sim');
    const slider = this.container.querySelector('#load-slider');
    const numInput = this.container.querySelector('#load-number-input');
    const chips = this.container.querySelectorAll('.profile-chip');

    // Play / Pause Toggle
    playBtn.addEventListener('click', () => {
      if (stateManager.simConfig.isRunning) {
        stateManager.pauseSimulation();
      } else {
        stateManager.startSimulation();
      }
      this.render();
      this._bindEvents();
    });

    // Slider Drag
    slider.addEventListener('input', () => {
      const val = Number(slider.value);
      numInput.value = val;
      stateManager.updateSimConfig({ target_rps: val });
    });

    // Numeric input
    numInput.addEventListener('change', () => {
      let val = Math.max(100, Number(numInput.value) || 1000);
      slider.value = val;
      stateManager.updateSimConfig({ target_rps: val });
    });

    // Profile Chips
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const profile = chip.getAttribute('data-profile');

        if (profile === 'Spike') {
          // Temporarily surge traffic 5x
          const base = stateManager.simConfig.target_rps;
          stateManager.updateSimConfig({ target_rps: Math.min(2000000, base * 4), profile: 'Spike' });
          slider.value = stateManager.simConfig.target_rps;
          numInput.value = stateManager.simConfig.target_rps;
        } else {
          stateManager.updateSimConfig({ profile });
        }
      });
    });

    // Listen to external sim config changes (e.g. loading a scenario)
    eventBus.on(EVENTS.SIM_CONFIG_CHANGED, (config) => {
      slider.value = config.target_rps;
      numInput.value = config.target_rps;
    });
  }
}
