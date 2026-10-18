/**
 * ==============================================================================
 * History Manager (Command Pattern)
 * ==============================================================================
 * Manages reversible graph mutation commands for high-fidelity Undo/Redo.
 * Every user edit encapsulates an `execute()` and `undo()` routine.
 */

import { stateManager } from './state-manager.js';

export class HistoryManager {
  constructor(maxHistory = 50) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = maxHistory;
  }

  /**
   * Execute a command and push it to the undo stack
   * @param {Object} command - { execute: Function, undo: Function, description: string }
   */
  execute(command) {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Clear redo history on new action
    this.redoStack = [];
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.undoStack.length === 0) return false;
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
    return true;
  }

  /**
   * Redo previously undone action
   */
  redo() {
    if (this.redoStack.length === 0) return false;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
    return true;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

export const historyManager = new HistoryManager();
