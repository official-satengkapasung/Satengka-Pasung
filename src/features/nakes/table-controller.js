/**
 * SATENGKA PASUNG EWS — Table & Pagination Controller (ES6 Module)
 * Mengelola state paginasi, pencarian, filter, dan perender kontrol halaman tabel data faskes.
 */

export const paginationState = {
  cases: { page: 1, perPage: 10, query: '', status: '', priority: '', sort: 'priority_desc' },
  patients: { page: 1, perPage: 10, query: '', village: '', status: '', sort: 'latest' },
  kontrol: { page: 1, perPage: 5, query: '', compliance: '', sort: 'name_asc' },
  reports: { page: 1, perPage: 10, query: '', status: '', sort: 'latest' },
  kaderStatus: { page: 1, perPage: 6 },
  guruRequests: { page: 1, perPage: 4, query: '' },
  guruRiwayat: { page: 1, perPage: 4, query: '' },
  ratoRequests: { page: 1, perPage: 4, query: '' },
  ratoRiwayat: { page: 1, perPage: 4, query: '' }
};

/**
 * Render kontrol pagination HTML terpadu untuk semua tabel faskes.
 * @param {Object} options 
 */
export function renderPaginationControls({
  containerId,
  totalItems,
  currentPage,
  perPage,
  onPageChangeName,
  entityName = 'data'
}) {
  if (typeof document === 'undefined') return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endIdx = Math.min(currentPage * perPage, totalItems);

  if (totalItems === 0) {
    container.innerHTML = '';
    return;
  }

  let pageButtons = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const isActive = i === currentPage;
      pageButtons += `
        <button type="button" onclick="${onPageChangeName}(${i})"
          class="w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
            isActive
              ? 'bg-[#145861] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }">
          ${i}
        </button>
      `;
    } else if (
      (i === currentPage - 2 && i > 1) ||
      (i === currentPage + 2 && i < totalPages)
    ) {
      pageButtons += `<span class="w-5 text-center text-slate-400 text-xs font-bold">...</span>`;
    }
  }

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 rounded-b-3xl">
      <div class="font-medium">
        Menampilkan <span class="font-bold text-slate-900">${startIdx}</span> - <span class="font-bold text-slate-900">${endIdx}</span> dari <span class="font-bold text-slate-900">${totalItems}</span> ${entityName}
      </div>
      <div class="flex items-center space-x-1.5">
        <button type="button" onclick="${onPageChangeName}(${Math.max(1, currentPage - 1)})"
          ${currentPage === 1 ? 'disabled' : ''}
          class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1">
          <i class="fa-solid fa-chevron-left text-[9px]"></i>
          <span>Sebelumnya</span>
        </button>
        <div class="flex items-center space-x-1">
          ${pageButtons}
        </div>
        <button type="button" onclick="${onPageChangeName}(${Math.min(totalPages, currentPage + 1)})"
          ${currentPage === totalPages ? 'disabled' : ''}
          class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1">
          <span>Selanjutnya</span>
          <i class="fa-solid fa-chevron-right text-[9px]"></i>
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------------
// 1. MODUL SEMUA KASUS (PAGINATION, SEARCH, FILTER, SORT)
// -------------------------------------------------------------------------
export function changeCasesPage(newPage) {
  paginationState.cases.page = newPage;
  handleCasesFilterSort(false);
}

export function changeCasesPerPage(val) {
  paginationState.cases.perPage = parseInt(val) || 10;
  paginationState.cases.page = 1;
  handleCasesFilterSort(false);
}

export function handleCasesFilterSort(resetPage = false) {
  if (typeof document === 'undefined') return;
  if (resetPage) paginationState.cases.page = 1;

  const cases = window.currentCases || [];
  const q = (document.getElementById('searchCasesInput')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('filterCasesStatus')?.value || '';
  const priorityFilter = document.getElementById('filterCasesPriority')?.value || '';
  const sortVal = document.getElementById('sortCases')?.value || 'priority_desc';

  let list = [...cases];

  if (q) {
    list = list.filter(c =>
      (c.case_number || '').toLowerCase().includes(q) ||
      (c.patient_name || '').toLowerCase().includes(q) ||
      (c.village_name || '').toLowerCase().includes(q) ||
      (c.reporter_name || '').toLowerCase().includes(q) ||
      (c.report_type || '').toLowerCase().includes(q)
    );
  }

  if (statusFilter) {
    list = list.filter(c => c.status === statusFilter);
  }

  if (priorityFilter) {
    list = list.filter(c => c.priority === priorityFilter);
  }

  // Sortir
  const priorityWeight = { 'KRITIS': 4, 'TINGGI': 3, 'SEDANG': 2, 'RENDAH': 1, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
  list.sort((a, b) => {
    if (sortVal === 'priority_desc') {
      const wa = priorityWeight[a.priority] || 0;
      const wb = priorityWeight[b.priority] || 0;
      return wb !== wa ? wb - wa : (b.id - a.id);
    } else if (sortVal === 'priority_asc') {
      const wa = priorityWeight[a.priority] || 0;
      const wb = priorityWeight[b.priority] || 0;
      return wa !== wb ? wa - wb : (a.id - b.id);
    } else if (sortVal === 'latest') {
      return (b.id || 0) - (a.id || 0);
    } else if (sortVal === 'oldest') {
      return (a.id || 0) - (b.id || 0);
    } else if (sortVal === 'name_asc') {
      return (a.patient_name || '').localeCompare(b.patient_name || '');
    }
    return 0;
  });

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / paginationState.cases.perPage) || 1;
  if (paginationState.cases.page > totalPages) paginationState.cases.page = totalPages;

  const start = (paginationState.cases.page - 1) * paginationState.cases.perPage;
  const pagedData = list.slice(start, start + paginationState.cases.perPage);

  const tbody = document.getElementById('allCasesTableBody');
  if (tbody) {
    if (pagedData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">Tidak ada kasus yang sesuai dengan pencarian atau filter.</td></tr>`;
    } else {
      const formatStatus = window.formatStatusIndo || (s => s);
      const formatPriority = window.formatPriorityIndo || (p => p);

      tbody.innerHTML = pagedData.map(c => `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3.5 font-mono font-bold text-slate-800">${c.case_number}</td>
          <td class="p-3.5 font-bold text-slate-900">${c.patient_name}</td>
          <td class="p-3.5 text-slate-600">${c.village_name || 'Kokop'}</td>
          <td class="p-3.5">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
              c.status === 'SIAGA' ? 'bg-amber-100 text-amber-800' :
              c.status === 'READY_FOR_EVACUATION' ? 'bg-emerald-100 text-emerald-800' :
              c.status === 'EVACUATION' ? 'bg-blue-100 text-blue-800' :
              c.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
              'bg-teal-100 text-[#145861]'
            }">${formatStatus(c.status)}</span>
          </td>
          <td class="p-3.5 font-bold text-slate-700">${formatPriority(c.priority)}</td>
          <td class="p-3.5 text-center">
            <button onclick="selectCaseDetail('${c.id}')" class="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">
              Detail & Tindak
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  renderPaginationControls({
    containerId: 'casesPaginationContainer',
    totalItems: totalItems,
    currentPage: paginationState.cases.page,
    perPage: paginationState.cases.perPage,
    onPageChangeName: 'changeCasesPage',
    entityName: 'kasus'
  });
}

export function renderAllCasesTable() {
  handleCasesFilterSort(false);
}

// -------------------------------------------------------------------------
// 2. MODUL BASIS DATA PASIEN (PAGINATION, SEARCH, FILTER, SORT)
// -------------------------------------------------------------------------
export function changePatientsPage(newPage) {
  paginationState.patients.page = newPage;
  handlePatientsFilterSort(false);
}

export function changePatientsPerPage(val) {
  paginationState.patients.perPage = parseInt(val) || 10;
  paginationState.patients.page = 1;
  handlePatientsFilterSort(false);
}

export function handlePatientsFilterSort(resetPage = false) {
  if (typeof document === 'undefined') return;
  if (resetPage) paginationState.patients.page = 1;

  const cases = window.currentCases || [];
  const q = (document.getElementById('searchPatientsInput')?.value || '').toLowerCase().trim();
  const villageFilter = document.getElementById('filterPatientsVillage')?.value || '';
  const statusFilter = document.getElementById('filterPatientsStatus')?.value || '';
  const sortVal = document.getElementById('sortPatients')?.value || 'latest';

  let list = [...cases];

  if (q) {
    list = list.filter(c =>
      (c.patient_name || '').toLowerCase().includes(q) ||
      (c.patient_address || '').toLowerCase().includes(q) ||
      (c.village_name || '').toLowerCase().includes(q) ||
      (c.family_name || '').toLowerCase().includes(q) ||
      (c.family_phone || '').toLowerCase().includes(q) ||
      (c.case_number || '').toLowerCase().includes(q)
    );
  }

  if (villageFilter) {
    list = list.filter(c => c.village_name === villageFilter || String(c.village_id) === String(villageFilter));
  }

  if (statusFilter) {
    list = list.filter(c => c.status === statusFilter);
  }

  // Sortir
  list.sort((a, b) => {
    if (sortVal === 'latest') {
      return (b.id || 0) - (a.id || 0);
    } else if (sortVal === 'oldest') {
      return (a.id || 0) - (b.id || 0);
    } else if (sortVal === 'name_asc') {
      return (a.patient_name || '').localeCompare(b.patient_name || '');
    } else if (sortVal === 'name_desc') {
      return (b.patient_name || '').localeCompare(a.patient_name || '');
    }
    return 0;
  });

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / paginationState.patients.perPage) || 1;
  if (paginationState.patients.page > totalPages) paginationState.patients.page = totalPages;

  const start = (paginationState.patients.page - 1) * paginationState.patients.perPage;
  const pagedData = list.slice(start, start + paginationState.patients.perPage);

  const tbody = document.getElementById('patientsTableBody');
  if (tbody) {
    if (cases.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada data pasien aktif. Silakan klik "+ Tambah Data Pasien Baru" di atas.</td></tr>`;
    } else if (pagedData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Tidak ada pasien yang sesuai dengan filter atau pencarian.</td></tr>`;
    } else {
      const formatStatus = window.formatStatusIndo || (s => s);
      const escape = window.escapeHtml || (s => s);

      tbody.innerHTML = pagedData.map(c => `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3.5 font-bold text-slate-900">
            ${c.patient_name}
            <span class="block text-[10px] text-slate-400 font-mono">${c.case_number || ''}</span>
          </td>
          <td class="p-3.5">${c.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</td>
          <td class="p-3.5 text-slate-600">
            <span class="font-medium">${c.village_name || 'Desa Kokop'}</span>
            <span class="block text-[10px] text-slate-400 truncate max-w-[180px]">${c.patient_address || '-'}</span>
          </td>
          <td class="p-3.5 font-semibold text-slate-700">
            <div>${c.family_name || "Keluarga Bhuppa' Bhu'"}</div>
            ${c.family_phone ? `<span class="text-[10px] text-emerald-700 font-mono"><i class="fa-brands fa-whatsapp mr-0.5"></i>${c.family_phone}</span>` : '<span class="text-[10px] text-slate-400 font-normal">Belum ada nomor WA</span>'}
          </td>
          <td class="p-3.5">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
              c.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
              c.status === 'READY_FOR_EVACUATION' ? 'bg-emerald-100 text-emerald-800' :
              c.status === 'SIAGA' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }">
              ${formatStatus(c.status)}
            </span>
          </td>
          <td class="p-3.5 text-center">
            <div class="inline-flex items-center gap-1.5">
              <button onclick="openEditPatientModal('${c.id}')" title="Edit Data Pasien"
                class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 transition flex items-center gap-1">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button onclick="deletePatientAction('${c.id}', '${escape(c.patient_name)}')" title="Hapus Pasien"
                class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition flex items-center gap-1">
                <i class="fa-solid fa-trash-can"></i> Hapus
              </button>
              <button onclick="selectCaseDetail('${c.id}')" title="Lihat Rekam Medis & Riwayat"
                class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition flex items-center gap-1">
                <i class="fa-solid fa-eye"></i> Detail
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  renderPaginationControls({
    containerId: 'patientsPaginationContainer',
    totalItems: totalItems,
    currentPage: paginationState.patients.page,
    perPage: paginationState.patients.perPage,
    onPageChangeName: 'changePatientsPage',
    entityName: 'pasien'
  });
}

export function renderPatientsTable() {
  handlePatientsFilterSort(false);
}

// -------------------------------------------------------------------------
// 3. MODUL SEMUA LAPORAN MASUK (PAGINATION, SEARCH, FILTER, SORT)
// -------------------------------------------------------------------------
export function changeReportsPage(newPage) {
  paginationState.reports.page = newPage;
  handleReportsFilterSort(false);
}

export function changeReportsPerPage(val) {
  paginationState.reports.perPage = parseInt(val) || 10;
  paginationState.reports.page = 1;
  handleReportsFilterSort(false);
}

export function handleReportsFilterSort(resetPage = false) {
  if (typeof document === 'undefined') return;
  if (resetPage) paginationState.reports.page = 1;

  const reports = window.currentReports || [];
  const q = (document.getElementById('searchReportsInput')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('filterReportsStatus')?.value || '';
  const sortVal = document.getElementById('sortReports')?.value || 'latest';

  let list = [...reports];

  if (q) {
    list = list.filter(r =>
      (r.report_number || '').toLowerCase().includes(q) ||
      (r.reporter_name || '').toLowerCase().includes(q) ||
      (r.reporter_phone || '').toLowerCase().includes(q) ||
      (r.patient_name_input || '').toLowerCase().includes(q) ||
      (r.address_input || '').toLowerCase().includes(q) ||
      (r.report_type || '').toLowerCase().includes(q)
    );
  }

  if (statusFilter) {
    list = list.filter(r => r.status === statusFilter);
  }

  // Sortir
  list.sort((a, b) => {
    if (sortVal === 'latest') {
      return (b.id || 0) - (a.id || 0);
    } else if (sortVal === 'oldest') {
      return (a.id || 0) - (b.id || 0);
    } else if (sortVal === 'name_asc') {
      return (a.patient_name_input || '').localeCompare(b.patient_name_input || '');
    }
    return 0;
  });

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / paginationState.reports.perPage) || 1;
  if (paginationState.reports.page > totalPages) paginationState.reports.page = totalPages;

  const start = (paginationState.reports.page - 1) * paginationState.reports.perPage;
  const pagedData = list.slice(start, start + paginationState.reports.perPage);

  const tbody = document.getElementById('allReportsTableBody');
  if (tbody) {
    if (reports.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">Belum ada laporan masuk dari kader.</td></tr>`;
    } else if (pagedData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">Tidak ada laporan yang sesuai dengan pencarian atau filter.</td></tr>`;
    } else {
      const cleanRole = window.cleanRoleAccountName || (n => n);

      tbody.innerHTML = pagedData.map(r => `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3.5 font-mono font-bold text-slate-800">${r.report_number}</td>
          <td class="p-3.5">
            <span class="font-bold text-slate-900">${cleanRole(r.reporter_name || 'Kader')}</span>
            <span class="block text-[11px] text-slate-400">${r.reporter_phone || ''}</span>
          </td>
          <td class="p-3.5">
            <span class="font-bold text-slate-800">${r.patient_name_input}</span>
            <span class="block text-[11px] text-slate-500">${r.address_input}</span>
          </td>
          <td class="p-3.5 font-medium text-amber-700">${r.report_type}</td>
          <td class="p-3.5">
            <div class="flex items-center space-x-2">
              ${r.photo_path ? `<a href="${r.photo_path}" target="_blank" class="text-blue-600 font-bold hover:underline">Foto</a>` : '<span class="text-slate-400">-</span>'}
              ${r.latitude ? `<a href="https://maps.google.com/?q=${r.latitude},${r.longitude}" target="_blank" class="text-emerald-700 font-bold hover:underline">GPS</a>` : ''}
            </div>
          </td>
          <td class="p-3.5">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'NEW' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}">
              ${r.status === 'NEW' ? 'Laporan Baru' : 'Tervalidasi'}
            </span>
          </td>
          <td class="p-3.5 text-center">
            <div class="flex items-center justify-center space-x-1.5">
              <button type="button" onclick="openReportDetail('${r.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 transition">
                <i class="fa-solid fa-eye text-slate-400 mr-1"></i> Detail
              </button>
              ${r.status === 'NEW' ? `
                <button onclick="openSiagaFromReport('${r.id}')" class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition">
                  Validasi EWS
                </button>
              ` : '<span class="text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">✓ Tervalidasi</span>'}
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  renderPaginationControls({
    containerId: 'reportsPaginationContainer',
    totalItems: totalItems,
    currentPage: paginationState.reports.page,
    perPage: paginationState.reports.perPage,
    onPageChangeName: 'changeReportsPage',
    entityName: 'laporan'
  });
}

export function renderAllReportsTable() {
  handleReportsFilterSort(false);
}

/**
 * Membuka Modal Detail Laporan Masuk Kader
 * @param {string|number} reportId
 */
export function openReportDetail(reportId) {
  if (typeof document === 'undefined') return;
  const reports = window.currentReports || [];
  const rep = reports.find(r => String(r.id) === String(reportId)) ||
              (window.firebaseAdapter?.getAllReports?.() || []).find(r => String(r.id) === String(reportId));

  if (!rep) {
    console.warn('[ReportDetail] Laporan tidak ditemukan:', reportId);
    return;
  }

  window.activeDetailReportId = rep.id;
  const cleanRole = window.cleanRoleAccountName || (n => n);

  // Set Nama Pasien & Status
  const elPatient = document.getElementById('repDetailPatientName');
  if (elPatient) elPatient.innerText = rep.patient_name_input || rep.patient_name || 'Pasien Anonim';

  const elBadge = document.getElementById('repDetailBadgeStatus');
  if (elBadge) {
    const isNew = rep.status === 'NEW';
    elBadge.innerText = isNew ? 'Laporan Baru' : 'Tervalidasi';
    elBadge.className = isNew
      ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200'
      : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
  }

  const elRepNo = document.getElementById('repDetailReportNumber');
  if (elRepNo) elRepNo.innerText = rep.report_number || `LAP-${rep.id}`;

  // Foto Bukti
  const photoContainer = document.getElementById('repDetailPhotoContainer');
  const photoImg = document.getElementById('repDetailPhotoImg');
  if (photoContainer && photoImg) {
    if (rep.photo_path || rep.photo_url) {
      photoImg.src = rep.photo_path || rep.photo_url;
      photoContainer.classList.remove('hidden');
    } else {
      photoContainer.classList.add('hidden');
    }
  }

  // Info Pelapor (Kader)
  const elReporterName = document.getElementById('repDetailReporterName');
  if (elReporterName) elReporterName.innerText = cleanRole(rep.reporter_name || 'Kader Jiwa');

  const elReporterRole = document.getElementById('repDetailReporterRole');
  if (elReporterRole) elReporterRole.innerText = `Kader Jiwa (Bhupa' Bhabu') • ${rep.reporter_phone || '-'}`;

  const elWaBtn = document.getElementById('repDetailReporterWaBtn');
  if (elWaBtn) {
    if (rep.reporter_phone) {
      const cleanPhone = String(rep.reporter_phone).replace(/\D/g, '').replace(/^0/, '62');
      elWaBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${cleanRole(rep.reporter_name || 'Kader')}, terkait laporan ${rep.report_number || ''} untuk warga ${rep.patient_name_input || ''}...`)}`;
      elWaBtn.classList.remove('hidden');
    } else {
      elWaBtn.classList.add('hidden');
    }
  }

  // Wilayah & Alamat
  const elVillage = document.getElementById('repDetailVillageName');
  if (elVillage) elVillage.innerText = rep.village_name || rep.village || 'Wilayah Kerja Kokop';

  const elAddress = document.getElementById('repDetailAddress');
  if (elAddress) elAddress.innerText = rep.address_input || rep.address || 'Kecamatan Kokop';

  const elGpsBtn = document.getElementById('repDetailGpsBtn');
  if (elGpsBtn) {
    if (rep.latitude && rep.longitude) {
      elGpsBtn.href = `https://maps.google.com/?q=${rep.latitude},${rep.longitude}`;
      elGpsBtn.classList.remove('hidden');
    } else {
      elGpsBtn.classList.add('hidden');
    }
  }

  // Jenis & Tanggal & Keterangan
  const elType = document.getElementById('repDetailType');
  if (elType) elType.innerText = rep.report_type || 'Kasus Pasung';

  const elDate = document.getElementById('repDetailDate');
  if (elDate) {
    elDate.innerText = rep.reported_at || rep.created_at || 'Hari ini';
  }

  const elDesc = document.getElementById('repDetailDesc');
  if (elDesc) elDesc.innerText = rep.notes || rep.description || rep.symptoms || 'Laporan temuan kasus di lapangan oleh kader kesehatan jiwa binaan Puskesmas Kokop.';

  // Tombol Validasi EWS di Footer
  const btnValidate = document.getElementById('btnRepDetailValidate');
  if (btnValidate) {
    if (rep.status === 'NEW') {
      btnValidate.classList.remove('hidden');
    } else {
      btnValidate.classList.add('hidden');
    }
  }

  // Tampilkan Modal
  const modal = document.getElementById('modalReportDetail');
  if (modal) modal.classList.remove('hidden');
}

/**
 * Menutup Modal Detail Laporan Masuk
 */
export function closeReportDetail() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalReportDetail');
  if (modal) modal.classList.add('hidden');
  if (typeof window !== 'undefined') {
    window.activeDetailReportId = null;
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.paginationState = paginationState;
  window.renderPaginationControls = renderPaginationControls;
  window.changeCasesPage = changeCasesPage;
  window.changeCasesPerPage = changeCasesPerPage;
  window.handleCasesFilterSort = handleCasesFilterSort;
  window.renderAllCasesTable = renderAllCasesTable;
  window.changePatientsPage = changePatientsPage;
  window.changePatientsPerPage = changePatientsPerPage;
  window.handlePatientsFilterSort = handlePatientsFilterSort;
  window.renderPatientsTable = renderPatientsTable;
  window.changeReportsPage = changeReportsPage;
  window.changeReportsPerPage = changeReportsPerPage;
  window.handleReportsFilterSort = handleReportsFilterSort;
  window.renderAllReportsTable = renderAllReportsTable;
  window.openReportDetail = openReportDetail;
  window.closeReportDetail = closeReportDetail;
}
