/**
 * SATENGKA PASUNG EWS — Toast Notification Component (ES6 Module)
 * Menyediakan notifikasi melayang dengan gaya visual dinamis dan perlindungan XSS.
 */

import { escapeHtml } from '../../utils/formatters.js';

let toastTimeout = null;

/**
 * Menampilkan pesan toast melayang di pojok layar.
 * @param {string} message 
 * @param {'success'|'info'|'warning'|'danger'} [type='success']
 * @param {number} [duration=3000] 
 */
export function showToast(message, type = 'success', duration = 3000) {
  if (typeof document === 'undefined') return;

  let toast = document.getElementById('appToastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToastNotification';
    document.body.appendChild(toast);
  }

  const isSuccess = type === 'success';
  const isDanger = type === 'danger';
  const isWarning = type === 'warning';

  let bgClass = 'bg-emerald-800 text-white';
  let iconClass = 'fa-solid fa-circle-check text-emerald-300';

  if (isDanger) {
    bgClass = 'bg-rose-800 text-white';
    iconClass = 'fa-solid fa-circle-exclamation text-rose-300';
  } else if (isWarning) {
    bgClass = 'bg-amber-800 text-white';
    iconClass = 'fa-solid fa-triangle-exclamation text-amber-300';
  } else if (!isSuccess) {
    bgClass = 'bg-slate-900 text-white';
    iconClass = 'fa-solid fa-circle-info text-cyan-300';
  }

  toast.className = `fixed bottom-5 right-5 z-[9999] px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-2 max-w-sm ${bgClass}`;
  toast.innerHTML = `<i class="${iconClass} text-base"></i> <span>${escapeHtml(message)}</span>`;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-10', 'opacity-0');
  }, duration);
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
