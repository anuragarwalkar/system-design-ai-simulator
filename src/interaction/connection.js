/**
 * ==============================================================================
 * Connection Interaction Handler (Port-to-Port Wiring)
 * ==============================================================================
 * High-precision wiring engine supporting both:
 * 1. Drag-to-Connect (Click port -> hold & drag -> release on target node/port)
 * 2. Click-to-Connect (Click port -> move cursor -> click target node/port)
 *
 * Features generous 24px port hit targets, magnetic snapping, visual candidate
 * highlighting, and instant undoable history recording.
 */

import { stateManager } from '../core/state-manager.js';
import { historyManager } from '../core/history-manager.js';
import { CANVAS_CONFIG } from '../core/constants.js';
import { showToast } from '../components/ui/dialog.js';

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

    // Cancel wire on Escape key or right click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeWire) {
        this._cancelWire();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      if (this.activeWire) {
        e.preventDefault();
        this._cancelWire();
      }
    });
  }

  _onMouseMove(e) {
    const world = this.camera.screenToWorld(e.clientX, e.clientY);

    // 1. If currently stretching a wire
    if (this.activeWire) {
      const screenDist = Math.hypot(
        e.clientX - this.activeWire.startScreenX,
        e.clientY - this.activeWire.startScreenY
      );
      if (screenDist > 5) {
        this.activeWire.dragged = true;
      }

      // Check for target node or port
      const target = this._findTargetNodeOrPortNear(world.x, world.y);

      if (target && target.node.id !== this.activeWire.sourceNodeId) {
        this.renderer.hoveredTargetNodeId = target.node.id;

        // Magnetically snap wire end to target port if near, or target node boundary
        if (target.port) {
          this.activeWire.currentX = target.port.x;
          this.activeWire.currentY = target.port.y;
        } else {
          this.activeWire.currentX = world.x;
          this.activeWire.currentY = world.y;
        }
        this.canvas.style.cursor = 'pointer';
      } else {
        this.renderer.hoveredTargetNodeId = null;
        this.activeWire.currentX = world.x;
        this.activeWire.currentY = world.y;
        this.canvas.style.cursor = 'crosshair';
      }

      this.renderer.connectingWire = this.activeWire;
      return;
    }

    // 2. Not stretching a wire: check for port hovering
    const hovered = this._findPortNear(world.x, world.y, 22);
    if (hovered !== this.renderer.hoveredPort) {
      this.renderer.hoveredPort = hovered;
      this.canvas.style.cursor = hovered ? 'crosshair' : 'default';
    }
  }

  _onMouseDown(e) {
    if (e.button !== 0) return; // Left click only

    const world = this.camera.screenToWorld(e.clientX, e.clientY);

    // Mode A: Already have an active wire (Click-to-Connect Mode)
    if (this.activeWire) {
      const target = this._findTargetNodeOrPortNear(world.x, world.y);

      if (target && target.node.id !== this.activeWire.sourceNodeId) {
        this._completeConnection(this.activeWire.sourceNodeId, target.node.id);
      } else {
        // Clicked empty background: cancel wire
        this._cancelWire();
      }
      return;
    }

    // Mode B: Start new wire from port
    const port = this._findPortNear(world.x, world.y, 24);
    if (port) {
      e.stopPropagation();
      this.activeWire = {
        startX: port.x,
        startY: port.y,
        currentX: port.x,
        currentY: port.y,
        sourceNodeId: port.nodeId,
        sourceSide: port.side,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        dragged: false
      };
      this.renderer.connectingWire = this.activeWire;
      this.canvas.style.cursor = 'crosshair';
    }
  }

  _onMouseUp(e) {
    if (!this.activeWire) return;

    // If user dragged and released over a destination
    if (this.activeWire.dragged) {
      const world = this.camera.screenToWorld(e.clientX, e.clientY);
      const target = this._findTargetNodeOrPortNear(world.x, world.y);

      if (target && target.node.id !== this.activeWire.sourceNodeId) {
        this._completeConnection(this.activeWire.sourceNodeId, target.node.id);
      } else {
        this._cancelWire();
      }
    }
    // If user clicked port without dragging (dragged === false),
    // we keep this.activeWire active in Click-to-Connect mode!
  }

  _completeConnection(fromId, toId) {
    const fromNode = stateManager.nodes.get(fromId);
    const toNode = stateManager.nodes.get(toId);

    if (fromNode && toNode) {
      let createdEdgeId = null;

      historyManager.execute({
        description: `Connect ${fromNode.name} -> ${toNode.name}`,
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

      showToast(`Connected ${fromNode.name} → ${toNode.name}`, 'success', 2200);
    }

    this._cancelWire();
  }

  _cancelWire() {
    this.activeWire = null;
    this.renderer.connectingWire = null;
    this.renderer.hoveredTargetNodeId = null;
    this.canvas.style.cursor = 'default';
  }

  /**
   * Find port within maxDist pixels
   */
  _findPortNear(worldX, worldY, maxDist = 22) {
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

  /**
   * Find target node or port near mouse coordinates (with generous padding)
   */
  _findTargetNodeOrPortNear(worldX, worldY) {
    const sourceId = this.activeWire ? this.activeWire.sourceNodeId : null;

    // 1. Check if hovering near another node's port first
    for (const node of stateManager.nodes.values()) {
      if (node.id === sourceId) continue;
      const ports = this.nodeRenderer.getNodePorts(node);
      for (const p of ports) {
        if (Math.hypot(worldX - p.x, worldY - p.y) <= 26) {
          return { node, port: p };
        }
      }
    }

    // 2. Check if hovering inside or near another node card (+18px generous padding)
    const w = CANVAS_CONFIG.NODE_WIDTH;
    const h = CANVAS_CONFIG.NODE_HEIGHT;
    const pad = 18;

    for (const node of Array.from(stateManager.nodes.values()).reverse()) {
      if (node.id === sourceId) continue;
      if (
        worldX >= node.x - pad &&
        worldX <= node.x + w + pad &&
        worldY >= node.y - pad &&
        worldY <= node.y + h + pad
      ) {
        return { node, port: null };
      }
    }

    return null;
  }
}
