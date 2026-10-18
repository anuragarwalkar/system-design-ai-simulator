/**
 * ==============================================================================
 * Canvas Camera (Pan & Zoom Viewport)
 * ==============================================================================
 * Transforms world coordinates (graph space) to screen coordinates (CSS pixels).
 * Supports smooth mouse wheel zooming, middle/space panning, and pinch gestures.
 * Fully calibrated for High-DPI / Retina displays.
 */

import { CANVAS_CONFIG } from '../core/constants.js';

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0; // World x of screen center
    this.y = 0; // World y of screen center
    this.zoom = 1.0;

    this.isPanning = false;
    this.lastPanX = 0;
    this.lastPanY = 0;
  }

  /**
   * Returns current visible CSS dimensions of canvas in device-independent pixels
   */
  getViewportSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      width: rect.width || (this.canvas.width / dpr) || 800,
      height: rect.height || (this.canvas.height / dpr) || 600
    };
  }

  /**
   * Convert Screen coordinate (client pixels from event) to World coordinate (graph space)
   * @param {number} screenX - e.clientX
   * @param {number} screenY - e.clientY
   * @returns {{x: number, y: number}}
   */
  screenToWorld(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    const vp = this.getViewportSize();

    return {
      x: (canvasX - vp.width / 2) / this.zoom + this.x,
      y: (canvasY - vp.height / 2) / this.zoom + this.y
    };
  }

  /**
   * Convert World coordinate to Screen coordinate
   * @param {number} worldX
   * @param {number} worldY
   * @returns {{x: number, y: number}}
   */
  worldToScreen(worldX, worldY) {
    const vp = this.getViewportSize();
    return {
      x: (worldX - this.x) * this.zoom + vp.width / 2,
      y: (worldY - this.y) * this.zoom + vp.height / 2
    };
  }

  /**
   * Apply transform to canvas 2D rendering context
   * @param {CanvasRenderingContext2D} ctx
   */
  applyTransform(ctx) {
    const vp = this.getViewportSize();
    ctx.translate(vp.width / 2, vp.height / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  /**
   * Zoom centered at a specific screen coordinate
   * @param {number} deltaZoom - Positive to zoom in, negative to zoom out
   * @param {number} screenX - Cursor screen X (e.clientX)
   * @param {number} screenY - Cursor screen Y (e.clientY)
   */
  zoomAt(deltaZoom, screenX, screenY) {
    const worldBefore = this.screenToWorld(screenX, screenY);

    const newZoom = Math.min(
      CANVAS_CONFIG.MAX_ZOOM,
      Math.max(CANVAS_CONFIG.MIN_ZOOM, this.zoom * (1 + deltaZoom))
    );

    if (newZoom === this.zoom) return;
    this.zoom = newZoom;

    // Adjust camera position so world coordinate under cursor stays static
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    const vp = this.getViewportSize();

    this.x = worldBefore.x - (canvasX - vp.width / 2) / this.zoom;
    this.y = worldBefore.y - (canvasY - vp.height / 2) / this.zoom;
  }

  /**
   * Pan the camera by screen pixel delta
   * @param {number} deltaScreenX
   * @param {number} deltaScreenY
   */
  pan(deltaScreenX, deltaScreenY) {
    this.x -= deltaScreenX / this.zoom;
    this.y -= deltaScreenY / this.zoom;
  }

  /**
   * Auto-fit camera to enclose all nodes with margin
   * @param {Map<string, Object>} nodes
   */
  fitToContent(nodes) {
    if (!nodes || nodes.size === 0) {
      this.x = 0;
      this.y = 0;
      this.zoom = 1.0;
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes.values()) {
      minX = Math.min(minX, node.x - 20);
      minY = Math.min(minY, node.y - 20);
      maxX = Math.max(maxX, node.x + CANVAS_CONFIG.NODE_WIDTH + 20);
      maxY = Math.max(maxY, node.y + CANVAS_CONFIG.NODE_HEIGHT + 20);
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    this.x = (minX + maxX) / 2;
    this.y = (minY + maxY) / 2;

    const vp = this.getViewportSize();
    const padding = 120;
    const zoomX = (vp.width - padding) / Math.max(100, contentWidth);
    const zoomY = (vp.height - padding) / Math.max(100, contentHeight);

    this.zoom = Math.min(1.2, Math.max(0.4, Math.min(zoomX, zoomY)));
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
  }
}
