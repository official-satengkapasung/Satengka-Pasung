/**
 * SATENGKA PASUNG EWS — Monitoring & Stepper Controller (ES6 Module)
 * Mengelola stopwatch penanganan kasus Siaga EWS, stepper visual respon 4 Pilar, dan sinkronisasi status kasus.
 */

import { formatStatusIndo } from '../../utils/formatters.js';

export let monitoringTimer = null;
export let monitoringStartTime = null;

/**
 * Memulai stopwatch penghitung waktu tanggap darurat evakuasi faskes (bebas NaN).
 * @param {string|number} [startTimeStr] 
 */
export function startMonitoringWatch(startTimeStr) {
  if (monitoringTimer) {
    clearInterval(monitoringTimer);
    monitoringTimer = null;
  }

  if (startTimeStr) {
    const parsed = Date.parse(startTimeStr);
    monitoringStartTime = (!isNaN(parsed) && parsed > 0) ? parsed : Date.now();
  } else if (!monitoringStartTime || isNaN(monitoringStartTime)) {
    monitoringStartTime = Date.now();
  }

  function updateWatch() {
    if (typeof document === 'undefined') return;
    const diffMs = Math.max(0, Date.now() - monitoringStartTime);
    const totalSec = Math.floor(diffMs / 1000);
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    const timerEl = document.getElementById('monStopwatchTimer');
    if (timerEl) timerEl.innerText = `${hrs}:${mins}:${secs}`;
  }

  updateWatch();
  monitoringTimer = setInterval(updateWatch, 1000);

  if (typeof window !== 'undefined') {
    window.monitoringTimer = monitoringTimer;
    window.monitoringStartTime = monitoringStartTime;
  }
}

/**
 * Memperbarui status stepper 4 Pilar (Nakes, Guru, Rato') pada tab Monitoring.
 * @param {Object} currentCase 
 */
export function updateMonitoringStepper(currentCase) {
  if (!currentCase || typeof document === 'undefined') return;

  const statusBadge = document.getElementById('monStatusBadge');
  if (statusBadge) {
    statusBadge.innerText = formatStatusIndo(currentCase.status);
    if (currentCase.status === 'READY_FOR_EVACUATION') {
      statusBadge.className = 'text-xl font-black text-emerald-600 badge-siaga mt-0.5';
    } else if (currentCase.status === 'COORDINATION') {
      statusBadge.className = 'text-xl font-black text-amber-600 badge-siaga mt-0.5';
    } else {
      statusBadge.className = 'text-xl font-black text-red-600 badge-siaga mt-0.5';
    }
  }

  const parts = currentCase.participants || [];
  const guruPart = parts.find(p => p.participant_role === 'GURU');
  const ratoPart = parts.find(p => p.participant_role === 'RATO');

  // Stepper Tokoh Agama (Ghuru / Kiai)
  const guruIcon = document.getElementById('monIconGuru');
  const guruText = document.getElementById('monTextGuru');
  if (guruPart && (guruPart.response === 'AGREE' || guruPart.response === 'SIAP' || guruPart.response === 'READY')) {
    if (guruIcon) {
      guruIcon.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
      guruIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
    }
    if (guruText) {
      guruText.className = 'text-emerald-700 font-medium';
      guruText.innerText = 'Siap membantu (Terkonfirmasi)';
    }
  } else if (guruPart && guruPart.response === 'NEED_TIME') {
    if (guruIcon) {
      guruIcon.className = 'w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse';
      guruIcon.innerHTML = '<i class="fa-solid fa-phone-volume"></i>';
    }
    if (guruText) {
      guruText.className = 'text-amber-700 font-semibold';
      guruText.innerText = 'Kiai Butuh Waktu (Sedang Mediasi Keluarga)';
    }
  } else {
    if (guruIcon) {
      guruIcon.className = 'w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
      guruIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
    }
    if (guruText) {
      guruText.className = 'text-slate-500 font-medium';
      guruText.innerText = 'Menunggu konfirmasi Kiai...';
    }
  }

  // Stepper Aparatur Desa (Rato' / Klebun)
  const ratoIcon = document.getElementById('monIconRato');
  const ratoText = document.getElementById('monTextRato');
  if (ratoPart && (ratoPart.response === 'READY' || ratoPart.response === 'SIAP' || ratoPart.response === 'AGREE')) {
    if (ratoIcon) {
      ratoIcon.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
      ratoIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
    }
    if (ratoText) {
      ratoText.className = 'text-emerald-700 font-medium';
      ratoText.innerText = 'Siap mengawal (Terkonfirmasi Linmas)';
    }
  } else {
    if (ratoIcon) {
      ratoIcon.className = 'w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse';
      ratoIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
    }
    if (ratoText) {
      ratoText.className = 'text-amber-600 font-medium';
      ratoText.innerText = 'Menunggu konfirmasi Kades...';
    }
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.NakesMonitoring = {
    startMonitoringWatch,
    updateMonitoringStepper
  };
  window.startMonitoringWatch = startMonitoringWatch;
  window.updateMonitoringStepper = updateMonitoringStepper;
}
