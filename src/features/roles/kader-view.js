/**
 * SATENGKA PASUNG EWS — Kader View Controller (Bhupa' Bhabu') (ES6 Module)
 * Mengelola rendering kartu laporan masyarakat, form deteksi dini, dan status laporan kader.
 */

import { escapeHtml } from '../../utils/formatters.js';

/**
 * Membangun HTML kartu ringkasan laporan terbaru kader.
 * @param {Object} r 
 * @returns {string}
 */
export function buildKaderRecentReportCardHtml(r) {
  const isNew = r.status === 'NEW';
  const badgeClass = isNew
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-emerald-100 text-emerald-800 border-emerald-200';
  const badgeLabel = isNew ? '▲ Diproses' : '✓ Selesai';

  return `
    <div onclick="openReportDetail('${r.id}')" class="bg-white p-4 rounded-3xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between space-y-3 group">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center text-sm font-bold group-hover:scale-105 transition">
            <i class="fa-solid fa-hospital-user"></i>
          </div>
          <div>
            <h5 class="font-black text-slate-900 text-sm leading-tight group-hover:text-emerald-800 transition">${escapeHtml(r.patient_name_input)}</h5>
            <p class="text-[11px] text-slate-400 font-medium">${escapeHtml(r.report_number || '')}</p>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}">
          ${badgeLabel}
        </span>
      </div>

      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span class="truncate max-w-[180px]"><i class="fa-solid fa-location-dot text-emerald-600 mr-1"></i> ${escapeHtml(r.address_input || 'Desa Kokop')}</span>
        <span class="text-emerald-700 font-bold group-hover:translate-x-0.5 transition flex items-center space-x-1">
          <span>Lihat Detail</span>
          <i class="fa-solid fa-angle-right text-[9px]"></i>
        </span>
      </div>
    </div>
  `;
}

/**
 * Handler toggle opsi input "Lainnya" pada form laporan kader.
 */
export function toggleKaderOtherTypeInput() {
  if (typeof document === 'undefined') return;
  const selected = document.querySelector('input[name="kader_form_type"]:checked')?.value;
  const otherContainer = document.getElementById('kaderFormTypeOtherContainer');
  const otherInput = document.getElementById('kaderFormTypeOtherText');
  if (otherContainer) {
    if (selected === 'Lainnya') {
      otherContainer.classList.remove('hidden');
      if (otherInput) otherInput.focus();
    } else {
      otherContainer.classList.add('hidden');
    }
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.KaderView = {
    buildKaderRecentReportCardHtml,
    toggleKaderOtherTypeInput
  };
  window.toggleKaderOtherTypeInput = toggleKaderOtherTypeInput;
}
