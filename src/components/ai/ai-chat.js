/**
 * ==============================================================================
 * AI Architect Chat Drawer (LangChain Agent Integration)
 * ==============================================================================
 * Interactive chat interface enabling users to design entire distributed architectures
 * via natural language, execute tools, and configure custom API keys.
 */

import { langChainAgent } from '../../ai/langchain-agent.js';
import { eventBus } from '../../core/event-bus.js';
import { EVENTS } from '../../core/constants.js';
import { showToast } from '../ui/dialog.js';

export class AiChatPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.isOpen = false;
    this.render();
    this._bindEvents();
  }

  render() {
    const hasKey = !!langChainAgent.apiKey;

    this.container.innerHTML = `
      <div class="ai-drawer-overlay ${this.isOpen ? 'open' : ''}" id="ai-overlay"></div>
      <div class="ai-drawer ${this.isOpen ? 'open' : ''}" id="ai-drawer">
        <div class="ai-header">
          <div class="ai-header-left">
            <span class="ai-header-icon">✨</span>
            <div>
              <h3 class="ai-title">AI System Architect</h3>
              <p class="ai-subtitle">Powered by LangChain & WASM</p>
            </div>
          </div>
          <div class="ai-header-actions">
            <button id="btn-ai-settings" class="btn-icon-subtle" title="Configure Custom API Token / Model">⚙️</button>
            <button id="btn-close-ai" class="btn-icon-subtle" title="Close Panel">✕</button>
          </div>
        </div>

        <!-- Token Settings Modal / Accordion -->
        <div class="ai-settings-card" id="ai-settings-card" style="display: none;">
          <h4 class="settings-title">Custom LangChain API Configuration</h4>
          <p class="settings-desc">Provide your OpenAI API key or custom LLM endpoint. Token is stored securely in your browser's localStorage.</p>
          <div class="form-group">
            <label class="form-label">API Token / Key</label>
            <input type="password" id="input-api-key" class="form-input" placeholder="sk-..." value="${langChainAgent.apiKey}" />
          </div>
          <div class="form-group">
            <label class="form-label">Model</label>
            <input type="text" id="input-ai-model" class="form-input" placeholder="gpt-4o" value="${langChainAgent.modelName}" />
          </div>
          <div class="form-group">
            <label class="form-label">Custom Endpoint URL (Optional)</label>
            <input type="text" id="input-ai-endpoint" class="form-input" placeholder="https://api.openai.com/v1" value="${langChainAgent.endpoint}" />
          </div>
          <button id="btn-save-ai-settings" class="btn-primary-sm">Save Token</button>
        </div>

        <!-- Chat Stream -->
        <div class="ai-chat-body" id="ai-chat-body">
          <div class="ai-message assistant">
            <div class="message-bubble">
              👋 Hello! I'm your AI System Design Architect.
              <br><br>
              I can build distributed topologies for you on the canvas, inspect Single Points of Failure, and scale services to handle millions of requests.
              <br><br>
              Try clicking one of the suggestions below or type your requirements!
            </div>
          </div>
        </div>

        <!-- Suggested Quick Prompts -->
        <div class="ai-quick-prompts">
          <button class="quick-chip" data-prompt="Design a URL shortener like Bitly">Design URL Shortener</button>
          <button class="quick-chip" data-prompt="Design a video streaming service like Netflix">Design Streaming Service</button>
          <button class="quick-chip" data-prompt="Design a real-time chat application">Design Chat App</button>
          <button class="quick-chip" data-prompt="Analyze architecture and fix all SPOFs">Fix all SPOFs</button>
          <button class="quick-chip" data-prompt="Add a Redis cache before the database">Add Redis Cache</button>
        </div>

        <!-- Input Box -->
        <div class="ai-input-wrap">
          <textarea id="ai-prompt-input" class="ai-prompt-field" placeholder="Ask AI to design, scale, or optimize (e.g., 'Build a URL shortener')..." rows="2"></textarea>
          <button id="btn-send-prompt" class="btn-send-ai" title="Send prompt">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const overlay = this.container.querySelector('#ai-overlay');
    const closeBtn = this.container.querySelector('#btn-close-ai');
    const settingsBtn = this.container.querySelector('#btn-ai-settings');
    const settingsCard = this.container.querySelector('#ai-settings-card');
    const saveSettingsBtn = this.container.querySelector('#btn-save-ai-settings');
    const sendBtn = this.container.querySelector('#btn-send-prompt');
    const promptInput = this.container.querySelector('#ai-prompt-input');
    const quickChips = this.container.querySelectorAll('.quick-chip');

    // Toggle drawer from toolbar event
    eventBus.on(EVENTS.PANEL_TOGGLED, ({ panel }) => {
      if (panel === 'ai') {
        this.toggle();
      }
    });

    closeBtn.addEventListener('click', () => this.close());
    overlay.addEventListener('click', () => this.close());

    // Settings Toggle
    settingsBtn.addEventListener('click', () => {
      const isVisible = settingsCard.style.display !== 'none';
      settingsCard.style.display = isVisible ? 'none' : 'block';
    });

    saveSettingsBtn.addEventListener('click', () => {
      const key = this.container.querySelector('#input-api-key').value;
      const model = this.container.querySelector('#input-ai-model').value;
      const endpoint = this.container.querySelector('#input-ai-endpoint').value;

      langChainAgent.setApiKey(key);
      langChainAgent.setModel(model);
      langChainAgent.setEndpoint(endpoint);

      settingsCard.style.display = 'none';
      showToast('AI API configuration saved successfully!', 'success');
    });

    // Send on click
    sendBtn.addEventListener('click', () => this._sendCurrentPrompt());

    // Send on Enter (Shift+Enter for newline)
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._sendCurrentPrompt();
      }
    });

    // Quick Chips
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt');
        promptInput.value = text;
        this._sendCurrentPrompt();
      });
    });

    // Append AI messages to UI
    eventBus.on(EVENTS.AI_MESSAGE_ADDED, (msg) => {
      this._appendMessageToUi(msg.role, msg.content);
    });

    // Loading indicator
    eventBus.on(EVENTS.AI_STATUS_CHANGED, ({ isProcessing }) => {
      sendBtn.disabled = isProcessing;
      promptInput.disabled = isProcessing;
      sendBtn.style.opacity = isProcessing ? '0.5' : '1.0';
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const drawer = this.container.querySelector('#ai-drawer');
    const overlay = this.container.querySelector('#ai-overlay');
    if (drawer) drawer.classList.toggle('open', this.isOpen);
    if (overlay) overlay.classList.toggle('open', this.isOpen);
  }

  close() {
    this.isOpen = false;
    const drawer = this.container.querySelector('#ai-drawer');
    const overlay = this.container.querySelector('#ai-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  async _sendCurrentPrompt() {
    const input = this.container.querySelector('#ai-prompt-input');
    const text = input.value.trim();
    if (!text || langChainAgent.isProcessing) return;

    input.value = '';
    await langChainAgent.processMessage(text);
  }

  _appendMessageToUi(role, text) {
    const body = this.container.querySelector('#ai-chat-body');
    if (!body) return;

    const div = document.createElement('div');
    div.className = `ai-message ${role}`;

    // Simple markdown formatting for bold and lists
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ');

    div.innerHTML = `<div class="message-bubble">${formatted}</div>`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
}
