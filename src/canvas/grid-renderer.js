/**
 * ==============================================================================
 * Grid Renderer (Infinite Canvas Dot-Grid)
 * ==============================================================================
 * Draws a subtle, high-performance dot-matrix grid aligned with camera zoom.
 * Adapts seamlessly between light and dark themes.
 */

import { CANVAS_CONFIG } from '../core/constants.js';

export class GridRenderer {
  /**
   * Render grid dots aligned to world coordinate space
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} camera - Camera instance
   * @param {string} theme - 'dark' | 'light'
   */
  render(ctx, camera, theme) {
    const canvas = camera.canvas;
    const spacing = CANVAS_CONFIG.GRID_SPACING;

    // Visible world boundaries
    const topLeft = camera.screenToWorld(0, 0);
    const bottomRight = camera.screenToWorld(canvas.width, canvas.height);

    const startX = Math.floor(topLeft.x / spacing) * spacing;
    const endX = Math.ceil(bottomRight.x / spacing) * spacing;
    const startY = Math.floor(topLeft.y / spacing) * spacing;
    const endY = Math.ceil(bottomRight.y / spacing) * spacing;

    const dotColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const dotRadius = Math.max(0.75, 1.25 / camera.zoom);

    ctx.fillStyle = dotColor;

    for (let x = startX; x <= endX; x += spacing) {
      for (let y = startY; y <= endY; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
