/**
 * ==============================================================================
 * AI Architect Chat Drawer (LangChain Agent Integration)
 * ==============================================================================
 * Interactive chat interface enabling users to design entire distributed architectures
 * via natural language, execute tools, and configure Google Gemini or OpenAI API keys.
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
    const isGemini = langChainAgent.provider === 'gemini';
    const hasKey = !!langChainAgent.apiKey;
    const badgeText = hasKey
      ? (isGemini ? `✨ Gemini (${langChainAgent.modelName})` : `⚡ OpenAI (${langChainAgent.modelName})`)
      : '⚙️ Built-In Model';

    this.container.innerHTML = `
      <div class="ai-drawer-overlay ${this.isOpen ? 'open' : ''}" id="ai-overlay"></div>
      <div class="ai-drawer ${this.isOpen ? 'open' : ''}" id="ai-drawer">
        <div class="ai-header">
          <div class="ai-header-left">
            <span class="ai-header-icon">✨</span>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 class="ai-title">AI System Architect</h3>
                <span class="provider-badge" id="ai-status-badge">${badgeText}</span>
              </div>
              <p class="ai-subtitle">Powered by Google Gemini, LangChain & WASM</p>
            </div>
          </div>
          <div class="ai-header-actions">
            <button id="btn-ai-settings" class="btn-icon-subtle" title="Configure Gemini / OpenAI API Settings">⚙️</button>
            <button id="btn-close-ai" class="btn-icon-subtle" title="Close Panel">✕</button>
          </div>
        </div>

        <!-- Token Settings Modal / Accordion -->
        <div class="ai-settings-card" id="ai-settings-card" style="display: none;">
          <h4 class="settings-title">AI Provider & API Configuration</h4>
          <p class="settings-desc">Configure your Google Gemini or OpenAI API key for live natural language architecture synthesis. Keys are stored locally in your browser.</p>

          <div class="form-group">
            <label class="form-label">AI Provider</label>
            <select id="select-ai-provider" class="form-select">
              <option value="gemini" ${isGemini ? 'selected' : ''}>Google Gemini API (Recommended)</option>
              <option value="openai" ${!isGemini ? 'selected' : ''}>OpenAI / Custom LLM (GPT-4o, Ollama)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>API Key / Token</span>
              <span id="key-help-wrap">
                ${isGemini ? '<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="color: var(--accent-primary); font-size: 11px; text-decoration: underline;">Get free Gemini Key ↗</a>' : ''}
              </span>
            </label>
            <input type="password" id="input-api-key" class="form-input" placeholder="${isGemini ? 'AIzaSy...' : 'sk-...'}" value="${langChainAgent.apiKey}" />
          </div>

          <div class="form-group">
            <label class="form-label">Model</label>
            <input type="text" id="input-ai-model" class="form-input" placeholder="${isGemini ? 'gemini-2.0-flash' : 'gpt-4o'}" value="${langChainAgent.modelName}" />
            <div class="model-chip-row" id="model-chips-container">
              ${isGemini
                ? `
                  <button type="button" class="model-chip ${langChainAgent.modelName === 'gemini-2.0-flash' ? 'active' : ''}" data-model="gemini-2.0-flash">gemini-2.0-flash</button>
                  <button type="button" class="model-chip ${langChainAgent.modelName === 'gemini-1.5-flash' ? 'active' : ''}" data-model="gemini-1.5-flash">gemini-1.5-flash</button>
                  <button type="button" class="model-chip ${langChainAgent.modelName === 'gemini-1.5-pro' ? 'active' : ''}" data-model="gemini-1.5-pro">gemini-1.5-pro</button>
                `
                : `
                  <button type="button" class="model-chip ${langChainAgent.modelName === 'gpt-4o' ? 'active' : ''}" data-model="gpt-4o">gpt-4o</button>
                  <button type="button" class="model-chip ${langChainAgent.modelName === 'gpt-4o-mini' ? 'active' : ''}" data-model="gpt-4o-mini">gpt-4o-mini</button>
                `
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">API Endpoint URL</label>
            <input type="text" id="input-ai-endpoint" class="form-input" placeholder="${isGemini ? 'https://generativelanguage.googleapis.com/v1beta' : 'https://api.openai.com/v1'}" value="${langChainAgent.endpoint}" />
          </div>

          <div class="settings-btn-row">
            <button id="btn-save-ai-settings" class="btn-primary-sm">Save Configuration</button>
            <button id="btn-test-ai-model" class="btn-test-sm" title="Test model connectivity and latency">
              <span class="btn-test-icon">⚡</span>
              <span class="btn-test-label">Test Model</span>
            </button>
            <button id="btn-clear-ai-settings" class="btn-secondary-sm">Use Built-In AI (Offline)</button>
          </div>
          <div id="ai-test-status" class="ai-test-status" style="display: none;"></div>
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
    const clearSettingsBtn = this.container.querySelector('#btn-clear-ai-settings');
    const providerSelect = this.container.querySelector('#select-ai-provider');
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

    // Provider Selector change
    if (providerSelect) {
      providerSelect.addEventListener('change', () => {
        const prov = providerSelect.value;
        const keyInput = this.container.querySelector('#input-api-key');
        const modelInput = this.container.querySelector('#input-ai-model');
        const endpointInput = this.container.querySelector('#input-ai-endpoint');
        const helpWrap = this.container.querySelector('#key-help-wrap');
        const chipsContainer = this.container.querySelector('#model-chips-container');

        if (prov === 'gemini') {
          keyInput.placeholder = 'AIzaSy...';
          modelInput.placeholder = 'gemini-2.0-flash';
          modelInput.value = 'gemini-2.0-flash';
          endpointInput.placeholder = 'https://generativelanguage.googleapis.com/v1beta';
          endpointInput.value = 'https://generativelanguage.googleapis.com/v1beta';
          if (helpWrap) {
            helpWrap.innerHTML = '<a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="color: var(--accent-primary); font-size: 11px; text-decoration: underline;">Get free Gemini Key ↗</a>';
          }
          if (chipsContainer) {
            chipsContainer.innerHTML = `
              <button type="button" class="model-chip active" data-model="gemini-2.0-flash">gemini-2.0-flash</button>
              <button type="button" class="model-chip" data-model="gemini-1.5-flash">gemini-1.5-flash</button>
              <button type="button" class="model-chip" data-model="gemini-1.5-pro">gemini-1.5-pro</button>
            `;
            this._bindModelChips();
          }
        } else {
          keyInput.placeholder = 'sk-...';
          modelInput.placeholder = 'gpt-4o';
          modelInput.value = 'gpt-4o';
          endpointInput.placeholder = 'https://api.openai.com/v1';
          endpointInput.value = 'https://api.openai.com/v1';
          if (helpWrap) helpWrap.innerHTML = '';
          if (chipsContainer) {
            chipsContainer.innerHTML = `
              <button type="button" class="model-chip active" data-model="gpt-4o">gpt-4o</button>
              <button type="button" class="model-chip" data-model="gpt-4o-mini">gpt-4o-mini</button>
            `;
            this._bindModelChips();
          }
        }
      });
    }

    this._bindModelChips();

    // Save Settings
    saveSettingsBtn.addEventListener('click', () => {
      const prov = this.container.querySelector('#select-ai-provider').value;
      const key = this.container.querySelector('#input-api-key').value;
      const model = this.container.querySelector('#input-ai-model').value;
      const endpoint = this.container.querySelector('#input-ai-endpoint').value;

      langChainAgent.setProvider(prov);
      langChainAgent.setApiKey(key);
      langChainAgent.setModel(model);
      langChainAgent.setEndpoint(endpoint);

      settingsCard.style.display = 'none';
      const badge = this.container.querySelector('#ai-status-badge');
      if (badge) {
        badge.textContent = key.trim()
          ? (prov === 'gemini' ? `✨ Gemini (${model})` : `⚡ OpenAI (${model})`)
          : '⚙️ Built-In Model';
      }
      showToast(`AI settings saved (${prov === 'gemini' ? 'Google Gemini' : 'OpenAI'})!`, 'success');
    });

    // Clear Settings (Revert to built-in offline)
    clearSettingsBtn.addEventListener('click', () => {
      langChainAgent.clearSettings();
      settingsCard.style.display = 'none';
      this.render();
      this._bindEvents();
      showToast('Reverted to Built-In AI Architect (Offline)', 'info');
    });

    // Test Model Connectivity
    const testModelBtn = this.container.querySelector('#btn-test-ai-model');
    const testStatusBox = this.container.querySelector('#ai-test-status');

    if (testModelBtn) {
      testModelBtn.addEventListener('click', async () => {
        const prov = this.container.querySelector('#select-ai-provider').value;
        const key = this.container.querySelector('#input-api-key').value;
        const model = this.container.querySelector('#input-ai-model').value;
        const endpoint = this.container.querySelector('#input-ai-endpoint').value;

        if (!key.trim()) {
          showToast('Please enter an API Key / Token before testing.', 'warning');
          this.container.querySelector('#input-api-key').focus();
          if (testStatusBox) {
            testStatusBox.className = 'ai-test-status error';
            testStatusBox.style.display = 'block';
            testStatusBox.innerHTML = `⚠️ <strong>Missing Key:</strong> Please enter your API key above to test connectivity.`;
          }
          return;
        }

        const originalHtml = testModelBtn.innerHTML;
        testModelBtn.disabled = true;
        testModelBtn.innerHTML = `<span class="btn-spinner"></span> <span>Testing...</span>`;

        if (testStatusBox) {
          testStatusBox.className = 'ai-test-status loading';
          testStatusBox.style.display = 'block';
          testStatusBox.innerHTML = `⏳ Testing connection to <strong>${prov === 'gemini' ? 'Google Gemini' : 'OpenAI'}</strong> (<code>${model}</code>)...`;
        }

        try {
          const res = await langChainAgent.testConnection({
            provider: prov,
            apiKey: key,
            modelName: model,
            endpoint: endpoint
          });

          if (testStatusBox) {
            testStatusBox.className = 'ai-test-status success';
            testStatusBox.style.display = 'block';
            testStatusBox.innerHTML = `✅ <strong>Connected (${res.latencyMs}ms):</strong> ${res.provider} <code>${res.model}</code> responded successfully!<br><small style="opacity: 0.85;">Sample reply: "${res.sampleReply}"</small>`;
          }
          showToast(`✓ ${res.provider} (${res.model}) test succeeded in ${res.latencyMs}ms!`, 'success');
        } catch (err) {
          console.error('[AI Test Error]', err);
          if (testStatusBox) {
            testStatusBox.className = 'ai-test-status error';
            testStatusBox.style.display = 'block';
            testStatusBox.innerHTML = `❌ <strong>Test Failed:</strong> ${err.message}`;
          }
          showToast(`Test failed: ${err.message}`, 'error');
        } finally {
          testModelBtn.disabled = false;
          testModelBtn.innerHTML = originalHtml;
        }
      });
    }

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

  _bindModelChips() {
    const modelInput = this.container.querySelector('#input-ai-model');
    const chips = this.container.querySelectorAll('.model-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const chosenModel = chip.getAttribute('data-model');
        if (modelInput) modelInput.value = chosenModel;
      });
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
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ');

    div.innerHTML = `<div class="message-bubble">${formatted}</div>`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
}
