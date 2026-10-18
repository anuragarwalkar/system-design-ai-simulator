/**
 * ==============================================================================
 * Modern In-App Modal Dialog & Toast System
 * ==============================================================================
 * Replaces native browser alert() and confirm() with non-blocking,
 * theme-aware modal dialogs and toast notifications.
 */

export function showConfirmModal({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false
} = {}) {
  return new Promise((resolve) => {
    // Remove any existing modal
    const existing = document.getElementById('custom-confirm-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-confirm-modal';
    overlay.className = 'custom-modal-overlay';

    overlay.innerHTML = `
      <div class="custom-modal-card">
        <div class="modal-icon-wrap ${isDanger ? 'danger' : 'info'}">
          ${isDanger
            ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
            : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`}
        </div>
        <div class="modal-content">
          <h3 class="modal-title">${title}</h3>
          <p class="modal-message">${message}</p>
        </div>
        <div class="modal-actions">
          <button id="modal-btn-cancel" class="modal-btn secondary">${cancelText}</button>
          <button id="modal-btn-confirm" class="modal-btn ${isDanger ? 'danger' : 'primary'}">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Trigger open animation
    requestAnimationFrame(() => overlay.classList.add('open'));

    const cleanup = (result) => {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
      window.removeEventListener('keydown', handleKey);
      resolve(result);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') cleanup(false);
      if (e.key === 'Enter') cleanup(true);
    };

    window.addEventListener('keydown', handleKey);

    overlay.querySelector('#modal-btn-cancel').addEventListener('click', () => cleanup(false));
    overlay.querySelector('#modal-btn-confirm').addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}

export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;

  const icon = type === 'success'
    ? '✓'
    : (type === 'error' ? '⚠️' : 'ℹ️');

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}
