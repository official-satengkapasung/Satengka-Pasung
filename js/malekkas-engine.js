/**
 * SATENGKA PASUNG EWS — Zero-Cost Client Storage Engine
 * Universal Standalone Script (Dapat dibuka via file:/// maupun http://)
 * 100% Free Tier, Zero-Cost, Bebas CORS Protocol Block!
 */

(function(window) {
  'use strict';

  const DEFAULT_SEED = {
    villages: [
      { id: 1, name: "Kokop", district: "Kokop", regency: "Bangkalan" },
      { id: 2, name: "Amparaan", district: "Kokop", regency: "Bangkalan" },
      { id: 3, name: "Bandang Laok", district: "Kokop", regency: "Bangkalan" },
      { id: 4, name: "Banda Soleh", district: "Kokop", regency: "Bangkalan" },
      { id: 5, name: "Batokorogan", district: "Kokop", regency: "Bangkalan" },
      { id: 6, name: "Dupok", district: "Kokop", regency: "Bangkalan" },
      { id: 7, name: "Durjan", district: "Kokop", regency: "Bangkalan" },
      { id: 8, name: "Katol Timur", district: "Kokop", regency: "Bangkalan" },
      { id: 9, name: "Lembung Gunong", district: "Kokop", regency: "Bangkalan" },
      { id: 10, name: "Mandung", district: "Kokop", regency: "Bangkalan" },
      { id: 11, name: "Mano'an", district: "Kokop", regency: "Bangkalan" },
      { id: 12, name: "Tlokoh", district: "Kokop", regency: "Bangkalan" },
      { id: 13, name: "Tramok", district: "Kokop", regency: "Bangkalan" }
    ],
    users: [
      { id: 1, name: "Administrator EWS", phone: "081100000001", role: "ADMIN", village_id: 1, village_name: "Kokop" },
      { id: 2, name: "dr. Siti Amelia", phone: "081234567890", role: "NAKES", village_id: 1, village_name: "Kokop" },
      { id: 3, name: "Siti", phone: "081234567891", role: "KADER", village_id: 1, village_name: "Kokop" },
      { id: 4, name: "Kiai H. Kholil", phone: "081234567892", role: "GURU", village_id: 1, village_name: "Kokop" },
      { id: 5, name: "Klebun Kokop", phone: "081234567893", role: "RATO", village_id: 1, village_name: "Kokop" }
    ],
    cases: [
      {
        id: 1,
        case_number: "CAS-20260911-001",
        report_id: 101,
        patient_id: 1,
        patient_name: "Ahmad",
        gender: "L",
        patient_address: "Dusun Morleke, Desa Kokop",
        village_name: "Kokop",
        priority: "HIGH",
        status: "SIAGA",
        report_type: "Pasung",
        latitude: -7.014523,
        longitude: 113.023412,
        notes: "Pasien dipasung di bilik belakang rumah, keluarga kewalahan menghadapi kekambuhan. Membutuhkan rembuk santun Kiai dan Nakes.",
        reporter_name: "Siti",
        reporter_phone: "081234567891",
        activated_at: "2026-09-11T09:15:00.000Z",
        participants: [
          { participant_role: "GURU", name: "Kiai H. Kholil", phone: "081234567892", user_id: 4, response: "NEED_TIME", response_note: "Sedang sowan dan tabayyun ke pihak keluarga pasien agar ikhlas melepaskan pasung." },
          { participant_role: "RATO", name: "Klebun Kokop", phone: "081234567893", user_id: 5, response: "READY", response_note: "Aparat Linmas dan Babinsa desa siap mengawal pengamanan rute evakuasi." }
        ]
      },
      {
        id: 2,
        case_number: "CAS-20260911-002",
        report_id: 102,
        patient_id: 2,
        patient_name: "Mat Hasan",
        gender: "L",
        patient_address: "Dusun Mandeman, Desa Durjan",
        village_name: "Durjan",
        priority: "EMERGENCY",
        status: "READY_FOR_EVACUATION",
        report_type: "Pasung",
        latitude: -7.028911,
        longitude: 113.041220,
        notes: "Rantai pasung besi diikat pada balok kayu. Kiai dan Kades telah bermusyawarah dan keluarga menyetujui rujukan ke RS Jiwa Menur.",
        reporter_name: "Kader Rudi",
        reporter_phone: "081234567894",
        activated_at: "2026-09-11T08:30:00.000Z",
        participants: [
          { participant_role: "GURU", name: "Kiai H. Kholil", phone: "081234567892", user_id: 4, response: "AGREE", response_note: "Keluarga telah diberi pencerahan agama bahwa ODGJ berhak diobati secara medis." },
          { participant_role: "RATO", name: "Klebun Durjan", phone: "081234567893", user_id: 5, response: "READY", response_note: "Kendaraan operasional desa dan linmas siap mengawal mobil ambulans Puskesmas." }
        ]
      },
      {
        id: 3,
        case_number: "CAS-20260910-003",
        report_id: 103,
        patient_id: 3,
        patient_name: "Bu Siti",
        gender: "P",
        patient_address: "Dusun Barat Sawah, Desa Dupok",
        village_name: "Dupok",
        priority: "NORMAL",
        status: "MONITORING",
        report_type: "Pasung",
        latitude: -7.009854,
        longitude: 113.018742,
        notes: "Pasien bebas pasung sejak 1 bulan lalu. Rutin minum obat antipsikotik dari Puskesmas Kokop, saat ini dalam pendampingan kader dan pemulihan sosial.",
        reporter_name: "Siti",
        reporter_phone: "081234567891",
        activated_at: "2026-09-12T08:30:00.000Z",
        participants: [
          { participant_role: "GURU", name: "Kiai H. Kholil", phone: "081234567892", user_id: 4, response: "AGREE", response_note: "Keluarga telah ikhlas dan menyetujui pendekatan medis terpadu." },
          { participant_role: "RATO", name: "Klebun Dupok", phone: "081234567893", user_id: 5, response: "READY", response_note: "Linmas Desa Durjan siap mengamankan lokasi evakuasi." }
        ],
        family_phone: "081987654321",
        drug_compliance: "RUTIN",
        drug_notes: "Kunjungan ke-2: Pasien tenang, mampu berinteraksi, obat diminum teratur didampingi suami.",
        control_history: [
          {
            visit_number: 1,
            date: "2026-09-02",
            compliance: "RUTIN",
            notes: "Kontrol pasca rawat RSJ/Puskesmas. Pasien menerima obat oral antipsikotik, keluarga komitmen mengawasi.",
            recorded_by: "Ns. Farhan (Puskesmas Kokop)"
          },
          {
            visit_number: 2,
            date: "2026-09-12",
            compliance: "RUTIN",
            notes: "Kunjungan rumah bersama Kader Siti. Pasien tidur cukup, tidak ada agitasi, kepatuhan minum obat 100%.",
            recorded_by: "Siti"
          }
        ]
      }
    ],
    reports: [
      {
        id: 104,
        report_number: "LAP-20260911-004",
        reporter_id: 3,
        reporter_name: "Kader Rudi",
        reporter_phone: "081234567894",
        village_id: 4,
        village_name: "Banda Soleh",
        patient_name_input: "Bahrul Ulum",
        address_input: "Dusun Krajan RT 02 / RW 01, Desa Banda Soleh",
        report_type: "Pasung",
        description: "Warga melaporkan pemuda usia 28 tahun kembali dipasung balok kayu oleh keluarga setelah mengamuk dan membanting perabot rumah. Butuh intervensi segera.",
        latitude: -7.034120,
        longitude: 113.036780,
        photo_path: null,
        status: "NEW",
        reported_at: "2026-09-11T10:10:00.000Z"
      }
    ],
    chats: {}
  };

  function getLocalStore(key, defaultVal) {
    const v = localStorage.getItem("malekkas_" + key);
    if (!v) {
      localStorage.setItem("malekkas_" + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    try { return JSON.parse(v); } catch(e) { return defaultVal; }
  }

  function setLocalStore(key, val) {
    localStorage.setItem("malekkas_" + key, JSON.stringify(val));
  }

  // Inisialisasi awal
  getLocalStore("villages", DEFAULT_SEED.villages);
  getLocalStore("users", DEFAULT_SEED.users);
  getLocalStore("cases", DEFAULT_SEED.cases);
  getLocalStore("reports", DEFAULT_SEED.reports);
  getLocalStore("chats", DEFAULT_SEED.chats);

  // Sanitasi otomatis: Bersihkan tanda kurung peran dari nama akun di LocalStorage
  (function sanitizeStoredNames() {
    try {
      const cleanNameStr = (str) => typeof str === 'string' ? str.replace(/\s*\([^)]*\)/g, '').trim() : str;
      const rawUsers = localStorage.getItem("malekkas_users");
      if (rawUsers) {
        const users = JSON.parse(rawUsers);
        let changed = false;
        users.forEach(u => {
          const cleaned = cleanNameStr(u.name);
          if (cleaned !== u.name) { u.name = cleaned; changed = true; }
        });
        if (changed) localStorage.setItem("malekkas_users", JSON.stringify(users));
      }
      const rawCases = localStorage.getItem("malekkas_cases");
      if (rawCases) {
        const cases = JSON.parse(rawCases);
        let changed = false;
        cases.forEach(c => {
          if (c.reporter_name) {
            const cleaned = cleanNameStr(c.reporter_name);
            if (cleaned !== c.reporter_name) { c.reporter_name = cleaned; changed = true; }
          }
          if (c.participants && Array.isArray(c.participants)) {
            c.participants.forEach(p => {
              if (p.name) {
                const cleaned = cleanNameStr(p.name);
                if (cleaned !== p.name) { p.name = cleaned; changed = true; }
              }
            });
          }
        });
        if (changed) localStorage.setItem("malekkas_cases", JSON.stringify(cases));
      }
      const rawReports = localStorage.getItem("malekkas_reports");
      if (rawReports) {
        const reports = JSON.parse(rawReports);
        let changed = false;
        reports.forEach(r => {
          if (r.reporter_name) {
            const cleaned = cleanNameStr(r.reporter_name);
            if (cleaned !== r.reporter_name) { r.reporter_name = cleaned; changed = true; }
          }
        });
        if (changed) localStorage.setItem("malekkas_reports", JSON.stringify(reports));
      }
      const rawCur = localStorage.getItem("malekkas_user");
      if (rawCur) {
        const u = JSON.parse(rawCur);
        const cleaned = cleanNameStr(u.name);
        if (cleaned !== u.name) { u.name = cleaned; localStorage.setItem("malekkas_user", JSON.stringify(u)); }
      }
    } catch(e) {
      console.warn("Sanitize names error:", e);
    }
  })();

  const engine = {
    isFirebaseActive: false,

    resetDatabase: function() {
      localStorage.setItem("malekkas_cases", JSON.stringify([]));
      localStorage.setItem("malekkas_reports", JSON.stringify([]));
      localStorage.setItem("malekkas_chats", JSON.stringify({}));
      localStorage.setItem("malekkas_villages", JSON.stringify(DEFAULT_SEED.villages));
      localStorage.setItem("malekkas_users", JSON.stringify(DEFAULT_SEED.users));
      console.log("🧹 [SATENGKA PASUNG] Database di-reset menjadi 0 kasus & 0 laporan!");
      return { success: true, message: "Database berhasil di-reset menjadi 0 kasus!" };
    },

    loadProductionDemoData: function() {
      localStorage.setItem("malekkas_cases", JSON.stringify(DEFAULT_SEED.cases));
      localStorage.setItem("malekkas_reports", JSON.stringify(DEFAULT_SEED.reports));
      localStorage.setItem("malekkas_chats", JSON.stringify(DEFAULT_SEED.chats));
      localStorage.setItem("malekkas_villages", JSON.stringify(DEFAULT_SEED.villages));
      localStorage.setItem("malekkas_users", JSON.stringify(DEFAULT_SEED.users));
      console.log("✨ [SATENGKA PASUNG] Data demo operasional faskes produksi berhasil dimuat!");
      return { success: true, message: "Data demo faskes produksi berhasil dimuat!" };
    },

    loginUser: async function(phone, password) {
      const users = getLocalStore("users", DEFAULT_SEED.users);
      const user = users.find(u => u.phone === phone);
      if (!user) {
        return { success: false, message: "Nomor HP tidak terdaftar." };
      }
      const token = "token_" + Math.random().toString(36).substring(2) + Date.now();
      return { success: true, message: "Login berhasil.", data: { token, user } };
    },

    requestPasswordReset: async function(identifier) {
      const users = getLocalStore("users", DEFAULT_SEED.users);
      const cleanId = (identifier || '').replace(/\D/g, '');
      const user = users.find(u => {
        const uPhone = (u.phone || '').replace(/\D/g, '');
        const uEmail = (u.email || '').toLowerCase();
        return (cleanId && uPhone === cleanId) || (uEmail && uEmail === (identifier || '').toLowerCase());
      });

      if (!user) {
        return { success: false, message: "Kontak tersebut belum terdaftar sebagai pengguna faskes resmi." };
      }

      const ticketId = "RST-" + Math.random().toString(36).substring(2, 7).toUpperCase() + "-" + Date.now().toString().slice(-4);
      return {
        success: true,
        message: "Verifikasi identitas berhasil.",
        data: {
          user,
          ticketId,
          adminPhone: "081100000001",
          adminName: "Administrator Puskesmas Kokop"
        }
      };
    },

    getVillages: async function() {
      return { success: true, data: getLocalStore("villages", DEFAULT_SEED.villages) };
    },

    getUsers: async function() {
      const users = getLocalStore("users", DEFAULT_SEED.users);
      const cleanNameStr = (str) => typeof str === 'string' ? str.replace(/\s*\([^)]*\)/g, '').trim() : str;
      return { success: true, data: users.map(u => ({ ...u, name: cleanNameStr(u.name) })) };
    },

    createUser: async function(userData) {
      const users = getLocalStore("users", DEFAULT_SEED.users);
      const newId = users.length + 1;
      const newUser = { id: newId, ...userData };
      users.push(newUser);
      setLocalStore("users", users);
      return { success: true, message: `Mitra ${userData.name} berhasil ditambahkan.` };
    },

    getCases: async function(userId = null, role = null, villageId = null, villageName = null) {
      let cases = getLocalStore("cases", DEFAULT_SEED.cases);
      if (role === "KADER") {
        cases = cases.filter(c => {
          if (villageId && String(c.village_id) === String(villageId)) return true;
          if (villageName && (c.village_name || '').trim().toLowerCase() === villageName.trim().toLowerCase()) return true;
          if (!villageId && !villageName && userId && String(c.reporter_id) === String(userId)) return true;
          return false;
        });
      } else if (userId && (role === "GURU" || role === "RATO")) {
        cases = cases.filter(c => c.participants && c.participants.some(p => String(p.user_id) === String(userId) || p.participant_role === role));
      }
      const cleanNameStr = (str) => typeof str === 'string' ? str.replace(/\s*\([^)]*\)/g, '').trim() : str;
      const sanitized = cases.map(c => ({
        ...c,
        reporter_name: cleanNameStr(c.reporter_name),
        participants: (c.participants || []).map(p => ({
          ...p,
          name: cleanNameStr(p.name)
        }))
      }));
      return { success: true, data: sanitized };
    },

    getReports: async function(reporterId = null, villageId = null, role = null, villageName = null) {
      let reports = getLocalStore("reports", DEFAULT_SEED.reports);
      if (role === "KADER") {
        reports = reports.filter(r => {
          if (villageId && String(r.village_id) === String(villageId)) return true;
          if (villageName && (r.village_name || '').trim().toLowerCase() === villageName.trim().toLowerCase()) return true;
          if (!villageId && !villageName && reporterId && String(r.reporter_id) === String(reporterId)) return true;
          return false;
        });
      } else if (reporterId) {
        reports = reports.filter(r => String(r.reporter_id) === String(reporterId));
      }
      return { success: true, data: reports };
    },

    updateControlVisit: async function(caseId, visitNumber, updatedData) {
      const cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const targetCase = cases.find(c => c.id === caseId);
      if (!targetCase) return { success: false, message: "Kasus tidak ditemukan." };
      if (!Array.isArray(targetCase.control_history)) targetCase.control_history = [];
      
      const idx = targetCase.control_history.findIndex(v => Number(v.visit_number) === Number(visitNumber));
      if (idx === -1) return { success: false, message: "Kunjungan kontrol tidak ditemukan." };

      targetCase.control_history[idx] = {
        ...targetCase.control_history[idx],
        ...updatedData,
        visit_number: Number(visitNumber),
        updated_at: new Date().toISOString()
      };

      if (idx === targetCase.control_history.length - 1) {
        if (updatedData.compliance) targetCase.drug_compliance = updatedData.compliance;
        if (updatedData.notes) targetCase.drug_notes = updatedData.notes;
      }

      setLocalStore("cases", cases);
      return { success: true, message: `Kunjungan Ke-${visitNumber} berhasil diperbarui.`, data: targetCase };
    },

    deleteControlVisit: async function(caseId, visitNumber) {
      const cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const targetCase = cases.find(c => c.id === caseId);
      if (!targetCase) return { success: false, message: "Kasus tidak ditemukan." };
      if (!Array.isArray(targetCase.control_history)) return { success: false, message: "Riwayat kosong." };

      targetCase.control_history = targetCase.control_history.filter(v => Number(v.visit_number) !== Number(visitNumber));
      
      // Re-index visit numbers agar berurutan rapi
      targetCase.control_history.forEach((v, i) => {
        v.visit_number = i + 1;
      });

      if (targetCase.control_history.length > 0) {
        const last = targetCase.control_history[targetCase.control_history.length - 1];
        targetCase.drug_compliance = last.compliance;
        targetCase.drug_notes = last.notes;
      } else {
        targetCase.drug_compliance = "RUTIN";
        targetCase.drug_notes = "Belum ada catatan kunjungan.";
      }

      setLocalStore("cases", cases);
      return { success: true, message: `Kunjungan Ke-${visitNumber} berhasil dihapus.`, data: targetCase };
    },

    createPatient: async function(patientData) {
      const cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const newId = cases.length > 0 ? Math.max(...cases.map(c => c.id || 0)) + 1 : 1;
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
      const caseNumber = `CAS-${dateStr}-${String(newId).padStart(3, '0')}`;

      const newCase = {
        id: newId,
        case_number: caseNumber,
        patient_id: newId,
        patient_name: patientData.patient_name,
        gender: patientData.gender || "L",
        patient_address: patientData.patient_address || "Desa Kokop",
        village_id: patientData.village_id || 1,
        village_name: patientData.village_name || "Kokop",
        family_phone: patientData.family_phone || "",
        family_name: patientData.family_name || "Keluarga Bhuppa' Bhu'",
        priority: patientData.priority || "NORMAL",
        status: patientData.status || "MONITORING",
        report_type: patientData.report_type || "Pasung",
        notes: patientData.notes || "Data pasien ditambahkan langsung oleh Petugas Nakes.",
        drug_compliance: patientData.drug_compliance || "RUTIN",
        drug_notes: patientData.drug_notes || "Mulai pendampingan kepatuhan obat.",
        control_history: [],
        participants: [
          { participant_role: "GURU", name: "Kiai H. Kholil", phone: "081234567892", user_id: 4, response: "AGREE", response_note: "Pendampingan siap" },
          { participant_role: "RATO", name: "Klebun Kokop", phone: "081234567893", user_id: 5, response: "READY", response_note: "Pengawalan wilayah siap" }
        ],
        created_at: new Date().toISOString()
      };

      cases.unshift(newCase);
      setLocalStore("cases", cases);
      return { success: true, message: `Data pasien ${patientData.patient_name} berhasil ditambahkan.`, data: newCase };
    },

    updatePatient: async function(caseId, patientData) {
      const cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const targetCase = cases.find(c => c.id === caseId);
      if (!targetCase) return { success: false, message: "Pasien tidak ditemukan." };

      if (patientData.patient_name) targetCase.patient_name = patientData.patient_name;
      if (patientData.gender) targetCase.gender = patientData.gender;
      if (patientData.patient_address) targetCase.patient_address = patientData.patient_address;
      if (patientData.village_id) targetCase.village_id = patientData.village_id;
      if (patientData.village_name) targetCase.village_name = patientData.village_name;
      if (patientData.family_phone !== undefined) targetCase.family_phone = patientData.family_phone;
      if (patientData.status) targetCase.status = patientData.status;
      if (patientData.priority) targetCase.priority = patientData.priority;
      if (patientData.notes !== undefined) targetCase.notes = patientData.notes;
      if (patientData.drug_compliance) targetCase.drug_compliance = patientData.drug_compliance;

      setLocalStore("cases", cases);
      return { success: true, message: `Data pasien ${targetCase.patient_name} berhasil diperbarui.`, data: targetCase };
    },

    deletePatient: async function(caseId) {
      let cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const targetCase = cases.find(c => c.id === caseId);
      if (!targetCase) return { success: false, message: "Pasien tidak ditemukan." };

      cases = cases.filter(c => c.id !== caseId);
      setLocalStore("cases", cases);

      let reports = getLocalStore("reports", DEFAULT_SEED.reports);
      if (targetCase.report_id) {
        reports = reports.filter(r => r.id !== targetCase.report_id);
        setLocalStore("reports", reports);
      }

      return { success: true, message: `Data pasien ${targetCase.patient_name} berhasil dihapus.` };
    },

    createReport: async function(reportInput, currentUser) {
      const reports = getLocalStore("reports", DEFAULT_SEED.reports);
      const newId = reports.length + 1;
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
      const reportNumber = `LAP-${dateStr}-${String(newId).padStart(3, '0')}`;

      const newReport = {
        id: newId,
        report_number: reportNumber,
        reporter_id: currentUser ? currentUser.id : 3,
        reporter_name: currentUser ? currentUser.name : "Siti",
        reporter_phone: currentUser ? currentUser.phone : "081234567891",
        village_id: reportInput.village_id || 1,
        village_name: "Kokop",
        patient_name_input: reportInput.patient_name,
        address_input: reportInput.address || "Desa Kokop",
        report_type: reportInput.report_type || "Pasung",
        description: reportInput.description || "",
        latitude: reportInput.latitude || -7.0145,
        longitude: reportInput.longitude || 113.0234,
        photo_path: reportInput.photo_base64 || null,
        status: "NEW",
        reported_at: new Date().toISOString()
      };

      reports.unshift(newReport);
      setLocalStore("reports", reports);

      return { success: true, message: "Laporan berhasil dikirim ke Puskesmas.", data: { report_id: newId, report_number: reportNumber } };
    },

    activateSiagaEws: async function(payload, currentUser) {
      const cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const reports = getLocalStore("reports", DEFAULT_SEED.reports);
      const users = getLocalStore("users", DEFAULT_SEED.users);

      const guru = users.find(u => String(u.id) === String(payload.guru_id)) || { id: 4, name: "Kiai H. Kholil", phone: "081234567892" };
      const rato = users.find(u => String(u.id) === String(payload.rato_id)) || { id: 5, name: "Klebun Kokop", phone: "081234567893" };

      let caseId = payload.case_id;

      if (!caseId && payload.report_id) {
        const rep = reports.find(r => r.id === payload.report_id);
        if (rep) rep.status = "VALIDATED";
        
        caseId = cases.length + 1;
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
        const caseNumber = `CAS-${dateStr}-${String(caseId).padStart(3, '0')}`;

        const newCase = {
          id: caseId,
          case_number: caseNumber,
          report_id: payload.report_id,
          patient_id: caseId,
          patient_name: rep ? rep.patient_name_input : "Pasien Baru",
          gender: "L",
          patient_address: rep ? rep.address_input : "Desa Kokop",
          village_name: "Kokop",
          priority: "HIGH",
          status: "SIAGA",
          activated_at: new Date().toISOString(),
          notes: payload.notes || "Aktivasi EWS Siaga",
          participants: [
            { participant_role: "GURU", name: guru.name, phone: guru.phone, user_id: guru.id, response: "PENDING" },
            { participant_role: "RATO", name: rato.name, phone: rato.phone, user_id: rato.id, response: "PENDING" }
          ]
        };
        cases.unshift(newCase);
      } else {
        const c = cases.find(item => item.id === caseId);
        if (c) {
          c.status = "SIAGA";
          c.activated_at = new Date().toISOString();
          c.participants = [
            { participant_role: "GURU", name: guru.name, phone: guru.phone, user_id: guru.id, response: "PENDING" },
            { participant_role: "RATO", name: rato.name, phone: rato.phone, user_id: rato.id, response: "PENDING" }
          ];
        }
      }

      setLocalStore("cases", cases);
      setLocalStore("reports", reports);

      return { success: true, message: "Tombol Siaga EWS Berhasil Diaktifkan!", data: { case_id: caseId } };
    },

    respondParticipant: async function(caseId, userId, responseVal, note = "") {
      const cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const targetCase = cases.find(c => c.id === caseId);
      if (!targetCase) return { success: false, message: "Kasus tidak ditemukan." };

      if (targetCase.participants) {
        const p = targetCase.participants.find(item => String(item.user_id) === String(userId) || (userId === 4 && item.participant_role === "GURU") || (userId === 5 && item.participant_role === "RATO"));
        if (p) {
          p.response = responseVal;
          p.response_note = note;
        }
      }

      let readyCount = 0;
      if (targetCase.participants) {
        targetCase.participants.forEach(p => {
          if (p.response === "AGREE" || p.response === "READY") readyCount++;
        });
      }

      if (readyCount >= 2) {
        targetCase.status = "READY_FOR_EVACUATION";
      }

      setLocalStore("cases", cases);
      return { success: true, message: "Tanggapan berhasil dicatat.", data: { ready_count: readyCount } };
    },

    updateCaseStatus: async function(caseId, newStatus, note = "") {
      const cases = getLocalStore("cases", DEFAULT_SEED.cases);
      const targetCase = cases.find(c => c.id === caseId);
      if (targetCase) {
        targetCase.status = newStatus;
        setLocalStore("cases", cases);
      }
      return { success: true, message: `Status kasus diperbarui ke: ${newStatus}` };
    },

    subscribeTherapeuticChat: function(caseId, onUpdate) {
      const chats = getLocalStore("chats", DEFAULT_SEED.chats);
      const messages = chats[caseId] || [];
      onUpdate(messages);

      const storageListener = function(e) {
        if (e.key === "malekkas_chats") {
          const updatedChats = JSON.parse(e.newValue || "{}");
          onUpdate(updatedChats[caseId] || []);
        }
      };
      window.addEventListener("storage", storageListener);

      return function() {
        window.removeEventListener("storage", storageListener);
      };
    },

    sendRealtimeMessage: async function(caseId, messageData) {
      const chats = getLocalStore("chats", DEFAULT_SEED.chats);
      if (!chats[caseId]) chats[caseId] = [];

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const newMsg = {
        id: "msg_" + Date.now(),
        ...messageData,
        time_formatted: timeStr
      };

      chats[caseId].push(newMsg);
      setLocalStore("chats", chats);

      window.dispatchEvent(new Event("storage"));
      return true;
    },

    saveAllData: function() {
      if (window.currentCases) {
        setLocalStore("cases", window.currentCases);
      }
      if (window.currentReports) {
        setLocalStore("reports", window.currentReports);
      }
      return true;
    },

    formatRoleName: function(role) {
      switch (role) {
        case 'KADER': return "Bhupa'";
        case 'GURU': return "Bhu' Ghuru";
        case 'RATO': return "Rato";
        case 'NAKES': return "Nakes";
        case 'ADMIN': return "Admin";
        default: return role || '';
      }
    },

    uploadUserProfilePhoto: async function(userId, fileOrBlob) {
      if (!userId) throw new Error("User ID wajib disertakan untuk upload foto profil.");
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result;
          await engine.updateUserProfile(userId, { photoURL: dataUrl });
          resolve({ success: true, photoURL: dataUrl, storage: "local" });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(fileOrBlob);
      });
    },

    updateUserProfile: async function(userId, updateData) {
      if (!userId) throw new Error("User ID tidak valid.");
      let users = getLocalStore("users", DEFAULT_SEED.users);
      const userIdx = users.findIndex(u => String(u.id) === String(userId) || u.phone === String(userId));
      if (userIdx !== -1) {
        users[userIdx] = Object.assign({}, users[userIdx], updateData, { updated_at: new Date().toISOString() });
        setLocalStore("users", users);
      }

      const activeUserStr = localStorage.getItem("malekkas_user");
      if (activeUserStr) {
        try {
          const activeUser = JSON.parse(activeUserStr);
          if (String(activeUser.id) === String(userId) || activeUser.phone === String(userId)) {
            const merged = Object.assign({}, activeUser, updateData);
            localStorage.setItem("malekkas_user", JSON.stringify(merged));
          }
        } catch (e) {}
      }
      return { success: true, data: updateData };
    }
  };

  // Assign ke window global
  window.malekkasEngine = engine;
  window.MalekkasEngine = engine;
  window.firebaseAdapter = engine;
  window.fb = engine;

})(window);