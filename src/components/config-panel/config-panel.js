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
import { EVENTS, COMPONENT_METADATA, COMPONENT_TYPES, PROTOCOLS_METADATA, COMPONENT_MODELS, BRAND_PROVIDERS, getComponentBrands, getModelsForBrand, COMPONENT_ICONS_SVG } from '../../core/constants.js';

export class ConfigPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentNode = null;
    this.currentEdge = null;
    this._bindEvents();
    this.renderEmpty();
  }

  _bindEvents() {
    eventBus.on(EVENTS.SELECTION_CHANGED, ({ node, edge }) => {
      if (node) {
        this.currentNode = node;
        this.currentEdge = null;
        this.renderNodeConfig(node);
        if (window.innerWidth <= 900) {
          this.openMobileInspector();
        }
      } else if (edge) {
        this.currentNode = null;
        this.currentEdge = edge;
        this.renderEdgeConfig(edge);
        if (window.innerWidth <= 900) {
          this.openMobileInspector();
        }
      } else {
        this.currentNode = null;
        this.currentEdge = null;
        this.renderEmpty();
        if (window.innerWidth <= 900) {
          this.closeMobileInspector();
        }
      }
    });

    eventBus.on(EVENTS.EDGE_UPDATED, (edge) => {
      if (this.currentEdge && this.currentEdge.id === edge.id) {
        this.renderEdgeConfig(edge);
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
    const models = COMPONENT_MODELS[node.component_type] || [];
    const currentModel = models.find(m => m.id === node.model_id) || models[0] || null;
    const brands = getComponentBrands(node.component_type);
    const activeBrand = currentModel ? currentModel.brand : (brands[0]?.brand || 'AWS');
    const brandModels = getModelsForBrand(node.component_type, activeBrand);

    this.container.innerHTML = `
      <div class="config-header">
        <div class="config-title-row">
          <div class="component-icon-badge" style="background: ${meta.accentBg}; color: ${meta.color};">
            ${COMPONENT_ICONS_SVG[node.component_type] || `<span class="component-dot" style="background: ${meta.color};"></span>`}
          </div>
          <div class="config-title-wrap">
            <input type="text" id="node-name-input" class="node-name-field" value="${node.name}" title="Edit Name" />
            <div class="config-type-row">
              <span class="config-type-badge">${meta.name || node.component_type}</span>
              ${currentModel ? `
                <span class="brand-badge-pill" style="color: ${currentModel.brandInfo.color}; background: ${currentModel.brandInfo.bg}; border-color: ${currentModel.brandInfo.color};">
                  ${currentModel.brandInfo.shortName}
                </span>
              ` : ''}
            </div>
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
            <strong class="telemetry-val" id="tel-latency">${node.base_latency_ms || meta.baseLatencyMs}ms</strong>
          </div>
        </div>
      </div>

      <div class="config-body">
        <!-- Cloud Provider & Technology Model Selection Card -->
        ${models.length > 0 ? `
          <div class="brand-model-selector-card">
            <div class="brand-model-header">
              <span class="brand-model-title">🏷️ Brand & Technology Model</span>
              ${currentModel ? `
                <span class="brand-badge-pill" style="color: ${currentModel.brandInfo.color}; background: ${currentModel.brandInfo.bg}; border-color: ${currentModel.brandInfo.color};">
                  ${currentModel.brand}
                </span>
              ` : ''}
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label">Brand / Provider</label>
              <div class="inspector-brand-chips">
                ${brands.map(b => `
                  <button type="button" class="inspector-brand-chip ${b.brand === activeBrand ? 'active' : ''}" data-brand="${b.brand}" style="--chip-color: ${b.color}; --chip-bg: ${b.bg};" title="${b.name}">
                    ${b.shortName}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 6px;">
              <label class="form-label">Technology Engine (${brandModels.length})</label>
              <select class="form-select brand-model-select" id="node-model-select">
                ${brandModels.map(m => `
                  <option value="${m.id}" ${m.id === currentModel?.id ? 'selected' : ''}>
                    ${m.name}
                  </option>
                `).join('')}
              </select>
            </div>

            ${currentModel ? `
              <div class="model-highlights-box">
                <div class="model-desc">${currentModel.description}</div>
                <div class="model-highlights">
                  <strong>✨ Highlights:</strong> ${currentModel.highlights}
                </div>
                <div class="model-specs-row">
                  <span>Cap: <strong>${(currentModel.baseRps / 1000).toFixed(0)}k RPS</strong></span>
                  <span>Latency: <strong>${currentModel.baseLatencyMs}ms</strong></span>
                  <span>Est: <strong>$${(currentModel.hourlyCost * 730).toFixed(0)}/mo</strong></span>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Dynamic Form by Component Type -->
        ${this._renderTypeSpecificForms(node.component_type, config)}

        <!-- Beginner System Design Concept Card (Collapsible) -->
        ${meta.concept ? `
          <div class="concept-explainer-card">
            <button type="button" class="btn-toggle-concept" id="btn-toggle-concept">
              <span>💡 Concept & Interview Tips</span>
              <span class="concept-chevron">▾</span>
            </button>
            <div class="concept-explainer-drawer" id="concept-drawer" style="display: none;">
              <div class="concept-analogy">
                <strong>Analogy:</strong> ${meta.concept.analogy}
              </div>
              <div class="concept-body-text">
                ${meta.concept.whatItDoes}
              </div>
              <div class="concept-tradeoff-box">
                <span class="tradeoff-icon">⚠️</span>
                <span class="tradeoff-text"><strong>Trade-off:</strong> ${meta.concept.keyTradeoffs}</span>
              </div>
              <div class="concept-interview-tip">
                <strong>🎯 Interview Tip:</strong> ${meta.concept.interviewTip}
              </div>
              ${meta.concept.industryExamples ? `
                <div class="concept-examples">
                  <strong>Real-World:</strong> ${meta.concept.industryExamples}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

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

    // Brand Selection Chips
    const brandChips = this.container.querySelectorAll('.inspector-brand-chip');
    brandChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const brand = chip.getAttribute('data-brand');
        const brandModels = getModelsForBrand(node.component_type, brand);
        if (brandModels.length > 0) {
          stateManager.updateNodeModel(node.id, brandModels[0].id, true);
          this.renderNodeConfig(node);
        }
      });
    });

    // Technology Model Selector
    const modelSelect = this.container.querySelector('#node-model-select');
    if (modelSelect) {
      modelSelect.addEventListener('change', (e) => {
        const selectedModelId = e.target.value;
        stateManager.updateNodeModel(node.id, selectedModelId, true);
        this.renderNodeConfig(node);
      });
    }

    // Close button
    const closeBtn = this.container.querySelector('#btn-close-config');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => stateManager.clearSelection());
    }

    // Toggle Concept breakdown drawer
    const conceptBtn = this.container.querySelector('#btn-toggle-concept');
    const conceptDrawer = this.container.querySelector('#concept-drawer');
    if (conceptBtn && conceptDrawer) {
      conceptBtn.addEventListener('click', () => {
        const isHidden = conceptDrawer.style.display === 'none';
        conceptDrawer.style.display = isHidden ? 'flex' : 'none';
        conceptBtn.classList.toggle('expanded', isHidden);
      });
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

  renderEdgeConfig(edge) {
    const fromNode = stateManager.nodes.get(edge.from);
    const toNode = stateManager.nodes.get(edge.to);
    const fromMeta = fromNode ? (COMPONENT_METADATA[fromNode.component_type] || {}) : {};
    const toMeta = toNode ? (COMPONENT_METADATA[toNode.component_type] || {}) : {};
    const protocolInfo = PROTOCOLS_METADATA[edge.protocol] || {
      name: edge.protocol,
      category: 'Network Protocol',
      latencyMs: edge.latency_overhead_ms || 2.0,
      description: 'Network communication protocol between nodes.',
      pros: 'Standard connectivity',
      cons: 'None specified',
      bestFor: 'Inter-node communication'
    };

    const protocolOptions = Object.keys(PROTOCOLS_METADATA);

    this.container.innerHTML = `
      <div class="config-header">
        <div class="config-title-row">
          <div class="component-icon-badge" style="background: rgba(99, 102, 241, 0.15); color: #6366F1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
          <div class="config-title-wrap">
            <span class="node-name-field" style="padding: 2px 0;">Connection Wire</span>
            <span class="config-type-badge">${edge.protocol}</span>
          </div>
          <button id="btn-close-config" class="btn-icon-close" title="Close">✕</button>
        </div>
      </div>

      <div class="config-body">
        <!-- Node Connection Endpoints Card -->
        <div class="edge-endpoints-card">
          <div class="endpoint-node">
            <span class="endpoint-dot" style="background: ${fromMeta.color || '#3B82F6'};"></span>
            <span class="endpoint-name">${fromNode ? fromNode.name : 'Unknown'}</span>
          </div>
          <div class="endpoint-arrow">➔</div>
          <div class="endpoint-node">
            <span class="endpoint-dot" style="background: ${toMeta.color || '#10B981'};"></span>
            <span class="endpoint-name">${toNode ? toNode.name : 'Unknown'}</span>
          </div>
        </div>

        <!-- Protocol Selection Form -->
        <div class="form-group">
          <label class="form-label">Network Protocol</label>
          <select class="form-select" id="edge-protocol-select">
            ${protocolOptions.map(p => `
              <option value="${p}" ${p === edge.protocol ? 'selected' : ''}>${PROTOCOLS_METADATA[p].name} (${PROTOCOLS_METADATA[p].category})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Network Latency Overhead: <strong id="lbl-edge-latency">${(edge.latency_overhead_ms || 1.0).toFixed(1)}ms</strong></label>
          <input type="range" class="form-range" id="edge-latency-range" min="0.2" max="25.0" step="0.2" value="${edge.latency_overhead_ms || 1.0}" />
        </div>

        <!-- Protocol Deep Dive Info Card -->
        <div class="concept-explainer-card">
          <div class="concept-explainer-header">
            <span class="concept-icon">🌐</span>
            <span class="concept-heading">${protocolInfo.name}</span>
          </div>
          <div class="concept-body-text">
            ${protocolInfo.description}
          </div>
          <div class="protocol-pros-cons">
            <div class="pro-item"><strong>✓ Pros:</strong> ${protocolInfo.pros}</div>
            <div class="con-item"><strong>✗ Cons:</strong> ${protocolInfo.cons}</div>
          </div>
          <div class="concept-interview-tip">
            <strong>🎯 Best For:</strong> ${protocolInfo.bestFor}
          </div>
        </div>

        <div class="config-divider"></div>

        <button id="btn-delete-edge" class="btn-delete-component">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Delete Connection Wire</span>
        </button>
      </div>
    `;

    this._bindEdgeEvents(edge);
  }

  _bindEdgeEvents(edge) {
    const closeBtn = this.container.querySelector('#btn-close-config');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        stateManager.clearSelection();
        this.closeMobileInspector();
      });
    }

    const protoSelect = this.container.querySelector('#edge-protocol-select');
    if (protoSelect) {
      protoSelect.addEventListener('change', (e) => {
        const newProto = e.target.value;
        const meta = PROTOCOLS_METADATA[newProto];
        const newLatency = meta ? meta.latencyMs : (edge.latency_overhead_ms || 1.0);
        stateManager.updateEdgeConfig(edge.id, {
          protocol: newProto,
          latency_overhead_ms: newLatency
        });
        this.renderEdgeConfig(edge);
      });
    }

    const latRange = this.container.querySelector('#edge-latency-range');
    if (latRange) {
      latRange.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        const lbl = this.container.querySelector('#lbl-edge-latency');
        if (lbl) lbl.textContent = `${val.toFixed(1)}ms`;
        stateManager.updateEdgeConfig(edge.id, { latency_overhead_ms: val });
      });
    }

    const delBtn = this.container.querySelector('#btn-delete-edge');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        stateManager.removeEdge(edge.id);
      });
    }
  }
}
