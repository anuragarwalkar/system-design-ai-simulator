/**
 * ==============================================================================
 * Beginner Concept Explainer Modal
 * ==============================================================================
 * Deep-dive educational modal that breaks down any system design component
 * with simple analogies, interview tips, trade-offs, and industry examples.
 */

import { COMPONENT_METADATA, COMPONENT_ICONS_SVG } from '../../core/constants.js';

export function showConceptModal(componentType, onAdd = null) {
  const meta = COMPONENT_METADATA[componentType];
  if (!meta) return;

  const concept = meta.concept || {
    analogy: 'Fundamental building block of distributed architecture.',
    whatItDoes: meta.description,
    whenToUse: 'General system design architecture.',
    keyTradeoffs: 'Capacity and latency limits.',
    interviewTip: 'Clarify throughput and latency requirements before choosing.',
    industryExamples: 'Industry standard implementations'
  };

  // Remove existing modal if open
  const existing = document.getElementById('concept-explainer-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'concept-explainer-modal';
  overlay.className = 'custom-modal-overlay';

  overlay.innerHTML = `
    <div class="custom-modal-card concept-modal-card">
      <div class="concept-modal-header">
        <div class="concept-header-left">
          <div class="component-icon-badge large" style="background: ${meta.accentBg}; color: ${meta.color};">
            ${COMPONENT_ICONS_SVG[componentType] || `<span class="component-dot" style="background: ${meta.color};"></span>`}
          </div>
          <div>
            <div class="concept-modal-title">${meta.name}</div>
            <span class="concept-modal-badge">${meta.badge}</span>
          </div>
        </div>
        <button id="modal-btn-close" class="btn-icon-close" title="Close">✕</button>
      </div>

      <div class="concept-modal-scroll">
        <!-- Real World Analogy -->
        <div class="concept-section-box analogy-box">
          <div class="concept-section-title">
            <span>💡</span> Real-World Analogy
          </div>
          <p class="concept-section-desc">"${concept.analogy}"</p>
        </div>

        <!-- What It Does -->
        <div class="concept-section-box">
          <div class="concept-section-title">
            <span>⚙️</span> What It Does
          </div>
          <p class="concept-section-desc">${concept.whatItDoes}</p>
        </div>

        <!-- When to Use -->
        <div class="concept-section-box">
          <div class="concept-section-title">
            <span>🚀</span> When to Use It
          </div>
          <p class="concept-section-desc">${concept.whenToUse}</p>
        </div>

        <!-- Trade-offs -->
        <div class="concept-section-box tradeoff-box">
          <div class="concept-section-title">
            <span>⚠️</span> Key Bottlenecks & Trade-offs
          </div>
          <p class="concept-section-desc">${concept.keyTradeoffs}</p>
        </div>

        <!-- Interview Tip -->
        <div class="concept-section-box interview-tip-box">
          <div class="concept-section-title">
            <span>🎯</span> System Design Interview Tip
          </div>
          <p class="concept-section-desc">${concept.interviewTip}</p>
        </div>

        <!-- Real World Examples -->
        <div class="concept-section-box examples-box">
          <div class="concept-section-title">
            <span>🏢</span> Common Industry Examples
          </div>
          <p class="concept-section-desc"><code>${concept.industryExamples}</code></p>
        </div>

        <!-- Specifications & Baseline -->
        <div class="concept-specs-grid">
          <div class="spec-card">
            <span class="spec-label">Default Capacity</span>
            <span class="spec-val">${meta.baseRps.toLocaleString()} rps</span>
          </div>
          <div class="spec-card">
            <span class="spec-label">Base Latency</span>
            <span class="spec-val">${meta.baseLatencyMs}ms</span>
          </div>
          <div class="spec-card">
            <span class="spec-label">Est. Cloud Cost</span>
            <span class="spec-val">$${(meta.hourlyCost * 730).toFixed(0)}/mo</span>
          </div>
        </div>
      </div>

      <div class="concept-modal-footer">
        <button id="modal-btn-dismiss" class="modal-btn secondary">Close</button>
        ${onAdd ? `<button id="modal-btn-add" class="modal-btn primary">Add to Canvas</button>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));

  const cleanup = () => {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 200);
    window.removeEventListener('keydown', handleKey);
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') cleanup();
  };

  window.addEventListener('keydown', handleKey);

  overlay.querySelector('#modal-btn-close').addEventListener('click', cleanup);
  overlay.querySelector('#modal-btn-dismiss').addEventListener('click', cleanup);
  
  const addBtn = overlay.querySelector('#modal-btn-add');
  if (addBtn && onAdd) {
    addBtn.addEventListener('click', () => {
      cleanup();
      onAdd(componentType);
    });
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cleanup();
  });
}
