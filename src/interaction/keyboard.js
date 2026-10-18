/**
 * ==============================================================================
 * Keyboard Shortcuts Handler
 * ==============================================================================
 * Maps keyboard combinations to undo/redo, item deletion, selection clearing,
 * and quick viewport navigation.
 */

import { stateManager } from '../core/state-manager.js';
import { historyManager } from '../core/history-manager.js';

export class KeyboardHandler {
  constructor(dragDropEngine) {
    this.dragDrop = dragDropEngine;
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));
  }

  _onKeyDown(e) {
    // Ignore keystrokes when typing inside text inputs, textareas, or chat input
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // 1. Delete / Backspace
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (stateManager.selectedNodeId) {
        const nodeId = stateManager.selectedNodeId;
        const node = stateManager.nodes.get(nodeId);
        if (node) {
          e.preventDefault();
          // Snapshot connected edges for undo
          const connectedEdges = Array.from(stateManager.edges.values()).filter(
            edge => edge.from === nodeId || edge.to === nodeId
          );

          historyManager.execute({
            description: `Delete node ${node.name}`,
            execute: () => stateManager.removeNode(nodeId),
            undo: () => {
              stateManager.addNode(node);
              for (const edge of connectedEdges) {
                stateManager.addEdge(edge);
              }
            }
          });
        }
      } else if (stateManager.selectedEdgeId) {
        const edgeId = stateManager.selectedEdgeId;
        const edge = stateManager.edges.get(edgeId);
        if (edge) {
          e.preventDefault();
          historyManager.execute({
            description: `Delete edge`,
            execute: () => stateManager.removeEdge(edgeId),
            undo: () => stateManager.addEdge(edge)
          });
        }
      }
    }

    // 2. Undo: Ctrl+Z / Cmd+Z
    if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      historyManager.undo();
    }

    // 3. Redo: Ctrl+Y or Cmd+Shift+Z
    if ((cmdOrCtrl && e.key.toLowerCase() === 'y') || (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
      e.preventDefault();
      historyManager.redo();
    }

    // 4. Space bar pan mode
    if (e.code === 'Space' && !this.dragDrop.isSpacePanning) {
      this.dragDrop.isSpacePanning = true;
      this.dragDrop.canvas.style.cursor = 'grab';
    }

    // 5. Escape clears selection
    if (e.key === 'Escape') {
      stateManager.clearSelection();
      if (this.dragDrop.renderer.connectingWire) {
        this.dragDrop.renderer.connectingWire = null;
      }
    }
  }

  _onKeyUp(e) {
    if (e.code === 'Space') {
      this.dragDrop.isSpacePanning = false;
      this.dragDrop.canvas.style.cursor = 'default';
    }
  }
}
