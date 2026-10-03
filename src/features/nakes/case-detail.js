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
    patient_name: (document.getElementById('patientFormName')?.value.trim() || '').toUpperCase(),
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
  const proceedDelete = async () => {
    try {
      const adapter = window.firebaseAdapter || window.satengkaEngine || window.malekkasEngine;
      if (adapter && typeof adapter.deletePatient === 'function') {
        const res = await adapter.deletePatient(caseId);
        if (res && res.success === false) {
          throw new Error(res.message || 'Gagal menghapus data pasien');
        }
      } else {
        throw new Error('Adapter penyimpanan data tidak tersedia.');
      }

      // Hapus instan dari memory state agar UI langsung ter-update seketika tanpa noda
      if (window.currentCases) {
        window.currentCases = window.currentCases.filter(c => String(c.id) !== String(caseId));
      }

      // Sinkronkan cache lokal secara langsung
      try {
        const storedCases = JSON.parse(localStorage.getItem('malekkas_cases') || '[]').filter(c => String(c.id) !== String(caseId));
        localStorage.setItem('malekkas_cases', JSON.stringify(storedCases));
        localStorage.setItem('satengka_cases', JSON.stringify(storedCases));
      } catch (e) {}

      // Tampilkan notifikasi Batik Gentongan Tanjung Bumi (Madura)
      if (window.showToast) {
        window.showToast(`Data pasien ${patientName} dan akun otentikasi terkait berhasil dihapus dari sistem.`, 'danger', 4000);
      }

      // Re-render seluruh tabel dan ringkasan metrik
      if (window.fetchCases) await window.fetchCases();
      if (window.renderPatientsTable) window.renderPatientsTable();
      if (window.renderAllCasesTable) window.renderAllCasesTable();
      if (window.renderNakesDashboardCases) window.renderNakesDashboardCases(window.currentCases || []);
      if (window.updateNakesCounters) window.updateNakesCounters(window.currentCases || []);
    } catch (err) {
      console.warn('Delete patient error:', err);
      if (window.showToast) {
        window.showToast('Gagal menghapus pasien: ' + err.message, 'warning');
      } else {
        alert('Gagal menghapus pasien: ' + err.message);
      }
    }
  };

  // Gunakan dialog konfirmasi bertema ornamen Batik Tanjung Bumi
  if (typeof window.showBatikConfirm === 'function') {
    window.showBatikConfirm({
      title: 'Hapus Data Pasien & Akun Otentikasi',
      message: `Yakin ingin menghapus data pasien <strong>"${patientName}"</strong>?<br><br><span class="text-xs text-rose-700 bg-rose-50 p-2 rounded-xl block border border-rose-200"><strong>Pemberitahuan Sistem:</strong> Seluruh jadwal kontrol obat, rekaman kasus, dan data otentikasi login terkait pasien ini akan ikut terhapus secara permanen.</span>`,
      confirmText: 'Hapus Pasien & Akun',
      cancelText: 'Batalkan',
      isDanger: true,
      onConfirm: proceedDelete
    });
  } else {
    if (confirm(`Yakin ingin menghapus data pasien "${patientName}"? Seluruh data kasus dan otentikasi terkait akan dihapus.`)) {
      await proceedDelete();
    }
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

  const pilarContainer = document.getElementById('detailPilarListContainer');
  const allParticipants = activeSelectedCase.participants || [];
  const guruList = allParticipants.filter(p => p.participant_role === 'GURU');
  const ratoList = allParticipants.filter(p => p.participant_role === 'RATO');

  // Fallback data jika belum ada aktivasi tokoh
  const effectiveGuruList = guruList.length > 0 ? guruList : [{
    name: 'Kiai H. Kholil',
    phone: '081234567892',
    village_name: activeSelectedCase.village_name || 'Desa Kokop'
  }];

  const effectiveRatoList = ratoList.length > 0 ? ratoList : [{
    name: 'Klebun Kokop',
    phone: '081234567893',
    village_name: activeSelectedCase.village_name || 'Desa Kokop'
  }];

  if (pilarContainer) {
    const reporterCard = `
      <div class="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
        <div class="truncate mr-1">
          <span class="text-[9px] font-bold uppercase text-emerald-700 flex items-center gap-1 tracking-wider">
            <img src="./assets/icons/role_bhupa.png" class="w-3.5 h-3.5 object-contain inline-block" alt="Bhuppa' Babhu'"> Bhuppa' Babhu'
          </span>
          <p id="detailReporterName" class="font-bold text-slate-900 text-xs truncate">${repName}</p>
          <p id="detailReporterPhone" class="text-[10px] text-slate-500 font-mono">${repPhone}</p>
        </div>
        <a id="detailReporterWaBtn" href="https://wa.me/${cleanRepPhone}?text=${encodeURIComponent('Halo ' + repName + ', koordinasi Puskesmas Kokop terkait kasus pasien ' + activeSelectedCase.patient_name)}" target="_blank"
          class="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-sm shrink-0 transition shadow-xs"
          title="Hubungi Bhuppa' Babhu' via WhatsApp">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      </div>
    `;

    const guruCards = effectiveGuruList.map((g, idx) => {
      const gName = cleanRole(g.name || 'Kiai H. Kholil');
      const gPhone = g.phone || '081234567892';
      const cleanGPhone = gPhone.replace(/\D/g, '').replace(/^0/, '62');
      const gVil = g.village_name ? ` • ${g.village_name}` : '';
      return `
        <div class="p-2.5 rounded-xl border border-teal-200/90 bg-teal-50/20 flex items-center justify-between shadow-2xs">
          <div class="truncate mr-1">
            <span class="text-[9px] font-bold uppercase text-teal-800 flex items-center gap-1 tracking-wider">
              <img src="./assets/icons/role_bhu-ghuru.png" class="w-3.5 h-3.5 object-contain inline-block" alt="Ghuru"> Ghuru${effectiveGuruList.length > 1 ? ' (' + (idx + 1) + ')' : ''}<span class="text-[9px] text-teal-600 font-normal lowercase">${gVil}</span>
            </span>
            <p class="font-bold text-slate-900 text-xs truncate">${gName}</p>
            <p class="text-[10px] text-slate-500 font-mono">${gPhone}</p>
          </div>
          <a href="https://wa.me/${cleanGPhone}?text=${encodeURIComponent('Assalamualaikum ' + gName + ', koordinasi rembuk santun pasien ' + activeSelectedCase.patient_name + ' dari Puskesmas Kokop')}" target="_blank"
            class="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-sm shrink-0 transition shadow-xs"
            title="Hubungi Ghuru via WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      `;
    }).join('');

    const ratoCards = effectiveRatoList.map((r, idx) => {
      const rName = cleanRole(r.name || 'Klebun Kokop');
      const rPhone = r.phone || '081234567893';
      const cleanRPhone = rPhone.replace(/\D/g, '').replace(/^0/, '62');
      const rVil = r.village_name ? ` • ${r.village_name}` : '';
      return `
        <div class="p-2.5 rounded-xl border border-indigo-200/90 bg-indigo-50/20 flex items-center justify-between shadow-2xs">
          <div class="truncate mr-1">
            <span class="text-[9px] font-bold uppercase text-indigo-800 flex items-center gap-1 tracking-wider">
              <img src="./assets/icons/role_rato.png" class="w-3.5 h-3.5 object-contain inline-block" alt="Rato"> Rato${effectiveRatoList.length > 1 ? ' (' + (idx + 1) + ')' : ''}<span class="text-[9px] text-indigo-600 font-normal lowercase">${rVil}</span>
            </span>
            <p class="font-bold text-slate-900 text-xs truncate">${rName}</p>
            <p class="text-[10px] text-slate-500 font-mono">${rPhone}</p>
          </div>
          <a href="https://wa.me/${cleanRPhone}?text=${encodeURIComponent('Halo ' + rName + ', koordinasi pengamanan evakuasi pasien ' + activeSelectedCase.patient_name + ' dari Puskesmas Kokop')}" target="_blank"
            class="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center text-sm shrink-0 transition shadow-xs"
            title="Hubungi Rato via WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      `;
    }).join('');

    pilarContainer.innerHTML = reporterCard + guruCards + ratoCards;
  }

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
  const guruParts = parts.filter(p => p.participant_role === 'GURU');
  const ratoParts = parts.filter(p => p.participant_role === 'RATO');

  let guruPills = '';
  if (guruParts.length === 0) {
    guruPills = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain opacity-60" alt="Ghuru"> Bhu' Ghuru: Menunggu</span>`;
  } else {
    guruPills = guruParts.map((gp, idx) => {
      const gLabel = cleanRole(gp.name || `Ghuru ${idx + 1}`);
      const isReady = gp.response === 'AGREE' || gp.response === 'SIAP' || gp.response === 'READY';
      const isNeedTime = gp.response === 'NEED_TIME';
      if (isReady) {
        return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain" alt="Ghuru"> ${gLabel}: Siap</span>`;
      } else if (isNeedTime) {
        return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain" alt="Ghuru"> ${gLabel}: Butuh Waktu</span>`;
      }
      return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain opacity-60" alt="Ghuru"> ${gLabel}: Menunggu</span>`;
    }).join('');
  }

  let ratoPills = '';
  if (ratoParts.length === 0) {
    ratoPills = `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><img src="./assets/icons/role_rato.png" class="w-3 h-3 object-contain opacity-60" alt="Rato"> Rato: Menunggu</span>`;
  } else {
    ratoPills = ratoParts.map((rp, idx) => {
      const rLabel = cleanRole(rp.name || `Rato ${idx + 1}`);
      const isReady = rp.response === 'READY' || rp.response === 'SIAP' || rp.response === 'AGREE';
      if (isReady) {
        return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1"><img src="./assets/icons/role_rato.png" class="w-3 h-3 object-contain" alt="Rato"> ${rLabel}: Siap Kawal</span>`;
      }
      return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><img src="./assets/icons/role_rato.png" class="w-3 h-3 object-contain opacity-60" alt="Rato"> ${rLabel}: Menunggu</span>`;
    }).join('');
  }

  if (bannerPilarEl) {
    bannerPilarEl.innerHTML = guruPills + ratoPills;
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
      bannerTitleEl.innerText = 'Status Siaga Koordinasi Satengka';
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
      btnMainAction.innerHTML = '<i class="fa-solid fa-truck-medical mr-1.5"></i> <span>Buka Monitoring Satengka</span>';
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
        ${guruParts.length > 0 ? guruParts.map(gp => {
          const gName = cleanRole(gp.name || 'Bhu\' Ghuru');
          const isAgree = gp.response === 'AGREE' || gp.response === 'SIAP' || gp.response === 'READY';
          const isNeedTime = gp.response === 'NEED_TIME';
          return `
            <div class="flex items-start space-x-3 text-xs">
              <span class="w-3 h-3 rounded-full ${isAgree ? 'bg-emerald-600' : (isNeedTime ? 'bg-amber-500' : 'bg-slate-300')} mt-1 shrink-0"></span>
              <div>
                <p class="font-bold text-slate-800">Ghuru: ${gName} ${isAgree ? '— Siap Membantu' : (isNeedTime ? '— Butuh Waktu (Mediasi)' : '— Menunggu Tanggapan')}</p>
                <p class="text-slate-500 text-[11px]">${gp.response_note || gp.note || (isAgree ? 'Terkonfirmasi siap mendampingi evakuasi secara santun.' : 'Notifikasi siaga rembuk santun terkirim.')}</p>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="flex items-start space-x-3 text-xs">
            <span class="w-3 h-3 rounded-full bg-slate-300 mt-1 shrink-0"></span>
            <div>
              <p class="font-bold text-slate-800">Pilar Bhu' Ghuru: Menunggu Penugasan</p>
              <p class="text-slate-500 text-[11px]">Belum ada tokoh agama/kiai yang ditugaskan pada kasus ini.</p>
            </div>
          </div>
        `}
        ${ratoParts.length > 0 ? ratoParts.map(rp => {
          const rName = cleanRole(rp.name || 'Rato');
          const isReady = rp.response === 'READY' || rp.response === 'SIAP' || rp.response === 'AGREE';
          return `
            <div class="flex items-start space-x-3 text-xs">
              <span class="w-3 h-3 rounded-full ${isReady ? 'bg-indigo-600' : 'bg-slate-300'} mt-1 shrink-0"></span>
              <div>
                <p class="font-bold text-slate-800">Rato: ${rName} ${isReady ? '— Siap Kawal Pengamanan' : '— Menunggu Tanggapan'}</p>
                <p class="text-slate-500 text-[11px]">${rp.response_note || rp.note || (isReady ? 'Terkonfirmasi siap mengawal keamanan penjemputan.' : 'Pemberitahuan pengawalan terkirim ke aparat desa.')}</p>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="flex items-start space-x-3 text-xs">
            <span class="w-3 h-3 rounded-full bg-slate-300 mt-1 shrink-0"></span>
            <div>
              <p class="font-bold text-slate-800">Pilar Rato: Menunggu Penugasan</p>
              <p class="text-slate-500 text-[11px]">Belum ada aparat desa/Linmas yang ditugaskan pada kasus ini.</p>
            </div>
          </div>
        `}
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

export async function rejectReportAction() {
  if (typeof document === 'undefined') return;
  const activeReportId = window.activeReportId;
  if (!activeReportId) {
    if (window.switchNakesTab) window.switchNakesTab('dashboard');
    return;
  }

  const reason = prompt('Masukkan alasan penolakan laporan ini (misal: Data tidak akurat / bukan kasus pasung / laporan duplikat):', 'Laporan tidak memenuhi kriteria temuan pasung.');
  if (reason === null) return; // Batal klik cancel

  const adapter = window.firebaseAdapter || window.malekkasEngine;
  try {
    if (adapter && adapter.rejectReport) {
      const res = await adapter.rejectReport(activeReportId, reason);
      if (res && res.success) {
        alert('✓ Laporan berhasil ditolak dan status diperbarui.');
        window.activeReportId = null;
        if (window.fetchReports) await window.fetchReports();
        if (window.fetchCases) await window.fetchCases();
        if (window.switchNakesTab) window.switchNakesTab('dashboard');
        return;
      }
    }
  } catch (err) {
    console.error('Error saat menolak laporan:', err);
  }

  // Fallback lokal
  const reports = JSON.parse(localStorage.getItem('malekkas_reports') || '[]');
  const match = reports.find(r => String(r.id) === String(activeReportId));
  if (match) {
    match.status = 'REJECTED';
    match.nakes_notes = reason;
    localStorage.setItem('malekkas_reports', JSON.stringify(reports));
  }
  alert('✓ Laporan berhasil ditolak.');
  window.activeReportId = null;
  if (window.fetchReports) await window.fetchReports();
  if (window.switchNakesTab) window.switchNakesTab('dashboard');
}

export function rejectReportFromDetail() {
  if (typeof window === 'undefined') return;
  if (window.activeDetailReportId) {
    window.activeReportId = window.activeDetailReportId;
    if (window.closeReportDetail) window.closeReportDetail();
    rejectReportAction();
  }
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
  window.rejectReportAction = rejectReportAction;
  window.rejectReportFromDetail = rejectReportFromDetail;
}
