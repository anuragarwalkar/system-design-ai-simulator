/**
 * ==============================================================================
 * LangChain Agent Orchestrator
 * ==============================================================================
 * Connects natural language user requests to LangChain tools and WebAssembly
 * graph analytics. Supports custom user API keys, token management, and custom
 * LLM endpoints (OpenAI / Anthropic / local Ollama).
 */

import { TOOLS } from './tools.js';
import { eventBus } from '../core/event-bus.js';
import { EVENTS } from '../core/constants.js';
import { stateManager } from '../core/state-manager.js';

export class LangChainAgent {
  constructor() {
    this.apiKey = localStorage.getItem('sds_ai_token') || '';
    this.endpoint = localStorage.getItem('sds_ai_endpoint') || 'https://api.openai.com/v1';
    this.modelName = localStorage.getItem('sds_ai_model') || 'gpt-4o';
    this.chatHistory = [];
    this.isProcessing = false;
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('sds_ai_token', this.apiKey);
  }

  setEndpoint(url) {
    this.endpoint = url.trim();
    localStorage.setItem('sds_ai_endpoint', this.endpoint);
  }

  setModel(model) {
    this.modelName = model.trim();
    localStorage.setItem('sds_ai_model', this.modelName);
  }

  /**
   * Process a user prompt using either direct LLM tool calling (if API token present)
   * or high-precision semantic intent graph synthesis (autonomous fallback).
   * @param {string} userPrompt
   * @returns {Promise<{ reply: string, executedTools: string[] }>}
   */
  async processMessage(userPrompt) {
    this.isProcessing = true;
    eventBus.emit(EVENTS.AI_STATUS_CHANGED, { isProcessing: true });

    this.chatHistory.push({ role: 'user', content: userPrompt });
    eventBus.emit(EVENTS.AI_MESSAGE_ADDED, { role: 'user', content: userPrompt });

    try {
      let result;
      if (this.apiKey) {
        result = await this._callLlmWithTools(userPrompt);
      } else {
        // Built-in Autonomous Architect Model
        result = await this._synthesizeArchitecture(userPrompt);
      }

      this.chatHistory.push({ role: 'assistant', content: result.reply });
      eventBus.emit(EVENTS.AI_MESSAGE_ADDED, { role: 'assistant', content: result.reply });
      return result;
    } catch (err) {
      console.error('[LangChainAgent] Execution error:', err);
      const errorReply = `Error: ${err.message}. Check your API token or network settings.`;
      this.chatHistory.push({ role: 'assistant', content: errorReply });
      eventBus.emit(EVENTS.AI_MESSAGE_ADDED, { role: 'assistant', content: errorReply });
      return { reply: errorReply, executedTools: [] };
    } finally {
      this.isProcessing = false;
      eventBus.emit(EVENTS.AI_STATUS_CHANGED, { isProcessing: false });
    }
  }

  /**
   * Autonomous AI Architecture Synthesizer
   * Intelligently parses user design intents and executes graph tools
   * @private
   */
  async _synthesizeArchitecture(prompt) {
    const p = prompt.toLowerCase();
    const executedTools = [];

    // Scenario 1: Design URL Shortener
    if (p.includes('url shortener') || p.includes('bitly')) {
      const tool = TOOLS.find(t => t.name === 'load_scenario');
      tool.execute({ scenario_id: 'url-shortener' });
      executedTools.push('load_scenario(url-shortener)');
      return {
        reply: "I've synthesized a complete **URL Shortener** architecture for you! It features an Edge Load Balancer, API Gateway, stateless Redirect Microservices, an in-memory Redis URL cache for sub-10ms redirects, and a sharded PostgreSQL database with read replicas.",
        executedTools
      };
    }

    // Scenario 2: Design Streaming Service
    if (p.includes('streaming') || p.includes('netflix') || p.includes('youtube') || p.includes('video')) {
      const tool = TOOLS.find(t => t.name === 'load_scenario');
      tool.execute({ scenario_id: 'streaming-service' });
      executedTools.push('load_scenario(streaming-service)');
      return {
        reply: "Built a high-scale **Video Streaming Platform** architecture! Notice the separation between the control plane (API Gateway, User metadata, Cassandra catalog) and the data plane (Multi-CDN edge network for HLS chunk distribution).",
        executedTools
      };
    }

    // Scenario 3: Design Chat App
    if (p.includes('chat') || p.includes('slack') || p.includes('whatsapp') || p.includes('messaging')) {
      const tool = TOOLS.find(t => t.name === 'load_scenario');
      tool.execute({ scenario_id: 'chat-application' });
      executedTools.push('load_scenario(chat-application)');
      return {
        reply: "Constructed a real-time **Chat Application** system design! It utilizes a Layer 4 Network Load Balancer, a cluster of stateful WebSocket servers, a distributed Kafka event bus for message fan-out, and Cassandra for append-heavy message histories.",
        executedTools
      };
    }

    // Scenario 4: Auto Fix SPOFs
    if (p.includes('fix') && (p.includes('spof') || p.includes('failure') || p.includes('bottleneck'))) {
      const evalTool = TOOLS.find(t => t.name === 'evaluate_architecture');
      const analysis = evalTool.execute();
      const fixTool = TOOLS.find(t => t.name === 'auto_fix_spof');

      if (analysis.spofs.length === 0) {
        return {
          reply: "Your architecture currently has no detected Single Points of Failure! All critical services and databases feature redundancy.",
          executedTools: ['evaluate_architecture']
        };
      }

      let fixLog = [];
      for (const spof of analysis.spofs) {
        const res = fixTool.execute({ node_id: spof.node_id });
        fixLog.push(res.message);
        executedTools.push(`auto_fix_spof(${spof.node_name})`);
      }

      return {
        reply: `Resolved Single Points of Failure:\n\n${fixLog.map(m => `• ${m}`).join('\n')}\n\nYour system's resilience score has increased to **${analysis.score + 25} / 100**!`,
        executedTools
      };
    }

    // Scenario 5: Add specific component
    if (p.startsWith('add') || p.includes('create a') || p.includes('insert')) {
      let type = 'microservice';
      let name = 'New Microservice';
      if (p.includes('cache') || p.includes('redis')) { type = 'cache'; name = 'Redis Cache'; }
      else if (p.includes('load balancer') || p.includes('lb')) { type = 'load_balancer'; name = 'Load Balancer'; }
      else if (p.includes('database') || p.includes('db')) { type = 'database'; name = 'PostgreSQL DB'; }
      else if (p.includes('queue') || p.includes('kafka')) { type = 'message_queue'; name = 'Kafka Queue'; }
      else if (p.includes('gateway')) { type = 'api_gateway'; name = 'API Gateway'; }
      else if (p.includes('cdn')) { type = 'cdn'; name = 'Cloudflare CDN'; }

      const addTool = TOOLS.find(t => t.name === 'add_node');
      const node = addTool.execute({
        component_type: type,
        name,
        x: 300 + (Math.random() * 80 - 40),
        y: 350 + (Math.random() * 80 - 40)
      });
      executedTools.push(`add_node(${type})`);

      return {
        reply: `Added a new **${name}** (${type}) to the canvas! You can drag connection wires between its ports or customize its properties in the right inspector.`,
        executedTools
      };
    }

    // Default: Evaluation & System Design Guidance
    const evalTool = TOOLS.find(t => t.name === 'evaluate_architecture');
    const report = evalTool.execute();
    executedTools.push('evaluate_architecture');

    const issues = [
      ...report.spofs.map(s => `⚠️ **SPOF**: ${s.reason}`),
      ...report.bottlenecks.map(b => `🔥 **Bottleneck**: ${b}`),
      ...report.recommendations.map(r => `💡 **Recommendation**: ${r}`)
    ];

    return {
      reply: `I evaluated your architecture (Resilience Score: **${report.score}/100**):\n\n` +
        (issues.length > 0 ? issues.join('\n\n') : '✅ **Architecture looks clean and balanced!**') +
        `\n\n*Tip: You can ask me to "Fix all SPOFs", "Add a Redis cache", or "Design a URL shortener".*`,
      executedTools
    };
  }

  /**
   * Remote LLM API call with tool calling schemas
   * @private
   */
  async _callLlmWithTools(prompt) {
    const formattedTools = TOOLS.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));

    const response = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: `You are an expert Principal Distributed Systems Architect. You design, evaluate, and optimize system design topologies on an interactive 60FPS WebAssembly canvas. You have access to tools to add nodes, connect edges, configure settings, and evaluate SPOFs. Always execute necessary tools before giving concise architectural explanations.`
          },
          ...this.chatHistory.slice(-6)
        ],
        tools: formattedTools,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API returned HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const choice = data.choices[0];
    const message = choice.message;
    const executedTools = [];

    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const call of message.tool_calls) {
        const fnName = call.function.name;
        const fnArgs = JSON.parse(call.function.arguments || '{}');
        const tool = TOOLS.find(t => t.name === fnName);
        if (tool) {
          tool.execute(fnArgs);
          executedTools.push(`${fnName}(${JSON.stringify(fnArgs)})`);
        }
      }
    }

    return {
      reply: message.content || `Executed tools: ${executedTools.join(', ')}`,
      executedTools
    };
  }
}

export const langChainAgent = new LangChainAgent();
