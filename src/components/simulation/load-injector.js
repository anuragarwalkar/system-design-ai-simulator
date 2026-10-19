/**
 * ==============================================================================
 * Traffic Generator & Synthetic Load Injector (Educational HUD)
 * ==============================================================================
 * Interactive controller and educational system design lab:
 * - Real-world scenario presets (15k SaaS, 80k Viral, 500k Flash Spike, 1.2M Super Bowl)
 * - Dynamic real-world scale analogies (translating abstract RPS into industry tiers)
 * - Dual-bound slider and numeric field (1k to 2,500,000 req/s)
 * - Traffic profiles with visual waveform sparklines (Constant, Spike, Wave)
 * - Educational concept guide modal explaining Synthetic Load & Autoscaler Lag
 */

import { stateManager } from '../../core/state-manager.js';
import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';
import { showToast } from '../ui/dialog.js';

export const SCENARIO_PRESETS = [
  {
    id: 'saas',
    icon: '☕',
    title: '15k SaaS',
    subtitle: 'Normal Day',
    rps: 15000,
    profile: 'Constant',
    tip: 'Typical steady business traffic. Easily handled by 1-2 web app instances.'
  },
  {
    id: 'viral',
    icon: '📈',
    title: '80k Wave',
    subtitle: 'Viral Surge',
    rps: 80000,
    profile: 'Sinusoidal',
    tip: 'Trending social media post. Traffic ebbs and flows with daily peak hours.'
  },
  {
    id: 'flash500k',
    icon: '⚡',
    title: '500k Spike',
    subtitle: 'Flash Drop',
    rps: 500000,
    profile: 'Spike',
    tip: 'Ticketmaster/Prime Day burst! Tests autoscaler lag and database connection limits.'
  },
  {
    id: 'superbowl',
    icon: '🏆',
    title: '1M Peak',
    subtitle: 'Super Bowl',
    rps: 1200000,
    profile: 'Spike',
    tip: '100M TV viewers scan a QR code simultaneously. Extreme stress test on edge caches!'
  }
];

export function getLoadAnalogy(rps) {
  if (rps < 25000) {
    return {
      level: 'level-low',
      badge: '🟢 Startup / SaaS Tier',
      tag: `${rps >= 1000 ? (rps / 1000).toFixed(0) + 'k' : rps} req/s`,
      desc: 'Light steady traffic. Handled easily by 1–2 web application instances.'
    };
  } else if (rps < 100000) {
    return {
      level: 'level-mid',
      badge: '🟡 E-Commerce Day Traffic',
      tag: `${(rps / 1000).toFixed(0)}k req/s`,
      desc: 'Active shopping traffic. Requires a Load Balancer & DB connection pool.'
    };
  } else if (rps < 400000) {
    return {
      level: 'level-high',
      badge: '🟠 Viral / Streaming Tier',
      tag: `${(rps / 1000).toFixed(0)}k req/s`,
      desc: 'High scale! Needs Redis caching (80%+ hit rate) & database read replicas.'
    };
  } else if (rps < 800000) {
    return {
      level: 'level-spike',
      badge: '🔴 Flash Sale (500k RPS)',
      tag: `${(rps / 1000).toFixed(0)}k req/s`,
      desc: '⚡ Mega-Event scale! Instant burst causes autoscaler lag; buffer with Queues or CDNs.'
    };
  } else {
    return {
      level: 'level-extreme',
      badge: '🟣 Super Bowl / Global Scale',
      tag: `${(rps / 1000000).toFixed(1)}M req/s`,
      desc: '🔥 Extreme scale! Requires aggressive CDN edge caching & Token Bucket rate limiting.'
    };
  }
}

export class LoadInjector {
  constructor(containerElement) {
    this.container = containerElement;
    this.isCollapsed = false;
    this.activePresetId = null;
    this.waveTimer = null;
    this.wavePhase = 0;
    this.baseRps = stateManager.simConfig.target_rps || 50000;

    this.render();
    this._bindEvents();
    this._initModal();
  }

  render() {
    if (!this.container) return;
    const isRunning = stateManager.simConfig.isRunning;
    const rps = stateManager.simConfig.target_rps;
    const currentProfile = stateManager.simConfig.profile || 'Constant';
    const analogy = getLoadAnalogy(rps);

    const formattedRps = rps >= 1000000
      ? `${(rps / 1000000).toFixed(1)}M`
      : (rps >= 1000 ? `${(rps / 1000).toFixed(0)}k` : `${rps}`);

    this.container.innerHTML = `
      <div class="load-card ${this.isCollapsed ? 'collapsed' : ''}" id="load-card-inner">
        <!-- Header -->
        <div class="load-card-header">
          <button id="btn-toggle-sim" class="btn-sim-play ${isRunning ? 'active' : ''}" title="${isRunning ? 'Pause Simulation' : 'Start Simulation'}">
            ${isRunning
              ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
              : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`}
          </button>
          <div class="load-title-wrap">
            <span class="load-title">Traffic Generator</span>
            <span class="load-badge-sub">Synthetic Load</span>
          </div>

          <span class="load-card-min-stats" id="load-min-rps">${formattedRps} rps</span>

          <div class="load-header-actions">
            <button id="btn-load-edu" class="btn-load-edu" title="Learn Traffic Concepts & Scale">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Guide</span>
            </button>
            <button id="btn-collapse-load" class="btn-load-toggle-collapse" title="${this.isCollapsed ? 'Expand Controls' : 'Collapse Controls'}">
              ${this.isCollapsed ? '▲' : '▼'}
            </button>
          </div>
        </div>

        <!-- Real-World Scenarios Presets -->
        <div class="load-scenarios-section">
          <div class="load-section-label">Real-World Presets</div>
          <div class="load-scenarios-grid">
            ${SCENARIO_PRESETS.map(preset => `
              <button class="scenario-preset-btn ${this.activePresetId === preset.id ? 'active' : ''}" data-preset-id="${preset.id}" title="${preset.tip}">
                <span class="preset-icon">${preset.icon}</span>
                <div class="preset-text">
                  <span class="preset-title">${preset.title}</span>
                  <span class="preset-sub">${preset.subtitle}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Volume Slider & Exact Input -->
        <div class="load-slider-section">
          <div class="load-slider-header">
            <span class="load-section-label">Load Volume (RPS)</span>
            <div class="load-input-wrap">
              <input type="number" id="load-number-input" class="load-num-field" min="1000" max="2500000" step="5000" value="${rps}" />
              <span class="load-unit">req/s</span>
            </div>
          </div>
          <div class="load-controls-row">
            <input type="range" id="load-slider" class="load-slider" min="1000" max="1500000" step="5000" value="${rps}" />
          </div>
        </div>

        <!-- Real-World Mental Analogy Box -->
        <div class="load-analogy-box ${analogy.level}" id="load-analogy-box">
          <div class="analogy-top">
            <span class="analogy-badge" id="analogy-badge">${analogy.badge}</span>
            <span class="analogy-tag" id="analogy-tag">${analogy.tag}</span>
          </div>
          <p class="analogy-desc" id="analogy-desc">${analogy.desc}</p>
        </div>

        <!-- Traffic Profiles with Waveform Sparklines -->
        <div class="load-profiles-section">
          <div class="load-section-label">Traffic Pattern Profile</div>
          <div class="load-profiles-row">
            <button class="profile-chip ${currentProfile === 'Constant' ? 'active' : ''}" data-profile="Constant" title="Predictable flat traffic. Cloud autoscalers stay stable.">
              <svg class="profile-sparkline" width="16" height="10" viewBox="0 0 24 10" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="2" y1="5" x2="22" y2="5"/></svg>
              <span>Constant</span>
            </button>
            <button class="profile-chip ${currentProfile === 'Spike' ? 'active' : ''}" data-profile="Spike" title="Instantaneous surge. Tests queue depth & autoscaler lag!">
              <svg class="profile-sparkline" width="16" height="10" viewBox="0 0 24 10" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="2,8 9,8 12,2 15,8 22,8"/></svg>
              <span>⚡ Spike</span>
            </button>
            <button class="profile-chip ${currentProfile === 'Sinusoidal' ? 'active' : ''}" data-profile="Sinusoidal" title="Natural diurnal wave. Traffic ebbs and flows gradually.">
              <svg class="profile-sparkline" width="16" height="10" viewBox="0 0 24 10" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M2,5 C6,0 8,10 12,5 C16,0 18,10 22,5"/></svg>
              <span>🌊 Wave</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const card = this.container.querySelector('#load-card-inner');
    const playBtn = this.container.querySelector('#btn-toggle-sim');
    const slider = this.container.querySelector('#load-slider');
    const numInput = this.container.querySelector('#load-number-input');
    const chips = this.container.querySelectorAll('.profile-chip');
    const presetBtns = this.container.querySelectorAll('.scenario-preset-btn');
    const collapseBtn = this.container.querySelector('#btn-collapse-load');
    const eduBtn = this.container.querySelector('#btn-load-edu');

    // Collapse toggle
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.isCollapsed = !this.isCollapsed;
        this.render();
        this._bindEvents();
      });
    }

    // Concept Education Modal Button
    if (eduBtn) {
      eduBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEducationModal();
      });
    }

    // Play / Pause Toggle
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (stateManager.simConfig.isRunning) {
          stateManager.pauseSimulation();
          this._stopWaveAnimation();
        } else {
          stateManager.startSimulation();
          if (stateManager.simConfig.profile === 'Sinusoidal') {
            this._startWaveAnimation();
          }
        }
        this.render();
        this._bindEvents();
      });
    }

    // Slider Drag
    if (slider) {
      slider.addEventListener('input', () => {
        const val = Number(slider.value);
        if (numInput) numInput.value = val;
        this.baseRps = val;
        this.activePresetId = null;
        this._updateAnalogy(val);
        stateManager.updateSimConfig({ target_rps: val });
        this._updateMinStats(val);
      });
    }

    // Numeric input
    if (numInput) {
      numInput.addEventListener('change', () => {
        let val = Math.max(100, Number(numInput.value) || 1000);
        if (slider) slider.value = val;
        this.baseRps = val;
        this.activePresetId = null;
        this._updateAnalogy(val);
        stateManager.updateSimConfig({ target_rps: val });
        this._updateMinStats(val);
      });
    }

    // Scenario Presets Click
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const presetId = btn.getAttribute('data-preset-id');
        const preset = SCENARIO_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        this.activePresetId = preset.id;
        this.baseRps = preset.rps;

        // Apply config
        stateManager.updateSimConfig({
          target_rps: preset.rps,
          profile: preset.profile
        });

        // Ensure simulation is running so user sees the effect immediately
        if (!stateManager.simConfig.isRunning) {
          stateManager.startSimulation();
        }

        if (preset.profile === 'Sinusoidal') {
          this._startWaveAnimation();
        } else {
          this._stopWaveAnimation();
        }

        if (preset.profile === 'Spike') {
          this._triggerSpikeFlash();
        }

        showToast(`${preset.icon} Activated ${preset.title}: ${preset.subtitle}!`, 'info', 3000);
        this.render();
        this._bindEvents();
      });
    });

    // Profile Chips Click
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const profile = chip.getAttribute('data-profile');

        if (profile === 'Spike') {
          // Surge traffic to 500k RPS spike
          const spikeRps = Math.max(500000, this.baseRps * 3);
          this.baseRps = spikeRps;
          stateManager.updateSimConfig({ target_rps: spikeRps, profile: 'Spike' });
          if (!stateManager.simConfig.isRunning) stateManager.startSimulation();
          this._stopWaveAnimation();
          this._triggerSpikeFlash();
          showToast('⚡ 500k RPS Spike Injected! Observe autoscaler lag and queue bottlenecks.', 'warning', 4500);
        } else if (profile === 'Sinusoidal') {
          stateManager.updateSimConfig({ profile: 'Sinusoidal' });
          if (stateManager.simConfig.isRunning) this._startWaveAnimation();
          showToast('🌊 Wave profile active: Traffic ebbs & flows smoothly.', 'info', 2500);
        } else {
          this._stopWaveAnimation();
          stateManager.updateSimConfig({ profile: 'Constant', target_rps: this.baseRps });
        }

        if (slider) slider.value = stateManager.simConfig.target_rps;
        if (numInput) numInput.value = stateManager.simConfig.target_rps;
        this._updateAnalogy(stateManager.simConfig.target_rps);
        this._updateMinStats(stateManager.simConfig.target_rps);
      });
    });

    // Listen to external sim config changes (e.g. scenario load)
    eventBus.on(EVENTS.SIM_CONFIG_CHANGED, (config) => {
      if (slider) slider.value = config.target_rps;
      if (numInput) numInput.value = config.target_rps;
      this.baseRps = config.target_rps;
      this._updateAnalogy(config.target_rps);
      this._updateMinStats(config.target_rps);
    });
  }

  _updateAnalogy(rps) {
    const box = this.container.querySelector('#load-analogy-box');
    const badge = this.container.querySelector('#analogy-badge');
    const tag = this.container.querySelector('#analogy-tag');
    const desc = this.container.querySelector('#analogy-desc');
    if (!box || !badge || !desc) return;

    const analogy = getLoadAnalogy(rps);
    box.className = `load-analogy-box ${analogy.level}`;
    badge.textContent = analogy.badge;
    if (tag) tag.textContent = analogy.tag;
    desc.textContent = analogy.desc;
  }

  _updateMinStats(rps) {
    const minStat = this.container.querySelector('#load-min-rps');
    if (minStat) {
      const formatted = rps >= 1000000
        ? `${(rps / 1000000).toFixed(1)}M`
        : (rps >= 1000 ? `${(rps / 1000).toFixed(0)}k` : `${rps}`);
      minStat.textContent = `${formatted} rps`;
    }
  }

  _triggerSpikeFlash() {
    const card = this.container.querySelector('#load-card-inner');
    if (!card) return;
    card.classList.remove('spike-flash');
    void card.offsetWidth; // Force reflow
    card.classList.add('spike-flash');
  }

  _startWaveAnimation() {
    this._stopWaveAnimation();
    this.wavePhase = 0;
    this.waveTimer = setInterval(() => {
      if (!stateManager.simConfig.isRunning || stateManager.simConfig.profile !== 'Sinusoidal') {
        this._stopWaveAnimation();
        return;
      }
      this.wavePhase += 0.25;
      // Modulate traffic +/- 18% in smooth sine wave
      const waveFactor = 1 + 0.18 * Math.sin(this.wavePhase);
      const currentRps = Math.round(this.baseRps * waveFactor);
      stateManager.updateSimConfig({ target_rps: currentRps });
    }, 1000);
  }

  _stopWaveAnimation() {
    if (this.waveTimer) {
      clearInterval(this.waveTimer);
      this.waveTimer = null;
    }
  }

  _initModal() {
    // Check if modal already exists in DOM
    if (document.getElementById('traffic-edu-modal')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'traffic-edu-modal';
    modalOverlay.className = 'traffic-edu-overlay';
    modalOverlay.innerHTML = `
      <div class="traffic-edu-modal">
        <div class="traffic-edu-header">
          <div class="traffic-edu-header-left">
            <span class="traffic-edu-badge">SYSTEM DESIGN CONCEPT GUIDE</span>
            <h2 class="traffic-edu-title">Traffic Scale, Spikes & Synthetic Load</h2>
          </div>
          <button class="traffic-edu-close" id="btn-close-traffic-edu" title="Close Guide">✕</button>
        </div>

        <div class="traffic-edu-body">
          <!-- Card 1: What is Synthetic Load? -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon robot">🤖</div>
              <div>
                <h3 class="edu-card-title">What is "Synthetic Load"?</h3>
                <span class="edu-card-subtitle">Robot-generated traffic vs. organic human users</span>
              </div>
            </div>
            <p class="edu-card-text">
              <strong>Organic traffic</strong> is human behavior—people tapping, scrolling, and buying at irregular intervals. You cannot ask 500,000 real people to hit "Buy Now" at the exact same second just to test if your servers crash.
            </p>
            <p class="edu-card-text">
              <strong>Synthetic load</strong> is programmatic, simulated traffic injected by test harnesses (or this simulator). It stresses your architecture under predictable loads to detect memory leaks, race conditions, connection pool exhaustion, and CPU saturation <em>before</em> real users arrive.
            </p>
          </div>

          <!-- Card 2: What is 500k RPS? -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon meter">📊</div>
              <div>
                <h3 class="edu-card-title">Demystifying "500k RPS" (Scale Anchors)</h3>
                <span class="edu-card-subtitle">500,000 requests every second = 30 million/minute</span>
              </div>
            </div>
            <p class="edu-card-text">
              Numbers like "50,000" or "500,000" sound abstract. Here is how they correspond to real industry tiers:
            </p>
            <div class="edu-scale-table">
              <div class="scale-row">
                <span class="scale-tier">1k RPS</span>
                <span class="scale-name">Typical SaaS / Startup</span>
                <span class="scale-detail">Single server + database handles this comfortably.</span>
              </div>
              <div class="scale-row">
                <span class="scale-tier">50k RPS</span>
                <span class="scale-name">E-Commerce Daytime</span>
                <span class="scale-detail">Requires load balancers, 15+ API pods, and DB read replicas.</span>
              </div>
              <div class="scale-row">
                <span class="scale-tier">200k RPS</span>
                <span class="scale-name">Global Streaming Tier</span>
                <span class="scale-detail">Must have Redis caching (85%+ hit rate) to protect database.</span>
              </div>
              <div class="scale-row highlight">
                <span class="scale-tier">500k+ RPS</span>
                <span class="scale-name">⚡ Flash Sale / Ticket Drop</span>
                <span class="scale-detail">Taylor Swift / Prime Day. Unbuffered requests will cause instant outages.</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Why Spikes Break Systems -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon warning">⚡</div>
              <div>
                <h3 class="edu-card-title">Why do "Spike Loads" Crash Systems?</h3>
                <span class="edu-card-subtitle">The Autoscaler Lag Problem</span>
              </div>
            </div>
            <p class="edu-card-text">
              Cloud autoscalers (Kubernetes HPA, AWS Auto Scaling) easily handle <strong>Wave (sinusoidal)</strong> traffic because daily traffic rises over 30–60 minutes.
            </p>
            <div class="edu-lag-diagram">
              <div class="lag-step">
                <span class="lag-num">1</span>
                <div><strong>0–10s: Traffic Jumps 10x Instantly</strong><br>500k RPS slams into your 4 unscaled backend pods.</div>
              </div>
              <div class="lag-step">
                <span class="lag-num">2</span>
                <div><strong>10s–3 min: The Autoscaler Lag Window</strong><br>Metrics poll → CPU triggers alert → Cloud launches VMs/Docker → JVM/Node boots up.</div>
              </div>
              <div class="lag-step danger">
                <span class="lag-num">💥</span>
                <div><strong>The Crash: 90,000,000 Unbuffered Requests</strong><br>During that 3-minute lag, connection pools exhaust, RAM runs out, and pods crash in a cascading failure.</div>
              </div>
            </div>
          </div>

          <!-- Card 4: Architectural Remedies -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon shield">🛡️</div>
              <div>
                <h3 class="edu-card-title">How to Architect for 500k RPS Spikes</h3>
                <span class="edu-card-subtitle">Essential components in this simulator</span>
              </div>
            </div>
            <div class="edu-remedies-grid">
              <div class="remedy-item">
                <span class="remedy-icon">🌐</span>
                <div>
                  <strong>CDN / Edge Cache</strong>
                  <p>Absorbs 85–95% of static and read requests before they reach your origin network.</p>
                </div>
              </div>
              <div class="remedy-item">
                <span class="remedy-icon">⚡</span>
                <div>
                  <strong>In-Memory Cache (Redis)</strong>
                  <p>Sub-millisecond latency. Serves frequent reads so your relational DB doesn't hit 100% CPU.</p>
                </div>
              </div>
              <div class="remedy-item">
                <span class="remedy-icon">📬</span>
                <div>
                  <strong>Message Queue (Kafka / SQS)</strong>
                  <p>The ultimate spike shock absorber. Ingests 500k writes instantly into a queue, letting backend workers drain them safely.</p>
                </div>
              </div>
              <div class="remedy-item">
                <span class="remedy-icon">🚦</span>
                <div>
                  <strong>Rate Limiting (Token Bucket)</strong>
                  <p>Protects your servers by shedding load (HTTP 429) rather than suffering a full cluster blackout.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="traffic-edu-footer">
          <button class="traffic-edu-action-btn" id="btn-edu-launch-spike">
            <span>⚡ Try 500k Flash Spike in Simulator</span>
          </button>
          <button class="traffic-edu-close-btn" id="btn-edu-dismiss">Got it</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => {
      modalOverlay.classList.remove('open');
    };

    modalOverlay.querySelector('#btn-close-traffic-edu').addEventListener('click', closeModal);
    modalOverlay.querySelector('#btn-edu-dismiss').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    const launchSpikeBtn = modalOverlay.querySelector('#btn-edu-launch-spike');
    if (launchSpikeBtn) {
      launchSpikeBtn.addEventListener('click', () => {
        closeModal();
        this.baseRps = 500000;
        this.activePresetId = 'flash500k';
        stateManager.updateSimConfig({ target_rps: 500000, profile: 'Spike' });
        if (!stateManager.simConfig.isRunning) stateManager.startSimulation();
        this._triggerSpikeFlash();
        showToast('⚡ 500k Flash Spike Activated! Watch how your components react.', 'warning', 4000);
        this.render();
        this._bindEvents();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeModal();
      }
    });
  }

  openEducationModal() {
    const modal = document.getElementById('traffic-edu-modal');
    if (modal) {
      modal.classList.add('open');
    }
  }
}
