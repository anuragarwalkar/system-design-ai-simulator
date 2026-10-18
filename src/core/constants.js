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
    hourlyCost: 0.00,
    concept: {
      analogy: 'Customers arriving at a store or bank.',
      whatItDoes: 'Generates incoming HTTP/WebSocket traffic from mobile apps, web browsers, or IoT devices.',
      whenToUse: 'Starting point of every architecture diagram to represent end users.',
      keyTradeoffs: 'Traffic is unpredictable. Surges can cause spikes that crash downstream servers without rate limiting.',
      interviewTip: 'Always clarify client characteristics in interviews: DAU/MAU, read/write ratio, and geographic distribution.',
      industryExamples: 'iOS/Android App, React Web Browser, Smart TV, IoT Sensor'
    }
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
    hourlyCost: 0.07,
    concept: {
      analogy: 'A traffic cop or airport usher directing passengers to the shortest security line.',
      whatItDoes: 'Distributes incoming network traffic evenly across a pool of backend servers to prevent overload.',
      whenToUse: 'Whenever you have more than 1 server, or need high availability without single point of failure (SPOF).',
      keyTradeoffs: 'Algorithms like Round Robin ignore server CPU load; Weighted or Least Connections require health monitoring.',
      interviewTip: 'Distinguish L4 (transport layer, high speed TCP/UDP) vs L7 (application layer, path/header routing).',
      industryExamples: 'AWS ALB/NLB, NGINX, HAProxy, Envoy, Cloudflare'
    }
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
    hourlyCost: 0.12,
    concept: {
      analogy: 'The front desk security check-in at a corporate headquarters building.',
      whatItDoes: 'Handles authentication, JWT validation, rate limiting, SSL termination, and routes requests to microservices.',
      whenToUse: 'Single entry point for all client requests in a microservices architecture.',
      keyTradeoffs: 'Can become a performance bottleneck or SPOF if not scaled horizontally or cached properly.',
      interviewTip: 'Mention rate limiting (Token Bucket/Leaky Bucket) to protect internal microservices from DDoS or scraper traffic.',
      industryExamples: 'Kong, AWS API Gateway, Apigee, Traefik, KrakenD'
    }
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
    hourlyCost: 0.18,
    concept: {
      analogy: 'Specialized kitchen chefs who prepare specific dishes on the menu.',
      whatItDoes: 'Executes core business logic, transforms data, verifies rules, and talks to databases/caches.',
      whenToUse: 'When separating concerns (e.g., Auth Service, Payment Service, Feed Service) into scalable units.',
      keyTradeoffs: 'Stateless servers scale easily with auto-scaling groups, but distributed microservices add network latency and operational overhead.',
      interviewTip: 'Keep backend services stateless by offloading session data into Redis so any server can handle any request.',
      industryExamples: 'Node.js Express/Nest, Go Gin, Java Spring Boot, Python FastAPI, Docker / K8s pods'
    }
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
    hourlyCost: 0.22,
    concept: {
      analogy: 'Keeping your favorite book on your desk instead of walking to the library basement every time.',
      whatItDoes: 'Stores frequently requested data in fast RAM memory so reads return in milliseconds without hitting slow disks.',
      whenToUse: 'High read-to-write ratio systems (e.g. 100:1 reads vs writes), session storage, leaderboards.',
      keyTradeoffs: 'Cache invalidation is hard; risk of stale data. Needs eviction policies (LRU, LFU) and memory caps.',
      interviewTip: 'Always discuss Cache-Aside vs Write-Through strategies and how to avoid Cache Stampede (dog-piling).',
      industryExamples: 'Redis, Memcached, Dragonfly, AWS ElastiCache'
    }
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
    hourlyCost: 0.45,
    concept: {
      analogy: 'The bank safe vault that securely locks away physical ledgers forever.',
      whatItDoes: 'Provides reliable, persistent storage with ACID guarantees (SQL) or flexible horizontal scaling (NoSQL).',
      whenToUse: 'Storing ground-truth application data, user accounts, financial transactions, order histories.',
      keyTradeoffs: 'SQL offers ACID transactions and joins but is hard to scale horizontally; NoSQL scales easily but compromises consistency (CAP theorem).',
      interviewTip: 'Scale read-heavy databases using Read Replicas (Primary-Replica) and write-heavy databases using Horizontal Sharding.',
      industryExamples: 'PostgreSQL, MySQL, MongoDB, DynamoDB, Cassandra, CockroachDB'
    }
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
    hourlyCost: 0.15,
    concept: {
      analogy: 'The order ticket spindle at a restaurant where waiters pin tickets for the chef to cook when ready.',
      whatItDoes: 'Buffers tasks and events asynchronously so publishers and consumers operate independently without blocking.',
      whenToUse: 'Email notifications, video transcoding, payment processing, decoupling microservices, absorbing traffic spikes.',
      keyTradeoffs: 'Introduces eventual consistency and consumer lag; requires message deduplication (idempotency).',
      interviewTip: 'Highlight how queues absorb sudden traffic surges (load leveling) to prevent downstream database crashes.',
      industryExamples: 'Apache Kafka, RabbitMQ, AWS SQS, Apache Pulsar, Redis Streams'
    }
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
    hourlyCost: 0.08,
    concept: {
      analogy: 'A neighborhood convenience store carrying popular snacks so you don\'t drive to the regional factory.',
      whatItDoes: 'Caches static files (images, CSS, JS, video chunks) at Points of Presence (PoPs) physically close to users globally.',
      whenToUse: 'Global web applications, media streaming (YouTube/Netflix), lowering origin server bandwidth costs.',
      keyTradeoffs: 'Not suitable for dynamic, personalized user data; cache invalidation delays can cause users to see outdated assets.',
      interviewTip: 'Pair CDN with S3/Object Storage for static assets to shield your web servers from 80-90% of requests.',
      industryExamples: 'Cloudflare, AWS CloudFront, Fastly, Akamai'
    }
  }
};

export const PROTOCOLS_METADATA = {
  'HTTP/REST': {
    name: 'HTTP/1.1 REST',
    category: 'Application (Web)',
    latencyMs: 3.5,
    description: 'Standard request-response protocol. Simple, universal, and human-readable.',
    pros: 'Universal browser support, easy debugging, widespread caching support.',
    cons: 'Head-of-line blocking, verbose headers, higher latency than binary protocols.',
    bestFor: 'Public client-facing APIs, web endpoints, and third-party integrations.'
  },
  'HTTP/2': {
    name: 'HTTP/2',
    category: 'Application (Web)',
    latencyMs: 2.0,
    description: 'Multiplexed binary protocol over single TCP connection with header compression.',
    pros: 'Multiplexing eliminates head-of-line blocking, server push, header compression (HPACK).',
    cons: 'TCP packet loss stalls all multiplexed streams; more complex than HTTP/1.1.',
    bestFor: 'High-volume web client traffic to API Gateways and CDNs.'
  },
  'gRPC': {
    name: 'gRPC (Protobuf)',
    category: 'RPC (Inter-Service)',
    latencyMs: 1.2,
    description: 'High-performance binary RPC protocol built on HTTP/2 and Protocol Buffers.',
    pros: 'Extremely compact binary payload, strongly-typed contracts, bidirectional streaming.',
    cons: 'Not directly supported by standard web browsers without gRPC-Web proxy; binary payload is not human-readable.',
    bestFor: 'Internal microservice-to-microservice communication requiring sub-5ms latency.'
  },
  'WebSocket': {
    name: 'WebSocket',
    category: 'Real-Time Streaming',
    latencyMs: 1.5,
    description: 'Full-duplex persistent two-way TCP connection for instant bidirectional communication.',
    pros: 'Near-zero overhead after handshake, real-time push without polling.',
    cons: 'Stateful connections make load balancing and auto-scaling harder; requires sticky sessions or Redis pub/sub.',
    bestFor: 'Chat applications, live financial tickers, collaborative editing, gaming.'
  },
  'Redis TCP': {
    name: 'Redis RESP Protocol',
    category: 'In-Memory Key/Value',
    latencyMs: 0.8,
    description: 'Lightweight, simple text/binary serialization protocol optimized for ultra-fast RAM queries.',
    pros: 'Sub-millisecond latency, minimal parsing overhead, pipeline command batching.',
    cons: 'Requires dedicated driver, not general-purpose for arbitrary structured queries.',
    bestFor: 'Caching lookups, session token checks, rate limiter counters, pub/sub.'
  },
  'Kafka / AMQP': {
    name: 'Kafka / AMQP (Async)',
    category: 'Event Queue Protocol',
    latencyMs: 2.5,
    description: 'Asynchronous publish-subscribe messaging protocol designed for high-throughput stream ingestion.',
    pros: 'Asynchronous non-blocking publishing, persistent event log, massive batch throughput.',
    cons: 'Consumer latency depends on worker lag; eventual consistency required.',
    bestFor: 'Decoupling services, processing background tasks, audit logging, analytics pipelines.'
  },
  'Postgres wire': {
    name: 'SQL Wire Protocol',
    category: 'Relational Database',
    latencyMs: 4.0,
    description: 'Stateful database connection protocol supporting transactions, prepared statements, and connection pooling.',
    pros: 'ACID guarantees, rich query support, transactional rollback.',
    cons: 'Connection establishment overhead (requires pooling like PgBouncer), disk I/O bottlenecks.',
    bestFor: 'Primary application data stores requiring relational integrity.'
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
  EDGE_UPDATED: 'graph:edge_updated',
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
