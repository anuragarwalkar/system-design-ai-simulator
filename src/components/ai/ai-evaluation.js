/**
 * ==============================================================================
 * Real-Time Architecture Evaluation & SPOF Drawer
 * ==============================================================================
 * Visualizes the agentic workflow report:
 * - Real-time Resilience Score (0 - 100)
 * - Single Points of Failure (SPOFs) flagged by Tarjan's Articulation Algorithm
 * - 1-Click "Auto-Fix" button to provision replicas or load balancers
 * - Missing load balancers and anti-pattern alerts
 */

import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';
import { TOOLS } from '../../ai/tools.js';

export class ArchitectureEvaluationPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.isOpen = false;
    this.lastReport = null;
    this.render();
    this._bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="eval-drawer-overlay ${this.isOpen ? 'open' : ''}" id="eval-overlay"></div>
      <div class="eval-drawer ${this.isOpen ? 'open' : ''}" id="eval-drawer">
        <div class="eval-header">
          <div class="eval-header-left">
            <span class="eval-header-icon">🛡️</span>
            <div>
              <h3 class="eval-title">System Resilience & SPOF Audit</h3>
              <p class="eval-subtitle">Automated Real-Time WebAssembly Evaluation</p>
            </div>
          </div>
          <button id="btn-close-eval" class="btn-icon-subtle" title="Close">✕</button>
        </div>

        <div class="eval-score-card">
          <div class="score-circle-wrap">
            <div class="score-number" id="eval-score-num">100</div>
            <div class="score-caption">Resilience Score</div>
          </div>
          <div class="score-meta">
            <p id="eval-score-summary">Evaluating system topology...</p>
            <div class="eval-counts-row">
              <span class="count-pill danger" id="cnt-spof">0 SPOFs</span>
              <span class="count-pill warning" id="cnt-bottleneck">0 Bottlenecks</span>
            </div>
          </div>
        </div>

        <div class="eval-body" id="eval-body">
          <div class="empty-eval-state">No critical vulnerabilities detected yet. Add components to begin.</div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const closeBtn = this.container.querySelector('#btn-close-eval');
    const overlay = this.container.querySelector('#eval-overlay');

    eventBus.on(EVENTS.PANEL_TOGGLED, ({ panel }) => {
      if (panel === 'evaluation') {
        this.toggle();
      }
    });

    closeBtn.addEventListener('click', () => this.close());
    overlay.addEventListener('click', () => this.close());

    // Listen to real-time analysis reports from WASM
    eventBus.on(EVENTS.ANALYSIS_UPDATED, (report) => {
      this.lastReport = report;
      this._updateReportUi(report);
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const drawer = this.container.querySelector('#eval-drawer');
    const overlay = this.container.querySelector('#eval-overlay');
    if (drawer) drawer.classList.toggle('open', this.isOpen);
    if (overlay) overlay.classList.toggle('open', this.isOpen);
  }

  close() {
    this.isOpen = false;
    const drawer = this.container.querySelector('#eval-drawer');
    const overlay = this.container.querySelector('#eval-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  _updateReportUi(report) {
    const scoreNum = this.container.querySelector('#eval-score-num');
    const scoreSum = this.container.querySelector('#eval-score-summary');
    const cntSpof = this.container.querySelector('#cnt-spof');
    const cntBot = this.container.querySelector('#cnt-bottleneck');
    const body = this.container.querySelector('#eval-body');

    if (!scoreNum || !body) return;

    scoreNum.textContent = report.architecture_score;
    const score = report.architecture_score;

    if (score >= 85) {
      scoreNum.style.color = '#10B981';
      scoreSum.textContent = 'High Availability Architecture. Redundancy criteria met.';
    } else if (score >= 60) {
      scoreNum.style.color = '#F59E0B';
      scoreSum.textContent = 'Degraded Resilience. Single points of failure require attention.';
    } else {
      scoreNum.style.color = '#EF4444';
      scoreSum.textContent = 'Critical Architecture Vulnerabilities. System prone to cascading outages.';
    }

    cntSpof.textContent = `${report.spofs.length} SPOFs`;
    cntBot.textContent = `${report.bottlenecks.length} Bottlenecks`;

    // Render items
    let html = '';

    // 1. SPOFs
    if (report.spofs.length > 0) {
      html += `<h4 class="section-heading">Single Points of Failure (${report.spofs.length})</h4>`;
      for (const spof of report.spofs) {
        html += `
          <div class="issue-card danger">
            <div class="issue-card-top">
              <span class="issue-tag danger">${spof.severity}</span>
              <strong class="issue-node-name">${spof.node_name}</strong>
            </div>
            <p class="issue-reason">${spof.reason}</p>
            <p class="issue-suggestion">💡 <strong>Remedy:</strong> ${spof.suggestion}</p>
            <button class="btn-autofix" data-node-id="${spof.node_id}">
              <span>⚡ Auto-Fix SPOF</span>
            </button>
          </div>
        `;
      }
    }

    // 2. Bottlenecks
    if (report.bottlenecks.length > 0) {
      html += `<h4 class="section-heading">Traffic Bottlenecks (${report.bottlenecks.length})</h4>`;
      for (const bot of report.bottlenecks) {
        html += `
          <div class="issue-card warning">
            <div class="issue-card-top">
              <span class="issue-tag warning">HIGH LOAD</span>
            </div>
            <p class="issue-reason">${bot}</p>
          </div>
        `;
      }
    }

    // 3. Recommendations & Missing Load Balancers
    if (report.missing_load_balancers.length > 0 || report.recommendations.length > 0) {
      html += `<h4 class="section-heading">Architectural Recommendations</h4>`;
      for (const mlb of report.missing_load_balancers) {
        html += `
          <div class="issue-card info">
            <p class="issue-reason">⚠️ ${mlb}</p>
          </div>
        `;
      }
      for (const rec of report.recommendations) {
        html += `
          <div class="issue-card info">
            <p class="issue-reason">${rec}</p>
          </div>
        `;
      }
    }

    if (report.spofs.length === 0 && report.bottlenecks.length === 0 && report.recommendations.length === 0) {
      html = `<div class="empty-eval-state success">🎉 Excellent system design! No Single Points of Failure or saturated bottlenecks detected.</div>`;
    }

    body.innerHTML = html;

    // Bind auto-fix buttons
    const autofixBtns = body.querySelectorAll('.btn-autofix');
    autofixBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const nodeId = btn.getAttribute('data-node-id');
        const fixTool = TOOLS.find(t => t.name === 'auto_fix_spof');
        if (fixTool) {
          const res = fixTool.execute({ node_id: nodeId });
          btn.textContent = '✓ Resolved';
          btn.disabled = true;
          btn.style.opacity = '0.6';
        }
      });
    });
  }
}
