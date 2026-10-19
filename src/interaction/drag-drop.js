/**
 * ==============================================================================
 * Drag & Drop Interaction Engine
 * ==============================================================================
 * Handles dragging components from the HTML palette onto the canvas,
 * dragging existing nodes to reposition them, and snapping to grid.
 */

import { stateManager } from '../core/state-manager.js';
import { CANVAS_CONFIG } from '../core/constants.js';
import { historyManager } from '../core/history-manager.js';

export class DragDropEngine {
  constructor(canvasRenderer) {
    this.renderer = canvasRenderer;
    this.canvas = canvasRenderer.canvas;
    this.camera = canvasRenderer.camera;

    this.draggedNode = null;
    this.dragStartWorldX = 0;
    this.dragStartWorldY = 0;
    this.initialNodeX = 0;
    this.initialNodeY = 0;
    this.hasMoved = false;

    this.isSpacePanning = false;

    // Mobile touch interaction states
    this.touchMode = null; // 'pan' | 'drag-node' | 'pinch'
    this.touchStartClientX = 0;
    this.touchStartClientY = 0;
    this.touchMoved = false;
    this.lastPinchDist = 0;
    this.lastPinchMidX = 0;
    this.lastPinchMidY = 0;

    this._bindEvents();
  }

  _bindEvents() {
    // 1. Mouse down on canvas
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));

    // 2. Mouse move on window (captures dragging outside canvas bounds)
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));

    // 3. Mouse up on window
    window.addEventListener('mouseup', (e) => this._onMouseUp(e));

    // 4. Mouse wheel for zooming
    this.canvas.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });

    // 5. HTML5 drag & drop from sidebar palette
    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    this.canvas.addEventListener('drop', (e) => this._onPaletteDrop(e));

    // 6. Mobile Touch gestures (Touch Pan, Drag Node, Pinch-to-Zoom)
    this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this._onTouchEnd(e), { passive: false });
    window.addEventListener('touchcancel', (e) => this._onTouchCancel(e), { passive: false });
  }

  _onMouseDown(e) {
    // Middle click or Space+Click initiates canvas panning
    if (e.button === 1 || this.isSpacePanning) {
      this.camera.isPanning = true;
      this.camera.lastPanX = e.clientX;
      this.camera.lastPanY = e.clientY;
      return;
    }

    if (e.button !== 0) return; // Only handle primary left click

    const world = this.camera.screenToWorld(e.clientX, e.clientY);

    // If clicking near a port or if a connection wire is active, let ConnectionHandler take priority!
    if (this._findPortNear(world.x, world.y, 20) || this.renderer.connectingWire) {
      return;
    }

    const clickedNode = this._findNodeAt(world.x, world.y);

    if (clickedNode) {
      this.draggedNode = clickedNode;
      this.dragStartWorldX = world.x;
      this.dragStartWorldY = world.y;
      this.initialNodeX = clickedNode.x;
      this.initialNodeY = clickedNode.y;
      this.hasMoved = false;
      stateManager.selectNode(clickedNode.id);
    } else {
      // Check if clicked an edge
      const clickedEdge = this._findEdgeAt(world.x, world.y);
      if (clickedEdge) {
        stateManager.selectEdge(clickedEdge.id);
      } else {
        // Clicked background: start pan or clear selection
        stateManager.clearSelection();
        this.camera.isPanning = true;
        this.camera.lastPanX = e.clientX;
        this.camera.lastPanY = e.clientY;
      }
    }
  }

  _onMouseMove(e) {
    // Canvas Pan
    if (this.camera.isPanning) {
      const dx = e.clientX - this.camera.lastPanX;
      const dy = e.clientY - this.camera.lastPanY;
      this.camera.pan(dx, dy);
      this.camera.lastPanX = e.clientX;
      this.camera.lastPanY = e.clientY;
      return;
    }

    // Node Drag
    if (this.draggedNode) {
      const world = this.camera.screenToWorld(e.clientX, e.clientY);
      const deltaX = world.x - this.dragStartWorldX;
      const deltaY = world.y - this.dragStartWorldY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.hasMoved = true;
      }

      // Snap to grid
      const rawX = this.initialNodeX + deltaX;
      const rawY = this.initialNodeY + deltaY;
      const snap = CANVAS_CONFIG.GRID_SPACING;
      const snappedX = Math.round(rawX / snap) * snap;
      const snappedY = Math.round(rawY / snap) * snap;

      stateManager.updateNodePosition(this.draggedNode.id, snappedX, snappedY);
    }
  }

  _onMouseUp(e) {
    if (this.camera.isPanning) {
      this.camera.isPanning = false;
    }

    if (this.draggedNode) {
      const nodeId = this.draggedNode.id;
      const fromX = this.initialNodeX;
      const fromY = this.initialNodeY;
      const toX = this.draggedNode.x;
      const toY = this.draggedNode.y;

      if (this.hasMoved && (fromX !== toX || fromY !== toY)) {
        // Record Move command for Undo/Redo
        historyManager.execute({
          description: `Move node ${this.draggedNode.name}`,
          execute: () => stateManager.updateNodePosition(nodeId, toX, toY),
          undo: () => stateManager.updateNodePosition(nodeId, fromX, fromY)
        });
      }

      this.draggedNode = null;
      this.hasMoved = false;
    }
  }

  _onWheel(e) {
    e.preventDefault();
    const zoomFactor = -e.deltaY * CANVAS_CONFIG.ZOOM_SPEED;
    this.camera.zoomAt(zoomFactor, e.clientX, e.clientY);
  }

  /* TOUCH GESTURE HANDLERS (Mobile Pan, Node Drag, Pinch-to-Zoom) */
  _onTouchStart(e) {
    // If a connection wire is active or user is touching near a port, allow ConnectionHandler priority
    if (this.renderer.connectingWire) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const world = this.camera.screenToWorld(touch.clientX, touch.clientY);

      // If near port, don't drag node or pan — connection handler will handle
      if (this._findPortNear(world.x, world.y, 26)) {
        return;
      }

      this.touchStartClientX = touch.clientX;
      this.touchStartClientY = touch.clientY;
      this.touchMoved = false;

      const clickedNode = this._findNodeAt(world.x, world.y);

      if (clickedNode) {
        this.touchMode = 'drag-node';
        this.draggedNode = clickedNode;
        this.dragStartWorldX = world.x;
        this.dragStartWorldY = world.y;
        this.initialNodeX = clickedNode.x;
        this.initialNodeY = clickedNode.y;
        this.hasMoved = false;
      } else {
        this.touchMode = 'pan';
        this.camera.isPanning = true;
        this.camera.lastPanX = touch.clientX;
        this.camera.lastPanY = touch.clientY;
      }
    } else if (e.touches.length === 2) {
      // 2-finger touch: Pinch-to-Zoom & Two-finger Pan
      e.preventDefault();
      this.touchMode = 'pinch';
      this.camera.isPanning = false;
      this.draggedNode = null;

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      this.lastPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      this.lastPinchMidX = (t1.clientX + t2.clientX) / 2;
      this.lastPinchMidY = (t1.clientY + t2.clientY) / 2;
    }
  }

  _onTouchMove(e) {
    if (this.touchMode === 'pinch' && e.touches.length >= 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      if (this.lastPinchDist > 0) {
        const deltaDist = currentDist - this.lastPinchDist;
        const zoomDelta = deltaDist / 200;
        this.camera.zoomAt(zoomDelta, midX, midY);

        // Also pan with pinch movement
        const panDx = midX - this.lastPinchMidX;
        const panDy = midY - this.lastPinchMidY;
        this.camera.pan(panDx, panDy);
      }

      this.lastPinchDist = currentDist;
      this.lastPinchMidX = midX;
      this.lastPinchMidY = midY;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const moveDist = Math.hypot(
        touch.clientX - this.touchStartClientX,
        touch.clientY - this.touchStartClientY
      );
      if (moveDist > 6) {
        this.touchMoved = true;
      }

      if (this.touchMode === 'pan' && this.camera.isPanning) {
        e.preventDefault();
        const dx = touch.clientX - this.camera.lastPanX;
        const dy = touch.clientY - this.camera.lastPanY;
        this.camera.pan(dx, dy);
        this.camera.lastPanX = touch.clientX;
        this.camera.lastPanY = touch.clientY;
        return;
      }

      if (this.touchMode === 'drag-node' && this.draggedNode) {
        e.preventDefault();
        const world = this.camera.screenToWorld(touch.clientX, touch.clientY);
        const deltaX = world.x - this.dragStartWorldX;
        const deltaY = world.y - this.dragStartWorldY;

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
          this.hasMoved = true;
        }

        const rawX = this.initialNodeX + deltaX;
        const rawY = this.initialNodeY + deltaY;
        const snap = CANVAS_CONFIG.GRID_SPACING;
        const snappedX = Math.round(rawX / snap) * snap;
        const snappedY = Math.round(rawY / snap) * snap;

        stateManager.updateNodePosition(this.draggedNode.id, snappedX, snappedY);
      }
    }
  }

  _onTouchEnd(e) {
    if (this.touchMode === 'drag-node' && this.draggedNode) {
      const node = this.draggedNode;
      const nodeId = node.id;
      const fromX = this.initialNodeX;
      const fromY = this.initialNodeY;
      const toX = node.x;
      const toY = node.y;

      if (this.hasMoved && (fromX !== toX || fromY !== toY)) {
        historyManager.execute({
          description: `Move node ${node.name}`,
          execute: () => stateManager.updateNodePosition(nodeId, toX, toY),
          undo: () => stateManager.updateNodePosition(nodeId, fromX, fromY)
        });
      }

      // Tap on node (little or no movement) selects the node
      if (!this.touchMoved) {
        stateManager.selectNode(nodeId);
      }

      this.draggedNode = null;
      this.hasMoved = false;
    } else if (this.touchMode === 'pan') {
      this.camera.isPanning = false;

      // Tap on empty canvas or edge
      if (!this.touchMoved) {
        const world = this.camera.screenToWorld(this.touchStartClientX, this.touchStartClientY);
        const edge = this._findEdgeAt(world.x, world.y);
        if (edge) {
          stateManager.selectEdge(edge.id);
        } else {
          stateManager.clearSelection();
        }
      }
    }

    this.touchMode = null;
    this.touchMoved = false;
    this.lastPinchDist = 0;
  }

  _onTouchCancel() {
    this.camera.isPanning = false;
    this.draggedNode = null;
    this.touchMode = null;
    this.touchMoved = false;
    this.lastPinchDist = 0;
  }

  _onPaletteDrop(e) {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-component-type');
    const modelId = e.dataTransfer.getData('application/x-model-id') || null;
    if (!componentType) return;

    const world = this.camera.screenToWorld(e.clientX, e.clientY);
    const snap = CANVAS_CONFIG.GRID_SPACING;
    const x = Math.round((world.x - CANVAS_CONFIG.NODE_WIDTH / 2) / snap) * snap;
    const y = Math.round((world.y - CANVAS_CONFIG.NODE_HEIGHT / 2) / snap) * snap;

    const nodeSpec = {
      component_type: componentType,
      model_id: modelId,
      x,
      y
    };

    let createdNodeId = null;
    historyManager.execute({
      description: `Add ${componentType}`,
      execute: () => {
        const n = stateManager.addNode(nodeSpec);
        createdNodeId = n.id;
        stateManager.selectNode(n.id);
      },
      undo: () => {
        if (createdNodeId) stateManager.removeNode(createdNodeId);
      }
    });
  }

  _findNodeAt(worldX, worldY) {
    const w = CANVAS_CONFIG.NODE_WIDTH;
    const h = CANVAS_CONFIG.NODE_HEIGHT;

    // Search in reverse order so top-most node gets selected
    const nodes = Array.from(stateManager.nodes.values()).reverse();
    for (const node of nodes) {
      if (worldX >= node.x && worldX <= node.x + w && worldY >= node.y && worldY <= node.y + h) {
        return node;
      }
    }
    return null;
  }

  _findEdgeAt(worldX, worldY) {
    for (const edge of stateManager.edges.values()) {
      const fromNode = stateManager.nodes.get(edge.from);
      const toNode = stateManager.nodes.get(edge.to);
      if (!fromNode || !toNode) continue;

      const pts = this.renderer.edgeRenderer.calculateOptimalBezier(fromNode, toNode);
      // Sample 10 points along curve
      for (let t = 0.1; t <= 0.9; t += 0.1) {
        const x = Math.pow(1 - t, 3) * pts.startX + 3 * Math.pow(1 - t, 2) * t * pts.cp1X + 3 * (1 - t) * Math.pow(t, 2) * pts.cp2X + Math.pow(t, 3) * pts.endX;
        const y = Math.pow(1 - t, 3) * pts.startY + 3 * Math.pow(1 - t, 2) * t * pts.cp1Y + 3 * (1 - t) * Math.pow(t, 2) * pts.cp2Y + Math.pow(t, 3) * pts.endY;

        if (Math.hypot(worldX - x, worldY - y) < 14) {
          return edge;
        }
      }
    }
    return null;
  }

  _findPortNear(worldX, worldY, maxDist = 20) {
    for (const node of stateManager.nodes.values()) {
      const ports = this.renderer.nodeRenderer.getNodePorts(node);
      for (const p of ports) {
        if (Math.hypot(worldX - p.x, worldY - p.y) <= maxDist) {
          return p;
        }
      }
    }
    return null;
  }
}
