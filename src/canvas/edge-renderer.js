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

      this._renderProtocolBadge(ctx, midX, midY, edge.protocol, isDark);
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

    const deltaY = currentY - startY;
    const cp1X = startX;
    const cp1Y = startY + deltaY * 0.5;
    const cp2X = currentX;
    const cp2Y = currentY - deltaY * 0.5;

    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, currentX, currentY);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();

    // Pulse dot at current mouse position
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#6366F1';
    ctx.fill();

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

  _renderProtocolBadge(ctx, x, y, protocol, isDark) {
    ctx.save();
    ctx.font = '500 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textWidth = ctx.measureText(protocol).width;
    const paddingX = 6;
    const pillWidth = textWidth + paddingX * 2;
    const pillHeight = 16;

    ctx.beginPath();
    ctx.roundRect(x - pillWidth / 2, y - pillHeight / 2, pillWidth, pillHeight, 8);
    ctx.fillStyle = isDark ? '#1E2235' : '#FFFFFF';
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? '#333A52' : '#E2E8F0';
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(protocol, x, y);

    ctx.restore();
  }
}
