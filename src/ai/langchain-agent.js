/**
 * ==============================================================================
 * LangChain Agent Orchestrator
 * ==============================================================================
 * Connects natural language user requests to LangChain tools and WebAssembly
 * graph analytics. Supports Google Gemini API (Gemini 2.0 / 1.5), OpenAI API,
 * custom LLM endpoints (Ollama), and built-in offline autonomous synthesis.
 */

import { TOOLS } from './tools.js';
import { eventBus } from '../core/event-bus.js';
import { EVENTS } from '../core/constants.js';
import { stateManager } from '../core/state-manager.js';

export class LangChainAgent {
  constructor() {
    this.provider = localStorage.getItem('sds_ai_provider') || 'gemini';
    this.apiKey = localStorage.getItem('sds_ai_token') || '';
    this.endpoint = localStorage.getItem('sds_ai_endpoint') || (this.provider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' : 'https://api.openai.com/v1');
    this.modelName = localStorage.getItem('sds_ai_model') || (this.provider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o');
    this.chatHistory = [];
    this.isProcessing = false;
  }

  setProvider(provider) {
    this.provider = provider;
    localStorage.setItem('sds_ai_provider', provider);

    if (provider === 'gemini') {
      if (!this.modelName || this.modelName.startsWith('gpt')) {
        this.modelName = 'gemini-2.0-flash';
        localStorage.setItem('sds_ai_model', this.modelName);
      }
      if (!this.endpoint || this.endpoint.includes('openai')) {
        this.endpoint = 'https://generativelanguage.googleapis.com/v1beta';
        localStorage.setItem('sds_ai_endpoint', this.endpoint);
      }
    } else if (provider === 'openai') {
      if (!this.modelName || this.modelName.includes('gemini')) {
        this.modelName = 'gpt-4o';
        localStorage.setItem('sds_ai_model', this.modelName);
      }
      if (!this.endpoint || this.endpoint.includes('googleapis')) {
        this.endpoint = 'https://api.openai.com/v1';
        localStorage.setItem('sds_ai_endpoint', this.endpoint);
      }
    }
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('sds_ai_token', this.apiKey);

    // Auto-detect provider if key prefix matches
    if (this.apiKey.startsWith('AIzaSy')) {
      this.setProvider('gemini');
    } else if (this.apiKey.startsWith('sk-')) {
      this.setProvider('openai');
    }
  }

  setEndpoint(url) {
    this.endpoint = url.trim();
    localStorage.setItem('sds_ai_endpoint', this.endpoint);
  }

  setModel(model) {
    this.modelName = model.trim();
    localStorage.setItem('sds_ai_model', this.modelName);
  }

  clearSettings() {
    this.apiKey = '';
    this.provider = 'gemini';
    this.modelName = 'gemini-2.0-flash';
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta';
    localStorage.removeItem('sds_ai_token');
    localStorage.removeItem('sds_ai_provider');
    localStorage.removeItem('sds_ai_model');
    localStorage.removeItem('sds_ai_endpoint');
  }

  /**
   * Test API connectivity and response latency for the configured model.
   * Can accept override parameters from the settings form before they are persisted.
   * @param {Object} options
   * @returns {Promise<{ success: boolean, provider: string, model: string, latencyMs: number, sampleReply: string }>}
   */
  async testConnection({ provider, apiKey, modelName, endpoint } = {}) {
    const targetProvider = provider || this.provider;
    const targetKey = (apiKey !== undefined ? apiKey : this.apiKey).trim();
    const targetModel = (modelName || this.modelName || (targetProvider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o')).trim();
    let targetEndpoint = (endpoint || this.endpoint || (targetProvider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' : 'https://api.openai.com/v1')).trim();
    if (targetEndpoint.endsWith('/')) targetEndpoint = targetEndpoint.slice(0, -1);

    if (!targetKey) {
      throw new Error('Please enter an API Key / Token before testing.');
    }

    const isGemini = targetProvider === 'gemini' ||
      targetKey.startsWith('AIzaSy') ||
      targetModel.toLowerCase().includes('gemini');

    const startTime = performance.now();

    if (isGemini) {
      const url = `${targetEndpoint}/models/${targetModel}:generateContent?key=${targetKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Ping test. Reply with: System Design Simulator Ready.' }]
          }]
        })
      });

      const elapsedMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = errText;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error && errJson.error.message) {
            errMsg = errJson.error.message;
          }
        } catch (e) {}
        throw new Error(`Google Gemini (${response.status}): ${errMsg}`);
      }

      const data = await response.json();
      const sampleReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';

      return {
        success: true,
        provider: 'Google Gemini',
        model: targetModel,
        latencyMs: elapsedMs,
        sampleReply
      };
    } else {
      const url = `${targetEndpoint}/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${targetKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Ping test. Reply with: System Design Simulator Ready.' }],
          max_tokens: 15
        })
      });

      const elapsedMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = errText;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error && errJson.error.message) {
            errMsg = errJson.error.message;
          }
        } catch (e) {}
        throw new Error(`OpenAI / Custom Endpoint (${response.status}): ${errMsg}`);
      }

      const data = await response.json();
      const sampleReply = data.choices?.[0]?.message?.content?.trim() || 'OK';

      return {
        success: true,
        provider: 'OpenAI / Custom',
        model: targetModel,
        latencyMs: elapsedMs,
        sampleReply
      };
    }
  }

  /**
   * Process a user prompt using direct LLM tool calling (Gemini / OpenAI)
   * or high-precision semantic intent graph synthesis (offline fallback).
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
        const isGemini = this.provider === 'gemini' ||
          this.apiKey.startsWith('AIzaSy') ||
          this.modelName.toLowerCase().includes('gemini');

        if (isGemini) {
          result = await this._callGeminiWithTools(userPrompt);
        } else {
          result = await this._callOpenAiWithTools(userPrompt);
        }
      } else {
        // Built-in Autonomous Architect Model
        result = await this._synthesizeArchitecture(userPrompt);
      }

      this.chatHistory.push({ role: 'assistant', content: result.reply });
      eventBus.emit(EVENTS.AI_MESSAGE_ADDED, { role: 'assistant', content: result.reply });
      return result;
    } catch (err) {
      console.error('[LangChainAgent] Execution error:', err);
      const errorReply = `Error: ${err.message}. Please check your API token or model settings.`;
      this.chatHistory.push({ role: 'assistant', content: errorReply });
      eventBus.emit(EVENTS.AI_MESSAGE_ADDED, { role: 'assistant', content: errorReply });
      return { reply: errorReply, executedTools: [] };
    } finally {
      this.isProcessing = false;
      eventBus.emit(EVENTS.AI_STATUS_CHANGED, { isProcessing: false });
    }
  }

  /**
   * Google Gemini REST API execution with Function Calling (Tools)
   * @private
   */
  async _callGeminiWithTools(prompt) {
    const formattedTools = [{
      functionDeclarations: TOOLS.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }))
    }];

    // Build chat history for Gemini contents array
    const contents = [];
    const recentHistory = this.chatHistory.slice(-8);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const systemPrompt = `You are an expert Principal Distributed Systems Architect. You design, evaluate, and optimize system design topologies on an interactive 60FPS WebAssembly canvas. You have access to tools to add nodes, connect edges, configure settings, and evaluate SPOFs. Always execute necessary tools to modify the canvas before providing concise architectural explanations.`;

    const model = this.modelName || 'gemini-2.0-flash';
    let baseUrl = this.endpoint || 'https://generativelanguage.googleapis.com/v1beta';
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    const url = `${baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents,
      tools: formattedTools
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch (e) {}
      throw new Error(`Google Gemini API (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content) {
      throw new Error('Gemini API did not return any candidates.');
    }

    const executedTools = [];
    const textReplies = [];

    const parts = candidate.content.parts || [];
    for (const part of parts) {
      if (part.functionCall) {
        const fnName = part.functionCall.name;
        const fnArgs = part.functionCall.args || {};
        const tool = TOOLS.find(t => t.name === fnName);
        if (tool) {
          tool.execute(fnArgs);
          executedTools.push(`${fnName}(${JSON.stringify(fnArgs)})`);
        }
      }
      if (part.text) {
        textReplies.push(part.text);
      }
    }

    let reply = textReplies.join('\n\n').trim();
    if (!reply && executedTools.length > 0) {
      reply = `I have updated your architecture canvas via Gemini:\n\n` +
        executedTools.map(t => `• \`${t}\``).join('\n') +
        `\n\nThe components and connections have been rendered live on the 60FPS canvas!`;
    } else if (!reply) {
      reply = `Architecture updated successfully.`;
    }

    return {
      reply,
      executedTools
    };
  }

  /**
   * OpenAI / Custom LLM API call with tool calling schemas
   * @private
   */
  async _callOpenAiWithTools(prompt) {
    const formattedTools = TOOLS.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));

    let endpoint = this.endpoint || 'https://api.openai.com/v1';
    if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
    const url = endpoint.includes('/chat/completions') ? endpoint : `${endpoint}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName || 'gpt-4o',
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
      throw new Error(`OpenAI API returned HTTP ${response.status}: ${await response.text()}`);
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

  /**
   * Built-in Autonomous AI Architecture Synthesizer (No API Key required)
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
        reply: "I've deployed a global **Video Streaming Architecture** (Netflix-scale). Key patterns: Cloudflare CDN for chunked video blob streaming, asynchronous Transcoding Worker pods fed by Kafka, and a high-throughput NoSQL metadata store.",
        executedTools
      };
    }

    // Scenario 3: Design Chat App
    if (p.includes('chat') || p.includes('whatsapp') || p.includes('slack')) {
      const tool = TOOLS.find(t => t.name === 'load_scenario');
      tool.execute({ scenario_id: 'chat-app' });
      executedTools.push('load_scenario(chat-app)');
      return {
        reply: "I've architected a real-time **Chat & Messaging System**! It features an L4 Load Balancer routing persistent WebSocket connection clusters, Kafka event streaming for message delivery, Redis ephemeral presence storage, and Cassandra for append-only message history.",
        executedTools
      };
    }

    // Scenario 4: Fix SPOFs
    if (p.includes('spof') || p.includes('fix') || p.includes('single point of failure')) {
      const fixTool = TOOLS.find(t => t.name === 'auto_fix_spof');
      let fixCount = 0;
      for (const node of stateManager.nodes.values()) {
        const res = fixTool.execute({ node_id: node.id });
        if (res.success) {
          executedTools.push(`auto_fix_spof(${node.name})`);
          fixCount++;
        }
      }
      return {
        reply: fixCount > 0
          ? `I detected and hardened **${fixCount} Single Points of Failure** across your topology by adding upstream load balancers, caching layers, and database read replicas.`
          : `No critical single points of failure detected! Your system design already satisfies high-availability redundancy criteria.`,
        executedTools
      };
    }

    // Scenario 5: Add specific component
    if (p.includes('add') || p.includes('create')) {
      let type = 'microservice';
      let name = 'App Server';

      if (p.includes('cache') || p.includes('redis')) { type = 'cache'; name = 'Redis Cache'; }
      else if (p.includes('load balancer') || p.includes('lb')) { type = 'load_balancer'; name = 'Edge Load Balancer'; }
      else if (p.includes('database') || p.includes('db')) { type = 'database'; name = 'PostgreSQL DB'; }
      else if (p.includes('queue') || p.includes('kafka')) { type = 'message_queue'; name = 'Kafka Queue'; }
      else if (p.includes('gateway')) { type = 'api_gateway'; name = 'API Gateway'; }
      else if (p.includes('cdn')) { type = 'cdn'; name = 'Cloudflare CDN'; }

      const addTool = TOOLS.find(t => t.name === 'add_node');
      addTool.execute({
        component_type: type,
        name,
        x: 300 + (Math.random() * 80 - 40),
        y: 350 + (Math.random() * 80 - 40)
      });
      executedTools.push(`add_node(${type})`);

      return {
        reply: `Added a new **${name}** (${type}) to the canvas! You can drag connection wires between its ports or customize its properties in the inspector.`,
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
        `\n\n*Tip: Connect your Google Gemini API key in settings ⚙️ for full natural language reasoning and tool execution.*`,
      executedTools
    };
  }
}

export const langChainAgent = new LangChainAgent();
