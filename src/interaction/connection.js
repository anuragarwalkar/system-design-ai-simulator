/**
 * ==============================================================================
 * Connection Interaction Handler (Port-to-Port Wiring)
 * ==============================================================================
 * Manages port snapping, wire stretching preview, connection validation,
 * protocol assignment, and edge creation commands.
 */

import { stateManager } from '../core/state-manager.js';
import { historyManager } from '../core/history-manager.js';
import { CANVAS_CONFIG } from '../core/constants.js';

export class ConnectionHandler {
  constructor(canvasRenderer) {
    this.renderer = canvasRenderer;
    this.canvas = canvasRenderer.canvas;
    this.camera = canvasRenderer.camera;
    this.nodeRenderer = canvasRenderer.nodeRenderer;

    this.activeWire = null;
    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
    window.addEventListener('mouseup', (e) => this._onMouseUp(e));
  }

  _onMouseMove(e) {
    const world = this.camera.screenToWorld(e.clientX, e.clientY);

    // 1. If currently stretching a wire
    if (this.activeWire) {
      this.activeWire.currentX = world.x;
      this.activeWire.currentY = world.y;
      this.renderer.connectingWire = this.activeWire;
      return;
    }

    // 2. Otherwise check for port hovering
    const hovered = this._findPortNear(world.x, world.y, 14);
    if (hovered !== this.renderer.hoveredPort) {
      this.renderer.hoveredPort = hovered;
      this.canvas.style.cursor = hovered ? 'crosshair' : 'default';
    }
  }

  _onMouseDown(e) {
    if (e.button !== 0) return; // Left click only

    const world = this.camera.screenToWorld(e.clientX, e.clientY);
    const port = this._findPortNear(world.x, world.y, 14);

    if (port) {
      e.stopPropagation();
      this.activeWire = {
        startX: port.x,
        startY: port.y,
        currentX: port.x,
        currentY: port.y,
        sourceNodeId: port.nodeId,
        sourceSide: port.side
      };
      this.renderer.connectingWire = this.activeWire;
    }
  }

  _onMouseUp(e) {
    if (!this.activeWire) return;

    const world = this.camera.screenToWorld(e.clientX, e.clientY);
    const targetNode = this._findNodeAt(world.x, world.y);

    if (targetNode && targetNode.id !== this.activeWire.sourceNodeId) {
      const fromId = this.activeWire.sourceNodeId;
      const toId = targetNode.id;

      let createdEdgeId = null;
      historyManager.execute({
        description: `Connect ${fromId} -> ${toId}`,
        execute: () => {
          const edge = stateManager.addEdge({
            from: fromId,
            to: toId,
            protocol: 'HTTP/REST'
          });
          if (edge) createdEdgeId = edge.id;
        },
        undo: () => {
          if (createdEdgeId) stateManager.removeEdge(createdEdgeId);
        }
      });
    }

    this.activeWire = null;
    this.renderer.connectingWire = null;
    this.canvas.style.cursor = 'default';
  }

  _findPortNear(worldX, worldY, maxDist = 14) {
    for (const node of stateManager.nodes.values()) {
      const ports = this.nodeRenderer.getNodePorts(node);
      for (const p of ports) {
        if (Math.hypot(worldX - p.x, worldY - p.y) <= maxDist) {
          return p;
        }
      }
    }
    return null;
  }

  _findNodeAt(worldX, worldY) {
    const w = CANVAS_CONFIG.NODE_WIDTH;
    const h = CANVAS_CONFIG.NODE_HEIGHT;

    for (const node of Array.from(stateManager.nodes.values()).reverse()) {
      if (worldX >= node.x && worldX <= node.x + w && worldY >= node.y && worldY <= node.y + h) {
        return node;
      }
    }
    return null;
  }
}
