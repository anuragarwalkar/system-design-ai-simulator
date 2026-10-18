//! ==============================================================================
//! Architecture Data Models
//!
//! Represents all distributed system components, their configurations,
//! simulation parameters, and performance metrics. Designed for zero-copy
//! serialization between WebAssembly and JavaScript using serde.
//! ==============================================================================

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Enumeration of all supported distributed infrastructure component types.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ComponentType {
    Client,
    LoadBalancer,
    ApiGateway,
    Microservice,
    Cache,
    Database,
    MessageQueue,
    Cdn,
}

impl ComponentType {
    /// Returns default processing latency overhead in milliseconds
    pub fn base_latency_ms(&self) -> f64 {
        match self {
            ComponentType::Client => 0.0,
            ComponentType::Cdn => 4.0,           // Fast edge response
            ComponentType::ApiGateway => 6.0,    // Auth, routing, rate-limit check
            ComponentType::LoadBalancer => 2.0,  // Low-latency proxying
            ComponentType::Cache => 3.0,         // In-memory RAM lookup (Redis/Memcached)
            ComponentType::Microservice => 25.0, // Business logic execution
            ComponentType::Database => 35.0,     // Disk I/O, query parsing, lock overhead
            ComponentType::MessageQueue => 8.0,  // Write to log / partition
        }
    }

    /// Max requests/sec a single standard unit can handle before queue saturation
    pub fn default_capacity_rps(&self) -> f64 {
        match self {
            ComponentType::Client => 1_000_000.0,
            ComponentType::Cdn => 500_000.0,
            ComponentType::ApiGateway => 80_000.0,
            ComponentType::LoadBalancer => 150_000.0,
            ComponentType::Cache => 120_000.0,
            ComponentType::Microservice => 8_000.0,
            ComponentType::Database => 3_500.0,
            ComponentType::MessageQueue => 45_000.0,
        }
    }

    /// Estimated hourly operational cost in USD (AWS/GCP comparable baseline)
    pub fn hourly_cost_usd(&self) -> f64 {
        match self {
            ComponentType::Client => 0.0,
            ComponentType::Cdn => 0.08,
            ComponentType::ApiGateway => 0.12,
            ComponentType::LoadBalancer => 0.07,
            ComponentType::Cache => 0.22,
            ComponentType::Microservice => 0.18,
            ComponentType::Database => 0.45,
            ComponentType::MessageQueue => 0.15,
        }
    }
}

/// Dynamic key-value configuration for individual node behaviors
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NodeConfig {
    // Cache specific
    pub eviction_policy: Option<String>, // "LRU", "LFU", "FIFO", "Random"
    pub ttl_seconds: Option<u32>,
    pub max_memory_mb: Option<u32>,
    pub cache_hit_ratio: Option<f64>, // 0.0 - 1.0 (e.g. 0.85 = 85% hits)

    // Database specific
    pub db_type: Option<String>, // "SQL Relational", "NoSQL Document", "Key-Value"
    pub sharding_strategy: Option<String>, // "None", "Hash", "Range"
    pub read_replicas: Option<u32>,
    pub write_replicas: Option<u32>,
    pub connection_pool_size: Option<u32>,

    // Load Balancer specific
    pub lb_algorithm: Option<String>, // "Round Robin", "Least Connections", "Consistent Hashing"
    pub health_check_interval_ms: Option<u32>,

    // Microservice specific
    pub instances: Option<u32>,
    pub concurrency_limit: Option<u32>,
    pub timeout_ms: Option<u32>,

    // Message Queue specific
    pub queue_type: Option<String>, // "Kafka Log", "RabbitMQ AMQP"
    pub partitions: Option<u32>,
    pub consumer_threads: Option<u32>,

    // CDN specific
    pub edge_cache_ratio: Option<f64>,

    // Generic custom properties
    pub extra: HashMap<String, String>,
}

/// A node within the distributed system graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemNode {
    pub id: String,
    pub name: String,
    pub component_type: ComponentType,
    pub x: f64,
    pub y: f64,
    pub config: NodeConfig,
    pub custom_capacity_rps: Option<f64>,
}

/// An edge representing a network connection between two components
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemEdge {
    pub id: String,
    pub from: String,
    pub to: String,
    pub protocol: String, // "HTTP/REST", "gRPC", "WebSocket", "Async Pub/Sub", "TCP"
    pub latency_overhead_ms: Option<f64>,
}

/// Synthetic load configuration passed from the UI slider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationConfig {
    pub target_rps: f64,
    pub profile: String, // "Constant", "Spike", "Sinusoidal", "Step"
    pub duration_seconds: f64,
    pub read_write_ratio: f64, // e.g. 0.9 = 90% read, 10% write
}

/// Real-time computed metrics for each node
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct NodeMetrics {
    pub node_id: String,
    pub incoming_rps: f64,
    pub processed_rps: f64,
    pub dropped_rps: f64,
    pub queue_depth: usize,
    pub cpu_utilization: f64, // 0.0 to 1.0 (can exceed 1.0 when overwhelmed)
    pub p50_latency_ms: f64,
    pub p95_latency_ms: f64,
    pub p99_latency_ms: f64,
    pub error_rate_percent: f64,
    pub hourly_cost_usd: f64,
}

/// Overall system simulation summary report
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SimulationReport {
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub overall_p50_ms: f64,
    pub overall_p95_ms: f64,
    pub overall_p99_ms: f64,
    pub max_bottleneck_node: Option<String>,
    pub max_bottleneck_load_pct: f64,
    pub total_estimated_cost_monthly_usd: f64,
    pub node_metrics: HashMap<String, NodeMetrics>,
    pub is_healthy: bool,
}

/// Single Point of Failure (SPOF) issue record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpofIssue {
    pub node_id: String,
    pub node_name: String,
    pub component_type: ComponentType,
    pub severity: String, // "CRITICAL", "HIGH", "MEDIUM"
    pub reason: String,
    pub suggestion: String,
}

/// Real-time architectural health check result
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ArchitectureAnalysisReport {
    pub spofs: Vec<SpofIssue>,
    pub bottlenecks: Vec<String>,
    pub missing_load_balancers: Vec<String>,
    pub recommendations: Vec<String>,
    pub architecture_score: u32, // 0 to 100
}
