const { chromium } = require('../node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('================================================================');
  console.log('🧪 [QA SUITE] SATENGKA PASUNG EWS COMPREHENSIVE VERIFICATION');
  console.log('================================================================\n');

  const browser = await chromium.launch({ 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--disable-web-security']
  });

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  const indexUrl = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

  try {
    // =========================================================================
    // TEST SECTION 1: KADER DATA ISOLATION PER DESA (USER REQUEST)
    // =========================================================================
    console.log('📋 1. Menguji Isolasi Data Kader Sesuai Daerah Masing-Masing...');

    const kaderPage = await browser.newPage({ viewport: { width: 450, height: 850 } });
    kaderPage.on('dialog', async d => await d.accept());

    await kaderPage.addInitScript(() => {
      const userKokop = {
        id: 3,
        name: 'Siti',
        role: 'KADER',
        phone: '081234567891',
        village_id: 1,
        village_name: 'Kokop'
      };
      localStorage.setItem('malekkas_user', JSON.stringify(userKokop));
      localStorage.setItem('malekkas_token', 'token-test-kader-kokop');
    });

    await kaderPage.goto(indexUrl, { waitUntil: 'load' });
    await kaderPage.evaluate(() => {
      const s = document.getElementById('appSplashScreen');
      if (s) s.classList.add('splash-hidden');
      const engine = window.MalekkasEngine || window.malekkasEngine || window.firebaseAdapter;
      if (engine && engine.loadProductionDemoData) {
        engine.loadProductionDemoData();
      }
    });
    await kaderPage.waitForTimeout(600);

    const kaderKokopCases = await kaderPage.evaluate(async () => {
      const engine = window.MalekkasEngine || window.malekkasEngine || window.firebaseAdapter;
      const res = await engine.getCases(3, 'KADER', 1, 'Kokop');
      return res.data;
    });

    assert(kaderKokopCases.length > 0, `Kader Kokop menerima ${kaderKokopCases.length} data`);
    assert(kaderKokopCases.every(c => c.village_name === 'Kokop' || c.village_id === 1), 'Semua kasus Kader Kokop HANYA dari Desa Kokop');
    assert(!kaderKokopCases.some(c => c.village_name === 'Durjan'), 'Kader Kokop TIDAK BISA melihat kasus dari Desa Durjan');
    assert(!kaderKokopCases.some(c => c.village_name === 'Dupok'), 'Kader Kokop TIDAK BISA melihat kasus dari Desa Dupok');

    // B. Kader Durjan (Kader Rudi)
    const kaderDurjanCases = await kaderPage.evaluate(async () => {
      const engine = window.MalekkasEngine || window.malekkasEngine || window.firebaseAdapter;
      const res = await engine.getCases(8, 'KADER', 2, 'Durjan');
      return res.data;
    });
    assert(kaderDurjanCases.length > 0, `Kader Durjan menerima ${kaderDurjanCases.length} data`);
    assert(kaderDurjanCases.every(c => c.village_name === 'Durjan' || c.village_id === 2), 'Semua kasus Kader Durjan HANYA dari Desa Durjan');
    assert(!kaderDurjanCases.some(c => c.village_name === 'Kokop'), 'Kader Durjan TIDAK BISA melihat kasus dari Desa Kokop');

    await kaderPage.screenshot({ path: path.join(__dirname, '../docs/screenshots/kader-isolation-passed.png') });
    await kaderPage.close();

    // =========================================================================
    // TEST SECTION 2: LOGIN NAKES & BASIS DATA PASIEN CRUD
    // =========================================================================
    console.log('\n📋 2. Menguji Nakes: Basis Data Pasien ODGJ (Tambah, Edit, Hapus)...');

    const nakesPage = await browser.newPage({ viewport: { width: 1280, height: 950 } });
    nakesPage.on('dialog', async d => await d.accept());

    await nakesPage.addInitScript(() => {
      const nakesUser = {
        id: 2,
        name: 'dr. Siti Amelia',
        role: 'NAKES',
        phone: '081234567890',
        village_id: 1,
        village_name: 'Kokop'
      };
      localStorage.setItem('malekkas_user', JSON.stringify(nakesUser));
      localStorage.setItem('malekkas_token', 'token-test-nakes');
    });

    await nakesPage.goto(indexUrl, { waitUntil: 'load' });
    await nakesPage.evaluate(() => {
      const s = document.getElementById('appSplashScreen');
      if (s) s.classList.add('splash-hidden');
    });
    await nakesPage.waitForTimeout(600);

    // Switch ke Tab Pasien
    await nakesPage.evaluate(() => {
      switchNakesTab('pasien');
    });
    await nakesPage.waitForTimeout(400);

    const initialPatientRows = await nakesPage.evaluate(() => {
      return document.querySelectorAll('#patientsTableBody tr').length;
    });
    assert(initialPatientRows > 0, `Tabel pasien menampilkan ${initialPatientRows} baris`);

    // A. Tambah Pasien Baru
    await nakesPage.evaluate(() => {
      openAddPatientModal();
      document.getElementById('patientFormName').value = 'Bahrul Munir';
      document.getElementById('patientFormGender').value = 'L';
      document.getElementById('patientFormAddress').value = 'Dusun Timur Sawah RT 01';
      document.getElementById('patientFormVillage').value = 1;
      document.getElementById('patientFormFamilyPhone').value = '081299887766';
      document.getElementById('patientFormPriority').value = 'HIGH';
      document.getElementById('patientFormStatus').value = 'SIAGA';
      document.getElementById('patientFormNotes').value = 'Pasien baru terindikasi pasung balok.';
    });

    await nakesPage.evaluate(async () => {
      const dummyEvent = { preventDefault: () => {} };
      await savePatientForm(dummyEvent);
    });
    await nakesPage.waitForTimeout(400);

    const afterAddRows = await nakesPage.evaluate(() => {
      return document.querySelectorAll('#patientsTableBody tr').length;
    });
    assert(afterAddRows === initialPatientRows + 1, `Pasien baru bertambah di tabel (${initialPatientRows} -> ${afterAddRows})`);

    const hasNewPatientText = await nakesPage.evaluate(() => {
      return document.getElementById('patientsTableBody').innerText.includes('Bahrul Munir');
    });
    assert(hasNewPatientText, 'Nama pasien baru "Bahrul Munir" muncul di basis data');

    // B. Edit Pasien
    const newPatientCaseId = await nakesPage.evaluate(() => {
      const c = currentCases.find(item => item.patient_name === 'Bahrul Munir');
      return c ? c.id : null;
    });
    assert(newPatientCaseId !== null, `ID Kasus baru ditemukan: ${newPatientCaseId}`);

    await nakesPage.evaluate((cId) => {
      openEditPatientModal(cId);
      document.getElementById('patientFormName').value = 'Bahrul Munir (Terkontrol)';
      const dummyEvent = { preventDefault: () => {} };
      savePatientForm(dummyEvent);
    }, newPatientCaseId);
    await nakesPage.waitForTimeout(400);

    const isUpdated = await nakesPage.evaluate(() => {
      return document.getElementById('patientsTableBody').innerText.includes('Bahrul Munir (Terkontrol)');
    });
    assert(isUpdated, 'Perubahan nama pasien menjadi "Bahrul Munir (Terkontrol)" terverifikasi');

    // C. Hapus Pasien
    await nakesPage.evaluate((cId) => {
      deletePatientAction(cId, 'Bahrul Munir (Terkontrol)');
    }, newPatientCaseId);
    await nakesPage.waitForTimeout(400);

    const afterDeleteRows = await nakesPage.evaluate(() => {
      return document.querySelectorAll('#patientsTableBody tr').length;
    });
    assert(afterDeleteRows === initialPatientRows, `Pasien berhasil dihapus, jumlah baris kembali ke awal (${afterDeleteRows})`);

    await nakesPage.screenshot({ path: path.join(__dirname, '../docs/screenshots/pasien-crud-passed.png') });

    // =========================================================================
    // TEST SECTION 3: MENU KONTROL OBAT (EDIT & HAPUS KUNJUNGAN)
    // =========================================================================
    console.log('\n📋 3. Menguji Menu Kontrol Obat (Tambah, Edit, Hapus Catatan Kunjungan)...');

    // Switch ke Tab Kontrol
    await nakesPage.evaluate(() => {
      switchNakesTab('kontrol');
    });
    await nakesPage.waitForTimeout(400);

    // Buka Modal Kontrol Pasien Kasus ID 1 (Ahmad)
    await nakesPage.evaluate(() => {
      openKontrolObatModal(1);
    });
    await nakesPage.waitForTimeout(400);

    const modalKontrolVisible = await nakesPage.evaluate(() => {
      const m = document.getElementById('modalKontrolObatDetail');
      return m && !m.classList.contains('hidden');
    });
    assert(modalKontrolVisible, 'Modal Kontrol Obat Detail berhasil dibuka');

    // A. Tambah Kunjungan Baru
    const initialVisitCount = await nakesPage.evaluate(() => {
      return activeDrugMonitoringCase.control_history ? activeDrugMonitoringCase.control_history.length : 0;
    });

    await nakesPage.evaluate(async () => {
      document.getElementById('mKontrolDateInput').value = '2026-09-18';
      document.getElementById('mKontrolStatusSelect').value = 'RUTIN';
      document.getElementById('mKontrolNotes').value = 'Kunjungan berkala QA: Pasien tenang dan kooperatif.';
      await saveKontrolObatStatus();
    });
    await nakesPage.waitForTimeout(400);

    const afterAddVisitCount = await nakesPage.evaluate(() => {
      return activeDrugMonitoringCase.control_history.length;
    });
    assert(afterAddVisitCount === initialVisitCount + 1, `Jumlah riwayat kontrol bertambah (${initialVisitCount} -> ${afterAddVisitCount})`);

    // B. Edit Kunjungan yang baru ditambahkan
    await nakesPage.evaluate((vNum) => {
      startEditControlVisit(vNum);
    }, afterAddVisitCount);
    await nakesPage.waitForTimeout(200);

    const isEditModeActive = await nakesPage.evaluate(() => {
      const badge = document.getElementById('mKontrolNextVisitBadge');
      const cancelBtn = document.getElementById('btnCancelEditControl');
      return badge.innerText.includes('Mengedit') && !cancelBtn.classList.contains('hidden');
    });
    assert(isEditModeActive, 'Mode Edit Kunjungan aktif (Badge & Tombol Batal tampil)');

    await nakesPage.evaluate(async () => {
      document.getElementById('mKontrolNotes').value = 'Kunjungan berkala QA: [UPDATED] Pasien sangat kooperatif dan kepatuhan 100%.';
      await saveKontrolObatStatus();
    });
    await nakesPage.waitForTimeout(400);

    const isVisitUpdated = await nakesPage.evaluate(() => {
      const list = document.getElementById('mKontrolHistoryList');
      return list && list.innerText.includes('[UPDATED]');
    });
    assert(isVisitUpdated, 'Catatan kunjungan kontrol berhasil di-edit dan tertera di timeline');

    // C. Hapus Kunjungan
    await nakesPage.evaluate(async (vNum) => {
      await deleteControlVisitAction(vNum);
    }, afterAddVisitCount);
    await nakesPage.waitForTimeout(400);

    const afterDeleteVisitCount = await nakesPage.evaluate(() => {
      return activeDrugMonitoringCase.control_history.length;
    });
    assert(afterDeleteVisitCount === initialVisitCount, `Kunjungan berhasil dihapus, jumlah kembali ke semula (${afterDeleteVisitCount})`);

    await nakesPage.evaluate(() => {
      closeKontrolObatModal();
    });
    await nakesPage.waitForTimeout(200);

    await nakesPage.screenshot({ path: path.join(__dirname, '../docs/screenshots/kontrol-crud-passed.png') });

    // =========================================================================
    // TEST SECTION 4: REMINDER WA OTOMATIS DENGAN AKSI NYATA
    // =========================================================================
    console.log('\n📋 4. Menguji Modal Reminder WA Otomatis & Link wa.me...');

    await nakesPage.evaluate(() => {
      openReminderWaModal();
    });
    await nakesPage.waitForTimeout(400);

    const isReminderModalOpen = await nakesPage.evaluate(() => {
      const m = document.getElementById('modalReminderWa');
      return m && !m.classList.contains('hidden');
    });
    assert(isReminderModalOpen, 'Modal Pengingat WA Otomatis berhasil terbuka');

    const reminderCardsCount = await nakesPage.evaluate(() => {
      return document.querySelectorAll('#reminderWaPatientList > div').length;
    });
    assert(reminderCardsCount > 0, `Daftar reminder menampilkan ${reminderCardsCount} pasien aktif`);

    const hasActionButtons = await nakesPage.evaluate(() => {
      const btnKeluarga = document.querySelector('#reminderWaPatientList button');
      return btnKeluarga !== null && btnKeluarga.innerText.includes('WA');
    });
    assert(hasActionButtons, 'Tersedia tombol aksi langsung pengiriman WhatsApp ke keluarga dan kader');

    await nakesPage.screenshot({ path: path.join(__dirname, '../docs/screenshots/reminder-wa-modal-passed.png') });

    await nakesPage.evaluate(() => {
      closeReminderWaModal();
    });

    // =========================================================================
    // TEST SECTION 5: LIVE CHAT SYNCHRONIZE BUTTON (ROTASI & FEEDBACK)
    // =========================================================================
    console.log('\n📋 5. Menguji Tombol Sinkronisasi Live Chat...');

    await nakesPage.evaluate(() => {
      openTherapeuticChatModal(1);
    });
    await nakesPage.waitForTimeout(400);

    const isChatModalOpen = await nakesPage.evaluate(() => {
      const m = document.getElementById('modalTherapeuticChat');
      return m && !m.classList.contains('hidden');
    });
    assert(isChatModalOpen, 'Modal Live Chat Terapeutik terbuka');

    // Klik tombol sinkron
    await nakesPage.evaluate(() => {
      fetchTherapeuticChats(true);
    });
    await nakesPage.waitForTimeout(200);

    const isSpinning = await nakesPage.evaluate(() => {
      const icon = document.getElementById('iconSyncTherapeuticChat');
      return icon && icon.classList.contains('fa-spin');
    });
    assert(isSpinning, 'Ikon tombol sinkron berputar (fa-spin) saat sinkronisasi pesan');

    await nakesPage.waitForTimeout(700);

    const hasToast = await nakesPage.evaluate(() => {
      const toast = document.getElementById('appToastNotification');
      return toast && toast.innerText.includes('disinkronkan');
    });
    assert(hasToast, 'Notifikasi toast "Pesan obrolan berhasil disinkronkan" muncul');

    await nakesPage.screenshot({ path: path.join(__dirname, '../docs/screenshots/live-chat-sync-passed.png') });

    await nakesPage.evaluate(() => {
      closeTherapeuticChatModal();
    });

    // =========================================================================
    // TEST SECTION 6: ZERO ENGLISH SLOP & BAHASA INDONESIA STATUS
    // =========================================================================
    console.log('\n📋 6. Menguji Kepatuhan Bahasa Indonesia Status & Role Naming...');

    await nakesPage.evaluate(() => {
      switchNakesTab('kasus');
    });
    await nakesPage.waitForTimeout(400);

    const casesTableHtml = await nakesPage.evaluate(() => {
      return document.getElementById('allCasesTableBody').innerText;
    });

    const hasEnglishReady = casesTableHtml.includes('READY_FOR_EVACUATION');
    const hasEnglishEmergency = casesTableHtml.includes('EMERGENCY');
    const hasEnglishHigh = casesTableHtml.includes('HIGH');

    assert(!hasEnglishReady, 'Status tabel kasus: Tidak ada kata "READY_FOR_EVACUATION" (telah jadi "Siap Evakuasi")');
    assert(!hasEnglishEmergency, 'Prioritas tabel kasus: Tidak ada kata "EMERGENCY" (telah jadi "Gawat Darurat")');
    assert(!hasEnglishHigh, 'Prioritas tabel kasus: Tidak ada kata "HIGH" (telah jadi "Prioritas Tinggi")');

    // Periksa role naming tanpa tanda kurung
    const bodyText = await nakesPage.evaluate(() => document.body.innerText);
    const hasParenthesisRole = bodyText.includes('Kiai H. Kholil (Guru)') || 
                               bodyText.includes('Klebun Kokop (Rato)') || 
                               bodyText.includes('dr. Siti Amelia (Nakes)');
    assert(!hasParenthesisRole, 'Zero Parentheses: Tidak ada tanda kurung peran di samping nama akun');

    await nakesPage.screenshot({ path: path.join(__dirname, '../docs/screenshots/all-cases-indo-passed.png') });

    console.log('\n================================================================');
    console.log(`🎯 HASIL UJI E2E QA: ${passedTests}/${totalTests} TESTS PASS (${Math.round(passedTests/totalTests*100)}%)`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ Error during QA execution:', err);
  } finally {
    await browser.close();
  }
})();
