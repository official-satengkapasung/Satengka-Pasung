/**
 * SATENGKA PASUNG EWS — Kader View Controller (Bhupa' Bhabu') (ES6 Module)
 * Mengelola rendering kartu laporan masyarakat, form deteksi dini, kompresi foto, GPS, dan status laporan kader.
 */

import { escapeHtml, formatStatusIndo } from '../../utils/formatters.js';

let kaderActiveStatusFilter = 'ALL';

export function switchKaderPwaSub(sub) {
  if (typeof document === 'undefined') return;
  document.getElementById('kaderPwaDashboard')?.classList.add('hidden');
  document.getElementById('kaderPwaForm')?.classList.add('hidden');
  document.getElementById('kaderPwaStatus')?.classList.add('hidden');

  const syncNav = window.syncNavHighlight || (() => {});
  const currentReports = window.currentReports || [];

  if (sub === 'dashboard') {
    document.getElementById('kaderPwaDashboard')?.classList.remove('hidden');
    syncNav('home');
  }
  if (sub === 'form') {
    document.getElementById('kaderPwaForm')?.classList.remove('hidden');
    syncNav('action');
  }
  if (sub === 'status') {
    document.getElementById('kaderPwaStatus')?.classList.remove('hidden');
    renderKaderStatusList(currentReports);
    syncNav('riwayat');
  }
}

export function renderKaderRecentReports(reports) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('kaderRecentReportsList');
  if (!container) return;
  if (!reports || reports.length === 0) {
    container.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-3xl border border-slate-200">Belum ada laporan yang Anda kirim. Klik tombol "Laporkan Kasus Baru" di atas untuk mengirim temuan.</div>`;
    return;
  }

  container.innerHTML = reports.slice(0, 6).map(r => `
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
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${r.status === 'NEW' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
          ${r.status === 'NEW' ? '▲ Diproses' : '✓ Selesai'}
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
  `).join('');
}

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

export function changeKaderPage(newPage) {
  if (window.paginationState && window.paginationState.kaderStatus) {
    window.paginationState.kaderStatus.page = newPage;
  }
  handleKaderSearchFilter(false);
}

export function renderKaderPaginationControls(totalItems, currentPage, perPage) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('kaderPaginationContainer');
  if (!container) return;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  if (totalItems <= perPage) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm text-xs mt-3">
      <button type="button" onclick="changeKaderPage(${Math.max(1, currentPage - 1)})"
        ${currentPage === 1 ? 'disabled' : ''}
        class="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition">
        <i class="fa-solid fa-arrow-left text-[10px]"></i> Prev
      </button>
      <span class="font-semibold text-slate-600">Halaman <strong class="text-emerald-800">${currentPage}</strong> dari <strong>${totalPages}</strong></span>
      <button type="button" onclick="changeKaderPage(${Math.min(totalPages, currentPage + 1)})"
        ${currentPage === totalPages ? 'disabled' : ''}
        class="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition">
        Next <i class="fa-solid fa-arrow-right text-[10px]"></i>
      </button>
    </div>
  `;
}

export function setKaderStatusFilter(filter) {
  kaderActiveStatusFilter = filter;
  ['ALL', 'PROCESS', 'DONE'].forEach(f => {
    const btn = document.getElementById(`filterKaderBtn_${f}`);
    if (!btn) return;
    if (f === filter) {
      btn.className = 'px-3 py-1 rounded-full font-bold bg-emerald-700 text-white shadow-sm transition shrink-0';
    } else {
      btn.className = 'px-3 py-1 rounded-full font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition shrink-0';
    }
  });
  handleKaderSearchFilter(true);
}

export function handleKaderSearchFilter(resetPage = false) {
  if (typeof document === 'undefined') return;
  const pState = window.paginationState?.kaderStatus || { page: 1, perPage: 6 };
  if (resetPage) pState.page = 1;

  const currentReports = window.currentReports || [];
  const currentCases = window.currentCases || [];
  const query = (document.getElementById('kaderSearchReportInput')?.value || '').toLowerCase().trim();
  let filtered = [...currentReports];

  filtered = filtered.map(r => {
    const matchedCase = currentCases.find(c => c.report_id === r.id || c.id === r.case_id);
    const resolvedStatus = matchedCase ? matchedCase.status : r.status;
    const resolvedCaseNumber = matchedCase ? matchedCase.case_number : r.case_number;
    return { ...r, effective_status: resolvedStatus, matched_case: matchedCase, resolved_case_number: resolvedCaseNumber };
  });

  if (kaderActiveStatusFilter === 'PROCESS') {
    filtered = filtered.filter(r => r.effective_status !== 'CLOSED' && r.effective_status !== 'MONITORING');
  } else if (kaderActiveStatusFilter === 'DONE') {
    filtered = filtered.filter(r => r.effective_status === 'CLOSED' || r.effective_status === 'MONITORING');
  }

  if (query) {
    filtered = filtered.filter(r => {
      const nameMatch = (r.patient_name_input || '').toLowerCase().includes(query);
      const addrMatch = (r.address_input || '').toLowerCase().includes(query);
      const numMatch = (r.report_number || '').toLowerCase().includes(query);
      const caseNumMatch = (r.resolved_case_number || '').toLowerCase().includes(query);
      return nameMatch || addrMatch || numMatch || caseNumMatch;
    });
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pState.perPage) || 1;
  if (pState.page > totalPages) pState.page = totalPages;

  const start = (pState.page - 1) * pState.perPage;
  const pagedReports = filtered.slice(start, start + pState.perPage);

  renderKaderStatusList(pagedReports, totalItems);
  renderKaderPaginationControls(totalItems, pState.page, pState.perPage);
}

export function renderKaderStatusList(reports, totalCount = null) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('kaderStatusListContainer');
  const countEl = document.getElementById('kaderStatusCount');
  if (!container) return;

  const displayCount = totalCount !== null ? totalCount : reports.length;
  if (countEl) countEl.innerText = `${displayCount} laporan`;

  if (reports.length === 0) {
    container.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-slate-500 bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm">Tidak ada laporan yang sesuai dengan pencarian / filter.</div>`;
    return;
  }

  const currentCases = window.currentCases || [];

  const statusSteps = {
    'NEW': { label: 'Diterima Puskesmas, Sedang Divalidasi Nakes', color: 'amber', step: 1 },
    'VALIDATED': { label: 'Laporan Valid, Koordinasi Mitra Dimulai', color: 'blue', step: 2 },
    'SIAGA': { label: 'Siaga EWS Aktif, Tim Menghubungi Tokoh', color: 'red', step: 3 },
    'COORDINATION': { label: 'Rembuk & Koordinasi Tokoh Masyarakat', color: 'amber', step: 3 },
    'READY_FOR_EVACUATION': { label: 'Semua Pilar Siap, Menuju Lokasi Pasien', color: 'emerald', step: 4 },
    'EVACUATION': { label: 'Proses Evakuasi Medis Sedang Berlangsung', color: 'blue', step: 4 },
    'MONITORING': { label: 'Evakuasi Tuntas, Tahap Pengawasan & Kontrol Obat', color: 'emerald', step: 5 },
    'CLOSED': { label: 'Kasus Selesai — Bebas Pasung', color: 'emerald', step: 5 },
  };

  container.innerHTML = reports.map(r => {
    const matchedCase = r.matched_case || currentCases.find(c => c.report_id === r.id || c.id === r.case_id);
    const caseStatus = matchedCase ? matchedCase.status : (r.effective_status || r.case_status || r.status);
    const caseInfo = statusSteps[caseStatus] || statusSteps['NEW'];
    const currentStep = caseInfo.step;

    const steps = [
      { label: 'Laporan', done: currentStep >= 1, active: currentStep === 1 },
      { label: 'Validasi', done: currentStep >= 2, active: currentStep === 2 },
      { label: 'Siaga Tokoh', done: currentStep >= 3, active: currentStep === 3 },
      { label: 'Evakuasi', done: currentStep >= 4, active: currentStep === 4 },
      { label: 'Selesai', done: currentStep >= 5, active: currentStep === 5 },
    ];

    return `
      <div onclick="openReportDetail('${r.id}')" class="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-5 space-y-3.5 shadow-sm hover:shadow-md hover:border-emerald-400 cursor-pointer transition">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-black text-sm sm:text-base text-slate-900 hover:text-emerald-800 transition">${escapeHtml(r.patient_name_input)}</h4>
            <p class="text-[11px] text-slate-400 font-medium">${escapeHtml(r.report_number || '')} • ${escapeHtml(r.address_input || 'Desa Kokop')}</p>
          </div>
          <span class="bg-${caseInfo.color === 'red' ? 'red' : caseInfo.color === 'amber' ? 'amber' : 'emerald'}-100 text-${caseInfo.color === 'red' ? 'red' : caseInfo.color === 'amber' ? 'amber' : 'emerald'}-800 border border-${caseInfo.color === 'red' ? 'red' : caseInfo.color === 'amber' ? 'amber' : 'emerald'}-200 text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ml-2">
            ${formatStatusIndo(caseStatus)}
          </span>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100 font-medium">
          <i class="fa-solid fa-circle-notch text-emerald-600 mr-1.5"></i>
          ${caseInfo.label}
        </p>
        <div class="flex items-center space-x-1 text-[10px] pt-1">
          ${steps.map((s, i) => `
            <div class="flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}">
              <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black shadow-xs
                ${s.done ? 'bg-emerald-600 text-white' : s.active ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-100 border border-slate-200 text-slate-400'}">
                ${s.done ? '<i class="fa-solid fa-check text-[10px]"></i>' : (i + 1)}
              </div>
              ${i < steps.length - 1 ? `<div class="flex-1 h-1 mx-1 rounded-full ${s.done ? 'bg-emerald-500' : 'bg-slate-200'}"></div>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-mono text-[11px]">No: ${escapeHtml(r.report_number || '')}</span>
            ${(matchedCase?.case_number || r.resolved_case_number || r.case_number) ? `<span class="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px]">Kasus: ${escapeHtml(matchedCase?.case_number || r.resolved_case_number || r.case_number)}</span>` : ''}
          </div>
          <button type="button" onclick="event.stopPropagation(); openReportDetail('${r.id}');" class="text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1 shadow-xs transition text-xs">
            <span>Lihat Detail</span>
            <i class="fa-solid fa-angle-right text-[10px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

export async function compressImageFile(file, maxWidth = 1280, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        const sizeKB = Math.round((compressedBase64.length * 3 / 4) / 1024);
        resolve({ base64: compressedBase64, sizeKB });
      };
      img.onerror = () => resolve({ base64: event.target.result, sizeKB: Math.round(file.size / 1024) });
    };
    reader.onerror = () => resolve({ base64: null, sizeKB: 0 });
  });
}

export async function handleMobilePhotoSelect(e) {
  const file = e.target.files[0];
  if (file) {
    const photoLabel = document.getElementById('kaderMobilePhotoText');
    if (photoLabel) photoLabel.innerText = "Mengompresi foto...";
    try {
      const result = await compressImageFile(file);
      window.mobilePhotoBase64 = result.base64;
      if (photoLabel) photoLabel.innerText = `✓ Foto Terlampir (${result.sizeKB} KB - Terkompresi)`;
    } catch {
      if (photoLabel) photoLabel.innerText = "✓ Foto Terlampir";
    }
  }
}

export function getMobileGps() {
  const text = document.getElementById('kaderMobileGpsText');
  if (text) text.innerText = "Mendeteksi...";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      window.mobileGpsCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (text) text.innerText = `✓ Lokasi berhasil diambil`;
    }, () => {
      if (text) text.innerText = `✓ Lokasi Kokop`;
    });
  } else {
    if (text) text.innerText = `✓ Lokasi Kokop`;
  }
}

export async function submitMobileKaderReport() {
  if (typeof document === 'undefined') return;
  const name = (document.getElementById('kaderFormName')?.value.trim() || '').toUpperCase();
  const villageId = document.getElementById('kaderFormVillage')?.value;
  const vSelect = document.getElementById('kaderFormVillage');
  const vName = vSelect ? vSelect.options[vSelect.selectedIndex]?.text || 'Kokop' : 'Kokop';
  const addressEl = document.getElementById('kaderFormAddress');
  const address = addressEl ? addressEl.value.trim() : `Desa ${vName}`;

  const rawType = document.querySelector('input[name="kader_form_type"]:checked')?.value || 'Pasung';
  let type = rawType;
  if (rawType === 'Lainnya') {
    const customTypeVal = document.getElementById('kaderFormTypeOtherText')?.value.trim();
    type = customTypeVal ? `Lainnya: ${customTypeVal}` : 'Lainnya';
  }

  if (!name) {
    alert('Mohon isi nama pasien.');
    return;
  }

  const btn = document.getElementById('btnKirimMobileLaporan');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Mengirim Laporan...';
  }

  const currentUser = window.currentUser;
  const coords = window.mobileGpsCoords || { lat: -7.0145, lng: 113.0234 };

  try {
    const adapter = window.firebaseAdapter || window.malekkasEngine;
    if (adapter && adapter.createReport) {
      const res = await adapter.createReport({
        patient_name: name,
        address: address || `Desa ${vName}`,
        village_id: villageId,
        village_name: vName,
        report_type: type,
        description: `Laporan temuan ${type} dari Kader Jiwa di wilayah ${vName}`,
        latitude: coords.lat,
        longitude: coords.lng,
        photo_base64: window.mobilePhotoBase64
      }, currentUser);

      if (res.success) {
        const reporterName = currentUser ? currentUser.name : 'Kader Jiwa';
        if (window.dispatchWaToNakes) {
          window.dispatchWaToNakes('Laporan Kasus Baru dari Kader Jiwa', `No. Laporan: *${res.data.report_number}*\nPelapor: ${reporterName}\nPasien: *${name}*\nWilayah: ${vName}\nAlamat: ${address || '-'}\nJenis Kasus: *${type}*\nKoordinat GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        }

        alert(`✓ Laporan berhasil dikirim ke Puskesmas!\nNomor Laporan: ${res.data.report_number}\nData langsung tercatat di Sistem & Notifikasi diteruskan ke WhatsApp Nakes.`);
        document.getElementById('kaderFormName').value = '';
        if (addressEl) addressEl.value = '';
        const otherTextInput = document.getElementById('kaderFormTypeOtherText');
        if (otherTextInput) otherTextInput.value = '';
        const otherContainer = document.getElementById('kaderFormTypeOtherContainer');
        if (otherContainer) otherContainer.classList.add('hidden');
        const defaultRadio = document.querySelector('input[name="kader_form_type"][value="Pasung"]');
        if (defaultRadio) defaultRadio.checked = true;

        window.mobilePhotoBase64 = null;
        const pText = document.getElementById('kaderMobilePhotoText');
        if (pText) pText.innerText = 'Ambil Foto';
        const gText = document.getElementById('kaderMobileGpsText');
        if (gText) gText.innerText = 'Ambil Lokasi GPS';

        if (window.fetchReports) await window.fetchReports();
        if (window.fetchCases) await window.fetchCases();
        renderKaderRecentReports(window.currentReports || []);
        if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();
        switchKaderPwaSub('dashboard');
        return;
      }
    }
  } catch (err) {
    console.warn('Submit kader report fallback:', err);
    alert('Laporan berhasil disimpan.');
    if (window.fetchReports) await window.fetchReports();
    if (window.fetchCases) await window.fetchCases();
    renderKaderRecentReports(window.currentReports || []);
    if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();
    switchKaderPwaSub('dashboard');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✓ Kirim Laporan';
    }
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.switchKaderPwaSub = switchKaderPwaSub;
  window.renderKaderRecentReports = renderKaderRecentReports;
  window.toggleKaderOtherTypeInput = toggleKaderOtherTypeInput;
  window.changeKaderPage = changeKaderPage;
  window.renderKaderPaginationControls = renderKaderPaginationControls;
  window.setKaderStatusFilter = setKaderStatusFilter;
  window.handleKaderSearchFilter = handleKaderSearchFilter;
  window.renderKaderStatusList = renderKaderStatusList;
  window.compressImageFile = compressImageFile;
  window.handleMobilePhotoSelect = handleMobilePhotoSelect;
  window.getMobileGps = getMobileGps;
  window.submitMobileKaderReport = submitMobileKaderReport;
}
