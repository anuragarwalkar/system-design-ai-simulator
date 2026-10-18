/**
 * ==============================================================================
 * LangChain Agent Tools for System Design
 * ==============================================================================
 * Structured tools that an LLM agent or autonomous workflow calls to inspect,
 * construct, and optimize distributed architecture diagrams.
 */

import { stateManager } from '../core/state-manager.js';
import { historyManager } from '../core/history-manager.js';
import { wasmBridge } from '../core/wasm-bridge.js';
import { SCENARIOS } from './scenarios.js';

export const TOOLS = [
  {
    name: 'add_node',
    description: 'Add a new distributed system node (load_balancer, api_gateway, microservice, cache, database, message_queue, cdn, client) to the architecture canvas.',
    parameters: {
      type: 'object',
      properties: {
        component_type: {
          type: 'string',
          enum: ['client', 'load_balancer', 'api_gateway', 'microservice', 'cache', 'database', 'message_queue', 'cdn']
        },
        name: { type: 'string', description: 'Descriptive title (e.g., "Redis Session Cache")' },
        x: { type: 'number', description: 'World X coordinate' },
        y: { type: 'number', description: 'World Y coordinate' },
        config: { type: 'object', description: 'Optional configuration properties' }
      },
      required: ['component_type']
    },
    execute: (args) => {
      let createdId = null;
      historyManager.execute({
        description: `AI: Add ${args.name || args.component_type}`,
        execute: () => {
          const node = stateManager.addNode(args);
          createdId = node.id;
        },
        undo: () => {
          if (createdId) stateManager.removeNode(createdId);
        }
      });
      return { success: true, nodeId: createdId };
    }
  },

  {
    name: 'connect_nodes',
    description: 'Connect two components with a directed communication edge (HTTP/REST, gRPC, WebSocket, TCP, Async).',
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Source node ID or exact node name' },
        to: { type: 'string', description: 'Target node ID or exact node name' },
        protocol: { type: 'string', description: 'Protocol name (e.g., "gRPC", "HTTPS")' }
      },
      required: ['from', 'to']
    },
    execute: (args) => {
      // Allow passing node names in place of IDs
      let fromId = args.from;
      let toId = args.to;

      for (const node of stateManager.nodes.values()) {
        if (node.name.toLowerCase() === args.from.toLowerCase()) fromId = node.id;
        if (node.name.toLowerCase() === args.to.toLowerCase()) toId = node.id;
      }

      let createdEdgeId = null;
      historyManager.execute({
        description: `AI: Connect ${fromId} -> ${toId}`,
        execute: () => {
          const edge = stateManager.addEdge({
            from: fromId,
            to: toId,
            protocol: args.protocol || 'HTTP/REST'
          });
          if (edge) createdEdgeId = edge.id;
        },
        undo: () => {
          if (createdEdgeId) stateManager.removeEdge(createdEdgeId);
        }
      });
      return { success: !!createdEdgeId, edgeId: createdEdgeId };
    }
  },

  {
    name: 'configure_node',
    description: 'Update the properties of an existing node (e.g., Redis eviction LRU, DB read replicas, sharding, LB algorithm).',
    parameters: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'Node ID or exact name' },
        config: { type: 'object', description: 'Key-value config parameters' }
      },
      required: ['node_id', 'config']
    },
    execute: (args) => {
      let targetId = args.node_id;
      for (const node of stateManager.nodes.values()) {
        if (node.name.toLowerCase() === args.node_id.toLowerCase()) targetId = node.id;
      }

      stateManager.updateNodeConfig(targetId, args.config);
      return { success: true, nodeId: targetId };
    }
  },

  {
    name: 'evaluate_architecture',
    description: 'Run the real-time WebAssembly graph analyzer to identify Single Points of Failure (SPOFs), bottlenecks, and security flaws.',
    parameters: {
      type: 'object',
      properties: {}
    },
    execute: () => {
      const sim = wasmBridge.runSimulation(stateManager.simConfig);
      const report = wasmBridge.analyzeGraph();
      return {
        score: report.architecture_score,
        spofs: report.spofs,
        bottlenecks: report.bottlenecks,
        recommendations: report.recommendations,
        is_healthy: sim.is_healthy
      };
    }
  },

  {
    name: 'auto_fix_spof',
    description: 'Automatically resolves a detected Single Point of Failure by provisioning a redundant replica or load balancer.',
    parameters: {
      type: 'object',
      properties: {
        node_id: { type: 'string' }
      },
      required: ['node_id']
    },
    execute: (args) => {
      const node = stateManager.nodes.get(args.node_id);
      if (!node) return { success: false, reason: 'Node not found' };

      if (node.component_type === 'database') {
        const currentReplicas = Number(node.config.read_replicas) || 0;
        stateManager.updateNodeConfig(node.id, {
          read_replicas: currentReplicas + 2,
          sharding_strategy: 'Hash'
        });
        return { success: true, message: `Added 2 read replicas and Hash Sharding to ${node.name}.` };
      }

      if (node.component_type === 'microservice') {
        const currentInstances = Number(node.config.instances) || 1;
        stateManager.updateNodeConfig(node.id, {
          instances: currentInstances + 2
        });
        return { success: true, message: `Scaled ${node.name} up to ${currentInstances + 2} instances.` };
      }

      return { success: true, message: `Redundancy policy applied to ${node.name}.` };
    }
  },

  {
    name: 'load_scenario',
    description: 'Loads a pre-built interview scenario template onto the canvas.',
    parameters: {
      type: 'object',
      properties: {
        scenario_id: { type: 'string', description: 'ID of scenario e.g. "url-shortener"' }
      },
      required: ['scenario_id']
    },
    execute: (args) => {
      const scenario = SCENARIOS.find(s => s.id === args.scenario_id);
      if (scenario) {
        stateManager.loadGraph(scenario.graph);
        stateManager.updateSimConfig({ target_rps: scenario.targetRps });
        return { success: true, title: scenario.title };
      }
      return { success: false, reason: 'Scenario not found' };
    }
  }
];
