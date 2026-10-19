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
import { OnboardingTutorial } from './components/ui/onboarding.js';
import { showToast } from './components/ui/dialog.js';

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
  if (loadHudContainer) {
    new LoadInjector(loadHudContainer);
  }

  const aiPanelContainer = document.getElementById('ai-panel-container');
  new AiChatPanel(aiPanelContainer);

  const evalPanelContainer = document.getElementById('eval-panel-container');
  new ArchitectureEvaluationPanel(evalPanelContainer);

  const mobileNavContainer = document.getElementById('mobile-nav');
  if (mobileNavContainer) {
    new MobileNav(mobileNavContainer);
  }

  // 5. Initialize Beginner Onboarding Tutorial
  const onboarding = new OnboardingTutorial(renderer);
  window.appOnboarding = onboarding;

  // 6. Restore previous architecture or show clean canvas / onboarding
  const restored = stateManager.restoreFromLocalStorage();
  if (restored) {
    setTimeout(() => {
      renderer.camera.fitToContent(stateManager.nodes);
    }, 120);
    showToast('Restored your previous architecture', 'info', 3000);
  } else {
    renderer.camera.reset();
    // Launch onboarding for first-time visitors
    setTimeout(() => {
      onboarding.show();
    }, 400);
  }

  console.log('[App] System Design AI Simulator successfully running at 60FPS.');
}

window.addEventListener('DOMContentLoaded', bootstrap);
