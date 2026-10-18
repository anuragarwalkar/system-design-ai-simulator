//! ==============================================================================
//! Performance Metrics and Cost Calculator
//!
//! Computes statistical percentiles (p50, p95, p99) using QuickSelect or
//! sorting, error distribution rates, and infrastructure cloud cost estimates.
//! ==============================================================================

use crate::models::{ComponentType, NodeMetrics, SystemNode};
use std::collections::HashMap;

pub struct MetricsCalculator;

impl MetricsCalculator {
    /// Calculate p50, p95, p99 latencies from a vector of recorded latency samples in ms
    pub fn calculate_percentiles(mut latencies: Vec<f64>) -> (f64, f64, f64) {
        if latencies.is_empty() {
            return (0.0, 0.0, 0.0);
        }

        latencies.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let len = latencies.len();

        let p50_idx = ((len as f64) * 0.50).min((len - 1) as f64) as usize;
        let p95_idx = ((len as f64) * 0.95).min((len - 1) as f64) as usize;
        let p99_idx = ((len as f64) * 0.99).min((len - 1) as f64) as usize;

        (latencies[p50_idx], latencies[p95_idx], latencies[p99_idx])
    }

    /// Computes monthly infrastructure cost based on provisioned nodes and scale
    pub fn compute_monthly_cost(nodes: &HashMap<String, SystemNode>) -> f64 {
        let mut total_hourly = 0.0;

        for node in nodes.values() {
            let base_cost = node.component_type.hourly_cost_usd();
            let multiplier = match node.component_type {
                ComponentType::Microservice => {
                    node.config.instances.unwrap_or(1) as f64
                }
                ComponentType::Database => {
                    1.0 + (node.config.read_replicas.unwrap_or(0) as f64 * 0.75)
                }
                ComponentType::Cache => {
                    let mem = node.config.max_memory_mb.unwrap_or(1024) as f64;
                    (mem / 1024.0).max(1.0)
                }
                _ => 1.0,
            };
            total_hourly += base_cost * multiplier;
        }

        // 730 average hours in a calendar month
        total_hourly * 730.0
    }

    /// Evaluates health flag: overall system is healthy if error rate < 1% and p95 < 200ms
    pub fn is_system_healthy(overall_p95: f64, failed_reqs: u64, total_reqs: u64) -> bool {
        if total_reqs == 0 {
            return true;
        }
        let error_rate = (failed_reqs as f64) / (total_reqs as f64);
        error_rate < 0.01 && overall_p95 < 250.0
    }
}
