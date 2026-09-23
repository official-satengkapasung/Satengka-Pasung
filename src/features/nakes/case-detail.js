/**
 * SATENGKA PASUNG EWS — Case Detail & Patient Clinical Workflow (ES6 Module)
 * Mengelola rekam medis pasien, form edit pasien, peta lokasi kasus, sub-tab detail, dan validasi mandiri nakes.
 */

let caseDetailMapInstance = null;
let caseDetailMarker = null;

export function openEditPatientModal(caseId) {
  if (typeof document === 'undefined') return;
  const currentCases = window.currentCases || [];
  const c = currentCases.find(item => item.id === caseId);
  if (!c) {
    alert('Data pasien tidak ditemukan.');
    return;
  }

  document.getElementById('patientFormCaseId').value = c.id;
  document.getElementById('patientFormName').value = c.patient_name || '';
  document.getElementById('patientFormGender').value = c.gender || 'L';
  document.getElementById('patientFormAddress').value = c.patient_address || '';
  if (c.village_id && document.getElementById('patientFormVillage')) {
    document.getElementById('patientFormVillage').value = c.village_id;
  }
  document.getElementById('patientFormFamilyPhone').value = c.family_phone || '';
  document.getElementById('patientFormPriority').value = c.priority || 'NORMAL';
  document.getElementById('patientFormStatus').value = c.status || 'MONITORING';
  document.getElementById('patientFormNotes').value = c.notes || '';

  document.getElementById('patientFormTitle').innerText = `Edit Data Pasien: ${c.patient_name}`;
  document.getElementById('patientFormSubmitText').innerText = 'Perbarui Data Pasien';
  const icon = document.getElementById('patientFormHeaderIcon');
  if (icon) icon.className = 'fa-solid fa-user-pen';

  const modal = document.getElementById('modalPatientForm');
  if (modal) modal.classList.remove('hidden');
}

export function closePatientModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalPatientForm');
  if (modal) modal.classList.add('hidden');
}

export async function savePatientForm(event) {
  if (event && event.preventDefault) event.preventDefault();
  if (typeof document === 'undefined') return;

  const caseId = document.getElementById('patientFormCaseId')?.value;
  const vSelect = document.getElementById('patientFormVillage');
  const vId = vSelect ? Number(vSelect.value) : 1;
  const vName = vSelect && vSelect.options[vSelect.selectedIndex] ? vSelect.options[vSelect.selectedIndex].text : 'Kokop';

  const payload = {
    patient_name: document.getElementById('patientFormName')?.value.trim(),
    gender: document.getElementById('patientFormGender')?.value,
    village_id: vId,
    village_name: vName,
    patient_address: document.getElementById('patientFormAddress')?.value.trim(),
    family_phone: document.getElementById('patientFormFamilyPhone')?.value.trim(),
    priority: document.getElementById('patientFormPriority')?.value,
    status: document.getElementById('patientFormStatus')?.value,
    notes: document.getElementById('patientFormNotes')?.value.trim()
  };

  try {
    if (caseId) {
      if (window.firebaseAdapter && window.firebaseAdapter.updatePatient) {
        await window.firebaseAdapter.updatePatient(Number(caseId), payload);
      }
      if (window.showToast) window.showToast(`Data pasien ${payload.patient_name} berhasil diperbarui!`);
    } else {
      if (window.firebaseAdapter && window.firebaseAdapter.createPatient) {
        await window.firebaseAdapter.createPatient(payload);
      }
      if (window.showToast) window.showToast(`Data pasien baru ${payload.patient_name} berhasil ditambahkan!`);
    }

    closePatientModal();
    if (window.fetchCases) await window.fetchCases();
    if (window.renderPatientsTable) window.renderPatientsTable();
    if (window.renderAllCasesTable) window.renderAllCasesTable();
    if (window.renderControlSchedules) window.renderControlSchedules();
  } catch (err) {
    console.warn('Simpan pasien error:', err);
    alert('Gagal menyimpan data pasien: ' + err.message);
  }
}

export async function deletePatientAction(caseId, patientName) {
  if (!confirm(`Yakin ingin menghapus data pasien "${patientName}"? Seluruh jadwal kontrol dan rekaman kasus terkait pasien ini akan dihapus dari sistem.`)) return;

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.deletePatient) {
      await window.firebaseAdapter.deletePatient(caseId);
    }
    if (window.showToast) window.showToast(`Data pasien ${patientName} berhasil dihapus.`);
    if (window.fetchCases) await window.fetchCases();
    if (window.renderPatientsTable) window.renderPatientsTable();
    if (window.renderAllCasesTable) window.renderAllCasesTable();
  } catch (err) {
    console.warn('Delete patient error:', err);
    alert('Gagal menghapus pasien: ' + err.message);
  }
}

export function initOrUpdateCaseDetailMap(lat, lng, patientName, villageName) {
  if (typeof document === 'undefined') return;
  const mapContainer = document.getElementById('caseDetailLeafletMap');
  if (!mapContainer || typeof L === 'undefined') return;

  const targetCoords = [parseFloat(lat) || -7.0145, parseFloat(lng) || 113.0234];

  if (!caseDetailMapInstance) {
    caseDetailMapInstance = L.map('caseDetailLeafletMap', {
      center: targetCoords,
      zoom: 14,
      zoomControl: true
    });
    const primaryTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    });
    primaryTile.addTo(caseDetailMapInstance);
    setTimeout(() => { if (caseDetailMapInstance) caseDetailMapInstance.invalidateSize(); }, 50);
  } else {
    caseDetailMapInstance.setView(targetCoords, 14);
    setTimeout(() => { if (caseDetailMapInstance) caseDetailMapInstance.invalidateSize(); }, 50);
  }

  if (caseDetailMarker) {
    caseDetailMarker.setLatLng(targetCoords);
  } else {
    const patientPinIcon = L.divIcon({
      className: 'custom-pin-patient',
      html: `<div class="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm shadow-xl border-2 border-white font-bold animate-pulse"><i class="fa-solid fa-house-chimney-medical"></i></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    caseDetailMarker = L.marker(targetCoords, { icon: patientPinIcon }).addTo(caseDetailMapInstance);
  }

  const pName = (patientName || 'Pasien').replace(/'/g, "\\'");
  const vName = (villageName || 'Desa Kokop').replace(/'/g, "\\'");

  caseDetailMarker.bindPopup(`
    <div class="space-y-1.5 p-0.5">
      <strong>${patientName || 'Pasien'}</strong><br>
      <span class="text-slate-500 text-[10px]">${villageName || 'Desa Kokop'}</span><br>
      <span class="text-xs text-red-600 font-bold">Lokasi Penjemputan / Evakuasi</span>
      <div class="pt-1">
        <button type="button" onclick="openExternalMapsModal(${targetCoords[0]}, ${targetCoords[1]}, '${pName}', '${vName}')" class="w-full px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px] flex items-center justify-center space-x-1 shadow-sm">
          <i class="fa-solid fa-diamond-turn-right text-[9px]"></i>
          <span>Buka di Aplikasi Maps</span>
        </button>
      </div>
    </div>
  `).openPopup();
}

export function switchCaseDetailSubTab(tab) {
  if (typeof document === 'undefined') return;
  ['info', 'lokasi', 'foto', 'riwayat'].forEach(t => {
    const panel = document.getElementById('caseDetailPanel' + t.charAt(0).toUpperCase() + t.slice(1));
    const btn = document.getElementById('caseSubTab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (panel) panel.classList.add('hidden');
    if (btn) {
      btn.className = 'hover:text-slate-600 pb-2 transition';
    }
  });

  const activePanel = document.getElementById('caseDetailPanel' + tab.charAt(0).toUpperCase() + tab.slice(1));
  const activeBtn = document.getElementById('caseSubTab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (activePanel) activePanel.classList.remove('hidden');
  if (activeBtn) activeBtn.className = 'text-emerald-700 border-b-2 border-emerald-600 pb-2 transition font-bold';

  const activeSelectedCase = window.activeSelectedCase;
  if (tab === 'lokasi' && activeSelectedCase) {
    setTimeout(() => {
      initOrUpdateCaseDetailMap(
        activeSelectedCase.latitude,
        activeSelectedCase.longitude,
        activeSelectedCase.patient_name,
        activeSelectedCase.village_name
      );
    }, 80);
  }
}

export function selectCaseDetail(caseId) {
  if (typeof document === 'undefined') return;
  const currentCases = window.currentCases || [];
  const currentReports = window.currentReports || [];
  const currentUsers = window.currentUsers || [];
  const cleanRole = window.cleanRoleAccountName || (n => n);

  let activeSelectedCase = currentCases.find(c => String(c.id) === String(caseId));
  if (!activeSelectedCase) {
    const matchedReport = currentReports.find(r => String(r.id) === String(caseId));
    if (matchedReport && window.openReportDetail) {
      window.openReportDetail(matchedReport.id);
      return;
    }
    return;
  }
  window.activeSelectedCase = activeSelectedCase;

  document.getElementById('detailCaseNumber').innerText = activeSelectedCase.case_number;
  document.getElementById('detailPatientName').innerText = activeSelectedCase.patient_name;
  document.getElementById('detailPatientMeta').innerText = `${activeSelectedCase.gender === 'P' ? 'Perempuan' : 'Laki-laki'}, 32 tahun • ${activeSelectedCase.patient_address || activeSelectedCase.village_name}`;

  let rawRepName = activeSelectedCase.reporter_name;
  let repPhone = activeSelectedCase.reporter_phone;
  if ((!rawRepName || rawRepName === 'Siti') && activeSelectedCase.report_id) {
    const matchedRep = currentReports.find(r => String(r.id) === String(activeSelectedCase.report_id));
    if (matchedRep && matchedRep.reporter_name) {
      rawRepName = matchedRep.reporter_name;
      if (matchedRep.reporter_phone) repPhone = matchedRep.reporter_phone;
    }
  }
  if (!rawRepName || rawRepName === 'Siti') {
    const bhupaObj = (activeSelectedCase.participants || []).find(p => p.participant_role === 'BHUPA');
    if (bhupaObj && bhupaObj.name) {
      rawRepName = bhupaObj.name;
      if (bhupaObj.phone) repPhone = bhupaObj.phone;
    }
  }
  if (!rawRepName || rawRepName === 'Siti') {
    const matchedKader = currentUsers.find(u => u.role === 'KADER' && (String(u.id) === String(activeSelectedCase.reporter_id) || (u.village_id && String(u.village_id) === String(activeSelectedCase.village_id))));
    if (matchedKader) {
      rawRepName = matchedKader.name;
      if (matchedKader.phone) repPhone = matchedKader.phone;
    }
  }

  const repName = cleanRole(rawRepName || 'Kader Jiwa');
  repPhone = repPhone || '-';
  document.getElementById('detailReporterName').innerText = repName;
  document.getElementById('detailReporterPhone').innerText = repPhone;
  const cleanRepPhone = repPhone.replace(/\D/g, '').replace(/^0/, '62');
  const repWa = document.getElementById('detailReporterWaBtn');
  if (repWa) repWa.href = `https://wa.me/${cleanRepPhone}?text=${encodeURIComponent('Halo ' + repName + ', koordinasi Puskesmas Kokop terkait kasus pasien ' + activeSelectedCase.patient_name)}`;

  const guruObj = (activeSelectedCase.participants || []).find(p => p.participant_role === 'GURU');
  const rawGName = guruObj ? (guruObj.name || 'Kiai H. Kholil') : 'Kiai H. Kholil';
  const gName = cleanRole(rawGName);
  const gPhone = guruObj ? (guruObj.phone || '081234567892') : '081234567892';
  const elGName = document.getElementById('detailGuruName');
  const elGPhone = document.getElementById('detailGuruPhone');
  if (elGName) elGName.innerText = gName;
  if (elGPhone) elGPhone.innerText = gPhone;
  const gWa = document.getElementById('detailGuruWaBtn');
  if (gWa) gWa.href = `https://wa.me/${gPhone.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('Assalamualaikum ' + gName + ', koordinasi rembuk santun pasien ' + activeSelectedCase.patient_name + ' dari Puskesmas Kokop')}`;

  const ratoObj = (activeSelectedCase.participants || []).find(p => p.participant_role === 'RATO');
  const rawRName = ratoObj ? (ratoObj.name || 'Klebun Kokop') : 'Klebun Kokop';
  const rName = cleanRole(rawRName);
  const rPhone = ratoObj ? (ratoObj.phone || '081234567893') : '081234567893';
  const elRName = document.getElementById('detailRatoName');
  const elRPhone = document.getElementById('detailRatoPhone');
  if (elRName) elRName.innerText = rName;
  if (elRPhone) elRPhone.innerText = rPhone;
  const rWa = document.getElementById('detailRatoWaBtn');
  if (rWa) rWa.href = `https://wa.me/${rPhone.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('Halo ' + rName + ', koordinasi pengamanan evakuasi pasien ' + activeSelectedCase.patient_name + ' dari Puskesmas Kokop')}`;

  document.getElementById('detailDescription').innerText = activeSelectedCase.notes || 'Pasien dipasung di rumah, membutuhkan evakuasi medis dan rembuk santun.';

  // Panel GPS
  const lat = activeSelectedCase.latitude || -7.0145;
  const lng = activeSelectedCase.longitude || 113.0234;
  const coordsText = `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)} (${activeSelectedCase.village_name || 'Desa Kokop'})`;
  const coordsEl = document.getElementById('detailGpsCoordsText');
  if (coordsEl) coordsEl.innerText = coordsText;

  const gMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const gpsLink = document.getElementById('detailGpsLink');
  if (gpsLink) gpsLink.href = gMapsUrl;

  const btnOpenMaps = document.getElementById('btnOpenMaps');
  if (btnOpenMaps) {
    btnOpenMaps.onclick = () => {
      if (window.openExternalMapsModal) {
        window.openExternalMapsModal(lat, lng, activeSelectedCase.patient_name, activeSelectedCase.village_name || 'Desa Kokop');
      }
    };
  }

  // Panel Foto
  const imgPreview = document.getElementById('detailFotoPreview');
  const emptyText = document.getElementById('detailFotoEmptyText');
  if (imgPreview && emptyText) {
    if (activeSelectedCase.photo_path) {
      imgPreview.src = activeSelectedCase.photo_path;
      imgPreview.classList.remove('hidden');
      emptyText.classList.add('hidden');
    } else {
      imgPreview.classList.add('hidden');
      emptyText.classList.remove('hidden');
    }
  }

  // Banner Status
  const bannerStatusEl = document.getElementById('detailBannerStatus');
  const bannerIconEl = document.getElementById('detailBannerIcon');
  const bannerTitleEl = document.getElementById('detailBannerTitle');
  const bannerSubtitleEl = document.getElementById('detailBannerSubtitle');
  const bannerPilarEl = document.getElementById('detailBannerPilarStatus');
  const btnMainAction = document.getElementById('btnDetailMainAction');

  const parts = activeSelectedCase.participants || [];
  const guruP = parts.find(p => p.participant_role === 'GURU');
  const ratoP = parts.find(p => p.participant_role === 'RATO');

  let guruPill = '';
  if (guruP && (guruP.response === 'AGREE' || guruP.response === 'SIAP' || guruP.response === 'READY')) {
    guruPill = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain"> Bhu' Ghuru: Siap</span>`;
  } else if (guruP && guruP.response === 'NEED_TIME') {
    guruPill = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain"> Bhu' Ghuru: Butuh Waktu</span>`;
  } else {
    guruPill = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain opacity-60"> Bhu' Ghuru: Menunggu</span>`;
  }

  let ratoPill = '';
  if (ratoP && (ratoP.response === 'READY' || ratoP.response === 'SIAP' || ratoP.response === 'AGREE')) {
    ratoPill = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1"><img src="./assets/icons/role_rato.png" class="w-3 h-3 object-contain"> Rato: Siap Kawal</span>`;
  } else {
    ratoPill = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><img src="./assets/icons/role_rato.png" class="w-3 h-3 object-contain opacity-60"> Rato: Menunggu</span>`;
  }

  if (bannerPilarEl) {
    bannerPilarEl.innerHTML = guruPill + ratoPill;
  }

  const isActivated = activeSelectedCase.status === 'SIAGA' || activeSelectedCase.status === 'COORDINATION' || activeSelectedCase.status === 'READY_FOR_EVACUATION' || activeSelectedCase.status === 'EVACUATION';

  if (bannerStatusEl && bannerTitleEl && bannerSubtitleEl) {
    if (activeSelectedCase.status === 'READY_FOR_EVACUATION') {
      bannerStatusEl.className = 'bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs';
      bannerIconEl.className = 'w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0';
      bannerIconEl.innerHTML = '<i class="fa-solid fa-check-double"></i>';
      bannerTitleEl.className = 'font-bold text-emerald-800 text-sm';
      bannerTitleEl.innerText = 'Semua Pilar Siap (Evakuasi)';
      bannerSubtitleEl.className = 'text-[11px] text-emerald-700/80';
      bannerSubtitleEl.innerText = 'Bhu\' Ghuru & Rato telah mengonfirmasi kesiapan penjemputan';
    } else if (isActivated) {
      bannerStatusEl.className = 'bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs';
      bannerIconEl.className = 'w-7 h-7 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs shrink-0';
      bannerIconEl.innerHTML = '<i class="fa-solid fa-tower-broadcast"></i>';
      bannerTitleEl.className = 'font-bold text-amber-800 text-sm';
      bannerTitleEl.innerText = 'Status Siaga Koordinasi EWS';
      bannerSubtitleEl.className = 'text-[11px] text-amber-700/80';
      bannerSubtitleEl.innerText = (guruP && guruP.response === 'NEED_TIME') ? 'Kiai sedang menghubungi keluarga pasien' : 'Menunggu respon lengkap mitra lintas sektor';
    } else {
      bannerStatusEl.className = 'bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs';
      bannerIconEl.className = 'w-7 h-7 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-xs shrink-0';
      bannerIconEl.innerHTML = '!';
      bannerTitleEl.className = 'font-bold text-red-700 text-sm';
      bannerTitleEl.innerText = 'Kasus Perlu Penanganan';
      bannerSubtitleEl.className = 'text-[11px] text-red-600/80';
      bannerSubtitleEl.innerText = 'Silakan validasi laporan atau aktivasi siaga koordinasi';
    }
  }

  if (btnMainAction) {
    if (isActivated) {
      btnMainAction.className = 'w-1/2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-lg flex items-center justify-center';
      btnMainAction.innerHTML = '<i class="fa-solid fa-truck-medical mr-1.5"></i> <span>Buka Monitoring EWS</span>';
      btnMainAction.onclick = () => {
        window.activeMonitoringCaseId = activeSelectedCase.id;
        if (window.updateMonitoringStepper) window.updateMonitoringStepper(activeSelectedCase);
        if (window.startMonitoringWatch) window.startMonitoringWatch(activeSelectedCase.siaga_activated_at);
        if (window.switchNakesTab) window.switchNakesTab('monitoring');
      };
    } else {
      btnMainAction.className = 'w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg flex items-center justify-center';
      btnMainAction.innerHTML = '<i class="fa-solid fa-clipboard-check mr-1.5"></i> <span>Lanjut Validasi</span>';
      btnMainAction.onclick = () => goToValidasiScreen();
    }
  }

  const riwayatEl = document.getElementById('caseDetailPanelRiwayat');
  if (riwayatEl) {
    riwayatEl.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start space-x-3 text-xs">
          <span class="w-3 h-3 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
          <div>
            <p class="font-bold text-slate-800">Laporan Diterima Puskesmas</p>
            <p class="text-slate-500 text-[11px]">Dari: ${activeSelectedCase.reporter_name || 'Kader Jiwa'} • ${activeSelectedCase.village_name || 'Desa Kokop'}</p>
          </div>
        </div>
        <div class="flex items-start space-x-3 text-xs">
          <span class="w-3 h-3 rounded-full ${activeSelectedCase.priority ? 'bg-emerald-600' : 'bg-slate-300'} mt-1 shrink-0"></span>
          <div>
            <p class="font-bold text-slate-800">Validasi Medis & Prioritas</p>
            <p class="text-slate-500 text-[11px]">Tingkat Prioritas: <strong>${activeSelectedCase.priority || 'Belum divalidasi'}</strong></p>
          </div>
        </div>
        <div class="flex items-start space-x-3 text-xs">
          <span class="w-3 h-3 rounded-full ${guruP && guruP.response ? (guruP.response === 'AGREE' ? 'bg-emerald-600' : 'bg-amber-500') : 'bg-slate-300'} mt-1 shrink-0"></span>
          <div>
            <p class="font-bold text-slate-800">Pilar Bhu' Ghuru: ${guruP && guruP.response === 'AGREE' ? 'Siap Membantu' : (guruP && guruP.response === 'NEED_TIME' ? 'Butuh Waktu (Sedang Hubungi Keluarga)' : 'Menunggu Tanggapan')}</p>
            <p class="text-slate-500 text-[11px]">${guruP && guruP.response_note ? guruP.response_note : "Notifikasi siaga rembuk santun terkirim ke Bhu' Ghuru."}</p>
          </div>
        </div>
        <div class="flex items-start space-x-3 text-xs">
          <span class="w-3 h-3 rounded-full ${ratoP && ratoP.response === 'READY' ? 'bg-indigo-600' : 'bg-slate-300'} mt-1 shrink-0"></span>
          <div>
            <p class="font-bold text-slate-800">Pilar Rato: ${ratoP && ratoP.response === 'READY' ? 'Siap Kawal Pengamanan' : 'Menunggu Tanggapan'}</p>
            <p class="text-slate-500 text-[11px]">${ratoP && ratoP.response_note ? ratoP.response_note : 'Pemberitahuan pengawalan terkirim ke aparat desa.'}</p>
          </div>
        </div>
      </div>
    `;
  }

  switchCaseDetailSubTab('info');
  if (window.switchNakesTab) window.switchNakesTab('detail');
}

export function goToValidasiScreen() {
  if (typeof document === 'undefined') return;
  const activeSelectedCase = window.activeSelectedCase;
  if (!activeSelectedCase) return;
  const valPatient = document.getElementById('valPatientName');
  if (valPatient) valPatient.value = activeSelectedCase.patient_name;
  if (window.switchNakesTab) window.switchNakesTab('validasi');
}

export function goToAktivasiEwsScreen() {
  if (window.switchNakesTab) window.switchNakesTab('aktivasi_ews');
}

export async function validateOnlyNoDispatch() {
  if (typeof document === 'undefined') return;
  const activeSelectedCase = window.activeSelectedCase;
  const activeReportId = window.activeReportId;

  if (!activeSelectedCase && !activeReportId) {
    alert('Pilih kasus atau laporan terlebih dahulu untuk divalidasi.');
    return;
  }

  const prio = document.querySelector('input[name="val_prio"]:checked')?.value || 'HIGH';
  const notes = document.getElementById('valNotes')?.value.trim() || 'Laporan tervalidasi oleh Petugas Nakes Puskesmas Kokop.';
  const adapter = window.firebaseAdapter || window.malekkasEngine;

  try {
    if (activeReportId && adapter && adapter.validateReport) {
      const res = await adapter.validateReport(activeReportId, { priority: prio, notes: notes });
      if (res.success) {
        alert('✓ Laporan berhasil divalidasi!\nData kasus pasien telah otomatis terdaftar di Basis Data Kasus & Rekam Medis Puskesmas Kokop.');
        window.activeReportId = null;
        if (window.fetchCases) await window.fetchCases();
        if (window.fetchReports) await window.fetchReports();
        if (window.switchNakesTab) window.switchNakesTab('dashboard');
        return;
      }
    } else if (activeSelectedCase && adapter && adapter.updateCaseStatus) {
      await adapter.updateCaseStatus(activeSelectedCase.id, 'VALIDATED', notes);
      alert('✓ Status kasus berhasil divalidasi secara mandiri.');
      if (window.fetchCases) await window.fetchCases();
      if (window.fetchReports) await window.fetchReports();
      if (window.switchNakesTab) window.switchNakesTab('dashboard');
      return;
    }
  } catch (err) {
    console.warn('Validation error:', err);
  }
  window.activeReportId = null;
  if (window.fetchCases) await window.fetchCases();
  if (window.fetchReports) await window.fetchReports();
  alert('Validasi mandiri tersimpan.');
  if (window.switchNakesTab) window.switchNakesTab('dashboard');
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.openEditPatientModal = openEditPatientModal;
  window.closePatientModal = closePatientModal;
  window.savePatientForm = savePatientForm;
  window.deletePatientAction = deletePatientAction;
  window.initOrUpdateCaseDetailMap = initOrUpdateCaseDetailMap;
  window.switchCaseDetailSubTab = switchCaseDetailSubTab;
  window.selectCaseDetail = selectCaseDetail;
  window.goToValidasiScreen = goToValidasiScreen;
  window.goToAktivasiEwsScreen = goToAktivasiEwsScreen;
  window.validateOnlyNoDispatch = validateOnlyNoDispatch;
}
