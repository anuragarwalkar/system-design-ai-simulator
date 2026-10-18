/**
 * ==============================================================================
 * Edge Renderer (Bezier Connection Curves)
 * ==============================================================================
 * Computes optimal departure/arrival ports, renders smooth cubic Bezier
 * splines, directional arrowheads, protocol pills, and active drag previews.
 */

import { CANVAS_CONFIG } from '../core/constants.js';

export class EdgeRenderer {
  /**
   * Render a connection edge
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} edge - SystemEdge
   * @param {Object} fromNode - SystemNode
   * @param {Object} toNode - SystemNode
   * @param {Object} options - { isSelected, theme }
   */
  renderEdge(ctx, edge, fromNode, toNode, options = {}) {
    if (!fromNode || !toNode) return;

    const { isSelected, theme } = options;
    const isDark = theme === 'dark';

    const points = this.calculateOptimalBezier(fromNode, toNode);
    const { startX, startY, endX, endY, cp1X, cp1Y, cp2X, cp2Y } = points;

    ctx.save();

    // 1. Edge Stroke
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

    ctx.strokeStyle = isSelected
      ? '#6366F1'
      : (isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.50)');
    ctx.lineWidth = isSelected ? 2.5 : 1.75;
    ctx.setLineDash([4, 3]); // Dashed distributed systems aesthetic
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // 2. Arrowhead at target
    this._renderArrowhead(ctx, cp2X, cp2Y, endX, endY, isSelected ? '#6366F1' : (isDark ? '#94A3B8' : '#64748B'));

    // 3. Protocol badge in center
    if (edge.protocol) {
      const midT = 0.5;
      const midX = Math.pow(1 - midT, 3) * startX + 3 * Math.pow(1 - midT, 2) * midT * cp1X + 3 * (1 - midT) * Math.pow(midT, 2) * cp2X + Math.pow(midT, 3) * endX;
      const midY = Math.pow(1 - midT, 3) * startY + 3 * Math.pow(1 - midT, 2) * midT * cp1Y + 3 * (1 - midT) * Math.pow(midT, 2) * cp2Y + Math.pow(midT, 3) * endY;

      this._renderProtocolBadge(ctx, midX, midY, edge.protocol, isDark, isSelected);
    }

    ctx.restore();
    return points;
  }

  /**
   * Render active drag connection wire while dragging from a port
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} startX
   * @param {number} startY
   * @param {number} currentX
   * @param {number} currentY
   */
  renderDragPreview(ctx, startX, startY, currentX, currentY) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    let cp1X = startX;
    let cp1Y = startY;
    let cp2X = currentX;
    let cp2Y = currentY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      const dir = deltaY >= 0 ? 1 : -1;
      const dist = Math.min(120, Math.max(30, Math.abs(deltaY) * 0.45));
      cp1Y += dist * dir;
      cp2Y -= dist * dir;
    } else {
      const dir = deltaX >= 0 ? 1 : -1;
      const dist = Math.min(120, Math.max(30, Math.abs(deltaX) * 0.45));
      cp1X += dist * dir;
      cp2X -= dist * dir;
    }

    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, currentX, currentY);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();

    // Pulse dot and glow beacon at current mouse position
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#6366F1';
    ctx.shadowColor = '#6366F1';
    ctx.shadowBlur = 10;
    ctx.fill();

    // Outer target ring
    ctx.beginPath();
    ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Calculate best connection ports and control points
   */
  calculateOptimalBezier(fromNode, toNode) {
    const w = CANVAS_CONFIG.NODE_WIDTH;
    const h = CANVAS_CONFIG.NODE_HEIGHT;

    // Node center coordinates
    const fromCenterX = fromNode.x + w / 2;
    const fromCenterY = fromNode.y + h / 2;
    const toCenterX = toNode.x + w / 2;
    const toCenterY = toNode.y + h / 2;

    const deltaX = toCenterX - fromCenterX;
    const deltaY = toCenterY - fromCenterY;

    let startX, startY, endX, endY;

    // Primarily vertical flow
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 0) {
        // Downward flow
        startX = fromCenterX;
        startY = fromNode.y + h;
        endX = toCenterX;
        endY = toNode.y;
      } else {
        // Upward flow
        startX = fromCenterX;
        startY = fromNode.y;
        endX = toCenterX;
        endY = toNode.y + h;
      }
    } else {
      // Horizontal flow
      if (deltaX > 0) {
        // Rightward flow
        startX = fromNode.x + w;
        startY = fromCenterY;
        endX = toNode.x;
        endY = toCenterY;
      } else {
        // Leftward flow
        startX = fromNode.x;
        startY = fromCenterY;
        endX = toNode.x + w;
        endY = toCenterY;
      }
    }

    const dist = Math.hypot(endX - startX, endY - startY);
    const cpDist = Math.min(100, Math.max(30, dist * 0.35));

    let cp1X = startX, cp1Y = startY;
    let cp2X = endX, cp2Y = endY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      const dir = deltaY > 0 ? 1 : -1;
      cp1Y += cpDist * dir;
      cp2Y -= cpDist * dir;
    } else {
      const dir = deltaX > 0 ? 1 : -1;
      cp1X += cpDist * dir;
      cp2X -= cpDist * dir;
    }

    return { startX, startY, endX, endY, cp1X, cp1Y, cp2X, cp2Y };
  }

  _renderArrowhead(ctx, fromX, fromY, toX, toY, color) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLen = 9;

    ctx.save();
    ctx.translate(toX, toY);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowLen, -arrowLen * 0.45);
    ctx.lineTo(-arrowLen * 0.7, 0);
    ctx.lineTo(-arrowLen, arrowLen * 0.45);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  _renderProtocolBadge(ctx, x, y, protocol, isDark, isSelected = false) {
    ctx.save();
    ctx.font = '600 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText(protocol).width;
    const dotRadius = 2.5;
    const dotMargin = 4;
    const paddingX = 8;
    const pillWidth = textWidth + dotRadius * 2 + dotMargin + paddingX * 2;
    const pillHeight = 18;

    // Protocol color accents
    let dotColor = '#3B82F6'; // Default HTTP
    if (protocol.includes('gRPC')) dotColor = '#8B5CF6'; // Purple
    else if (protocol.includes('Redis')) dotColor = '#EF4444'; // Red
    else if (protocol.includes('Kafka') || protocol.includes('AMQP')) dotColor = '#F97316'; // Orange
    else if (protocol.includes('Postgres') || protocol.includes('SQL')) dotColor = '#EC4899'; // Pink
    else if (protocol.includes('WebSocket')) dotColor = '#06B6D4'; // Cyan
    else if (protocol.includes('HTTP/2')) dotColor = '#10B981'; // Green

    // Pill background
    ctx.beginPath();
    ctx.roundRect(x - pillWidth / 2, y - pillHeight / 2, pillWidth, pillHeight, 9);
    ctx.fillStyle = isSelected
      ? (isDark ? '#232946' : '#EEF2FF')
      : (isDark ? '#1A1D2B' : '#FFFFFF');

    if (isSelected) {
      ctx.shadowColor = '#6366F1';
      ctx.shadowBlur = 8;
    }
    ctx.fill();

    // Border
    ctx.lineWidth = isSelected ? 1.5 : 1;
    ctx.strokeStyle = isSelected
      ? '#6366F1'
      : (isDark ? '#2E354B' : '#E2E8F0');
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Protocol status dot
    const startContentX = x - pillWidth / 2 + paddingX;
    const dotCenterX = startContentX + dotRadius;
    ctx.beginPath();
    ctx.arc(dotCenterX, y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();

    // Text label
    ctx.fillStyle = isSelected
      ? '#6366F1'
      : (isDark ? '#CBD5E1' : '#475569');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(protocol, dotCenterX + dotRadius + dotMargin, y);

    ctx.restore();
  }
}
