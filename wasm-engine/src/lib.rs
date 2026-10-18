//! ==============================================================================
//! WebAssembly System Design Simulator Core (lib.rs)
//!
//! Exposes a high-performance, stateful simulation engine to JavaScript
//! via `wasm-bindgen`. Coordinates graph topology, discrete-event simulation,
//! metric computation, and SPOF detection with minimal serialization overhead.
//! ==============================================================================

pub mod analyzer;
pub mod graph;
pub mod load_balancer;
pub mod metrics;
pub mod models;
pub mod simulator;

use analyzer::ArchitectureAnalyzer;
use graph::SystemGraph;
use models::{
    ArchitectureAnalysisReport, SimulationConfig, SimulationReport, SystemEdge, SystemNode,
};
use simulator::TrafficSimulator;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SimulatorEngine {
    graph: SystemGraph,
    last_report: Option<SimulationReport>,
}

#[wasm_bindgen]
impl SimulatorEngine {
    /// Creates a new, blank simulation engine instance in WASM linear memory
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            graph: SystemGraph::new(),
            last_report: None,
        }
    }

    /// Adds or updates a node in the graph. `node_json` is serialized `SystemNode`.
    #[wasm_bindgen]
    pub fn add_node(&mut self, node_json: &str) -> Result<String, JsValue> {
        let node: SystemNode = serde_json::from_str(node_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse SystemNode: {}", e)))?;
        let id = node.id.clone();
        self.graph.add_node(node);
        Ok(id)
    }

    /// Removes a node and its adjacent edges
    #[wasm_bindgen]
    pub fn remove_node(&mut self, node_id: &str) {
        self.graph.remove_node(node_id);
    }

    /// Adds a directed edge between two existing nodes
    #[wasm_bindgen]
    pub fn add_edge(&mut self, edge_json: &str) -> Result<String, JsValue> {
        let edge: SystemEdge = serde_json::from_str(edge_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse SystemEdge: {}", e)))?;
        let id = edge.id.clone();
        self.graph.add_edge(edge).map_err(|e| JsValue::from_str(&e))?;
        Ok(id)
    }

    /// Removes an edge by identifier
    #[wasm_bindgen]
    pub fn remove_edge(&mut self, edge_id: &str) {
        self.graph.remove_edge(edge_id);
    }

    /// Wipes all nodes and edges from memory
    #[wasm_bindgen]
    pub fn clear(&mut self) {
        self.graph = SystemGraph::new();
        self.last_report = None;
    }

    /// Runs a full discrete-event simulation with the specified load profile
    #[wasm_bindgen]
    pub fn simulate(&mut self, config_json: &str) -> Result<String, JsValue> {
        let config: SimulationConfig = serde_json::from_str(config_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse SimulationConfig: {}", e)))?;

        let report = TrafficSimulator::simulate(&self.graph, &config);
        let json_result = serde_json::to_string(&report)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize report: {}", e)))?;

        self.last_report = Some(report);
        Ok(json_result)
    }

    /// Evaluates the architecture in real-time, detecting SPOFs, bottlenecks, and anti-patterns
    #[wasm_bindgen]
    pub fn analyze(&self) -> Result<String, JsValue> {
        let analysis: ArchitectureAnalysisReport =
            ArchitectureAnalyzer::evaluate(&self.graph, self.last_report.as_ref());

        serde_json::to_string(&analysis)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize analysis: {}", e)))
    }

    /// Returns the active graph topology as JSON
    #[wasm_bindgen]
    pub fn get_graph_json(&self) -> Result<String, JsValue> {
        serde_json::to_string(&self.graph.nodes)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize nodes: {}", e)))
    }

    /// Engine version and capabilities descriptor
    #[wasm_bindgen]
    pub fn get_version(&self) -> String {
        "WASM System Design Simulator Engine v1.0.0 (Rust 2021 edition)".to_string()
    }
}
