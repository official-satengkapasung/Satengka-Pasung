/**
 * SATENGKA PASUNG EWS — Service Layer Facade (ES6 Module)
 * Menyatukan akses data kasus, laporan, dan otentikasi Firebase secara seragam & modular.
 */

import { getCurrentUser } from './storage.js';

/**
 * Mendapatkan referensi adapter data aktif (Firebase Firestore / Offline Mock).
 * @returns {Object}
 */
export function getAdapter() {
  if (typeof window !== 'undefined' && window.firebaseAdapter) {
    return window.firebaseAdapter;
  }
  return null;
}

/**
 * Mengambil daftar kasus EWS sesuai peran dan wilayah pengguna.
 * @param {Object} [user] - Pengguna opsional, default currentUser dari storage
 * @returns {Promise<Array>}
 */
export async function fetchCases(user = null) {
  const activeUser = user || getCurrentUser();
  const uid = activeUser ? activeUser.id : '';
  const urole = activeUser ? activeUser.role : '';
  const uvillageId = activeUser ? activeUser.village_id : null;
  const uvillageName = activeUser ? activeUser.village_name : null;

  const adapter = getAdapter();
  if (adapter && typeof adapter.getCases === 'function') {
    const res = await adapter.getCases(uid, urole, uvillageId, uvillageName);
    return res && res.success ? res.data : [];
  }
  return [];
}

/**
 * Mengambil daftar laporan masyarakat / kader.
 * @param {Object} [user] - Pengguna opsional
 * @returns {Promise<Array>}
 */
export async function fetchReports(user = null) {
  const activeUser = user || getCurrentUser();
  const reporterId = (activeUser && activeUser.role === 'KADER') ? activeUser.id : null;
  const uvillageId = activeUser ? activeUser.village_id : null;
  const urole = activeUser ? activeUser.role : null;
  const uvillageName = activeUser ? activeUser.village_name : null;

  const adapter = getAdapter();
  if (adapter && typeof adapter.getReports === 'function') {
    const res = await adapter.getReports(reporterId, uvillageId, urole, uvillageName);
    return res && res.success ? res.data : [];
  }
  return [];
}

/**
 * Mengambil daftar seluruh pengguna terdaftar.
 * @returns {Promise<Array>}
 */
export async function fetchUsers() {
  const adapter = getAdapter();
  if (adapter && typeof adapter.getUsers === 'function') {
    const res = await adapter.getUsers();
    return res && res.success ? res.data : [];
  }
  return [];
}

/**
 * Membuat laporan indikasi pasung baru.
 * @param {Object} reportInput
 * @param {Object} [currentUser]
 * @returns {Promise<Object>}
 */
export async function createReport(reportInput, currentUser = null) {
  const activeUser = currentUser || getCurrentUser();
  const adapter = getAdapter();
  if (adapter && typeof adapter.createReport === 'function') {
    return await adapter.createReport(reportInput, activeUser);
  }
  throw new Error('Adapter database tidak tersedia.');
}

/**
 * Memvalidasi laporan oleh Nakes.
 * @param {string|number} reportId 
 * @param {Object} validationData 
 * @returns {Promise<Object>}
 */
export async function validateReport(reportId, validationData = {}) {
  const adapter = getAdapter();
  if (adapter && typeof adapter.validateReport === 'function') {
    return await adapter.validateReport(reportId, validationData);
  }
  throw new Error('Adapter database tidak tersedia.');
}

/**
 * Mengaktifkan alarm Siaga EWS & memetakan 4 Pilar.
 * @param {Object} payload 
 * @param {Object} [currentUser] 
 * @returns {Promise<Object>}
 */
export async function activateSiagaEws(payload, currentUser = null) {
  const activeUser = currentUser || getCurrentUser();
  const adapter = getAdapter();
  if (adapter && typeof adapter.activateSiagaEws === 'function') {
    return await adapter.activateSiagaEws(payload, activeUser);
  }
  throw new Error('Adapter database tidak tersedia.');
}

/**
 * Mengirim respon tokoh / pilar pendamping kasus.
 * @param {string|number} caseId 
 * @param {string|number} userId 
 * @param {string} responseVal 
 * @param {string} note 
 * @param {string} userRole 
 * @returns {Promise<Object>}
 */
export async function respondParticipant(caseId, userId, responseVal, note = '', userRole = '') {
  const adapter = getAdapter();
  if (adapter && typeof adapter.respondParticipant === 'function') {
    return await adapter.respondParticipant(caseId, userId, responseVal, note, userRole);
  }
  throw new Error('Adapter database tidak tersedia.');
}

/**
 * Memperbarui status penanganan kasus.
 * @param {string|number} caseId 
 * @param {string} newStatus 
 * @param {string} note 
 * @returns {Promise<Object>}
 */
export async function updateCaseStatus(caseId, newStatus, note = '') {
  const adapter = getAdapter();
  if (adapter && typeof adapter.updateCaseStatus === 'function') {
    return await adapter.updateCaseStatus(caseId, newStatus, note);
  }
  throw new Error('Adapter database tidak tersedia.');
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.EwsService = {
    getAdapter,
    fetchCases,
    fetchReports,
    fetchUsers,
    createReport,
    validateReport,
    activateSiagaEws,
    respondParticipant,
    updateCaseStatus
  };
  window.SatengkaService = window.EwsService;
}
