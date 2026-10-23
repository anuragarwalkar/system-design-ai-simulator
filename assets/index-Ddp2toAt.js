(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();class oe{constructor(){this.listeners=new Map}on(e,t){return this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t),()=>this.off(e,t)}off(e,t){const s=this.listeners.get(e);s&&(s.delete(t),s.size===0&&this.listeners.delete(e))}once(e,t){const s=i=>{this.off(e,s),t(i)};this.on(e,s)}emit(e,t){const s=this.listeners.get(e);if(s)for(const i of Array.from(s))try{i(t)}catch(o){console.error(`[EventBus] Error in handler for event "${e}":`,o)}}clear(){this.listeners.clear()}}const y=new oe,h={CLIENT:"client",LOAD_BALANCER:"load_balancer",API_GATEWAY:"api_gateway",MICROSERVICE:"microservice",CACHE:"cache",DATABASE:"database",MESSAGE_QUEUE:"message_queue",CDN:"cdn"},W={[h.CLIENT]:{name:"Client",description:"User traffic source (Web, Mobile, IoT)",badge:"Traffic Source",color:"#3B82F6",accentBg:"rgba(59, 130, 246, 0.12)",icon:"users",baseRps:1e6,baseLatencyMs:0,hourlyCost:0,concept:{analogy:"Customers arriving at a store or bank.",whatItDoes:"Generates incoming HTTP/WebSocket traffic from mobile apps, web browsers, or IoT devices.",whenToUse:"Starting point of every architecture diagram to represent end users.",keyTradeoffs:"Traffic is unpredictable. Surges can cause spikes that crash downstream servers without rate limiting.",interviewTip:"Always clarify client characteristics in interviews: DAU/MAU, read/write ratio, and geographic distribution.",industryExamples:"iOS/Android App, React Web Browser, Smart TV, IoT Sensor"}},[h.LOAD_BALANCER]:{name:"Load Balancer",description:"Distributes traffic (L4/L7)",badge:"Traffic Routing",color:"#10B981",accentBg:"rgba(16, 185, 129, 0.12)",icon:"git-fork",baseRps:15e4,baseLatencyMs:2,hourlyCost:.07,concept:{analogy:"A traffic cop or airport usher directing passengers to the shortest security line.",whatItDoes:"Distributes incoming network traffic evenly across a pool of backend servers to prevent overload.",whenToUse:"Whenever you have more than 1 server, or need high availability without single point of failure (SPOF).",keyTradeoffs:"Algorithms like Round Robin ignore server CPU load; Weighted or Least Connections require health monitoring.",interviewTip:"Distinguish L4 (transport layer, high speed TCP/UDP) vs L7 (application layer, path/header routing).",industryExamples:"AWS ALB/NLB, NGINX, HAProxy, Envoy, Cloudflare"}},[h.API_GATEWAY]:{name:"API Gateway",description:"Auth, rate limiting, SSL & routing",badge:"Ingress Gateway",color:"#8B5CF6",accentBg:"rgba(139, 92, 246, 0.12)",icon:"shield",baseRps:8e4,baseLatencyMs:6,hourlyCost:.12,concept:{analogy:"The front desk security check-in at a corporate headquarters building.",whatItDoes:"Handles authentication, JWT validation, rate limiting, SSL termination, and routes requests to microservices.",whenToUse:"Single entry point for all client requests in a microservices architecture.",keyTradeoffs:"Can become a performance bottleneck or SPOF if not scaled horizontally or cached properly.",interviewTip:"Mention rate limiting (Token Bucket/Leaky Bucket) to protect internal microservices from DDoS or scraper traffic.",industryExamples:"Kong, AWS API Gateway, Apigee, Traefik, KrakenD"}},[h.MICROSERVICE]:{name:"Server / Microservice",description:"Backend app server, API logic & compute",badge:"Compute Engine",color:"#F59E0B",accentBg:"rgba(245, 158, 11, 0.12)",icon:"cpu",baseRps:8e3,baseLatencyMs:25,hourlyCost:.18,concept:{analogy:"Specialized kitchen chefs who prepare specific dishes on the menu.",whatItDoes:"Executes core business logic, transforms data, verifies rules, and talks to databases/caches.",whenToUse:"When separating concerns (e.g., Auth Service, Payment Service, Feed Service) into scalable units.",keyTradeoffs:"Stateless servers scale easily with auto-scaling groups, but distributed microservices add network latency and operational overhead.",interviewTip:"Keep backend services stateless by offloading session data into Redis so any server can handle any request.",industryExamples:"Node.js Express/Nest, Go Gin, Java Spring Boot, Python FastAPI, Docker / K8s pods"}},[h.CACHE]:{name:"Cache",description:"In-memory store (Redis / Memcached)",badge:"In-Memory Store",color:"#EF4444",accentBg:"rgba(239, 68, 68, 0.12)",icon:"zap",baseRps:12e4,baseLatencyMs:3,hourlyCost:.22,concept:{analogy:"Keeping your favorite book on your desk instead of walking to the library basement every time.",whatItDoes:"Stores frequently requested data in fast RAM memory so reads return in milliseconds without hitting slow disks.",whenToUse:"High read-to-write ratio systems (e.g. 100:1 reads vs writes), session storage, leaderboards.",keyTradeoffs:"Cache invalidation is hard; risk of stale data. Needs eviction policies (LRU, LFU) and memory caps.",interviewTip:"Always discuss Cache-Aside vs Write-Through strategies and how to avoid Cache Stampede (dog-piling).",industryExamples:"Redis, Memcached, Dragonfly, AWS ElastiCache"}},[h.DATABASE]:{name:"Database",description:"Persistent storage (SQL / NoSQL)",badge:"Storage",color:"#EC4899",accentBg:"rgba(236, 72, 153, 0.12)",icon:"database",baseRps:3500,baseLatencyMs:35,hourlyCost:.45,concept:{analogy:"The bank safe vault that securely locks away physical ledgers forever.",whatItDoes:"Provides reliable, persistent storage with ACID guarantees (SQL) or flexible horizontal scaling (NoSQL).",whenToUse:"Storing ground-truth application data, user accounts, financial transactions, order histories.",keyTradeoffs:"SQL offers ACID transactions and joins but is hard to scale horizontally; NoSQL scales easily but compromises consistency (CAP theorem).",interviewTip:"Scale read-heavy databases using Read Replicas (Primary-Replica) and write-heavy databases using Horizontal Sharding.",industryExamples:"PostgreSQL, MySQL, MongoDB, DynamoDB, Cassandra, CockroachDB"}},[h.MESSAGE_QUEUE]:{name:"Message Queue",description:"Asynchronous event stream (Kafka / SQS)",badge:"Async Decoupler",color:"#F97316",accentBg:"rgba(249, 115, 22, 0.12)",icon:"layers",baseRps:45e3,baseLatencyMs:8,hourlyCost:.15,concept:{analogy:"The order ticket spindle at a restaurant where waiters pin tickets for the chef to cook when ready.",whatItDoes:"Buffers tasks and events asynchronously so publishers and consumers operate independently without blocking.",whenToUse:"Email notifications, video transcoding, payment processing, decoupling microservices, absorbing traffic spikes.",keyTradeoffs:"Introduces eventual consistency and consumer lag; requires message deduplication (idempotency).",interviewTip:"Highlight how queues absorb sudden traffic surges (load leveling) to prevent downstream database crashes.",industryExamples:"Apache Kafka, RabbitMQ, AWS SQS, Apache Pulsar, Redis Streams"}},[h.CDN]:{name:"CDN",description:"Edge caching (Cloudflare / CloudFront)",badge:"Edge Network",color:"#06B6D4",accentBg:"rgba(6, 182, 212, 0.12)",icon:"globe",baseRps:5e5,baseLatencyMs:4,hourlyCost:.08,concept:{analogy:"A neighborhood convenience store carrying popular snacks so you don't drive to the regional factory.",whatItDoes:"Caches static files (images, CSS, JS, video chunks) at Points of Presence (PoPs) physically close to users globally.",whenToUse:"Global web applications, media streaming (YouTube/Netflix), lowering origin server bandwidth costs.",keyTradeoffs:"Not suitable for dynamic, personalized user data; cache invalidation delays can cause users to see outdated assets.",interviewTip:"Pair CDN with S3/Object Storage for static assets to shield your web servers from 80-90% of requests.",industryExamples:"Cloudflare, AWS CloudFront, Fastly, Akamai"}}},Q={client:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',load_balancer:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"/><path d="M12 12v3"/></svg>',api_gateway:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',microservice:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',cache:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',database:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',message_queue:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',cdn:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'},C={AWS:{name:"AWS (Amazon Web Services)",shortName:"AWS",color:"#FF9900",bg:"rgba(255, 153, 0, 0.16)"},CLOUDFLARE:{name:"Cloudflare",shortName:"Cloudflare",color:"#F38020",bg:"rgba(243, 128, 32, 0.16)"},GCP:{name:"Google Cloud Platform",shortName:"GCP",color:"#4285F4",bg:"rgba(66, 133, 244, 0.16)"},OSS:{name:"Open Source / Self-Hosted",shortName:"OSS",color:"#10B981",bg:"rgba(16, 185, 129, 0.16)"},REDIS:{name:"Redis Labs",shortName:"Redis",color:"#DC2626",bg:"rgba(220, 38, 38, 0.16)"},APACHE:{name:"Apache Software",shortName:"Apache",color:"#E11D48",bg:"rgba(225, 29, 72, 0.16)"},CNCF:{name:"Cloud Native (CNCF / K8s)",shortName:"K8s",color:"#326CE5",bg:"rgba(50, 108, 229, 0.16)"},FASTLY:{name:"Fastly Edge",shortName:"Fastly",color:"#FF282D",bg:"rgba(255, 40, 45, 0.16)"},GENERIC:{name:"Standard / Generic",shortName:"Standard",color:"#64748B",bg:"rgba(100, 116, 139, 0.16)"}},G={[h.API_GATEWAY]:[{id:"aws-api-gateway",name:"Amazon API Gateway",brand:"AWS",brandInfo:C.AWS,baseRps:1e5,baseLatencyMs:5,hourlyCost:.12,description:"Fully managed AWS service for creating REST, HTTP, and WebSocket APIs at scale.",highlights:"Direct AWS Lambda integration, AWS IAM & Cognito authorization, native CloudWatch metrics, built-in payload caching and token bucket throttling."},{id:"kong-gateway",name:"Kong API Gateway",brand:"OSS",brandInfo:C.OSS,baseRps:14e4,baseLatencyMs:2,hourlyCost:.1,description:"Cloud-native, high-performance API gateway built on NGINX and OpenResty.",highlights:"Ultra-low sub-2ms latency, rich Lua/Go plugin ecosystem for JWT, rate-limiting, transform plugins, and multi-cloud agnostic deployment."},{id:"cloudflare-workers",name:"Cloudflare Workers (Edge Gateway)",brand:"Cloudflare",brandInfo:C.CLOUDFLARE,baseRps:25e4,baseLatencyMs:1.5,hourlyCost:.08,description:"Edge-compute serverless gateway running on V8 isolates in 300+ global data centers.",highlights:"Executes routing logic within 5ms of 95% of world population, eliminates origin roundtrips, built-in DDoS shielding and edge KV cache."},{id:"google-apigee",name:"Google Cloud Apigee",brand:"GCP",brandInfo:C.GCP,baseRps:8e4,baseLatencyMs:6,hourlyCost:.18,description:"Enterprise API management platform with deep AI analytics and developer portal.",highlights:"Advanced threat protection, enterprise OAuth2/SAML governance, API monetization, and machine-learning anomaly detection."},{id:"envoy-gateway",name:"Envoy Gateway (CNCF)",brand:"CNCF",brandInfo:C.CNCF,baseRps:16e4,baseLatencyMs:1.2,hourlyCost:.09,description:"Modern C++ service mesh ingress and edge gateway designed for Kubernetes environments.",highlights:"Native gRPC, HTTP/3 QUIC, dynamic hot-reloading via xDS APIs, circuit breaking, and advanced distributed tracing."}],[h.LOAD_BALANCER]:[{id:"aws-alb",name:"AWS Application Load Balancer (ALB)",brand:"AWS",brandInfo:C.AWS,baseRps:15e4,baseLatencyMs:2,hourlyCost:.07,description:"Layer 7 application load balancer with URL path and host-based routing.",highlights:"Native HTTP/2 & gRPC support, TLS offloading, integration with AWS WAF and ECS container target groups."},{id:"aws-nlb",name:"AWS Network Load Balancer (NLB)",brand:"AWS",brandInfo:C.AWS,baseRps:6e5,baseLatencyMs:.4,hourlyCost:.08,description:"Layer 4 ultra-high performance transport balancer handling millions of concurrent requests.",highlights:"Sub-millisecond latency, static IP addresses per AZ, TCP/UDP pass-through, ideal for gaming and financial systems."},{id:"nginx-lb",name:"NGINX Reverse Proxy & LB",brand:"OSS",brandInfo:C.OSS,baseRps:2e5,baseLatencyMs:1.2,hourlyCost:.05,description:"Industry-standard high-performance asynchronous event-driven reverse proxy.",highlights:"Supports Least Connections, IP Hash, Round Robin, SSL termination, and static asset microcaching."},{id:"cloudflare-lb",name:"Cloudflare Load Balancing",brand:"Cloudflare",brandInfo:C.CLOUDFLARE,baseRps:4e5,baseLatencyMs:2.5,hourlyCost:.09,description:"Global Anycast DNS load balancing and automatic multi-region failover.",highlights:"Directs user traffic to the geographically nearest healthy origin data center; instant zero-downtime failover."},{id:"haproxy",name:"HAProxy Enterprise",brand:"OSS",brandInfo:C.OSS,baseRps:28e4,baseLatencyMs:.8,hourlyCost:.06,description:"Dedicated high-availability TCP/HTTP load balancer renowned for reliability.",highlights:"Deep health-checking, granular queue management, connection rate limiting, and transparent proxying."},{id:"gcp-cloud-lb",name:"Google Cloud Load Balancing",brand:"GCP",brandInfo:C.GCP,baseRps:5e5,baseLatencyMs:1.5,hourlyCost:.08,description:"Global Anycast external HTTP(S) proxy load balancer spanning Google's worldwide fiber network.",highlights:"Single Anycast IP worldwide, integrated Cloud Armor DDoS/WAF protection, instant auto-scaling to millions of RPS without pre-warming."},{id:"traefik-proxy",name:"Traefik Cloud Native Proxy",brand:"OSS",brandInfo:C.OSS,baseRps:18e4,baseLatencyMs:1.4,hourlyCost:.05,description:"Modern HTTP reverse proxy and load balancer designed for microservices and container orchestrators.",highlights:"Automatic dynamic configuration discovery from Docker/K8s, Let's Encrypt automatic TLS certificates, built-in dashboard metrics."}],[h.CACHE]:[{id:"redis-core",name:"Redis In-Memory Key/Value",brand:"Redis",brandInfo:C.REDIS,baseRps:13e4,baseLatencyMs:1,hourlyCost:.2,description:"Single-threaded event-driven in-memory data store supporting strings, hashes, lists, sets, and sorted sets.",highlights:"Sub-millisecond reads/writes, LRU/LFU memory eviction, Pub/Sub channels, Lua scripts, and atomic increments."},{id:"aws-elasticache",name:"Amazon ElastiCache (Redis)",brand:"AWS",brandInfo:C.AWS,baseRps:15e4,baseLatencyMs:1.2,hourlyCost:.25,description:"Fully managed Redis service with automated Multi-AZ failover and cluster sharding.",highlights:"Zero-management patching, automatic read-replica scaling across Availability Zones, encrypted at rest and in transit."},{id:"gcp-memorystore",name:"Google Cloud Memorystore (Redis)",brand:"GCP",brandInfo:C.GCP,baseRps:14e4,baseLatencyMs:1.1,hourlyCost:.24,description:"Fully managed in-memory data store service for Redis on Google Cloud Platform.",highlights:"Sub-millisecond latency, automated high availability with cross-zone failover, VPC peering security, Cloud Monitoring metrics."},{id:"memcached",name:"Memcached Pure Cache",brand:"OSS",brandInfo:C.OSS,baseRps:18e4,baseLatencyMs:.7,hourlyCost:.15,description:"Multi-threaded, high-concurrency simple string key-value in-memory cache.",highlights:"Multi-core CPU scaling, slab allocator memory management, ideal for simple read-heavy HTML/JSON fragment caching."},{id:"dragonfly",name:"Dragonfly Modern Memory DB",brand:"OSS",brandInfo:C.OSS,baseRps:35e4,baseLatencyMs:.6,hourlyCost:.22,description:"Next-generation multi-threaded Redis alternative delivering 25x throughput per instance.",highlights:"Thread-per-core shared-nothing architecture, scales up to 1TB RAM per single node without clustering complexity."}],[h.DATABASE]:[{id:"postgres-aurora",name:"Amazon Aurora (PostgreSQL)",brand:"AWS",brandInfo:C.AWS,baseRps:8e3,baseLatencyMs:18,hourlyCost:.48,description:"Cloud-native distributed relational database with 6-way storage replication across 3 AZs.",highlights:"ACID transactions, complex SQL joins, up to 15 auto-scaling read replicas with sub-10ms replica lag."},{id:"gcp-cloud-spanner",name:"Google Cloud Spanner",brand:"GCP",brandInfo:C.GCP,baseRps:25e3,baseLatencyMs:8,hourlyCost:.9,description:"Globally distributed relational database service providing external consistency and 99.999% SLA.",highlights:"TrueTime atomic clock synchronization, unlimited horizontal SQL scale, zero maintenance downtime, automatic multi-region sharding."},{id:"dynamodb",name:"Amazon DynamoDB",brand:"AWS",brandInfo:C.AWS,baseRps:6e4,baseLatencyMs:4,hourlyCost:.35,description:"Fully managed serverless NoSQL key-value and document database with single-digit millisecond latency.",highlights:"Virtually unlimited horizontal auto-partitioning by Hash Key, global tables for multi-region replication, built-in TTL."},{id:"mongodb-atlas",name:"MongoDB Atlas",brand:"OSS",brandInfo:C.OSS,baseRps:12e3,baseLatencyMs:22,hourlyCost:.4,description:"Distributed JSON/BSON document database with flexible schema and horizontal sharding.",highlights:"Rich document queries, secondary indexes, aggregation pipeline, and replica set automated failover."},{id:"cockroachdb",name:"CockroachDB Distributed SQL",brand:"OSS",brandInfo:C.OSS,baseRps:15e3,baseLatencyMs:28,hourlyCost:.5,description:"Resilient multi-cloud distributed SQL database providing serializable transactions without SPOF.",highlights:"Raft consensus per range, multi-region survival of entire cloud data center outages, standard Postgres wire compatibility."},{id:"apache-cassandra",name:"Apache Cassandra",brand:"Apache",brandInfo:C.APACHE,baseRps:5e4,baseLatencyMs:12,hourlyCost:.42,description:"Masterless wide-column distributed NoSQL database designed for write-heavy high-velocity workloads.",highlights:"LSM-tree write architecture, peer-to-peer ring topology, tunable consistency (QUORUM/ONE/ALL), zero single point of failure."}],[h.MESSAGE_QUEUE]:[{id:"apache-kafka",name:"Apache Kafka (Event Stream)",brand:"Apache",brandInfo:C.APACHE,baseRps:12e4,baseLatencyMs:4,hourlyCost:.28,description:"Distributed append-only commit log capable of processing millions of events per second.",highlights:"Partition-level order guarantees, consumer groups, replayable event retention on disk, event-driven microservices."},{id:"aws-sqs",name:"Amazon SQS (Managed Queue)",brand:"AWS",brandInfo:C.AWS,baseRps:4e4,baseLatencyMs:10,hourlyCost:.12,description:"Fully managed distributed message queuing service with Standard and FIFO delivery.",highlights:"Zero server maintenance, auto-scales automatically, dead-letter queues (DLQ), visibility timeouts."},{id:"rabbitmq",name:"RabbitMQ (AMQP Broker)",brand:"OSS",brandInfo:C.OSS,baseRps:55e3,baseLatencyMs:6,hourlyCost:.16,description:"Erlang-based reliable message broker supporting complex routing patterns.",highlights:"Direct, Topic, Fanout, and Headers exchanges, publisher confirms, acknowledgment-based guaranteed delivery."},{id:"redis-streams",name:"Redis Streams",brand:"Redis",brandInfo:C.REDIS,baseRps:9e4,baseLatencyMs:1.5,hourlyCost:.18,description:"Lightweight in-memory append-only log data structure with consumer groups.",highlights:"Sub-millisecond dispatch, minimal infrastructure footprint, radix-tree indexed event IDs."}],[h.CDN]:[{id:"cloudflare-cdn",name:"Cloudflare Edge CDN",brand:"Cloudflare",brandInfo:C.CLOUDFLARE,baseRps:65e4,baseLatencyMs:3,hourlyCost:.08,description:"Global Anycast network spanning 300+ cities with edge caching and tier-1 DDoS protection.",highlights:"Argo Smart Routing, Polish image optimization, Brotli compression, edge SSL, and Web Application Firewall (WAF)."},{id:"aws-cloudfront",name:"Amazon CloudFront",brand:"AWS",brandInfo:C.AWS,baseRps:55e4,baseLatencyMs:4,hourlyCost:.09,description:"Global content delivery network deeply integrated with AWS S3, EC2, and Lambda@Edge.",highlights:"Origin Shield caching tier, real-time logs to Kinesis, signed URLs/cookies for private video streaming."},{id:"fastly",name:"Fastly Edge Cloud",brand:"Fastly",brandInfo:C.FASTLY,baseRps:6e5,baseLatencyMs:2.5,hourlyCost:.11,description:"Programmable edge cloud platform powered by customized Varnish (VCL) proxy caching.",highlights:"Instant global cache purges in 150ms, real-time streaming logs, dynamic edge rendering."},{id:"akamai",name:"Akamai Intelligent Edge",brand:"OSS",brandInfo:C.OSS,baseRps:45e4,baseLatencyMs:4.5,hourlyCost:.14,description:"Massive enterprise edge distribution network with over 350,000 servers in 130+ countries.",highlights:"Adaptive media streaming, carrier-grade peering, enterprise zero-trust edge security."}],[h.MICROSERVICE]:[{id:"aws-ecs-fargate",name:"AWS ECS / Fargate (Container)",brand:"AWS",brandInfo:C.AWS,baseRps:14e3,baseLatencyMs:22,hourlyCost:.22,description:"Serverless container orchestration for Docker images without managing EC2 infrastructure.",highlights:"Seamless task auto-scaling, VPC private networking, AWS Secrets Manager integration."},{id:"k8s-pods",name:"Kubernetes Pods (EKS/GKE)",brand:"CNCF",brandInfo:C.CNCF,baseRps:22e3,baseLatencyMs:18,hourlyCost:.25,description:"Production container clusters with automated rollouts, self-healing, and service discovery.",highlights:"Horizontal Pod Autoscaler (HPA), sidecar proxies, ConfigMaps, readiness/liveness health probes."},{id:"google-cloud-run",name:"Google Cloud Run (Serverless)",brand:"GCP",brandInfo:C.GCP,baseRps:16e3,baseLatencyMs:28,hourlyCost:.18,description:"Managed serverless platform that automatically scales container requests from 0 to thousands.",highlights:"Zero idle cost with scale-to-zero, fast cold-starts, automatic HTTPS certificates."},{id:"go-microservice",name:"Go / Gin Compiled Server",brand:"OSS",brandInfo:C.OSS,baseRps:38e3,baseLatencyMs:8,hourlyCost:.15,description:"Statically compiled Go binary utilizing lightweight goroutines and high concurrency.",highlights:"Sub-10ms response times, minimal RAM footprint (<30MB), high throughput per CPU core."},{id:"node-microservice",name:"Node.js Express / NestJS",brand:"OSS",brandInfo:C.OSS,baseRps:9e3,baseLatencyMs:24,hourlyCost:.18,description:"V8 single-threaded non-blocking event-driven JavaScript/TypeScript backend.",highlights:"Rich NPM package ecosystem, asynchronous I/O, rapid API prototyping, and WebSocket support."}],[h.CLIENT]:[{id:"web-browser",name:"Web Browser (React/Next.js)",brand:"Standard",brandInfo:C.GENERIC,baseRps:1e6,baseLatencyMs:0,hourlyCost:0,description:"Single-page applications (SPA) and server-side rendered web frontend traffic.",highlights:"HTTP/HTTPS requests, WebSocket real-time connections, client-side session cookies."},{id:"mobile-app",name:"Mobile App (iOS / Android)",brand:"Standard",brandInfo:C.GENERIC,baseRps:1e6,baseLatencyMs:0,hourlyCost:0,description:"Native mobile client apps operating on cellular 4G/5G and WiFi networks.",highlights:"Variable network connectivity, exponential backoff retries, mobile push notification tokens."},{id:"iot-device",name:"IoT Sensor Fleet",brand:"Standard",brandInfo:C.GENERIC,baseRps:5e5,baseLatencyMs:0,hourlyCost:0,description:"Distributed network of smart meters, sensors, and connected hardware devices.",highlights:"High-frequency telemetry data pings, MQTT and lightweight HTTP payloads."},{id:"b2b-webhook",name:"B2B Partner Webhook / API",brand:"Standard",brandInfo:C.GENERIC,baseRps:2e5,baseLatencyMs:0,hourlyCost:0,description:"External server-to-server API integrations, payment webhooks (Stripe), and cron jobs.",highlights:"High batch payload volumes, HMAC signature verification, idempotent event delivery."}]},Y={"HTTP/REST":{name:"HTTP/1.1 REST",category:"Application (Web)",latencyMs:3.5,description:"Standard request-response protocol. Simple, universal, and human-readable.",pros:"Universal browser support, easy debugging, widespread caching support.",cons:"Head-of-line blocking, verbose headers, higher latency than binary protocols.",bestFor:"Public client-facing APIs, web endpoints, and third-party integrations."},"HTTP/2":{name:"HTTP/2",category:"Application (Web)",latencyMs:2,description:"Multiplexed binary protocol over single TCP connection with header compression.",pros:"Multiplexing eliminates head-of-line blocking, server push, header compression (HPACK).",cons:"TCP packet loss stalls all multiplexed streams; more complex than HTTP/1.1.",bestFor:"High-volume web client traffic to API Gateways and CDNs."},gRPC:{name:"gRPC (Protobuf)",category:"RPC (Inter-Service)",latencyMs:1.2,description:"High-performance binary RPC protocol built on HTTP/2 and Protocol Buffers.",pros:"Extremely compact binary payload, strongly-typed contracts, bidirectional streaming.",cons:"Not directly supported by standard web browsers without gRPC-Web proxy; binary payload is not human-readable.",bestFor:"Internal microservice-to-microservice communication requiring sub-5ms latency."},WebSocket:{name:"WebSocket",category:"Real-Time Streaming",latencyMs:1.5,description:"Full-duplex persistent two-way TCP connection for instant bidirectional communication.",pros:"Near-zero overhead after handshake, real-time push without polling.",cons:"Stateful connections make load balancing and auto-scaling harder; requires sticky sessions or Redis pub/sub.",bestFor:"Chat applications, live financial tickers, collaborative editing, gaming."},"Redis TCP":{name:"Redis RESP Protocol",category:"In-Memory Key/Value",latencyMs:.8,description:"Lightweight, simple text/binary serialization protocol optimized for ultra-fast RAM queries.",pros:"Sub-millisecond latency, minimal parsing overhead, pipeline command batching.",cons:"Requires dedicated driver, not general-purpose for arbitrary structured queries.",bestFor:"Caching lookups, session token checks, rate limiter counters, pub/sub."},"Kafka / AMQP":{name:"Kafka / AMQP (Async)",category:"Event Queue Protocol",latencyMs:2.5,description:"Asynchronous publish-subscribe messaging protocol designed for high-throughput stream ingestion.",pros:"Asynchronous non-blocking publishing, persistent event log, massive batch throughput.",cons:"Consumer latency depends on worker lag; eventual consistency required.",bestFor:"Decoupling services, processing background tasks, audit logging, analytics pipelines."},"Postgres wire":{name:"SQL Wire Protocol",category:"Relational Database",latencyMs:4,description:"Stateful database connection protocol supporting transactions, prepared statements, and connection pooling.",pros:"ACID guarantees, rich query support, transactional rollback.",cons:"Connection establishment overhead (requires pooling like PgBouncer), disk I/O bottlenecks.",bestFor:"Primary application data stores requiring relational integrity."}},S={NODE_ADDED:"graph:node_added",NODE_REMOVED:"graph:node_removed",NODE_UPDATED:"graph:node_updated",NODE_MOVED:"graph:node_moved",EDGE_ADDED:"graph:edge_added",EDGE_REMOVED:"graph:edge_removed",EDGE_UPDATED:"graph:edge_updated",GRAPH_CLEARED:"graph:cleared",GRAPH_LOADED:"graph:loaded",SELECTION_CHANGED:"selection:changed",SIM_CONFIG_CHANGED:"sim:config_changed",SIM_STARTED:"sim:started",SIM_PAUSED:"sim:paused",SIM_TICK:"sim:tick",SIM_METRICS_UPDATED:"sim:metrics_updated",ANALYSIS_UPDATED:"analysis:updated",THEME_CHANGED:"ui:theme_changed",PANEL_TOGGLED:"ui:panel_toggled",SCENARIO_SELECTED:"scenario:selected",AI_STATUS_CHANGED:"ai:status_changed",AI_MESSAGE_ADDED:"ai:message_added",AI_TOOL_EXECUTING:"ai:tool_executing"},x={NODE_WIDTH:204,NODE_HEIGHT:96,BORDER_RADIUS:12,PORT_RADIUS:5,GRID_SPACING:24,MIN_ZOOM:.25,MAX_ZOOM:2.5,ZOOM_SPEED:.0015};function ne(g){const e=G[g]||[],t=[],s=new Set;for(const i of e)i.brand&&!s.has(i.brand)&&(s.add(i.brand),t.push({brand:i.brand,...i.brandInfo||C.GENERIC}));return t}function J(g,e=null){const t=G[g]||[];return!e||e==="ALL"?t:t.filter(s=>s.brand===e)}class ae{constructor(){this.isWasmLoaded=!1,this.wasmInstance=null,this.nativeEngine=null,this.nodes=new Map,this.edges=new Map,this.lastReport=null,this.lastAnalysis=null}async init(){try{const e=new Uint8Array([0,97,115,109,1,0,0,0,1,12,2,96,1,127,1,127,96,2,125,125,1,125,3,3,2,0,1,7,29,2,9,102,97,115,116,95,104,97,115,104,0,0,11,113,117,101,117,101,95,100,101,108,97,121,0,1,10,34,2,11,0,32,0,65,157,172,101,108,65,223,205,213,98,106,11,20,0,32,0,32,1,32,0,147,67,0,0,128,63,148,148,11]),t=await WebAssembly.instantiate(e);this.wasmInstance=t.instance,this.isWasmLoaded=!0,console.log("[WasmBridge] Native WebAssembly Simulation Coprocessor successfully instantiated.")}catch(e){console.warn("[WasmBridge] Compiled WASM binary fallback used:",e),this.isWasmLoaded=!0}}addNode(e){this.nodes.set(e.id,{...e,config:e.config||{},custom_capacity_rps:e.custom_capacity_rps||null})}removeNode(e){this.nodes.delete(e);for(const[t,s]of Array.from(this.edges.entries()))(s.from===e||s.to===e)&&this.edges.delete(t)}addEdge(e){this.edges.set(e.id,{...e})}removeEdge(e){this.edges.delete(e)}clear(){this.nodes.clear(),this.edges.clear(),this.lastReport=null,this.lastAnalysis=null}runSimulation(e){const t={total_requests:0,successful_requests:0,failed_requests:0,overall_p50_ms:0,overall_p95_ms:0,overall_p99_ms:0,max_bottleneck_node:null,max_bottleneck_load_pct:0,total_estimated_cost_monthly_usd:0,node_metrics:{},is_healthy:!0};if(this.nodes.size===0)return t;const s=new Map;for(const _ of this.nodes.keys())s.set(_,0);for(const _ of this.edges.values())s.set(_.to,(s.get(_.to)||0)+1);const i=[];for(const[_,k]of s.entries()){const R=this.nodes.get(_);R&&(R.component_type===h.CLIENT||k===0)&&i.push(_)}i.length===0&&this.nodes.size>0&&i.push(Array.from(this.nodes.keys())[0]);const o=new Map;let n=0;for(const[_,k]of this.nodes.entries()){const R=W[k.component_type]||W[h.MICROSERVICE];let I=k.custom_capacity_rps||R.baseRps,L=1;if(k.component_type===h.MICROSERVICE){const D=Number(k.config.instances)||1;I*=D,L=D}else if(k.component_type===h.DATABASE){const D=Number(k.config.read_replicas)||0,M=k.config.sharding_strategy&&k.config.sharding_strategy!=="None";I=I*(1+D*.8)*(M?3:1),L=1+D*.75}else if(k.component_type===h.CACHE){const D=Number(k.config.max_memory_mb)||1024;L=Math.max(1,D/1024)}o.set(_,I),n+=R.hourlyCost*L*730}t.total_estimated_cost_monthly_usd=Math.round(n);const a=Number(e.target_rps)||1e4,r=new Map;for(const _ of this.nodes.keys())r.set(_,0);const l=a/Math.max(1,i.length);for(const _ of i)r.set(_,(r.get(_)||0)+l);const c=new Map;for(const _ of this.nodes.keys())c.set(_,[]);for(const _ of this.edges.values())c.has(_.from)&&c.get(_.from).push(_.to);const u=[...i],p=new Set;let m=50;for(;u.length>0&&m-- >0;){const _=u.shift(),k=r.get(_)||0,R=c.get(_)||[];if(R.length===0)continue;const I=this.nodes.get(_);if(!I)continue;let L=k;if(I.component_type===h.CDN){const M=Number(I.config.edge_cache_ratio)||.85;L=k*(1-M)}else if(I.component_type===h.CACHE){const M=Number(I.config.cache_hit_ratio)||.8;L=k*(1-M)}const D=L/R.length;for(const M of R)r.set(M,(r.get(M)||0)+D),p.has(M)||(p.add(M),u.push(M))}let f=0,E=null,v=[];for(const[_,k]of this.nodes.entries()){const R=r.get(_)||0,I=o.get(_)||1e4,L=R/I,D=W[k.component_type]||W[h.MICROSERVICE],M=D.baseLatencyMs;let q=M;L<.7?q=M*(1+L*.4):L<.98?q=M/Math.max(.05,1-L):q=M*20+(L-.98)*350;let O=0,X=0,U=R;L>1&&(O=R-I,U=I,X=O/R*100);const H={node_id:_,incoming_rps:Math.round(R),processed_rps:Math.round(U),dropped_rps:Math.round(O),queue_depth:Math.round(Math.max(0,(L-.8)*150)),cpu_utilization:Number(L.toFixed(3)),p50_latency_ms:Number(q.toFixed(1)),p95_latency_ms:Number((q*1.6).toFixed(1)),p99_latency_ms:Number((q*2.8).toFixed(1)),error_rate_percent:Number(X.toFixed(1)),hourly_cost_usd:D.hourlyCost};t.node_metrics[_]=H,L*100>f&&(f=L*100,E=k.name),v.push(q)}v.sort((_,k)=>_-k);const b=v[Math.floor(v.length*.5)]||5,w=v[Math.floor(v.length*.95)]||b*1.8,P=v[Math.floor(v.length*.99)]||b*2.9;t.total_requests=Math.round(a);let N=0;for(const _ of Object.values(t.node_metrics))N+=_.dropped_rps;return t.failed_requests=Math.round(N),t.successful_requests=Math.max(0,t.total_requests-t.failed_requests),t.overall_p50_ms=Number(b.toFixed(1)),t.overall_p95_ms=Number(w.toFixed(1)),t.overall_p99_ms=Number(P.toFixed(1)),t.max_bottleneck_node=E,t.max_bottleneck_load_pct=Number(f.toFixed(1)),t.is_healthy=t.overall_p95_ms<250&&t.failed_requests/Math.max(1,t.total_requests)<.02,this.lastReport=t,t}analyzeGraph(){const e={spofs:[],bottlenecks:[],missing_load_balancers:[],recommendations:[],architecture_score:100};if(this.nodes.size===0)return e;let t=100;const s=this._findArticulationPoints();for(const n of s){const a=this.nodes.get(n);if(!a||a.component_type===h.CLIENT)continue;let r="MEDIUM",l="Introduce horizontal redundancy to eliminate this single point of failure.";a.component_type===h.DATABASE?(r="CRITICAL",l="Add read-replicas or configure a multi-AZ hot standby replica to prevent total outage if primary database fails."):a.component_type===h.MICROSERVICE?(r="HIGH",l="Deploy at least 2 instances behind a Load Balancer to ensure high availability (N+1 redundancy)."):a.component_type===h.LOAD_BALANCER?(r="MEDIUM",l="Pair with a secondary standby Load Balancer with DNS failover (e.g. Route53) or keepalived VRRP."):a.component_type===h.CACHE&&(r="HIGH",l="Set up a Redis Sentinel or Redis Cluster with replica nodes to avoid cache stampede on restart."),e.spofs.push({node_id:a.id,node_name:a.name,component_type:a.component_type,severity:r,reason:`'${a.name}' is an articulation point. If it goes down, downstream services are isolated.`,suggestion:l}),t-=r==="CRITICAL"?22:12}for(const[n,a]of this.nodes.entries())if(a.component_type===h.CLIENT){for(const r of this.edges.values())if(r.from===n){const l=this.nodes.get(r.to);l&&l.component_type===h.DATABASE&&(e.recommendations.push(`Security / Architectural Flaw: Client '${a.name}' connects directly to Database '${l.name}'. Place an API Gateway or Microservice between them.`),t-=25)}}for(const[n,a]of this.nodes.entries())if(a.component_type===h.MICROSERVICE){const r=Array.from(this.edges.values()).filter(l=>l.to===n);r.length>0&&(r.some(c=>{const u=this.nodes.get(c.from);return u&&(u.component_type===h.LOAD_BALANCER||u.component_type===h.API_GATEWAY)})||(e.missing_load_balancers.push(`Microservice '${a.name}' receives traffic directly without a dedicated Load Balancer or API Gateway.`),t-=10))}const i=Array.from(this.nodes.values()).some(n=>n.component_type===h.CACHE);if(Array.from(this.nodes.values()).some(n=>n.component_type===h.DATABASE)&&!i&&(e.recommendations.push("Caching Strategy: No in-memory cache (Redis/Memcached) detected. In high-traffic scenarios, database read I/O will quickly saturate."),t-=10),this.lastReport&&this.lastReport.node_metrics){for(const[n,a]of Object.entries(this.lastReport.node_metrics))if(a.cpu_utilization>=1){const r=this.nodes.get(n);e.bottlenecks.push(`Resource Saturation: '${r?r.name:n}' reached ${(a.cpu_utilization*100).toFixed(0)}% load, dropping ${a.dropped_rps} req/s!`),t-=15}}return e.architecture_score=Math.max(10,Math.min(100,t)),this.lastAnalysis=e,e}_findArticulationPoints(){const e=Array.from(this.nodes.keys()),t=e.length;if(t<3)return[];const s=new Map(e.map((u,p)=>[u,p])),i=Array.from({length:t},()=>[]);for(const u of this.edges.values()){const p=s.get(u.from),m=s.get(u.to);p!==void 0&&m!==void 0&&p!==m&&(i[p].push(m),i[m].push(p))}const o=new Array(t).fill(!1),n=new Array(t).fill(0),a=new Array(t).fill(0),r=new Array(t).fill(!1);let l=0;const c=(u,p=-1)=>{o[u]=!0,n[u]=a[u]=++l;let m=0;for(const f of i[u])f!==p&&(o[f]?a[u]=Math.min(a[u],n[f]):(c(f,u),a[u]=Math.min(a[u],a[f]),a[f]>=n[u]&&p!==-1&&(r[u]=!0),m++));p===-1&&m>1&&(r[u]=!0)};for(let u=0;u<t;u++)o[u]||c(u);return e.filter((u,p)=>r[p])}}const B=new ae;class re{constructor(){this.nodes=new Map,this.edges=new Map,this.selectedNodeId=null,this.selectedEdgeId=null,this.theme=localStorage.getItem("sds_theme")||"dark",this.simConfig={target_rps:5e4,profile:"Constant",duration_seconds:60,read_write_ratio:.85,isRunning:!1},this.simReport=null,this.analysisReport=null,this.activeScenario=null,this.camera={x:0,y:0,zoom:1},this._analysisDebounceTimer=null,this._autoSaveTimer=null}async init(){await B.init(),this.applyTheme(this.theme)}addNode(e){const t=e.id||`node_${Date.now()}_${Math.floor(Math.random()*1e3)}`,s=W[e.component_type]||{},i=G[e.component_type]||[];let o=i.find(a=>a.id===e.model_id);if(!o&&e.name){const a=e.name.toLowerCase();o=i.find(r=>a.includes(r.name.toLowerCase())||a.includes(r.brand.toLowerCase())||r.brandInfo&&a.includes(r.brandInfo.shortName.toLowerCase()))}!o&&i.length>0&&(o=i[0]);const n={id:t,name:e.name||(o?o.name:s.name||"Component"),component_type:e.component_type,model_id:o?o.id:null,model_name:o?o.name:s.name||"Component",brand:o?o.brand:"Generic",brand_short:o&&o.brandInfo?o.brandInfo.shortName:"Standard",brand_color:o&&o.brandInfo?o.brandInfo.color:"#64748B",brand_bg:o&&o.brandInfo?o.brandInfo.bg:"rgba(100, 116, 139, 0.16)",x:Math.round(e.x||100),y:Math.round(e.y||100),config:{...e.config||{}},custom_capacity_rps:e.custom_capacity_rps||(o?o.baseRps:null),base_latency_ms:o?o.baseLatencyMs:s.baseLatencyMs||5,hourly_cost:o?o.hourlyCost:s.hourlyCost||.1};return this.nodes.set(t,n),B.addNode(n),y.emit(S.NODE_ADDED,n),this.triggerRealtimeAnalysis(),this.scheduleAutoSave(),n}removeNode(e){const t=this.nodes.get(e);if(!t)return;const s=[];for(const i of this.edges.values())(i.from===e||i.to===e)&&s.push(i.id);for(const i of s)this.removeEdge(i);this.nodes.delete(e),B.removeNode(e),this.selectedNodeId===e&&(this.selectedNodeId=null,y.emit(S.SELECTION_CHANGED,{node:null,edge:null})),y.emit(S.NODE_REMOVED,{id:e,node:t}),this.triggerRealtimeAnalysis(),this.scheduleAutoSave()}updateNodePosition(e,t,s){const i=this.nodes.get(e);i&&(i.x=Math.round(t),i.y=Math.round(s),y.emit(S.NODE_MOVED,{id:e,x:i.x,y:i.y}),this.scheduleAutoSave())}updateNodeConfig(e,t){const s=this.nodes.get(e);s&&(s.config={...s.config,...t},B.addNode(s),y.emit(S.NODE_UPDATED,s),this.triggerRealtimeAnalysis(),this.scheduleAutoSave())}renameNode(e,t){const s=this.nodes.get(e);s&&(s.name=t,B.addNode(s),y.emit(S.NODE_UPDATED,s),this.scheduleAutoSave())}updateNodeModel(e,t,s=!1){const i=this.nodes.get(e);if(!i)return;const o=G[i.component_type]||[],n=o.find(r=>r.id===t);if(!n)return;const a=!i.name||i.name==="Component"||o.some(r=>r.name===i.name);i.model_id=n.id,i.model_name=n.name,i.brand=n.brand,i.brand_short=n.brandInfo.shortName,i.brand_color=n.brandInfo.color,i.brand_bg=n.brandInfo.bg,i.custom_capacity_rps=n.baseRps,i.base_latency_ms=n.baseLatencyMs,i.hourly_cost=n.hourlyCost,(s||a)&&(i.name=n.name),B.addNode(i),y.emit(S.NODE_UPDATED,i),this.triggerRealtimeAnalysis(),this.scheduleAutoSave()}addEdge(e){if(!this.nodes.has(e.from)||!this.nodes.has(e.to))return console.warn("[StateManager] Cannot connect invalid node IDs:",e),null;if(e.from===e.to)return null;for(const i of this.edges.values())if(i.from===e.from&&i.to===e.to)return i;const t=e.id||`edge_${Date.now()}_${Math.floor(Math.random()*1e3)}`,s={id:t,from:e.from,to:e.to,protocol:e.protocol||"HTTP/REST",latency_overhead_ms:e.latency_overhead_ms||1};return this.edges.set(t,s),B.addEdge(s),y.emit(S.EDGE_ADDED,s),this.triggerRealtimeAnalysis(),this.scheduleAutoSave(),s}updateEdgeConfig(e,t){const s=this.edges.get(e);s&&(Object.assign(s,t),B.addEdge(s),y.emit(S.EDGE_UPDATED,s),this.triggerRealtimeAnalysis(),this.scheduleAutoSave())}removeEdge(e){const t=this.edges.get(e);t&&(this.edges.delete(e),B.removeEdge(e),this.selectedEdgeId===e&&(this.selectedEdgeId=null,y.emit(S.SELECTION_CHANGED,{node:null,edge:null})),y.emit(S.EDGE_REMOVED,{id:e,edge:t}),this.triggerRealtimeAnalysis(),this.scheduleAutoSave())}clearGraph(e=!0){this.nodes.clear(),this.edges.clear(),this.selectedNodeId=null,this.selectedEdgeId=null,B.clear(),e&&this.clearSavedGraph(),y.emit(S.GRAPH_CLEARED),y.emit(S.SELECTION_CHANGED,{node:null,edge:null}),this.triggerRealtimeAnalysis()}loadGraph(e,t=!0){if(this.clearGraph(!1),Array.isArray(e.nodes))for(const s of e.nodes)this.addNode(s);if(Array.isArray(e.edges))for(const s of e.edges)this.addEdge(s);y.emit(S.GRAPH_LOADED,{nodes:this.nodes,edges:this.edges}),this.triggerRealtimeAnalysis(),t&&this.scheduleAutoSave()}scheduleAutoSave(){clearTimeout(this._autoSaveTimer),this._autoSaveTimer=setTimeout(()=>{this.saveToLocalStorage()},400)}saveToLocalStorage(){try{if(this.nodes.size===0&&this.edges.size===0){localStorage.removeItem("sds_autosave_graph");return}const e={nodes:Array.from(this.nodes.values()),edges:Array.from(this.edges.values()),simConfig:{target_rps:this.simConfig.target_rps,profile:this.simConfig.profile,duration_seconds:this.simConfig.duration_seconds,read_write_ratio:this.simConfig.read_write_ratio},savedAt:Date.now()};localStorage.setItem("sds_autosave_graph",JSON.stringify(e))}catch(e){console.warn("[StateManager] Failed to auto-save to localStorage:",e)}}restoreFromLocalStorage(){try{const e=localStorage.getItem("sds_autosave_graph");if(!e)return!1;const t=JSON.parse(e);if(Array.isArray(t.nodes)&&t.nodes.length>0)return this.loadGraph(t,!1),t.simConfig&&this.updateSimConfig(t.simConfig),!0}catch(e){console.warn("[StateManager] Failed to restore from localStorage:",e)}return!1}clearSavedGraph(){try{localStorage.removeItem("sds_autosave_graph")}catch{}}selectNode(e){this.selectedNodeId=e,this.selectedEdgeId=null;const t=e&&this.nodes.get(e)||null;y.emit(S.SELECTION_CHANGED,{node:t,edge:null})}selectEdge(e){this.selectedEdgeId=e,this.selectedNodeId=null;const t=e&&this.edges.get(e)||null;y.emit(S.SELECTION_CHANGED,{node:null,edge:t})}clearSelection(){this.selectedNodeId=null,this.selectedEdgeId=null,y.emit(S.SELECTION_CHANGED,{node:null,edge:null})}updateSimConfig(e){this.simConfig={...this.simConfig,...e},y.emit(S.SIM_CONFIG_CHANGED,this.simConfig),this.simConfig.isRunning&&this.stepSimulation()}startSimulation(){this.simConfig.isRunning=!0,y.emit(S.SIM_STARTED,this.simConfig),this.stepSimulation()}pauseSimulation(){this.simConfig.isRunning=!1,y.emit(S.SIM_PAUSED,this.simConfig)}stepSimulation(){const e=B.runSimulation(this.simConfig);return this.simReport=e,y.emit(S.SIM_METRICS_UPDATED,e),e}triggerRealtimeAnalysis(){clearTimeout(this._analysisDebounceTimer),this._analysisDebounceTimer=setTimeout(()=>{this.stepSimulation();const e=B.analyzeGraph();this.analysisReport=e,y.emit(S.ANALYSIS_UPDATED,e)},200)}applyTheme(e){this.theme=e,localStorage.setItem("sds_theme",e),document.documentElement.setAttribute("data-theme",e),y.emit(S.THEME_CHANGED,e)}toggleTheme(){const e=this.theme==="dark"?"light":"dark";this.applyTheme(e)}}const d=new re;class ce{constructor(e){this.canvas=e,this.x=0,this.y=0,this.zoom=1,this.isPanning=!1,this.lastPanX=0,this.lastPanY=0}getViewportSize(){const e=this.canvas.getBoundingClientRect(),t=window.devicePixelRatio||1;return{width:e.width||this.canvas.width/t||800,height:e.height||this.canvas.height/t||600}}screenToWorld(e,t){const s=this.canvas.getBoundingClientRect(),i=e-s.left,o=t-s.top,n=this.getViewportSize();return{x:(i-n.width/2)/this.zoom+this.x,y:(o-n.height/2)/this.zoom+this.y}}worldToScreen(e,t){const s=this.getViewportSize();return{x:(e-this.x)*this.zoom+s.width/2,y:(t-this.y)*this.zoom+s.height/2}}applyTransform(e){const t=this.getViewportSize();e.translate(t.width/2,t.height/2),e.scale(this.zoom,this.zoom),e.translate(-this.x,-this.y)}zoomAt(e,t,s){const i=this.screenToWorld(t,s),o=Math.min(x.MAX_ZOOM,Math.max(x.MIN_ZOOM,this.zoom*(1+e)));if(o===this.zoom)return;this.zoom=o;const n=this.canvas.getBoundingClientRect(),a=t-n.left,r=s-n.top,l=this.getViewportSize();this.x=i.x-(a-l.width/2)/this.zoom,this.y=i.y-(r-l.height/2)/this.zoom}pan(e,t){this.x-=e/this.zoom,this.y-=t/this.zoom}fitToContent(e){if(!e||e.size===0){this.x=0,this.y=0,this.zoom=1;return}let t=1/0,s=1/0,i=-1/0,o=-1/0;for(const p of e.values())t=Math.min(t,p.x-20),s=Math.min(s,p.y-20),i=Math.max(i,p.x+x.NODE_WIDTH+20),o=Math.max(o,p.y+x.NODE_HEIGHT+20);const n=i-t,a=o-s;this.x=(t+i)/2,this.y=(s+o)/2;const r=this.getViewportSize(),l=120,c=(r.width-l)/Math.max(100,n),u=(r.height-l)/Math.max(100,a);this.zoom=Math.min(1.2,Math.max(.4,Math.min(c,u)))}reset(){this.x=0,this.y=0,this.zoom=1}}class le{render(e,t,s){const i=x.GRID_SPACING,o=t.getViewportSize(),n=t.screenToWorld(t.canvas.getBoundingClientRect().left,t.canvas.getBoundingClientRect().top),a=t.screenToWorld(t.canvas.getBoundingClientRect().left+o.width,t.canvas.getBoundingClientRect().top+o.height),r=Math.floor(n.x/i)*i,l=Math.ceil(a.x/i)*i,c=Math.floor(n.y/i)*i,u=Math.ceil(a.y/i)*i,p=s==="dark"?"rgba(255, 255, 255, 0.08)":"rgba(0, 0, 0, 0.08)",m=Math.max(.75,1.25/t.zoom);e.fillStyle=p;for(let f=r;f<=l;f+=i)for(let E=c;E<=u;E+=i)e.beginPath(),e.arc(f,E,m,0,Math.PI*2),e.fill()}}class de{renderNode(e,t,s={}){const{isSelected:i,metrics:o,isSpof:n,theme:a,hoveredPort:r,isConnectTarget:l,isWireActive:c,sourceNodeId:u}=s,p=W[t.component_type]||{},m=x.NODE_WIDTH,f=x.NODE_HEIGHT,E=x.BORDER_RADIUS,v=a==="dark",b=v?"#1A1D27":"#FFFFFF";let w=i?"#6366F1":v?"#2D3348":"#E2E5EA";l&&(w="#10B981");const P=v?"#F1F5F9":"#0F172A",N=v?"#94A3B8":"#64748B";e.save(),l?(e.shadowColor="rgba(16, 185, 129, 0.45)",e.shadowBlur=18,e.shadowOffsetY=0):(e.shadowColor=v?"rgba(0, 0, 0, 0.45)":"rgba(0, 0, 0, 0.08)",e.shadowBlur=i?16:8,e.shadowOffsetY=i?6:3),e.beginPath(),e.roundRect(t.x,t.y,m,f,E),e.fillStyle=b,e.fill(),e.shadowColor="transparent",e.lineWidth=i||l?2.5:1.25,e.strokeStyle=w,l&&e.setLineDash([5,3]),e.stroke(),e.setLineDash([]);const _=p.color||"#3B82F6";e.beginPath(),e.arc(t.x+18,t.y+20,8,0,Math.PI*2),e.fillStyle=_,e.fill();const k=t.brand_short&&t.brand_short!=="Standard";let R=0;k&&(e.save(),e.font='700 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',R=e.measureText(t.brand_short).width+10,e.restore());let I=t.x+m-12;n&&(this._renderSpofBadge(e,I-6,t.y+18),I-=22);let L=I;k&&(this._renderBrandBadge(e,I,t.y+18,t.brand_short,t.brand_color,t.brand_bg,v),L=I-R);const D=k?L:n?I:t.x+m-12,M=t.x+34,q=Math.max(30,D-M-8);e.fillStyle=P,e.font='600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',e.textAlign="left",e.textBaseline="middle";let O=t.name;if(e.measureText(O).width>q){for(;O.length>2&&e.measureText(O+"…").width>q;)O=O.slice(0,-1);O+="…"}e.fillText(O,M,t.y+20),e.fillStyle=N,e.font='500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const X=t.model_name||p.name||t.component_type,U=Math.max(40,m-46);let H=X;if(e.measureText(H).width>U){for(;H.length>2&&e.measureText(H+"…").width>U;)H=H.slice(0,-1);H+="…"}e.fillText(H,M,t.y+36),e.beginPath(),e.moveTo(t.x+12,t.y+48),e.lineTo(t.x+m-12,t.y+48),e.strokeStyle=v?"#262B3D":"#F1F5F9",e.lineWidth=1,e.stroke();const te=o?o.incoming_rps:0,se=o?o.cpu_utilization:0,V=o?o.p50_latency_ms:p.baseLatencyMs;this._renderLoadBar(e,t.x+12,t.y+58,m-24,se,v),e.font='500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',e.fillStyle=N,e.fillText(`${te.toLocaleString()} rps`,t.x+12,t.y+82),e.textAlign="right";const ie=V>100?"#EF4444":V>40?"#F59E0B":N;e.fillStyle=ie,e.fillText(`${V}ms`,t.x+m-12,t.y+82),this._renderPorts(e,t,r,v,c,u),e.restore()}_renderLoadBar(e,t,s,i,o,n){e.beginPath(),e.roundRect(t,s,i,5,2.5),e.fillStyle=n?"#262B3D":"#E2E8F0",e.fill();const l=Math.min(1,Math.max(0,o)),c=Math.max(5,i*l);let u="#10B981";o>=1?u="#EF4444":o>=.7&&(u="#F59E0B"),l>0&&(e.beginPath(),e.roundRect(t,s,c,5,2.5),e.fillStyle=u,e.fill())}_renderSpofBadge(e,t,s){e.beginPath(),e.arc(t,s,9,0,Math.PI*2),e.fillStyle="#EF4444",e.fill(),e.fillStyle="#FFFFFF",e.font="bold 11px sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText("!",t,s)}_renderBrandBadge(e,t,s,i,o,n,a){e.save(),e.font='700 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const c=e.measureText(i).width+5*2,u=15,p=t-c,m=s-u/2;return e.beginPath(),e.roundRect(p,m,c,u,4),e.fillStyle=n||"rgba(100, 116, 139, 0.16)",e.fill(),e.lineWidth=1,e.strokeStyle=o||(a?"#475569":"#CBD5E1"),e.stroke(),e.fillStyle=o||(a?"#E2E8F0":"#1E293B"),e.textAlign="center",e.textBaseline="middle",e.fillText(i,p+c/2,s),e.restore(),c}_renderPorts(e,t,s,i,o,n){const a=this.getNodePorts(t),r=x.PORT_RADIUS;for(const l of a){const c=s&&s.nodeId===t.id&&s.side===l.side,u=o&&t.id!==n;e.save(),c?(e.beginPath(),e.arc(l.x,l.y,r+5,0,Math.PI*2),e.fillStyle="rgba(99, 102, 241, 0.28)",e.fill(),e.lineWidth=2,e.strokeStyle="#6366F1",e.stroke()):u&&(e.beginPath(),e.arc(l.x,l.y,r+3,0,Math.PI*2),e.fillStyle="rgba(16, 185, 129, 0.20)",e.fill(),e.lineWidth=1,e.strokeStyle="#10B981",e.stroke()),e.beginPath(),e.arc(l.x,l.y,c?r+2:r,0,Math.PI*2),e.fillStyle=c?"#6366F1":u?"#10B981":i?"#475569":"#CBD5E1",e.fill(),e.lineWidth=1.5,e.strokeStyle=i?"#1A1D27":"#FFFFFF",e.stroke(),e.restore()}}getNodePorts(e){const t=x.NODE_WIDTH,s=x.NODE_HEIGHT;return[{side:"top",x:e.x+t/2,y:e.y,nodeId:e.id},{side:"bottom",x:e.x+t/2,y:e.y+s,nodeId:e.id},{side:"left",x:e.x,y:e.y+s/2,nodeId:e.id},{side:"right",x:e.x+t,y:e.y+s/2,nodeId:e.id}]}}class pe{renderEdge(e,t,s,i,o={}){if(!s||!i)return;const{isSelected:n,theme:a}=o,r=a==="dark",l=this.calculateOptimalBezier(s,i),{startX:c,startY:u,endX:p,endY:m,cp1X:f,cp1Y:E,cp2X:v,cp2Y:b}=l;if(e.save(),e.beginPath(),e.moveTo(c,u),e.bezierCurveTo(f,E,v,b,p,m),e.strokeStyle=n?"#6366F1":r?"rgba(148, 163, 184, 0.45)":"rgba(100, 116, 139, 0.50)",e.lineWidth=n?2.5:1.75,e.setLineDash([4,3]),e.stroke(),e.setLineDash([]),this._renderArrowhead(e,v,b,p,m,n?"#6366F1":r?"#94A3B8":"#64748B"),t.protocol){const P=Math.pow(.5,3)*c+3*Math.pow(.5,2)*.5*f+1.5*Math.pow(.5,2)*v+Math.pow(.5,3)*p,N=Math.pow(1-.5,3)*u+3*Math.pow(1-.5,2)*.5*E+3*(1-.5)*Math.pow(.5,2)*b+Math.pow(.5,3)*m;this._renderProtocolBadge(e,P,N,t.protocol,r,n)}return e.restore(),l}renderDragPreview(e,t,s,i,o){e.save(),e.beginPath(),e.moveTo(t,s);const n=i-t,a=o-s;let r=t,l=s,c=i,u=o;if(Math.abs(a)>Math.abs(n)){const p=a>=0?1:-1,m=Math.min(120,Math.max(30,Math.abs(a)*.45));l+=m*p,u-=m*p}else{const p=n>=0?1:-1,m=Math.min(120,Math.max(30,Math.abs(n)*.45));r+=m*p,c-=m*p}e.bezierCurveTo(r,l,c,u,i,o),e.strokeStyle="#6366F1",e.lineWidth=2.5,e.setLineDash([5,4]),e.stroke(),e.beginPath(),e.arc(i,o,6,0,Math.PI*2),e.fillStyle="#6366F1",e.shadowColor="#6366F1",e.shadowBlur=10,e.fill(),e.beginPath(),e.arc(i,o,10,0,Math.PI*2),e.lineWidth=1.5,e.strokeStyle="rgba(99, 102, 241, 0.4)",e.stroke(),e.restore()}calculateOptimalBezier(e,t){const s=x.NODE_WIDTH,i=x.NODE_HEIGHT,o=e.x+s/2,n=e.y+i/2,a=t.x+s/2,r=t.y+i/2,l=a-o,c=r-n;let u,p,m,f;Math.abs(c)>Math.abs(l)?c>0?(u=o,p=e.y+i,m=a,f=t.y):(u=o,p=e.y,m=a,f=t.y+i):l>0?(u=e.x+s,p=n,m=t.x,f=r):(u=e.x,p=n,m=t.x+s,f=r);const E=Math.hypot(m-u,f-p),v=Math.min(100,Math.max(30,E*.35));let b=u,w=p,P=m,N=f;if(Math.abs(c)>Math.abs(l)){const _=c>0?1:-1;w+=v*_,N-=v*_}else{const _=l>0?1:-1;b+=v*_,P-=v*_}return{startX:u,startY:p,endX:m,endY:f,cp1X:b,cp1Y:w,cp2X:P,cp2Y:N}}_renderArrowhead(e,t,s,i,o,n){const a=Math.atan2(o-s,i-t),r=9;e.save(),e.translate(i,o),e.rotate(a),e.beginPath(),e.moveTo(0,0),e.lineTo(-r,-r*.45),e.lineTo(-r*.7,0),e.lineTo(-r,r*.45),e.closePath(),e.fillStyle=n,e.fill(),e.restore()}_renderProtocolBadge(e,t,s,i,o,n=!1){e.save(),e.font='600 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';const a=e.measureText(i).width,r=2.5,l=4,c=8,u=a+r*2+l+c*2,p=18;let m="#3B82F6";i.includes("gRPC")?m="#8B5CF6":i.includes("Redis")?m="#EF4444":i.includes("Kafka")||i.includes("AMQP")?m="#F97316":i.includes("Postgres")||i.includes("SQL")?m="#EC4899":i.includes("WebSocket")?m="#06B6D4":i.includes("HTTP/2")&&(m="#10B981"),e.beginPath(),e.roundRect(t-u/2,s-p/2,u,p,9),e.fillStyle=n?o?"#232946":"#EEF2FF":o?"#1A1D2B":"#FFFFFF",n&&(e.shadowColor="#6366F1",e.shadowBlur=8),e.fill(),e.lineWidth=n?1.5:1,e.strokeStyle=n?"#6366F1":o?"#2E354B":"#E2E8F0",e.stroke(),e.shadowBlur=0;const E=t-u/2+c+r;e.beginPath(),e.arc(E,s,r,0,Math.PI*2),e.fillStyle=m,e.fill(),e.fillStyle=n?"#6366F1":o?"#CBD5E1":"#475569",e.textAlign="left",e.textBaseline="middle",e.fillText(i,E+r+l,s),e.restore()}}class he{constructor(){this.active=!1,this.edgeId=null,this.progress=0,this.speed=.01,this.color="#10B981",this.size=3.5,this.startX=0,this.startY=0,this.endX=0,this.endY=0,this.cp1X=0,this.cp1Y=0,this.cp2X=0,this.cp2Y=0}reset(){this.active=!1,this.edgeId=null,this.progress=0}}class ue{constructor(e=500){this.pool=Array.from({length:e},()=>new he),this.activeCount=0,this.spawnTimer=0}spawn(e){const t=this.pool.find(s=>!s.active);t&&(t.active=!0,t.edgeId=e.edgeId,t.progress=0,t.speed=e.speed||.012+Math.random()*.006,t.color=e.isError?"#EF4444":"#10B981",t.size=e.isError?4:3,t.startX=e.startX,t.startY=e.startY,t.endX=e.endX,t.endY=e.endY,t.cp1X=e.cp1X,t.cp1Y=e.cp1Y,t.cp2X=e.cp2X,t.cp2Y=e.cp2Y,this.activeCount++)}update(e){const t=Math.min(2,e/16.6);for(let s=0;s<this.pool.length;s++){const i=this.pool[s];i.active&&(i.progress+=i.speed*t,i.progress>=1&&(i.active=!1,this.activeCount--))}}render(e){for(let t=0;t<this.pool.length;t++){const s=this.pool[t];if(!s.active)continue;const i=s.progress,o=1-i,n=Math.pow(o,3)*s.startX+3*Math.pow(o,2)*i*s.cp1X+3*o*Math.pow(i,2)*s.cp2X+Math.pow(i,3)*s.endX,a=Math.pow(o,3)*s.startY+3*Math.pow(o,2)*i*s.cp1Y+3*o*Math.pow(i,2)*s.cp2Y+Math.pow(i,3)*s.endY;e.beginPath(),e.arc(n,a,s.size,0,Math.PI*2),e.fillStyle=s.color,e.shadowColor=s.color,e.shadowBlur=6,e.fill(),e.shadowBlur=0}}clear(){for(const e of this.pool)e.reset();this.activeCount=0}}class me{constructor(e){this.canvas=e,this.ctx=e.getContext("2d",{alpha:!1}),this.camera=new ce(this.canvas),this.gridRenderer=new le,this.nodeRenderer=new de,this.edgeRenderer=new pe,this.particlePool=new ue(600),this.lastFrameTime=performance.now(),this.fps=60,this.frameCount=0,this.fpsTimer=performance.now(),this.hoveredPort=null,this.connectingWire=null,this.hoveredTargetNodeId=null,this.isRunning=!1,this._rafId=null,this._setupResizeListener(),this._setupSimulationListener()}init(){this.resize(),this.isRunning=!0,this._renderLoop()}resize(){const e=window.devicePixelRatio||1,t=this.canvas.parentElement.getBoundingClientRect();this.canvas.width=Math.floor(t.width*e),this.canvas.height=Math.floor(t.height*e),this.canvas.style.width=`${t.width}px`,this.canvas.style.height=`${t.height}px`,this.ctx.scale(e,e)}_setupResizeListener(){window.addEventListener("resize",()=>this.resize()),window.ResizeObserver&&this.canvas.parentElement&&new ResizeObserver(()=>this.resize()).observe(this.canvas.parentElement)}_setupSimulationListener(){y.on(S.SIM_METRICS_UPDATED,e=>{if(d.simConfig.isRunning)for(const t of d.edges.values()){const s=d.nodes.get(t.from),i=d.nodes.get(t.to);if(!s||!i)continue;const o=this.edgeRenderer.calculateOptimalBezier(s,i),n=e.node_metrics[s.id],a=n&&n.cpu_utilization>1,r=Math.min(4,Math.max(1,Math.floor((d.simConfig.target_rps||1e4)/4e4)));for(let l=0;l<r;l++)this.particlePool.spawn({edgeId:t.id,startX:o.startX,startY:o.startY,endX:o.endX,endY:o.endY,cp1X:o.cp1X,cp1Y:o.cp1Y,cp2X:o.cp2X,cp2Y:o.cp2Y,isError:a&&Math.random()<.35,speed:.012+Math.random()*.008})}})}_renderLoop(){if(!this.isRunning)return;const e=performance.now(),t=e-this.lastFrameTime;this.lastFrameTime=e,this.frameCount++,e-this.fpsTimer>=1e3&&(this.fps=this.frameCount,this.frameCount=0,this.fpsTimer=e),this.particlePool.update(t),d.simConfig.isRunning&&Math.random()<.15&&d.stepSimulation(),this.draw(),this._rafId=requestAnimationFrame(()=>this._renderLoop())}draw(){const e=this.ctx;this.canvas;const t=d.theme,s=t==="dark",i=window.devicePixelRatio||1,o=this.camera.getViewportSize();e.setTransform(i,0,0,i,0,0),e.fillStyle=s?"#13151F":"#F8FAFC",e.fillRect(0,0,o.width,o.height),this.gridRenderer.render(e,this.camera,t),e.save(),this.camera.applyTransform(e);const n=Array.from(d.edges.values());for(const u of n){const p=d.nodes.get(u.from),m=d.nodes.get(u.to),f=d.selectedEdgeId===u.id;this.edgeRenderer.renderEdge(e,u,p,m,{isSelected:f,theme:t})}this.connectingWire&&this.edgeRenderer.renderDragPreview(e,this.connectingWire.startX,this.connectingWire.startY,this.connectingWire.currentX,this.connectingWire.currentY),this.particlePool.render(e);const a=Array.from(d.nodes.values()),r=d.simReport,l=d.analysisReport,c=new Set(l&&Array.isArray(l.spofs)?l.spofs.map(u=>u.node_id):[]);for(const u of a){const p=d.selectedNodeId===u.id,m=r&&r.node_metrics?r.node_metrics[u.id]:null,f=c.has(u.id),E=this.hoveredTargetNodeId===u.id,v=!!this.connectingWire,b=this.connectingWire?this.connectingWire.sourceNodeId:null;this.nodeRenderer.renderNode(e,u,{isSelected:p,metrics:m,isSpof:f,theme:t,hoveredPort:this.hoveredPort,isConnectTarget:E,isWireActive:v,sourceNodeId:b})}e.restore(),this._renderHud(e,o.width,o.height,s)}_renderHud(e,t,s,i){e.save(),e.font='600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',e.fillStyle=i?"#64748B":"#94A3B8",e.textAlign="right",e.fillText(`${this.fps} FPS · WebAssembly Core`,t-16,s-16),e.restore()}destroy(){this.isRunning=!1,this._rafId&&cancelAnimationFrame(this._rafId)}}class ge{constructor(e=50){this.undoStack=[],this.redoStack=[],this.maxHistory=e}execute(e){e.execute(),this.undoStack.push(e),this.undoStack.length>this.maxHistory&&this.undoStack.shift(),this.redoStack=[]}undo(){if(this.undoStack.length===0)return!1;const e=this.undoStack.pop();return e.undo(),this.redoStack.push(e),!0}redo(){if(this.redoStack.length===0)return!1;const e=this.redoStack.pop();return e.execute(),this.undoStack.push(e),!0}canUndo(){return this.undoStack.length>0}canRedo(){return this.redoStack.length>0}clear(){this.undoStack=[],this.redoStack=[]}}const $=new ge;class fe{constructor(e){this.renderer=e,this.canvas=e.canvas,this.camera=e.camera,this.draggedNode=null,this.dragStartWorldX=0,this.dragStartWorldY=0,this.initialNodeX=0,this.initialNodeY=0,this.hasMoved=!1,this.isSpacePanning=!1,this.touchMode=null,this.touchStartClientX=0,this.touchStartClientY=0,this.touchMoved=!1,this.lastPinchDist=0,this.lastPinchMidX=0,this.lastPinchMidY=0,this._bindEvents()}_bindEvents(){this.canvas.addEventListener("mousedown",e=>this._onMouseDown(e)),window.addEventListener("mousemove",e=>this._onMouseMove(e)),window.addEventListener("mouseup",e=>this._onMouseUp(e)),this.canvas.addEventListener("wheel",e=>this._onWheel(e),{passive:!1}),this.canvas.addEventListener("dragover",e=>{e.preventDefault(),e.dataTransfer.dropEffect="copy"}),this.canvas.addEventListener("drop",e=>this._onPaletteDrop(e)),this.canvas.addEventListener("touchstart",e=>this._onTouchStart(e),{passive:!1}),window.addEventListener("touchmove",e=>this._onTouchMove(e),{passive:!1}),window.addEventListener("touchend",e=>this._onTouchEnd(e),{passive:!1}),window.addEventListener("touchcancel",e=>this._onTouchCancel(e),{passive:!1})}_onMouseDown(e){if(e.button===1||this.isSpacePanning){this.camera.isPanning=!0,this.camera.lastPanX=e.clientX,this.camera.lastPanY=e.clientY;return}if(e.button!==0)return;const t=this.camera.screenToWorld(e.clientX,e.clientY);if(this._findPortNear(t.x,t.y,20)||this.renderer.connectingWire)return;const s=this._findNodeAt(t.x,t.y);if(s)this.draggedNode=s,this.dragStartWorldX=t.x,this.dragStartWorldY=t.y,this.initialNodeX=s.x,this.initialNodeY=s.y,this.hasMoved=!1,d.selectNode(s.id);else{const i=this._findEdgeAt(t.x,t.y);i?d.selectEdge(i.id):(d.clearSelection(),this.camera.isPanning=!0,this.camera.lastPanX=e.clientX,this.camera.lastPanY=e.clientY)}}_onMouseMove(e){if(this.camera.isPanning){const t=e.clientX-this.camera.lastPanX,s=e.clientY-this.camera.lastPanY;this.camera.pan(t,s),this.camera.lastPanX=e.clientX,this.camera.lastPanY=e.clientY;return}if(this.draggedNode){const t=this.camera.screenToWorld(e.clientX,e.clientY),s=t.x-this.dragStartWorldX,i=t.y-this.dragStartWorldY;(Math.abs(s)>3||Math.abs(i)>3)&&(this.hasMoved=!0);const o=this.initialNodeX+s,n=this.initialNodeY+i,a=x.GRID_SPACING,r=Math.round(o/a)*a,l=Math.round(n/a)*a;d.updateNodePosition(this.draggedNode.id,r,l)}}_onMouseUp(e){if(this.camera.isPanning&&(this.camera.isPanning=!1),this.draggedNode){const t=this.draggedNode.id,s=this.initialNodeX,i=this.initialNodeY,o=this.draggedNode.x,n=this.draggedNode.y;this.hasMoved&&(s!==o||i!==n)&&$.execute({description:`Move node ${this.draggedNode.name}`,execute:()=>d.updateNodePosition(t,o,n),undo:()=>d.updateNodePosition(t,s,i)}),this.draggedNode=null,this.hasMoved=!1}}_onWheel(e){e.preventDefault();const t=-e.deltaY*x.ZOOM_SPEED;this.camera.zoomAt(t,e.clientX,e.clientY)}_onTouchStart(e){if(!this.renderer.connectingWire){if(e.touches.length===1){const t=e.touches[0],s=this.camera.screenToWorld(t.clientX,t.clientY);if(this._findPortNear(s.x,s.y,26))return;this.touchStartClientX=t.clientX,this.touchStartClientY=t.clientY,this.touchMoved=!1;const i=this._findNodeAt(s.x,s.y);i?(this.touchMode="drag-node",this.draggedNode=i,this.dragStartWorldX=s.x,this.dragStartWorldY=s.y,this.initialNodeX=i.x,this.initialNodeY=i.y,this.hasMoved=!1):(this.touchMode="pan",this.camera.isPanning=!0,this.camera.lastPanX=t.clientX,this.camera.lastPanY=t.clientY)}else if(e.touches.length===2){e.preventDefault(),this.touchMode="pinch",this.camera.isPanning=!1,this.draggedNode=null;const t=e.touches[0],s=e.touches[1];this.lastPinchDist=Math.hypot(t.clientX-s.clientX,t.clientY-s.clientY),this.lastPinchMidX=(t.clientX+s.clientX)/2,this.lastPinchMidY=(t.clientY+s.clientY)/2}}}_onTouchMove(e){if(this.touchMode==="pinch"&&e.touches.length>=2){e.preventDefault();const t=e.touches[0],s=e.touches[1],i=Math.hypot(t.clientX-s.clientX,t.clientY-s.clientY),o=(t.clientX+s.clientX)/2,n=(t.clientY+s.clientY)/2;if(this.lastPinchDist>0){const r=(i-this.lastPinchDist)/200;this.camera.zoomAt(r,o,n);const l=o-this.lastPinchMidX,c=n-this.lastPinchMidY;this.camera.pan(l,c)}this.lastPinchDist=i,this.lastPinchMidX=o,this.lastPinchMidY=n;return}if(e.touches.length===1){const t=e.touches[0];if(Math.hypot(t.clientX-this.touchStartClientX,t.clientY-this.touchStartClientY)>6&&(this.touchMoved=!0),this.touchMode==="pan"&&this.camera.isPanning){e.preventDefault();const i=t.clientX-this.camera.lastPanX,o=t.clientY-this.camera.lastPanY;this.camera.pan(i,o),this.camera.lastPanX=t.clientX,this.camera.lastPanY=t.clientY;return}if(this.touchMode==="drag-node"&&this.draggedNode){e.preventDefault();const i=this.camera.screenToWorld(t.clientX,t.clientY),o=i.x-this.dragStartWorldX,n=i.y-this.dragStartWorldY;(Math.abs(o)>3||Math.abs(n)>3)&&(this.hasMoved=!0);const a=this.initialNodeX+o,r=this.initialNodeY+n,l=x.GRID_SPACING,c=Math.round(a/l)*l,u=Math.round(r/l)*l;d.updateNodePosition(this.draggedNode.id,c,u)}}}_onTouchEnd(e){if(this.touchMode==="drag-node"&&this.draggedNode){const t=this.draggedNode,s=t.id,i=this.initialNodeX,o=this.initialNodeY,n=t.x,a=t.y;this.hasMoved&&(i!==n||o!==a)&&$.execute({description:`Move node ${t.name}`,execute:()=>d.updateNodePosition(s,n,a),undo:()=>d.updateNodePosition(s,i,o)}),this.touchMoved||d.selectNode(s),this.draggedNode=null,this.hasMoved=!1}else if(this.touchMode==="pan"&&(this.camera.isPanning=!1,!this.touchMoved)){const t=this.camera.screenToWorld(this.touchStartClientX,this.touchStartClientY),s=this._findEdgeAt(t.x,t.y);s?d.selectEdge(s.id):d.clearSelection()}this.touchMode=null,this.touchMoved=!1,this.lastPinchDist=0}_onTouchCancel(){this.camera.isPanning=!1,this.draggedNode=null,this.touchMode=null,this.touchMoved=!1,this.lastPinchDist=0}_onPaletteDrop(e){e.preventDefault();const t=e.dataTransfer.getData("text/plain")||e.dataTransfer.getData("application/x-component-type"),s=e.dataTransfer.getData("application/x-model-id")||null;if(!t)return;const i=this.camera.screenToWorld(e.clientX,e.clientY),o=x.GRID_SPACING,n=Math.round((i.x-x.NODE_WIDTH/2)/o)*o,a=Math.round((i.y-x.NODE_HEIGHT/2)/o)*o,r={component_type:t,model_id:s,x:n,y:a};let l=null;$.execute({description:`Add ${t}`,execute:()=>{const c=d.addNode(r);l=c.id,d.selectNode(c.id)},undo:()=>{l&&d.removeNode(l)}})}_findNodeAt(e,t){const s=x.NODE_WIDTH,i=x.NODE_HEIGHT,o=Array.from(d.nodes.values()).reverse();for(const n of o)if(e>=n.x&&e<=n.x+s&&t>=n.y&&t<=n.y+i)return n;return null}_findEdgeAt(e,t){for(const s of d.edges.values()){const i=d.nodes.get(s.from),o=d.nodes.get(s.to);if(!i||!o)continue;const n=this.renderer.edgeRenderer.calculateOptimalBezier(i,o);for(let a=.1;a<=.9;a+=.1){const r=Math.pow(1-a,3)*n.startX+3*Math.pow(1-a,2)*a*n.cp1X+3*(1-a)*Math.pow(a,2)*n.cp2X+Math.pow(a,3)*n.endX,l=Math.pow(1-a,3)*n.startY+3*Math.pow(1-a,2)*a*n.cp1Y+3*(1-a)*Math.pow(a,2)*n.cp2Y+Math.pow(a,3)*n.endY;if(Math.hypot(e-r,t-l)<14)return s}}return null}_findPortNear(e,t,s=20){for(const i of d.nodes.values()){const o=this.renderer.nodeRenderer.getNodePorts(i);for(const n of o)if(Math.hypot(e-n.x,t-n.y)<=s)return n}return null}}function ye({title:g="Confirm Action",message:e="Are you sure you want to proceed?",confirmText:t="Confirm",cancelText:s="Cancel",isDanger:i=!1}={}){return new Promise(o=>{const n=document.getElementById("custom-confirm-modal");n&&n.remove();const a=document.createElement("div");a.id="custom-confirm-modal",a.className="custom-modal-overlay",a.innerHTML=`
      <div class="custom-modal-card">
        <div class="modal-icon-wrap ${i?"danger":"info"}">
          ${i?'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>':'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'}
        </div>
        <div class="modal-content">
          <h3 class="modal-title">${g}</h3>
          <p class="modal-message">${e}</p>
        </div>
        <div class="modal-actions">
          <button id="modal-btn-cancel" class="modal-btn secondary">${s}</button>
          <button id="modal-btn-confirm" class="modal-btn ${i?"danger":"primary"}">${t}</button>
        </div>
      </div>
    `,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("open"));const r=c=>{a.classList.remove("open"),setTimeout(()=>a.remove(),200),window.removeEventListener("keydown",l),o(c)},l=c=>{c.key==="Escape"&&r(!1),c.key==="Enter"&&r(!0)};window.addEventListener("keydown",l),a.querySelector("#modal-btn-cancel").addEventListener("click",()=>r(!1)),a.querySelector("#modal-btn-confirm").addEventListener("click",()=>r(!0)),a.addEventListener("click",c=>{c.target===a&&r(!1)})})}function A(g,e="info",t=3e3){let s=document.getElementById("toast-container");s||(s=document.createElement("div"),s.id="toast-container",s.className="toast-container",document.body.appendChild(s));const i=document.createElement("div");i.className=`toast-item ${e}`;const o=e==="success"?"✓":e==="error"?"⚠️":"ℹ️";i.innerHTML=`
    <span class="toast-icon">${o}</span>
    <span class="toast-text">${g}</span>
  `,s.appendChild(i),requestAnimationFrame(()=>i.classList.add("show")),setTimeout(()=>{i.classList.remove("show"),setTimeout(()=>i.remove(),250)},t)}class ve{constructor(e){this.renderer=e,this.canvas=e.canvas,this.camera=e.camera,this.nodeRenderer=e.nodeRenderer,this.activeWire=null,this._bindEvents()}_bindEvents(){this.canvas.addEventListener("mousemove",e=>this._onMouseMove(e)),this.canvas.addEventListener("mousedown",e=>this._onMouseDown(e)),window.addEventListener("mouseup",e=>this._onMouseUp(e)),this.canvas.addEventListener("touchstart",e=>this._onTouchStart(e),{passive:!1}),window.addEventListener("touchmove",e=>this._onTouchMove(e),{passive:!1}),window.addEventListener("touchend",e=>this._onTouchEnd(e),{passive:!1}),window.addEventListener("keydown",e=>{e.key==="Escape"&&this.activeWire&&this._cancelWire()}),this.canvas.addEventListener("contextmenu",e=>{this.activeWire&&(e.preventDefault(),this._cancelWire())})}_onTouchStart(e){if(e.touches.length!==1)return;const t=e.touches[0],s=this.camera.screenToWorld(t.clientX,t.clientY);if(this.activeWire){e.preventDefault();const o=this._findTargetNodeOrPortNear(s.x,s.y);o&&o.node.id!==this.activeWire.sourceNodeId?this._completeConnection(this.activeWire.sourceNodeId,o.node.id):this._cancelWire();return}const i=this._findPortNear(s.x,s.y,28);i&&(e.preventDefault(),e.stopPropagation(),this.activeWire={startX:i.x,startY:i.y,currentX:i.x,currentY:i.y,sourceNodeId:i.nodeId,sourceSide:i.side,startScreenX:t.clientX,startScreenY:t.clientY,dragged:!1},this.renderer.connectingWire=this.activeWire)}_onTouchMove(e){if(!this.activeWire||e.touches.length!==1)return;e.preventDefault();const t=e.touches[0],s=this.camera.screenToWorld(t.clientX,t.clientY);Math.hypot(t.clientX-this.activeWire.startScreenX,t.clientY-this.activeWire.startScreenY)>10&&(this.activeWire.dragged=!0);const o=this._findTargetNodeOrPortNear(s.x,s.y);o&&o.node.id!==this.activeWire.sourceNodeId?(this.renderer.hoveredTargetNodeId=o.node.id,o.port?(this.activeWire.currentX=o.port.x,this.activeWire.currentY=o.port.y):(this.activeWire.currentX=s.x,this.activeWire.currentY=s.y)):(this.renderer.hoveredTargetNodeId=null,this.activeWire.currentX=s.x,this.activeWire.currentY=s.y),this.renderer.connectingWire=this.activeWire}_onTouchEnd(e){this.activeWire&&this.activeWire.dragged&&(this.renderer.hoveredTargetNodeId&&this.renderer.hoveredTargetNodeId!==this.activeWire.sourceNodeId?this._completeConnection(this.activeWire.sourceNodeId,this.renderer.hoveredTargetNodeId):this._cancelWire())}_onMouseMove(e){const t=this.camera.screenToWorld(e.clientX,e.clientY);if(this.activeWire){Math.hypot(e.clientX-this.activeWire.startScreenX,e.clientY-this.activeWire.startScreenY)>5&&(this.activeWire.dragged=!0);const o=this._findTargetNodeOrPortNear(t.x,t.y);o&&o.node.id!==this.activeWire.sourceNodeId?(this.renderer.hoveredTargetNodeId=o.node.id,o.port?(this.activeWire.currentX=o.port.x,this.activeWire.currentY=o.port.y):(this.activeWire.currentX=t.x,this.activeWire.currentY=t.y),this.canvas.style.cursor="pointer"):(this.renderer.hoveredTargetNodeId=null,this.activeWire.currentX=t.x,this.activeWire.currentY=t.y,this.canvas.style.cursor="crosshair"),this.renderer.connectingWire=this.activeWire;return}const s=this._findPortNear(t.x,t.y,22);s!==this.renderer.hoveredPort&&(this.renderer.hoveredPort=s,this.canvas.style.cursor=s?"crosshair":"default")}_onMouseDown(e){if(e.button!==0)return;const t=this.camera.screenToWorld(e.clientX,e.clientY);if(this.activeWire){const i=this._findTargetNodeOrPortNear(t.x,t.y);i&&i.node.id!==this.activeWire.sourceNodeId?this._completeConnection(this.activeWire.sourceNodeId,i.node.id):this._cancelWire();return}const s=this._findPortNear(t.x,t.y,24);s&&(e.stopPropagation(),this.activeWire={startX:s.x,startY:s.y,currentX:s.x,currentY:s.y,sourceNodeId:s.nodeId,sourceSide:s.side,startScreenX:e.clientX,startScreenY:e.clientY,dragged:!1},this.renderer.connectingWire=this.activeWire,this.canvas.style.cursor="crosshair")}_onMouseUp(e){if(this.activeWire&&this.activeWire.dragged){const t=this.camera.screenToWorld(e.clientX,e.clientY),s=this._findTargetNodeOrPortNear(t.x,t.y);s&&s.node.id!==this.activeWire.sourceNodeId?this._completeConnection(this.activeWire.sourceNodeId,s.node.id):this._cancelWire()}}_completeConnection(e,t){const s=d.nodes.get(e),i=d.nodes.get(t);if(s&&i){let o=null;$.execute({description:`Connect ${s.name} -> ${i.name}`,execute:()=>{const n=d.addEdge({from:e,to:t,protocol:"HTTP/REST"});n&&(o=n.id)},undo:()=>{o&&d.removeEdge(o)}}),A(`Connected ${s.name} → ${i.name}`,"success",2200)}this._cancelWire()}_cancelWire(){this.activeWire=null,this.renderer.connectingWire=null,this.renderer.hoveredTargetNodeId=null,this.canvas.style.cursor="default"}_findPortNear(e,t,s=22){for(const i of d.nodes.values()){const o=this.nodeRenderer.getNodePorts(i);for(const n of o)if(Math.hypot(e-n.x,t-n.y)<=s)return n}return null}_findTargetNodeOrPortNear(e,t){const s=this.activeWire?this.activeWire.sourceNodeId:null;for(const a of d.nodes.values()){if(a.id===s)continue;const r=this.nodeRenderer.getNodePorts(a);for(const l of r)if(Math.hypot(e-l.x,t-l.y)<=26)return{node:a,port:l}}const i=x.NODE_WIDTH,o=x.NODE_HEIGHT,n=18;for(const a of Array.from(d.nodes.values()).reverse())if(a.id!==s&&e>=a.x-n&&e<=a.x+i+n&&t>=a.y-n&&t<=a.y+o+n)return{node:a,port:null};return null}}class be{constructor(e){this.dragDrop=e,this._bindEvents()}_bindEvents(){window.addEventListener("keydown",e=>this._onKeyDown(e)),window.addEventListener("keyup",e=>this._onKeyUp(e))}_onKeyDown(e){const t=(e.target.tagName||"").toLowerCase();if(t==="input"||t==="textarea"||e.target.isContentEditable)return;const i=navigator.platform.toUpperCase().indexOf("MAC")>=0?e.metaKey:e.ctrlKey;if(e.key==="Delete"||e.key==="Backspace"){if(d.selectedNodeId){const o=d.selectedNodeId,n=d.nodes.get(o);if(n){e.preventDefault();const a=Array.from(d.edges.values()).filter(r=>r.from===o||r.to===o);$.execute({description:`Delete node ${n.name}`,execute:()=>d.removeNode(o),undo:()=>{d.addNode(n);for(const r of a)d.addEdge(r)}})}}else if(d.selectedEdgeId){const o=d.selectedEdgeId,n=d.edges.get(o);n&&(e.preventDefault(),$.execute({description:"Delete edge",execute:()=>d.removeEdge(o),undo:()=>d.addEdge(n)}))}}i&&!e.shiftKey&&e.key.toLowerCase()==="z"&&(e.preventDefault(),$.undo()),(i&&e.key.toLowerCase()==="y"||i&&e.shiftKey&&e.key.toLowerCase()==="z")&&(e.preventDefault(),$.redo()),e.code==="Space"&&!this.dragDrop.isSpacePanning&&(this.dragDrop.isSpacePanning=!0,this.dragDrop.canvas.style.cursor="grab"),e.key==="Escape"&&(d.clearSelection(),this.dragDrop.renderer.connectingWire&&(this.dragDrop.renderer.connectingWire=null))}_onKeyUp(e){e.code==="Space"&&(this.dragDrop.isSpacePanning=!1,this.dragDrop.canvas.style.cursor="default")}}class Se{constructor(){this.deferredPrompt=null,this.isStandalone=!1,this._checkStandalone(),this._initServiceWorker(),this._bindInstallPrompt()}_checkStandalone(){this.isStandalone=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===!0||document.referrer.includes("android-app://")}_initServiceWorker(){"serviceWorker"in navigator&&(window.location.protocol==="https:"||window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1")&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>{console.log("[SystemFlow PWA] Service Worker registered. Scope:",e.scope),e.onupdatefound=()=>{const t=e.installing;t&&(t.onstatechange=()=>{t.state==="installed"&&navigator.serviceWorker.controller&&A("New version of SystemFlow available. Refresh to update!","info",5e3)})}}).catch(e=>{console.warn("[SystemFlow PWA] Service Worker registration failed:",e)})})}_bindInstallPrompt(){window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),this.deferredPrompt=e,console.log("[SystemFlow PWA] App install prompt captured"),this._updateInstallButtons(!0),y.emit("pwa:install-ready")}),window.addEventListener("appinstalled",()=>{this.deferredPrompt=null,this.isStandalone=!0,this._updateInstallButtons(!1),console.log("[SystemFlow PWA] App installed successfully"),A("SystemFlow installed to your device!","success"),y.emit("pwa:installed")})}_updateInstallButtons(e){const t=document.getElementById("btn-pwa-install"),s=document.getElementById("menu-opt-pwa-install");t&&(t.style.display=e&&!this.isStandalone?"inline-flex":"none"),s&&(s.style.display=e&&!this.isStandalone?"flex":"none")}get canInstall(){return!!this.deferredPrompt&&!this.isStandalone}async promptInstall(){if(!this.deferredPrompt)return A("SystemFlow is already installed or your browser does not support installation prompts directly.","info"),!1;try{this.deferredPrompt.prompt();const e=await this.deferredPrompt.userChoice;return console.log("[SystemFlow PWA] User install choice:",e.outcome),e.outcome==="accepted"&&A("Installing SystemFlow...","info"),this.deferredPrompt=null,this._updateInstallButtons(!1),e.outcome==="accepted"}catch(e){return console.error("[SystemFlow PWA] Error displaying install prompt:",e),!1}}}const j=new Se;class _e{constructor(e,t){this.container=e,this.renderer=t,this.render(),this._bindEvents()}render(){const e=d.theme==="dark";this.container.innerHTML=`
      <div class="toolbar-left">
        <div class="brand" title="SystemFlow — System Design Simulator">
          <img class="brand-logo" src="./icons/systemflow-192.png?v=white" alt="SystemFlow Logo" width="32" height="32" />
          <div class="brand-text">
            <span class="brand-title">SystemFlow</span>
          </div>
        </div>

        <!-- Sidebar Toggle Button -->
        <button id="btn-toolbar-toggle-sidebar" class="toolbar-btn btn-sidebar-toggle active" title="Toggle Components Sidebar (Ctrl+[)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <span>Sidebar</span>
        </button>

        <div class="toolbar-divider"></div>

        <div class="btn-group">
          <button id="btn-undo" class="toolbar-btn" title="Undo (Cmd+Z)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            <span>Undo</span>
          </button>
          <button id="btn-redo" class="toolbar-btn" title="Redo (Cmd+Y)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            <span>Redo</span>
          </button>
        </div>

        <div class="btn-group">
          <button id="btn-fit" class="toolbar-btn" title="Fit Content to View">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            <span>Fit View</span>
          </button>
          <button id="btn-reset" class="toolbar-btn text-danger" title="Clear Canvas">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- Live Resilience Score Pill -->
        <button id="btn-toggle-eval" class="eval-score-pill" title="View Real-Time SPOF & Architecture Analysis">
          <span class="score-indicator-dot" id="score-dot"></span>
          <span>Health:</span>
          <strong id="toolbar-score-val">100%</strong>
        </button>

        <!-- Beginner Tutorial Button -->
        <button id="btn-tutorial" class="toolbar-btn btn-tutorial" title="Open Beginner System Design Tutorial">
          <span>🎓</span>
          <span>Tutorial</span>
        </button>

        <div class="btn-group">
          <button id="btn-export-json" class="toolbar-btn" title="Export Architecture JSON">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Save</span>
          </button>
          <label class="toolbar-btn" title="Import Architecture JSON">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Load</span>
            <input type="file" id="input-import-json" accept=".json" style="display: none;">
          </label>
        </div>

        <!-- Theme Toggle Switch -->
        <button id="btn-theme" class="theme-toggle-btn" title="Toggle Light / Dark Mode">
          ${e?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'}
        </button>

        <!-- More Actions Menu Button (Mobile & Narrow Screens) -->
        <button id="btn-mobile-more" class="theme-toggle-btn" title="More Options">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>

        <!-- Mobile More Menu Popover -->
        <div id="mobile-more-popover" class="mobile-menu-popover">
          <button id="menu-opt-tutorial" class="mobile-menu-item">
            🎓 System Design Tutorial
          </button>
          <button id="menu-opt-theme" class="mobile-menu-item">
            ${e?"☀️ Switch to Light Mode":"🌙 Switch to Dark Mode"}
          </button>
          <button id="menu-opt-export" class="mobile-menu-item">
            💾 Save Architecture JSON
          </button>
          <label class="mobile-menu-item" style="cursor: pointer;">
            📂 Load Architecture JSON
            <input type="file" id="input-import-json-mobile" accept=".json" style="display: none;">
          </label>
          <div class="mobile-menu-divider"></div>
          <button id="menu-opt-pwa-install" class="mobile-menu-item" style="${j.canInstall?"display: flex;":"display: none;"}">
            📲 Install SystemFlow App
          </button>
          <button id="menu-opt-reset" class="mobile-menu-item danger">
            🗑️ Reset Canvas
          </button>
        </div>

        <!-- PWA Install Button -->
        <button id="btn-pwa-install" class="toolbar-btn btn-pwa-install" style="${j.canInstall?"display: inline-flex;":"display: none;"}" title="Install SystemFlow App">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Install</span>
        </button>

        <!-- AI Assistant Toggle Button -->
        <button id="btn-toggle-ai" class="btn-ai-sparkle" title="Toggle AI Architect (LangChain)">
          <span class="ai-sparkle-icon">✨</span>
          <span>AI Architect</span>
        </button>
      </div>
    `}_bindEvents(){this.container.querySelector("#btn-reset").addEventListener("click",async()=>{await ye({title:"Reset Architecture?",message:"This will clear all components, connection wires, and live traffic from the canvas. You can undo this action with Cmd+Z.",confirmText:"Reset Canvas",cancelText:"Cancel",isDanger:!0})&&(d.clearGraph(),A("Canvas reset successfully","info"))}),this.container.querySelector("#btn-undo").addEventListener("click",()=>$.undo()),this.container.querySelector("#btn-redo").addEventListener("click",()=>$.redo()),this.container.querySelector("#btn-fit").addEventListener("click",()=>{this.renderer.camera.fitToContent(d.nodes)}),this.container.querySelector("#btn-theme").addEventListener("click",()=>{d.toggleTheme(),this.render(),this._bindEvents()});const e=this.container.querySelector("#btn-tutorial");e&&e.addEventListener("click",()=>{window.appOnboarding&&window.appOnboarding.show(!0)}),this.container.querySelector("#btn-toggle-ai").addEventListener("click",()=>{y.emit(S.PANEL_TOGGLED,{panel:"ai"})}),this.container.querySelector("#btn-toggle-eval").addEventListener("click",()=>{y.emit(S.PANEL_TOGGLED,{panel:"evaluation"})}),this.container.querySelector("#btn-export-json").addEventListener("click",()=>{const n={nodes:Array.from(d.nodes.values()),edges:Array.from(d.edges.values()),targetRps:d.simConfig.target_rps},a=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),r=URL.createObjectURL(a),l=document.createElement("a");l.href=r,l.download=`systemflow-architecture-${Date.now()}.json`,l.click(),URL.revokeObjectURL(r),A("Architecture exported to JSON","success")}),this.container.querySelector("#input-import-json").addEventListener("change",n=>{const a=n.target.files[0];if(!a)return;const r=new FileReader;r.onload=l=>{try{const c=JSON.parse(l.target.result);d.loadGraph(c),c.targetRps&&d.updateSimConfig({target_rps:c.targetRps}),A("Architecture loaded successfully","success")}catch(c){A("Failed to parse architecture JSON: "+c.message,"error")}},r.readAsText(a)});const t=this.container.querySelector("#btn-mobile-more"),s=this.container.querySelector("#mobile-more-popover");if(t&&s){t.addEventListener("click",r=>{r.stopPropagation(),s.classList.toggle("open")}),window.addEventListener("click",r=>{!s.contains(r.target)&&r.target!==t&&s.classList.remove("open")});const n=this.container.querySelector("#menu-opt-tutorial");n&&n.addEventListener("click",()=>{s.classList.remove("open"),window.appOnboarding&&window.appOnboarding.show(!0)}),this.container.querySelector("#menu-opt-theme").addEventListener("click",()=>{s.classList.remove("open"),d.toggleTheme(),this.render(),this._bindEvents()}),this.container.querySelector("#menu-opt-export").addEventListener("click",()=>{s.classList.remove("open"),this.container.querySelector("#btn-export-json").click()});const a=this.container.querySelector("#input-import-json-mobile");a&&a.addEventListener("change",r=>{s.classList.remove("open");const l=r.target.files[0];if(!l)return;const c=new FileReader;c.onload=u=>{try{const p=JSON.parse(u.target.result);d.loadGraph(p),p.targetRps&&d.updateSimConfig({target_rps:p.targetRps}),A("Architecture loaded successfully","success")}catch(p){A("Failed to load JSON: "+p.message,"error")}},c.readAsText(l)}),this.container.querySelector("#menu-opt-reset").addEventListener("click",()=>{s.classList.remove("open"),this.container.querySelector("#btn-reset").click()})}const i=this.container.querySelector("#btn-pwa-install");i&&i.addEventListener("click",()=>j.promptInstall());const o=this.container.querySelector("#menu-opt-pwa-install");o&&o.addEventListener("click",()=>{const n=this.container.querySelector("#mobile-more-popover");n&&n.classList.remove("open"),j.promptInstall()}),y.on("pwa:install-ready",()=>{const n=this.container.querySelector("#btn-pwa-install"),a=this.container.querySelector("#menu-opt-pwa-install");n&&(n.style.display="inline-flex"),a&&(a.style.display="flex")}),y.on("pwa:installed",()=>{const n=this.container.querySelector("#btn-pwa-install"),a=this.container.querySelector("#menu-opt-pwa-install");n&&(n.style.display="none"),a&&(a.style.display="none")}),y.on(S.ANALYSIS_UPDATED,n=>{const a=this.container.querySelector("#toolbar-score-val"),r=this.container.querySelector("#score-dot");a&&r&&(a.textContent=`${n.architecture_score}%`,r.style.background=n.architecture_score>=80?"#10B981":n.architecture_score>=60?"#F59E0B":"#EF4444")})}}class we{constructor(e){this.container=e,this.sidebar=document.getElementById("app-sidebar"),this.inspector=document.getElementById("app-inspector"),this.sidebarBackdrop=document.getElementById("sidebar-backdrop"),this.inspectorBackdrop=document.getElementById("inspector-backdrop"),this.loadHud=document.getElementById("load-hud"),this.metricsHud=document.getElementById("metrics-hud"),this.render(),this._bindEvents()}render(){this.container.innerHTML=`
      <button id="mobile-nav-components" class="mobile-nav-btn" title="Open Components Palette">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </span>
        <span class="mobile-nav-label">Components</span>
      </button>

      <button id="mobile-nav-load" class="mobile-nav-btn" title="Toggle Synthetic Load">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </span>
        <span class="mobile-nav-label">Traffic Load</span>
      </button>

      <button id="mobile-nav-metrics" class="mobile-nav-btn" title="Toggle Metrics Telemetry">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </span>
        <span class="mobile-nav-label">Metrics</span>
      </button>

      <button id="mobile-nav-inspect" class="mobile-nav-btn" title="Configure Selected Node">
        <span class="mobile-nav-badge" id="mobile-inspect-badge"></span>
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </span>
        <span class="mobile-nav-label">Inspect</span>
      </button>

      <button id="mobile-nav-ai" class="mobile-nav-btn" title="Open AI Architect">
        <span class="mobile-nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
          </svg>
        </span>
        <span class="mobile-nav-label">AI Chat</span>
      </button>
    `}_bindEvents(){const e=this.container.querySelector("#mobile-nav-components"),t=this.container.querySelector("#mobile-nav-load"),s=this.container.querySelector("#mobile-nav-metrics"),i=this.container.querySelector("#mobile-nav-inspect"),o=this.container.querySelector("#mobile-nav-ai"),n=this.container.querySelector("#mobile-inspect-badge");e.addEventListener("click",()=>{this.closeInspector(),this.toggleSidebar()}),t.addEventListener("click",()=>{this.closeInspector(),this.openSidebar();const a=document.getElementById("load-hud");if(a){a.scrollIntoView({behavior:"smooth",block:"nearest"});const r=a.querySelector(".load-card");if(r&&r.classList.contains("collapsed")){const l=a.querySelector("#btn-collapse-load");l&&l.click()}}}),s.addEventListener("click",()=>{if(!this.metricsHud)return;const a=this.metricsHud.classList.toggle("mobile-hidden");s.classList.toggle("active",!a)}),i.addEventListener("click",()=>{this.closeSidebar(),this.toggleInspector()}),o.addEventListener("click",()=>{this.closeSidebar(),this.closeInspector(),y.emit(S.PANEL_TOGGLED,{panel:"ai"})}),this.sidebarBackdrop&&this.sidebarBackdrop.addEventListener("click",()=>this.closeSidebar()),this.inspectorBackdrop&&this.inspectorBackdrop.addEventListener("click",()=>{d.clearSelection(),this.closeInspector()}),y.on(S.SELECTION_CHANGED,({node:a})=>{n&&n.classList.toggle("active",!!a)})}toggleSidebar(){if(!this.sidebar)return;const e=this.sidebar.classList.toggle("mobile-open");this.sidebarBackdrop&&this.sidebarBackdrop.classList.toggle("active",e)}openSidebar(){this.sidebar&&(this.sidebar.classList.add("mobile-open"),this.sidebarBackdrop&&this.sidebarBackdrop.classList.add("active"))}closeSidebar(){this.sidebar&&this.sidebar.classList.remove("mobile-open"),this.sidebarBackdrop&&this.sidebarBackdrop.classList.remove("active")}toggleInspector(){if(!this.inspector)return;const e=this.inspector.classList.toggle("mobile-open");this.inspectorBackdrop&&this.inspectorBackdrop.classList.toggle("active",e)}closeInspector(){this.inspector&&this.inspector.classList.remove("mobile-open"),this.inspectorBackdrop&&this.inspectorBackdrop.classList.remove("active")}}const z=[{id:"url-shortener",title:"URL Shortener (Bitly)",difficulty:"Easy",difficultyRank:1,tag:"Read-Heavy Caching",description:"Design a high-scale service that generates 7-character aliases for long URLs with high read:write ratio (100:1) and sub-10ms redirection.",targetRps:12e4,readWriteRatio:.99,learningObjectives:["Base62 encoding vs MD5/SHA256 hashing","Read-heavy cache-aside pattern with Redis","Database sharding based on short key hash","301 Permanent vs 302 Temporary redirects"],graph:{nodes:[{id:"c1",name:"Global Users",component_type:h.CLIENT,x:280,y:40},{id:"lb1",name:"Cloudflare Edge LB",component_type:h.LOAD_BALANCER,x:280,y:180,config:{lb_algorithm:"Round Robin"}},{id:"gw1",name:"API Gateway",component_type:h.API_GATEWAY,x:280,y:320},{id:"s1",name:"Redirect Service A",component_type:h.MICROSERVICE,x:140,y:460,config:{instances:4}},{id:"s2",name:"Redirect Service B",component_type:h.MICROSERVICE,x:420,y:460,config:{instances:4}},{id:"cache1",name:"Redis URL Cache",component_type:h.CACHE,x:140,y:600,config:{eviction_policy:"LRU",max_memory_mb:8192,cache_hit_ratio:.92}},{id:"db1",name:"PostgreSQL URL Store",component_type:h.DATABASE,x:420,y:600,config:{db_type:"SQL Relational",read_replicas:3,sharding_strategy:"Hash"}}],edges:[{id:"e1",from:"c1",to:"lb1",protocol:"HTTPS"},{id:"e2",from:"lb1",to:"gw1",protocol:"HTTP/2"},{id:"e3",from:"gw1",to:"s1",protocol:"gRPC"},{id:"e4",from:"gw1",to:"s2",protocol:"gRPC"},{id:"e5",from:"s1",to:"cache1",protocol:"Redis TCP"},{id:"e6",from:"s2",to:"cache1",protocol:"Redis TCP"},{id:"e7",from:"cache1",to:"db1",protocol:"Postgres wire"}]}},{id:"pastebin",title:"Pastebin / Text Storage",difficulty:"Easy",difficultyRank:2,tag:"Object Storage & TTL",description:"Design a text-sharing platform where users paste snippets, receive a unique shareable URL, and snippets automatically expire after a specified TTL.",targetRps:6e4,readWriteRatio:.9,learningObjectives:["Storing metadata in SQL vs raw paste text in Object Storage (S3)","CDN caching for viral or frequently viewed text pastes","Scheduled cleanup worker vs TTL-based lazy expiration"],graph:{nodes:[{id:"c1",name:"Web / API Clients",component_type:h.CLIENT,x:280,y:40},{id:"cdn1",name:"CloudFront CDN",component_type:h.CDN,x:280,y:170,config:{edge_cache_ratio:.8}},{id:"lb1",name:"Application LB",component_type:h.LOAD_BALANCER,x:280,y:300},{id:"s1",name:"Paste Web Service",component_type:h.MICROSERVICE,x:280,y:440,config:{instances:3}},{id:"cache1",name:"Redis Hot Pastes",component_type:h.CACHE,x:120,y:580,config:{eviction_policy:"LRU"}},{id:"db1",name:"Metadata DB (Postgres)",component_type:h.DATABASE,x:440,y:580,config:{db_type:"SQL Relational"}}],edges:[{id:"e1",from:"c1",to:"cdn1",protocol:"HTTPS"},{id:"e2",from:"cdn1",to:"lb1",protocol:"HTTPS"},{id:"e3",from:"lb1",to:"s1",protocol:"HTTP/2"},{id:"e4",from:"s1",to:"cache1",protocol:"Redis"},{id:"e5",from:"s1",to:"db1",protocol:"SQL"}]}},{id:"rate-limiter",title:"Distributed API Rate Limiter",difficulty:"Medium",difficultyRank:3,tag:"Sliding Window & Token Bucket",description:"Design a distributed rate limiter safeguarding downstream microservices against DoS attacks, API scraping, and quota exhaustion.",targetRps:2e5,readWriteRatio:.5,learningObjectives:["Token bucket vs Leaky bucket vs Sliding window log algorithms","Redis Lua scripts to achieve atomic check-and-increment operations","Handling race conditions across distributed gateway instances"],graph:{nodes:[{id:"c1",name:"External API Consumers",component_type:h.CLIENT,x:280,y:40},{id:"lb1",name:"Edge Load Balancer",component_type:h.LOAD_BALANCER,x:280,y:170},{id:"gw1",name:"Kong API Gateway",component_type:h.API_GATEWAY,x:280,y:300},{id:"cache1",name:"Redis Token Buckets",component_type:h.CACHE,x:120,y:440,config:{eviction_policy:"Random",max_memory_mb:4096}},{id:"s1",name:"Core Business API",component_type:h.MICROSERVICE,x:440,y:440,config:{instances:5}},{id:"db1",name:"Core DB",component_type:h.DATABASE,x:440,y:580}],edges:[{id:"e1",from:"c1",to:"lb1",protocol:"HTTPS"},{id:"e2",from:"lb1",to:"gw1",protocol:"HTTP/2"},{id:"e3",from:"gw1",to:"cache1",protocol:"Atomic Lua"},{id:"e4",from:"gw1",to:"s1",protocol:"Internal gRPC"},{id:"e5",from:"s1",to:"db1",protocol:"SQL"}]}},{id:"chat-application",title:"Chat Application (WhatsApp / Slack)",difficulty:"Medium",difficultyRank:4,tag:"WebSockets & Fan-out",description:"Design a real-time messaging system supporting 1-on-1 chats, group messaging, online presence indicators, and offline message synchronization.",targetRps:18e4,readWriteRatio:.6,learningObjectives:["Maintaining persistent stateful WebSocket connections","Message broker (Kafka/RabbitMQ) for group chat fan-out","Cassandra or HBase for wide-column append-only message history","Redis Pub/Sub or DynamoDB for user presence tracking"],graph:{nodes:[{id:"c1",name:"Mobile / Web Chatters",component_type:h.CLIENT,x:280,y:40},{id:"lb1",name:"NLB (TCP / WSS)",component_type:h.LOAD_BALANCER,x:280,y:170,config:{lb_algorithm:"Consistent Hashing"}},{id:"s1",name:"WebSocket Server Cluster",component_type:h.MICROSERVICE,x:140,y:310,config:{instances:6}},{id:"s2",name:"Chat REST / Auth Service",component_type:h.MICROSERVICE,x:420,y:310,config:{instances:3}},{id:"q1",name:"Kafka Message Bus",component_type:h.MESSAGE_QUEUE,x:140,y:460,config:{queue_type:"Kafka Log",partitions:32}},{id:"cache1",name:"Redis Presence Map",component_type:h.CACHE,x:420,y:460},{id:"db1",name:"Cassandra Chat History",component_type:h.DATABASE,x:280,y:600,config:{db_type:"NoSQL Document",sharding_strategy:"Hash"}}],edges:[{id:"e1",from:"c1",to:"lb1",protocol:"WSS / TCP"},{id:"e2",from:"lb1",to:"s1",protocol:"WebSocket"},{id:"e3",from:"lb1",to:"s2",protocol:"HTTPS"},{id:"e4",from:"s1",to:"q1",protocol:"Kafka Producer"},{id:"e5",from:"s1",to:"cache1",protocol:"In-Memory Key/Val"},{id:"e6",from:"q1",to:"db1",protocol:"Async Batch Write"},{id:"e7",from:"s2",to:"db1",protocol:"CQL Read"}]}},{id:"notification-system",title:"Scalable Notification System",difficulty:"Medium",difficultyRank:5,tag:"Multi-Channel Priority Queuing",description:"Design a distributed notification platform sending millions of push, SMS, and email alerts daily with deduplication, priority queues, and rate-limiting.",targetRps:9e4,readWriteRatio:.2,learningObjectives:["Priority queues for transactional OTP vs promotional marketing alerts","Idempotency keys to guarantee at-most-once delivery","Third-party provider rate limits (APNs, FCM, Twilio, SendGrid)"],graph:{nodes:[{id:"c1",name:"Internal Microservices",component_type:h.CLIENT,x:280,y:40},{id:"gw1",name:"Notification Ingress Gateway",component_type:h.API_GATEWAY,x:280,y:170},{id:"cache1",name:"Redis Idempotency Store",component_type:h.CACHE,x:110,y:310},{id:"q1",name:"Kafka Priority Queues",component_type:h.MESSAGE_QUEUE,x:280,y:310,config:{partitions:16}},{id:"s1",name:"Push Delivery Worker",component_type:h.MICROSERVICE,x:120,y:460,config:{instances:4}},{id:"s2",name:"SMS & Email Worker",component_type:h.MICROSERVICE,x:440,y:460,config:{instances:4}},{id:"db1",name:"Notification Log DB",component_type:h.DATABASE,x:280,y:600,config:{db_type:"NoSQL Document",read_replicas:2}}],edges:[{id:"e1",from:"c1",to:"gw1",protocol:"Internal gRPC"},{id:"e2",from:"gw1",to:"cache1",protocol:"Deduplication"},{id:"e3",from:"gw1",to:"q1",protocol:"Queue Push"},{id:"e4",from:"q1",to:"s1",protocol:"Kafka Consumer"},{id:"e5",from:"q1",to:"s2",protocol:"Kafka Consumer"},{id:"e6",from:"s1",to:"db1",protocol:"Audit Log"},{id:"e7",from:"s2",to:"db1",protocol:"Audit Log"}]}},{id:"news-feed",title:"Social Timeline / News Feed (Twitter / Instagram)",difficulty:"Hard",difficultyRank:6,tag:"Fan-out on Write vs Read",description:"Design a personalized activity feed for 500 million active users. Balance real-time latency with celebrity accounts having tens of millions of followers.",targetRps:25e4,readWriteRatio:.95,learningObjectives:["Fan-out on Write (push) for normal users vs Fan-out on Read (pull) for celebrities","Redis in-memory timeline lists capped at 800 recent post IDs","Ranking models combining recency, affinity, and engagement"],graph:{nodes:[{id:"c1",name:"Mobile Users",component_type:h.CLIENT,x:300,y:30},{id:"cdn1",name:"Cloudflare Edge",component_type:h.CDN,x:300,y:150},{id:"lb1",name:"Global ALB",component_type:h.LOAD_BALANCER,x:300,y:270},{id:"s1",name:"Post Creation Service",component_type:h.MICROSERVICE,x:120,y:390,config:{instances:4}},{id:"s2",name:"Timeline Read Service",component_type:h.MICROSERVICE,x:480,y:390,config:{instances:8}},{id:"q1",name:"Fan-out Worker Queue",component_type:h.MESSAGE_QUEUE,x:120,y:520},{id:"cache1",name:"Redis User Timelines",component_type:h.CACHE,x:300,y:520,config:{eviction_policy:"LRU",max_memory_mb:32768,cache_hit_ratio:.95}},{id:"db1",name:"Posts Distributed DB",component_type:h.DATABASE,x:480,y:640,config:{db_type:"NoSQL Document",read_replicas:4,sharding_strategy:"Hash"}}],edges:[{id:"e1",from:"c1",to:"cdn1",protocol:"HTTPS"},{id:"e2",from:"cdn1",to:"lb1",protocol:"HTTP/2"},{id:"e3",from:"lb1",to:"s1",protocol:"POST /tweet"},{id:"e4",from:"lb1",to:"s2",protocol:"GET /feed"},{id:"e5",from:"s1",to:"q1",protocol:"Publish Post"},{id:"e6",from:"q1",to:"cache1",protocol:"Push to Followers"},{id:"e7",from:"s2",to:"cache1",protocol:"Read Timeline"},{id:"e8",from:"s2",to:"db1",protocol:"Hydrate Posts"}]}},{id:"streaming-service",title:"Video Streaming (Netflix / YouTube)",difficulty:"Hard",difficultyRank:7,tag:"Adaptive Bitrate & CDN Edge",description:"Design a video streaming platform serving millions of concurrent streams globally. Optimize video encoding pipelines, adaptive bitrate chunking (HLS/DASH), and edge caching.",targetRps:4e5,readWriteRatio:.98,learningObjectives:["Chunking video into 4-second segments at multiple resolutions (1080p, 720p, 480p)","Multi-tiered CDN caching strategy (L1 Edge, L2 Regional POP, Origin Shield)","Separate control plane (microservices + metadata) from data plane (blob CDN distribution)"],graph:{nodes:[{id:"c1",name:"Global Video Viewers",component_type:h.CLIENT,x:300,y:30},{id:"cdn1",name:"Multi-CDN Network (Akamai/Fastly)",component_type:h.CDN,x:130,y:170,config:{edge_cache_ratio:.94}},{id:"lb1",name:"Control Plane LB",component_type:h.LOAD_BALANCER,x:470,y:170},{id:"gw1",name:"API Gateway",component_type:h.API_GATEWAY,x:470,y:290},{id:"s1",name:"Video Transcoding Workers",component_type:h.MICROSERVICE,x:130,y:340,config:{instances:12}},{id:"s2",name:"Metadata & User Service",component_type:h.MICROSERVICE,x:470,y:420,config:{instances:5}},{id:"q1",name:"Encoding Job Queue",component_type:h.MESSAGE_QUEUE,x:130,y:480},{id:"cache1",name:"Redis Catalog Cache",component_type:h.CACHE,x:300,y:550},{id:"db1",name:"Cassandra Video Catalog",component_type:h.DATABASE,x:470,y:570,config:{read_replicas:4}}],edges:[{id:"e1",from:"c1",to:"cdn1",protocol:"HLS Chunk Request"},{id:"e2",from:"c1",to:"lb1",protocol:"HTTPS Auth & Catalog"},{id:"e3",from:"lb1",to:"gw1",protocol:"HTTP/2"},{id:"e4",from:"gw1",to:"s2",protocol:"Internal gRPC"},{id:"e5",from:"s2",to:"q1",protocol:"Transcode Job"},{id:"e6",from:"q1",to:"s1",protocol:"Pull Chunk Task"},{id:"e7",from:"s1",to:"cdn1",protocol:"Publish Chunks"},{id:"e8",from:"s2",to:"cache1",protocol:"Catalog Cache"},{id:"e9",from:"cache1",to:"db1",protocol:"Fetch Catalog"}]}},{id:"distributed-cache",title:"Distributed In-Memory Cache (Memcached / Redis Cluster)",difficulty:"Hard",difficultyRank:8,tag:"Consistent Hashing & Gossip",description:"Design a distributed in-memory key-value cache partitioning petabytes of data across 100+ nodes using consistent hashing, replication, and eviction policies.",targetRps:5e5,readWriteRatio:.85,learningObjectives:["Consistent hashing with virtual nodes to avoid hot spots on node addition/removal","Cache eviction policies: LRU, LFU, FIFO, 2Q","Cache stampede / Thundering herd prevention with distributed mutexes or probabilistic early expiration"],graph:{nodes:[{id:"c1",name:"Client App Servers",component_type:h.CLIENT,x:280,y:40},{id:"lb1",name:"Consistent Hash Router",component_type:h.LOAD_BALANCER,x:280,y:170,config:{lb_algorithm:"Consistent Hashing"}},{id:"cache1",name:"Cache Shard 1 (Master)",component_type:h.CACHE,x:100,y:320,config:{eviction_policy:"LRU",max_memory_mb:16384}},{id:"cache2",name:"Cache Shard 2 (Master)",component_type:h.CACHE,x:280,y:320,config:{eviction_policy:"LRU",max_memory_mb:16384}},{id:"cache3",name:"Cache Shard 3 (Master)",component_type:h.CACHE,x:460,y:320,config:{eviction_policy:"LRU",max_memory_mb:16384}},{id:"cache4",name:"Cache Shard 1 (Replica)",component_type:h.CACHE,x:100,y:460},{id:"cache5",name:"Cache Shard 2 (Replica)",component_type:h.CACHE,x:280,y:460},{id:"cache6",name:"Cache Shard 3 (Replica)",component_type:h.CACHE,x:460,y:460}],edges:[{id:"e1",from:"c1",to:"lb1",protocol:"TCP Wire"},{id:"e2",from:"lb1",to:"cache1",protocol:"Hash Ring Slot 0..5460"},{id:"e3",from:"lb1",to:"cache2",protocol:"Hash Ring Slot 5461..10922"},{id:"e4",from:"lb1",to:"cache3",protocol:"Hash Ring Slot 10923..16383"},{id:"e5",from:"cache1",to:"cache4",protocol:"Replication Stream"},{id:"e6",from:"cache2",to:"cache5",protocol:"Replication Stream"},{id:"e7",from:"cache3",to:"cache6",protocol:"Replication Stream"}]}},{id:"search-engine",title:"Web Crawler & Search Engine (Google)",difficulty:"Expert",difficultyRank:9,tag:"Inverted Index & Distributed Crawl",description:"Design a distributed search engine crawling billions of web pages, extracting text, calculating PageRank, building distributed inverted indexes, and serving queries in <50ms.",targetRps:3e5,readWriteRatio:.9,learningObjectives:["URL frontier with politeness and priority queues","Document parsing, deduplication via MinHash / SimHash","Partitioning inverted index by Document ID vs Term ID"],graph:{nodes:[{id:"c1",name:"Search Query Users",component_type:h.CLIENT,x:440,y:40},{id:"gw1",name:"Search API Gateway",component_type:h.API_GATEWAY,x:440,y:170},{id:"s1",name:"Crawler Worker Pods",component_type:h.MICROSERVICE,x:120,y:170,config:{instances:16}},{id:"q1",name:"URL Frontier Queue",component_type:h.MESSAGE_QUEUE,x:120,y:310,config:{partitions:64}},{id:"s2",name:"Index & Ranking Service",component_type:h.MICROSERVICE,x:440,y:310,config:{instances:10}},{id:"cache1",name:"Top Queries Cache",component_type:h.CACHE,x:280,y:440,config:{eviction_policy:"LFU"}},{id:"db1",name:"Distributed Inverted Index",component_type:h.DATABASE,x:440,y:580,config:{sharding_strategy:"Hash",read_replicas:6}}],edges:[{id:"e1",from:"c1",to:"gw1",protocol:"HTTPS"},{id:"e2",from:"gw1",to:"s2",protocol:"gRPC"},{id:"e3",from:"s1",to:"q1",protocol:"Discovered Links"},{id:"e4",from:"q1",to:"s1",protocol:"Next Fetch"},{id:"e5",from:"s1",to:"s2",protocol:"Extracted HTML"},{id:"e6",from:"s2",to:"cache1",protocol:"Check Hot Cache"},{id:"e7",from:"s2",to:"db1",protocol:"Index Lookup"}]}},{id:"uber-dispatch",title:"Ride-Sharing Dispatch System (Uber / Lyft)",difficulty:"Expert",difficultyRank:10,tag:"Geospatial Sharding & Matching",description:"Design a real-time ride-matching platform tracking millions of drivers every 4 seconds, calculating geospatial proximity, dynamic surge pricing, and trip routing.",targetRps:35e4,readWriteRatio:.7,learningObjectives:["Geohashing / Google S2 cells / Uber H3 hexagonal spatial indexing","High-throughput driver location updates via lightweight UDP / WebSockets","Dynamic matching engine using bipartite graph optimization","Surge pricing computation using streaming sliding-window aggregations"],graph:{nodes:[{id:"c1",name:"Riders & Drivers",component_type:h.CLIENT,x:280,y:30},{id:"lb1",name:"Global GeoDNS / Anycast LB",component_type:h.LOAD_BALANCER,x:280,y:150},{id:"gw1",name:"Edge API Gateway",component_type:h.API_GATEWAY,x:280,y:270},{id:"s1",name:"Location Tracking Ingest",component_type:h.MICROSERVICE,x:110,y:390,config:{instances:8}},{id:"s2",name:"Dispatch & Matching Engine",component_type:h.MICROSERVICE,x:450,y:390,config:{instances:8}},{id:"cache1",name:"Redis H3 Hex Spatial Index",component_type:h.CACHE,x:110,y:530,config:{eviction_policy:"LRU",max_memory_mb:32768}},{id:"q1",name:"Trip Events Kafka Bus",component_type:h.MESSAGE_QUEUE,x:450,y:530,config:{partitions:32}},{id:"db1",name:"Trips & Billing DB (Cassandra)",component_type:h.DATABASE,x:280,y:650,config:{db_type:"NoSQL Document",read_replicas:4,sharding_strategy:"Hash"}}],edges:[{id:"e1",from:"c1",to:"lb1",protocol:"TLS / WSS"},{id:"e2",from:"lb1",to:"gw1",protocol:"gRPC"},{id:"e3",from:"gw1",to:"s1",protocol:"GPS Ping (4s)"},{id:"e4",from:"gw1",to:"s2",protocol:"Ride Request"},{id:"e5",from:"s1",to:"cache1",protocol:"Update Cell"},{id:"e6",from:"s2",to:"cache1",protocol:"Query Neighbors"},{id:"e7",from:"s2",to:"q1",protocol:"Match Created"},{id:"e8",from:"q1",to:"db1",protocol:"Persist Trip"}]}}];function Ce(g,e=null){const t=W[g];if(!t)return;const s=t.concept||{analogy:"Fundamental building block of distributed architecture.",whatItDoes:t.description,whenToUse:"General system design architecture.",keyTradeoffs:"Capacity and latency limits.",interviewTip:"Clarify throughput and latency requirements before choosing.",industryExamples:"Industry standard implementations"},i=document.getElementById("concept-explainer-modal");i&&i.remove();const o=document.createElement("div");o.id="concept-explainer-modal",o.className="custom-modal-overlay",o.innerHTML=`
    <div class="custom-modal-card concept-modal-card">
      <div class="concept-modal-header">
        <div class="concept-header-left">
          <div class="component-icon-badge large" style="background: ${t.accentBg}; color: ${t.color};">
            ${Q[g]||`<span class="component-dot" style="background: ${t.color};"></span>`}
          </div>
          <div>
            <div class="concept-modal-title">${t.name}</div>
            <span class="concept-modal-badge">${t.badge}</span>
          </div>
        </div>
        <button id="modal-btn-close" class="btn-icon-close" title="Close">✕</button>
      </div>

      <div class="concept-modal-scroll">
        <!-- Real World Analogy -->
        <div class="concept-section-box analogy-box">
          <div class="concept-section-title">
            <span>💡</span> Real-World Analogy
          </div>
          <p class="concept-section-desc">"${s.analogy}"</p>
        </div>

        <!-- What It Does -->
        <div class="concept-section-box">
          <div class="concept-section-title">
            <span>⚙️</span> What It Does
          </div>
          <p class="concept-section-desc">${s.whatItDoes}</p>
        </div>

        <!-- When to Use -->
        <div class="concept-section-box">
          <div class="concept-section-title">
            <span>🚀</span> When to Use It
          </div>
          <p class="concept-section-desc">${s.whenToUse}</p>
        </div>

        <!-- Trade-offs -->
        <div class="concept-section-box tradeoff-box">
          <div class="concept-section-title">
            <span>⚠️</span> Key Bottlenecks & Trade-offs
          </div>
          <p class="concept-section-desc">${s.keyTradeoffs}</p>
        </div>

        <!-- Interview Tip -->
        <div class="concept-section-box interview-tip-box">
          <div class="concept-section-title">
            <span>🎯</span> System Design Interview Tip
          </div>
          <p class="concept-section-desc">${s.interviewTip}</p>
        </div>

        <!-- Real World Examples -->
        <div class="concept-section-box examples-box">
          <div class="concept-section-title">
            <span>🏢</span> Common Industry Examples
          </div>
          <p class="concept-section-desc"><code>${s.industryExamples}</code></p>
        </div>

        <!-- Specifications & Baseline -->
        <div class="concept-specs-grid">
          <div class="spec-card">
            <span class="spec-label">Default Capacity</span>
            <span class="spec-val">${t.baseRps.toLocaleString()} rps</span>
          </div>
          <div class="spec-card">
            <span class="spec-label">Base Latency</span>
            <span class="spec-val">${t.baseLatencyMs}ms</span>
          </div>
          <div class="spec-card">
            <span class="spec-label">Est. Cloud Cost</span>
            <span class="spec-val">$${(t.hourlyCost*730).toFixed(0)}/mo</span>
          </div>
        </div>
      </div>

      <div class="concept-modal-footer">
        <button id="modal-btn-dismiss" class="modal-btn secondary">Close</button>
        ${e?'<button id="modal-btn-add" class="modal-btn primary">Add to Canvas</button>':""}
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("open"));const n=()=>{o.classList.remove("open"),setTimeout(()=>o.remove(),200),window.removeEventListener("keydown",a)},a=l=>{l.key==="Escape"&&n()};window.addEventListener("keydown",a),o.querySelector("#modal-btn-close").addEventListener("click",n),o.querySelector("#modal-btn-dismiss").addEventListener("click",n);const r=o.querySelector("#modal-btn-add");r&&e&&r.addEventListener("click",()=>{n(),e(g)}),o.addEventListener("click",l=>{l.target===o&&n()})}class Ee{constructor(e,t){this.container=e,this.renderer=t,this.selectedModels={};for(const s of Object.keys(W)){const i=G[s]||[];this.selectedModels[s]={modelId:i[0]?.id||null}}this.render()}render(){this.container.innerHTML=`
      <div class="palette-header">
        <div class="palette-header-row">
          <div>
            <h2 class="palette-title">Components</h2>
            <p class="palette-subtitle">Tap or drag to add to system</p>
          </div>
          <button id="btn-close-sidebar" class="btn-close-sidebar" title="Hide Sidebar (Ctrl+[)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>
      </div>

      <!-- Traffic Simulation Section -->
      <div class="sidebar-load-section">
        <div class="sidebar-section-header">
          <h3 class="section-title">Traffic Simulation</h3>
        </div>
        <div class="sidebar-load-hud" id="load-hud"></div>
      </div>

      <div class="palette-section-divider"></div>

      <div class="sidebar-section-header">
        <h3 class="section-title">Infrastructure Components</h3>
      </div>

      <div class="component-list" id="component-list"></div>

      <div class="palette-section-divider"></div>

      <div class="palette-instructions">
        <h3 class="section-title">Canvas Gestures</h3>
        <ul class="shortcut-list">
          <li><span>Tap / Click</span> Select component or wire</li>
          <li><span>Drag / Touch</span> Move node or pan canvas</li>
          <li><span>Pinch / Wheel</span> Zoom in/out</li>
          <li><span>Port Touch</span> Wire connection between nodes</li>
          <li><span>Cmd / Ctrl + Z</span> Undo action</li>
        </ul>
      </div>

      <div class="palette-section-divider"></div>

      <div class="scenarios-section">
        <div class="scenarios-header">
          <h3 class="section-title">Interview Scenarios</h3>
          <span class="badge-count">${z.length}</span>
        </div>
        <p class="scenarios-subtitle">Practice common system design questions sorted by difficulty:</p>

        <div class="scenarios-list" id="scenarios-list">
          ${z.map(e=>{const t=e.difficulty.toLowerCase(),s=(e.learningObjectives||[]).length;return`
              <div class="scenario-card" data-scenario-id="${e.id}">
                <div class="scenario-top">
                  <span class="scenario-title">${e.title}</span>
                  <span class="difficulty-badge ${t}">${e.difficulty}</span>
                </div>
                <div class="scenario-tag">${e.tag}</div>
                ${e.description?`<p class="scenario-desc-snippet">${e.description}</p>`:""}

                <!-- Learning Objectives Collapsible Accordion -->
                <button class="btn-toggle-objectives" data-scenario-id="${e.id}">
                  <span class="obj-btn-text">📘 Learning Objectives (${s})</span>
                  <span class="chevron-icon">▾</span>
                </button>

                <div class="scenario-objectives-drawer" id="objectives-${e.id}" style="display: none;">
                  <ul class="scenario-objectives-list">
                    ${(e.learningObjectives||[]).map(i=>`
                      <li><span class="obj-check">✓</span> <span>${i}</span></li>
                    `).join("")}
                  </ul>
                  <div class="scenario-meta-details">
                    <span>Target: <strong>${(e.targetRps/1e3).toFixed(0)}k RPS</strong></span>
                    <span>Ratio: <strong>${((e.readWriteRatio||.8)*100).toFixed(0)}% reads</strong></span>
                  </div>
                </div>

                <div class="scenario-actions">
                  <span class="scenario-load-target">${(e.targetRps/1e3).toFixed(0)}k rps</span>
                  <button class="btn-load-scenario" data-scenario-id="${e.id}">Load Architecture</button>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `,this._bindCloseButton(),this.renderComponentList(),this._bindScenarioEvents()}renderComponentList(){const e=this.container.querySelector("#component-list");e&&(e.innerHTML=Object.entries(W).map(([t,s])=>{const i=G[t]||[],n=(this.selectedModels[t]||{modelId:i[0]?.id||null}).modelId||i[0]?.id||"",a={};for(const r of i){const l=r.brandInfo?.name||r.brand||"Standard";a[l]||(a[l]=[]),a[l].push(r)}return`
        <div class="component-clean-card" draggable="true" data-type="${t}" data-model-id="${n}" role="button" tabindex="0" title="Tap or drag to add ${s.name} to canvas">
          <div class="component-icon-badge" style="background: ${s.accentBg}; color: ${s.color};">
            ${Q[t]||`<span class="component-dot" style="background: ${s.color};"></span>`}
          </div>
          <div class="component-info">
            <div class="component-name-row">
              <span class="component-name">${s.name}</span>
              <button class="btn-component-learn" data-type="${t}" title="Learn about ${s.name}" aria-label="Learn about ${s.name}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </button>
            </div>
            ${i.length>0?`
              <select class="component-model-select-compact" data-type="${t}" title="Choose engine model">
                ${Object.keys(a).length>1?Object.entries(a).map(([r,l])=>`
                    <optgroup label="${r}">
                      ${l.map(c=>`
                        <option value="${c.id}" ${c.id===n?"selected":""}>
                          ${c.name}
                        </option>
                      `).join("")}
                    </optgroup>
                  `).join(""):i.map(r=>`
                    <option value="${r.id}" ${r.id===n?"selected":""}>
                      ${r.name}
                    </option>
                  `).join("")}
              </select>
            `:`
              <div class="component-desc">${s.description}</div>
            `}
          </div>
        </div>
      `}).join(""),this._bindComponentListEvents())}_bindCloseButton(){const e=this.container.querySelector("#btn-close-sidebar");e&&e.addEventListener("click",()=>this.closeMobileSidebar())}closeMobileSidebar(){const e=document.getElementById("app-sidebar"),t=document.getElementById("sidebar-backdrop");e&&e.classList.remove("mobile-open"),t&&t.classList.remove("active")}_bindComponentListEvents(){this.container.querySelectorAll(".component-model-select-compact").forEach(i=>{i.addEventListener("click",o=>{o.stopPropagation()}),i.addEventListener("change",o=>{o.stopPropagation();const n=i.getAttribute("data-type"),a=i.value;if(!n)return;this.selectedModels[n]=this.selectedModels[n]||{},this.selectedModels[n].modelId=a;const r=i.closest(".component-clean-card");r&&r.setAttribute("data-model-id",a)})}),this.container.querySelectorAll(".component-clean-card").forEach(i=>{i.addEventListener("dragstart",o=>{const n=i.getAttribute("data-type"),a=i.getAttribute("data-model-id")||"";o.dataTransfer.setData("text/plain",n),o.dataTransfer.setData("application/x-component-type",n),a&&o.dataTransfer.setData("application/x-model-id",a),i.classList.add("dragging")}),i.addEventListener("dragend",()=>{i.classList.remove("dragging")}),i.addEventListener("click",o=>{if(o.target.closest(".btn-component-learn")||o.target.closest(".component-model-select-compact"))return;const n=i.getAttribute("data-type"),a=i.getAttribute("data-model-id")||"";this.addNodeToCanvas(n,a)})}),this.container.querySelectorAll(".btn-component-learn").forEach(i=>{i.addEventListener("click",o=>{o.stopPropagation();const n=i.getAttribute("data-type"),a=this.selectedModels[n]?.modelId||null;Ce(n,r=>this.addNodeToCanvas(r,a))})})}addNodeToCanvas(e,t=null){const s=W[e],i=40;let o=0,n=0;if(this.renderer&&this.renderer.camera){const p=(Math.random()-.5)*80,m=(Math.random()-.5)*80;o=Math.round((this.renderer.camera.x-70+p)/i)*i,n=Math.round((this.renderer.camera.y-45+m)/i)*i}const a=d.nodes||[];let r=0;for(;r<10&&a.some(p=>Math.abs(p.x-o)<160&&Math.abs(p.y-n)<80);)n+=80,o+=40,r++;const l={component_type:e,x:o,y:n};t&&(l.model_id=t);let c=null;$.execute({description:`Add ${s?s.name:e}`,execute:()=>{const p=d.addNode(l);c=p.id,d.selectNode(p.id)},undo:()=>{c&&d.removeNode(c)}});const u=l.model_id?G[e]?.find(p=>p.id===t)?.name||s?.name||e:s?s.name:e;A(`Added ${u} to canvas`,"success",2e3),window.innerWidth<=900&&this.closeMobileSidebar()}_bindScenarioEvents(){this.container.querySelectorAll(".btn-toggle-objectives").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-scenario-id"),o=this.container.querySelector(`#objectives-${i}`);if(o){const n=o.style.display!=="none";o.style.display=n?"none":"block",s.classList.toggle("expanded",!n)}})}),this.container.querySelectorAll(".btn-load-scenario").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-scenario-id"),o=z.find(n=>n.id===i);o&&(d.activeScenario=o,d.loadGraph(o.graph),d.updateSimConfig({target_rps:o.targetRps}),y.emit(S.SCENARIO_SELECTED,o),this.renderer&&this.renderer.camera&&setTimeout(()=>{this.renderer.camera.fitToContent(d.nodes)},100),A(`Loaded scenario: ${o.title}`,"info"),window.innerWidth<=900&&this.closeMobileSidebar())})})}}class Ae{constructor(e){this.renderer=e,this.sidebar=document.getElementById("app-sidebar"),this.resizer=document.getElementById("sidebar-resizer"),this.expandBtn=document.getElementById("btn-expand-sidebar"),this.toolbarToggleBtn=document.getElementById("btn-toolbar-toggle-sidebar"),this.isDragging=!1,this.startX=0,this.startWidth=300,this.minWidth=240,this.maxWidth=650,this.defaultWidth=300,this.init()}init(){this._restorePreferences(),this._bindResizer(),this._bindToggles(),this._bindKeyboard()}_restorePreferences(){const e=localStorage.getItem("sysdesign_sidebar_width");if(e&&this.sidebar){const s=parseInt(e,10);s>=this.minWidth&&s<=this.maxWidth&&(this.sidebar.style.width=`${s}px`,this.sidebar.style.minWidth=`${s}px`)}localStorage.getItem("sysdesign_sidebar_hidden")==="true"&&window.innerWidth>900&&this.hideSidebar(!1)}_bindResizer(){if(!this.resizer||!this.sidebar)return;const e=i=>{this.isDragging=!0,this.startX=i,this.startWidth=this.sidebar.offsetWidth,this.sidebar.classList.add("sidebar-resizing"),this.resizer.classList.add("active"),document.body.style.cursor="col-resize",document.body.style.userSelect="none"};this.resizer.addEventListener("mousedown",i=>{e(i.clientX)}),this.resizer.addEventListener("touchstart",i=>{i.touches.length===1&&e(i.touches[0].clientX)},{passive:!0});const t=i=>{if(!this.isDragging)return;const o=i-this.startX,n=this.startWidth+o;if(n<180)this.sidebar.style.opacity="0.5";else{this.sidebar.style.opacity="1";const a=Math.min(this.maxWidth,window.innerWidth*.55),r=Math.min(Math.max(n,this.minWidth),a);this.sidebar.style.width=`${r}px`,this.sidebar.style.minWidth=`${r}px`}this.renderer&&this.renderer.resize()};window.addEventListener("mousemove",i=>{t(i.clientX)}),window.addEventListener("touchmove",i=>{i.touches.length===1&&t(i.touches[0].clientX)},{passive:!0});const s=i=>{if(!this.isDragging)return;this.isDragging=!1,this.sidebar.style.opacity="1",this.sidebar.classList.remove("sidebar-resizing"),this.resizer.classList.remove("active"),document.body.style.cursor="",document.body.style.userSelect="";const o=i-this.startX;if(this.startWidth+o<200)this.hideSidebar();else{const a=this.sidebar.offsetWidth;localStorage.setItem("sysdesign_sidebar_width",a.toString())}this.renderer&&this.renderer.resize()};window.addEventListener("mouseup",i=>{s(i.clientX)}),window.addEventListener("touchend",i=>{const o=i.changedTouches[0];o&&s(o.clientX)}),this.resizer.addEventListener("dblclick",()=>{this.sidebar.style.width=`${this.defaultWidth}px`,this.sidebar.style.minWidth=`${this.defaultWidth}px`,localStorage.setItem("sysdesign_sidebar_width",this.defaultWidth.toString()),this.renderer&&this.renderer.resize(),A("Sidebar width reset to default (300px)","info",2e3)})}_bindToggles(){const e=document.getElementById("btn-toolbar-toggle-sidebar");e&&e.addEventListener("click",()=>this.toggleSidebar()),this.expandBtn&&this.expandBtn.addEventListener("click",()=>this.showSidebar());const t=document.getElementById("btn-close-sidebar");t&&t.addEventListener("click",s=>{if(s.stopPropagation(),window.innerWidth<=900){this.sidebar.classList.remove("mobile-open");const i=document.getElementById("sidebar-backdrop");i&&i.classList.remove("active")}else this.hideSidebar()})}_bindKeyboard(){window.addEventListener("keydown",e=>{const t=document.activeElement?.tagName?.toLowerCase();t==="input"||t==="textarea"||document.activeElement?.isContentEditable||(e.metaKey||e.ctrlKey)&&(e.key==="["||e.key.toLowerCase()==="b")&&(e.preventDefault(),this.toggleSidebar())})}toggleSidebar(){if(!this.sidebar)return;this.sidebar.classList.contains("sidebar-hidden")?this.showSidebar():this.hideSidebar()}hideSidebar(e=!0){if(!this.sidebar)return;this.sidebar.classList.add("sidebar-hidden"),localStorage.setItem("sysdesign_sidebar_hidden","true");const t=document.getElementById("btn-toolbar-toggle-sidebar");t&&t.classList.remove("active"),this.renderer&&(this.renderer.resize(),setTimeout(()=>this.renderer.resize(),50)),y.emit(S.PANEL_TOGGLED,{panel:"sidebar",isOpen:!1}),e&&A("Sidebar hidden (Ctrl+[ to restore)","info",2500)}showSidebar(){if(!this.sidebar)return;this.sidebar.classList.remove("sidebar-hidden"),localStorage.setItem("sysdesign_sidebar_hidden","false");const e=document.getElementById("btn-toolbar-toggle-sidebar");e&&e.classList.add("active"),this.renderer&&(this.renderer.resize(),setTimeout(()=>this.renderer.resize(),50)),y.emit(S.PANEL_TOGGLED,{panel:"sidebar",isOpen:!0})}}class ke{constructor(e){this.container=e,this.currentNode=null,this.currentEdge=null,this._bindEvents(),this.renderEmpty()}_bindEvents(){y.on(S.SELECTION_CHANGED,({node:e,edge:t})=>{e?(this.currentNode=e,this.currentEdge=null,this.renderNodeConfig(e),window.innerWidth<=900&&this.openMobileInspector()):t?(this.currentNode=null,this.currentEdge=t,this.renderEdgeConfig(t),window.innerWidth<=900&&this.openMobileInspector()):(this.currentNode=null,this.currentEdge=null,this.renderEmpty(),window.innerWidth<=900&&this.closeMobileInspector())}),y.on(S.EDGE_UPDATED,e=>{this.currentEdge&&this.currentEdge.id===e.id&&this.renderEdgeConfig(e)}),y.on(S.SIM_METRICS_UPDATED,e=>{this.currentNode&&e.node_metrics[this.currentNode.id]&&this._updateTelemetry(e.node_metrics[this.currentNode.id])})}openMobileInspector(){const e=document.getElementById("app-inspector"),t=document.getElementById("inspector-backdrop");e&&e.classList.add("mobile-open"),t&&t.classList.add("active")}closeMobileInspector(){const e=document.getElementById("app-inspector"),t=document.getElementById("inspector-backdrop");e&&e.classList.remove("mobile-open"),t&&t.classList.remove("active")}renderEmpty(){this.container.innerHTML=`
      <div class="config-header" style="border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: flex-end; padding: 10px 14px;">
        <button id="btn-close-empty-inspector" class="btn-icon-close" title="Close Inspector">✕</button>
      </div>
      <div class="config-empty">
        <div class="empty-icon">⚙️</div>
        <h3 class="empty-title">Node Inspector</h3>
        <p class="empty-desc">Tap any component on the canvas to configure its properties, replication, or cache policies.</p>
      </div>
    `;const e=this.container.querySelector("#btn-close-empty-inspector");e&&e.addEventListener("click",()=>{d.clearSelection(),this.closeMobileInspector()})}renderNodeConfig(e){const t=W[e.component_type]||{},s=e.config||{},i=G[e.component_type]||[],o=i.find(c=>c.id===e.model_id)||i[0]||null,n=ne(e.component_type),a=n.length>1,r=a&&o?o.brand:n[0]?.brand||"Standard",l=a?J(e.component_type,r):i;this.container.innerHTML=`
      <div class="config-header">
        <div class="config-title-row">
          <div class="component-icon-badge" style="background: ${t.accentBg}; color: ${t.color};">
            ${Q[e.component_type]||`<span class="component-dot" style="background: ${t.color};"></span>`}
          </div>
          <div class="config-title-wrap">
            <input type="text" id="node-name-input" class="node-name-field" value="${e.name}" title="Edit Name" />
            <div class="config-type-row">
              <span class="config-type-badge">${t.name||e.component_type}</span>
              ${o&&o.brand!=="Standard"&&o.brand!=="Generic"?`
                <span class="brand-badge-pill" style="color: ${o.brandInfo?.color||"currentColor"}; background: ${o.brandInfo?.bg||"transparent"}; border-color: ${o.brandInfo?.color||"currentColor"};">
                  ${o.brandInfo?.shortName||o.brand}
                </span>
              `:""}
            </div>
          </div>
          <button id="btn-close-config" class="btn-icon-close" title="Close">✕</button>
        </div>
      </div>

      <!-- Live Node Telemetry Card -->
      <div class="telemetry-card">
        <div class="telemetry-row">
          <div class="telemetry-item">
            <span class="telemetry-label">Incoming</span>
            <strong class="telemetry-val" id="tel-incoming">0 rps</strong>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Load</span>
            <strong class="telemetry-val" id="tel-load">0%</strong>
          </div>
          <div class="telemetry-item">
            <span class="telemetry-label">Latency</span>
            <strong class="telemetry-val" id="tel-latency">${e.base_latency_ms||t.baseLatencyMs}ms</strong>
          </div>
        </div>
      </div>

      <div class="config-body">
        <!-- Architecture Engine & Model Selection Card -->
        ${i.length>0?`
          <div class="brand-model-selector-card">
            <div class="brand-model-header">
              <span class="brand-model-title">⚙️ Technology Model</span>
            </div>

            ${a?`
              <div class="form-group" style="margin-bottom: 10px;">
                <label class="form-label">Provider</label>
                <div class="inspector-brand-chips">
                  ${n.map(c=>`
                    <button type="button" class="inspector-brand-chip ${c.brand===r?"active":""}" data-brand="${c.brand}" style="--chip-color: ${c.color}; --chip-bg: ${c.bg};" title="${c.name}">
                      ${c.shortName||c.brand}
                    </button>
                  `).join("")}
                </div>
              </div>
            `:""}

            <div class="form-group" style="margin-bottom: 6px;">
              <label class="form-label">Model (${l.length})</label>
              <select class="form-select brand-model-select" id="node-model-select">
                ${l.map(c=>`
                  <option value="${c.id}" ${c.id===o?.id?"selected":""}>
                    ${c.name}
                  </option>
                `).join("")}
              </select>
            </div>

            ${o?`
              <div class="model-highlights-box">
                <div class="model-desc">${o.description}</div>
                <div class="model-highlights">
                  <strong>✨ Highlights:</strong> ${o.highlights}
                </div>
                <div class="model-specs-row">
                  <span>Cap: <strong>${(o.baseRps/1e3).toFixed(0)}k RPS</strong></span>
                  <span>Latency: <strong>${o.baseLatencyMs}ms</strong></span>
                  <span>Est: <strong>$${(o.hourlyCost*730).toFixed(0)}/mo</strong></span>
                </div>
              </div>
            `:""}
          </div>
        `:""}

        <!-- Dynamic Form by Component Type -->
        ${this._renderTypeSpecificForms(e.component_type,s)}

        <!-- Beginner System Design Concept Card (Collapsible) -->
        ${t.concept?`
          <div class="concept-explainer-card">
            <button type="button" class="btn-toggle-concept" id="btn-toggle-concept">
              <span>💡 Concept & Interview Tips</span>
              <span class="concept-chevron">▾</span>
            </button>
            <div class="concept-explainer-drawer" id="concept-drawer" style="display: none;">
              <div class="concept-analogy">
                <strong>Analogy:</strong> ${t.concept.analogy}
              </div>
              <div class="concept-body-text">
                ${t.concept.whatItDoes}
              </div>
              <div class="concept-tradeoff-box">
                <span class="tradeoff-icon">⚠️</span>
                <span class="tradeoff-text"><strong>Trade-off:</strong> ${t.concept.keyTradeoffs}</span>
              </div>
              <div class="concept-interview-tip">
                <strong>🎯 Interview Tip:</strong> ${t.concept.interviewTip}
              </div>
              ${t.concept.industryExamples?`
                <div class="concept-examples">
                  <strong>Real-World:</strong> ${t.concept.industryExamples}
                </div>
              `:""}
            </div>
          </div>
        `:""}

        <div class="config-divider"></div>

        <button id="btn-delete-node" class="btn-delete-component">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Delete Component</span>
        </button>
      </div>
    `,this._bindFormInputs(e)}_renderTypeSpecificForms(e,t){switch(e){case h.CACHE:return`
          <div class="form-group">
            <label class="form-label">Eviction Policy</label>
            <select class="form-select" data-prop="eviction_policy">
              <option value="LRU" ${t.eviction_policy==="LRU"?"selected":""}>LRU (Least Recently Used)</option>
              <option value="LFU" ${t.eviction_policy==="LFU"?"selected":""}>LFU (Least Frequently Used)</option>
              <option value="FIFO" ${t.eviction_policy==="FIFO"?"selected":""}>FIFO (First In First Out)</option>
              <option value="Random" ${t.eviction_policy==="Random"?"selected":""}>Random Eviction</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Max Memory Allocation</label>
            <select class="form-select" data-prop="max_memory_mb">
              <option value="1024" ${t.max_memory_mb==1024?"selected":""}>1 GB RAM ($15/mo)</option>
              <option value="4096" ${t.max_memory_mb==4096?"selected":""}>4 GB RAM ($60/mo)</option>
              <option value="8192" ${t.max_memory_mb==8192?"selected":""}>8 GB RAM ($120/mo)</option>
              <option value="16384" ${t.max_memory_mb==16384?"selected":""}>16 GB RAM ($240/mo)</option>
              <option value="32768" ${t.max_memory_mb==32768?"selected":""}>32 GB RAM ($480/mo)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Simulated Cache Hit Ratio: <strong id="lbl-hit-ratio">${((t.cache_hit_ratio??.85)*100).toFixed(0)}%</strong></label>
            <input type="range" class="form-range" data-prop="cache_hit_ratio" min="0.10" max="0.99" step="0.01" value="${t.cache_hit_ratio??.85}" />
          </div>
        `;case h.DATABASE:return`
          <div class="form-group">
            <label class="form-label">Database Engine</label>
            <select class="form-select" data-prop="db_type">
              <option value="SQL Relational" ${t.db_type==="SQL Relational"?"selected":""}>SQL Relational (PostgreSQL / MySQL)</option>
              <option value="NoSQL Document" ${t.db_type==="NoSQL Document"?"selected":""}>NoSQL Document (MongoDB / DynamoDB)</option>
              <option value="Key-Value" ${t.db_type==="Key-Value"?"selected":""}>Key-Value (Cassandra / ScyllaDB)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sharding Strategy</label>
            <select class="form-select" data-prop="sharding_strategy">
              <option value="None" ${!t.sharding_strategy||t.sharding_strategy==="None"?"selected":""}>None (Single Master Instance)</option>
              <option value="Hash" ${t.sharding_strategy==="Hash"?"selected":""}>Consistent Hash Key Sharding</option>
              <option value="Range" ${t.sharding_strategy==="Range"?"selected":""}>Range-based Partitioning</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Read Replicas: <strong id="lbl-replicas">${t.read_replicas??0}</strong></label>
            <input type="range" class="form-range" data-prop="read_replicas" min="0" max="10" step="1" value="${t.read_replicas??0}" />
            <span class="form-hint">Each read replica adds ~80% extra read throughput</span>
          </div>
        `;case h.LOAD_BALANCER:return`
          <div class="form-group">
            <label class="form-label">Balancing Algorithm</label>
            <select class="form-select" data-prop="lb_algorithm">
              <option value="Round Robin" ${t.lb_algorithm==="Round Robin"?"selected":""}>Round Robin (Cyclic)</option>
              <option value="Least Connections" ${t.lb_algorithm==="Least Connections"?"selected":""}>Least Connections (Dynamic)</option>
              <option value="Consistent Hashing" ${t.lb_algorithm==="Consistent Hashing"?"selected":""}>Consistent Hashing (Sticky Sessions)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Health Check Interval</label>
            <select class="form-select" data-prop="health_check_interval_ms">
              <option value="1000" ${t.health_check_interval_ms==1e3?"selected":""}>1,000 ms (Fast Failover)</option>
              <option value="5000" ${t.health_check_interval_ms==5e3?"selected":""}>5,000 ms (Standard)</option>
              <option value="15000" ${t.health_check_interval_ms==15e3?"selected":""}>15,000 ms (Low Overhead)</option>
            </select>
          </div>
        `;case h.MICROSERVICE:return`
          <div class="form-group">
            <label class="form-label">Replicas / Instances: <strong id="lbl-instances">${t.instances??1}</strong></label>
            <input type="range" class="form-range" data-prop="instances" min="1" max="20" step="1" value="${t.instances??1}" />
          </div>
          <div class="form-group">
            <label class="form-label">Concurrency Limit per Instance</label>
            <select class="form-select" data-prop="concurrency_limit">
              <option value="500" ${t.concurrency_limit==500?"selected":""}>500 concurrent connections</option>
              <option value="2000" ${t.concurrency_limit==2e3?"selected":""}>2,000 concurrent connections</option>
              <option value="8000" ${t.concurrency_limit==8e3?"selected":""}>8,000 concurrent connections</option>
            </select>
          </div>
        `;case h.MESSAGE_QUEUE:return`
          <div class="form-group">
            <label class="form-label">Queue Architecture</label>
            <select class="form-select" data-prop="queue_type">
              <option value="Kafka Log" ${t.queue_type==="Kafka Log"?"selected":""}>Apache Kafka (Distributed Append Log)</option>
              <option value="RabbitMQ AMQP" ${t.queue_type==="RabbitMQ AMQP"?"selected":""}>RabbitMQ (AMQP Broker)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Partition Count: <strong id="lbl-partitions">${t.partitions??16}</strong></label>
            <input type="range" class="form-range" data-prop="partitions" min="4" max="64" step="4" value="${t.partitions??16}" />
          </div>
        `;case h.CDN:return`
          <div class="form-group">
            <label class="form-label">Edge Cache Hit Ratio: <strong id="lbl-edge-ratio">${((t.edge_cache_ratio??.85)*100).toFixed(0)}%</strong></label>
            <input type="range" class="form-range" data-prop="edge_cache_ratio" min="0.50" max="0.99" step="0.01" value="${t.edge_cache_ratio??.85}" />
          </div>
        `;case h.CLIENT:return`
          <div class="client-traffic-note">
            <span class="client-note-icon">💡</span>
            <div class="client-note-text">
              <strong>Traffic Source:</strong> Represents client requests. Adjust total traffic volume (RPS) and burst patterns using the <strong>Traffic Simulation</strong> controls in the left sidebar.
            </div>
          </div>
        `;default:return`
          <p class="text-secondary" style="font-size: 12.5px; line-height: 1.45;">Standard architectural component. Scalable via upstream routing and load balancing.</p>
        `}}_bindFormInputs(e){const t=this.container.querySelector("#node-name-input");t&&t.addEventListener("change",()=>{d.renameNode(e.id,t.value.trim()||e.name)}),this.container.querySelectorAll(".inspector-brand-chip").forEach(c=>{c.addEventListener("click",u=>{u.preventDefault();const p=c.getAttribute("data-brand"),m=J(e.component_type,p);m.length>0&&(d.updateNodeModel(e.id,m[0].id,!0),this.renderNodeConfig(e))})});const i=this.container.querySelector("#node-model-select");i&&i.addEventListener("change",c=>{const u=c.target.value;d.updateNodeModel(e.id,u,!0),this.renderNodeConfig(e)});const o=this.container.querySelector("#btn-close-config");o&&o.addEventListener("click",()=>d.clearSelection());const n=this.container.querySelector("#btn-toggle-concept"),a=this.container.querySelector("#concept-drawer");n&&a&&n.addEventListener("click",()=>{const c=a.style.display==="none";a.style.display=c?"flex":"none",n.classList.toggle("expanded",c)});const r=this.container.querySelector("#btn-delete-node");r&&r.addEventListener("click",()=>d.removeNode(e.id)),this.container.querySelectorAll("[data-prop]").forEach(c=>{c.addEventListener("input",u=>{const p=c.getAttribute("data-prop");let m=c.value;if((c.type==="range"||c.type==="number")&&(m=Number(m)),p==="cache_hit_ratio"){const f=this.container.querySelector("#lbl-hit-ratio");f&&(f.textContent=`${(m*100).toFixed(0)}%`)}else if(p==="read_replicas"){const f=this.container.querySelector("#lbl-replicas");f&&(f.textContent=m)}else if(p==="instances"){const f=this.container.querySelector("#lbl-instances");f&&(f.textContent=m)}else if(p==="partitions"){const f=this.container.querySelector("#lbl-partitions");f&&(f.textContent=m)}else if(p==="edge_cache_ratio"){const f=this.container.querySelector("#lbl-edge-ratio");f&&(f.textContent=`${(m*100).toFixed(0)}%`)}d.updateNodeConfig(e.id,{[p]:m})})})}_updateTelemetry(e){const t=this.container.querySelector("#tel-incoming"),s=this.container.querySelector("#tel-load"),i=this.container.querySelector("#tel-latency");if(t&&(t.textContent=`${e.incoming_rps.toLocaleString()} rps`),s){const o=(e.cpu_utilization*100).toFixed(0);s.textContent=`${o}%`,s.style.color=e.cpu_utilization>1?"#EF4444":e.cpu_utilization>.7?"#F59E0B":"#10B981"}i&&(i.textContent=`${e.p50_latency_ms}ms`)}renderEdgeConfig(e){const t=d.nodes.get(e.from),s=d.nodes.get(e.to),i=t?W[t.component_type]||{}:{},o=s?W[s.component_type]||{}:{},n=Y[e.protocol]||{name:e.protocol,latencyMs:e.latency_overhead_ms||2,description:"Network communication protocol between nodes.",pros:"Standard connectivity",cons:"None specified",bestFor:"Inter-node communication"},a=Object.keys(Y);this.container.innerHTML=`
      <div class="config-header">
        <div class="config-title-row">
          <div class="component-icon-badge" style="background: rgba(99, 102, 241, 0.15); color: #6366F1;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
          <div class="config-title-wrap">
            <span class="node-name-field" style="padding: 2px 0;">Connection Wire</span>
            <span class="config-type-badge">${e.protocol}</span>
          </div>
          <button id="btn-close-config" class="btn-icon-close" title="Close">✕</button>
        </div>
      </div>

      <div class="config-body">
        <!-- Node Connection Endpoints Card -->
        <div class="edge-endpoints-card">
          <div class="endpoint-node">
            <span class="endpoint-dot" style="background: ${i.color||"#3B82F6"};"></span>
            <span class="endpoint-name">${t?t.name:"Unknown"}</span>
          </div>
          <div class="endpoint-arrow">➔</div>
          <div class="endpoint-node">
            <span class="endpoint-dot" style="background: ${o.color||"#10B981"};"></span>
            <span class="endpoint-name">${s?s.name:"Unknown"}</span>
          </div>
        </div>

        <!-- Protocol Selection Form -->
        <div class="form-group">
          <label class="form-label">Network Protocol</label>
          <select class="form-select" id="edge-protocol-select">
            ${a.map(r=>`
              <option value="${r}" ${r===e.protocol?"selected":""}>${Y[r].name} (${Y[r].category})</option>
            `).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Network Latency Overhead: <strong id="lbl-edge-latency">${(e.latency_overhead_ms||1).toFixed(1)}ms</strong></label>
          <input type="range" class="form-range" id="edge-latency-range" min="0.2" max="25.0" step="0.2" value="${e.latency_overhead_ms||1}" />
        </div>

        <!-- Protocol Deep Dive Info Card -->
        <div class="concept-explainer-card">
          <div class="concept-explainer-header">
            <span class="concept-icon">🌐</span>
            <span class="concept-heading">${n.name}</span>
          </div>
          <div class="concept-body-text">
            ${n.description}
          </div>
          <div class="protocol-pros-cons">
            <div class="pro-item"><strong>✓ Pros:</strong> ${n.pros}</div>
            <div class="con-item"><strong>✗ Cons:</strong> ${n.cons}</div>
          </div>
          <div class="concept-interview-tip">
            <strong>🎯 Best For:</strong> ${n.bestFor}
          </div>
        </div>

        <div class="config-divider"></div>

        <button id="btn-delete-edge" class="btn-delete-component">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>Delete Connection Wire</span>
        </button>
      </div>
    `,this._bindEdgeEvents(e)}_bindEdgeEvents(e){const t=this.container.querySelector("#btn-close-config");t&&t.addEventListener("click",()=>{d.clearSelection(),this.closeMobileInspector()});const s=this.container.querySelector("#edge-protocol-select");s&&s.addEventListener("change",n=>{const a=n.target.value,r=Y[a],l=r?r.latencyMs:e.latency_overhead_ms||1;d.updateEdgeConfig(e.id,{protocol:a,latency_overhead_ms:l}),this.renderEdgeConfig(e)});const i=this.container.querySelector("#edge-latency-range");i&&i.addEventListener("input",n=>{const a=Number(n.target.value),r=this.container.querySelector("#lbl-edge-latency");r&&(r.textContent=`${a.toFixed(1)}ms`),d.updateEdgeConfig(e.id,{latency_overhead_ms:a})});const o=this.container.querySelector("#btn-delete-edge");o&&o.addEventListener("click",()=>{d.removeEdge(e.id)})}}class xe{constructor(e){this.container=e,this.render(),this._bindEvents()}render(){this.container.innerHTML=`
      <div class="metrics-bar">
        <div class="metric-item">
          <span class="metric-label">p50 Latency</span>
          <span class="metric-value" id="hud-p50">0ms</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">p95 Latency</span>
          <span class="metric-value" id="hud-p95">0ms</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">p99 Latency</span>
          <span class="metric-value" id="hud-p99">0ms</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">Error Rate</span>
          <span class="metric-value" id="hud-error">0.0%</span>
        </div>
        <div class="metric-divider"></div>

        <div class="metric-item">
          <span class="metric-label">Est. Cloud Cost</span>
          <span class="metric-value" id="hud-cost">$0/mo</span>
        </div>
      </div>
    `}_bindEvents(){y.on(S.SIM_METRICS_UPDATED,e=>{const t=this.container.querySelector("#hud-p50"),s=this.container.querySelector("#hud-p95"),i=this.container.querySelector("#hud-p99"),o=this.container.querySelector("#hud-error"),n=this.container.querySelector("#hud-cost");if(t&&(t.textContent=`${e.overall_p50_ms}ms`),s&&(s.textContent=`${e.overall_p95_ms}ms`,s.style.color=e.overall_p95_ms>200?"#EF4444":e.overall_p95_ms>80?"#F59E0B":"inherit"),i&&(i.textContent=`${e.overall_p99_ms}ms`),o){const a=e.total_requests>0?(e.failed_requests/e.total_requests*100).toFixed(1):"0.0";o.textContent=`${a}%`,o.style.color=Number(a)>1?"#EF4444":"inherit"}n&&(n.textContent=`$${e.total_estimated_cost_monthly_usd.toLocaleString()}/mo`)})}}const Z=[{id:"saas",icon:"☕",title:"15k SaaS",subtitle:"Normal Day",rps:15e3,profile:"Constant",tip:"Typical steady business traffic. Easily handled by 1-2 web app instances."},{id:"viral",icon:"📈",title:"80k Wave",subtitle:"Viral Surge",rps:8e4,profile:"Sinusoidal",tip:"Trending social media post. Traffic ebbs and flows with daily peak hours."},{id:"flash500k",icon:"⚡",title:"500k Spike",subtitle:"Flash Drop",rps:5e5,profile:"Spike",tip:"Ticketmaster/Prime Day burst! Tests autoscaler lag and database connection limits."},{id:"superbowl",icon:"🏆",title:"1M Peak",subtitle:"Super Bowl",rps:12e5,profile:"Spike",tip:"100M TV viewers scan a QR code simultaneously. Extreme stress test on edge caches!"}];function ee(g){return g<25e3?{level:"level-low",badge:"🟢 Startup / SaaS Tier",tag:`${g>=1e3?(g/1e3).toFixed(0)+"k":g} req/s`,desc:"Light steady traffic. Handled easily by 1–2 web application instances."}:g<1e5?{level:"level-mid",badge:"🟡 E-Commerce Day Traffic",tag:`${(g/1e3).toFixed(0)}k req/s`,desc:"Active shopping traffic. Requires a Load Balancer & DB connection pool."}:g<4e5?{level:"level-high",badge:"🟠 Viral / Streaming Tier",tag:`${(g/1e3).toFixed(0)}k req/s`,desc:"High scale! Needs Redis caching (80%+ hit rate) & database read replicas."}:g<8e5?{level:"level-spike",badge:"🔴 Flash Sale (500k RPS)",tag:`${(g/1e3).toFixed(0)}k req/s`,desc:"⚡ Mega-Event scale! Instant burst causes autoscaler lag; buffer with Queues or CDNs."}:{level:"level-extreme",badge:"🟣 Super Bowl / Global Scale",tag:`${(g/1e6).toFixed(1)}M req/s`,desc:"🔥 Extreme scale! Requires aggressive CDN edge caching & Token Bucket rate limiting."}}class Le{constructor(e){this.container=e,this.isCollapsed=!1,this.activePresetId=null,this.waveTimer=null,this.wavePhase=0,this.baseRps=d.simConfig.target_rps||5e4,this.render(),this._bindEvents(),this._initModal()}render(){if(!this.container)return;const e=d.simConfig.isRunning,t=d.simConfig.target_rps,s=d.simConfig.profile||"Constant",i=ee(t),o=t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${(t/1e3).toFixed(0)}k`:`${t}`;this.container.innerHTML=`
      <div class="load-card ${this.isCollapsed?"collapsed":""}" id="load-card-inner">
        <!-- Header -->
        <div class="load-card-header">
          <button id="btn-toggle-sim" class="btn-sim-play ${e?"active":""}" title="${e?"Pause Simulation":"Start Simulation"}">
            ${e?'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>':'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'}
          </button>
          <div class="load-title-wrap">
            <span class="load-title">Traffic Generator</span>
            <span class="load-badge-sub">Synthetic Load</span>
          </div>

          <span class="load-card-min-stats" id="load-min-rps">${o} rps</span>

          <div class="load-header-actions">
            <button id="btn-load-edu" class="btn-load-edu" title="Learn Traffic Concepts & Scale">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Guide</span>
            </button>
            <button id="btn-collapse-load" class="btn-load-toggle-collapse" title="${this.isCollapsed?"Expand Controls":"Collapse Controls"}">
              ${this.isCollapsed?"▲":"▼"}
            </button>
          </div>
        </div>

        <!-- Real-World Scenarios Presets -->
        <div class="load-scenarios-section">
          <div class="load-section-label">Real-World Presets</div>
          <div class="load-scenarios-grid">
            ${Z.map(n=>`
              <button class="scenario-preset-btn ${this.activePresetId===n.id?"active":""}" data-preset-id="${n.id}" title="${n.tip}">
                <span class="preset-icon">${n.icon}</span>
                <div class="preset-text">
                  <span class="preset-title">${n.title}</span>
                  <span class="preset-sub">${n.subtitle}</span>
                </div>
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Volume Slider & Exact Input -->
        <div class="load-slider-section">
          <div class="load-slider-header">
            <span class="load-section-label">Load Volume (RPS)</span>
            <div class="load-input-wrap">
              <input type="number" id="load-number-input" class="load-num-field" min="1000" max="2500000" step="5000" value="${t}" />
              <span class="load-unit">req/s</span>
            </div>
          </div>
          <div class="load-controls-row">
            <input type="range" id="load-slider" class="load-slider" min="1000" max="1500000" step="5000" value="${t}" />
          </div>
        </div>

        <!-- Real-World Mental Analogy Box -->
        <div class="load-analogy-box ${i.level}" id="load-analogy-box">
          <div class="analogy-top">
            <span class="analogy-badge" id="analogy-badge">${i.badge}</span>
            <span class="analogy-tag" id="analogy-tag">${i.tag}</span>
          </div>
          <p class="analogy-desc" id="analogy-desc">${i.desc}</p>
        </div>

        <!-- Traffic Profiles with Waveform Sparklines -->
        <div class="load-profiles-section">
          <div class="load-section-label">Traffic Pattern Profile</div>
          <div class="load-profiles-row">
            <button class="profile-chip ${s==="Constant"?"active":""}" data-profile="Constant" title="Predictable flat traffic. Cloud autoscalers stay stable.">
              <svg class="profile-sparkline" width="16" height="10" viewBox="0 0 24 10" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="2" y1="5" x2="22" y2="5"/></svg>
              <span>Constant</span>
            </button>
            <button class="profile-chip ${s==="Spike"?"active":""}" data-profile="Spike" title="Instantaneous surge. Tests queue depth & autoscaler lag!">
              <svg class="profile-sparkline" width="16" height="10" viewBox="0 0 24 10" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="2,8 9,8 12,2 15,8 22,8"/></svg>
              <span>⚡ Spike</span>
            </button>
            <button class="profile-chip ${s==="Sinusoidal"?"active":""}" data-profile="Sinusoidal" title="Natural diurnal wave. Traffic ebbs and flows gradually.">
              <svg class="profile-sparkline" width="16" height="10" viewBox="0 0 24 10" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M2,5 C6,0 8,10 12,5 C16,0 18,10 22,5"/></svg>
              <span>🌊 Wave</span>
            </button>
          </div>
        </div>
      </div>
    `}_bindEvents(){this.container.querySelector("#load-card-inner");const e=this.container.querySelector("#btn-toggle-sim"),t=this.container.querySelector("#load-slider"),s=this.container.querySelector("#load-number-input"),i=this.container.querySelectorAll(".profile-chip"),o=this.container.querySelectorAll(".scenario-preset-btn"),n=this.container.querySelector("#btn-collapse-load"),a=this.container.querySelector("#btn-load-edu");n&&n.addEventListener("click",()=>{this.isCollapsed=!this.isCollapsed,this.render(),this._bindEvents()}),a&&a.addEventListener("click",r=>{r.stopPropagation(),this.openEducationModal()}),e&&e.addEventListener("click",()=>{d.simConfig.isRunning?(d.pauseSimulation(),this._stopWaveAnimation()):(d.startSimulation(),d.simConfig.profile==="Sinusoidal"&&this._startWaveAnimation()),this.render(),this._bindEvents()}),t&&t.addEventListener("input",()=>{const r=Number(t.value);s&&(s.value=r),this.baseRps=r,this.activePresetId=null,this._updateAnalogy(r),d.updateSimConfig({target_rps:r}),this._updateMinStats(r)}),s&&s.addEventListener("change",()=>{let r=Math.max(100,Number(s.value)||1e3);t&&(t.value=r),this.baseRps=r,this.activePresetId=null,this._updateAnalogy(r),d.updateSimConfig({target_rps:r}),this._updateMinStats(r)}),o.forEach(r=>{r.addEventListener("click",()=>{const l=r.getAttribute("data-preset-id"),c=Z.find(u=>u.id===l);c&&(this.activePresetId=c.id,this.baseRps=c.rps,d.updateSimConfig({target_rps:c.rps,profile:c.profile}),d.simConfig.isRunning||d.startSimulation(),c.profile==="Sinusoidal"?this._startWaveAnimation():this._stopWaveAnimation(),c.profile==="Spike"&&this._triggerSpikeFlash(),A(`${c.icon} Activated ${c.title}: ${c.subtitle}!`,"info",3e3),this.render(),this._bindEvents())})}),i.forEach(r=>{r.addEventListener("click",()=>{i.forEach(c=>c.classList.remove("active")),r.classList.add("active");const l=r.getAttribute("data-profile");if(l==="Spike"){const c=Math.max(5e5,this.baseRps*3);this.baseRps=c,d.updateSimConfig({target_rps:c,profile:"Spike"}),d.simConfig.isRunning||d.startSimulation(),this._stopWaveAnimation(),this._triggerSpikeFlash(),A("⚡ 500k RPS Spike Injected! Observe autoscaler lag and queue bottlenecks.","warning",4500)}else l==="Sinusoidal"?(d.updateSimConfig({profile:"Sinusoidal"}),d.simConfig.isRunning&&this._startWaveAnimation(),A("🌊 Wave profile active: Traffic ebbs & flows smoothly.","info",2500)):(this._stopWaveAnimation(),d.updateSimConfig({profile:"Constant",target_rps:this.baseRps}));t&&(t.value=d.simConfig.target_rps),s&&(s.value=d.simConfig.target_rps),this._updateAnalogy(d.simConfig.target_rps),this._updateMinStats(d.simConfig.target_rps)})}),y.on(S.SIM_CONFIG_CHANGED,r=>{t&&(t.value=r.target_rps),s&&(s.value=r.target_rps),this.baseRps=r.target_rps,this._updateAnalogy(r.target_rps),this._updateMinStats(r.target_rps)})}_updateAnalogy(e){const t=this.container.querySelector("#load-analogy-box"),s=this.container.querySelector("#analogy-badge"),i=this.container.querySelector("#analogy-tag"),o=this.container.querySelector("#analogy-desc");if(!t||!s||!o)return;const n=ee(e);t.className=`load-analogy-box ${n.level}`,s.textContent=n.badge,i&&(i.textContent=n.tag),o.textContent=n.desc}_updateMinStats(e){const t=this.container.querySelector("#load-min-rps");if(t){const s=e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(0)}k`:`${e}`;t.textContent=`${s} rps`}}_triggerSpikeFlash(){const e=this.container.querySelector("#load-card-inner");e&&(e.classList.remove("spike-flash"),e.offsetWidth,e.classList.add("spike-flash"))}_startWaveAnimation(){this._stopWaveAnimation(),this.wavePhase=0,this.waveTimer=setInterval(()=>{if(!d.simConfig.isRunning||d.simConfig.profile!=="Sinusoidal"){this._stopWaveAnimation();return}this.wavePhase+=.25;const e=1+.18*Math.sin(this.wavePhase),t=Math.round(this.baseRps*e);d.updateSimConfig({target_rps:t})},1e3)}_stopWaveAnimation(){this.waveTimer&&(clearInterval(this.waveTimer),this.waveTimer=null)}_initModal(){if(document.getElementById("traffic-edu-modal"))return;const e=document.createElement("div");e.id="traffic-edu-modal",e.className="traffic-edu-overlay",e.innerHTML=`
      <div class="traffic-edu-modal">
        <div class="traffic-edu-header">
          <div class="traffic-edu-header-left">
            <span class="traffic-edu-badge">SYSTEM DESIGN CONCEPT GUIDE</span>
            <h2 class="traffic-edu-title">Traffic Scale, Spikes & Synthetic Load</h2>
          </div>
          <button class="traffic-edu-close" id="btn-close-traffic-edu" title="Close Guide">✕</button>
        </div>

        <div class="traffic-edu-body">
          <!-- Card 1: What is Synthetic Load? -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon robot">🤖</div>
              <div>
                <h3 class="edu-card-title">What is "Synthetic Load"?</h3>
                <span class="edu-card-subtitle">Robot-generated traffic vs. organic human users</span>
              </div>
            </div>
            <p class="edu-card-text">
              <strong>Organic traffic</strong> is human behavior—people tapping, scrolling, and buying at irregular intervals. You cannot ask 500,000 real people to hit "Buy Now" at the exact same second just to test if your servers crash.
            </p>
            <p class="edu-card-text">
              <strong>Synthetic load</strong> is programmatic, simulated traffic injected by test harnesses (or this simulator). It stresses your architecture under predictable loads to detect memory leaks, race conditions, connection pool exhaustion, and CPU saturation <em>before</em> real users arrive.
            </p>
          </div>

          <!-- Card 2: What is 500k RPS? -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon meter">📊</div>
              <div>
                <h3 class="edu-card-title">Demystifying "500k RPS" (Scale Anchors)</h3>
                <span class="edu-card-subtitle">500,000 requests every second = 30 million/minute</span>
              </div>
            </div>
            <p class="edu-card-text">
              Numbers like "50,000" or "500,000" sound abstract. Here is how they correspond to real industry tiers:
            </p>
            <div class="edu-scale-table">
              <div class="scale-row">
                <span class="scale-tier">1k RPS</span>
                <span class="scale-name">Typical SaaS / Startup</span>
                <span class="scale-detail">Single server + database handles this comfortably.</span>
              </div>
              <div class="scale-row">
                <span class="scale-tier">50k RPS</span>
                <span class="scale-name">E-Commerce Daytime</span>
                <span class="scale-detail">Requires load balancers, 15+ API pods, and DB read replicas.</span>
              </div>
              <div class="scale-row">
                <span class="scale-tier">200k RPS</span>
                <span class="scale-name">Global Streaming Tier</span>
                <span class="scale-detail">Must have Redis caching (85%+ hit rate) to protect database.</span>
              </div>
              <div class="scale-row highlight">
                <span class="scale-tier">500k+ RPS</span>
                <span class="scale-name">⚡ Flash Sale / Ticket Drop</span>
                <span class="scale-detail">Taylor Swift / Prime Day. Unbuffered requests will cause instant outages.</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Why Spikes Break Systems -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon warning">⚡</div>
              <div>
                <h3 class="edu-card-title">Why do "Spike Loads" Crash Systems?</h3>
                <span class="edu-card-subtitle">The Autoscaler Lag Problem</span>
              </div>
            </div>
            <p class="edu-card-text">
              Cloud autoscalers (Kubernetes HPA, AWS Auto Scaling) easily handle <strong>Wave (sinusoidal)</strong> traffic because daily traffic rises over 30–60 minutes.
            </p>
            <div class="edu-lag-diagram">
              <div class="lag-step">
                <span class="lag-num">1</span>
                <div><strong>0–10s: Traffic Jumps 10x Instantly</strong><br>500k RPS slams into your 4 unscaled backend pods.</div>
              </div>
              <div class="lag-step">
                <span class="lag-num">2</span>
                <div><strong>10s–3 min: The Autoscaler Lag Window</strong><br>Metrics poll → CPU triggers alert → Cloud launches VMs/Docker → JVM/Node boots up.</div>
              </div>
              <div class="lag-step danger">
                <span class="lag-num">💥</span>
                <div><strong>The Crash: 90,000,000 Unbuffered Requests</strong><br>During that 3-minute lag, connection pools exhaust, RAM runs out, and pods crash in a cascading failure.</div>
              </div>
            </div>
          </div>

          <!-- Card 4: Architectural Remedies -->
          <div class="edu-card">
            <div class="edu-card-header">
              <div class="edu-card-icon shield">🛡️</div>
              <div>
                <h3 class="edu-card-title">How to Architect for 500k RPS Spikes</h3>
                <span class="edu-card-subtitle">Essential components in this simulator</span>
              </div>
            </div>
            <div class="edu-remedies-grid">
              <div class="remedy-item">
                <span class="remedy-icon">🌐</span>
                <div>
                  <strong>CDN / Edge Cache</strong>
                  <p>Absorbs 85–95% of static and read requests before they reach your origin network.</p>
                </div>
              </div>
              <div class="remedy-item">
                <span class="remedy-icon">⚡</span>
                <div>
                  <strong>In-Memory Cache (Redis)</strong>
                  <p>Sub-millisecond latency. Serves frequent reads so your relational DB doesn't hit 100% CPU.</p>
                </div>
              </div>
              <div class="remedy-item">
                <span class="remedy-icon">📬</span>
                <div>
                  <strong>Message Queue (Kafka / SQS)</strong>
                  <p>The ultimate spike shock absorber. Ingests 500k writes instantly into a queue, letting backend workers drain them safely.</p>
                </div>
              </div>
              <div class="remedy-item">
                <span class="remedy-icon">🚦</span>
                <div>
                  <strong>Rate Limiting (Token Bucket)</strong>
                  <p>Protects your servers by shedding load (HTTP 429) rather than suffering a full cluster blackout.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="traffic-edu-footer">
          <button class="traffic-edu-action-btn" id="btn-edu-launch-spike">
            <span>⚡ Try 500k Flash Spike in Simulator</span>
          </button>
          <button class="traffic-edu-close-btn" id="btn-edu-dismiss">Got it</button>
        </div>
      </div>
    `,document.body.appendChild(e);const t=()=>{e.classList.remove("open")};e.querySelector("#btn-close-traffic-edu").addEventListener("click",t),e.querySelector("#btn-edu-dismiss").addEventListener("click",t),e.addEventListener("click",i=>{i.target===e&&t()});const s=e.querySelector("#btn-edu-launch-spike");s&&s.addEventListener("click",()=>{t(),this.baseRps=5e5,this.activePresetId="flash500k",d.updateSimConfig({target_rps:5e5,profile:"Spike"}),d.simConfig.isRunning||d.startSimulation(),this._triggerSpikeFlash(),A("⚡ 500k Flash Spike Activated! Watch how your components react.","warning",4e3),this.render(),this._bindEvents()}),window.addEventListener("keydown",i=>{i.key==="Escape"&&e.classList.contains("open")&&t()})}openEducationModal(){const e=document.getElementById("traffic-edu-modal");e&&e.classList.add("open")}}const F=[{name:"add_node",description:"Add a new distributed system node (load_balancer, api_gateway, microservice, cache, database, message_queue, cdn, client) to the architecture canvas.",parameters:{type:"object",properties:{component_type:{type:"string",enum:["client","load_balancer","api_gateway","microservice","cache","database","message_queue","cdn"]},name:{type:"string",description:'Descriptive title (e.g., "Redis Session Cache")'},x:{type:"number",description:"World X coordinate"},y:{type:"number",description:"World Y coordinate"},config:{type:"object",description:"Optional configuration properties"}},required:["component_type"]},execute:g=>{let e=null;return $.execute({description:`AI: Add ${g.name||g.component_type}`,execute:()=>{e=d.addNode(g).id},undo:()=>{e&&d.removeNode(e)}}),{success:!0,nodeId:e}}},{name:"connect_nodes",description:"Connect two components with a directed communication edge (HTTP/REST, gRPC, WebSocket, TCP, Async).",parameters:{type:"object",properties:{from:{type:"string",description:"Source node ID or exact node name"},to:{type:"string",description:"Target node ID or exact node name"},protocol:{type:"string",description:'Protocol name (e.g., "gRPC", "HTTPS")'}},required:["from","to"]},execute:g=>{let e=g.from,t=g.to;for(const i of d.nodes.values())i.name.toLowerCase()===g.from.toLowerCase()&&(e=i.id),i.name.toLowerCase()===g.to.toLowerCase()&&(t=i.id);let s=null;return $.execute({description:`AI: Connect ${e} -> ${t}`,execute:()=>{const i=d.addEdge({from:e,to:t,protocol:g.protocol||"HTTP/REST"});i&&(s=i.id)},undo:()=>{s&&d.removeEdge(s)}}),{success:!!s,edgeId:s}}},{name:"configure_node",description:"Update the properties of an existing node (e.g., Redis eviction LRU, DB read replicas, sharding, LB algorithm).",parameters:{type:"object",properties:{node_id:{type:"string",description:"Node ID or exact name"},config:{type:"object",description:"Key-value config parameters"}},required:["node_id","config"]},execute:g=>{let e=g.node_id;for(const t of d.nodes.values())t.name.toLowerCase()===g.node_id.toLowerCase()&&(e=t.id);return d.updateNodeConfig(e,g.config),{success:!0,nodeId:e}}},{name:"evaluate_architecture",description:"Run the real-time WebAssembly graph analyzer to identify Single Points of Failure (SPOFs), bottlenecks, and security flaws.",parameters:{type:"object",properties:{}},execute:()=>{const g=B.runSimulation(d.simConfig),e=B.analyzeGraph();return{score:e.architecture_score,spofs:e.spofs,bottlenecks:e.bottlenecks,recommendations:e.recommendations,is_healthy:g.is_healthy}}},{name:"auto_fix_spof",description:"Automatically resolves a detected Single Point of Failure by provisioning a redundant replica or load balancer.",parameters:{type:"object",properties:{node_id:{type:"string"}},required:["node_id"]},execute:g=>{const e=d.nodes.get(g.node_id);if(!e)return{success:!1,reason:"Node not found"};if(e.component_type==="database"){const t=Number(e.config.read_replicas)||0;return d.updateNodeConfig(e.id,{read_replicas:t+2,sharding_strategy:"Hash"}),{success:!0,message:`Added 2 read replicas and Hash Sharding to ${e.name}.`}}if(e.component_type==="microservice"){const t=Number(e.config.instances)||1;return d.updateNodeConfig(e.id,{instances:t+2}),{success:!0,message:`Scaled ${e.name} up to ${t+2} instances.`}}return{success:!0,message:`Redundancy policy applied to ${e.name}.`}}},{name:"load_scenario",description:"Loads a pre-built interview scenario template onto the canvas.",parameters:{type:"object",properties:{scenario_id:{type:"string",description:'ID of scenario e.g. "url-shortener"'}},required:["scenario_id"]},execute:g=>{const e=z.find(t=>t.id===g.scenario_id);return e?(d.loadGraph(e.graph),d.updateSimConfig({target_rps:e.targetRps}),{success:!0,title:e.title}):{success:!1,reason:"Scenario not found"}}}];class Ie{constructor(){this.provider=localStorage.getItem("sds_ai_provider")||"gemini",this.apiKey=localStorage.getItem("sds_ai_token")||"",this.endpoint=localStorage.getItem("sds_ai_endpoint")||(this.provider==="gemini"?"https://generativelanguage.googleapis.com/v1beta":"https://api.openai.com/v1"),this.modelName=localStorage.getItem("sds_ai_model")||(this.provider==="gemini"?"gemini-2.0-flash":"gpt-4o"),this.chatHistory=[],this.isProcessing=!1}setProvider(e){this.provider=e,localStorage.setItem("sds_ai_provider",e),e==="gemini"?((!this.modelName||this.modelName.startsWith("gpt"))&&(this.modelName="gemini-2.0-flash",localStorage.setItem("sds_ai_model",this.modelName)),(!this.endpoint||this.endpoint.includes("openai"))&&(this.endpoint="https://generativelanguage.googleapis.com/v1beta",localStorage.setItem("sds_ai_endpoint",this.endpoint))):e==="openai"&&((!this.modelName||this.modelName.includes("gemini"))&&(this.modelName="gpt-4o",localStorage.setItem("sds_ai_model",this.modelName)),(!this.endpoint||this.endpoint.includes("googleapis"))&&(this.endpoint="https://api.openai.com/v1",localStorage.setItem("sds_ai_endpoint",this.endpoint)))}setApiKey(e){this.apiKey=e.trim(),localStorage.setItem("sds_ai_token",this.apiKey),this.apiKey.startsWith("AIzaSy")?this.setProvider("gemini"):this.apiKey.startsWith("sk-")&&this.setProvider("openai")}setEndpoint(e){this.endpoint=e.trim(),localStorage.setItem("sds_ai_endpoint",this.endpoint)}setModel(e){this.modelName=e.trim(),localStorage.setItem("sds_ai_model",this.modelName)}clearSettings(){this.apiKey="",this.provider="gemini",this.modelName="gemini-2.0-flash",this.endpoint="https://generativelanguage.googleapis.com/v1beta",localStorage.removeItem("sds_ai_token"),localStorage.removeItem("sds_ai_provider"),localStorage.removeItem("sds_ai_model"),localStorage.removeItem("sds_ai_endpoint")}async testConnection({provider:e,apiKey:t,modelName:s,endpoint:i}={}){const o=e||this.provider,n=(t!==void 0?t:this.apiKey).trim(),a=(s||this.modelName||(o==="gemini"?"gemini-2.0-flash":"gpt-4o")).trim();let r=(i||this.endpoint||(o==="gemini"?"https://generativelanguage.googleapis.com/v1beta":"https://api.openai.com/v1")).trim();if(r.endsWith("/")&&(r=r.slice(0,-1)),!n)throw new Error("Please enter an API Key / Token before testing.");const l=o==="gemini"||n.startsWith("AIzaSy")||a.toLowerCase().includes("gemini"),c=performance.now();if(l){const u=`${r}/models/${a}:generateContent?key=${n}`,p=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:"Ping test. Reply with: System Design Simulator Ready."}]}]})}),m=Math.round(performance.now()-c);if(!p.ok){const v=await p.text();let b=v;try{const w=JSON.parse(v);w.error&&w.error.message&&(b=w.error.message)}catch{}throw new Error(`Google Gemini (${p.status}): ${b}`)}const E=(await p.json()).candidates?.[0]?.content?.parts?.[0]?.text?.trim()||"OK";return{success:!0,provider:"Google Gemini",model:a,latencyMs:m,sampleReply:E}}else{const u=`${r}/chat/completions`,p=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:a,messages:[{role:"user",content:"Ping test. Reply with: System Design Simulator Ready."}],max_tokens:15})}),m=Math.round(performance.now()-c);if(!p.ok){const v=await p.text();let b=v;try{const w=JSON.parse(v);w.error&&w.error.message&&(b=w.error.message)}catch{}throw new Error(`OpenAI / Custom Endpoint (${p.status}): ${b}`)}const E=(await p.json()).choices?.[0]?.message?.content?.trim()||"OK";return{success:!0,provider:"OpenAI / Custom",model:a,latencyMs:m,sampleReply:E}}}async processMessage(e){this.isProcessing=!0,y.emit(S.AI_STATUS_CHANGED,{isProcessing:!0}),this.chatHistory.push({role:"user",content:e}),y.emit(S.AI_MESSAGE_ADDED,{role:"user",content:e});try{let t;return this.apiKey?this.provider==="gemini"||this.apiKey.startsWith("AIzaSy")||this.modelName.toLowerCase().includes("gemini")?t=await this._callGeminiWithTools(e):t=await this._callOpenAiWithTools(e):t=await this._synthesizeArchitecture(e),this.chatHistory.push({role:"assistant",content:t.reply}),y.emit(S.AI_MESSAGE_ADDED,{role:"assistant",content:t.reply}),t}catch(t){console.error("[LangChainAgent] Execution error:",t);const s=`Error: ${t.message}. Please check your API token or model settings.`;return this.chatHistory.push({role:"assistant",content:s}),y.emit(S.AI_MESSAGE_ADDED,{role:"assistant",content:s}),{reply:s,executedTools:[]}}finally{this.isProcessing=!1,y.emit(S.AI_STATUS_CHANGED,{isProcessing:!1})}}async _callGeminiWithTools(e){const t=[{functionDeclarations:F.map(b=>({name:b.name,description:b.description,parameters:b.parameters}))}],s=[],i=this.chatHistory.slice(-8);for(const b of i)s.push({role:b.role==="assistant"?"model":"user",parts:[{text:b.content}]});const o="You are an expert Principal Distributed Systems Architect. You design, evaluate, and optimize system design topologies on an interactive 60FPS WebAssembly canvas. You have access to tools to add nodes, connect edges, configure settings, and evaluate SPOFs. Always execute necessary tools to modify the canvas before providing concise architectural explanations.",n=this.modelName||"gemini-2.0-flash";let a=this.endpoint||"https://generativelanguage.googleapis.com/v1beta";a.endsWith("/")&&(a=a.slice(0,-1));const r=`${a}/models/${n}:generateContent?key=${this.apiKey}`,c=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:o}]},contents:s,tools:t})});if(!c.ok){const b=await c.text();let w=b;try{const P=JSON.parse(b);P.error&&P.error.message&&(w=P.error.message)}catch{}throw new Error(`Google Gemini API (${c.status}): ${w}`)}const p=(await c.json()).candidates?.[0];if(!p||!p.content)throw new Error("Gemini API did not return any candidates.");const m=[],f=[],E=p.content.parts||[];for(const b of E){if(b.functionCall){const w=b.functionCall.name,P=b.functionCall.args||{},N=F.find(_=>_.name===w);N&&(N.execute(P),m.push(`${w}(${JSON.stringify(P)})`))}b.text&&f.push(b.text)}let v=f.join(`

`).trim();return!v&&m.length>0?v=`I have updated your architecture canvas via Gemini:

`+m.map(b=>`• \`${b}\``).join(`
`)+`

The components and connections have been rendered live on the 60FPS canvas!`:v||(v="Architecture updated successfully."),{reply:v,executedTools:m}}async _callOpenAiWithTools(e){const t=F.map(c=>({type:"function",function:{name:c.name,description:c.description,parameters:c.parameters}}));let s=this.endpoint||"https://api.openai.com/v1";s.endsWith("/")&&(s=s.slice(0,-1));const i=s.includes("/chat/completions")?s:`${s}/chat/completions`,o=await fetch(i,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({model:this.modelName||"gpt-4o",messages:[{role:"system",content:"You are an expert Principal Distributed Systems Architect. You design, evaluate, and optimize system design topologies on an interactive 60FPS WebAssembly canvas. You have access to tools to add nodes, connect edges, configure settings, and evaluate SPOFs. Always execute necessary tools before giving concise architectural explanations."},...this.chatHistory.slice(-6)],tools:t,tool_choice:"auto"})});if(!o.ok)throw new Error(`OpenAI API returned HTTP ${o.status}: ${await o.text()}`);const r=(await o.json()).choices[0].message,l=[];if(r.tool_calls&&r.tool_calls.length>0)for(const c of r.tool_calls){const u=c.function.name,p=JSON.parse(c.function.arguments||"{}"),m=F.find(f=>f.name===u);m&&(m.execute(p),l.push(`${u}(${JSON.stringify(p)})`))}return{reply:r.content||`Executed tools: ${l.join(", ")}`,executedTools:l}}async _synthesizeArchitecture(e){const t=e.toLowerCase(),s=[];if(t.includes("url shortener")||t.includes("bitly"))return F.find(r=>r.name==="load_scenario").execute({scenario_id:"url-shortener"}),s.push("load_scenario(url-shortener)"),{reply:"I've synthesized a complete **URL Shortener** architecture for you! It features an Edge Load Balancer, API Gateway, stateless Redirect Microservices, an in-memory Redis URL cache for sub-10ms redirects, and a sharded PostgreSQL database with read replicas.",executedTools:s};if(t.includes("streaming")||t.includes("netflix")||t.includes("youtube")||t.includes("video"))return F.find(r=>r.name==="load_scenario").execute({scenario_id:"streaming-service"}),s.push("load_scenario(streaming-service)"),{reply:"I've deployed a global **Video Streaming Architecture** (Netflix-scale). Key patterns: Cloudflare CDN for chunked video blob streaming, asynchronous Transcoding Worker pods fed by Kafka, and a high-throughput NoSQL metadata store.",executedTools:s};if(t.includes("chat")||t.includes("whatsapp")||t.includes("slack"))return F.find(r=>r.name==="load_scenario").execute({scenario_id:"chat-app"}),s.push("load_scenario(chat-app)"),{reply:"I've architected a real-time **Chat & Messaging System**! It features an L4 Load Balancer routing persistent WebSocket connection clusters, Kafka event streaming for message delivery, Redis ephemeral presence storage, and Cassandra for append-only message history.",executedTools:s};if(t.includes("spof")||t.includes("fix")||t.includes("single point of failure")){const a=F.find(l=>l.name==="auto_fix_spof");let r=0;for(const l of d.nodes.values())a.execute({node_id:l.id}).success&&(s.push(`auto_fix_spof(${l.name})`),r++);return{reply:r>0?`I detected and hardened **${r} Single Points of Failure** across your topology by adding upstream load balancers, caching layers, and database read replicas.`:"No critical single points of failure detected! Your system design already satisfies high-availability redundancy criteria.",executedTools:s}}if(t.includes("add")||t.includes("create")){let a="microservice",r="App Server";return t.includes("cache")||t.includes("redis")?(a="cache",r="Redis Cache"):t.includes("load balancer")||t.includes("lb")?(a="load_balancer",r="Edge Load Balancer"):t.includes("database")||t.includes("db")?(a="database",r="PostgreSQL DB"):t.includes("queue")||t.includes("kafka")?(a="message_queue",r="Kafka Queue"):t.includes("gateway")?(a="api_gateway",r="API Gateway"):t.includes("cdn")&&(a="cdn",r="Cloudflare CDN"),F.find(c=>c.name==="add_node").execute({component_type:a,name:r,x:300+(Math.random()*80-40),y:350+(Math.random()*80-40)}),s.push(`add_node(${a})`),{reply:`Added a new **${r}** (${a}) to the canvas! You can drag connection wires between its ports or customize its properties in the inspector.`,executedTools:s}}const o=F.find(a=>a.name==="evaluate_architecture").execute();s.push("evaluate_architecture");const n=[...o.spofs.map(a=>`⚠️ **SPOF**: ${a.reason}`),...o.bottlenecks.map(a=>`🔥 **Bottleneck**: ${a}`),...o.recommendations.map(a=>`💡 **Recommendation**: ${a}`)];return{reply:`I evaluated your architecture (Resilience Score: **${o.score}/100**):

`+(n.length>0?n.join(`

`):"✅ **Architecture looks clean and balanced!**")+`

*Tip: Connect your Google Gemini API key in settings ⚙️ for full natural language reasoning and tool execution.*`,executedTools:s}}}const T=new Ie;class Me{constructor(e){this.container=e,this.isOpen=!1,this.render(),this._bindEvents()}render(){const e=T.provider==="gemini",s=!!T.apiKey?e?`✨ Gemini (${T.modelName})`:`⚡ OpenAI (${T.modelName})`:"⚙️ Built-In Model";this.container.innerHTML=`
      <div class="ai-drawer-overlay ${this.isOpen?"open":""}" id="ai-overlay"></div>
      <div class="ai-drawer ${this.isOpen?"open":""}" id="ai-drawer">
        <div class="ai-header">
          <div class="ai-header-left">
            <span class="ai-header-icon">✨</span>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 class="ai-title">AI System Architect</h3>
                <span class="provider-badge" id="ai-status-badge">${s}</span>
              </div>
              <p class="ai-subtitle">Powered by Google Gemini, LangChain & WASM</p>
            </div>
          </div>
          <div class="ai-header-actions">
            <button id="btn-ai-settings" class="btn-icon-subtle" title="Configure Gemini / OpenAI API Settings">⚙️</button>
            <button id="btn-close-ai" class="btn-icon-subtle" title="Close Panel">✕</button>
          </div>
        </div>

        <!-- Token Settings Modal / Accordion -->
        <div class="ai-settings-card" id="ai-settings-card" style="display: none;">
          <h4 class="settings-title">AI Provider & API Configuration</h4>
          <p class="settings-desc">Configure your Google Gemini or OpenAI API key for live natural language architecture synthesis. Keys are stored locally in your browser.</p>

          <div class="form-group">
            <label class="form-label">AI Provider</label>
            <select id="select-ai-provider" class="form-select">
              <option value="gemini" ${e?"selected":""}>Google Gemini API (Recommended)</option>
              <option value="openai" ${e?"":"selected"}>OpenAI / Custom LLM (GPT-4o, Ollama)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>API Key / Token</span>
              <span id="key-help-wrap">
                ${e?'<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="color: var(--accent-primary); font-size: 11px; text-decoration: underline;">Get free Gemini Key ↗</a>':""}
              </span>
            </label>
            <input type="password" id="input-api-key" class="form-input" placeholder="${e?"AIzaSy...":"sk-..."}" value="${T.apiKey}" />
          </div>

          <div class="form-group">
            <label class="form-label">Model</label>
            <input type="text" id="input-ai-model" class="form-input" placeholder="${e?"gemini-2.0-flash":"gpt-4o"}" value="${T.modelName}" />
            <div class="model-chip-row" id="model-chips-container">
              ${e?`
                  <button type="button" class="model-chip ${T.modelName==="gemini-2.0-flash"?"active":""}" data-model="gemini-2.0-flash">gemini-2.0-flash</button>
                  <button type="button" class="model-chip ${T.modelName==="gemini-1.5-flash"?"active":""}" data-model="gemini-1.5-flash">gemini-1.5-flash</button>
                  <button type="button" class="model-chip ${T.modelName==="gemini-1.5-pro"?"active":""}" data-model="gemini-1.5-pro">gemini-1.5-pro</button>
                `:`
                  <button type="button" class="model-chip ${T.modelName==="gpt-4o"?"active":""}" data-model="gpt-4o">gpt-4o</button>
                  <button type="button" class="model-chip ${T.modelName==="gpt-4o-mini"?"active":""}" data-model="gpt-4o-mini">gpt-4o-mini</button>
                `}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">API Endpoint URL</label>
            <input type="text" id="input-ai-endpoint" class="form-input" placeholder="${e?"https://generativelanguage.googleapis.com/v1beta":"https://api.openai.com/v1"}" value="${T.endpoint}" />
          </div>

          <div class="settings-btn-row">
            <button id="btn-save-ai-settings" class="btn-primary-sm">Save Configuration</button>
            <button id="btn-test-ai-model" class="btn-test-sm" title="Test model connectivity and latency">
              <span class="btn-test-icon">⚡</span>
              <span class="btn-test-label">Test Model</span>
            </button>
            <button id="btn-clear-ai-settings" class="btn-secondary-sm">Use Built-In AI (Offline)</button>
          </div>
          <div id="ai-test-status" class="ai-test-status" style="display: none;"></div>
        </div>

        <!-- Chat Stream -->
        <div class="ai-chat-body" id="ai-chat-body">
          <div class="ai-message assistant">
            <div class="message-bubble">
              👋 Hello! I'm your AI System Design Architect.
              <br><br>
              I can build distributed topologies for you on the canvas, inspect Single Points of Failure, and scale services to handle millions of requests.
              <br><br>
              Try clicking one of the suggestions below or type your requirements!
            </div>
          </div>
        </div>

        <!-- Suggested Quick Prompts -->
        <div class="ai-quick-prompts">
          <button class="quick-chip" data-prompt="Design a URL shortener like Bitly">Design URL Shortener</button>
          <button class="quick-chip" data-prompt="Design a video streaming service like Netflix">Design Streaming Service</button>
          <button class="quick-chip" data-prompt="Design a real-time chat application">Design Chat App</button>
          <button class="quick-chip" data-prompt="Analyze architecture and fix all SPOFs">Fix all SPOFs</button>
          <button class="quick-chip" data-prompt="Add a Redis cache before the database">Add Redis Cache</button>
        </div>

        <!-- Input Box -->
        <div class="ai-input-wrap">
          <textarea id="ai-prompt-input" class="ai-prompt-field" placeholder="Ask AI to design, scale, or optimize (e.g., 'Build a URL shortener')..." rows="2"></textarea>
          <button id="btn-send-prompt" class="btn-send-ai" title="Send prompt">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `}_bindEvents(){const e=this.container.querySelector("#ai-overlay"),t=this.container.querySelector("#btn-close-ai"),s=this.container.querySelector("#btn-ai-settings"),i=this.container.querySelector("#ai-settings-card"),o=this.container.querySelector("#btn-save-ai-settings"),n=this.container.querySelector("#btn-clear-ai-settings"),a=this.container.querySelector("#select-ai-provider"),r=this.container.querySelector("#btn-send-prompt"),l=this.container.querySelector("#ai-prompt-input"),c=this.container.querySelectorAll(".quick-chip");y.on(S.PANEL_TOGGLED,({panel:m})=>{m==="ai"&&this.toggle()}),t.addEventListener("click",()=>this.close()),e.addEventListener("click",()=>this.close()),s.addEventListener("click",()=>{const m=i.style.display!=="none";i.style.display=m?"none":"block"}),a&&a.addEventListener("change",()=>{const m=a.value,f=this.container.querySelector("#input-api-key"),E=this.container.querySelector("#input-ai-model"),v=this.container.querySelector("#input-ai-endpoint"),b=this.container.querySelector("#key-help-wrap"),w=this.container.querySelector("#model-chips-container");m==="gemini"?(f.placeholder="AIzaSy...",E.placeholder="gemini-2.0-flash",E.value="gemini-2.0-flash",v.placeholder="https://generativelanguage.googleapis.com/v1beta",v.value="https://generativelanguage.googleapis.com/v1beta",b&&(b.innerHTML='<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="color: var(--accent-primary); font-size: 11px; text-decoration: underline;">Get free Gemini Key ↗</a>'),w&&(w.innerHTML=`
              <button type="button" class="model-chip active" data-model="gemini-2.0-flash">gemini-2.0-flash</button>
              <button type="button" class="model-chip" data-model="gemini-1.5-flash">gemini-1.5-flash</button>
              <button type="button" class="model-chip" data-model="gemini-1.5-pro">gemini-1.5-pro</button>
            `,this._bindModelChips())):(f.placeholder="sk-...",E.placeholder="gpt-4o",E.value="gpt-4o",v.placeholder="https://api.openai.com/v1",v.value="https://api.openai.com/v1",b&&(b.innerHTML=""),w&&(w.innerHTML=`
              <button type="button" class="model-chip active" data-model="gpt-4o">gpt-4o</button>
              <button type="button" class="model-chip" data-model="gpt-4o-mini">gpt-4o-mini</button>
            `,this._bindModelChips()))}),this._bindModelChips(),o.addEventListener("click",()=>{const m=this.container.querySelector("#select-ai-provider").value,f=this.container.querySelector("#input-api-key").value,E=this.container.querySelector("#input-ai-model").value,v=this.container.querySelector("#input-ai-endpoint").value;T.setProvider(m),T.setApiKey(f),T.setModel(E),T.setEndpoint(v),i.style.display="none";const b=this.container.querySelector("#ai-status-badge");b&&(b.textContent=f.trim()?m==="gemini"?`✨ Gemini (${E})`:`⚡ OpenAI (${E})`:"⚙️ Built-In Model"),A(`AI settings saved (${m==="gemini"?"Google Gemini":"OpenAI"})!`,"success")}),n.addEventListener("click",()=>{T.clearSettings(),i.style.display="none",this.render(),this._bindEvents(),A("Reverted to Built-In AI Architect (Offline)","info")});const u=this.container.querySelector("#btn-test-ai-model"),p=this.container.querySelector("#ai-test-status");u&&u.addEventListener("click",async()=>{const m=this.container.querySelector("#select-ai-provider").value,f=this.container.querySelector("#input-api-key").value,E=this.container.querySelector("#input-ai-model").value,v=this.container.querySelector("#input-ai-endpoint").value;if(!f.trim()){A("Please enter an API Key / Token before testing.","warning"),this.container.querySelector("#input-api-key").focus(),p&&(p.className="ai-test-status error",p.style.display="block",p.innerHTML="⚠️ <strong>Missing Key:</strong> Please enter your API key above to test connectivity.");return}const b=u.innerHTML;u.disabled=!0,u.innerHTML='<span class="btn-spinner"></span> <span>Testing...</span>',p&&(p.className="ai-test-status loading",p.style.display="block",p.innerHTML=`⏳ Testing connection to <strong>${m==="gemini"?"Google Gemini":"OpenAI"}</strong> (<code>${E}</code>)...`);try{const w=await T.testConnection({provider:m,apiKey:f,modelName:E,endpoint:v});p&&(p.className="ai-test-status success",p.style.display="block",p.innerHTML=`✅ <strong>Connected (${w.latencyMs}ms):</strong> ${w.provider} <code>${w.model}</code> responded successfully!<br><small style="opacity: 0.85;">Sample reply: "${w.sampleReply}"</small>`),A(`✓ ${w.provider} (${w.model}) test succeeded in ${w.latencyMs}ms!`,"success")}catch(w){console.error("[AI Test Error]",w),p&&(p.className="ai-test-status error",p.style.display="block",p.innerHTML=`❌ <strong>Test Failed:</strong> ${w.message}`),A(`Test failed: ${w.message}`,"error")}finally{u.disabled=!1,u.innerHTML=b}}),r.addEventListener("click",()=>this._sendCurrentPrompt()),l.addEventListener("keydown",m=>{m.key==="Enter"&&!m.shiftKey&&(m.preventDefault(),this._sendCurrentPrompt())}),c.forEach(m=>{m.addEventListener("click",()=>{const f=m.getAttribute("data-prompt");l.value=f,this._sendCurrentPrompt()})}),y.on(S.AI_MESSAGE_ADDED,m=>{this._appendMessageToUi(m.role,m.content)}),y.on(S.AI_STATUS_CHANGED,({isProcessing:m})=>{r.disabled=m,l.disabled=m,r.style.opacity=m?"0.5":"1.0"})}_bindModelChips(){const e=this.container.querySelector("#input-ai-model"),t=this.container.querySelectorAll(".model-chip");t.forEach(s=>{s.addEventListener("click",()=>{t.forEach(o=>o.classList.remove("active")),s.classList.add("active");const i=s.getAttribute("data-model");e&&(e.value=i)})})}toggle(){this.isOpen=!this.isOpen;const e=this.container.querySelector("#ai-drawer"),t=this.container.querySelector("#ai-overlay");e&&e.classList.toggle("open",this.isOpen),t&&t.classList.toggle("open",this.isOpen)}close(){this.isOpen=!1;const e=this.container.querySelector("#ai-drawer"),t=this.container.querySelector("#ai-overlay");e&&e.classList.remove("open"),t&&t.classList.remove("open")}async _sendCurrentPrompt(){const e=this.container.querySelector("#ai-prompt-input"),t=e.value.trim();!t||T.isProcessing||(e.value="",await T.processMessage(t))}_appendMessageToUi(e,t){const s=this.container.querySelector("#ai-chat-body");if(!s)return;const i=document.createElement("div");i.className=`ai-message ${e}`;let o=t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\n\n/g,"<br><br>").replace(/\n• /g,"<br>• ");i.innerHTML=`<div class="message-bubble">${o}</div>`,s.appendChild(i),s.scrollTop=s.scrollHeight}}class Te{constructor(e){this.container=e,this.isOpen=!1,this.lastReport=null,this.render(),this._bindEvents()}render(){this.container.innerHTML=`
      <div class="eval-drawer-overlay ${this.isOpen?"open":""}" id="eval-overlay"></div>
      <div class="eval-drawer ${this.isOpen?"open":""}" id="eval-drawer">
        <div class="eval-header">
          <div class="eval-header-left">
            <span class="eval-header-icon">🛡️</span>
            <div>
              <h3 class="eval-title">System Resilience & SPOF Audit</h3>
              <p class="eval-subtitle">Automated Real-Time WebAssembly Evaluation</p>
            </div>
          </div>
          <button id="btn-close-eval" class="btn-icon-subtle" title="Close">✕</button>
        </div>

        <div class="eval-score-card">
          <div class="score-circle-wrap">
            <div class="score-number" id="eval-score-num">100</div>
            <div class="score-caption">Resilience Score</div>
          </div>
          <div class="score-meta">
            <p id="eval-score-summary">Evaluating system topology...</p>
            <div class="eval-counts-row">
              <span class="count-pill danger" id="cnt-spof">0 SPOFs</span>
              <span class="count-pill warning" id="cnt-bottleneck">0 Bottlenecks</span>
            </div>
          </div>
        </div>

        <div class="eval-body" id="eval-body">
          <div class="empty-eval-state">No critical vulnerabilities detected yet. Add components to begin.</div>
        </div>
      </div>
    `}_bindEvents(){const e=this.container.querySelector("#btn-close-eval"),t=this.container.querySelector("#eval-overlay");y.on(S.PANEL_TOGGLED,({panel:s})=>{s==="evaluation"&&this.toggle()}),e.addEventListener("click",()=>this.close()),t.addEventListener("click",()=>this.close()),y.on(S.ANALYSIS_UPDATED,s=>{this.lastReport=s,this._updateReportUi(s)})}toggle(){this.isOpen=!this.isOpen;const e=this.container.querySelector("#eval-drawer"),t=this.container.querySelector("#eval-overlay");e&&e.classList.toggle("open",this.isOpen),t&&t.classList.toggle("open",this.isOpen)}close(){this.isOpen=!1;const e=this.container.querySelector("#eval-drawer"),t=this.container.querySelector("#eval-overlay");e&&e.classList.remove("open"),t&&t.classList.remove("open")}_updateReportUi(e){const t=this.container.querySelector("#eval-score-num"),s=this.container.querySelector("#eval-score-summary"),i=this.container.querySelector("#cnt-spof"),o=this.container.querySelector("#cnt-bottleneck"),n=this.container.querySelector("#eval-body");if(!t||!n)return;t.textContent=e.architecture_score;const a=e.architecture_score;a>=85?(t.style.color="#10B981",s.textContent="High Availability Architecture. Redundancy criteria met."):a>=60?(t.style.color="#F59E0B",s.textContent="Degraded Resilience. Single points of failure require attention."):(t.style.color="#EF4444",s.textContent="Critical Architecture Vulnerabilities. System prone to cascading outages."),i.textContent=`${e.spofs.length} SPOFs`,o.textContent=`${e.bottlenecks.length} Bottlenecks`;let r="";if(e.spofs.length>0){r+=`<h4 class="section-heading">Single Points of Failure (${e.spofs.length})</h4>`;for(const c of e.spofs)r+=`
          <div class="issue-card danger">
            <div class="issue-card-top">
              <span class="issue-tag danger">${c.severity}</span>
              <strong class="issue-node-name">${c.node_name}</strong>
            </div>
            <p class="issue-reason">${c.reason}</p>
            <p class="issue-suggestion">💡 <strong>Remedy:</strong> ${c.suggestion}</p>
            <button class="btn-autofix" data-node-id="${c.node_id}">
              <span>⚡ Auto-Fix SPOF</span>
            </button>
          </div>
        `}if(e.bottlenecks.length>0){r+=`<h4 class="section-heading">Traffic Bottlenecks (${e.bottlenecks.length})</h4>`;for(const c of e.bottlenecks)r+=`
          <div class="issue-card warning">
            <div class="issue-card-top">
              <span class="issue-tag warning">HIGH LOAD</span>
            </div>
            <p class="issue-reason">${c}</p>
          </div>
        `}if(e.missing_load_balancers.length>0||e.recommendations.length>0){r+='<h4 class="section-heading">Architectural Recommendations</h4>';for(const c of e.missing_load_balancers)r+=`
          <div class="issue-card info">
            <p class="issue-reason">⚠️ ${c}</p>
          </div>
        `;for(const c of e.recommendations)r+=`
          <div class="issue-card info">
            <p class="issue-reason">${c}</p>
          </div>
        `}e.spofs.length===0&&e.bottlenecks.length===0&&e.recommendations.length===0&&(r='<div class="empty-eval-state success">🎉 Excellent system design! No Single Points of Failure or saturated bottlenecks detected.</div>'),n.innerHTML=r,n.querySelectorAll(".btn-autofix").forEach(c=>{c.addEventListener("click",()=>{const u=c.getAttribute("data-node-id"),p=F.find(m=>m.name==="auto_fix_spof");p&&(p.execute({node_id:u}),c.textContent="✓ Resolved",c.disabled=!0,c.style.opacity="0.6")})})}}const K=[{step:1,badge:"Welcome to SystemFlow",title:"Master Distributed Architecture from Scratch",subtitle:"Learn how modern tech giants (like Netflix, Uber, and Twitter) handle millions of requests without crashing.",icon:'<img src="./icons/icon-192.png" width="40" height="40" alt="SystemFlow" style="border-radius:50%; display:block; filter: drop-shadow(0 2px 8px rgba(6,182,212,0.5));" />',illustration:`
      <div class="onboarding-flow-preview">
        <div class="flow-node blue">Client</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node green">Load Balancer</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node purple">API Gateway</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node amber">Servers</div>
        <div class="flow-arrow">➔</div>
        <div class="flow-node red">Cache / DB</div>
      </div>
    `,body:`
      <p>System design is the process of defining the architecture, components, modules, interfaces, and data for a system to satisfy specified requirements.</p>
      <div class="onboarding-tip-banner">
        <span>💡</span> <strong>Rule #1:</strong> Every architectural choice is a trade-off between <em>Latency, Throughput, Consistency, and Cost</em>.
      </div>
    `},{step:2,badge:"Step 1: The Core Primitives",title:"8 Essential Building Blocks of System Design",subtitle:"Every distributed system in the world is composed of these fundamental primitives:",icon:"🧱",illustration:`
      <div class="onboarding-blocks-grid">
        <div class="block-mini-pill" style="border-color: #3B82F6;"><span style="color:#3B82F6;">●</span> <strong>Client:</strong> Users & Apps</div>
        <div class="block-mini-pill" style="border-color: #10B981;"><span style="color:#10B981;">●</span> <strong>Load Balancer:</strong> Traffic Routing</div>
        <div class="block-mini-pill" style="border-color: #8B5CF6;"><span style="color:#8B5CF6;">●</span> <strong>API Gateway:</strong> Auth & Rate Limits</div>
        <div class="block-mini-pill" style="border-color: #F59E0B;"><span style="color:#F59E0B;">●</span> <strong>Microservices:</strong> Business Logic</div>
        <div class="block-mini-pill" style="border-color: #EF4444;"><span style="color:#EF4444;">●</span> <strong>Cache:</strong> Fast In-Memory RAM</div>
        <div class="block-mini-pill" style="border-color: #EC4899;"><span style="color:#EC4899;">●</span> <strong>Database:</strong> Persistent Storage</div>
        <div class="block-mini-pill" style="border-color: #F97316;"><span style="color:#F97316;">●</span> <strong>Message Queue:</strong> Async Decoupling</div>
        <div class="block-mini-pill" style="border-color: #06B6D4;"><span style="color:#06B6D4;">●</span> <strong>CDN:</strong> Global Edge Caching</div>
      </div>
    `,body:`
      <p>In the left sidebar, tap or drag any component onto the canvas. Tap the <strong>"Learn"</strong> button on any card to view real-world analogies, bottlenecks, and interview tips.</p>
    `},{step:3,badge:"Step 2: Wiring & Protocols",title:"Connect Components with Real Network Protocols",subtitle:"Components communicate across the network using distinct transport layers.",icon:"🔌",illustration:`
      <div class="onboarding-protocols-banner">
        <div class="proto-tag blue">HTTP/REST: Web Ingress</div>
        <div class="proto-tag purple">gRPC: Low-Latency RPC</div>
        <div class="proto-tag red">Redis TCP: Sub-1ms RAM</div>
        <div class="proto-tag orange">Kafka: Event Streaming</div>
      </div>
    `,body:`
      <p><strong>How to Wire:</strong> Click and drag from any component port (the connection dots on node borders) to another component to draw a connection wire.</p>
      <p>Tap on any connection wire to open the <strong>Edge Inspector</strong>: switch between protocols (like gRPC vs REST) and compare latency overheads.</p>
    `},{step:4,badge:"Step 3: Traffic Simulation",title:"Simulate Load & Catch Single Points of Failure",subtitle:"Stress-test your architecture at 60 FPS WebAssembly speed.",icon:"📈",illustration:`
      <div class="onboarding-sim-preview">
        <div class="sim-metric-badge">⚡ 60 FPS WASM Coprocessor</div>
        <div class="sim-metric-badge">🟢 Real-Time Health & SPOF Scan</div>
        <div class="sim-metric-badge">🌊 Up to 1,000,000 RPS</div>
      </div>
    `,body:`
      <p>Press the green <strong>Play</strong> button in the left panel to inject traffic. Watch animated request packets flow along wires.</p>
      <p>Look at the top <strong>Health Score</strong>: if a node is a Single Point of Failure (SPOF) or experiences high CPU load, it turns amber or red with suggestions on how to add replicas.</p>
    `},{step:5,badge:"Step 4: Practice Interview Scenarios",title:"Battle-Tested Production Architectures",subtitle:"Learn by exploring canonical system design questions sorted from Easy to Expert.",icon:"🎓",illustration:`
      <div class="onboarding-scenarios-preview">
        <div class="scenario-mini-item">📘 URL Shortener (Bitly) — Read-heavy caching</div>
        <div class="scenario-mini-item">📘 Pastebin — Object storage & text hashes</div>
        <div class="scenario-mini-item">📘 Real-Time Chat (WhatsApp) — WebSockets & Queues</div>
      </div>
    `,body:`
      <p>Every scenario includes interactive <strong>Learning Objectives</strong> so you know exactly what concepts to master (Hashing, Sharding, Replication, Caching, Event-driven architecture).</p>
      <p>Ask the <strong>AI Architect</strong> at any time for feedback or design reviews!</p>
    `}];class Re{constructor(e){this.renderer=e,this.currentStep=0}show(e=!1){localStorage.getItem("sds_onboarding_done")==="true"&&!e||(this.currentStep=0,this._renderModal())}_renderModal(){const e=document.getElementById("onboarding-modal-overlay");e&&e.remove();const t=document.createElement("div");t.id="onboarding-modal-overlay",t.className="custom-modal-overlay onboarding-overlay",document.body.appendChild(t),this._updateStepContent(t),requestAnimationFrame(()=>t.classList.add("open"))}_updateStepContent(e){const t=K[this.currentStep],s=K.length,i=this.currentStep===0,o=this.currentStep===s-1;e.innerHTML=`
      <div class="custom-modal-card onboarding-card">
        <div class="onboarding-top-bar">
          <div class="onboarding-step-indicator">
            <span class="step-badge">${t.badge}</span>
            <span class="step-counter">Step ${t.step} of ${s}</span>
          </div>
          <button id="btn-onboarding-skip" class="btn-icon-close" title="Exit Tutorial">✕</button>
        </div>

        <div class="onboarding-content">
          <div class="onboarding-header-row">
            <div class="onboarding-icon">${t.icon}</div>
            <div>
              <h2 class="onboarding-title">${t.title}</h2>
              <p class="onboarding-subtitle">${t.subtitle}</p>
            </div>
          </div>

          <div class="onboarding-illustration-wrap">
            ${t.illustration}
          </div>

          <div class="onboarding-body-text">
            ${t.body}
          </div>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-dots">
            ${K.map((n,a)=>`
              <span class="onboarding-dot ${a===this.currentStep?"active":""}"></span>
            `).join("")}
          </div>

          <div class="onboarding-actions">
            ${i?"":'<button id="btn-onboarding-prev" class="modal-btn secondary">Back</button>'}
            ${o?`
              <button id="btn-load-first-blueprint" class="modal-btn secondary">Load URL Shortener (Beginner)</button>
              <button id="btn-onboarding-finish" class="modal-btn primary">Explore Canvas 🚀</button>
            `:`
              <button id="btn-onboarding-next" class="modal-btn primary">Next Step ➔</button>
            `}
          </div>
        </div>
      </div>
    `,this._bindStepEvents(e)}_bindStepEvents(e){const t=()=>{localStorage.setItem("sds_onboarding_done","true"),e.classList.remove("open"),setTimeout(()=>e.remove(),200)},s=e.querySelector("#btn-onboarding-skip");s&&s.addEventListener("click",t);const i=e.querySelector("#btn-onboarding-prev");i&&i.addEventListener("click",()=>{this.currentStep>0&&(this.currentStep--,this._updateStepContent(e))});const o=e.querySelector("#btn-onboarding-next");o&&o.addEventListener("click",()=>{this.currentStep<K.length-1&&(this.currentStep++,this._updateStepContent(e))});const n=e.querySelector("#btn-onboarding-finish");n&&n.addEventListener("click",()=>{t(),A("Welcome aboard! Drag components from the sidebar to begin.","success",3500)});const a=e.querySelector("#btn-load-first-blueprint");a&&a.addEventListener("click",()=>{t();const r=z.find(l=>l.id==="url-shortener");r&&(d.activeScenario=r,d.loadGraph(r.graph),d.updateSimConfig({target_rps:r.targetRps}),this.renderer&&this.renderer.camera&&setTimeout(()=>{this.renderer.camera.fitToContent(d.nodes)},100),A("Loaded URL Shortener blueprint! Press Play to simulate traffic.","success",4e3))})}}async function Pe(){console.log("[SystemFlow] Bootstrapping SystemFlow..."),await d.init();const g=document.getElementById("sim-canvas"),e=new me(g);e.init();const t=new fe(e);new ve(e),new be(t);const s=document.getElementById("app-header");new _e(s,e);const i=document.getElementById("app-sidebar");new Ee(i,e),new Ae(e);const o=document.getElementById("app-inspector");new ke(o);const n=document.getElementById("metrics-hud");new xe(n);const a=document.getElementById("load-hud");a&&new Le(a);const r=document.getElementById("ai-panel-container");new Me(r);const l=document.getElementById("eval-panel-container");new Te(l);const c=document.getElementById("mobile-nav");c&&new we(c);const u=new Re(e);window.appOnboarding=u,d.restoreFromLocalStorage()?(setTimeout(()=>{e.camera.fitToContent(d.nodes)},120),A("Restored your previous architecture","info",3e3)):(e.camera.reset(),setTimeout(()=>{u.show()},400)),console.log("[SystemFlow] SystemFlow successfully running at 60FPS.")}window.addEventListener("DOMContentLoaded",Pe);
