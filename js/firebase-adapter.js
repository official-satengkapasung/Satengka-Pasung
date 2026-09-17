/**
 * SATENGKA PASUNG EWS — Zero-Cost Data Layer & Local Storage Engine
 * Arsitektur: 100% Free Tier (Firebase Cloud / Local IndexedDB Engine)
 * TIDAK MEMERLUKAN PHP MAUPUN MARIADB!
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  onSnapshot, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { firebaseConfig } from "../firebase-config.js";

let db = null;
export let isFirebaseActive = false;

// Cek apakah kredensial Firebase sudah dimasukkan
try {
  if (firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("DUMMY")) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseActive = true;
    console.log("🔥 [SATENGKA PASUNG] Terhubung langsung ke Cloud Firestore (100% Free Tier)!");
  } else {
    console.log("⚡ [SATENGKA PASUNG] Menggunakan Local Client Storage Engine (Tanpa PHP/MySQL!).");
  }
} catch (e) {
  console.warn("⚠️ Firebase fallback ke Local Storage Engine:", e);
}

// =========================================================================
// DEFAULT SEED DATA (Disimpan otomatis di LocalStorage jika offline/local)
// =========================================================================
const DEFAULT_SEED = {
  villages: [
    { id: 1, name: "Kokop", district: "Kokop", regency: "Bangkalan" },
    { id: 2, name: "Bandasobah", district: "Kokop", regency: "Bangkalan" },
    { id: 3, name: "Batu Bintang", district: "Kokop", regency: "Bangkalan" },
    { id: 4, name: "Lembung Gunong", district: "Kokop", regency: "Bangkalan" },
    { id: 5, name: "Mandra'ah", district: "Kokop", regency: "Bangkalan" }
  ],
  users: [
    { id: 1, name: "Administrator EWS", phone: "081100000001", role: "ADMIN", village_id: 1, village_name: "Kokop" },
    { id: 2, name: "dr. Siti Amelia (Nakes)", phone: "081234567890", role: "NAKES", village_id: 1, village_name: "Kokop" },
    { id: 3, name: "Siti Kader Jiwa", phone: "081234567891", role: "KADER", village_id: 1, village_name: "Kokop" },
    { id: 4, name: "Kiai H. Kholil (Guru)", phone: "081234567892", role: "GURU", village_id: 1, village_name: "Kokop" },
    { id: 5, name: "Klebun Kokop (Rato)", phone: "081234567893", role: "RATO", village_id: 1, village_name: "Kokop" }
  ],
  cases: [],
  reports: [],
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

// Inisialisasi awal penyimpanan jika belum ada
getLocalStore("villages", DEFAULT_SEED.villages);
getLocalStore("users", DEFAULT_SEED.users);
getLocalStore("cases", DEFAULT_SEED.cases);
getLocalStore("reports", DEFAULT_SEED.reports);
getLocalStore("chats", DEFAULT_SEED.chats);

/**
 * Fungsi Reset Total Data Kasus, Laporan, dan Chat menjadi 0
 */
export function resetDatabase() {
  localStorage.setItem("malekkas_cases", JSON.stringify([]));
  localStorage.setItem("malekkas_reports", JSON.stringify([]));
  localStorage.setItem("malekkas_chats", JSON.stringify({}));
  localStorage.setItem("malekkas_villages", JSON.stringify(DEFAULT_SEED.villages));
  localStorage.setItem("malekkas_users", JSON.stringify(DEFAULT_SEED.users));
  console.log("🧹 [SATENGKA PASUNG] Database berhasil di-reset total menjadi 0 data operasional!");
  return { success: true, message: "Database berhasil di-reset menjadi 0 kasus dan 0 laporan!" };
}

// =========================================================================
// API REPLACEMENT FUNCTIONS (MENGGANTIKAN SEMUA CALL PHP)
// =========================================================================

export async function loginUser(phone, password) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const user = users.find(u => u.phone === phone);
  if (!user) {
    return { success: false, message: "Nomor HP tidak ditemukan." };
  }
  const token = "token_" + Math.random().toString(36).substring(2) + Date.now();
  return { success: true, message: "Login berhasil.", data: { token, user } };
}

export async function getVillages() {
  return { success: true, data: getLocalStore("villages", DEFAULT_SEED.villages) };
}

export async function getUsers() {
  return { success: true, data: getLocalStore("users", DEFAULT_SEED.users) };
}

export async function createUser(userData) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const newId = users.length + 1;
  const newUser = { id: newId, ...userData };
  users.push(newUser);
  setLocalStore("users", users);
  return { success: true, message: `Mitra ${userData.name} berhasil ditambahkan.` };
}

export async function getCases(userId = null, role = null) {
  let cases = getLocalStore("cases", DEFAULT_SEED.cases);
  if (userId && (role === "GURU" || role === "RATO")) {
    cases = cases.filter(c => c.participants && c.participants.some(p => String(p.user_id) === String(userId) || p.participant_role === role));
  }
  return { success: true, data: cases };
}

export async function getReports(reporterId = null) {
  let reports = getLocalStore("reports", DEFAULT_SEED.reports);
  if (reporterId) {
    reports = reports.filter(r => String(r.reporter_id) === String(reporterId));
  }
  return { success: true, data: reports };
}

export async function createReport(reportInput, currentUser) {
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
}

export async function activateSiagaEws(payload, currentUser) {
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
}

export async function respondParticipant(caseId, userId, responseVal, note = "") {
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

  // Cek apakah Guru & Rato sudah setuju
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
}

export async function updateCaseStatus(caseId, newStatus, note = "") {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => c.id === caseId);
  if (targetCase) {
    targetCase.status = newStatus;
    setLocalStore("cases", cases);
  }
  return { success: true, message: `Status kasus berhasil diperbarui ke: ${newStatus}` };
}

// =========================================================================
// REALTIME CHAT ENGINE (Menggantikan Polling 5 Detik)
// =========================================================================

export function subscribeTherapeuticChat(caseId, onUpdate) {
  const chats = getLocalStore("chats", DEFAULT_SEED.chats);
  const messages = chats[caseId] || [];
  onUpdate(messages);

  // Pasang listener storage event untuk sync antar-tab browser secara instan
  const storageListener = (e) => {
    if (e.key === "malekkas_chats") {
      const updatedChats = JSON.parse(e.newValue || "{}");
      onUpdate(updatedChats[caseId] || []);
    }
  };
  window.addEventListener("storage", storageListener);

  return () => {
    window.removeEventListener("storage", storageListener);
  };
}

export async function sendRealtimeMessage(caseId, messageData) {
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

  // Dispatch storage event ke tab lain
  window.dispatchEvent(new Event("storage"));
  return true;
}