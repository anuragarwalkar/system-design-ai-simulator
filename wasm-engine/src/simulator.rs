//! ==============================================================================
//! Discrete-Event Traffic Simulation Engine
//!
//! Simulates request flows through the distributed topology. Models M/M/c
//! queueing approximations, cache hit/miss flows, load balancing,
//! read/write segregation, and network latency accumulation.
//! ==============================================================================

use crate::graph::SystemGraph;
use crate::load_balancer::{BalancingStrategy, LoadBalancerState};
use crate::metrics::MetricsCalculator;
use crate::models::{
    ComponentType, NodeMetrics, SimulationConfig, SimulationReport, SystemNode,
};
use std::collections::HashMap;

pub struct TrafficSimulator;

impl TrafficSimulator {
    /// Executes a discrete-event simulation run over the graph with the given load profile
    pub fn simulate(graph: &SystemGraph, config: &SimulationConfig) -> SimulationReport {
        let mut report = SimulationReport::default();
        if graph.nodes.is_empty() {
            return report;
        }

        let entry_nodes = graph.find_entry_nodes();
        if entry_nodes.is_empty() {
            return report;
        }

        // Initialize per-node metrics map
        let mut node_metrics: HashMap<String, NodeMetrics> = HashMap::new();
        for (id, node) in &graph.nodes {
            let mut m = NodeMetrics::default();
            m.node_id = id.clone();
            m.hourly_cost_usd = node.component_type.hourly_cost_usd();
            node_metrics.insert(id.clone(), m);
        }

        // Map node ID to its effective capacity
        let capacities: HashMap<String, f64> = graph
            .nodes
            .iter()
            .map(|(id, node)| {
                let base_cap = node
                    .custom_capacity_rps
                    .unwrap_or_else(|| node.component_type.default_capacity_rps());

                let scaled_cap = match node.component_type {
                    ComponentType::Microservice => {
                        let instances = node.config.instances.unwrap_or(1).max(1) as f64;
                        base_cap * instances
                    }
                    ComponentType::Database => {
                        let read_reps = node.config.read_replicas.unwrap_or(0) as f64;
                        let sharding = node.config.sharding_strategy.as_deref().unwrap_or("None");
                        let shard_mult = if sharding != "None" { 3.0 } else { 1.0 };
                        // Reads scale with replicas; writes don't unless sharded
                        (base_cap * (1.0 + read_reps * 0.8)) * shard_mult
                    }
                    ComponentType::Cache => {
                        let mem = node.config.max_memory_mb.unwrap_or(1024) as f64;
                        base_cap * (mem / 1024.0).max(1.0)
                    }
                    _ => base_cap,
                };
                (id.clone(), scaled_cap)
            })
            .collect();

        // Trace simulated packets
        let total_samples = 2000.min((config.target_rps as usize).max(100));
        let mut request_latencies: Vec<f64> = Vec::with_capacity(total_samples);
        let mut node_latencies: HashMap<String, Vec<f64>> = HashMap::new();

        // Traffic distribution simulation
        let mut lb_states: HashMap<String, LoadBalancerState> = HashMap::new();
        let target_rps = config.target_rps;
        let rps_per_entry = target_rps / (entry_nodes.len().max(1) as f64);

        // Approximate steady-state RPS distribution across the DAG
        let mut node_incoming_rps: HashMap<String, f64> = HashMap::new();
        for entry in &entry_nodes {
            *node_incoming_rps.entry(entry.clone()).or_insert(0.0) += rps_per_entry;
        }

        // Topological / iterative load propagation
        let mut active_queue: Vec<String> = entry_nodes.clone();
        let mut processed_set: std::collections::HashSet<String> = std::collections::HashSet::new();

        while let Some(current_id) = active_queue.pop() {
            if processed_set.contains(&current_id) {
                continue;
            }
            processed_set.insert(current_id.clone());

            let incoming = *node_incoming_rps.get(&current_id).unwrap_or(&0.0);
            let downstream = graph.get_downstream_nodes(&current_id);
            if downstream.is_empty() {
                continue;
            }

            let current_node = match graph.nodes.get(&current_id) {
                Some(n) => n,
                None => continue,
            };

            match current_node.component_type {
                ComponentType::LoadBalancer => {
                    // Split traffic across downstream targets
                    let count = downstream.len() as f64;
                    for target_id in &downstream {
                        *node_incoming_rps.entry(target_id.clone()).or_insert(0.0) +=
                            incoming / count;
                        if !processed_set.contains(target_id) {
                            active_queue.push(target_id.clone());
                        }
                    }
                }
                ComponentType::Cdn => {
                    // CDN absorbs high percentage of traffic (static assets)
                    let cache_hit = current_node.config.edge_cache_ratio.unwrap_or(0.85);
                    let origin_forward = incoming * (1.0 - cache_hit);
                    for target_id in &downstream {
                        *node_incoming_rps.entry(target_id.clone()).or_insert(0.0) +=
                            origin_forward / (downstream.len() as f64);
                        if !processed_set.contains(target_id) {
                            active_queue.push(target_id.clone());
                        }
                    }
                }
                ComponentType::Cache => {
                    // Cache hit ratio: hits terminate, misses forward to downstream DB/service
                    let hit_ratio = current_node.config.cache_hit_ratio.unwrap_or(0.80);
                    let miss_traffic = incoming * (1.0 - hit_ratio);
                    for target_id in &downstream {
                        *node_incoming_rps.entry(target_id.clone()).or_insert(0.0) +=
                            miss_traffic / (downstream.len() as f64);
                        if !processed_set.contains(target_id) {
                            active_queue.push(target_id.clone());
                        }
                    }
                }
                ComponentType::MessageQueue => {
                    // Async queue buffers spikes
                    for target_id in &downstream {
                        *node_incoming_rps.entry(target_id.clone()).or_insert(0.0) +=
                            incoming / (downstream.len() as f64);
                        if !processed_set.contains(target_id) {
                            active_queue.push(target_id.clone());
                        }
                    }
                }
                _ => {
                    // Standard fan-out or pass-through
                    for target_id in &downstream {
                        *node_incoming_rps.entry(target_id.clone()).or_insert(0.0) +=
                            incoming / (downstream.len() as f64);
                        if !processed_set.contains(target_id) {
                            active_queue.push(target_id.clone());
                        }
                    }
                }
            }
        }

        // Compute utilization, drop rates, and latencies per node using M/M/1 queuing curves
        let mut max_bottleneck_node: Option<String> = None;
        let mut max_bottleneck_pct = 0.0;

        for (id, node) in &graph.nodes {
            let incoming = *node_incoming_rps.get(id).unwrap_or(&0.0);
            let capacity = *capacities.get(id).unwrap_or(&10_000.0);
            let utilization = incoming / capacity.max(1.0);

            let m = node_metrics.get_mut(id).unwrap();
            m.incoming_rps = incoming;
            m.cpu_utilization = utilization;

            if utilization > max_bottleneck_pct {
                max_bottleneck_pct = utilization;
                max_bottleneck_node = Some(node.name.clone());
            }

            // M/M/c queueing latency approximation:
            // Latency = base_latency / (1 - utilization) when utilization < 0.95
            // If utilization >= 1.0, queue overflows, packets drop, latency spikes
            let base_lat = node.component_type.base_latency_ms();
            let effective_lat = if utilization < 0.70 {
                base_lat * (1.0 + (utilization * 0.4))
            } else if utilization < 0.95 {
                base_lat / (1.0 - utilization).max(0.05)
            } else {
                base_lat * 20.0 + (utilization - 0.95) * 200.0
            };

            if utilization > 1.0 {
                let over = incoming - capacity;
                m.dropped_rps = over;
                m.processed_rps = capacity;
                m.error_rate_percent = (over / incoming) * 100.0;
                m.queue_depth = ((utilization - 1.0) * 500.0) as usize;
            } else {
                m.dropped_rps = 0.0;
                m.processed_rps = incoming;
                m.error_rate_percent = 0.0;
                m.queue_depth = (utilization * 20.0) as usize;
            }

            m.p50_latency_ms = effective_lat;
            m.p95_latency_ms = effective_lat * 1.65;
            m.p99_latency_ms = effective_lat * 2.80;

            // Generate representative sample latencies for end-to-end percentiles
            let mut samples = Vec::new();
            for _ in 0..50 {
                samples.push(effective_lat);
            }
            node_latencies.insert(id.clone(), samples);
        }

        // Trace simulated end-to-end paths from entries to leaf nodes
        let mut successful = 0u64;
        let mut failed = 0u64;

        for _ in 0..total_samples {
            let mut curr = match entry_nodes.first() {
                Some(e) => e.clone(),
                None => break,
            };
            let mut path_lat = 0.0;
            let mut req_failed = false;

            for _ in 0..15 {
                let node = match graph.nodes.get(&curr) {
                    Some(n) => n,
                    None => break,
                };
                let m = &node_metrics[&curr];
                path_lat += m.p50_latency_ms;

                if m.cpu_utilization > 1.0 && (rand_pseudo(path_lat) < (m.error_rate_percent / 100.0)) {
                    req_failed = true;
                    break;
                }

                let downstream = graph.get_downstream_nodes(&curr);
                if downstream.is_empty() {
                    break;
                }

                if node.component_type == ComponentType::LoadBalancer {
                    let lb_state = lb_states
                        .entry(curr.clone())
                        .or_insert_with(LoadBalancerState::new);
                    let strat = BalancingStrategy::from_str(
                        node.config.lb_algorithm.as_deref().unwrap_or("Round Robin"),
                    );
                    let loads: Vec<f64> = downstream
                        .iter()
                        .map(|d| node_metrics.get(d).map(|x| x.cpu_utilization).unwrap_or(0.0))
                        .collect();

                    if let Some(target) = lb_state.pick_target(strat, &downstream, &loads, None) {
                        curr = target;
                    } else {
                        break;
                    }
                } else if node.component_type == ComponentType::Cache {
                    // Probabilistic hit
                    let hit_ratio = node.config.cache_hit_ratio.unwrap_or(0.80);
                    if rand_pseudo(path_lat) <= hit_ratio {
                        // Cache hit! Return immediately without hitting DB
                        break;
                    } else {
                        curr = downstream[0].clone();
                    }
                } else {
                    curr = downstream[0].clone();
                }
            }

            if req_failed {
                failed += 1;
            } else {
                successful += 1;
                request_latencies.push(path_lat);
            }
        }

        let (p50, p95, p99) = MetricsCalculator::calculate_percentiles(request_latencies);
        report.total_requests = (successful + failed).max(1);
        report.successful_requests = successful;
        report.failed_requests = failed;
        report.overall_p50_ms = p50;
        report.overall_p95_ms = p95;
        report.overall_p99_ms = p99;
        report.max_bottleneck_node = max_bottleneck_node;
        report.max_bottleneck_load_pct = max_bottleneck_pct * 100.0;
        report.total_estimated_cost_monthly_usd =
            MetricsCalculator::compute_monthly_cost(&graph.nodes);
        report.node_metrics = node_metrics;
        report.is_healthy = MetricsCalculator::is_system_healthy(p95, failed, report.total_requests);

        report
    }
}

/// Simple deterministic hash to avoid external non-wasm random dependencies
fn rand_pseudo(seed: f64) -> f64 {
    let bits = (seed.to_bits() ^ 0x5DEECE66D) & 0xFFFFFFFF;
    ((bits % 1000) as f64) / 1000.0
}
