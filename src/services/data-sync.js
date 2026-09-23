/**
 * SATENGKA PASUNG EWS — Real-Time Data Synchronization Engine (ES6 Module)
 * Mengelola langganan (realtime subscriptions) Firestore/IndexedDB untuk kasus,
 * laporan temuan kader, master desa, sinkronisasi profil, serta pemanggilan data.
 */

import { cleanRoleAccountName } from '../utils/formatters.js';

let casesUnsubscribe = null;
let reportsUnsubscribe = null;

/**
 * Load Master Data Villages (Zero-Cost Engine / Firebase)
 */
export async function loadVillages() {
  try {
    if (window.firebaseAdapter && window.firebaseAdapter.getVillages) {
      const res = await window.firebaseAdapter.getVillages();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        window.villagesData = res.data;
        return;
      }
    }
  } catch (e) {
    console.warn('Gagal memuat desa dari server/adapter:', e);
  }

  // Fallback lokal resmi Kecamatan Kokop (13 Desa)
  window.villagesData = [
    { id: '1', name: 'Kokop', lat: -6.9538, lng: 113.0841 },
    { id: '2', name: 'Bandasobah', lat: -6.9612, lng: 113.0925 },
    { id: '3', name: 'Lembung Gunong', lat: -6.9421, lng: 113.0762 },
    { id: '4', name: 'Tramok', lat: -6.9385, lng: 113.1021 },
    { id: '5', name: 'Mano\'an', lat: -6.9712, lng: 113.0645 },
    { id: '6', name: 'Batu Korokan', lat: -6.9245, lng: 113.0911 },
    { id: '7', name: 'Amparaan', lat: -6.9634, lng: 113.1154 },
    { id: '8', name: 'Katol Barat', lat: -6.9821, lng: 113.0812 },
    { id: '9', name: 'Durjan', lat: -6.9478, lng: 113.1234 },
    { id: '10', name: 'Bandang Laok', lat: -6.9312, lng: 113.0543 },
    { id: '11', name: 'Dupok', lat: -6.9754, lng: 113.1345 },
    { id: '12', name: 'Tlokoh', lat: -6.9891, lng: 113.0987 },
    { id: '13', name: 'Villages Kokop', lat: -6.9500, lng: 113.0800 }
  ];
}

/**
 * Inisialisasi subscription Firestore Real-Time
 */
export function initRealtimeSubscriptions() {
  if (!window.firebaseAdapter) return;
  const currentUser = window.currentUser;

  const uid = currentUser ? currentUser.id : null;
  const urole = currentUser ? currentUser.role : null;
  const uvillageId = currentUser ? currentUser.village_id : null;
  const uvillageName = currentUser ? currentUser.village_name : null;
  const reporterId = (currentUser && currentUser.role === 'KADER') ? currentUser.id : null;

  // 1. Sinkronisasi Real-time Kasus
  if (window.firebaseAdapter.subscribeCases) {
    if (casesUnsubscribe) casesUnsubscribe();
    casesUnsubscribe = window.firebaseAdapter.subscribeCases((cases) => {
      window.currentCases = cases;

      // Re-konsiliasi kasus dengan laporan terkait
      let cachedReports = window.currentReports;
      if (!cachedReports || cachedReports.length === 0) {
        try { cachedReports = JSON.parse(localStorage.getItem('malekkas_reports') || '[]'); } catch (e) { cachedReports = []; }
      }
      if (Array.isArray(cachedReports) && cachedReports.length > 0) {
        window.currentCases.forEach(c => {
          if (c.report_id) {
            const mRep = cachedReports.find(r => String(r.id) === String(c.report_id));
            if (mRep && mRep.reporter_name && (!c.reporter_name || c.reporter_name === 'Siti')) {
              c.reporter_name = mRep.reporter_name;
              if (mRep.reporter_phone) c.reporter_phone = mRep.reporter_phone;
            }
          }
        });
      }

      if (window.renderNakesDashboardCases) window.renderNakesDashboardCases(window.currentCases);
      if (window.renderGuruMobileRequests) window.renderGuruMobileRequests(window.currentCases);
      if (window.renderRatoMobileRequests) window.renderRatoMobileRequests(window.currentCases);
      if (window.updateNakesCounters) window.updateNakesCounters(window.currentCases);
      if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();

      // Sinkronkan marker peta Leaflet secara reaktif
      if (window.initOrUpdateLeafletMap) {
        window.initOrUpdateLeafletMap();
      }

      // Sinkronkan alur monitoring stepper bila sedang melihat detail
      if (window.activeMonitoringCaseId && window.updateMonitoringStepper) {
        const monCase = window.currentCases.find(c => String(c.id) === String(window.activeMonitoringCaseId));
        if (monCase) window.updateMonitoringStepper(monCase);
      } else if (window.updateMonitoringStepper) {
        const firstSiaga = window.currentCases.find(c => c.status === 'SIAGA' || c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION');
        if (firstSiaga) window.updateMonitoringStepper(firstSiaga);
      }
    }, { userId: uid, role: urole, villageId: uvillageId, villageName: uvillageName });
  }

  // 2. Sinkronisasi Real-time Laporan Temuan Kader
  if (window.firebaseAdapter.subscribeReports) {
    if (reportsUnsubscribe) reportsUnsubscribe();
    reportsUnsubscribe = window.firebaseAdapter.subscribeReports((reports) => {
      window.currentReports = reports;
      if (window.renderKaderRecentReports) window.renderKaderRecentReports(window.currentReports);
      if (window.renderAllReportsTable) window.renderAllReportsTable();
      if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();

      // Perbarui tabel dashboard & lencana notifikasi Nakes
      if (currentUser && (currentUser.role === 'NAKES' || currentUser.role === 'ADMIN')) {
        if (window.renderNakesDashboardCases) window.renderNakesDashboardCases(window.currentCases);
        if (window.updateNakesCounters) window.updateNakesCounters(window.currentCases);
      }
    }, { reporterId, villageId: uvillageId, role: urole, villageName: uvillageName });
  }
}

/**
 * Load Keseluruhan Data Kasus & Laporan
 */
export async function loadData() {
  const currentUser = window.currentUser;

  // Re-sinkronkan profil dari Cloud Firestore jika ada
  if (currentUser && window.firebaseAdapter && window.firebaseAdapter.getUserProfileFromCloud) {
    try {
      const cloudProfile = await window.firebaseAdapter.getUserProfileFromCloud(currentUser.id);
      if (cloudProfile && cloudProfile.success && cloudProfile.data) {
        const cp = cloudProfile.data;
        let needUpdate = false;
        if (cp.photoURL && cp.photoURL !== currentUser.photoURL) {
          currentUser.photoURL = cp.photoURL;
          needUpdate = true;
        }
        if (cp.name && cp.name !== currentUser.name) {
          currentUser.name = cleanRoleAccountName(cp.name);
          needUpdate = true;
        }
        if (needUpdate) {
          localStorage.setItem('malekkas_user', JSON.stringify(currentUser));
          if (window.updateUserAvatarsUI) window.updateUserAvatarsUI();
          if (window.renderRoleInterface) window.renderRoleInterface();
        }
      }
    } catch (e) {
      console.warn('Sync profile cloud fallback:', e);
    }
  }

  // Inisialisasi subscription real-time Firestore untuk Kasus & Laporan
  initRealtimeSubscriptions();

  await Promise.all([fetchCases(), fetchReports(), fetchUsers()]);
}

export async function fetchCases() {
  try {
    const currentUser = window.currentUser;
    const uid = currentUser ? currentUser.id : '';
    const urole = currentUser ? currentUser.role : '';
    const uvillageId = currentUser ? currentUser.village_id : null;
    const uvillageName = currentUser ? currentUser.village_name : null;

    if (window.firebaseAdapter && window.firebaseAdapter.getCases) {
      const res = await window.firebaseAdapter.getCases(uid, urole, uvillageId, uvillageName);
      if (res.success) {
        window.currentCases = res.data;

        // Rekonsiliasi kasus dengan laporan terkait secara instan
        let cachedReports = window.currentReports;
        if (!cachedReports || cachedReports.length === 0) {
          try { cachedReports = JSON.parse(localStorage.getItem('malekkas_reports') || '[]'); } catch (e) { cachedReports = []; }
        }
        if (Array.isArray(cachedReports) && cachedReports.length > 0) {
          window.currentCases.forEach(c => {
            if (c.report_id) {
              const mRep = cachedReports.find(r => String(r.id) === String(c.report_id));
              if (mRep && mRep.reporter_name && (!c.reporter_name || c.reporter_name === 'Siti')) {
                c.reporter_name = mRep.reporter_name;
                if (mRep.reporter_phone) c.reporter_phone = mRep.reporter_phone;
              }
            }
          });
        }

        if (window.renderNakesDashboardCases) window.renderNakesDashboardCases(window.currentCases);
        if (window.renderGuruMobileRequests) window.renderGuruMobileRequests(window.currentCases);
        if (window.renderRatoMobileRequests) window.renderRatoMobileRequests(window.currentCases);
        if (window.updateNakesCounters) window.updateNakesCounters(window.currentCases);
        if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();

        // Jika ada kasus monitoring yang aktif, sinkronkan stepper
        if (window.activeMonitoringCaseId && window.updateMonitoringStepper) {
          const monCase = window.currentCases.find(c => c.id === window.activeMonitoringCaseId);
          if (monCase) window.updateMonitoringStepper(monCase);
        } else if (window.updateMonitoringStepper) {
          const firstSiaga = window.currentCases.find(c => c.status === 'SIAGA' || c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION');
          if (firstSiaga) window.updateMonitoringStepper(firstSiaga);
        }
      }
    }
  } catch (e) {
    console.warn('Fetch cases error:', e);
  }
}

export async function fetchReports() {
  try {
    const currentUser = window.currentUser;
    const reporterId = (currentUser && currentUser.role === 'KADER') ? currentUser.id : null;
    const uvillageId = currentUser ? currentUser.village_id : null;
    const urole = currentUser ? currentUser.role : null;
    const uvillageName = currentUser ? currentUser.village_name : null;

    if (window.firebaseAdapter && window.firebaseAdapter.getReports) {
      const res = await window.firebaseAdapter.getReports(reporterId, uvillageId, urole, uvillageName);
      if (res.success) {
        window.currentReports = res.data;
        if (window.renderKaderRecentReports) window.renderKaderRecentReports(window.currentReports);
        if (window.renderAllReportsTable) window.renderAllReportsTable();
        if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();

        // Sinkronkan Dashboard & Counter Nakes jika login sebagai NAKES/ADMIN
        if (currentUser && (currentUser.role === 'NAKES' || currentUser.role === 'ADMIN')) {
          if (Array.isArray(window.currentCases) && window.currentCases.length > 0) {
            window.currentCases.forEach(c => {
              if (c.report_id) {
                const mRep = window.currentReports.find(r => String(r.id) === String(c.report_id));
                if (mRep && mRep.reporter_name && (!c.reporter_name || c.reporter_name === 'Siti')) {
                  c.reporter_name = mRep.reporter_name;
                  if (mRep.reporter_phone) c.reporter_phone = mRep.reporter_phone;
                }
              }
            });
          }
          if (window.renderNakesDashboardCases) window.renderNakesDashboardCases(window.currentCases);
          if (window.updateNakesCounters) window.updateNakesCounters(window.currentCases);
        }
      }
    }
  } catch (e) {
    console.warn('Fetch reports error:', e);
  }
}

export async function fetchUsers() {
  try {
    if (window.firebaseAdapter && window.firebaseAdapter.getUsers) {
      const res = await window.firebaseAdapter.getUsers();
      if (res.success) {
        window.currentUsers = res.data;
        if (window.renderUsersTable) window.renderUsersTable(res.data);
        if (window.populateEwsSelects) window.populateEwsSelects(res.data);
      }
    }
  } catch (e) {
    console.warn('Fetch users error:', e);
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.loadVillages = loadVillages;
  window.initRealtimeSubscriptions = initRealtimeSubscriptions;
  window.loadData = loadData;
  window.fetchCases = fetchCases;
  window.fetchReports = fetchReports;
  window.fetchUsers = fetchUsers;

  window.DataSync = {
    loadVillages,
    initRealtimeSubscriptions,
    loadData,
    fetchCases,
    fetchReports,
    fetchUsers
  };
}
