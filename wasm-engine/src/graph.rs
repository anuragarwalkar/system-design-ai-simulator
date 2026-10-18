//! ==============================================================================
//! Directed Graph Data Structure for Distributed Systems
//!
//! Maintains node registries, outgoing/incoming adjacency lists, and provides
//! graph traversal algorithms optimized for simulating message flow.
//! ==============================================================================

use crate::models::{SystemEdge, SystemNode};
use std::collections::{HashMap, HashSet, VecDeque};

#[derive(Debug, Clone, Default)]
pub struct SystemGraph {
    pub nodes: HashMap<String, SystemNode>,
    pub edges: HashMap<String, SystemEdge>,
    /// Adjacency: node_id -> list of outgoing edge_ids
    pub outgoing: HashMap<String, Vec<String>>,
    /// Reverse adjacency: node_id -> list of incoming edge_ids
    pub incoming: HashMap<String, Vec<String>>,
}

impl SystemGraph {
    pub fn new() -> Self {
        Self::default()
    }

    /// Insert or update a node
    pub fn add_node(&mut self, node: SystemNode) {
        let id = node.id.clone();
        self.nodes.insert(id.clone(), node);
        self.outgoing.entry(id.clone()).or_default();
        self.incoming.entry(id).or_default();
    }

    /// Remove a node and all connected edges
    pub fn remove_node(&mut self, node_id: &str) {
        if self.nodes.remove(node_id).is_some() {
            // Remove outgoing edges
            if let Some(edge_ids) = self.outgoing.remove(node_id) {
                for edge_id in edge_ids {
                    if let Some(edge) = self.edges.remove(&edge_id) {
                        if let Some(inc) = self.incoming.get_mut(&edge.to) {
                            inc.retain(|id| id != &edge_id);
                        }
                    }
                }
            }
            // Remove incoming edges
            if let Some(edge_ids) = self.incoming.remove(node_id) {
                for edge_id in edge_ids {
                    if let Some(edge) = self.edges.remove(&edge_id) {
                        if let Some(out) = self.outgoing.get_mut(&edge.from) {
                            out.retain(|id| id != &edge_id);
                        }
                    }
                }
            }
        }
    }

    /// Insert an edge between two valid nodes
    pub fn add_edge(&mut self, edge: SystemEdge) -> Result<(), String> {
        if !self.nodes.contains_key(&edge.from) {
            return Err(format!("Source node '{}' does not exist", edge.from));
        }
        if !self.nodes.contains_key(&edge.to) {
            return Err(format!("Target node '{}' does not exist", edge.to));
        }

        let edge_id = edge.id.clone();
        let from_id = edge.from.clone();
        let to_id = edge.to.clone();

        self.edges.insert(edge_id.clone(), edge);
        self.outgoing.entry(from_id).or_default().push(edge_id.clone());
        self.incoming.entry(to_id).or_default().push(edge_id);

        Ok(())
    }

    /// Remove an edge by ID
    pub fn remove_edge(&mut self, edge_id: &str) {
        if let Some(edge) = self.edges.remove(edge_id) {
            if let Some(out) = self.outgoing.get_mut(&edge.from) {
                out.retain(|id| id != edge_id);
            }
            if let Some(inc) = self.incoming.get_mut(&edge.to) {
                inc.retain(|id| id != edge_id);
            }
        }
    }

    /// Find all entry points (Client nodes or nodes with 0 incoming edges)
    pub fn find_entry_nodes(&self) -> Vec<String> {
        let mut entries = Vec::new();
        for (id, node) in &self.nodes {
            if node.component_type == crate::models::ComponentType::Client {
                entries.push(id.clone());
            } else if let Some(inc) = self.incoming.get(id) {
                if inc.is_empty() {
                    entries.push(id.clone());
                }
            }
        }
        entries
    }

    /// Get all downstream target nodes directly connected from `node_id`
    pub fn get_downstream_nodes(&self, node_id: &str) -> Vec<String> {
        let mut downstream = Vec::new();
        if let Some(edge_ids) = self.outgoing.get(node_id) {
            for edge_id in edge_ids {
                if let Some(edge) = self.edges.get(edge_id) {
                    downstream.push(edge.to.clone());
                }
            }
        }
        downstream
    }

    /// Breadth-first traversal to compute path length and reachability
    pub fn get_reachable_nodes(&self, start_node_id: &str) -> HashSet<String> {
        let mut visited = HashSet::new();
        let mut queue = VecDeque::new();

        visited.insert(start_node_id.to_string());
        queue.push_back(start_node_id.to_string());

        while let Some(current) = queue.pop_front() {
            for neighbor in self.get_downstream_nodes(&current) {
                if !visited.contains(&neighbor) {
                    visited.insert(neighbor.clone());
                    queue.push_back(neighbor);
                }
            }
        }

        visited
    }
}
