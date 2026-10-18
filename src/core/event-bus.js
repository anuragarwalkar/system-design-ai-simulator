/**
 * ==============================================================================
 * EventBus - Observer Pattern Implementation
 * ==============================================================================
 * Central decoupled pub/sub message broker. Modules never call each other
 * directly; they publish events and subscribe to state changes. This ensures
 * clean modularity, high testability, and isolated failure boundaries.
 */

export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
  }

  /**
   * Subscribe a callback to an event
   * @param {string} event - Event identifier
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe teardown function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return cleanup closure
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe a callback from an event
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Subscribe to an event exactly once
   * @param {string} event
   * @param {Function} callback
   */
  once(event, callback) {
    const wrapper = (payload) => {
      this.off(event, wrapper);
      callback(payload);
    };
    this.on(event, wrapper);
  }

  /**
   * Broadcast an event and payload to all subscribed listeners
   * @param {string} event
   * @param {*} [payload]
   */
  emit(event, payload) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      // Iterate over a cloned snapshot to avoid mutation issues during handler execution
      for (const handler of Array.from(handlers)) {
        try {
          handler(payload);
        } catch (error) {
          console.error(`[EventBus] Error in handler for event "${event}":`, error);
        }
      }
    }
  }

  /**
   * Remove all listeners across all events
   */
  clear() {
    this.listeners.clear();
  }
}

// Global shared singleton instance
export const eventBus = new EventBus();
