/**
 * ==============================================================================
 * System Design AI Simulator - Constants & Configuration Tokens
 * ==============================================================================
 * Central repository for all shared enums, event names, default capacities,
 * node color accents, port offsets, and design tokens.
 */

export const COMPONENT_TYPES = {
  CLIENT: 'client',
  LOAD_BALANCER: 'load_balancer',
  API_GATEWAY: 'api_gateway',
  MICROSERVICE: 'microservice',
  CACHE: 'cache',
  DATABASE: 'database',
  MESSAGE_QUEUE: 'message_queue',
  CDN: 'cdn'
};

export const COMPONENT_METADATA = {
  [COMPONENT_TYPES.CLIENT]: {
    name: 'Client',
    description: 'User traffic source (Web, Mobile, IoT)',
    badge: 'Traffic Source',
    color: '#3B82F6', // Blue
    accentBg: 'rgba(59, 130, 246, 0.12)',
    icon: 'users',
    baseRps: 1000000,
    baseLatencyMs: 0,
    hourlyCost: 0.00
  },
  [COMPONENT_TYPES.LOAD_BALANCER]: {
    name: 'Load Balancer',
    description: 'Distributes traffic (L4/L7)',
    badge: 'Traffic Routing',
    color: '#10B981', // Emerald Green
    accentBg: 'rgba(16, 185, 129, 0.12)',
    icon: 'git-fork',
    baseRps: 150000,
    baseLatencyMs: 2.0,
    hourlyCost: 0.07
  },
  [COMPONENT_TYPES.API_GATEWAY]: {
    name: 'API Gateway',
    description: 'Auth, rate limiting, SSL & routing',
    badge: 'Ingress Gateway',
    color: '#8B5CF6', // Purple
    accentBg: 'rgba(139, 92, 246, 0.12)',
    icon: 'shield',
    baseRps: 80000,
    baseLatencyMs: 6.0,
    hourlyCost: 0.12
  },
  [COMPONENT_TYPES.MICROSERVICE]: {
    name: 'Server / Microservice',
    description: 'Backend app server, API logic & compute',
    badge: 'Compute Engine',
    color: '#F59E0B', // Amber
    accentBg: 'rgba(245, 158, 11, 0.12)',
    icon: 'cpu',
    baseRps: 8000,
    baseLatencyMs: 25.0,
    hourlyCost: 0.18
  },
  [COMPONENT_TYPES.CACHE]: {
    name: 'Cache',
    description: 'In-memory store (Redis / Memcached)',
    badge: 'In-Memory Store',
    color: '#EF4444', // Red / Rose
    accentBg: 'rgba(239, 68, 68, 0.12)',
    icon: 'zap',
    baseRps: 120000,
    baseLatencyMs: 3.0,
    hourlyCost: 0.22
  },
  [COMPONENT_TYPES.DATABASE]: {
    name: 'Database',
    description: 'Persistent storage (SQL / NoSQL)',
    badge: 'Storage',
    color: '#EC4899', // Pink
    accentBg: 'rgba(236, 72, 153, 0.12)',
    icon: 'database',
    baseRps: 3500,
    baseLatencyMs: 35.0,
    hourlyCost: 0.45
  },
  [COMPONENT_TYPES.MESSAGE_QUEUE]: {
    name: 'Message Queue',
    description: 'Asynchronous event stream (Kafka / SQS)',
    badge: 'Async Decoupler',
    color: '#F97316', // Orange
    accentBg: 'rgba(249, 115, 22, 0.12)',
    icon: 'layers',
    baseRps: 45000,
    baseLatencyMs: 8.0,
    hourlyCost: 0.15
  },
  [COMPONENT_TYPES.CDN]: {
    name: 'CDN',
    description: 'Edge caching (Cloudflare / CloudFront)',
    badge: 'Edge Network',
    color: '#06B6D4', // Cyan
    accentBg: 'rgba(6, 182, 212, 0.12)',
    icon: 'globe',
    baseRps: 500000,
    baseLatencyMs: 4.0,
    hourlyCost: 0.08
  }
};

export const EVENTS = {
  // Graph mutation events
  NODE_ADDED: 'graph:node_added',
  NODE_REMOVED: 'graph:node_removed',
  NODE_UPDATED: 'graph:node_updated',
  NODE_MOVED: 'graph:node_moved',
  EDGE_ADDED: 'graph:edge_added',
  EDGE_REMOVED: 'graph:edge_removed',
  GRAPH_CLEARED: 'graph:cleared',
  GRAPH_LOADED: 'graph:loaded',

  // Selection events
  SELECTION_CHANGED: 'selection:changed',

  // Simulation events
  SIM_CONFIG_CHANGED: 'sim:config_changed',
  SIM_STARTED: 'sim:started',
  SIM_PAUSED: 'sim:paused',
  SIM_TICK: 'sim:tick',
  SIM_METRICS_UPDATED: 'sim:metrics_updated',

  // Analysis events
  ANALYSIS_UPDATED: 'analysis:updated',

  // UI & Theme
  THEME_CHANGED: 'ui:theme_changed',
  PANEL_TOGGLED: 'ui:panel_toggled',
  SCENARIO_SELECTED: 'scenario:selected',

  // AI Agent events
  AI_STATUS_CHANGED: 'ai:status_changed',
  AI_MESSAGE_ADDED: 'ai:message_added',
  AI_TOOL_EXECUTING: 'ai:tool_executing'
};

export const CANVAS_CONFIG = {
  NODE_WIDTH: 180,
  NODE_HEIGHT: 96,
  BORDER_RADIUS: 12,
  PORT_RADIUS: 5,
  GRID_SPACING: 24,
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 2.50,
  ZOOM_SPEED: 0.0015
};

export const TRAFFIC_PROFILES = {
  CONSTANT: 'Constant',
  SPIKE: 'Spike',
  SINUSOIDAL: 'Sinusoidal',
  STRESS_TEST: 'Stress Test'
};
