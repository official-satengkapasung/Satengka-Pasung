/**
 * SATENGKA PASUNG EWS — Mitra View Controller (Ghuru & Rato') (ES6 Module)
 * Mengelola kartu permintaan pendampingan Ghuru (Kiai) & Rato' (Kades/Klebun),
 * konfirmasi respon partisipan, modal mediasi butuh waktu, mini map, dan riwayat pendampingan faskes.
 */

let mGuruMapInstance = null;
let mRatoMapInstance = null;

// Search & Pagination Ghuru & Rato
export function handleGuruSearchFilter() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('guruSearchInput');
  const pState = window.paginationState?.guruRequests;
  if (pState) {
    pState.query = input ? input.value.trim().toLowerCase() : '';
    pState.page = 1;
  }
  renderGuruMobileRequests(window.currentCases || []);
}

export function changeGuruPage(page) {
  const pState = window.paginationState?.guruRequests;
  if (pState) pState.page = page;
  renderGuruMobileRequests(window.currentCases || []);
}

export function handleGuruRiwayatSearchFilter() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('guruRiwayatSearchInput');
  const pState = window.paginationState?.guruRiwayat;
  if (pState) {
    pState.query = input ? input.value.trim().toLowerCase() : '';
    pState.page = 1;
  }
  renderGuruRiwayatList();
}

export function changeGuruRiwayatPage(page) {
  const pState = window.paginationState?.guruRiwayat;
  if (pState) pState.page = page;
  renderGuruRiwayatList();
}

export function handleRatoSearchFilter() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('ratoSearchInput');
  const pState = window.paginationState?.ratoRequests;
  if (pState) {
    pState.query = input ? input.value.trim().toLowerCase() : '';
    pState.page = 1;
  }
  renderRatoMobileRequests(window.currentCases || []);
}

export function changeRatoPage(page) {
  const pState = window.paginationState?.ratoRequests;
  if (pState) pState.page = page;
  renderRatoMobileRequests(window.currentCases || []);
}

export function handleRatoRiwayatSearchFilter() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('ratoRiwayatSearchInput');
  const pState = window.paginationState?.ratoRiwayat;
  if (pState) {
    pState.query = input ? input.value.trim().toLowerCase() : '';
    pState.page = 1;
  }
  renderRatoRiwayatList();
}

export function changeRatoRiwayatPage(page) {
  const pState = window.paginationState?.ratoRiwayat;
  if (pState) pState.page = page;
  renderRatoRiwayatList();
}

export function renderGuruMobileRequests(cases) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('guruRequestsContainer');
  const pagContainer = document.getElementById('guruPaginationContainer');
  if (!container) return;

  const pState = window.paginationState?.guruRequests || { page: 1, perPage: 4, query: '' };
  const active = (cases || []).filter(c => c.status === 'SIAGA' || c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION');
  const q = pState.query || '';
  const filtered = q
    ? active.filter(c => (c.patient_name || '').toLowerCase().includes(q) || (c.patient_address || '').toLowerCase().includes(q) || (c.village_name || '').toLowerCase().includes(q))
    : active;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-500 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm">Tidak ada laporan yang membutuhkan pendampingan saat ini.</div>`;
    if (pagContainer) pagContainer.innerHTML = '';
    return;
  }

  const totalItems = filtered.length;
  const perPage = pState.perPage;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  if (pState.page > totalPages) pState.page = totalPages;

  const start = (pState.page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  container.innerHTML = paged.map(c => {
    const myPart = c.participants ? c.participants.find(p => p.participant_role === 'GURU') : null;
    const isAgreed = myPart && (myPart.response === 'AGREE' || myPart.response === 'SIAP' || myPart.response === 'READY');
    const isNeedTime = myPart && myPart.response === 'NEED_TIME';

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
  }).join('');

  if (window.renderPaginationControls) {
    window.renderPaginationControls({
      containerId: 'guruPaginationContainer',
      totalItems: totalItems,
      currentPage: pState.page,
      perPage: perPage,
      onPageChangeName: 'changeGuruPage',
      entityName: 'laporan'
    });
  }
}

export function renderRatoMobileRequests(cases) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('ratoRequestsContainer');
  const pagContainer = document.getElementById('ratoPaginationContainer');
  if (!container) return;

  const pState = window.paginationState?.ratoRequests || { page: 1, perPage: 4, query: '' };
  const active = (cases || []).filter(c => c.status === 'SIAGA' || c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION');
  const q = pState.query || '';
  const filtered = q
    ? active.filter(c => (c.patient_name || '').toLowerCase().includes(q) || (c.patient_address || '').toLowerCase().includes(q) || (c.village_name || '').toLowerCase().includes(q))
    : active;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-500 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm">Tidak ada laporan yang membutuhkan pengawalan saat ini.</div>`;
    if (pagContainer) pagContainer.innerHTML = '';
    return;
  }

  const totalItems = filtered.length;
  const perPage = pState.perPage;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  if (pState.page > totalPages) pState.page = totalPages;

  const start = (pState.page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  container.innerHTML = paged.map(c => {
    const myPart = c.participants ? c.participants.find(p => p.participant_role === 'RATO') : null;
    const isReady = myPart && (myPart.response === 'READY' || myPart.response === 'AGREE' || myPart.response === 'SIAP');

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
  }).join('');

  if (window.renderPaginationControls) {
    window.renderPaginationControls({
      containerId: 'ratoPaginationContainer',
      totalItems: totalItems,
      currentPage: pState.page,
      perPage: perPage,
      onPageChangeName: 'changeRatoPage',
      entityName: 'laporan'
    });
  }
}

export function openGuruDetailScreen(caseId) {
  if (typeof document === 'undefined') return;
  const currentCases = window.currentCases || [];
  const targetCase = currentCases.find(c => String(c.id) === String(caseId) || (c.case_number && c.case_number === caseId));
  if (!targetCase) return;

  const guruRiwayat = document.getElementById('mobileGuruSubRiwayat');
  if (guruRiwayat) guruRiwayat.classList.add('hidden');
  document.getElementById('mobileScreenGuru')?.classList.add('hidden');
  document.getElementById('mobileGuruSubDetail')?.classList.remove('hidden');

  document.getElementById('mGuruDetailName').innerText = targetCase.patient_name;
  document.getElementById('mGuruDetailAddress').innerText = (targetCase.patient_address || targetCase.village_name || 'Desa Kokop') + ' — Kec. Kokop';
  const formatStatus = window.formatStatusIndo || (s => s);
  document.getElementById('mGuruDetailBadge').innerText = formatStatus(targetCase.status);

  const myPart = targetCase.participants ? targetCase.participants.find(p => p.participant_role === 'GURU') : null;
  const isAgreed = myPart && (myPart.response === 'AGREE' || myPart.response === 'SIAP' || myPart.response === 'READY');
  const isNeedTime = myPart && myPart.response === 'NEED_TIME';

  const actionContainer = document.getElementById('mGuruDetailActionBtns');
  if (actionContainer) {
    actionContainer.innerHTML = isAgreed ? `
      <button disabled class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5 cursor-default opacity-95">
        <i class="fa-solid fa-circle-check text-sm"></i>
        <span>✓ Sudah Konfirmasi Siap Dampingi</span>
      </button>
    ` : `
      <button onclick="mobileGuruRespond('${targetCase.id}', 'AGREE'); closeGuruDetailScreen();" class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow flex items-center justify-center transition">
        Saya Siap Membantu
      </button>
      <button onclick="mobileGuruRespond('${targetCase.id}', 'NEED_TIME'); closeGuruDetailScreen();" class="w-full py-2.5 rounded-xl border ${isNeedTime ? 'border-amber-500 bg-amber-100 text-amber-900 font-black ring-2 ring-amber-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'} font-bold text-xs flex items-center justify-center space-x-1.5 transition">
        <i class="fa-solid fa-phone mr-1"></i>
        <span>${isNeedTime ? '⏳ Sedang Mediasi / Butuh Waktu' : 'Saya Butuh Waktu / Hubungi Dahulu'}</span>
      </button>
    `;
  }

  setTimeout(() => {
    const lat = parseFloat(targetCase.latitude) || -7.0145;
    const lng = parseFloat(targetCase.longitude) || 113.0234;
    if (typeof L !== 'undefined') {
      if (!mGuruMapInstance) {
        mGuruMapInstance = L.map('mGuruMiniMap', { zoomControl: false, attributionControl: false }).setView([lat, lng], 13);
        const miniTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
        miniTile.addTo(mGuruMapInstance);
      } else {
        mGuruMapInstance.setView([lat, lng], 13);
      }
    }
  }, 100);
}

export function closeGuruDetailScreen() {
  if (typeof document === 'undefined') return;
  document.getElementById('mobileGuruSubDetail')?.classList.add('hidden');
  document.getElementById('mobileScreenGuru')?.classList.remove('hidden');
  const syncNav = window.syncNavHighlight || (() => {});
  syncNav('home');
}

export function openRatoDetailScreen(caseId) {
  if (typeof document === 'undefined') return;
  const currentCases = window.currentCases || [];
  const targetCase = currentCases.find(c => String(c.id) === String(caseId) || (c.case_number && c.case_number === caseId));
  if (!targetCase) return;

  const ratoRiwayat = document.getElementById('mobileRatoSubRiwayat');
  if (ratoRiwayat) ratoRiwayat.classList.add('hidden');
  document.getElementById('mobileScreenRato')?.classList.add('hidden');
  document.getElementById('mobileRatoSubDetail')?.classList.remove('hidden');

  document.getElementById('mRatoDetailName').innerText = targetCase.patient_name;
  document.getElementById('mRatoDetailAddress').innerText = (targetCase.patient_address || targetCase.village_name || 'Desa Kokop') + ' — Kec. Kokop';
  const formatStatus = window.formatStatusIndo || (s => s);
  document.getElementById('mRatoDetailBadge').innerText = formatStatus(targetCase.status);

  const myPart = targetCase.participants ? targetCase.participants.find(p => p.participant_role === 'RATO') : null;
  const isReady = myPart && (myPart.response === 'READY' || myPart.response === 'AGREE' || myPart.response === 'SIAP');

  const actionContainer = document.getElementById('mRatoDetailActionBtns');
  if (actionContainer) {
    actionContainer.innerHTML = isReady ? `
      <button disabled class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow flex items-center justify-center space-x-1.5 cursor-default opacity-95">
        <i class="fa-solid fa-circle-check text-sm"></i>
        <span>✓ Sudah Konfirmasi Siap Kawal</span>
      </button>
    ` : `
      <button onclick="mobileRatoRespond('${targetCase.id}', 'READY'); closeRatoDetailScreen();" class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow flex items-center justify-center transition">
        Siap Mengawal
      </button>
    `;
  }

  setTimeout(() => {
    const lat = parseFloat(targetCase.latitude) || -7.0145;
    const lng = parseFloat(targetCase.longitude) || 113.0234;
    if (typeof L !== 'undefined') {
      if (!mRatoMapInstance) {
        mRatoMapInstance = L.map('mRatoMiniMap', { zoomControl: false, attributionControl: false }).setView([lat, lng], 13);
        const miniTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
        miniTile.addTo(mRatoMapInstance);
      } else {
        mRatoMapInstance.setView([lat, lng], 13);
      }
    }
  }, 100);
}

export function closeRatoDetailScreen() {
  if (typeof document === 'undefined') return;
  document.getElementById('mobileRatoSubDetail')?.classList.add('hidden');
  document.getElementById('mobileScreenRato')?.classList.remove('hidden');
  const syncNav = window.syncNavHighlight || (() => {});
  syncNav('home');
}

function updateMemoryCaseParticipant(caseId, role, responseVal, note = '') {
  if (!window.currentCases || !Array.isArray(window.currentCases)) return;
  const target = window.currentCases.find(c => String(c.id) === String(caseId) || c.case_number === caseId);
  if (!target) return;
  if (!target.participants || !Array.isArray(target.participants)) {
    target.participants = [];
  }
  const existingPart = target.participants.find(p => p.participant_role === role);
  if (existingPart) {
    existingPart.response = responseVal;
    if (note) existingPart.note = note;
    existingPart.responded_at = new Date().toISOString();
  } else {
    target.participants.push({
      participant_role: role,
      user_id: window.currentUser ? window.currentUser.id : null,
      response: responseVal,
      note: note,
      responded_at: new Date().toISOString()
    });
  }
}

export async function mobileGuruRespond(caseId, responseVal) {
  if (responseVal === 'NEED_TIME') {
    window.activeGuruCaseId = caseId;
    openGuruNeedTimeModal();
    return;
  }

  const currentUser = window.currentUser;
  updateMemoryCaseParticipant(caseId, 'GURU', responseVal, 'Konfirmasi siap mendampingi evakuasi secara santun.');
  renderGuruMobileRequests(window.currentCases || []);

  try {
    const adapter = window.firebaseAdapter || window.malekkasEngine;
    if (adapter && adapter.respondCase) {
      await adapter.respondCase(caseId, {
        participant_role: 'GURU',
        response: responseVal,
        user_id: currentUser ? currentUser.id : null,
        notes: 'Konfirmasi siap mendampingi evakuasi secara santun.'
      });
    }
    if (window.showToast) {
      window.showToast('Respon Ghuru berhasil dikirim ke Puskesmas Kokop!', 'success');
    }
    if (window.fetchCases) await window.fetchCases();
    renderGuruMobileRequests(window.currentCases || []);
    if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();
  } catch (err) {
    console.error('Guru respond error:', err);
    if (window.showToast) {
      window.showToast('Respon tersimpan di sistem faskes.', 'success');
    }
    renderGuruMobileRequests(window.currentCases || []);
  }
}

export function openGuruNeedTimeModal() {
  if (typeof document === 'undefined') return;
  document.getElementById('modalGuruNeedTime')?.classList.remove('hidden');
}

export function closeGuruNeedTimeModal() {
  if (typeof document === 'undefined') return;
  document.getElementById('modalGuruNeedTime')?.classList.add('hidden');
}

export async function submitGuruNeedTime() {
  if (typeof document === 'undefined') return;
  const reason = document.getElementById('guruNeedTimeReason')?.value.trim();
  const caseId = window.activeGuruCaseId;
  const currentUser = window.currentUser;
  const notes = reason || 'Sedang proses pendekatan dengan keluarga pasien.';

  updateMemoryCaseParticipant(caseId, 'GURU', 'NEED_TIME', notes);
  renderGuruMobileRequests(window.currentCases || []);

  try {
    const adapter = window.firebaseAdapter || window.malekkasEngine;
    if (adapter && adapter.respondCase && caseId) {
      await adapter.respondCase(caseId, {
        participant_role: 'GURU',
        response: 'NEED_TIME',
        user_id: currentUser ? currentUser.id : null,
        notes: notes
      });
    }
    if (window.showToast) {
      window.showToast('Status konfirmasi waktu berhasil disampaikan ke Tim Puskesmas.', 'info');
    }
    closeGuruNeedTimeModal();
    if (window.fetchCases) await window.fetchCases();
    renderGuruMobileRequests(window.currentCases || []);
    if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();
  } catch (err) {
    console.warn('Need time error:', err);
    closeGuruNeedTimeModal();
    renderGuruMobileRequests(window.currentCases || []);
  }
}

export async function mobileRatoRespond(caseId, responseVal) {
  const currentUser = window.currentUser;
  updateMemoryCaseParticipant(caseId, 'RATO', responseVal, 'Aparat desa & linmas siap mengawal proses evakuasi medis.');
  renderRatoMobileRequests(window.currentCases || []);

  try {
    const adapter = window.firebaseAdapter || window.malekkasEngine;
    if (adapter && adapter.respondCase) {
      await adapter.respondCase(caseId, {
        participant_role: 'RATO',
        response: responseVal,
        user_id: currentUser ? currentUser.id : null,
        notes: 'Aparat desa & linmas siap mengawal proses evakuasi medis.'
      });
    }
    if (window.showToast) {
      window.showToast('Konfirmasi pengawalan berhasil dikirim ke Puskesmas Kokop!', 'success');
    }
    if (window.fetchCases) await window.fetchCases();
    renderRatoMobileRequests(window.currentCases || []);
    if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();
  } catch (err) {
    console.error('Rato respond error:', err);
    if (window.showToast) {
      window.showToast('Konfirmasi tersimpan di sistem faskes.', 'success');
    }
    renderRatoMobileRequests(window.currentCases || []);
  }
}

export function openGuruRiwayatScreen() {
  if (typeof document === 'undefined') return;
  closeGuruDetailScreen();
  document.getElementById('mobileScreenGuru')?.classList.add('hidden');
  document.getElementById('mobileGuruSubRiwayat')?.classList.remove('hidden');
  renderGuruRiwayatList();
  const syncNav = window.syncNavHighlight || (() => {});
  syncNav('riwayat');
}

export function closeGuruRiwayatScreen() {
  if (typeof document === 'undefined') return;
  document.getElementById('mobileGuruSubRiwayat')?.classList.add('hidden');
  document.getElementById('mobileScreenGuru')?.classList.remove('hidden');
  const syncNav = window.syncNavHighlight || (() => {});
  syncNav('home');
}

export function renderGuruRiwayatList() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('mGuruRiwayatListContainer');
  const pagContainer = document.getElementById('guruRiwayatPaginationContainer');
  if (!container) return;

  const currentCases = window.currentCases || [];
  const currentUser = window.currentUser;
  const pState = window.paginationState?.guruRiwayat || { page: 1, perPage: 4, query: '' };
  const uid = currentUser ? currentUser.id : null;

  const accompaniedCases = currentCases.filter(c => {
    if (!c.participants) return false;
    return c.participants.some(p => p.participant_role === 'GURU' && (String(p.user_id) === String(uid) || !uid || p.response));
  });

  const q = pState.query || '';
  const filtered = q
    ? accompaniedCases.filter(c => (c.patient_name || '').toLowerCase().includes(q) || (c.case_number || '').toLowerCase().includes(q) || (c.village_name || '').toLowerCase().includes(q))
    : accompaniedCases;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-500 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm">Belum ada riwayat pendampingan yang tercatat.</div>`;
    if (pagContainer) pagContainer.innerHTML = '';
    return;
  }

  const totalItems = filtered.length;
  const perPage = pState.perPage;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  if (pState.page > totalPages) pState.page = totalPages;

  const start = (pState.page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  container.innerHTML = paged.map(c => {
    const myPart = (c.participants || []).find(p => p.participant_role === 'GURU');
    const isDone = c.status === 'CLOSED' || c.status === 'MONITORING';
    return `
      <div class="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 space-y-3.5 shadow-sm hover:shadow-md hover:border-emerald-400 transition">
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-base font-bold shrink-0">
              <i class="fa-solid fa-hands-holding-child"></i>
            </div>
            <div>
              <h4 class="font-black text-sm sm:text-base text-slate-900">${c.patient_name}</h4>
              <p class="text-[11px] text-slate-400 font-medium">${c.case_number} • ${c.patient_address || c.village_name || 'Desa Kokop'}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-wide shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-teal-100 text-teal-800 border border-teal-200'}">
            ${isDone ? '✓ Selesai' : '▲ Pendampingan'}
          </span>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          <i class="fa-solid fa-circle-info mr-1 text-emerald-700"></i>
          <strong>Status Pendampingan:</strong> ${myPart?.response === 'AGREE' ? 'Pendampingan terkonfirmasi siap' : myPart?.response === 'NEED_TIME' ? 'Proses mediasi keluarga' : 'Menunggu pendampingan'}
        </p>
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>Status Kasus: <strong class="text-slate-700">${c.status}</strong></span>
          <button onclick="openGuruDetailScreen('${c.id}')" class="text-emerald-700 font-bold hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5 shadow-xs transition">
            <span>Buka Detail</span>
            <i class="fa-solid fa-angle-right text-[10px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.renderPaginationControls) {
    window.renderPaginationControls({
      containerId: 'guruRiwayatPaginationContainer',
      totalItems: totalItems,
      currentPage: pState.page,
      perPage: perPage,
      onPageChangeName: 'changeGuruRiwayatPage',
      entityName: 'riwayat'
    });
  }
}

export function openRatoRiwayatScreen() {
  if (typeof document === 'undefined') return;
  closeRatoDetailScreen();
  document.getElementById('mobileScreenRato')?.classList.add('hidden');
  document.getElementById('mobileRatoSubRiwayat')?.classList.remove('hidden');
  renderRatoRiwayatList();
  const syncNav = window.syncNavHighlight || (() => {});
  syncNav('riwayat');
}

export function closeRatoRiwayatScreen() {
  if (typeof document === 'undefined') return;
  document.getElementById('mobileRatoSubRiwayat')?.classList.add('hidden');
  document.getElementById('mobileScreenRato')?.classList.remove('hidden');
  const syncNav = window.syncNavHighlight || (() => {});
  syncNav('home');
}

export function renderRatoRiwayatList() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('mRatoRiwayatListContainer');
  const pagContainer = document.getElementById('ratoRiwayatPaginationContainer');
  if (!container) return;

  const currentCases = window.currentCases || [];
  const currentUser = window.currentUser;
  const pState = window.paginationState?.ratoRiwayat || { page: 1, perPage: 4, query: '' };
  const uid = currentUser ? currentUser.id : null;

  const escortedCases = currentCases.filter(c => {
    if (!c.participants) return false;
    return c.participants.some(p => p.participant_role === 'RATO' && (String(p.user_id) === String(uid) || !uid || p.response));
  });

  const q = pState.query || '';
  const filtered = q
    ? escortedCases.filter(c => (c.patient_name || '').toLowerCase().includes(q) || (c.case_number || '').toLowerCase().includes(q) || (c.village_name || '').toLowerCase().includes(q))
    : escortedCases;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-500 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm">Belum ada riwayat pengawalan yang tercatat.</div>`;
    if (pagContainer) pagContainer.innerHTML = '';
    return;
  }

  const totalItems = filtered.length;
  const perPage = pState.perPage;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  if (pState.page > totalPages) pState.page = totalPages;

  const start = (pState.page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  container.innerHTML = paged.map(c => {
    const myPart = (c.participants || []).find(p => p.participant_role === 'RATO');
    const isDone = c.status === 'CLOSED' || c.status === 'MONITORING';
    return `
      <div class="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 space-y-3.5 shadow-sm hover:shadow-md hover:border-indigo-400 transition">
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-base font-bold shrink-0">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h4 class="font-black text-sm sm:text-base text-slate-900">${c.patient_name}</h4>
              <p class="text-[11px] text-slate-400 font-medium">${c.case_number} • ${c.patient_address || c.village_name || 'Desa Kokop'}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-wide shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'}">
            ${isDone ? '✓ Selesai' : '▲ Siaga Kawal'}
          </span>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          <i class="fa-solid fa-shield-halved mr-1 text-indigo-700"></i>
          <strong>Status Pengawalan:</strong> ${myPart?.response === 'READY' ? 'Pengawalan terkonfirmasi siap' : 'Menunggu pengawalan'}
        </p>
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>Status Kasus: <strong class="text-slate-700">${c.status}</strong></span>
          <button onclick="openRatoDetailScreen('${c.id}')" class="text-indigo-700 font-bold hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center space-x-1.5 shadow-xs transition">
            <span>Buka Detail</span>
            <i class="fa-solid fa-angle-right text-[10px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.renderPaginationControls) {
    window.renderPaginationControls({
      containerId: 'ratoRiwayatPaginationContainer',
      totalItems: totalItems,
      currentPage: pState.page,
      perPage: perPage,
      onPageChangeName: 'changeRatoRiwayatPage',
      entityName: 'riwayat'
    });
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.handleGuruSearchFilter = handleGuruSearchFilter;
  window.changeGuruPage = changeGuruPage;
  window.handleGuruRiwayatSearchFilter = handleGuruRiwayatSearchFilter;
  window.changeGuruRiwayatPage = changeGuruRiwayatPage;
  window.handleRatoSearchFilter = handleRatoSearchFilter;
  window.changeRatoPage = changeRatoPage;
  window.handleRatoRiwayatSearchFilter = handleRatoRiwayatSearchFilter;
  window.changeRatoRiwayatPage = changeRatoRiwayatPage;
  window.renderGuruMobileRequests = renderGuruMobileRequests;
  window.renderRatoMobileRequests = renderRatoMobileRequests;
  window.openGuruDetailScreen = openGuruDetailScreen;
  window.closeGuruDetailScreen = closeGuruDetailScreen;
  window.openRatoDetailScreen = openRatoDetailScreen;
  window.closeRatoDetailScreen = closeRatoDetailScreen;
  window.mobileGuruRespond = mobileGuruRespond;
  window.openGuruNeedTimeModal = openGuruNeedTimeModal;
  window.closeGuruNeedTimeModal = closeGuruNeedTimeModal;
  window.submitGuruNeedTime = submitGuruNeedTime;
  window.mobileRatoRespond = mobileRatoRespond;
  window.openGuruRiwayatScreen = openGuruRiwayatScreen;
  window.closeGuruRiwayatScreen = closeGuruRiwayatScreen;
  window.renderGuruRiwayatList = renderGuruRiwayatList;
  window.openRatoRiwayatScreen = openRatoRiwayatScreen;
  window.closeRatoRiwayatScreen = closeRatoRiwayatScreen;
  window.renderRatoRiwayatList = renderRatoRiwayatList;
}
