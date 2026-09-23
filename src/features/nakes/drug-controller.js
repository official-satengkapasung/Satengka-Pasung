/**
 * SATENGKA PASUNG EWS — Drug & Post-Evacuation Control Module (ES6 Module)
 * Mengelola jadwal kontrol obat, pemantauan kepatuhan minum obat, dan pengingat WhatsApp faskes.
 */

export function changeKontrolPage(newPage) {
  if (window.paginationState && window.paginationState.kontrol) {
    window.paginationState.kontrol.page = newPage;
  }
  handleKontrolFilterSort(false);
}

export function changeKontrolPerPage(val) {
  if (window.paginationState && window.paginationState.kontrol) {
    window.paginationState.kontrol.perPage = parseInt(val) || 5;
    window.paginationState.kontrol.page = 1;
  }
  handleKontrolFilterSort(false);
}

export function handleKontrolFilterSort(resetPage = false) {
  if (typeof document === 'undefined') return;
  const pState = window.paginationState?.kontrol || { page: 1, perPage: 5 };
  if (resetPage) pState.page = 1;

  const currentCases = window.currentCases || [];
  const q = (document.getElementById('searchKontrolInput')?.value || '').toLowerCase().trim();
  const compFilter = document.getElementById('filterKontrolCompliance')?.value || '';
  const sortVal = document.getElementById('sortKontrol')?.value || 'name_asc';

  let list = currentCases.filter(c => c.status === 'MONITORING' || c.status === 'CLOSED');

  if (q) {
    list = list.filter(c =>
      (c.patient_name || '').toLowerCase().includes(q) ||
      (c.village_name || '').toLowerCase().includes(q) ||
      (c.patient_address || '').toLowerCase().includes(q) ||
      (c.drug_notes || '').toLowerCase().includes(q)
    );
  }

  if (compFilter) {
    list = list.filter(c => {
      const history = Array.isArray(c.control_history) ? c.control_history : [];
      const lastVisit = history[history.length - 1];
      const displayCompliance = lastVisit ? lastVisit.compliance : (c.drug_compliance || 'RUTIN');
      return displayCompliance === compFilter;
    });
  }

  // Sortir
  list.sort((a, b) => {
    const hA = Array.isArray(a.control_history) ? a.control_history.length : 0;
    const hB = Array.isArray(b.control_history) ? b.control_history.length : 0;
    if (sortVal === 'name_asc') {
      return (a.patient_name || '').localeCompare(b.patient_name || '');
    } else if (sortVal === 'name_desc') {
      return (b.patient_name || '').localeCompare(a.patient_name || '');
    } else if (sortVal === 'visits_desc') {
      return hB - hA;
    } else if (sortVal === 'visits_asc') {
      return hA - hB;
    }
    return 0;
  });

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / pState.perPage) || 1;
  if (pState.page > totalPages) pState.page = totalPages;

  const start = (pState.page - 1) * pState.perPage;
  const pagedData = list.slice(start, start + pState.perPage);

  const container = document.getElementById('controlSchedulesContainer');
  if (container) {
    const allMonitoringCount = currentCases.filter(c => c.status === 'MONITORING' || c.status === 'CLOSED').length;
    if (allMonitoringCount === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">Belum ada jadwal kontrol aktif. Pasien yang telah selesai evakuasi akan masuk ke daftar ini secara otomatis.</div>`;
    } else if (pagedData.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">Tidak ada jadwal kontrol yang sesuai dengan pencarian atau filter kepatuhan obat.</div>`;
    } else {
      container.innerHTML = pagedData.map(c => {
        const history = Array.isArray(c.control_history) ? c.control_history : [];
        const visitCount = history.length;
        const lastVisit = history[history.length - 1];
        const displayCompliance = lastVisit ? lastVisit.compliance : (c.drug_compliance || 'RUTIN');
        const displayNotes = lastVisit ? lastVisit.notes : (c.drug_notes || '');

        return `
        <div onclick="openKontrolObatModal('${c.id}')" class="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs shadow-sm transition group">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition">
              <i class="fa-solid fa-pills"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="font-bold text-slate-900 text-sm group-hover:text-emerald-800">${c.patient_name}</h4>
                <span class="text-[11px] font-semibold text-slate-500">(${c.village_name || 'Desa Kokop'})</span>
              </div>
              <p class="text-slate-500 text-[11px]">
                <i class="fa-solid fa-clipboard-check text-emerald-700 mr-1"></i>
                <span class="font-bold text-slate-700">${visitCount > 0 ? `Total ${visitCount} Kali Kontrol` : 'Belum Ada Riwayat Kontrol'}</span> • Pendamping: Kader Jiwa Desa
              </p>
              ${displayNotes ? `<p class="text-[11px] text-emerald-700 font-medium mt-0.5"><i class="fa-solid fa-notes-medical mr-1"></i>Catatan Terakhir: ${displayNotes}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center space-x-2 shrink-0">
            <span class="px-2.5 py-1 rounded-full ${displayCompliance === 'PUTUS_OBAT' ? 'bg-red-100 text-red-700' : displayCompliance === 'PERLU_PERHATIAN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} font-bold text-[10px]">
              ${displayCompliance === 'PUTUS_OBAT' ? 'Putus Obat' : displayCompliance === 'PERLU_PERHATIAN' ? 'Perlu Perhatian' : 'Rutin Minum Obat'}
            </span>
            <button type="button" class="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs group-hover:bg-emerald-700 group-hover:text-white transition flex items-center space-x-1">
              <i class="fa-solid fa-calendar-check text-[10px]"></i>
              <span>Riwayat & Kontrol</span>
            </button>
          </div>
        </div>
        `;
      }).join('');
    }
  }

  if (window.renderPaginationControls) {
    window.renderPaginationControls({
      containerId: 'kontrolPaginationContainer',
      totalItems: totalItems,
      currentPage: pState.page,
      perPage: pState.perPage,
      onPageChangeName: 'changeKontrolPage',
      entityName: 'jadwal kontrol'
    });
  }
}

export function renderControlSchedules() {
  handleKontrolFilterSort(false);
}

export function openKontrolObatModal(caseId) {
  const currentCases = window.currentCases || [];
  const currentUsers = window.currentUsers || [];
  const c = currentCases.find(item => item.id === caseId);
  if (!c) return;
  window.activeDrugMonitoringCase = c;

  const modal = document.getElementById('modalKontrolObatDetail');
  if (!modal) return;

  if (!Array.isArray(c.control_history)) {
    c.control_history = [];
    if (c.drug_notes || c.drug_compliance) {
      c.control_history.push({
        visit_number: 1,
        date: c.updated_at ? c.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
        compliance: c.drug_compliance || 'RUTIN',
        notes: c.drug_notes || 'Pencatatan kontrol awal pasca evakuasi.',
        recorded_by: 'Petugas Puskesmas Kokop'
      });
    }
  }

  document.getElementById('mKontrolPatientTitle').innerText = `${c.patient_name} (${c.village_name || 'Desa Kokop'})`;
  document.getElementById('mKontrolSubtitle').innerText = `${c.case_number || 'Kasus ODGJ'} • Alamat: ${c.patient_address || c.village_name || 'Desa Kokop'}`;
  document.getElementById('mKontrolFamilyName').innerText = `Keluarga Bhuppa' Bhu' (${c.village_name || 'Desa Kokop'})`;

  const kader = currentUsers.find(u => u.role === 'KADER' && String(u.village_id) === String(c.village_id)) || currentUsers.find(u => u.role === 'KADER');
  const kaderPhone = kader ? (kader.phone || '081234567890') : (c.reporter_phone || '081234567890');
  const cleanRole = window.cleanRoleAccountName || (n => n);
  document.getElementById('mKontrolKaderName').innerText = kader ? kader.name : 'Kader Jiwa Kokop';
  document.getElementById('mKontrolKaderPhone').innerText = kaderPhone;
  document.getElementById('mKontrolBtnKaderPhone').innerText = `Kirim WA ke ${kaderPhone} - ${cleanRole(kader ? kader.name : 'Pendamping')}`;

  const familyPhoneInput = document.getElementById('mKontrolFamilyPhoneInput');
  const famPhone = c.family_phone || '081987654321';
  if (familyPhoneInput) familyPhoneInput.value = famPhone;
  document.getElementById('mKontrolBtnFamilyPhone').innerText = `Kirim WA ke ${famPhone} (Keluarga ${c.patient_name})`;

  const lastVisit = c.control_history.length > 0 ? c.control_history[c.control_history.length - 1] : null;
  const currentComp = lastVisit ? lastVisit.compliance : (c.drug_compliance || 'RUTIN');
  const badge = document.getElementById('mKontrolStatusBadge');
  if (badge) {
    badge.innerText = (currentComp === 'PUTUS_OBAT') ? 'Putus Obat' : (currentComp === 'PERLU_PERHATIAN') ? 'Perlu Perhatian' : 'Rutin Minum Obat';
    badge.className = `px-2.5 py-0.5 rounded-full text-[10px] font-bold ${currentComp === 'PUTUS_OBAT' ? 'bg-red-100 text-red-700' : currentComp === 'PERLU_PERHATIAN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`;
  }

  const dateInput = document.getElementById('mKontrolDateInput');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  const statusSelect = document.getElementById('mKontrolStatusSelect');
  if (statusSelect) statusSelect.value = currentComp;

  const notesEl = document.getElementById('mKontrolNotes');
  if (notesEl) notesEl.value = '';

  renderKontrolHistoryList();
  modal.classList.remove('hidden');
}

export function renderKontrolHistoryList() {
  const c = window.activeDrugMonitoringCase;
  if (!c) return;
  const history = Array.isArray(c.control_history) ? c.control_history : [];

  const countEl = document.getElementById('mKontrolVisitCount');
  if (countEl) countEl.innerText = history.length;

  const nextVisitBadge = document.getElementById('mKontrolNextVisitBadge');
  if (nextVisitBadge && window.editingControlVisitNum === null) {
    nextVisitBadge.innerText = `Kunjungan Ke-${history.length + 1}`;
  }

  const historyContainer = document.getElementById('mKontrolHistoryList');
  if (!historyContainer) return;

  if (history.length === 0) {
    historyContainer.innerHTML = `
      <div class="p-3 text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-xl text-xs">
        Belum ada catatan kunjungan kontrol obat. Silakan isi form di bawah untuk kunjungan ke-1.
      </div>
    `;
    return;
  }

  const escape = window.escapeHtml || (s => s);

  historyContainer.innerHTML = [...history].reverse().map((item) => {
    const badgeColor = item.compliance === 'PUTUS_OBAT' ? 'bg-red-100 text-red-700' : item.compliance === 'PERLU_PERHATIAN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';
    const complianceLabel = item.compliance === 'PUTUS_OBAT' ? 'Putus Obat' : item.compliance === 'PERLU_PERHATIAN' ? 'Perlu Perhatian' : 'Rutin Minum Obat';

    return `
      <div class="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition text-xs space-y-1.5 shadow-2xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="font-bold text-slate-900 font-mono">Kunjungan Ke-${item.visit_number}</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-500 font-medium">${item.date || '-'}</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${badgeColor}">
              ${complianceLabel}
            </span>
            <button onclick="editControlVisit(${item.visit_number})" title="Edit Kunjungan Ini" class="text-slate-400 hover:text-amber-600 p-1 rounded transition">
              <i class="fa-solid fa-pen text-[10px]"></i>
            </button>
            <button onclick="deleteControlVisitAction(${item.visit_number})" title="Hapus Kunjungan Ini" class="text-slate-400 hover:text-rose-600 p-1 rounded transition">
              <i class="fa-solid fa-trash text-[10px]"></i>
            </button>
          </div>
        </div>
        <p class="text-slate-700 bg-slate-50 p-2 rounded-lg leading-relaxed whitespace-pre-wrap">${escape(item.notes || '-')}</p>
        <div class="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
          <span>Dicatat oleh: <strong>${escape(item.recorded_by || 'Petugas Puskesmas')}</strong></span>
        </div>
      </div>
    `;
  }).join('');
}

export function editControlVisit(visitNumber) {
  const c = window.activeDrugMonitoringCase;
  if (!c || !Array.isArray(c.control_history)) return;
  const visit = c.control_history.find(v => Number(v.visit_number) === Number(visitNumber));
  if (!visit) return;

  window.editingControlVisitNum = visitNumber;

  const dateInput = document.getElementById('mKontrolDateInput');
  if (dateInput) dateInput.value = visit.date || new Date().toISOString().split('T')[0];

  const statusSelect = document.getElementById('mKontrolStatusSelect');
  if (statusSelect) statusSelect.value = visit.compliance || 'RUTIN';

  const notesEl = document.getElementById('mKontrolNotes');
  if (notesEl) notesEl.value = visit.notes || '';

  const badge = document.getElementById('mKontrolNextVisitBadge');
  if (badge) {
    badge.innerText = `Edit Kunjungan Ke-${visitNumber}`;
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800';
  }

  const btnCancel = document.getElementById('mKontrolBtnCancelEdit');
  if (btnCancel) btnCancel.classList.remove('hidden');

  const btnSubmit = document.getElementById('mKontrolBtnSubmit');
  if (btnSubmit) {
    btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk mr-1"></i> Perbarui Kunjungan Ke-${visitNumber}`;
  }
}

export function cancelEditControlVisit() {
  window.editingControlVisitNum = null;

  const dateInput = document.getElementById('mKontrolDateInput');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  const statusSelect = document.getElementById('mKontrolStatusSelect');
  if (statusSelect) statusSelect.value = 'RUTIN';

  const notesEl = document.getElementById('mKontrolNotes');
  if (notesEl) notesEl.value = '';

  const c = window.activeDrugMonitoringCase;
  const count = (c && Array.isArray(c.control_history)) ? c.control_history.length : 0;
  const badge = document.getElementById('mKontrolNextVisitBadge');
  if (badge) {
    badge.innerText = `Kunjungan Ke-${count + 1}`;
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800';
  }

  const btnCancel = document.getElementById('mKontrolBtnCancelEdit');
  if (btnCancel) btnCancel.classList.add('hidden');

  const btnSubmit = document.getElementById('mKontrolBtnSubmit');
  if (btnSubmit) {
    btnSubmit.innerHTML = `<i class="fa-solid fa-plus mr-1"></i> Simpan Catatan Kunjungan`;
  }
}

export async function deleteControlVisitAction(visitNumber) {
  const c = window.activeDrugMonitoringCase;
  if (!c || !Array.isArray(c.control_history)) return;

  if (!confirm(`Hapus catatan kunjungan ke-${visitNumber}? Tindakan ini tidak dapat dibatalkan.`)) return;

  c.control_history = c.control_history.filter(v => Number(v.visit_number) !== Number(visitNumber));

  if (c.control_history.length > 0) {
    const last = c.control_history[c.control_history.length - 1];
    c.drug_compliance = last.compliance;
    c.drug_notes = last.notes;
  } else {
    c.drug_compliance = 'RUTIN';
    c.drug_notes = '';
  }

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.deleteControlVisit) {
      await window.firebaseAdapter.deleteControlVisit(c.id, visitNumber);
    }
    if (window.malekkasEngine && window.malekkasEngine.saveAllData) {
      window.malekkasEngine.saveAllData();
    }
    cancelEditControlVisit();
    renderControlSchedules();
    renderKontrolHistoryList();
    if (window.showToast) window.showToast(`Kunjungan ke-${visitNumber} berhasil dihapus.`);
  } catch (err) {
    console.error('Delete visit error:', err);
    alert('Gagal menghapus kunjungan: ' + err.message);
  }
}

export function updateFamilyPhoneFromModal() {
  const c = window.activeDrugMonitoringCase;
  if (!c) return;
  const newPhone = document.getElementById('mKontrolFamilyPhoneInput').value.trim();
  if (!newPhone) {
    alert('Nomor HP keluarga tidak boleh kosong.');
    return;
  }
  c.family_phone = newPhone;
  document.getElementById('mKontrolBtnFamilyPhone').innerText = `Kirim WA ke ${newPhone} (Keluarga ${c.patient_name})`;

  if (window.firebaseAdapter && window.firebaseAdapter.updatePatient) {
    window.firebaseAdapter.updatePatient(c.id, { family_phone: newPhone });
  }
  if (window.showToast) window.showToast('Nomor WhatsApp keluarga berhasil diperbarui!');
}

export function closeKontrolObatModal() {
  cancelEditControlVisit();
  const modal = document.getElementById('modalKontrolObatDetail');
  if (modal) modal.classList.add('hidden');
  window.activeDrugMonitoringCase = null;
}

export async function saveKontrolObatStatus() {
  const c = window.activeDrugMonitoringCase;
  if (!c) return;
  const comp = document.getElementById('mKontrolStatusSelect').value;
  const notes = document.getElementById('mKontrolNotes').value.trim();
  const visitDate = document.getElementById('mKontrolDateInput').value || new Date().toISOString().split('T')[0];
  const famPhone = document.getElementById('mKontrolFamilyPhoneInput').value.trim();
  const currentUser = window.currentUser;

  if (famPhone) {
    c.family_phone = famPhone;
  }

  if (!notes) {
    alert('Mohon tuliskan catatan kunjungan atau hasil pemeriksaan obat.');
    return;
  }

  if (window.editingControlVisitNum !== null) {
    const vNum = window.editingControlVisitNum;
    const updateData = {
      date: visitDate,
      compliance: comp,
      notes: notes,
      recorded_by: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Petugas Puskesmas Kokop'
    };

    if (Array.isArray(c.control_history)) {
      const idx = c.control_history.findIndex(v => Number(v.visit_number) === Number(vNum));
      if (idx !== -1) {
        c.control_history[idx] = {
          ...c.control_history[idx],
          ...updateData,
          visit_number: Number(vNum)
        };
        if (idx === c.control_history.length - 1) {
          c.drug_compliance = comp;
          c.drug_notes = notes;
        }
      }
    }

    try {
      if (window.firebaseAdapter && window.firebaseAdapter.updateControlVisit) {
        await window.firebaseAdapter.updateControlVisit(c.id, vNum, updateData);
      }
      if (window.malekkasEngine && window.malekkasEngine.saveAllData) {
        window.malekkasEngine.saveAllData();
      }
      cancelEditControlVisit();
      renderControlSchedules();
      renderKontrolHistoryList();
      if (window.showToast) window.showToast(`Kunjungan Ke-${vNum} berhasil diperbarui!`);
    } catch (err) {
      console.warn('Update visit error:', err);
      alert('Gagal memperbarui kunjungan: ' + err.message);
    }
    return;
  }

  if (!Array.isArray(c.control_history)) {
    c.control_history = [];
  }

  const nextVisitNum = c.control_history.length + 1;
  const newVisitRecord = {
    visit_number: nextVisitNum,
    date: visitDate,
    compliance: comp,
    notes: notes,
    recorded_by: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Petugas Puskesmas Kokop',
    timestamp: new Date().toISOString()
  };

  c.control_history.push(newVisitRecord);
  c.drug_compliance = comp;
  c.drug_notes = notes;

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.updateCaseStatus) {
      await window.firebaseAdapter.updateCaseStatus(
        c.id,
        c.status,
        `[Kontrol Ke-${nextVisitNum}] ${comp}: ${notes}`
      );
    }
    if (window.firebaseAdapter && window.firebaseAdapter.updateControlVisit) {
      await window.firebaseAdapter.updateControlVisit(c.id, nextVisitNum, newVisitRecord);
    }
    if (window.malekkasEngine && window.malekkasEngine.saveAllData) {
      window.malekkasEngine.saveAllData();
    }
  } catch (e) {
    console.warn('Sync drug status error:', e);
  }

  if (window.showToast) window.showToast(`Berhasil menyimpan Kunjungan Kontrol Ke-${nextVisitNum}!`);
  renderControlSchedules();
  renderKontrolHistoryList();

  document.getElementById('mKontrolNotes').value = '';
}

export function sendTargetedDrugReminder(targetRole) {
  const c = window.activeDrugMonitoringCase;
  if (!c) {
    alert('Pilih pasien terlebih dahulu.');
    return;
  }

  const patientName = c.patient_name;
  const villageName = c.village_name || 'Desa Kokop';
  const history = Array.isArray(c.control_history) ? c.control_history : [];
  const visitCount = history.length;
  const lastVisit = history[history.length - 1];
  const formatComp = window.formatComplianceIndo || (comp => comp);
  const complianceText = lastVisit ? formatComp(lastVisit.compliance) : formatComp(c.drug_compliance || 'Rutin Minum Obat');
  const currentUsers = window.currentUsers || [];

  if (targetRole === 'kader') {
    const kader = currentUsers.find(u => u.role === 'KADER' && String(u.village_id) === String(c.village_id)) || currentUsers.find(u => u.role === 'KADER');
    let phone = kader && kader.phone ? kader.phone : (c.reporter_phone || '081234567890');
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

    const cleanRole = window.cleanRoleAccountName || (n => n);
    const waText = encodeURIComponent(`*PENGINGAT KONTROL & OBAT BERKALA (PUSKESMAS KOKOP)*\n\nKepada Yth. Kader Jiwa (${kader ? cleanRole(kader.name) : 'Pendamping'}),\nMohon lakukan kunjungan rumah untuk pemantauan kepatuhan minum obat pada warga binaan:\n\nNama Pasien: *${patientName}*\nWilayah: *${villageName}*\nStatus Kontrol: ${visitCount > 0 ? `Kunjungan Ke-${visitCount}` : 'Kunjungan Awal'}\nStatus Kepatuhan: *${complianceText}*\nCatatan Terakhir: ${lastVisit ? lastVisit.notes : (c.drug_notes || '-')}\n\nPastikan stok obat mencukupi dan keluarga terus mendampingi dengan tenang. Terima kasih atas dedikasi Anda!`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}`, '_blank');
  } else if (targetRole === 'keluarga') {
    let phone = c.family_phone || document.getElementById('mKontrolFamilyPhoneInput').value.trim() || '081987654321';
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

    const waText = encodeURIComponent(`*PENGINGAT MINUM OBAT & KONTROL DARI PUSKESMAS KOKOP*\n\nAssalamu’alaikum Wr. Wb. Bhuppa’ Bhu’ (Keluarga ${patientName}),\nSemoga senantiasa diberikan kesehatan dan ketenteraman keluarga.\n\nKami dari Petugas Kesehatan Puskesmas Kokop mengingatkan agar Bapak/Ibu mendampingi saudara kita *${patientName}* untuk rutin meminum obat sesuai dosis dokter (Catatan: ${visitCount > 0 ? `Tahap Pemulihan Kontrol Ke-${visitCount}` : 'Pemantauan Rutin'}).\n\nBila ada keluhan atau obat akan habis, segera hubungi Kader Jiwa desa kita. Matator sakalangkong atas perhatian dan kasih sayang keluarga.`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}`, '_blank');
  }
}

// 🛡️ Global Window Bridge
if (typeof window !== 'undefined') {
  window.changeKontrolPage = changeKontrolPage;
  window.changeKontrolPerPage = changeKontrolPerPage;
  window.handleKontrolFilterSort = handleKontrolFilterSort;
  window.renderControlSchedules = renderControlSchedules;
  window.openKontrolObatModal = openKontrolObatModal;
  window.renderKontrolHistoryList = renderKontrolHistoryList;
  window.editControlVisit = editControlVisit;
  window.cancelEditControlVisit = cancelEditControlVisit;
  window.deleteControlVisitAction = deleteControlVisitAction;
  window.updateFamilyPhoneFromModal = updateFamilyPhoneFromModal;
  window.closeKontrolObatModal = closeKontrolObatModal;
  window.saveKontrolObatStatus = saveKontrolObatStatus;
  window.sendTargetedDrugReminder = sendTargetedDrugReminder;
}
