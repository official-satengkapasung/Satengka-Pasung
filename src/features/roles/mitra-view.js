/**
 * SATENGKA PASUNG EWS — Mitra View Controller (Ghuru & Rato') (ES6 Module)
 * Mengelola kartu permintaan pendampingan Ghuru (Kiai) & Rato' (Kades/Klebun),
 * konfirmasi respon partisipan, dan riwayat pendampingan faskes.
 */

import { formatParticipantResponseIndo } from '../../utils/formatters.js';

/**
 * Render kartu permintaan pendampingan medis untuk Tokoh Agama (Ghuru / Kiai).
 * @param {Array} cases 
 * @param {Object} [options]
 */
export function buildGuruCardHtml(c, isAgreed, isNeedTime) {
  let cardBgClass = 'bg-white/95 border-red-200/90 shadow-sm';
  let badgeColor = 'text-red-700 bg-red-100 border-red-200';
  let iconHtml = '<i class="fa-solid fa-bell"></i>';
  let badgeLabel = 'Laporan Butuh Pendampingan';

  if (isAgreed) {
    cardBgClass = 'bg-emerald-50/50 border-emerald-300 shadow-sm ring-1 ring-emerald-300/60';
    badgeColor = 'text-emerald-800 bg-emerald-100 border-emerald-300';
    iconHtml = '<i class="fa-solid fa-circle-check text-emerald-600"></i>';
    badgeLabel = '✓ Terkonfirmasi Siap';
  } else if (isNeedTime) {
    cardBgClass = 'bg-amber-50/50 border-amber-300 shadow-sm';
    badgeColor = 'text-amber-800 bg-amber-100 border-amber-300';
    iconHtml = '<i class="fa-solid fa-clock"></i>';
    badgeLabel = 'Sedang Mediasi Keluarga';
  }

  return `
    <div class="${cardBgClass} backdrop-blur-md p-5 rounded-3xl border space-y-3.5 hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black border ${badgeColor}">
          <span>${iconHtml}</span>
          <span>${badgeLabel}</span>
        </div>
        <button onclick="openGuruDetailScreen('${c.id}')" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1 shadow-xs transition">
          <span>Detail</span>
          <i class="fa-solid fa-angle-right text-[10px]"></i>
        </button>
      </div>

      <div>
        <h4 class="font-black text-base text-slate-900">${c.patient_name}</h4>
        <p class="text-xs text-slate-500 font-medium">${c.patient_address || c.village_name || 'Desa Kokop'}</p>
      </div>

      <p class="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
        Laporan butuh pendampingan dari Puskesmas Kokop untuk penanganan medis warga.
      </p>

      <div class="space-y-2 pt-1">
        ${isAgreed ? `
          <button disabled class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-default opacity-95">
            <i class="fa-solid fa-circle-check text-sm"></i>
            <span>✓ Sudah Konfirmasi Siap Dampingi</span>
          </button>
        ` : `
          <button onclick="mobileGuruRespond('${c.id}', 'AGREE')" class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center transition">
            Saya Siap Membantu
          </button>
          <button onclick="mobileGuruRespond('${c.id}', 'NEED_TIME')" class="w-full py-2.5 rounded-xl border ${isNeedTime ? 'border-amber-500 bg-amber-100 text-amber-900 font-black ring-2 ring-amber-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'} font-bold text-xs flex items-center justify-center space-x-1.5 transition">
            <i class="fa-solid fa-phone mr-1"></i>
            <span>${isNeedTime ? '⏳ Sedang Mediasi / Butuh Waktu' : 'Saya Butuh Waktu / Hubungi Dahulu'}</span>
          </button>
        `}
      </div>
    </div>
  `;
}

/**
 * Render kartu permintaan pengawalan aparat desa untuk Kepala Desa (Rato' / Klebun).
 * @param {Object} c
 * @param {boolean} isReady
 */
export function buildRatoCardHtml(c, isReady) {
  return `
    <div class="bg-white/95 backdrop-blur-md p-5 rounded-3xl border ${isReady ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-300/60' : 'border-red-200/90'} space-y-3.5 shadow-sm hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black border ${isReady ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-700 border-red-200'}">
          <i class="fa-solid ${isReady ? 'fa-circle-check text-emerald-600' : 'fa-shield'}"></i>
          <span>${isReady ? '✓ Terkonfirmasi Siap' : 'Laporan Butuh Pengawalan'}</span>
        </div>
        <button onclick="openRatoDetailScreen('${c.id}')" class="text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center space-x-1 shadow-xs transition">
          <span>Detail</span>
          <i class="fa-solid fa-angle-right text-[10px]"></i>
        </button>
      </div>

      <div>
        <h4 class="font-black text-base text-slate-900">${c.patient_name}</h4>
        <p class="text-xs text-slate-500 font-medium">${c.patient_address || c.village_name || 'Desa Kokop'}</p>
      </div>

      <p class="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
        Laporan butuh pendampingan pengawalan aparat desa dan Linmas untuk penanganan medis warga.
      </p>

      <div class="pt-1">
        ${isReady ? `
          <button disabled class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-default opacity-95">
            <i class="fa-solid fa-circle-check text-sm"></i>
            <span>✓ Sudah Konfirmasi Siap Kawal</span>
          </button>
        ` : `
          <button onclick="mobileRatoRespond('${c.id}', 'READY')" class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center transition">
            Siap Mengawal
          </button>
        `}
      </div>
    </div>
  `;
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.MitraView = {
    buildGuruCardHtml,
    buildRatoCardHtml
  };
}
