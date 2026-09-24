/**
 * SATENGKA PASUNG — Tanjung Bumi Batik Custom Notification & Dialog System
 * Ornamen Estetika Batik Gentongan Pesisir Tanjung Bumi, Bangkalan, Madura.
 * Menyediakan Toast Melayang Mewah & Modal Konfirmasi Berornamen Canting Tradisional.
 */

import { escapeHtml } from '../../utils/formatters.js';

let tanjungBumiToastTimeout = null;

// Motif Batik Gentongan SVG Pattern Generator
const BATIK_CORNER_ORNAMENT = `
<svg class="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 0C70 0 50 20 50 50C50 80 20 100 0 100H100V0Z" fill="currentColor"/>
  <circle cx="75" cy="25" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="2 2"/>
  <circle cx="75" cy="25" r="3" fill="currentColor"/>
  <path d="M100 40C85 40 70 55 70 70C70 85 55 100 40 100" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M100 65C90 65 80 75 80 85C80 95 75 100 70 100" stroke="currentColor" stroke-width="1"/>
</svg>
`;

const BATIK_BORDER_PATTERN = `
<div class="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#d99b26] via-[#a82b25] to-[#152b4d] opacity-90 rounded-b-2xl"></div>
`;

/**
 * Menampilkan Toast Notifikasi Khusus Batik Tanjung Bumi
 * @param {string} message Pesan yang disampaikan
 * @param {'success'|'danger'|'warning'|'info'} [type='success']
 * @param {number} [duration=3500] Durasi tayang (ms)
 */
export function showToast(message, type = 'success', duration = 3500) {
  if (typeof document === 'undefined') return;

  let container = document.getElementById('tanjungBumiToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tanjungBumiToastContainer';
    container.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] flex flex-col items-center space-y-3 pointer-events-none max-w-md w-[90vw] sm:w-full px-4';
    document.body.appendChild(container);
  } else {
    // Pastikan posisi selalu di tengah layar
    container.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] flex flex-col items-center space-y-3 pointer-events-none max-w-md w-[90vw] sm:w-full px-4';
  }

  // Konfigurasi Ikon & Aksen Kartu Toast Satengka Pasung
  let theme = {
    border: 'border-white/30',
    icon: 'fa-solid fa-circle-check text-emerald-200',
    iconBg: 'bg-emerald-500/25 border-emerald-300/40',
    glow: 'shadow-[0_16px_40px_-5px_rgba(18,88,97,0.55)]'
  };

  if (type === 'danger') {
    theme = {
      border: 'border-rose-300/50',
      icon: 'fa-solid fa-circle-xmark text-rose-200',
      iconBg: 'bg-rose-500/30 border-rose-300/50',
      glow: 'shadow-[0_16px_40px_-5px_rgba(180,35,24,0.55)]'
    };
  } else if (type === 'warning') {
    theme = {
      border: 'border-amber-300/50',
      icon: 'fa-solid fa-triangle-exclamation text-amber-200',
      iconBg: 'bg-amber-500/30 border-amber-300/50',
      glow: 'shadow-[0_16px_40px_-5px_rgba(202,138,4,0.55)]'
    };
  } else if (type === 'info') {
    theme = {
      border: 'border-cyan-200/50',
      icon: 'fa-solid fa-circle-info text-cyan-200',
      iconBg: 'bg-cyan-500/30 border-cyan-300/50',
      glow: 'shadow-[0_16px_40px_-5px_rgba(8,145,178,0.55)]'
    };
  }

  const toastCard = document.createElement('div');
  toastCard.className = `relative pointer-events-auto overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl border ${theme.border} ${theme.glow} text-white transition-all duration-400 transform scale-95 opacity-0 shadow-2xl backdrop-blur-md w-full`;
  toastCard.style.backgroundImage = `url('assets/background_opt.webp')`;
  toastCard.style.backgroundPosition = 'center';
  toastCard.style.backgroundSize = 'cover';
  toastCard.style.backgroundRepeat = 'no-repeat';

  const toastOverlay = type === 'danger' ? 'bg-[#4a1210]/90' : (type === 'warning' ? 'bg-[#5c3e09]/90' : 'bg-[#0f3d43]/90');

  toastCard.innerHTML = `
    <div class="absolute inset-0 ${toastOverlay} backdrop-blur-xs"></div>
    <div class="relative z-10 flex items-center gap-3.5">
      <div class="w-10 h-10 rounded-2xl ${theme.iconBg} border flex items-center justify-center shrink-0 shadow-sm">
        <i class="${theme.icon} text-lg"></i>
      </div>
      <div class="flex-1 min-w-0 pr-1">
        <p class="text-sm sm:text-base font-bold leading-snug text-white drop-shadow-md">${escapeHtml(message)}</p>
      </div>
      <button type="button" class="text-white/70 hover:text-white transition shrink-0 p-1.5 text-base cursor-pointer" onclick="this.closest('.relative').remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `;

  container.appendChild(toastCard);

  // Animasi masuk halus
  requestAnimationFrame(() => {
    toastCard.classList.remove('scale-95', 'opacity-0');
    toastCard.classList.add('scale-100', 'opacity-100');
  });

  // Otomatis hilang
  setTimeout(() => {
    toastCard.classList.remove('scale-100', 'opacity-100');
    toastCard.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      if (toastCard.parentNode) toastCard.remove();
    }, 400);
  }, duration);
}

/**
 * Menampilkan Modal Dialog Konfirmasi Custom Khas Batik Tanjung Bumi
 * Menggantikan dialog confirm() standar browser.
 */
export function showBatikConfirm({
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = false,
  onConfirm = () => {}
}) {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('tanjungBumiConfirmModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'tanjungBumiConfirmModal';
  modal.className = 'fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 opacity-0';

  const themeBorder = isDanger ? 'border-rose-300' : 'border-teal-300';
  const overlayBg = isDanger ? 'bg-gradient-to-r from-[#4a1210]/95 to-[#7f1d1d]/90' : 'bg-gradient-to-r from-[#104349]/95 to-[#16565e]/90';
  const confirmBtnBg = isDanger ? 'bg-gradient-to-r from-[#991b1b] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#dc2626] border-red-400/40 text-white' : 'bg-gradient-to-r from-[#178a91] to-[#126b70] hover:from-[#1a9ca4] hover:to-[#178a91] border-teal-300/40 text-white';

  modal.innerHTML = `
    <div class="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 ${themeBorder} transform scale-95 transition-transform duration-300">
      
      <!-- Header berlatar background_opt.webp -->
      <div class="relative p-5 text-white overflow-hidden" style="background-image: url('assets/background_opt.webp'); background-size: cover; background-position: center;">
        <div class="absolute inset-0 ${overlayBg} backdrop-blur-xs"></div>
        <div class="relative z-10 flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner text-amber-300 shrink-0">
            <i class="${isDanger ? 'fa-solid fa-triangle-exclamation text-rose-200' : 'fa-solid fa-circle-question text-teal-200'} text-xl"></i>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-black text-base sm:text-lg leading-tight text-white drop-shadow-sm">${escapeHtml(title)}</h3>
          </div>
        </div>
      </div>

      <!-- Isi Pesan Dialog -->
      <div class="p-5 sm:p-6 space-y-4 text-slate-700">
        <p class="text-xs sm:text-sm leading-relaxed">${message}</p>

        <!-- Tombol Aksi -->
        <div class="pt-2 flex items-center justify-end gap-2.5">
          <button type="button" id="btnBatikCancel" class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer">
            ${escapeHtml(cancelText)}
          </button>
          <button type="button" id="btnBatikConfirm" class="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md border transition cursor-pointer flex items-center gap-1.5 ${confirmBtnBg}">
            <i class="${isDanger ? 'fa-solid fa-trash-can' : 'fa-solid fa-check'}"></i>
            <span>${escapeHtml(confirmText)}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Animasi Masuk
  requestAnimationFrame(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    const box = modal.querySelector('.relative.bg-white');
    if (box) {
      box.classList.remove('scale-95');
      box.classList.add('scale-100');
    }
  });

  function closeModal() {
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.remove(), 250);
  }

  modal.querySelector('#btnBatikCancel').addEventListener('click', closeModal);
  modal.querySelector('#btnBatikConfirm').addEventListener('click', async () => {
    closeModal();
    if (typeof onConfirm === 'function') {
      await onConfirm();
    }
  });
}

// 🛡️ Global Scope Preservation & Native Alert Overrider (Batik Tanjung Bumi)
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.showBatikConfirm = showBatikConfirm;

  // Menggantikan seluruh pop-up native browser alert() menjadi Toast Batik Tanjung Bumi
  window.alert = function(msg) {
    if (!msg) return;
    const str = String(msg);
    const isDanger = /gagal|error|salah|tolak|hapus|melebihi/i.test(str);
    const isWarning = /mohon|periksa|pilih|minimal|kosong/i.test(str);
    const isInfo = /waktu|tunda|proses/i.test(str);
    const toastType = isDanger ? 'danger' : (isWarning ? 'warning' : (isInfo ? 'info' : 'success'));
    showToast(str, toastType, 4500);
  };
}
