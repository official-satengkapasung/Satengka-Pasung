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
      { id: 2, name: "dr. Siti Amelia (Nakes)", phone: "081234567890", role: "NAKES", village_id: 1, village_name: "Kokop" },
      { id: 3, name: "Siti Kader Jiwa", phone: "081234567891", role: "KADER", village_id: 1, village_name: "Kokop" },
      { id: 4, name: "Kiai H. Kholil (Guru)", phone: "081234567892", role: "GURU", village_id: 1, village_name: "Kokop" },
      { id: 5, name: "Klebun Kokop (Rato)", phone: "081234567893", role: "RATO", village_id: 1, village_name: "Kokop" }
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
        reporter_name: "Siti Kader Jiwa",
        reporter_phone: "081234567891",
        activated_at: "2026-09-11T09:15:00.000Z",
        participants: [
          { participant_role: "GURU", name: "Kiai H. Kholil (Guru)", phone: "081234567892", user_id: 4, response: "NEED_TIME", response_note: "Sedang sowan dan tabayyun ke pihak keluarga pasien agar ikhlas melepaskan pasung." },
          { participant_role: "RATO", name: "Klebun Kokop (Rato)", phone: "081234567893", user_id: 5, response: "READY", response_note: "Aparat Linmas dan Babinsa desa siap mengawal pengamanan rute evakuasi." }
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
          { participant_role: "GURU", name: "Kiai H. Kholil (Guru)", phone: "081234567892", user_id: 4, response: "AGREE", response_note: "Keluarga telah diberi pencerahan agama bahwa ODGJ berhak diobati secara medis." },
          { participant_role: "RATO", name: "Klebun Durjan (Rato)", phone: "081234567893", user_id: 5, response: "READY", response_note: "Kendaraan operasional desa dan linmas siap mengawal mobil ambulans Puskesmas." }
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
        reporter_name: "Siti Kader Jiwa",
        reporter_phone: "081234567891",
        activated_at: "2026-09-10T07:00:00.000Z",
        participants: [
          { participant_role: "GURU", name: "Kiai H. Kholil (Guru)", phone: "081234567892", user_id: 4, response: "AGREE", response_note: "Doa dan bimbingan rohani berjalan rutin tiap minggu." },
          { participant_role: "RATO", name: "Klebun Dupok (Rato)", phone: "081234567893", user_id: 5, response: "READY", response_note: "Masyarakat desa telah menerima pasien dengan baik tanpa stigma." }
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
            recorded_by: "Siti Kader Jiwa"
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

    getVillages: async function() {
      return { success: true, data: getLocalStore("villages", DEFAULT_SEED.villages) };
    },

    getUsers: async function() {
      return { success: true, data: getLocalStore("users", DEFAULT_SEED.users) };
    },

    createUser: async function(userData) {
      const users = getLocalStore("users", DEFAULT_SEED.users);
      const newId = users.length + 1;
      const newUser = { id: newId, ...userData };
      users.push(newUser);
      setLocalStore("users", users);
      return { success: true, message: `Mitra ${userData.name} berhasil ditambahkan.` };
    },

    getCases: async function(userId = null, role = null) {
      let cases = getLocalStore("cases", DEFAULT_SEED.cases);
      if (userId && (role === "GURU" || role === "RATO")) {
        cases = cases.filter(c => c.participants && c.participants.some(p => String(p.user_id) === String(userId) || p.participant_role === role));
      }
      return { success: true, data: cases };
    },

    getReports: async function(reporterId = null) {
      let reports = getLocalStore("reports", DEFAULT_SEED.reports);
      if (reporterId) {
        reports = reports.filter(r => String(r.reporter_id) === String(reporterId));
      }
      return { success: true, data: reports };
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
        reporter_name: currentUser ? currentUser.name : "Siti Kader Jiwa",
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

      const guru = users.find(u => String(u.id) === String(payload.guru_id)) || { id: 4, name: "Kiai H. Kholil (Guru)", phone: "081234567892" };
      const rato = users.find(u => String(u.id) === String(payload.rato_id)) || { id: 5, name: "Klebun Kokop (Rato)", phone: "081234567893" };

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
    }
  };

  // Assign ke window global
  window.malekkasEngine = engine;
  window.firebaseAdapter = engine;
  window.fb = engine;

})(window);