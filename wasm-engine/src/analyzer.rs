//! ==============================================================================
//! Real-Time Architecture Analyzer (SPOF & Bottleneck Detection)
//!
//! Implements Tarjan's Articulation Points algorithm to identify Single Points
//! of Failure, analyzes architectural anti-patterns, and computes an overall
//! System Resilience Score (0 - 100).
//! ==============================================================================

use crate::graph::SystemGraph;
use crate::models::{
    ArchitectureAnalysisReport, ComponentType, SimulationReport, SpofIssue,
};
use std::collections::{HashMap, HashSet};

pub struct ArchitectureAnalyzer;

impl ArchitectureAnalyzer {
    /// Analyzes the topology and recent simulation metrics to detect design vulnerabilities
    pub fn evaluate(
        graph: &SystemGraph,
        sim_report: Option<&SimulationReport>,
    ) -> ArchitectureAnalysisReport {
        let mut report = ArchitectureAnalysisReport::default();
        if graph.nodes.is_empty() {
            return report;
        }

        let mut score: i32 = 100;

        // 1. Identify Single Points of Failure (SPOFs) via Articulation Points
        let spofs = Self::find_articulation_points(graph);
        for node_id in spofs {
            if let Some(node) = graph.nodes.get(&node_id) {
                // Client nodes are inherently single sources for simulation purposes, skip them
                if node.component_type == ComponentType::Client {
                    continue;
                }

                let severity = match node.component_type {
                    ComponentType::Database => "CRITICAL",
                    ComponentType::ApiGateway => "HIGH",
                    ComponentType::LoadBalancer => "MEDIUM",
                    ComponentType::Microservice => "HIGH",
                    _ => "MEDIUM",
                };

                let suggestion = match node.component_type {
                    ComponentType::Database => {
                        "Add read-replicas or configure a multi-AZ hot standby replica to prevent total outage if primary fails."
                    }
                    ComponentType::Microservice => {
                        "Deploy at least 2 instances behind a Load Balancer to guarantee high availability (N+1 redundancy)."
                    }
                    ComponentType::LoadBalancer => {
                        "Deploy redundant active-passive Load Balancers with VRRP / floating virtual IP or DNS round-robin."
                    }
                    ComponentType::Cache => {
                        "Deploy Redis Sentinel or Redis Cluster across multiple nodes to avoid cache stampede on single-node failure."
                    }
                    _ => "Introduce horizontal redundancy to eliminate this single point of failure.",
                };

                report.spofs.push(SpofIssue {
                    node_id: node.id.clone(),
                    node_name: node.name.clone(),
                    component_type: node.component_type,
                    severity: severity.to_string(),
                    reason: format!(
                        "'{}' is an articulation point. If it fails, downstream traffic becomes unreachable.",
                        node.name
                    ),
                    suggestion: suggestion.to_string(),
                });

                score -= if severity == "CRITICAL" { 20 } else { 12 };
            }
        }

        // 2. Detect Architectural Anti-Patterns:
        // Anti-pattern A: Client directly connected to Database (No API gateway/Service)
        for (id, node) in &graph.nodes {
            if node.component_type == ComponentType::Client {
                for downstream_id in graph.get_downstream_nodes(id) {
                    if let Some(downstream) = graph.nodes.get(&downstream_id) {
                        if downstream.component_type == ComponentType::Database {
                            report.recommendations.push(format!(
                                "Security Risk: Client '{}' connects directly to Database '{}'. Place an API Gateway or Microservice in between.",
                                node.name, downstream.name
                            ));
                            score -= 25;
                        }
                    }
                }
            }
        }

        // Anti-pattern B: Missing Load Balancer before multiple microservice instances
        for (id, node) in &graph.nodes {
            if node.component_type == ComponentType::Microservice {
                let incoming_edges = graph.incoming.get(id).map(|v| v.len()).unwrap_or(0);
                let incoming_nodes: Vec<&str> = graph
                    .incoming
                    .get(id)
                    .unwrap_or(&vec![])
                    .iter()
                    .filter_map(|eid| graph.edges.get(eid).map(|e| e.from.as_str()))
                    .collect();

                let has_lb_parent = incoming_nodes.iter().any(|&parent_id| {
                    graph
                        .nodes
                        .get(parent_id)
                        .map(|p| p.component_type == ComponentType::LoadBalancer || p.component_type == ComponentType::ApiGateway)
                        .unwrap_or(false)
                });

                if !has_lb_parent && incoming_edges > 0 {
                    report.missing_load_balancers.push(format!(
                        "Microservice '{}' is receiving direct traffic without an upstream Load Balancer or API Gateway.",
                        node.name
                    ));
                    score -= 10;
                }
            }
        }

        // Anti-pattern C: High-Traffic Database without Cache
        let has_cache = graph.nodes.values().any(|n| n.component_type == ComponentType::Cache);
        let has_db = graph.nodes.values().any(|n| n.component_type == ComponentType::Database);
        if has_db && !has_cache {
            report.recommendations.push(
                "Performance Optimization: No in-memory Cache (Redis/Memcached) detected. Database will absorb 100% of read traffic."
                    .to_string(),
            );
            score -= 10;
        }

        // 3. Bottleneck Analysis from live simulation report
        if let Some(sim) = sim_report {
            for (node_id, m) in &sim.node_metrics {
                if m.cpu_utilization >= 1.0 {
                    let name = graph
                        .nodes
                        .get(node_id)
                        .map(|n| n.name.as_str())
                        .unwrap_or(node_id.as_str());
                    report.bottlenecks.push(format!(
                        "Node '{}' is saturated (Utilization: {:.1}%). Dropping {:.0} req/s with {:.1}% error rate.",
                        name,
                        m.cpu_utilization * 100.0,
                        m.dropped_rps,
                        m.error_rate_percent
                    ));
                    score -= 15;
                }
            }
        }

        report.architecture_score = score.clamp(10, 100) as u32;
        report
    }

    /// Tarjan's articulation points algorithm on undirected graph representation
    fn find_articulation_points(graph: &SystemGraph) -> Vec<String> {
        let node_list: Vec<String> = graph.nodes.keys().cloned().collect();
        let n = node_list.len();
        if n < 3 {
            return Vec::new();
        }

        let node_to_idx: HashMap<String, usize> = node_list
            .iter()
            .enumerate()
            .map(|(i, id)| (id.clone(), i))
            .collect();

        // Build undirected adjacency list
        let mut adj: Vec<Vec<usize>> = vec![Vec::new(); n];
        for edge in graph.edges.values() {
            if let (Some(&u), Some(&v)) = (node_to_idx.get(&edge.from), node_to_idx.get(&edge.to)) {
                if u != v {
                    adj[u].push(v);
                    adj[v].push(u);
                }
            }
        }

        let mut visited = vec![false; n];
        let mut tin = vec![0usize; n];
        let mut low = vec![0usize; n];
        let mut timer = 0usize;
        let mut is_cut = vec![false; n];

        fn dfs(
            u: usize,
            p: Option<usize>,
            adj: &Vec<Vec<usize>>,
            visited: &mut Vec<bool>,
            tin: &mut Vec<usize>,
            low: &mut Vec<usize>,
            timer: &mut usize,
            is_cut: &mut Vec<bool>,
        ) {
            visited[u] = true;
            *timer += 1;
            tin[u] = *timer;
            low[u] = *timer;
            let mut children = 0;

            for &v in &adj[u] {
                if Some(v) == p {
                    continue;
                }
                if visited[v] {
                    low[u] = low[u].min(tin[v]);
                } else {
                    dfs(v, Some(u), adj, visited, tin, low, timer, is_cut);
                    low[u] = low[u].min(low[v]);
                    if low[v] >= tin[u] && p.is_some() {
                        is_cut[u] = true;
                    }
                    children += 1;
                }
            }

            if p.is_none() && children > 1 {
                is_cut[u] = true;
            }
        }

        for i in 0..n {
            if !visited[i] {
                dfs(
                    i,
                    None,
                    &adj,
                    &mut visited,
                    &mut tin,
                    &mut low,
                    &mut timer,
                    &mut is_cut,
                );
            }
        }

        let mut articulation_points = Vec::new();
        for (i, &cut) in is_cut.iter().enumerate() {
            if cut {
                articulation_points.push(node_list[i].clone());
            }
        }

        articulation_points
    }
}
