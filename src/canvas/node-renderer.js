/**
 * ==============================================================================
 * Node Renderer (Canvas Component Drawing)
 * ==============================================================================
 * Renders modern, sleek cards representing distributed system nodes.
 * Features live CPU/memory load bars, status pills, SPOF warning badges,
 * latency readouts, and interactive connection ports.
 */

import { CANVAS_CONFIG, COMPONENT_METADATA } from '../core/constants.js';

export class NodeRenderer {
  /**
   * Render an individual node card on canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} node - SystemNode object
   * @param {Object} options - { isSelected, metrics, isSpof, theme, hoveredPort }
   */
  renderNode(ctx, node, options = {}) {
    const { isSelected, metrics, isSpof, theme, hoveredPort, isConnectTarget, isWireActive, sourceNodeId } = options;
    const meta = COMPONENT_METADATA[node.component_type] || {};
    const width = CANVAS_CONFIG.NODE_WIDTH;
    const height = CANVAS_CONFIG.NODE_HEIGHT;
    const radius = CANVAS_CONFIG.BORDER_RADIUS;

    const isDark = theme === 'dark';
    const cardBg = isDark ? '#1A1D27' : '#FFFFFF';
    let borderColor = isSelected
      ? '#6366F1'
      : (isDark ? '#2D3348' : '#E2E5EA');

    if (isConnectTarget) {
      borderColor = '#10B981'; // Glowing emerald border when candidate target
    }

    const textColor = isDark ? '#F1F5F9' : '#0F172A';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';

    ctx.save();

    // 1. Drop shadow / glow
    if (isConnectTarget) {
      ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = isSelected ? 16 : 8;
      ctx.shadowOffsetY = isSelected ? 6 : 3;
    }

    // 2. Rounded card body
    ctx.beginPath();
    ctx.roundRect(node.x, node.y, width, height, radius);
    ctx.fillStyle = cardBg;
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // 3. Card border
    ctx.lineWidth = (isSelected || isConnectTarget) ? 2.5 : 1.25;
    ctx.strokeStyle = borderColor;
    if (isConnectTarget) {
      ctx.setLineDash([5, 3]);
    }
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // 4. Header accent bar & icon
    const accentColor = meta.color || '#3B82F6';
    ctx.beginPath();
    ctx.arc(node.x + 18, node.y + 20, 8, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // 5. Node name (truncated if long)
    ctx.fillStyle = textColor;
    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const displayName = node.name.length > 15 ? node.name.slice(0, 14) + '…' : node.name;
    ctx.fillText(displayName, node.x + 34, node.y + 20);

    // 6. Component type badge
    ctx.fillStyle = subTextColor;
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(meta.name || node.component_type, node.x + 34, node.y + 36);

    // 7. SPOF Warning Badge (if detected)
    if (isSpof) {
      this._renderSpofBadge(ctx, node.x + width - 18, node.y + 18);
    }

    // 8. Divider line
    ctx.beginPath();
    ctx.moveTo(node.x + 12, node.y + 48);
    ctx.lineTo(node.x + width - 12, node.y + 48);
    ctx.strokeStyle = isDark ? '#262B3D' : '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 9. Load bar & Metrics
    const incomingRps = metrics ? metrics.incoming_rps : 0;
    const utilization = metrics ? metrics.cpu_utilization : 0;
    const latencyMs = metrics ? metrics.p50_latency_ms : meta.baseLatencyMs;

    this._renderLoadBar(ctx, node.x + 12, node.y + 58, width - 24, utilization, isDark);

    // 10. Footer metrics text
    ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = subTextColor;
    ctx.fillText(`${incomingRps.toLocaleString()} rps`, node.x + 12, node.y + 82);

    ctx.textAlign = 'right';
    const latColor = latencyMs > 100 ? '#EF4444' : (latencyMs > 40 ? '#F59E0B' : subTextColor);
    ctx.fillStyle = latColor;
    ctx.fillText(`${latencyMs}ms`, node.x + width - 12, node.y + 82);

    // 11. Connection Ports (Top, Bottom, Left, Right)
    this._renderPorts(ctx, node, hoveredPort, isDark, isWireActive, sourceNodeId);

    ctx.restore();
  }

  /**
   * Render load utilization meter
   * @private
   */
  _renderLoadBar(ctx, x, y, width, utilization, isDark) {
    const height = 5;
    const radius = 2.5;

    // Background track
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = isDark ? '#262B3D' : '#E2E8F0';
    ctx.fill();

    // Filled progress
    const pct = Math.min(1.0, Math.max(0, utilization));
    const fillWidth = Math.max(height, width * pct);

    let fillColor = '#10B981'; // Green < 70%
    if (utilization >= 1.0) {
      fillColor = '#EF4444'; // Red overloaded
    } else if (utilization >= 0.70) {
      fillColor = '#F59E0B'; // Amber high load
    }

    if (pct > 0) {
      ctx.beginPath();
      ctx.roundRect(x, y, fillWidth, height, radius);
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
  }

  /**
   * Render SPOF warning badge
   * @private
   */
  _renderSpofBadge(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    // Exclamation mark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', x, y);
  }

  /**
   * Render connection ports
   * @private
   */
  _renderPorts(ctx, node, hoveredPort, isDark, isWireActive, sourceNodeId) {
    const ports = this.getNodePorts(node);
    const portRadius = CANVAS_CONFIG.PORT_RADIUS; // 5

    for (const port of ports) {
      const isHovered = hoveredPort && hoveredPort.nodeId === node.id && hoveredPort.side === port.side;
      const isTargetCandidate = isWireActive && node.id !== sourceNodeId;

      ctx.save();

      // Outer glow / hover ring
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(port.x, port.y, portRadius + 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.28)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#6366F1';
        ctx.stroke();
      } else if (isTargetCandidate) {
        ctx.beginPath();
        ctx.arc(port.x, port.y, portRadius + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.20)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#10B981';
        ctx.stroke();
      }

      // Port circle
      ctx.beginPath();
      ctx.arc(port.x, port.y, isHovered ? portRadius + 2 : portRadius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered
        ? '#6366F1'
        : (isTargetCandidate ? '#10B981' : (isDark ? '#475569' : '#CBD5E1'));
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDark ? '#1A1D27' : '#FFFFFF';
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Get port locations in world coordinates for a node
   * @param {Object} node
   * @returns {Array<{side: string, x: number, y: number, nodeId: string}>}
   */
  getNodePorts(node) {
    const w = CANVAS_CONFIG.NODE_WIDTH;
    const h = CANVAS_CONFIG.NODE_HEIGHT;

    return [
      { side: 'top', x: node.x + w / 2, y: node.y, nodeId: node.id },
      { side: 'bottom', x: node.x + w / 2, y: node.y + h, nodeId: node.id },
      { side: 'left', x: node.x, y: node.y + h / 2, nodeId: node.id },
      { side: 'right', x: node.x + w, y: node.y + h / 2, nodeId: node.id }
    ];
  }
}
