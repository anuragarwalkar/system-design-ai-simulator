/**
 * ==============================================================================
 * Metrics Dashboard (Top-Floating HUD)
 * ==============================================================================
 * Real-time operational telemetry display:
 * - p50, p95, p99 Latency percentiles
 * - Successful vs dropped request rates
 * - Estimated monthly cloud infrastructure cost
 * - Bottleneck indicator
 */

import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';

export class MetricsDashboard {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    this._bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="metrics-bar">
        <div class="metric-item">
          <span class="metric-label">p50 Latency</span>
          <span class="metric-value" id="hud-p50">0ms</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">p95 Latency</span>
          <span class="metric-value" id="hud-p95">0ms</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">p99 Latency</span>
          <span class="metric-value" id="hud-p99">0ms</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">Error Rate</span>
          <span class="metric-value" id="hud-error">0.0%</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">Est. Cloud Cost</span>
          <span class="metric-value" id="hud-cost">$0/mo</span>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    eventBus.on(EVENTS.SIM_METRICS_UPDATED, (report) => {
      const p50 = this.container.querySelector('#hud-p50');
      const p95 = this.container.querySelector('#hud-p95');
      const p99 = this.container.querySelector('#hud-p99');
      const err = this.container.querySelector('#hud-error');
      const cost = this.container.querySelector('#hud-cost');

      if (p50) p50.textContent = `${report.overall_p50_ms}ms`;
      if (p95) {
        p95.textContent = `${report.overall_p95_ms}ms`;
        p95.style.color = report.overall_p95_ms > 200 ? '#EF4444' : (report.overall_p95_ms > 80 ? '#F59E0B' : 'inherit');
      }
      if (p99) p99.textContent = `${report.overall_p99_ms}ms`;

      if (err) {
        const errorPct = report.total_requests > 0
          ? ((report.failed_requests / report.total_requests) * 100).toFixed(1)
          : '0.0';
        err.textContent = `${errorPct}%`;
        err.style.color = Number(errorPct) > 1.0 ? '#EF4444' : 'inherit';
      }

      if (cost) cost.textContent = `$${report.total_estimated_cost_monthly_usd.toLocaleString()}/mo`;
    });
  }
}
