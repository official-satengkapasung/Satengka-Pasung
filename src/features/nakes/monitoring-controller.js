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

  const cleanRole = window.cleanRoleAccountName || (n => n);

  // Update Data Pasien di Header Monitoring
  const caseNumEl = document.getElementById('monCaseNumber');
  if (caseNumEl) caseNumEl.innerText = currentCase.case_number || ('#' + currentCase.id);

  const patNameEl = document.getElementById('monPatientName');
  if (patNameEl) patNameEl.innerText = currentCase.patient_name || 'Pasien Kokop';

  const patAddrEl = document.getElementById('monPatientAddress');
  if (patAddrEl) patAddrEl.innerText = `${currentCase.patient_address || currentCase.village_name || 'Desa Kokop'} — Kec. Kokop`;

  const patMetaEl = document.getElementById('monPatientMeta');
  if (patMetaEl) patMetaEl.innerText = `Pemantauan 4 Pilar Kasus ${currentCase.case_number || ''} • Desa ${currentCase.village_name || 'Kokop'}`;

  // Update Badge Status
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

  const parts = Array.isArray(currentCase.participants) ? currentCase.participants : [];
  const guruParts = parts.filter(p => p.participant_role === 'GURU');
  const ratoParts = parts.filter(p => p.participant_role === 'RATO');

  const hasAnyGuruAgreed = guruParts.some(p => p.response === 'AGREE' || p.response === 'SIAP' || p.response === 'READY');
  const hasAnyGuruNeedTime = guruParts.some(p => p.response === 'NEED_TIME');

  const hasAnyRatoReady = ratoParts.some(p => p.response === 'READY' || p.response === 'SIAP' || p.response === 'AGREE');

  // Stepper Tokoh Agama (Ghuru / Kiai)
  const guruIcon = document.getElementById('monIconGuru');
  const guruText = document.getElementById('monTextGuru');
  if (hasAnyGuruAgreed) {
    if (guruIcon) {
      guruIcon.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
      guruIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
    }
    if (guruText) {
      guruText.className = 'text-emerald-700 font-medium';
      guruText.innerText = 'Siap membantu (Terkonfirmasi Kiai)';
    }
  } else if (hasAnyGuruNeedTime) {
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
  if (hasAnyRatoReady) {
    if (ratoIcon) {
      ratoIcon.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
      ratoIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
    }
    if (ratoText) {
      ratoText.className = 'text-emerald-700 font-medium';
      ratoText.innerText = 'Siap mengawal (Terkonfirmasi Linmas & Desa)';
    }
  } else {
    if (ratoIcon) {
      ratoIcon.className = 'w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse';
      ratoIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
    }
    if (ratoText) {
      ratoText.className = 'text-amber-600 font-medium';
      ratoText.innerText = 'Menunggu konfirmasi Kades & Linmas...';
    }
  }

  // RENDER RINCIAN KESIAPAN SELURUH PARTICIPANT YANG DIPILIH OLEH NAKES
  const detailedListContainer = document.getElementById('monParticipantsDetailedList');
  if (detailedListContainer) {
    // 1. Kader Pelapor (Bhuppa' Babhu')
    const repPart = parts.find(p => p.participant_role === 'BHUPA');
    const repName = cleanRole(repPart?.name || currentCase.reporter_name || 'Kader Jiwa');
    const repPhone = repPart?.phone || currentCase.reporter_phone || '-';
    const cleanRepPhone = repPhone.replace(/\D/g, '').replace(/^0/, '62');

    let partCardsHtml = `
      <div class="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-2.5 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1.5 tracking-wider">
            <img src="./assets/icons/role_bhupa.png" class="w-4 h-4 object-contain inline-block" alt="Bhuppa'">
            Bhuppa' Babhu'
          </span>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ Terverifikasi
          </span>
        </div>
        <div>
          <p class="font-bold text-slate-900 text-xs truncate">${repName}</p>
          <p class="text-[11px] text-slate-500 font-mono">${repPhone}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">${currentCase.village_name || 'Desa Kokop'}</p>
        </div>
        ${cleanRepPhone && cleanRepPhone !== '-' ? `
          <a href="https://wa.me/${cleanRepPhone}?text=${encodeURIComponent('Halo ' + repName + ', koordinasi Puskesmas Kokop terkait evakuasi pasien ' + currentCase.patient_name)}" target="_blank"
            class="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-2xs">
            <i class="fa-brands fa-whatsapp text-xs"></i>
            <span>Chat Kader</span>
          </a>
        ` : ''}
      </div>
    `;

    // 2. Seluruh Tokoh Ghuru yang Dipilih Nakes
    const effectiveGurus = guruParts.length > 0 ? guruParts : [{
      name: 'Kiai H. Kholil',
      phone: '081234567892',
      village_name: currentCase.village_name || 'Desa Kokop',
      response: 'PENDING'
    }];

    effectiveGurus.forEach((g, idx) => {
      const gName = cleanRole(g.name || 'Ghuru');
      const gPhone = g.phone || '-';
      const cleanGPhone = gPhone.replace(/\D/g, '').replace(/^0/, '62');
      const isAgreed = g.response === 'AGREE' || g.response === 'SIAP' || g.response === 'READY';
      const isNeedTime = g.response === 'NEED_TIME';

      let badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
      let badgeText = 'Menunggu Konfirmasi';
      if (isAgreed) {
        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
        badgeText = '✓ Siap Dampingi';
      } else if (isNeedTime) {
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
        badgeText = '⏳ Butuh Waktu';
      }

      partCardsHtml += `
        <div class="p-3.5 rounded-2xl border ${isAgreed ? 'border-emerald-200 bg-emerald-50/30' : (isNeedTime ? 'border-amber-200 bg-amber-50/30' : 'border-teal-200 bg-teal-50/20')} flex flex-col justify-between space-y-2.5 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase text-teal-800 flex items-center gap-1.5 tracking-wider">
              <img src="./assets/icons/role_bhu-ghuru.png" class="w-4 h-4 object-contain inline-block" alt="Ghuru">
              Ghuru${effectiveGurus.length > 1 ? ' (' + (idx + 1) + ')' : ''}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border ${badgeClass}">
              ${badgeText}
            </span>
          </div>
          <div>
            <p class="font-bold text-slate-900 text-xs truncate">${gName}</p>
            <p class="text-[11px] text-slate-500 font-mono">${gPhone}</p>
            ${g.note || g.response_note ? `<p class="text-[10px] text-amber-800 bg-amber-50 p-1 rounded-md border border-amber-100 mt-1 italic">"${g.note || g.response_note}"</p>` : ''}
          </div>
          ${cleanGPhone && cleanGPhone !== '-' ? `
            <a href="https://wa.me/${cleanGPhone}?text=${encodeURIComponent('Assalamualaikum ' + gName + ', koordinasi Puskesmas Kokop terkait pendampingan pasien ' + currentCase.patient_name)}" target="_blank"
              class="w-full py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-2xs">
              <i class="fa-brands fa-whatsapp text-xs"></i>
              <span>Hubungi Kiai</span>
            </a>
          ` : ''}
        </div>
      `;
    });

    // 3. Seluruh Tokoh Rato yang Dipilih Nakes
    const effectiveRatos = ratoParts.length > 0 ? ratoParts : [{
      name: 'Klebun Kokop',
      phone: '081234567893',
      village_name: currentCase.village_name || 'Desa Kokop',
      response: 'PENDING'
    }];

    effectiveRatos.forEach((r, idx) => {
      const rName = cleanRole(r.name || 'Rato');
      const rPhone = r.phone || '-';
      const cleanRPhone = rPhone.replace(/\D/g, '').replace(/^0/, '62');
      const isReady = r.response === 'READY' || r.response === 'SIAP' || r.response === 'AGREE';

      let badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
      let badgeText = 'Menunggu Linmas';
      if (isReady) {
        badgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200 font-bold';
        badgeText = '✓ Siap Kawal';
      }

      partCardsHtml += `
        <div class="p-3.5 rounded-2xl border ${isReady ? 'border-indigo-200 bg-indigo-50/30' : 'border-indigo-100 bg-white'} flex flex-col justify-between space-y-2.5 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase text-indigo-800 flex items-center gap-1.5 tracking-wider">
              <img src="./assets/icons/role_rato.png" class="w-4 h-4 object-contain inline-block" alt="Rato">
              Rato${effectiveRatos.length > 1 ? ' (' + (idx + 1) + ')' : ''}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border ${badgeClass}">
              ${badgeText}
            </span>
          </div>
          <div>
            <p class="font-bold text-slate-900 text-xs truncate">${rName}</p>
            <p class="text-[11px] text-slate-500 font-mono">${rPhone}</p>
            ${r.note || r.response_note ? `<p class="text-[10px] text-indigo-800 bg-indigo-50 p-1 rounded-md border border-indigo-100 mt-1 italic">"${r.note || r.response_note}"</p>` : ''}
          </div>
          ${cleanRPhone && cleanRPhone !== '-' ? `
            <a href="https://wa.me/${cleanRPhone}?text=${encodeURIComponent('Halo ' + rName + ', koordinasi Puskesmas Kokop terkait pengamanan evakuasi pasien ' + currentCase.patient_name)}" target="_blank"
              class="w-full py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-2xs">
              <i class="fa-brands fa-whatsapp text-xs"></i>
              <span>Hubungi Rato</span>
            </a>
          ` : ''}
        </div>
      `;
    });

    // 4. Tim Nakes / Faskes
    partCardsHtml += `
      <div class="p-3.5 rounded-2xl border border-sky-200 bg-sky-50/30 flex flex-col justify-between space-y-2.5 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase text-sky-800 flex items-center gap-1.5 tracking-wider">
            <i class="fa-solid fa-truck-medical text-sky-600"></i>
            Puskesmas Kokop
          </span>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            ✓ Ambulans Siaga
          </span>
        </div>
        <div>
          <p class="font-bold text-slate-900 text-xs truncate">Tim Evakuasi Medis</p>
          <p class="text-[11px] text-slate-500 font-mono">081234567890</p>
          <p class="text-[10px] text-sky-600 mt-0.5">Kecamatan Kokop</p>
        </div>
        <a href="https://wa.me/6281234567890?text=${encodeURIComponent('Halo Tim Puskesmas Kokop, koordinasi evakuasi medis pasien ' + currentCase.patient_name)}" target="_blank"
          class="w-full py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-2xs">
          <i class="fa-brands fa-whatsapp text-xs"></i>
          <span>Hubungi Nakes</span>
        </a>
      </div>
    `;

    detailedListContainer.innerHTML = partCardsHtml;

    const countBadge = document.getElementById('monParticipantsCountBadge');
    if (countBadge) {
      const totalPilar = 1 + effectiveGurus.length + effectiveRatos.length + 1;
      countBadge.innerText = `${totalPilar} Partisipan Siaga`;
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
