/**
 * ==============================================================================
 * System Design Interview Scenarios (Sorted Low to High Difficulty)
 * ==============================================================================
 * Comprehensive pre-built production architectures for mastering system design.
 * Includes complete graph layouts, edge connections, node configs, target loads,
 * and architectural evaluation criteria.
 */

import { COMPONENT_TYPES } from '../core/constants.js';

export const SCENARIOS = [
  // ----------------------------------------------------------------------------
  // 1. URL SHORTENER (EASY)
  // ----------------------------------------------------------------------------
  {
    id: 'url-shortener',
    title: 'URL Shortener (Bitly)',
    difficulty: 'Easy',
    difficultyRank: 1,
    tag: 'Read-Heavy Caching',
    description: 'Design a high-scale service that generates 7-character aliases for long URLs with high read:write ratio (100:1) and sub-10ms redirection.',
    targetRps: 120000,
    readWriteRatio: 0.99,
    learningObjectives: [
      'Base62 encoding vs MD5/SHA256 hashing',
      'Read-heavy cache-aside pattern with Redis',
      'Database sharding based on short key hash',
      '301 Permanent vs 302 Temporary redirects'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Global Users', component_type: COMPONENT_TYPES.CLIENT, x: 280, y: 40 },
        { id: 'lb1', name: 'Cloudflare Edge LB', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 280, y: 180, config: { lb_algorithm: 'Round Robin' } },
        { id: 'gw1', name: 'API Gateway', component_type: COMPONENT_TYPES.API_GATEWAY, x: 280, y: 320 },
        { id: 's1', name: 'Redirect Service A', component_type: COMPONENT_TYPES.MICROSERVICE, x: 140, y: 460, config: { instances: 4 } },
        { id: 's2', name: 'Redirect Service B', component_type: COMPONENT_TYPES.MICROSERVICE, x: 420, y: 460, config: { instances: 4 } },
        { id: 'cache1', name: 'Redis URL Cache', component_type: COMPONENT_TYPES.CACHE, x: 140, y: 600, config: { eviction_policy: 'LRU', max_memory_mb: 8192, cache_hit_ratio: 0.92 } },
        { id: 'db1', name: 'PostgreSQL URL Store', component_type: COMPONENT_TYPES.DATABASE, x: 420, y: 600, config: { db_type: 'SQL Relational', read_replicas: 3, sharding_strategy: 'Hash' } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'lb1', protocol: 'HTTPS' },
        { id: 'e2', from: 'lb1', to: 'gw1', protocol: 'HTTP/2' },
        { id: 'e3', from: 'gw1', to: 's1', protocol: 'gRPC' },
        { id: 'e4', from: 'gw1', to: 's2', protocol: 'gRPC' },
        { id: 'e5', from: 's1', to: 'cache1', protocol: 'Redis TCP' },
        { id: 'e6', from: 's2', to: 'cache1', protocol: 'Redis TCP' },
        { id: 'e7', from: 'cache1', to: 'db1', protocol: 'Postgres wire' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 2. PASTEBIN (EASY)
  // ----------------------------------------------------------------------------
  {
    id: 'pastebin',
    title: 'Pastebin / Text Storage',
    difficulty: 'Easy',
    difficultyRank: 2,
    tag: 'Object Storage & TTL',
    description: 'Design a text-sharing platform where users paste snippets, receive a unique shareable URL, and snippets automatically expire after a specified TTL.',
    targetRps: 60000,
    readWriteRatio: 0.90,
    learningObjectives: [
      'Storing metadata in SQL vs raw paste text in Object Storage (S3)',
      'CDN caching for viral or frequently viewed text pastes',
      'Scheduled cleanup worker vs TTL-based lazy expiration'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Web / API Clients', component_type: COMPONENT_TYPES.CLIENT, x: 280, y: 40 },
        { id: 'cdn1', name: 'CloudFront CDN', component_type: COMPONENT_TYPES.CDN, x: 280, y: 170, config: { edge_cache_ratio: 0.80 } },
        { id: 'lb1', name: 'Application LB', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 280, y: 300 },
        { id: 's1', name: 'Paste Web Service', component_type: COMPONENT_TYPES.MICROSERVICE, x: 280, y: 440, config: { instances: 3 } },
        { id: 'cache1', name: 'Redis Hot Pastes', component_type: COMPONENT_TYPES.CACHE, x: 120, y: 580, config: { eviction_policy: 'LRU' } },
        { id: 'db1', name: 'Metadata DB (Postgres)', component_type: COMPONENT_TYPES.DATABASE, x: 440, y: 580, config: { db_type: 'SQL Relational' } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'cdn1', protocol: 'HTTPS' },
        { id: 'e2', from: 'cdn1', to: 'lb1', protocol: 'HTTPS' },
        { id: 'e3', from: 'lb1', to: 's1', protocol: 'HTTP/2' },
        { id: 'e4', from: 's1', to: 'cache1', protocol: 'Redis' },
        { id: 'e5', from: 's1', to: 'db1', protocol: 'SQL' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 3. RATE LIMITER (MEDIUM)
  // ----------------------------------------------------------------------------
  {
    id: 'rate-limiter',
    title: 'Distributed API Rate Limiter',
    difficulty: 'Medium',
    difficultyRank: 3,
    tag: 'Sliding Window & Token Bucket',
    description: 'Design a distributed rate limiter safeguarding downstream microservices against DoS attacks, API scraping, and quota exhaustion.',
    targetRps: 200000,
    readWriteRatio: 0.50,
    learningObjectives: [
      'Token bucket vs Leaky bucket vs Sliding window log algorithms',
      'Redis Lua scripts to achieve atomic check-and-increment operations',
      'Handling race conditions across distributed gateway instances'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'External API Consumers', component_type: COMPONENT_TYPES.CLIENT, x: 280, y: 40 },
        { id: 'lb1', name: 'Edge Load Balancer', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 280, y: 170 },
        { id: 'gw1', name: 'Kong API Gateway', component_type: COMPONENT_TYPES.API_GATEWAY, x: 280, y: 300 },
        { id: 'cache1', name: 'Redis Token Buckets', component_type: COMPONENT_TYPES.CACHE, x: 120, y: 440, config: { eviction_policy: 'Random', max_memory_mb: 4096 } },
        { id: 's1', name: 'Core Business API', component_type: COMPONENT_TYPES.MICROSERVICE, x: 440, y: 440, config: { instances: 5 } },
        { id: 'db1', name: 'Core DB', component_type: COMPONENT_TYPES.DATABASE, x: 440, y: 580 }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'lb1', protocol: 'HTTPS' },
        { id: 'e2', from: 'lb1', to: 'gw1', protocol: 'HTTP/2' },
        { id: 'e3', from: 'gw1', to: 'cache1', protocol: 'Atomic Lua' },
        { id: 'e4', from: 'gw1', to: 's1', protocol: 'Internal gRPC' },
        { id: 'e5', from: 's1', to: 'db1', protocol: 'SQL' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 4. CHAT APPLICATION (MEDIUM)
  // ----------------------------------------------------------------------------
  {
    id: 'chat-application',
    title: 'Chat Application (WhatsApp / Slack)',
    difficulty: 'Medium',
    difficultyRank: 4,
    tag: 'WebSockets & Fan-out',
    description: 'Design a real-time messaging system supporting 1-on-1 chats, group messaging, online presence indicators, and offline message synchronization.',
    targetRps: 180000,
    readWriteRatio: 0.60,
    learningObjectives: [
      'Maintaining persistent stateful WebSocket connections',
      'Message broker (Kafka/RabbitMQ) for group chat fan-out',
      'Cassandra or HBase for wide-column append-only message history',
      'Redis Pub/Sub or DynamoDB for user presence tracking'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Mobile / Web Chatters', component_type: COMPONENT_TYPES.CLIENT, x: 280, y: 40 },
        { id: 'lb1', name: 'NLB (TCP / WSS)', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 280, y: 170, config: { lb_algorithm: 'Consistent Hashing' } },
        { id: 's1', name: 'WebSocket Server Cluster', component_type: COMPONENT_TYPES.MICROSERVICE, x: 140, y: 310, config: { instances: 6 } },
        { id: 's2', name: 'Chat REST / Auth Service', component_type: COMPONENT_TYPES.MICROSERVICE, x: 420, y: 310, config: { instances: 3 } },
        { id: 'q1', name: 'Kafka Message Bus', component_type: COMPONENT_TYPES.MESSAGE_QUEUE, x: 140, y: 460, config: { queue_type: 'Kafka Log', partitions: 32 } },
        { id: 'cache1', name: 'Redis Presence Map', component_type: COMPONENT_TYPES.CACHE, x: 420, y: 460 },
        { id: 'db1', name: 'Cassandra Chat History', component_type: COMPONENT_TYPES.DATABASE, x: 280, y: 600, config: { db_type: 'NoSQL Document', sharding_strategy: 'Hash' } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'lb1', protocol: 'WSS / TCP' },
        { id: 'e2', from: 'lb1', to: 's1', protocol: 'WebSocket' },
        { id: 'e3', from: 'lb1', to: 's2', protocol: 'HTTPS' },
        { id: 'e4', from: 's1', to: 'q1', protocol: 'Kafka Producer' },
        { id: 'e5', from: 's1', to: 'cache1', protocol: 'In-Memory Key/Val' },
        { id: 'e6', from: 'q1', to: 'db1', protocol: 'Async Batch Write' },
        { id: 'e7', from: 's2', to: 'db1', protocol: 'CQL Read' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 5. NOTIFICATION SYSTEM (MEDIUM)
  // ----------------------------------------------------------------------------
  {
    id: 'notification-system',
    title: 'Scalable Notification System',
    difficulty: 'Medium',
    difficultyRank: 5,
    tag: 'Multi-Channel Priority Queuing',
    description: 'Design a distributed notification platform sending millions of push, SMS, and email alerts daily with deduplication, priority queues, and rate-limiting.',
    targetRps: 90000,
    readWriteRatio: 0.20,
    learningObjectives: [
      'Priority queues for transactional OTP vs promotional marketing alerts',
      'Idempotency keys to guarantee at-most-once delivery',
      'Third-party provider rate limits (APNs, FCM, Twilio, SendGrid)'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Internal Microservices', component_type: COMPONENT_TYPES.CLIENT, x: 280, y: 40 },
        { id: 'gw1', name: 'Notification Ingress Gateway', component_type: COMPONENT_TYPES.API_GATEWAY, x: 280, y: 170 },
        { id: 'cache1', name: 'Redis Idempotency Store', component_type: COMPONENT_TYPES.CACHE, x: 110, y: 310 },
        { id: 'q1', name: 'Kafka Priority Queues', component_type: COMPONENT_TYPES.MESSAGE_QUEUE, x: 280, y: 310, config: { partitions: 16 } },
        { id: 's1', name: 'Push Delivery Worker', component_type: COMPONENT_TYPES.MICROSERVICE, x: 120, y: 460, config: { instances: 4 } },
        { id: 's2', name: 'SMS & Email Worker', component_type: COMPONENT_TYPES.MICROSERVICE, x: 440, y: 460, config: { instances: 4 } },
        { id: 'db1', name: 'Notification Log DB', component_type: COMPONENT_TYPES.DATABASE, x: 280, y: 600, config: { db_type: 'NoSQL Document', read_replicas: 2 } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'gw1', protocol: 'Internal gRPC' },
        { id: 'e2', from: 'gw1', to: 'cache1', protocol: 'Deduplication' },
        { id: 'e3', from: 'gw1', to: 'q1', protocol: 'Queue Push' },
        { id: 'e4', from: 'q1', to: 's1', protocol: 'Kafka Consumer' },
        { id: 'e5', from: 'q1', to: 's2', protocol: 'Kafka Consumer' },
        { id: 'e6', from: 's1', to: 'db1', protocol: 'Audit Log' },
        { id: 'e7', from: 's2', to: 'db1', protocol: 'Audit Log' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 6. NEWS FEED / SOCIAL TIMELINE (HARD)
  // ----------------------------------------------------------------------------
  {
    id: 'news-feed',
    title: 'Social Timeline / News Feed (Twitter / Instagram)',
    difficulty: 'Hard',
    difficultyRank: 6,
    tag: 'Fan-out on Write vs Read',
    description: 'Design a personalized activity feed for 500 million active users. Balance real-time latency with celebrity accounts having tens of millions of followers.',
    targetRps: 250000,
    readWriteRatio: 0.95,
    learningObjectives: [
      'Fan-out on Write (push) for normal users vs Fan-out on Read (pull) for celebrities',
      'Redis in-memory timeline lists capped at 800 recent post IDs',
      'Ranking models combining recency, affinity, and engagement'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Mobile Users', component_type: COMPONENT_TYPES.CLIENT, x: 300, y: 30 },
        { id: 'cdn1', name: 'Cloudflare Edge', component_type: COMPONENT_TYPES.CDN, x: 300, y: 150 },
        { id: 'lb1', name: 'Global ALB', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 300, y: 270 },
        { id: 's1', name: 'Post Creation Service', component_type: COMPONENT_TYPES.MICROSERVICE, x: 120, y: 390, config: { instances: 4 } },
        { id: 's2', name: 'Timeline Read Service', component_type: COMPONENT_TYPES.MICROSERVICE, x: 480, y: 390, config: { instances: 8 } },
        { id: 'q1', name: 'Fan-out Worker Queue', component_type: COMPONENT_TYPES.MESSAGE_QUEUE, x: 120, y: 520 },
        { id: 'cache1', name: 'Redis User Timelines', component_type: COMPONENT_TYPES.CACHE, x: 300, y: 520, config: { eviction_policy: 'LRU', max_memory_mb: 32768, cache_hit_ratio: 0.95 } },
        { id: 'db1', name: 'Posts Distributed DB', component_type: COMPONENT_TYPES.DATABASE, x: 480, y: 640, config: { db_type: 'NoSQL Document', read_replicas: 4, sharding_strategy: 'Hash' } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'cdn1', protocol: 'HTTPS' },
        { id: 'e2', from: 'cdn1', to: 'lb1', protocol: 'HTTP/2' },
        { id: 'e3', from: 'lb1', to: 's1', protocol: 'POST /tweet' },
        { id: 'e4', from: 'lb1', to: 's2', protocol: 'GET /feed' },
        { id: 'e5', from: 's1', to: 'q1', protocol: 'Publish Post' },
        { id: 'e6', from: 'q1', to: 'cache1', protocol: 'Push to Followers' },
        { id: 'e7', from: 's2', to: 'cache1', protocol: 'Read Timeline' },
        { id: 'e8', from: 's2', to: 'db1', protocol: 'Hydrate Posts' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 7. VIDEO STREAMING SERVICE (HARD)
  // ----------------------------------------------------------------------------
  {
    id: 'streaming-service',
    title: 'Video Streaming (Netflix / YouTube)',
    difficulty: 'Hard',
    difficultyRank: 7,
    tag: 'Adaptive Bitrate & CDN Edge',
    description: 'Design a video streaming platform serving millions of concurrent streams globally. Optimize video encoding pipelines, adaptive bitrate chunking (HLS/DASH), and edge caching.',
    targetRps: 400000,
    readWriteRatio: 0.98,
    learningObjectives: [
      'Chunking video into 4-second segments at multiple resolutions (1080p, 720p, 480p)',
      'Multi-tiered CDN caching strategy (L1 Edge, L2 Regional POP, Origin Shield)',
      'Separate control plane (microservices + metadata) from data plane (blob CDN distribution)'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Global Video Viewers', component_type: COMPONENT_TYPES.CLIENT, x: 300, y: 30 },
        { id: 'cdn1', name: 'Multi-CDN Network (Akamai/Fastly)', component_type: COMPONENT_TYPES.CDN, x: 130, y: 170, config: { edge_cache_ratio: 0.94 } },
        { id: 'lb1', name: 'Control Plane LB', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 470, y: 170 },
        { id: 'gw1', name: 'API Gateway', component_type: COMPONENT_TYPES.API_GATEWAY, x: 470, y: 290 },
        { id: 's1', name: 'Video Transcoding Workers', component_type: COMPONENT_TYPES.MICROSERVICE, x: 130, y: 340, config: { instances: 12 } },
        { id: 's2', name: 'Metadata & User Service', component_type: COMPONENT_TYPES.MICROSERVICE, x: 470, y: 420, config: { instances: 5 } },
        { id: 'q1', name: 'Encoding Job Queue', component_type: COMPONENT_TYPES.MESSAGE_QUEUE, x: 130, y: 480 },
        { id: 'cache1', name: 'Redis Catalog Cache', component_type: COMPONENT_TYPES.CACHE, x: 300, y: 550 },
        { id: 'db1', name: 'Cassandra Video Catalog', component_type: COMPONENT_TYPES.DATABASE, x: 470, y: 570, config: { read_replicas: 4 } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'cdn1', protocol: 'HLS Chunk Request' },
        { id: 'e2', from: 'c1', to: 'lb1', protocol: 'HTTPS Auth & Catalog' },
        { id: 'e3', from: 'lb1', to: 'gw1', protocol: 'HTTP/2' },
        { id: 'e4', from: 'gw1', to: 's2', protocol: 'Internal gRPC' },
        { id: 'e5', from: 's2', to: 'q1', protocol: 'Transcode Job' },
        { id: 'e6', from: 'q1', to: 's1', protocol: 'Pull Chunk Task' },
        { id: 'e7', from: 's1', to: 'cdn1', protocol: 'Publish Chunks' },
        { id: 'e8', from: 's2', to: 'cache1', protocol: 'Catalog Cache' },
        { id: 'e9', from: 'cache1', to: 'db1', protocol: 'Fetch Catalog' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 8. DISTRIBUTED CACHE (HARD)
  // ----------------------------------------------------------------------------
  {
    id: 'distributed-cache',
    title: 'Distributed In-Memory Cache (Memcached / Redis Cluster)',
    difficulty: 'Hard',
    difficultyRank: 8,
    tag: 'Consistent Hashing & Gossip',
    description: 'Design a distributed in-memory key-value cache partitioning petabytes of data across 100+ nodes using consistent hashing, replication, and eviction policies.',
    targetRps: 500000,
    readWriteRatio: 0.85,
    learningObjectives: [
      'Consistent hashing with virtual nodes to avoid hot spots on node addition/removal',
      'Cache eviction policies: LRU, LFU, FIFO, 2Q',
      'Cache stampede / Thundering herd prevention with distributed mutexes or probabilistic early expiration'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Client App Servers', component_type: COMPONENT_TYPES.CLIENT, x: 280, y: 40 },
        { id: 'lb1', name: 'Consistent Hash Router', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 280, y: 170, config: { lb_algorithm: 'Consistent Hashing' } },
        { id: 'cache1', name: 'Cache Shard 1 (Master)', component_type: COMPONENT_TYPES.CACHE, x: 100, y: 320, config: { eviction_policy: 'LRU', max_memory_mb: 16384 } },
        { id: 'cache2', name: 'Cache Shard 2 (Master)', component_type: COMPONENT_TYPES.CACHE, x: 280, y: 320, config: { eviction_policy: 'LRU', max_memory_mb: 16384 } },
        { id: 'cache3', name: 'Cache Shard 3 (Master)', component_type: COMPONENT_TYPES.CACHE, x: 460, y: 320, config: { eviction_policy: 'LRU', max_memory_mb: 16384 } },
        { id: 'cache4', name: 'Cache Shard 1 (Replica)', component_type: COMPONENT_TYPES.CACHE, x: 100, y: 460 },
        { id: 'cache5', name: 'Cache Shard 2 (Replica)', component_type: COMPONENT_TYPES.CACHE, x: 280, y: 460 },
        { id: 'cache6', name: 'Cache Shard 3 (Replica)', component_type: COMPONENT_TYPES.CACHE, x: 460, y: 460 }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'lb1', protocol: 'TCP Wire' },
        { id: 'e2', from: 'lb1', to: 'cache1', protocol: 'Hash Ring Slot 0..5460' },
        { id: 'e3', from: 'lb1', to: 'cache2', protocol: 'Hash Ring Slot 5461..10922' },
        { id: 'e4', from: 'lb1', to: 'cache3', protocol: 'Hash Ring Slot 10923..16383' },
        { id: 'e5', from: 'cache1', to: 'cache4', protocol: 'Replication Stream' },
        { id: 'e6', from: 'cache2', to: 'cache5', protocol: 'Replication Stream' },
        { id: 'e7', from: 'cache3', to: 'cache6', protocol: 'Replication Stream' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 9. WEB CRAWLER & SEARCH ENGINE (EXPERT)
  // ----------------------------------------------------------------------------
  {
    id: 'search-engine',
    title: 'Web Crawler & Search Engine (Google)',
    difficulty: 'Expert',
    difficultyRank: 9,
    tag: 'Inverted Index & Distributed Crawl',
    description: 'Design a distributed search engine crawling billions of web pages, extracting text, calculating PageRank, building distributed inverted indexes, and serving queries in <50ms.',
    targetRps: 300000,
    readWriteRatio: 0.90,
    learningObjectives: [
      'URL frontier with politeness and priority queues',
      'Document parsing, deduplication via MinHash / SimHash',
      'Partitioning inverted index by Document ID vs Term ID'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Search Query Users', component_type: COMPONENT_TYPES.CLIENT, x: 440, y: 40 },
        { id: 'gw1', name: 'Search API Gateway', component_type: COMPONENT_TYPES.API_GATEWAY, x: 440, y: 170 },
        { id: 's1', name: 'Crawler Worker Pods', component_type: COMPONENT_TYPES.MICROSERVICE, x: 120, y: 170, config: { instances: 16 } },
        { id: 'q1', name: 'URL Frontier Queue', component_type: COMPONENT_TYPES.MESSAGE_QUEUE, x: 120, y: 310, config: { partitions: 64 } },
        { id: 's2', name: 'Index & Ranking Service', component_type: COMPONENT_TYPES.MICROSERVICE, x: 440, y: 310, config: { instances: 10 } },
        { id: 'cache1', name: 'Top Queries Cache', component_type: COMPONENT_TYPES.CACHE, x: 280, y: 440, config: { eviction_policy: 'LFU' } },
        { id: 'db1', name: 'Distributed Inverted Index', component_type: COMPONENT_TYPES.DATABASE, x: 440, y: 580, config: { sharding_strategy: 'Hash', read_replicas: 6 } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'gw1', protocol: 'HTTPS' },
        { id: 'e2', from: 'gw1', to: 's2', protocol: 'gRPC' },
        { id: 'e3', from: 's1', to: 'q1', protocol: 'Discovered Links' },
        { id: 'e4', from: 'q1', to: 's1', protocol: 'Next Fetch' },
        { id: 'e5', from: 's1', to: 's2', protocol: 'Extracted HTML' },
        { id: 'e6', from: 's2', to: 'cache1', protocol: 'Check Hot Cache' },
        { id: 'e7', from: 's2', to: 'db1', protocol: 'Index Lookup' }
      ]
    }
  },

  // ----------------------------------------------------------------------------
  // 10. RIDE-SHARING DISPATCH (EXPERT)
  // ----------------------------------------------------------------------------
  {
    id: 'uber-dispatch',
    title: 'Ride-Sharing Dispatch System (Uber / Lyft)',
    difficulty: 'Expert',
    difficultyRank: 10,
    tag: 'Geospatial Sharding & Matching',
    description: 'Design a real-time ride-matching platform tracking millions of drivers every 4 seconds, calculating geospatial proximity, dynamic surge pricing, and trip routing.',
    targetRps: 350000,
    readWriteRatio: 0.70,
    learningObjectives: [
      'Geohashing / Google S2 cells / Uber H3 hexagonal spatial indexing',
      'High-throughput driver location updates via lightweight UDP / WebSockets',
      'Dynamic matching engine using bipartite graph optimization',
      'Surge pricing computation using streaming sliding-window aggregations'
    ],
    graph: {
      nodes: [
        { id: 'c1', name: 'Riders & Drivers', component_type: COMPONENT_TYPES.CLIENT, x: 280, y: 30 },
        { id: 'lb1', name: 'Global GeoDNS / Anycast LB', component_type: COMPONENT_TYPES.LOAD_BALANCER, x: 280, y: 150 },
        { id: 'gw1', name: 'Edge API Gateway', component_type: COMPONENT_TYPES.API_GATEWAY, x: 280, y: 270 },
        { id: 's1', name: 'Location Tracking Ingest', component_type: COMPONENT_TYPES.MICROSERVICE, x: 110, y: 390, config: { instances: 8 } },
        { id: 's2', name: 'Dispatch & Matching Engine', component_type: COMPONENT_TYPES.MICROSERVICE, x: 450, y: 390, config: { instances: 8 } },
        { id: 'cache1', name: 'Redis H3 Hex Spatial Index', component_type: COMPONENT_TYPES.CACHE, x: 110, y: 530, config: { eviction_policy: 'LRU', max_memory_mb: 32768 } },
        { id: 'q1', name: 'Trip Events Kafka Bus', component_type: COMPONENT_TYPES.MESSAGE_QUEUE, x: 450, y: 530, config: { partitions: 32 } },
        { id: 'db1', name: 'Trips & Billing DB (Cassandra)', component_type: COMPONENT_TYPES.DATABASE, x: 280, y: 650, config: { db_type: 'NoSQL Document', read_replicas: 4, sharding_strategy: 'Hash' } }
      ],
      edges: [
        { id: 'e1', from: 'c1', to: 'lb1', protocol: 'TLS / WSS' },
        { id: 'e2', from: 'lb1', to: 'gw1', protocol: 'gRPC' },
        { id: 'e3', from: 'gw1', to: 's1', protocol: 'GPS Ping (4s)' },
        { id: 'e4', from: 'gw1', to: 's2', protocol: 'Ride Request' },
        { id: 'e5', from: 's1', to: 'cache1', protocol: 'Update Cell' },
        { id: 'e6', from: 's2', to: 'cache1', protocol: 'Query Neighbors' },
        { id: 'e7', from: 's2', to: 'q1', protocol: 'Match Created' },
        { id: 'e8', from: 'q1', to: 'db1', protocol: 'Persist Trip' }
      ]
    }
  }
];
