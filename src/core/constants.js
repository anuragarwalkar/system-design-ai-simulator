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

export const COMPONENT_ICONS_SVG = {
  client: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  load_balancer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>`,
  api_gateway: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  microservice: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  cache: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  database: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  message_queue: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  cdn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
};

export const BRAND_PROVIDERS = {
  AWS: { name: 'AWS (Amazon Web Services)', shortName: 'AWS', color: '#FF9900', bg: 'rgba(255, 153, 0, 0.16)' },
  CLOUDFLARE: { name: 'Cloudflare', shortName: 'Cloudflare', color: '#F38020', bg: 'rgba(243, 128, 32, 0.16)' },
  GCP: { name: 'Google Cloud Platform', shortName: 'GCP', color: '#4285F4', bg: 'rgba(66, 133, 244, 0.16)' },
  OSS: { name: 'Open Source / Self-Hosted', shortName: 'OSS', color: '#10B981', bg: 'rgba(16, 185, 129, 0.16)' },
  REDIS: { name: 'Redis Labs', shortName: 'Redis', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.16)' },
  APACHE: { name: 'Apache Software', shortName: 'Apache', color: '#E11D48', bg: 'rgba(225, 29, 72, 0.16)' },
  CNCF: { name: 'Cloud Native (CNCF / K8s)', shortName: 'K8s', color: '#326CE5', bg: 'rgba(50, 108, 229, 0.16)' },
  FASTLY: { name: 'Fastly Edge', shortName: 'Fastly', color: '#FF282D', bg: 'rgba(255, 40, 45, 0.16)' },
  GENERIC: { name: 'Standard / Generic', shortName: 'Standard', color: '#64748B', bg: 'rgba(100, 116, 139, 0.16)' }
};

export const COMPONENT_MODELS = {
  [COMPONENT_TYPES.API_GATEWAY]: [
    {
      id: 'aws-api-gateway',
      name: 'Amazon API Gateway',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 100000,
      baseLatencyMs: 5.0,
      hourlyCost: 0.12,
      description: 'Fully managed AWS service for creating REST, HTTP, and WebSocket APIs at scale.',
      highlights: 'Direct AWS Lambda integration, AWS IAM & Cognito authorization, native CloudWatch metrics, built-in payload caching and token bucket throttling.'
    },
    {
      id: 'kong-gateway',
      name: 'Kong API Gateway',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 140000,
      baseLatencyMs: 2.0,
      hourlyCost: 0.10,
      description: 'Cloud-native, high-performance API gateway built on NGINX and OpenResty.',
      highlights: 'Ultra-low sub-2ms latency, rich Lua/Go plugin ecosystem for JWT, rate-limiting, transform plugins, and multi-cloud agnostic deployment.'
    },
    {
      id: 'cloudflare-workers',
      name: 'Cloudflare Workers (Edge Gateway)',
      brand: 'Cloudflare',
      brandInfo: BRAND_PROVIDERS.CLOUDFLARE,
      baseRps: 250000,
      baseLatencyMs: 1.5,
      hourlyCost: 0.08,
      description: 'Edge-compute serverless gateway running on V8 isolates in 300+ global data centers.',
      highlights: 'Executes routing logic within 5ms of 95% of world population, eliminates origin roundtrips, built-in DDoS shielding and edge KV cache.'
    },
    {
      id: 'google-apigee',
      name: 'Google Cloud Apigee',
      brand: 'GCP',
      brandInfo: BRAND_PROVIDERS.GCP,
      baseRps: 80000,
      baseLatencyMs: 6.0,
      hourlyCost: 0.18,
      description: 'Enterprise API management platform with deep AI analytics and developer portal.',
      highlights: 'Advanced threat protection, enterprise OAuth2/SAML governance, API monetization, and machine-learning anomaly detection.'
    },
    {
      id: 'envoy-gateway',
      name: 'Envoy Gateway (CNCF)',
      brand: 'CNCF',
      brandInfo: BRAND_PROVIDERS.CNCF,
      baseRps: 160000,
      baseLatencyMs: 1.2,
      hourlyCost: 0.09,
      description: 'Modern C++ service mesh ingress and edge gateway designed for Kubernetes environments.',
      highlights: 'Native gRPC, HTTP/3 QUIC, dynamic hot-reloading via xDS APIs, circuit breaking, and advanced distributed tracing.'
    }
  ],
  [COMPONENT_TYPES.LOAD_BALANCER]: [
    {
      id: 'aws-alb',
      name: 'AWS Application Load Balancer (ALB)',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 150000,
      baseLatencyMs: 2.0,
      hourlyCost: 0.07,
      description: 'Layer 7 application load balancer with URL path and host-based routing.',
      highlights: 'Native HTTP/2 & gRPC support, TLS offloading, integration with AWS WAF and ECS container target groups.'
    },
    {
      id: 'aws-nlb',
      name: 'AWS Network Load Balancer (NLB)',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 600000,
      baseLatencyMs: 0.4,
      hourlyCost: 0.08,
      description: 'Layer 4 ultra-high performance transport balancer handling millions of concurrent requests.',
      highlights: 'Sub-millisecond latency, static IP addresses per AZ, TCP/UDP pass-through, ideal for gaming and financial systems.'
    },
    {
      id: 'nginx-lb',
      name: 'NGINX Reverse Proxy & LB',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 200000,
      baseLatencyMs: 1.2,
      hourlyCost: 0.05,
      description: 'Industry-standard high-performance asynchronous event-driven reverse proxy.',
      highlights: 'Supports Least Connections, IP Hash, Round Robin, SSL termination, and static asset microcaching.'
    },
    {
      id: 'cloudflare-lb',
      name: 'Cloudflare Load Balancing',
      brand: 'Cloudflare',
      brandInfo: BRAND_PROVIDERS.CLOUDFLARE,
      baseRps: 400000,
      baseLatencyMs: 2.5,
      hourlyCost: 0.09,
      description: 'Global Anycast DNS load balancing and automatic multi-region failover.',
      highlights: 'Directs user traffic to the geographically nearest healthy origin data center; instant zero-downtime failover.'
    },
    {
      id: 'haproxy',
      name: 'HAProxy Enterprise',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 280000,
      baseLatencyMs: 0.8,
      hourlyCost: 0.06,
      description: 'Dedicated high-availability TCP/HTTP load balancer renowned for reliability.',
      highlights: 'Deep health-checking, granular queue management, connection rate limiting, and transparent proxying.'
    },
    {
      id: 'gcp-cloud-lb',
      name: 'Google Cloud Load Balancing',
      brand: 'GCP',
      brandInfo: BRAND_PROVIDERS.GCP,
      baseRps: 500000,
      baseLatencyMs: 1.5,
      hourlyCost: 0.08,
      description: 'Global Anycast external HTTP(S) proxy load balancer spanning Google\'s worldwide fiber network.',
      highlights: 'Single Anycast IP worldwide, integrated Cloud Armor DDoS/WAF protection, instant auto-scaling to millions of RPS without pre-warming.'
    },
    {
      id: 'traefik-proxy',
      name: 'Traefik Cloud Native Proxy',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 180000,
      baseLatencyMs: 1.4,
      hourlyCost: 0.05,
      description: 'Modern HTTP reverse proxy and load balancer designed for microservices and container orchestrators.',
      highlights: 'Automatic dynamic configuration discovery from Docker/K8s, Let\'s Encrypt automatic TLS certificates, built-in dashboard metrics.'
    }
  ],
  [COMPONENT_TYPES.CACHE]: [
    {
      id: 'redis-core',
      name: 'Redis In-Memory Key/Value',
      brand: 'Redis',
      brandInfo: BRAND_PROVIDERS.REDIS,
      baseRps: 130000,
      baseLatencyMs: 1.0,
      hourlyCost: 0.20,
      description: 'Single-threaded event-driven in-memory data store supporting strings, hashes, lists, sets, and sorted sets.',
      highlights: 'Sub-millisecond reads/writes, LRU/LFU memory eviction, Pub/Sub channels, Lua scripts, and atomic increments.'
    },
    {
      id: 'aws-elasticache',
      name: 'Amazon ElastiCache (Redis)',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 150000,
      baseLatencyMs: 1.2,
      hourlyCost: 0.25,
      description: 'Fully managed Redis service with automated Multi-AZ failover and cluster sharding.',
      highlights: 'Zero-management patching, automatic read-replica scaling across Availability Zones, encrypted at rest and in transit.'
    },
    {
      id: 'gcp-memorystore',
      name: 'Google Cloud Memorystore (Redis)',
      brand: 'GCP',
      brandInfo: BRAND_PROVIDERS.GCP,
      baseRps: 140000,
      baseLatencyMs: 1.1,
      hourlyCost: 0.24,
      description: 'Fully managed in-memory data store service for Redis on Google Cloud Platform.',
      highlights: 'Sub-millisecond latency, automated high availability with cross-zone failover, VPC peering security, Cloud Monitoring metrics.'
    },
    {
      id: 'memcached',
      name: 'Memcached Pure Cache',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 180000,
      baseLatencyMs: 0.7,
      hourlyCost: 0.15,
      description: 'Multi-threaded, high-concurrency simple string key-value in-memory cache.',
      highlights: 'Multi-core CPU scaling, slab allocator memory management, ideal for simple read-heavy HTML/JSON fragment caching.'
    },
    {
      id: 'dragonfly',
      name: 'Dragonfly Modern Memory DB',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 350000,
      baseLatencyMs: 0.6,
      hourlyCost: 0.22,
      description: 'Next-generation multi-threaded Redis alternative delivering 25x throughput per instance.',
      highlights: 'Thread-per-core shared-nothing architecture, scales up to 1TB RAM per single node without clustering complexity.'
    }
  ],
  [COMPONENT_TYPES.DATABASE]: [
    {
      id: 'postgres-aurora',
      name: 'Amazon Aurora (PostgreSQL)',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 8000,
      baseLatencyMs: 18.0,
      hourlyCost: 0.48,
      description: 'Cloud-native distributed relational database with 6-way storage replication across 3 AZs.',
      highlights: 'ACID transactions, complex SQL joins, up to 15 auto-scaling read replicas with sub-10ms replica lag.'
    },
    {
      id: 'gcp-cloud-spanner',
      name: 'Google Cloud Spanner',
      brand: 'GCP',
      brandInfo: BRAND_PROVIDERS.GCP,
      baseRps: 25000,
      baseLatencyMs: 8.0,
      hourlyCost: 0.90,
      description: 'Globally distributed relational database service providing external consistency and 99.999% SLA.',
      highlights: 'TrueTime atomic clock synchronization, unlimited horizontal SQL scale, zero maintenance downtime, automatic multi-region sharding.'
    },
    {
      id: 'dynamodb',
      name: 'Amazon DynamoDB',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 60000,
      baseLatencyMs: 4.0,
      hourlyCost: 0.35,
      description: 'Fully managed serverless NoSQL key-value and document database with single-digit millisecond latency.',
      highlights: 'Virtually unlimited horizontal auto-partitioning by Hash Key, global tables for multi-region replication, built-in TTL.'
    },
    {
      id: 'mongodb-atlas',
      name: 'MongoDB Atlas',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 12000,
      baseLatencyMs: 22.0,
      hourlyCost: 0.40,
      description: 'Distributed JSON/BSON document database with flexible schema and horizontal sharding.',
      highlights: 'Rich document queries, secondary indexes, aggregation pipeline, and replica set automated failover.'
    },
    {
      id: 'cockroachdb',
      name: 'CockroachDB Distributed SQL',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 15000,
      baseLatencyMs: 28.0,
      hourlyCost: 0.50,
      description: 'Resilient multi-cloud distributed SQL database providing serializable transactions without SPOF.',
      highlights: 'Raft consensus per range, multi-region survival of entire cloud data center outages, standard Postgres wire compatibility.'
    },
    {
      id: 'apache-cassandra',
      name: 'Apache Cassandra',
      brand: 'Apache',
      brandInfo: BRAND_PROVIDERS.APACHE,
      baseRps: 50000,
      baseLatencyMs: 12.0,
      hourlyCost: 0.42,
      description: 'Masterless wide-column distributed NoSQL database designed for write-heavy high-velocity workloads.',
      highlights: 'LSM-tree write architecture, peer-to-peer ring topology, tunable consistency (QUORUM/ONE/ALL), zero single point of failure.'
    }
  ],
  [COMPONENT_TYPES.MESSAGE_QUEUE]: [
    {
      id: 'apache-kafka',
      name: 'Apache Kafka (Event Stream)',
      brand: 'Apache',
      brandInfo: BRAND_PROVIDERS.APACHE,
      baseRps: 120000,
      baseLatencyMs: 4.0,
      hourlyCost: 0.28,
      description: 'Distributed append-only commit log capable of processing millions of events per second.',
      highlights: 'Partition-level order guarantees, consumer groups, replayable event retention on disk, event-driven microservices.'
    },
    {
      id: 'aws-sqs',
      name: 'Amazon SQS (Managed Queue)',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 40000,
      baseLatencyMs: 10.0,
      hourlyCost: 0.12,
      description: 'Fully managed distributed message queuing service with Standard and FIFO delivery.',
      highlights: 'Zero server maintenance, auto-scales automatically, dead-letter queues (DLQ), visibility timeouts.'
    },
    {
      id: 'rabbitmq',
      name: 'RabbitMQ (AMQP Broker)',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 55000,
      baseLatencyMs: 6.0,
      hourlyCost: 0.16,
      description: 'Erlang-based reliable message broker supporting complex routing patterns.',
      highlights: 'Direct, Topic, Fanout, and Headers exchanges, publisher confirms, acknowledgment-based guaranteed delivery.'
    },
    {
      id: 'redis-streams',
      name: 'Redis Streams',
      brand: 'Redis',
      brandInfo: BRAND_PROVIDERS.REDIS,
      baseRps: 90000,
      baseLatencyMs: 1.5,
      hourlyCost: 0.18,
      description: 'Lightweight in-memory append-only log data structure with consumer groups.',
      highlights: 'Sub-millisecond dispatch, minimal infrastructure footprint, radix-tree indexed event IDs.'
    }
  ],
  [COMPONENT_TYPES.CDN]: [
    {
      id: 'cloudflare-cdn',
      name: 'Cloudflare Edge CDN',
      brand: 'Cloudflare',
      brandInfo: BRAND_PROVIDERS.CLOUDFLARE,
      baseRps: 650000,
      baseLatencyMs: 3.0,
      hourlyCost: 0.08,
      description: 'Global Anycast network spanning 300+ cities with edge caching and tier-1 DDoS protection.',
      highlights: 'Argo Smart Routing, Polish image optimization, Brotli compression, edge SSL, and Web Application Firewall (WAF).'
    },
    {
      id: 'aws-cloudfront',
      name: 'Amazon CloudFront',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 550000,
      baseLatencyMs: 4.0,
      hourlyCost: 0.09,
      description: 'Global content delivery network deeply integrated with AWS S3, EC2, and Lambda@Edge.',
      highlights: 'Origin Shield caching tier, real-time logs to Kinesis, signed URLs/cookies for private video streaming.'
    },
    {
      id: 'fastly',
      name: 'Fastly Edge Cloud',
      brand: 'Fastly',
      brandInfo: BRAND_PROVIDERS.FASTLY,
      baseRps: 600000,
      baseLatencyMs: 2.5,
      hourlyCost: 0.11,
      description: 'Programmable edge cloud platform powered by customized Varnish (VCL) proxy caching.',
      highlights: 'Instant global cache purges in 150ms, real-time streaming logs, dynamic edge rendering.'
    },
    {
      id: 'akamai',
      name: 'Akamai Intelligent Edge',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 450000,
      baseLatencyMs: 4.5,
      hourlyCost: 0.14,
      description: 'Massive enterprise edge distribution network with over 350,000 servers in 130+ countries.',
      highlights: 'Adaptive media streaming, carrier-grade peering, enterprise zero-trust edge security.'
    }
  ],
  [COMPONENT_TYPES.MICROSERVICE]: [
    {
      id: 'aws-ecs-fargate',
      name: 'AWS ECS / Fargate (Container)',
      brand: 'AWS',
      brandInfo: BRAND_PROVIDERS.AWS,
      baseRps: 14000,
      baseLatencyMs: 22.0,
      hourlyCost: 0.22,
      description: 'Serverless container orchestration for Docker images without managing EC2 infrastructure.',
      highlights: 'Seamless task auto-scaling, VPC private networking, AWS Secrets Manager integration.'
    },
    {
      id: 'k8s-pods',
      name: 'Kubernetes Pods (EKS/GKE)',
      brand: 'CNCF',
      brandInfo: BRAND_PROVIDERS.CNCF,
      baseRps: 22000,
      baseLatencyMs: 18.0,
      hourlyCost: 0.25,
      description: 'Production container clusters with automated rollouts, self-healing, and service discovery.',
      highlights: 'Horizontal Pod Autoscaler (HPA), sidecar proxies, ConfigMaps, readiness/liveness health probes.'
    },
    {
      id: 'google-cloud-run',
      name: 'Google Cloud Run (Serverless)',
      brand: 'GCP',
      brandInfo: BRAND_PROVIDERS.GCP,
      baseRps: 16000,
      baseLatencyMs: 28.0,
      hourlyCost: 0.18,
      description: 'Managed serverless platform that automatically scales container requests from 0 to thousands.',
      highlights: 'Zero idle cost with scale-to-zero, fast cold-starts, automatic HTTPS certificates.'
    },
    {
      id: 'go-microservice',
      name: 'Go / Gin Compiled Server',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 38000,
      baseLatencyMs: 8.0,
      hourlyCost: 0.15,
      description: 'Statically compiled Go binary utilizing lightweight goroutines and high concurrency.',
      highlights: 'Sub-10ms response times, minimal RAM footprint (<30MB), high throughput per CPU core.'
    },
    {
      id: 'node-microservice',
      name: 'Node.js Express / NestJS',
      brand: 'OSS',
      brandInfo: BRAND_PROVIDERS.OSS,
      baseRps: 9000,
      baseLatencyMs: 24.0,
      hourlyCost: 0.18,
      description: 'V8 single-threaded non-blocking event-driven JavaScript/TypeScript backend.',
      highlights: 'Rich NPM package ecosystem, asynchronous I/O, rapid API prototyping, and WebSocket support.'
    }
  ],
  [COMPONENT_TYPES.CLIENT]: [
    {
      id: 'web-browser',
      name: 'Web Browser (React/Next.js)',
      brand: 'Standard',
      brandInfo: BRAND_PROVIDERS.GENERIC,
      baseRps: 1000000,
      baseLatencyMs: 0,
      hourlyCost: 0.00,
      description: 'Single-page applications (SPA) and server-side rendered web frontend traffic.',
      highlights: 'HTTP/HTTPS requests, WebSocket real-time connections, client-side session cookies.'
    },
    {
      id: 'mobile-app',
      name: 'Mobile App (iOS / Android)',
      brand: 'Standard',
      brandInfo: BRAND_PROVIDERS.GENERIC,
      baseRps: 1000000,
      baseLatencyMs: 0,
      hourlyCost: 0.00,
      description: 'Native mobile client apps operating on cellular 4G/5G and WiFi networks.',
      highlights: 'Variable network connectivity, exponential backoff retries, mobile push notification tokens.'
    },
    {
      id: 'iot-device',
      name: 'IoT Sensor Fleet',
      brand: 'Standard',
      brandInfo: BRAND_PROVIDERS.GENERIC,
      baseRps: 500000,
      baseLatencyMs: 0,
      hourlyCost: 0.00,
      description: 'Distributed network of smart meters, sensors, and connected hardware devices.',
      highlights: 'High-frequency telemetry data pings, MQTT and lightweight HTTP payloads.'
    },
    {
      id: 'b2b-webhook',
      name: 'B2B Partner Webhook / API',
      brand: 'Standard',
      brandInfo: BRAND_PROVIDERS.GENERIC,
      baseRps: 200000,
      baseLatencyMs: 0,
      hourlyCost: 0.00,
      description: 'External server-to-server API integrations, payment webhooks (Stripe), and cron jobs.',
      highlights: 'High batch payload volumes, HMAC signature verification, idempotent event delivery.'
    }
  ]
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
  NODE_WIDTH: 204,
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

/**
 * Retrieve unique brand providers available for a component type
 * @param {string} componentType
 * @returns {Array<{brand: string, name: string, shortName: string, color: string, bg: string}>}
 */
export function getComponentBrands(componentType) {
  const models = COMPONENT_MODELS[componentType] || [];
  const brands = [];
  const seen = new Set();
  for (const m of models) {
    if (m.brand && !seen.has(m.brand)) {
      seen.add(m.brand);
      brands.push({
        brand: m.brand,
        ...(m.brandInfo || BRAND_PROVIDERS.GENERIC)
      });
    }
  }
  return brands;
}

/**
 * Retrieve models for a component type, optionally filtered by brand
 * @param {string} componentType
 * @param {string} [brand]
 * @returns {Array<Object>}
 */
export function getModelsForBrand(componentType, brand = null) {
  const models = COMPONENT_MODELS[componentType] || [];
  if (!brand || brand === 'ALL') return models;
  return models.filter(m => m.brand === brand);
}

