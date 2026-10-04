/**
 * SATENGKA PASUNG EWS — Siaga & 4-Pillar Coordination Controller (ES6 Module)
 * Mengelola aktivasi EWS Siaga, notifikasi WhatsApp otomatis ke Ghuru & Rato, serta alur evakuasi.
 */

export function openSiagaFromReportDetail() {
  if (typeof window === 'undefined') return;
  if (window.activeDetailReportId) {
    const id = window.activeDetailReportId;
    if (window.closeReportDetail) window.closeReportDetail();
    openSiagaFromReport(id);
  }
}

export function openSiagaFromReport(reportId) {
  if (typeof document === 'undefined') return;
  const currentReports = window.currentReports || [];
  const currentCases = window.currentCases || [];

  const rep = currentReports.find(r => String(r.id) === String(reportId));
  if (rep) {
    window.activeReportId = rep.id;
    if (rep.case_id) {
      const matchCase = currentCases.find(c => String(c.id) === String(rep.case_id));
      if (matchCase) window.activeSelectedCase = matchCase;
    }
    if (document.getElementById('valPatientName')) {
      document.getElementById('valPatientName').value = rep.patient_name_input;
    }
    if (document.getElementById('valVillageSelect')) {
      const vSel = document.getElementById('valVillageSelect');
      let matched = false;
      if (rep.village_id) {
        for (let i = 0; i < vSel.options.length; i++) {
          if (String(vSel.options[i].value) === String(rep.village_id)) {
            vSel.selectedIndex = i;
            matched = true;
            break;
          }
        }
      }
      if (!matched && rep.village_name) {
        for (let i = 0; i < vSel.options.length; i++) {
          if (vSel.options[i].text.toLowerCase() === String(rep.village_name).toLowerCase()) {
            vSel.selectedIndex = i;
            break;
          }
        }
      }
    }
    if (document.getElementById('valReportType') && rep.report_type) {
      document.getElementById('valReportType').value = rep.report_type.toUpperCase().includes('KAMBUH') ? 'KAMBUH' : 'PASUNG';
    }
    if (document.getElementById('valNotes')) {
      document.getElementById('valNotes').value = `Validasi dari laporan ${rep.report_number} oleh ${rep.reporter_name || 'Kader'}. Alamat: ${rep.address_input || 'Desa Kokop'}.`;
    }
    if (window.switchNakesTab) {
      window.switchNakesTab('validasi');
    }
  }
}


// State pemilihan & pagination tokoh EWS
export const selectedGuruIds = new Set();
export const selectedRatoIds = new Set();
let currentGuruPage = 1;
const GURU_PAGE_SIZE = 5;
let currentRatoPage = 1;
const RATO_PAGE_SIZE = 5;

export function toggleGuruSelection(id, checked) {
  if (checked) {
    selectedGuruIds.add(String(id));
  } else {
    selectedGuruIds.delete(String(id));
  }
}

export function toggleRatoSelection(id, checked) {
  if (checked) {
    selectedRatoIds.add(String(id));
  } else {
    selectedRatoIds.delete(String(id));
  }
}

export function changeGuruPage(newPage) {
  currentGuruPage = newPage;
  filterEwsGuruList();
}

export function changeRatoPage(newPage) {
  currentRatoPage = newPage;
  filterEwsRatoList();
}

export function renderEwsGuruCheckboxes(gurus, targetVillageId) {
  const container = document.getElementById('ewsGuruContainer');
  const paginationContainer = document.getElementById('ewsGuruPagination');
  if (!container) return;
  const cleanRole = window.cleanRoleAccountName || (n => n);
  const showCross = document.getElementById('chkGuruCrossVillage')?.checked;
  const searchInput = document.getElementById('ewsGuruSearchInput');
  const villageSelect = document.getElementById('ewsGuruVillageFilter');

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const villageFilter = villageSelect ? villageSelect.value : 'ALL';

  const filtered = gurus.filter(g => {
    // 1. Filter Desa Spesifik Dropdown jika dipilih
    if (villageFilter && villageFilter !== 'ALL') {
      const vMatch = String(g.village_id) === String(villageFilter) ||
                     (g.village_name && g.village_name.toLowerCase().includes(villageFilter.toLowerCase()));
      if (!vMatch) return false;
    } else if (!showCross && targetVillageId) {
      // Jika dropdown 'Semua Desa' tapi 'Sertakan Lintas Desa' tidak dicentang, batasi ke target village
      if (String(g.village_id) !== String(targetVillageId)) return false;
    }

    // 2. Filter Search Teks (Nama atau No Kontak)
    if (query) {
      const name = (g.name || '').toLowerCase();
      const phone = (g.phone || '').toLowerCase();
      const vName = (g.village_name || '').toLowerCase();
      const match = name.includes(query) || phone.includes(query) || vName.includes(query);
      if (!match) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-3 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
      Tidak ada tokoh Kiai yang sesuai filter. Centang <strong>"Sertakan Kiai Lintas Desa"</strong> atau ubah kata kunci pencarian.
    </div>`;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Hitung Pagination
  const totalPages = Math.ceil(filtered.length / GURU_PAGE_SIZE) || 1;
  if (currentGuruPage > totalPages) currentGuruPage = totalPages;
  if (currentGuruPage < 1) currentGuruPage = 1;

  const startIndex = (currentGuruPage - 1) * GURU_PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + GURU_PAGE_SIZE);

  container.innerHTML = pageItems.map((g) => {
    const isTargetVillage = targetVillageId && String(g.village_id) === String(targetVillageId);
    const gid = String(g.id || g.uid);
    const isChecked = selectedGuruIds.has(gid);
    return `
      <label class="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200/80 cursor-pointer transition select-none">
        <div class="flex items-center space-x-2.5">
          <input type="checkbox" name="ews_guru_id" value="${gid}" ${isChecked ? 'checked' : ''} onchange="window.toggleGuruSelection && window.toggleGuruSelection('${gid}', this.checked)" class="w-4 h-4 text-emerald-600 rounded cursor-pointer">
          <div>
            <span class="text-xs font-bold text-slate-800 block">${cleanRole(g.name)}</span>
            <span class="text-[11px] text-slate-500">${g.phone ? '<i class="fa-brands fa-whatsapp text-emerald-600 mr-0.5"></i>' + g.phone : 'Belum ada kontak WA'}</span>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${isTargetVillage ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
          Desa ${g.village_name || 'Kokop'}
        </span>
      </label>
    `;
  }).join('');

  // Render pagination kontrol
  if (paginationContainer) {
    if (totalPages > 1) {
      paginationContainer.innerHTML = `
        <span class="text-[11px] text-slate-500 font-medium">
          Hal. <strong class="text-slate-700">${currentGuruPage}</strong> dari ${totalPages} <span class="text-slate-400">(${filtered.length} Kiai)</span>
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="window.changeGuruPage && window.changeGuruPage(${currentGuruPage - 1})" ${currentGuruPage <= 1 ? 'disabled' : ''}
            class="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[11px]">
            &larr; Prev
          </button>
          <button type="button" onclick="window.changeGuruPage && window.changeGuruPage(${currentGuruPage + 1})" ${currentGuruPage >= totalPages ? 'disabled' : ''}
            class="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[11px]">
            Next &rarr;
          </button>
        </div>
      `;
    } else {
      paginationContainer.innerHTML = `<span class="text-[11px] text-slate-500">Menampilkan ${filtered.length} Kiai</span>`;
    }
  }
}

export function renderEwsRatoCheckboxes(ratos, targetVillageId) {
  const container = document.getElementById('ewsRatoContainer');
  const paginationContainer = document.getElementById('ewsRatoPagination');
  if (!container) return;
  const cleanRole = window.cleanRoleAccountName || (n => n);
  const showCross = document.getElementById('chkRatoCrossVillage')?.checked;
  const searchInput = document.getElementById('ewsRatoSearchInput');
  const villageSelect = document.getElementById('ewsRatoVillageFilter');

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const villageFilter = villageSelect ? villageSelect.value : 'ALL';

  const filtered = ratos.filter(r => {
    // 1. Filter Desa Spesifik Dropdown jika dipilih
    if (villageFilter && villageFilter !== 'ALL') {
      const vMatch = String(r.village_id) === String(villageFilter) ||
                     (r.village_name && r.village_name.toLowerCase().includes(villageFilter.toLowerCase()));
      if (!vMatch) return false;
    } else if (!showCross && targetVillageId) {
      if (String(r.village_id) !== String(targetVillageId)) return false;
    }

    // 2. Filter Search Teks (Nama atau No Kontak)
    if (query) {
      const name = (r.name || '').toLowerCase();
      const phone = (r.phone || '').toLowerCase();
      const vName = (r.village_name || '').toLowerCase();
      const match = name.includes(query) || phone.includes(query) || vName.includes(query);
      if (!match) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-3 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
      Tidak ada aparatur desa yang sesuai filter. Centang <strong>"Sertakan Rato Lintas Desa"</strong> atau ubah kata kunci pencarian.
    </div>`;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Hitung Pagination
  const totalPages = Math.ceil(filtered.length / RATO_PAGE_SIZE) || 1;
  if (currentRatoPage > totalPages) currentRatoPage = totalPages;
  if (currentRatoPage < 1) currentRatoPage = 1;

  const startIndex = (currentRatoPage - 1) * RATO_PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + RATO_PAGE_SIZE);

  container.innerHTML = pageItems.map((r) => {
    const isTargetVillage = targetVillageId && String(r.village_id) === String(targetVillageId);
    const rid = String(r.id || r.uid);
    const isChecked = selectedRatoIds.has(rid);
    return `
      <label class="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200/80 cursor-pointer transition select-none">
        <div class="flex items-center space-x-2.5">
          <input type="checkbox" name="ews_rato_id" value="${rid}" ${isChecked ? 'checked' : ''} onchange="window.toggleRatoSelection && window.toggleRatoSelection('${rid}', this.checked)" class="w-4 h-4 text-blue-600 rounded cursor-pointer">
          <div>
            <span class="text-xs font-bold text-slate-800 block">${cleanRole(r.name)}</span>
            <span class="text-[11px] text-slate-500">${r.phone ? '<i class="fa-brands fa-whatsapp text-emerald-600 mr-0.5"></i>' + r.phone : 'Belum ada kontak WA'}</span>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${isTargetVillage ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}">
          Desa ${r.village_name || 'Kokop'}
        </span>
      </label>
    `;
  }).join('');

  // Render pagination kontrol
  if (paginationContainer) {
    if (totalPages > 1) {
      paginationContainer.innerHTML = `
        <span class="text-[11px] text-slate-500 font-medium">
          Hal. <strong class="text-slate-700">${currentRatoPage}</strong> dari ${totalPages} <span class="text-slate-400">(${filtered.length} Aparat)</span>
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="window.changeRatoPage && window.changeRatoPage(${currentRatoPage - 1})" ${currentRatoPage <= 1 ? 'disabled' : ''}
            class="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[11px]">
            &larr; Prev
          </button>
          <button type="button" onclick="window.changeRatoPage && window.changeRatoPage(${currentRatoPage + 1})" ${currentRatoPage >= totalPages ? 'disabled' : ''}
            class="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-[11px]">
            Next &rarr;
          </button>
        </div>
      `;
    } else {
      paginationContainer.innerHTML = `<span class="text-[11px] text-slate-500">Menampilkan ${filtered.length} Aparat</span>`;
    }
  }
}

export function filterEwsGuruList() {
  const users = window.currentUsers || [];
  const gurus = users.filter(u => u.role === 'GURU');
  const targetVillageId = getActiveTargetVillageId();
  renderEwsGuruCheckboxes(gurus, targetVillageId);
}

export function filterEwsRatoList() {
  const users = window.currentUsers || [];
  const ratos = users.filter(u => u.role === 'RATO');
  const targetVillageId = getActiveTargetVillageId();
  renderEwsRatoCheckboxes(ratos, targetVillageId);
}

function getActiveTargetVillageId() {
  const activeSelectedCase = window.activeSelectedCase;
  const activeReportId = window.activeReportId;
  const currentReports = window.currentReports || [];
  if (activeSelectedCase && activeSelectedCase.village_id) return activeSelectedCase.village_id;
  if (activeReportId) {
    const rep = currentReports.find(r => String(r.id) === String(activeReportId));
    if (rep && rep.village_id) return rep.village_id;
  }
  return null;
}

export function populateEwsSelects(users) {
  if (typeof document === 'undefined') return;
  const gurus = (users || []).filter(u => u.role === 'GURU');
  const ratos = (users || []).filter(u => u.role === 'RATO');
  const targetVillageId = getActiveTargetVillageId();

  // Reset pagination ke hal. 1 saat inisialisasi form
  currentGuruPage = 1;
  currentRatoPage = 1;

  // Jika belum ada yang dipilih, pilih otomatis tokoh pertama di target desa jika ada
  if (selectedGuruIds.size === 0 && targetVillageId) {
    const matchGuru = gurus.find(g => String(g.village_id) === String(targetVillageId));
    if (matchGuru) selectedGuruIds.add(String(matchGuru.id || matchGuru.uid));
  }
  if (selectedRatoIds.size === 0 && targetVillageId) {
    const matchRato = ratos.find(r => String(r.village_id) === String(targetVillageId));
    if (matchRato) selectedRatoIds.add(String(matchRato.id || matchRato.uid));
  }

  renderEwsGuruCheckboxes(gurus, targetVillageId);
  renderEwsRatoCheckboxes(ratos, targetVillageId);
}


export async function executeEwsActivation() {
  if (typeof document === 'undefined') return;
  
  // Sinkronkan pilihan dari checkbox yang ada di DOM halaman aktif saat ini
  const domGuruCheckboxes = Array.from(document.querySelectorAll('input[name="ews_guru_id"]:checked')).map(cb => cb.value);
  domGuruCheckboxes.forEach(id => selectedGuruIds.add(String(id)));
  
  const domRatoCheckboxes = Array.from(document.querySelectorAll('input[name="ews_rato_id"]:checked')).map(cb => cb.value);
  domRatoCheckboxes.forEach(id => selectedRatoIds.add(String(id)));

  const guruIds = Array.from(selectedGuruIds);
  const ratoIds = Array.from(selectedRatoIds);
  
  const msg = document.getElementById('ewsCustomMessage')?.value;
  const dispatchGuru = document.getElementById('chkDispatchGuru') ? document.getElementById('chkDispatchGuru').checked : true;
  const dispatchRato = document.getElementById('chkDispatchRato') ? document.getElementById('chkDispatchRato').checked : true;

  if (!dispatchGuru && !dispatchRato) {
    alert('Pilih minimal satu peran tokoh (Guru atau Rato) untuk dikirimi notifikasi aktivasi siaga.');
    return;
  }

  if (dispatchGuru && guruIds.length === 0) {
    alert('Silakan centang minimal satu Guru/Kiai yang akan disiagakan (bisa dari desa lokal atau lintas desa).');
    return;
  }
  if (dispatchRato && ratoIds.length === 0) {
    alert('Silakan centang minimal satu Rato/Aparat desa yang akan disiagakan (bisa dari desa lokal atau lintas desa).');
    return;
  }

  const btn = document.getElementById('btnKirimNotifSiaga');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menyiagakan Tokoh 4 Pilar...';
  }

  const activeSelectedCase = window.activeSelectedCase;
  const activeReportId = window.activeReportId;
  const currentUsers = window.currentUsers || [];
  const currentUser = window.currentUser;

  const payload = {
    guru_ids: dispatchGuru ? guruIds : [],
    rato_ids: dispatchRato ? ratoIds : [],
    guru_id: dispatchGuru ? guruIds[0] : null,
    rato_id: dispatchRato ? ratoIds[0] : null,
    notes: msg || 'Aktivasi Siaga Satengka Pasung via Tombol Siaga Nakes'
  };
  if (activeSelectedCase && activeSelectedCase.id) {
    payload.case_id = activeSelectedCase.id;
  } else if (activeReportId) {
    payload.report_id = activeReportId;
  }

  try {
    const patientName = activeSelectedCase ? activeSelectedCase.patient_name : 'Warga Kokop';
    const villageName = activeSelectedCase ? (activeSelectedCase.village_name || 'Kokop') : 'Kokop';

    // Siapkan daftar antrean kontak WhatsApp secara terstruktur (mencegah tab race condition & browser spam blocking)
    const waContactsQueue = [];

    if (dispatchGuru) {
      guruIds.forEach(gid => {
        const selectedGuru = currentUsers.find(u => String(u.id) === String(gid) || (u.uid && String(u.uid) === String(gid)));
        if (selectedGuru && selectedGuru.phone) {
          let cleanPhone = selectedGuru.phone.replace(/[^0-9]/g, '');
          if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
          const rawMsg = `*NOTIFIKASI SIAGA SATENGKA PASUNG PUSKESMAS KOKOP*\n\nAssalamu’alaikum Wr. Wb. Kiai/Ustadz ${selectedGuru.name},\nMohon bantuan pendekatan keagamaan persuasif & rembuk santun keluarga untuk penanganan evakuasi medis warga di ${villageName} (Pasien: ${patientName}).\n\nCatatan Nakes: ${msg || 'Mohon kesediaan Kiai mendampingi penanganan medis pasien.'}\n\nTerima kasih atas keridhoan & bimbingan Kiai.`;
          const waText = encodeURIComponent(rawMsg);
          waContactsQueue.push({
            id: gid,
            role: 'GURU',
            roleLabel: "Ghuru",
            roleIcon: './assets/icons/role_bhu-ghuru.png',
            name: selectedGuru.name,
            phone: selectedGuru.phone,
            village: selectedGuru.village_name || villageName,
            cleanPhone,
            rawMessage: rawMsg,
            waUrl: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}`,
            isSent: false
          });
        }
      });
    }

    if (dispatchRato) {
      ratoIds.forEach(rid => {
        const selectedRato = currentUsers.find(u => String(u.id) === String(rid) || (u.uid && String(u.uid) === String(rid)));
        if (selectedRato && selectedRato.phone) {
          let cleanRatoPhone = selectedRato.phone.replace(/[^0-9]/g, '');
          if (cleanRatoPhone.startsWith('0')) cleanRatoPhone = '62' + cleanRatoPhone.slice(1);
          const rawMsg = `*PEMBERITAHUAN SIAGA KOORDINASI EVAKUASI DESA*\n\nKepada Yth. Rato (${selectedRato.name} - Desa ${selectedRato.village_name || villageName}),\nPetugas Puskesmas Kokop meminta pendampingan pengawalan wilayah untuk penanganan evakuasi medis warga (Pasien: ${patientName}).\n\nCatatan Nakes: ${msg || 'Mohon koordinasi pengamanan kondusif saat penjemputan warga.'}\n\nTerima kasih atas kerja samanya.`;
          const waRatoText = encodeURIComponent(rawMsg);
          waContactsQueue.push({
            id: rid,
            role: 'RATO',
            roleLabel: 'Rato',
            roleIcon: './assets/icons/role_rato.png',
            name: selectedRato.name,
            phone: selectedRato.phone,
            village: selectedRato.village_name || villageName,
            cleanPhone: cleanRatoPhone,
            rawMessage: rawMsg,
            waUrl: `https://api.whatsapp.com/send?phone=${cleanRatoPhone}&text=${waRatoText}`,
            isSent: false
          });
        }
      });
    }

    if (window.firebaseAdapter && window.firebaseAdapter.activateSiagaEws) {
      const res = await window.firebaseAdapter.activateSiagaEws(payload, currentUser);
      if (res.success) {
        const newCaseId = res.data ? res.data.case_id : (activeSelectedCase ? activeSelectedCase.id : null);
        if (newCaseId) window.activeMonitoringCaseId = newCaseId;

        if (window.fetchCases) await window.fetchCases();
        if (window.fetchReports) await window.fetchReports();

        if (waContactsQueue.length > 0) {
          // Buka modal antrean WA teratur agar tidak diblokir browser sebagai spam dan tidak bentrok antar tab
          showEwsWaQueueModal(waContactsQueue, {
            patientName,
            villageName,
            caseId: newCaseId,
            totalGuru: guruIds.length,
            totalRato: ratoIds.length
          });
        } else {
          alert(`✓ Notifikasi Siaga Berhasil Diaktifkan!\nSeluruh tokoh terpilih kini otomatis tergabung dalam ruang Live Chat kasus ini.`);
          if (window.switchNakesTab) {
            window.switchNakesTab('monitoring');
          }
        }
        return;
      } else {
        alert(res.message || 'Gagal mengirim notifikasi siaga.');
      }
    }
  } catch (err) {
    console.error('Error execute EWS activation:', err);
    alert('Terjadi kesalahan saat mengaktifkan siaga: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i><span>Kirim Notifikasi Siaga</span>';
    }
  }
}

// =========================================================================
// PENGELOLA MODAL ANTREAN WHATSAPP SIAGA (ANTI-RACE CONDITION & ANTI-SPAM)
// =========================================================================
let activeWaQueueItems = [];

export function showEwsWaQueueModal(contacts, meta = {}) {
  activeWaQueueItems = contacts || [];
  
  const modal = document.getElementById('modalEwsWaQueue');
  const pName = document.getElementById('ewsWaQueuePatientName');
  const vName = document.getElementById('ewsWaQueueVillageName');
  const badge = document.getElementById('ewsWaQueueTotalBadge');
  const container = document.getElementById('ewsWaQueueContainer');

  if (pName) pName.innerText = meta.patientName || 'Pasien Kokop';
  if (vName) vName.innerText = `Wilayah: ${meta.villageName || 'Kecamatan Kokop'}`;
  if (badge) badge.innerText = `${activeWaQueueItems.length} Kontak Tokoh`;

  renderWaQueueCards();

  if (modal) modal.classList.remove('hidden');
}

export function renderWaQueueCards() {
  const container = document.getElementById('ewsWaQueueContainer');
  if (!container) return;

  if (activeWaQueueItems.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
        Semua kontak telah dihubungi atau tidak ada nomor telepon yang valid.
      </div>
    `;
    return;
  }

  container.innerHTML = activeWaQueueItems.map((item, idx) => {
    const isSent = item.isSent;
    const roleBorder = item.role === 'GURU' ? 'border-teal-200 bg-teal-50/30' : 'border-indigo-200 bg-indigo-50/30';
    const roleColor = item.role === 'GURU' ? 'text-teal-800' : 'text-indigo-800';

    return `
      <div class="p-3 rounded-2xl border ${roleBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition">
        <div class="flex items-start space-x-2.5 min-w-0">
          <img src="${item.roleIcon}" class="w-8 h-8 object-contain shrink-0 mt-0.5" alt="${item.roleLabel}">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold uppercase ${roleColor} tracking-wide">${item.roleLabel}</span>
              <span class="text-[10px] text-slate-400">• ${item.village}</span>
            </div>
            <p class="font-bold text-slate-900 text-xs truncate">${item.name}</p>
            <p class="text-[10px] font-mono text-slate-500">${item.phone}</p>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
          <button type="button" onclick="copyWaQueueMessage(${idx})"
            title="Salin Pesan Siaga"
            class="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition flex items-center gap-1">
            <i class="fa-regular fa-copy text-xs"></i>
            <span class="text-[10px]">Salin</span>
          </button>
          <button type="button" onclick="sendWaQueueItem(${idx})"
            class="px-3 py-1.5 rounded-xl ${isSent ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'} text-xs font-bold transition flex items-center gap-1.5">
            <i class="fa-brands fa-whatsapp ${isSent ? 'text-emerald-700' : ''}"></i>
            <span>${isSent ? 'Sudah Dibuka' : 'Buka WhatsApp'}</span>
            ${isSent ? '<i class="fa-solid fa-check text-[10px]"></i>' : ''}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

export function sendWaQueueItem(index) {
  const item = activeWaQueueItems[index];
  if (!item) return;

  item.isSent = true;
  renderWaQueueCards();

  // Buka WhatsApp tepat pada gesture klik pengguna (terhindar dari popup blocker browser)
  window.open(item.waUrl, '_blank');
}

export function copyWaQueueMessage(index) {
  const item = activeWaQueueItems[index];
  if (!item || !item.rawMessage) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(item.rawMessage).then(() => {
      alert(`✓ Teks pesan notifikasi untuk ${item.name} berhasil disalin ke clipboard!`);
    }).catch(() => {
      prompt('Salin teks pesan berikut:', item.rawMessage);
    });
  } else {
    prompt('Salin teks pesan berikut:', item.rawMessage);
  }
}

export function closeEwsWaQueueModal() {
  const modal = document.getElementById('modalEwsWaQueue');
  if (modal) modal.classList.add('hidden');

  if (window.switchNakesTab) {
    window.switchNakesTab('monitoring');
  }
}

export async function finishEvacuationProcess() {
  if (!confirm('Apakah pasien sudah berhasil dievakuasi ke Puskesmas/RSJ?')) return;

  const caseId = window.activeMonitoringCaseId || (window.activeSelectedCase ? window.activeSelectedCase.id : null);

  if (caseId && window.firebaseAdapter && window.firebaseAdapter.updateCaseStatus) {
    try {
      await window.firebaseAdapter.updateCaseStatus(caseId, 'MONITORING', 'Evakuasi berhasil, pasien menuju fasilitas kesehatan.');
    } catch { /* continue */ }
  }

  if (window.activeSelectedCase && (String(window.activeSelectedCase.id) === String(caseId) || window.activeSelectedCase.case_number === caseId)) {
    window.activeSelectedCase.status = 'MONITORING';
    window.activeSelectedCase.drug_compliance = window.activeSelectedCase.drug_compliance || 'RUTIN';
    if (!Array.isArray(window.activeSelectedCase.control_history)) {
      window.activeSelectedCase.control_history = [];
    }
  }

  if (window.monitoringTimer) {
    clearInterval(window.monitoringTimer);
    window.monitoringTimer = null;
  }

  alert('Evakuasi Berhasil Selesai! Pasien kini masuk ke tahap Monitoring & Pemantauan Minum Obat.');
  window.activeMonitoringCaseId = null;

  if (window.fetchCases) {
    await window.fetchCases();
  }
  if (window.fetchReports) {
    await window.fetchReports();
  }

  // Arahkan nakes langsung ke modul Jadwal Kontrol Obat agar pasien yang baru selesai dievakuasi langsung terlihat
  if (window.switchNakesTab) {
    window.switchNakesTab('kontrol');
  } else if (window.renderControlSchedules) {
    window.renderControlSchedules();
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.openSiagaFromReportDetail = openSiagaFromReportDetail;
  window.openSiagaFromReport = openSiagaFromReport;
  window.populateEwsSelects = populateEwsSelects;
  window.executeEwsActivation = executeEwsActivation;
  window.finishEvacuationProcess = finishEvacuationProcess;
  window.filterEwsGuruList = filterEwsGuruList;
  window.filterEwsRatoList = filterEwsRatoList;
  window.toggleGuruSelection = toggleGuruSelection;
  window.toggleRatoSelection = toggleRatoSelection;
  window.changeGuruPage = changeGuruPage;
  window.changeRatoPage = changeRatoPage;
  window.showEwsWaQueueModal = showEwsWaQueueModal;
  window.sendWaQueueItem = sendWaQueueItem;
  window.copyWaQueueMessage = copyWaQueueMessage;
  window.closeEwsWaQueueModal = closeEwsWaQueueModal;
}
