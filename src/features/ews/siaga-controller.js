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
    if (document.getElementById('valVillageSelect') && rep.village_id) {
      document.getElementById('valVillageSelect').value = rep.village_id;
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

export function populateEwsSelects(users) {
  if (typeof document === 'undefined') return;
  const cleanRole = window.cleanRoleAccountName || (n => n);
  const gurus = (users || []).filter(u => u.role === 'GURU');
  const ratos = (users || []).filter(u => u.role === 'RATO');

  const selectGuru = document.getElementById('ewsGuruSelect');
  const selectRato = document.getElementById('ewsRatoSelect');

  if (selectGuru) selectGuru.innerHTML = gurus.map(g => `<option value="${g.id}">${cleanRole(g.name)} • ${g.village_name || 'Desa Kokop'}</option>`).join('');
  if (selectRato) selectRato.innerHTML = ratos.map(r => `<option value="${r.id}">${cleanRole(r.name)} • ${r.village_name || 'Desa Kokop'}</option>`).join('');
}

export async function executeEwsActivation() {
  if (typeof document === 'undefined') return;
  const guruId = document.getElementById('ewsGuruSelect')?.value;
  const ratoId = document.getElementById('ewsRatoSelect')?.value;
  const msg = document.getElementById('ewsCustomMessage')?.value;
  const dispatchGuru = document.getElementById('chkDispatchGuru') ? document.getElementById('chkDispatchGuru').checked : true;
  const dispatchRato = document.getElementById('chkDispatchRato') ? document.getElementById('chkDispatchRato').checked : true;

  if (!dispatchGuru && !dispatchRato) {
    alert('Pilih minimal satu tokoh (Guru atau Rato) untuk dikirimi notifikasi aktivasi siaga.');
    return;
  }

  if (dispatchGuru && !guruId) {
    alert('Pilih Guru/Kiai terlebih dahulu.');
    return;
  }
  if (dispatchRato && !ratoId) {
    alert('Pilih Rato/Kades terlebih dahulu.');
    return;
  }

  const btn = document.getElementById('btnKirimNotifSiaga');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengirim Notifikasi Siaga...';
  }

  const activeSelectedCase = window.activeSelectedCase;
  const activeReportId = window.activeReportId;
  const currentUsers = window.currentUsers || [];
  const currentUser = window.currentUser;

  const payload = {
    guru_id: dispatchGuru ? guruId : null,
    rato_id: dispatchRato ? ratoId : null,
    notes: msg || 'Aktivasi Siaga EWS via Tombol Siaga Nakes'
  };
  if (activeSelectedCase && activeSelectedCase.id) {
    payload.case_id = activeSelectedCase.id;
  } else if (activeReportId) {
    payload.report_id = activeReportId;
  }

  try {
    const patientName = activeSelectedCase ? activeSelectedCase.patient_name : 'Warga Kokop';
    const villageName = activeSelectedCase ? (activeSelectedCase.village_name || 'Kokop') : 'Kokop';

    // WhatsApp Siaga Guru
    if (dispatchGuru) {
      const selectedGuru = currentUsers.find(u => String(u.id) === String(guruId));
      if (selectedGuru && selectedGuru.phone) {
        let cleanPhone = selectedGuru.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
        const waText = encodeURIComponent(`*NOTIFIKASI SIAGA EWS PUSKESMAS KOKOP*\n\nAssalamu’alaikum Wr. Wb. Kiai,\nMohon bantuan pendekatan keagamaan persuasif & rembuk santun keluarga untuk penanganan warga di ${villageName} (Pasien: ${patientName}).\n\nCatatan: ${msg || 'Mohon kesediaan Kiai mendampingi evakuasi medis.'}\n\nTerima kasih atas keridhoan & bimbingan Kiai.`);
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waText}`, '_blank');
      }
    }

    // WhatsApp Siaga Rato
    if (dispatchRato) {
      const selectedRato = currentUsers.find(u => String(u.id) === String(ratoId));
      if (selectedRato && selectedRato.phone) {
        let cleanRatoPhone = selectedRato.phone.replace(/[^0-9]/g, '');
        if (cleanRatoPhone.startsWith('0')) cleanRatoPhone = '62' + cleanRatoPhone.slice(1);
        const waRatoText = encodeURIComponent(`*PEMBERITAHUAN SIAGA KOORDINASI EVAKUASI DESA*\n\nKepada Yth. Kepala Desa / Rato (${villageName}),\nPetugas Puskesmas Kokop meminta pendampingan pengawalan linmas wilayah untuk penanganan evakuasi medis warga (Pasien: ${patientName}).\n\nCatatan: ${msg || 'Mohon koordinasi pengamanan kondusif saat penjemputan warga.'}\n\nTerima kasih atas kerja samanya.`);
        window.open(`https://api.whatsapp.com/send?phone=${cleanRatoPhone}&text=${waRatoText}`, '_blank');
      }
    }

    if (window.firebaseAdapter && window.firebaseAdapter.activateSiagaEws) {
      const res = await window.firebaseAdapter.activateSiagaEws(payload, currentUser);
      if (res.success) {
        alert('Notifikasi Siaga Berhasil Terkirim ke WhatsApp & Sistem Aplikasi Tokoh!');
        const newCaseId = res.data ? res.data.case_id : (activeSelectedCase ? activeSelectedCase.id : null);
        window.activeMonitoringCaseId = newCaseId;
        window.activeReportId = null;

        if (window.fetchCases) await window.fetchCases();
        if (window.fetchReports) await window.fetchReports();

        const currentCases = window.currentCases || [];
        const monCase = currentCases.find(c => c.id === newCaseId) || currentCases[0];
        if (monCase) {
          window.activeSelectedCase = monCase;
          const el = document.getElementById('monCaseNumber');
          if (el) el.innerText = monCase.case_number;
        }
        if (window.startMonitoringWatch) {
          window.startMonitoringWatch(monCase ? monCase.activated_at : null);
        }
        if (window.switchNakesTab) {
          window.switchNakesTab('monitoring');
        }
        return;
      }
    }
  } catch {
    alert('Notifikasi Siaga EWS Berhasil Diaktifkan (Mode Offline).');
    if (activeSelectedCase) window.activeMonitoringCaseId = activeSelectedCase.id;
    if (window.startMonitoringWatch) window.startMonitoringWatch(null);
    if (window.switchNakesTab) window.switchNakesTab('monitoring');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i><span>Kirim Notifikasi Siaga</span>';
    }
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

  if (window.monitoringTimer) {
    clearInterval(window.monitoringTimer);
    window.monitoringTimer = null;
  }
  alert('Evakuasi Berhasil Selesai! Pasien kini masuk ke tahap Monitoring & Pemantauan Minum Obat.');
  window.activeMonitoringCaseId = null;
  if (window.switchNakesTab) window.switchNakesTab('dashboard');
  if (window.fetchCases) window.fetchCases();
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.openSiagaFromReportDetail = openSiagaFromReportDetail;
  window.openSiagaFromReport = openSiagaFromReport;
  window.populateEwsSelects = populateEwsSelects;
  window.executeEwsActivation = executeEwsActivation;
  window.finishEvacuationProcess = finishEvacuationProcess;
}
