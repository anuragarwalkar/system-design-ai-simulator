/**
 * ==============================================================================
 * Guided Onboarding & System Design Tutorial System
 * ==============================================================================
 * Interactive step-by-step walkthrough for beginners learning system design.
 * Explains infrastructure primitives, wiring protocols, traffic load simulation,
 * and interview scenarios.
 */

import { stateManager } from '../../core/state-manager.js';
import { SCENARIOS } from '../../ai/scenarios.js';
import { showToast } from './dialog.js';

const ONBOARDING_STEPS = [
  {
    step: 1,
    badge: 'Welcome to SystemFlow',
    title: 'Master Distributed Architecture from Scratch',
    subtitle: 'Learn how modern tech giants (like Netflix, Uber, and Twitter) handle millions of requests without crashing.',
    icon: '<img src="./icons/icon-192.png" width="40" height="40" alt="SystemFlow" style="border-radius:50%; display:block; filter: drop-shadow(0 2px 8px rgba(6,182,212,0.5));" />',
    illustration: `
      <div class="onboarding-flow-preview">
        <div class="flow-node blue">Client</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node green">Load Balancer</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node purple">API Gateway</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node amber">Servers</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node red">Cache / DB</div>
      </div>
    `,
    body: `
      <p>System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements.</p>
      <div class="onboarding-tip-banner">
        <span>💡</span> <strong>Rule #1:</strong> Every architectural choice is a trade-off between <em>Latency, Throughput, Consistency, and Cost</em>.
      </div>
    `
  },
  {
    step: 2,
    badge: 'Step 1: The Core Primitives',
    title: '8 Essential Building Blocks of System Design',
    subtitle: 'Every distributed system in the world is composed of these fundamental primitives:',
    icon: '🧱',
    illustration: `
      <div class="onboarding-blocks-grid">
        <div class="block-mini-pill" style="border-color: #3B82F6;"><span style="color:#3B82F6;">●</span> <strong>Client:</strong> Users & Apps</div>
        <div class="block-mini-pill" style="border-color: #10B981;"><span style="color:#10B981;">●</span> <strong>Load Balancer:</strong> Traffic Routing</div>
        <div class="block-mini-pill" style="border-color: #8B5CF6;"><span style="color:#8B5CF6;">●</span> <strong>API Gateway:</strong> Auth & Rate Limits</div>
        <div class="block-mini-pill" style="border-color: #F59E0B;"><span style="color:#F59E0B;">●</span> <strong>Microservices:</strong> Business Logic</div>
        <div class="block-mini-pill" style="border-color: #EF4444;"><span style="color:#EF4444;">●</span> <strong>Cache:</strong> Fast In-Memory RAM</div>
        <div class="block-mini-pill" style="border-color: #EC4899;"><span style="color:#EC4899;">●</span> <strong>Database:</strong> Persistent Storage</div>
        <div class="block-mini-pill" style="border-color: #F97316;"><span style="color:#F97316;">●</span> <strong>Message Queue:</strong> Async Decoupling</div>
        <div class="block-mini-pill" style="border-color: #06B6D4;"><span style="color:#06B6D4;">●</span> <strong>CDN:</strong> Global Edge Caching</div>
      </div>
    `,
    body: `
      <p>In the left sidebar, tap or drag any component onto the canvas. Tap the <strong>"Learn"</strong> button on any card to view real-world analogies, bottlenecks, and interview tips.</p>
    `
  },
  {
    step: 3,
    badge: 'Step 2: Wiring & Protocols',
    title: 'Connect Components with Real Network Protocols',
    subtitle: 'Components communicate across the network using distinct transport layers.',
    icon: '🔌',
    illustration: `
      <div class="onboarding-protocols-banner">
        <div class="proto-tag blue">HTTP/REST: Web Ingress</div>
        <div class="proto-tag purple">gRPC: Low-Latency RPC</div>
        <div class="proto-tag red">Redis TCP: Sub-1ms RAM</div>
        <div class="proto-tag orange">Kafka: Event Streaming</div>
      </div>
    `,
    body: `
      <p><strong>How to Wire:</strong> Click and drag from any component port (the connection dots on node borders) to another component to draw a connection wire.</p>
      <p>Tap on any connection wire to open the <strong>Edge Inspector</strong>: switch between protocols (like gRPC vs REST) and compare latency overheads.</p>
    `
  },
  {
    step: 4,
    badge: 'Step 3: Traffic Simulation',
    title: 'Simulate Load & Catch Single Points of Failure',
    subtitle: 'Stress-test your architecture at 60 FPS WebAssembly speed.',
    icon: '📈',
    illustration: `
      <div class="onboarding-sim-preview">
        <div class="sim-metric-badge">⚡ 60 FPS WASM Coprocessor</div>
        <div class="sim-metric-badge">🟢 Real-Time Health & SPOF Scan</div>
        <div class="sim-metric-badge">🌊 Up to 1,000,000 RPS</div>
      </div>
    `,
    body: `
      <p>Press the green <strong>Play</strong> button in the left panel to inject traffic. Watch animated request packets flow along wires.</p>
      <p>Look at the top <strong>Health Score</strong>: if a node is a Single Point of Failure (SPOF) or experiences high CPU load, it turns amber or red with suggestions on how to add replicas.</p>
    `
  },
  {
    step: 5,
    badge: 'Step 4: Practice Interview Scenarios',
    title: 'Battle-Tested Production Architectures',
    subtitle: 'Learn by exploring canonical system design questions sorted from Easy to Expert.',
    icon: '🎓',
    illustration: `
      <div class="onboarding-scenarios-preview">
        <div class="scenario-mini-item">📘 URL Shortener (Bitly) — Read-heavy caching</div>
        <div class="scenario-mini-item">📘 Pastebin — Object storage & text hashes</div>
        <div class="scenario-mini-item">📘 Real-Time Chat (WhatsApp) — WebSockets & Queues</div>
      </div>
    `,
    body: `
      <p>Every scenario includes interactive <strong>Learning Objectives</strong> so you know exactly what concepts to master (Hashing, Sharding, Replication, Caching, Event-driven architecture).</p>
      <p>Ask the <strong>AI Architect</strong> at any time for feedback or design reviews!</p>
    `
  }
];

export class OnboardingTutorial {
  constructor(canvasRenderer) {
    this.renderer = canvasRenderer;
    this.currentStep = 0;
  }

  show(force = false) {
    const isDone = localStorage.getItem('sds_onboarding_done');
    if (isDone === 'true' && !force) {
      return;
    }

    this.currentStep = 0;
    this._renderModal();
  }

  _renderModal() {
    const existing = document.getElementById('onboarding-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'onboarding-modal-overlay';
    overlay.className = 'custom-modal-overlay onboarding-overlay';

    document.body.appendChild(overlay);
    this._updateStepContent(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
  }

  _updateStepContent(overlay) {
    const stepData = ONBOARDING_STEPS[this.currentStep];
    const totalSteps = ONBOARDING_STEPS.length;
    const isFirst = this.currentStep === 0;
    const isLast = this.currentStep === totalSteps - 1;

    overlay.innerHTML = `
      <div class="custom-modal-card onboarding-card">
        <div class="onboarding-top-bar">
          <div class="onboarding-step-indicator">
            <span class="step-badge">${stepData.badge}</span>
            <span class="step-counter">Step ${stepData.step} of ${totalSteps}</span>
          </div>
          <button id="btn-onboarding-skip" class="btn-icon-close" title="Exit Tutorial">✕</button>
        </div>

        <div class="onboarding-content">
          <div class="onboarding-header-row">
            <div class="onboarding-icon">${stepData.icon}</div>
            <div>
              <h2 class="onboarding-title">${stepData.title}</h2>
              <p class="onboarding-subtitle">${stepData.subtitle}</p>
            </div>
          </div>

          <div class="onboarding-illustration-wrap">
            ${stepData.illustration}
          </div>

          <div class="onboarding-body-text">
            ${stepData.body}
          </div>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-dots">
            ${ONBOARDING_STEPS.map((_, idx) => `
              <span class="onboarding-dot ${idx === this.currentStep ? 'active' : ''}"></span>
            `).join('')}
          </div>

          <div class="onboarding-actions">
            ${!isFirst ? `<button id="btn-onboarding-prev" class="modal-btn secondary">Back</button>` : ''}
            ${!isLast ? `
              <button id="btn-onboarding-next" class="modal-btn primary">Next Step ➔</button>
            ` : `
              <button id="btn-load-first-blueprint" class="modal-btn secondary">Load URL Shortener (Beginner)</button>
              <button id="btn-onboarding-finish" class="modal-btn primary">Explore Canvas 🚀</button>
            `}
          </div>
        </div>
      </div>
    `;

    this._bindStepEvents(overlay);
  }

  _bindStepEvents(overlay) {
    const cleanup = () => {
      localStorage.setItem('sds_onboarding_done', 'true');
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
    };

    const skipBtn = overlay.querySelector('#btn-onboarding-skip');
    if (skipBtn) skipBtn.addEventListener('click', cleanup);

    const prevBtn = overlay.querySelector('#btn-onboarding-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentStep > 0) {
          this.currentStep--;
          this._updateStepContent(overlay);
        }
      });
    }

    const nextBtn = overlay.querySelector('#btn-onboarding-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep < ONBOARDING_STEPS.length - 1) {
          this.currentStep++;
          this._updateStepContent(overlay);
        }
      });
    }

    const finishBtn = overlay.querySelector('#btn-onboarding-finish');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        cleanup();
        showToast('Welcome aboard! Drag components from the sidebar to begin.', 'success', 3500);
      });
    }

    const loadBlueprintBtn = overlay.querySelector('#btn-load-first-blueprint');
    if (loadBlueprintBtn) {
      loadBlueprintBtn.addEventListener('click', () => {
        cleanup();
        const urlScenario = SCENARIOS.find(s => s.id === 'url-shortener');
        if (urlScenario) {
          stateManager.activeScenario = urlScenario;
          stateManager.loadGraph(urlScenario.graph);
          stateManager.updateSimConfig({ target_rps: urlScenario.targetRps });
          if (this.renderer && this.renderer.camera) {
            setTimeout(() => {
              this.renderer.camera.fitToContent(stateManager.nodes);
            }, 100);
          }
          showToast('Loaded URL Shortener blueprint! Press Play to simulate traffic.', 'success', 4000);
        }
      });
    }
  }
}
