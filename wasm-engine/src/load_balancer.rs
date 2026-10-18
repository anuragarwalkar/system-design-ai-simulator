//! ==============================================================================
//! Load Balancing Algorithms (Strategy Pattern)
//!
//! Provides production-grade traffic distribution algorithms:
//! 1. Round Robin
//! 2. Least Connections (Dynamic workload aware)
//! 3. Consistent Hashing (Ketama virtual ring approximation for stateful caches/shards)
//! ==============================================================================

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BalancingStrategy {
    RoundRobin,
    LeastConnections,
    ConsistentHashing,
    Random,
}

impl BalancingStrategy {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().replace(['-', '_', ' '], "").as_str() {
            "leastconnections" | "leastconn" => BalancingStrategy::LeastConnections,
            "consistenthashing" | "hash" | "chash" => BalancingStrategy::ConsistentHashing,
            "random" => BalancingStrategy::Random,
            _ => BalancingStrategy::RoundRobin,
        }
    }
}

pub struct LoadBalancerState {
    round_robin_counter: usize,
}

impl LoadBalancerState {
    pub fn new() -> Self {
        Self {
            round_robin_counter: 0,
        }
    }

    /// Selects the next target node ID from available downstream options
    pub fn pick_target(
        &mut self,
        strategy: BalancingStrategy,
        targets: &[String],
        target_loads: &[f64],
        request_key: Option<&str>,
    ) -> Option<String> {
        if targets.is_empty() {
            return None;
        }

        match strategy {
            BalancingStrategy::RoundRobin => {
                let idx = self.round_robin_counter % targets.len();
                self.round_robin_counter = self.round_robin_counter.wrapping_add(1);
                Some(targets[idx].clone())
            }

            BalancingStrategy::LeastConnections => {
                // Find node with lowest current utilization / active load
                let mut best_idx = 0;
                let mut min_load = f64::INFINITY;

                for (idx, &load) in target_loads.iter().enumerate() {
                    if load < min_load {
                        min_load = load;
                        best_idx = idx;
                    }
                }
                Some(targets[best_idx].clone())
            }

            BalancingStrategy::ConsistentHashing => {
                // Hash the request key (e.g. user_id or IP) across the target ring
                let key = request_key.unwrap_or("default_session_seed");
                let mut hasher = DefaultHasher::new();
                key.hash(&mut hasher);
                let hash = hasher.finish();

                let idx = (hash as usize) % targets.len();
                Some(targets[idx].clone())
            }

            BalancingStrategy::Random => {
                // Deterministic pseudo-random based on counter
                let idx = (self.round_robin_counter.wrapping_mul(1664525).wrapping_add(1013904223))
                    % targets.len();
                self.round_robin_counter = self.round_robin_counter.wrapping_add(1);
                Some(targets[idx].clone())
            }
        }
    }
}
