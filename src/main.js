/**
 * ==============================================================================
 * Master Application Bootstrap (main.js)
 * ==============================================================================
 * Coordinates the initialization sequence:
 * 1. Instantiates WASM Bridge and Reactive State Store
 * 2. Starts 60FPS Canvas Render Engine
 * 3. Mounts Interaction Listeners (Drag-Drop, Wiring, Keyboard)
 * 4. Mounts UI Panels (Toolbar, Palette, Inspector, HUDs, AI Assistant)
 * 5. Loads initial demo architecture
 */

import { stateManager } from './core/state-manager.js';
import { CanvasRenderer } from './canvas/renderer.js';
import { DragDropEngine } from './interaction/drag-drop.js';
import { ConnectionHandler } from './interaction/connection.js';
import { KeyboardHandler } from './interaction/keyboard.js';

import { Toolbar } from './components/toolbar/toolbar.js';
import { MobileNav } from './components/toolbar/mobile-nav.js';
import { ComponentPalette } from './components/sidebar/component-palette.js';
import { ConfigPanel } from './components/config-panel/config-panel.js';
import { MetricsDashboard } from './components/simulation/metrics-dashboard.js';
import { LoadInjector } from './components/simulation/load-injector.js';
import { AiChatPanel } from './components/ai/ai-chat.js';
import { ArchitectureEvaluationPanel } from './components/ai/ai-evaluation.js';

async function bootstrap() {
  console.log('[App] Bootstrapping System Design AI Simulator...');

  // 1. Initialize State and WASM engine
  await stateManager.init();

  // 2. Setup Canvas Engine
  const canvasElement = document.getElementById('sim-canvas');
  const renderer = new CanvasRenderer(canvasElement);
  renderer.init();

  // 3. Setup Interaction Handlers
  const dragDropEngine = new DragDropEngine(renderer);
  new ConnectionHandler(renderer);
  new KeyboardHandler(dragDropEngine);

  // 4. Mount UI Components
  const headerContainer = document.getElementById('app-header');
  new Toolbar(headerContainer, renderer);

  const sidebarContainer = document.getElementById('app-sidebar');
  new ComponentPalette(sidebarContainer, renderer);

  const inspectorContainer = document.getElementById('app-inspector');
  new ConfigPanel(inspectorContainer);

  const metricsHudContainer = document.getElementById('metrics-hud');
  new MetricsDashboard(metricsHudContainer);

  const loadHudContainer = document.getElementById('load-hud');
  new LoadInjector(loadHudContainer);

  const aiPanelContainer = document.getElementById('ai-panel-container');
  new AiChatPanel(aiPanelContainer);

  const evalPanelContainer = document.getElementById('eval-panel-container');
  new ArchitectureEvaluationPanel(evalPanelContainer);

  const mobileNavContainer = document.getElementById('mobile-nav');
  if (mobileNavContainer) {
    new MobileNav(mobileNavContainer);
  }

  // 5. Start with a clean empty canvas by default
  renderer.camera.reset();

  console.log('[App] System Design AI Simulator successfully running at 60FPS with clean canvas.');
}

window.addEventListener('DOMContentLoaded', bootstrap);
