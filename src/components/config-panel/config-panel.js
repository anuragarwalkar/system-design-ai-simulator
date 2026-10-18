/**
 * ==============================================================================
 * Node Inspector & Configuration Panel
 * ==============================================================================
 * Provides deep property customization for selected nodes:
 * - Redis cache eviction policy, TTL, and hit ratio
 * - Database sharding strategy and read replicas
 * - Load balancer distribution algorithms
 * - Microservice instance scaling
 * - Message Queue partitions & CDN edge caching
 */

import { stateManager } from '../../core/state-manager.js';
import { eventBus } from '../../core/event-bus.js';
import { EVENTS, COMPONENT_METADATA, COMPONENT_TYPES } from '../../core/constants.js';

export class ConfigPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentNode = null;
    this._bindEvents();
    this.renderEmpty();
  }

  _bindEvents() {
    eventBus.on(EVENTS.SELECTION_CHANGED, ({ node, edge }) => {
      if (node) {
        this.currentNode = node;
        this.renderNodeConfig(node);
        if (window.innerWidth <= 900) {
          this.openMobileInspector();
        }
      } else {
        this.currentNode = null;
        this.renderEmpty();
        if (window.innerWidth <= 900) {
          this.closeMobileInspector();
        }
      }
    });

    eventBus.on(EVENTS.SIM_METRICS_UPDATED, (report) => {
      if (this.currentNode && report.node_metrics[this.currentNode.id]) {
        this._updateTelemetry(report.node_metrics[this.currentNode.id]);
      }
    });
  }

  openMobileInspector() {
    const inspector = document.getElementById('app-inspector');
    const backdrop = document.getElementById('inspector-backdrop');
    if (inspector) inspector.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
  }

  closeMobileInspector() {
    const inspector = document.getElementById('app-inspector');
    const backdrop = document.getElementById('inspector-backdrop');
    if (inspector) inspector.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="config-header" style="border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; padding: 10px 14px;">
        <button id="btn-close-empty-inspector" class="btn-icon-close" title="Close Inspector">✕</button>
      </div>
      <div class="config-empty">
        <div class="empty-icon">⚙️</div>
        <h3 class="empty-title">Node Inspector</h3>
        <p class="empty-desc">Tap any component on the canvas to configure its properties, replication, or cache policies.</p>
      </div>
    `;

    const closeBtn = this.container.querySelector('#btn-close-empty-inspector');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        stateManager.clearSelection();
        this.closeMobileInspector();
      });
    }
  }

  renderNodeConfig(node) {
    const meta = COMPONENT_METADATA[node.component_type] || {};
    const config = node.config || {};

    this.container.innerHTML = `
      <div class="config-header">
        <div class="config-title-row">
          <div class="component-icon-badge" style="background: ${meta.accentBg}; color: ${meta.color};">
            <span class="component-dot" style="background: ${meta.color};"></span>
          </div>
          <div class="config-title-wrap">
            <input type="text" id="node-name-input" class="node-name-field" value="${node.name}" title="Edit Name" />
            <span class="config-type-badge">${meta.name || node.component_type}</span>
          </div>
          <button id="btn-close-config" class="btn-icon-close" title="Close">✕</button>
        </div>
      </div>

      <!-- Live Node Telemetry Card -->
      <div class="telemetry-card">
        <div class="telemetry-row">
          <div class="telemetry-item">
            <span class="telemetry-label">Incoming</span>
            <strong class="telemetry-val" id="tel-incoming">0 rps</strong>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Load</span>
            <strong class="telemetry-val" id="tel-load">0%</strong>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Latency</span>
            <strong class="telemetry-val" id="tel-latency">${meta.baseLatencyMs}ms</strong>
          </div>
        </div>
      </div>

      <!-- Dynamic Form by Component Type -->
      <div class="config-body">
        ${this._renderTypeSpecificForms(node.component_type, config)}

        <div class="config-divider"></div>

        <button id="btn-delete-node" class="btn-delete-component">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Delete Component</span>
        </button>
      </div>
    `;

    this._bindFormInputs(node);
  }

  _renderTypeSpecificForms(type, config) {
    switch (type) {
      case COMPONENT_TYPES.CACHE:
        return `
          <div class="form-group">
            <label class="form-label">Eviction Policy</label>
            <select class="form-select" data-prop="eviction_policy">
              <option value="LRU" ${config.eviction_policy === 'LRU' ? 'selected' : ''}>LRU (Least Recently Used)</option>
              <option value="LFU" ${config.eviction_policy === 'LFU' ? 'selected' : ''}>LFU (Least Frequently Used)</option>
              <option value="FIFO" ${config.eviction_policy === 'FIFO' ? 'selected' : ''}>FIFO (First In First Out)</option>
              <option value="Random" ${config.eviction_policy === 'Random' ? 'selected' : ''}>Random Eviction</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Max Memory Allocation</label>
            <select class="form-select" data-prop="max_memory_mb">
              <option value="1024" ${config.max_memory_mb == 1024 ? 'selected' : ''}>1 GB RAM ($15/mo)</option>
              <option value="4096" ${config.max_memory_mb == 4096 ? 'selected' : ''}>4 GB RAM ($60/mo)</option>
              <option value="8192" ${config.max_memory_mb == 8192 ? 'selected' : ''}>8 GB RAM ($120/mo)</option>
              <option value="16384" ${config.max_memory_mb == 16384 ? 'selected' : ''}>16 GB RAM ($240/mo)</option>
              <option value="32768" ${config.max_memory_mb == 32768 ? 'selected' : ''}>32 GB RAM ($480/mo)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Simulated Cache Hit Ratio: <strong id="lbl-hit-ratio">${((config.cache_hit_ratio ?? 0.85) * 100).toFixed(0)}%</strong></label>
            <input type="range" class="form-range" data-prop="cache_hit_ratio" min="0.10" max="0.99" step="0.01" value="${config.cache_hit_ratio ?? 0.85}" />
          </div>
        `;

      case COMPONENT_TYPES.DATABASE:
        return `
          <div class="form-group">
            <label class="form-label">Database Engine</label>
            <select class="form-select" data-prop="db_type">
              <option value="SQL Relational" ${config.db_type === 'SQL Relational' ? 'selected' : ''}>SQL Relational (PostgreSQL / MySQL)</option>
              <option value="NoSQL Document" ${config.db_type === 'NoSQL Document' ? 'selected' : ''}>NoSQL Document (MongoDB / DynamoDB)</option>
              <option value="Key-Value" ${config.db_type === 'Key-Value' ? 'selected' : ''}>Key-Value (Cassandra / ScyllaDB)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sharding Strategy</label>
            <select class="form-select" data-prop="sharding_strategy">
              <option value="None" ${!config.sharding_strategy || config.sharding_strategy === 'None' ? 'selected' : ''}>None (Single Master Instance)</option>
              <option value="Hash" ${config.sharding_strategy === 'Hash' ? 'selected' : ''}>Consistent Hash Key Sharding</option>
              <option value="Range" ${config.sharding_strategy === 'Range' ? 'selected' : ''}>Range-based Partitioning</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Read Replicas: <strong id="lbl-replicas">${config.read_replicas ?? 0}</strong></label>
            <input type="range" class="form-range" data-prop="read_replicas" min="0" max="10" step="1" value="${config.read_replicas ?? 0}" />
            <span class="form-hint">Each read replica adds ~80% extra read throughput</span>
          </div>
        `;

      case COMPONENT_TYPES.LOAD_BALANCER:
        return `
          <div class="form-group">
            <label class="form-label">Balancing Algorithm</label>
            <select class="form-select" data-prop="lb_algorithm">
              <option value="Round Robin" ${config.lb_algorithm === 'Round Robin' ? 'selected' : ''}>Round Robin (Cyclic)</option>
              <option value="Least Connections" ${config.lb_algorithm === 'Least Connections' ? 'selected' : ''}>Least Connections (Dynamic)</option>
              <option value="Consistent Hashing" ${config.lb_algorithm === 'Consistent Hashing' ? 'selected' : ''}>Consistent Hashing (Sticky Sessions)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Health Check Interval</label>
            <select class="form-select" data-prop="health_check_interval_ms">
              <option value="1000" ${config.health_check_interval_ms == 1000 ? 'selected' : ''}>1,000 ms (Fast Failover)</option>
              <option value="5000" ${config.health_check_interval_ms == 5000 ? 'selected' : ''}>5,000 ms (Standard)</option>
              <option value="15000" ${config.health_check_interval_ms == 15000 ? 'selected' : ''}>15,000 ms (Low Overhead)</option>
            </select>
          </div>
        `;

      case COMPONENT_TYPES.MICROSERVICE:
        return `
          <div class="form-group">
            <label class="form-label">Replicas / Instances: <strong id="lbl-instances">${config.instances ?? 1}</strong></label>
            <input type="range" class="form-range" data-prop="instances" min="1" max="20" step="1" value="${config.instances ?? 1}" />
          </div>
          <div class="form-group">
            <label class="form-label">Concurrency Limit per Instance</label>
            <select class="form-select" data-prop="concurrency_limit">
              <option value="500" ${config.concurrency_limit == 500 ? 'selected' : ''}>500 concurrent connections</option>
              <option value="2000" ${config.concurrency_limit == 2000 ? 'selected' : ''}>2,000 concurrent connections</option>
              <option value="8000" ${config.concurrency_limit == 8000 ? 'selected' : ''}>8,000 concurrent connections</option>
            </select>
          </div>
        `;

      case COMPONENT_TYPES.MESSAGE_QUEUE:
        return `
          <div class="form-group">
            <label class="form-label">Queue Architecture</label>
            <select class="form-select" data-prop="queue_type">
              <option value="Kafka Log" ${config.queue_type === 'Kafka Log' ? 'selected' : ''}>Apache Kafka (Distributed Append Log)</option>
              <option value="RabbitMQ AMQP" ${config.queue_type === 'RabbitMQ AMQP' ? 'selected' : ''}>RabbitMQ (AMQP Broker)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Partition Count: <strong id="lbl-partitions">${config.partitions ?? 16}</strong></label>
            <input type="range" class="form-range" data-prop="partitions" min="4" max="64" step="4" value="${config.partitions ?? 16}" />
          </div>
        `;

      case COMPONENT_TYPES.CDN:
        return `
          <div class="form-group">
            <label class="form-label">Edge Cache Hit Ratio: <strong id="lbl-edge-ratio">${((config.edge_cache_ratio ?? 0.85) * 100).toFixed(0)}%</strong></label>
            <input type="range" class="form-range" data-prop="edge_cache_ratio" min="0.50" max="0.99" step="0.01" value="${config.edge_cache_ratio ?? 0.85}" />
          </div>
        `;

      default:
        return `
          <p class="text-secondary" style="font-size: 13px;">Standard component. Scalable via upstream load balancing.</p>
        `;
    }
  }

  _bindFormInputs(node) {
    // Node Name Input
    const nameInput = this.container.querySelector('#node-name-input');
    if (nameInput) {
      nameInput.addEventListener('change', () => {
        stateManager.renameNode(node.id, nameInput.value.trim() || node.name);
      });
    }

    // Close button
    const closeBtn = this.container.querySelector('#btn-close-config');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => stateManager.clearSelection());
    }

    // Delete button
    const delBtn = this.container.querySelector('#btn-delete-node');
    if (delBtn) {
      delBtn.addEventListener('click', () => stateManager.removeNode(node.id));
    }

    // Generic config inputs
    const inputs = this.container.querySelectorAll('[data-prop]');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const prop = input.getAttribute('data-prop');
        let val = input.value;
        if (input.type === 'range' || input.type === 'number') {
          val = Number(val);
        }

        // Update live label if present
        if (prop === 'cache_hit_ratio') {
          const lbl = this.container.querySelector('#lbl-hit-ratio');
          if (lbl) lbl.textContent = `${(val * 100).toFixed(0)}%`;
        } else if (prop === 'read_replicas') {
          const lbl = this.container.querySelector('#lbl-replicas');
          if (lbl) lbl.textContent = val;
        } else if (prop === 'instances') {
          const lbl = this.container.querySelector('#lbl-instances');
          if (lbl) lbl.textContent = val;
        } else if (prop === 'partitions') {
          const lbl = this.container.querySelector('#lbl-partitions');
          if (lbl) lbl.textContent = val;
        } else if (prop === 'edge_cache_ratio') {
          const lbl = this.container.querySelector('#lbl-edge-ratio');
          if (lbl) lbl.textContent = `${(val * 100).toFixed(0)}%`;
        }

        stateManager.updateNodeConfig(node.id, { [prop]: val });
      });
    });
  }

  _updateTelemetry(metric) {
    const elInc = this.container.querySelector('#tel-incoming');
    const elLoad = this.container.querySelector('#tel-load');
    const elLat = this.container.querySelector('#tel-latency');

    if (elInc) elInc.textContent = `${metric.incoming_rps.toLocaleString()} rps`;
    if (elLoad) {
      const pct = (metric.cpu_utilization * 100).toFixed(0);
      elLoad.textContent = `${pct}%`;
      elLoad.style.color = metric.cpu_utilization > 1.0 ? '#EF4444' : (metric.cpu_utilization > 0.7 ? '#F59E0B' : '#10B981');
    }
    if (elLat) elLat.textContent = `${metric.p50_latency_ms}ms`;
  }
}
