/**
 * SATENGKA PASUNG EWS — Real-Time Data Synchronization Engine (ES6 Module)
 * Mengelola langganan (realtime subscriptions) Firestore/IndexedDB untuk kasus,
 * laporan temuan kader, master desa, sinkronisasi profil, serta pemanggilan data.
 */

import { cleanRoleAccountName } from '../utils/formatters.js';

let casesUnsubscribe = null;
let reportsUnsubscribe = null;
let usersUnsubscribe = null;
let heartbeatInterval = null;
let lifecycleListenersAttached = false;

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

  // Fallback lokal resmi (13 Desa Terkunci)
  window.villagesData = [
    { id: '1', name: "Ampara'an", lat: -6.9634, lng: 113.1154 },
    { id: '2', name: "Bandang Laok", lat: -6.9312, lng: 113.0543 },
    { id: '3', name: "Bandasoleh", lat: -6.9612, lng: 113.0925 },
    { id: '4', name: "Batokorogan", lat: -6.9245, lng: 113.0911 },
    { id: '5', name: "Dupok", lat: -6.9754, lng: 113.1345 },
    { id: '6', name: "Durjan", lat: -6.9478, lng: 113.1234 },
    { id: '7', name: "Katol Timur", lat: -6.9821, lng: 113.0812 },
    { id: '8', name: "Kokop", lat: -6.9538, lng: 113.0841 },
    { id: '9', name: "Lembung Gunong", lat: -6.9421, lng: 113.0762 },
    { id: '10', name: "Mandung", lat: -6.9500, lng: 113.0700 },
    { id: '11', name: "Mano'an", lat: -6.9712, lng: 113.0645 },
    { id: '12', name: "Tlokoh", lat: -6.9891, lng: 113.0987 },
    { id: '13', name: "Tramok", lat: -6.9385, lng: 113.1021 }
  ];
}

/**
 * Setup Event Listener Lifecycle (Anti-Delay & Instant Tab Resume)
 * Memicu sinkronisasi data instan saat user kembali ke tab/aplikasi atau jaringan pulih.
 */
export function setupLifecycleSync() {
  if (lifecycleListenersAttached) return;
  lifecycleListenersAttached = true;

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && window.currentUser) {
        if (typeof fetchCases === 'function') fetchCases();
        if (typeof fetchReports === 'function') fetchReports();
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (window.currentUser) {
        if (typeof fetchCases === 'function') fetchCases();
        if (typeof fetchReports === 'function') fetchReports();
      }
    });

    window.addEventListener('online', () => {
      if (window.currentUser) {
        if (typeof fetchCases === 'function') fetchCases();
        if (typeof fetchReports === 'function') fetchReports();
        if (typeof fetchUsers === 'function' && (window.currentUser.role === 'NAKES' || window.currentUser.role === 'ADMIN')) {
          fetchUsers();
        }
      }
    });
  }
}

/**
 * Background Heartbeat Poller (Anti-Delay & Anti-Hit-Limit Safety Net)
 * Polling berkala 60 detik khusus Nakes/Admin saat tab aktif sebagai pengaman jika WebSocket onSnapshot dormant di HP
 */
export function startSyncHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const user = window.currentUser;
    if (!user) return;
    // Dibatasi khusus peran Nakes & Admin untuk melindungi kuota 50k reads Firestore
    if (user.role !== 'NAKES' && user.role !== 'ADMIN') return;
    try {
      if (typeof fetchCases === 'function') {
        await fetchCases();
      }
    } catch (e) {
      // Abaikan jika ada blip jaringan sementara
    }
  }, 60000);
}

/**
 * Inisialisasi subscription Firestore Real-Time
 */
export function initRealtimeSubscriptions() {
  setupLifecycleSync();
  startSyncHeartbeat();

  if (!window.firebaseAdapter) return;
  const currentUser = window.currentUser;

  const uid = currentUser ? currentUser.id : null;
  const urole = currentUser ? currentUser.role : null;
  const uvillageId = currentUser ? currentUser.village_id : null;
  const uvillageName = currentUser ? currentUser.village_name : null;
  const reporterId = (currentUser && currentUser.role === 'KADER') ? (currentUser.id || currentUser.uid) : null;
  const reporterUid = (currentUser && currentUser.role === 'KADER') ? (currentUser.uid || currentUser.id) : null;

  // 1. Sinkronisasi Real-time Kasus
  if (window.firebaseAdapter.subscribeCases) {
    if (casesUnsubscribe) casesUnsubscribe();
    casesUnsubscribe = window.firebaseAdapter.subscribeCases((cases) => {
      // Merge: proteksi respon partisipan lokal yang belum ter-replikasi ke cloud
      const prevCases = window.currentCases || [];
      if (prevCases.length > 0 && Array.isArray(cases)) {
        cases = cases.map(cc => {
          const prev = prevCases.find(pc => String(pc.id) === String(cc.id) || (pc.case_number && pc.case_number === cc.case_number));
          if (!prev || !Array.isArray(prev.participants)) return cc;
          const hasLocalResponse = prev.participants.some(p => p.response && p.response !== 'PENDING');
          if (!hasLocalResponse) return cc;

          // Merge per pilar peran: jangan pernah timpakan respon lokal yang aktif dengan PENDING dari cloud
          const mergedParts = (cc.participants || []).map(cp => {
            const lp = prev.participants.find(p => p.participant_role === cp.participant_role);
            if (lp && lp.response && lp.response !== 'PENDING' && (!cp.response || cp.response === 'PENDING')) {
              return { ...cp, response: lp.response, responded_at: lp.responded_at, note: lp.note || cp.note, response_note: lp.response_note || cp.response_note, user_id: lp.user_id || cp.user_id, phone: lp.phone || cp.phone, name: lp.name || cp.name };
            }
            return cp;
          });
          prev.participants.forEach(lp => {
            if (lp.response && lp.response !== 'PENDING' && !mergedParts.some(mp => mp.participant_role === lp.participant_role)) {
              mergedParts.push(lp);
            }
          });

          let readyCount = 0;
          let hasAny = false;
          mergedParts.forEach(p => {
            if (p.response && p.response !== 'PENDING') hasAny = true;
            if (p.response === 'READY' || p.response === 'SIAP' || p.response === 'AGREE') readyCount++;
          });
            let effectiveStatus = prev.status || cc.status;
            if (cc.status === 'MONITORING' || cc.status === 'CLOSED' || prev.status === 'MONITORING' || prev.status === 'CLOSED') {
              effectiveStatus = (cc.status === 'CLOSED' || prev.status === 'CLOSED') ? 'CLOSED' : 'MONITORING';
            } else if (readyCount >= 2) {
              effectiveStatus = 'READY_FOR_EVACUATION';
            } else if (hasAny && (cc.status === 'SIAGA' || prev.status === 'COORDINATION')) {
              effectiveStatus = 'COORDINATION';
            }

            return { ...cc, participants: mergedParts, status: effectiveStatus };
        });
      }
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
    // 3. Sinkronisasi Real-time Daftar User & Permintaan Registrasi Baru (Nakes/Admin)
    if (window.firebaseAdapter.subscribeUsers && currentUser && (currentUser.role === 'NAKES' || currentUser.role === 'ADMIN')) {
      if (usersUnsubscribe) usersUnsubscribe();
      usersUnsubscribe = window.firebaseAdapter.subscribeUsers((users) => {
        window.currentUsers = users;
        if (window.renderUsersTable) window.renderUsersTable(users);
        if (window.populateEwsSelects) window.populateEwsSelects(users);
      });
    }

    if (reportsUnsubscribe) reportsUnsubscribe();
    reportsUnsubscribe = window.firebaseAdapter.subscribeReports((reports) => {
      window.currentReports = reports;
      if (window.renderKaderRecentReports) window.renderKaderRecentReports(window.currentReports);
      if (window.handleKaderSearchFilter) {
        window.handleKaderSearchFilter(false);
      } else if (window.renderKaderStatusList) {
        window.renderKaderStatusList(window.currentReports);
      }
      if (window.renderAllReportsTable) window.renderAllReportsTable();
      if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();

      // Perbarui tabel dashboard & lencana notifikasi Nakes
      if (currentUser && (currentUser.role === 'NAKES' || currentUser.role === 'ADMIN')) {
        if (window.renderNakesDashboardCases) window.renderNakesDashboardCases(window.currentCases);
        if (window.updateNakesCounters) window.updateNakesCounters(window.currentCases);
      }
    }, { reporterId, reporterUid, villageId: uvillageId, role: urole, villageName: uvillageName, userName: currentUser?.name });
  }

  // 3. Real-time Session Watcher: Otomatis kick/logout jika akun dihapus oleh Nakes di faskes
  if (currentUser && currentUser.id && window.firebaseAdapter && window.firebaseAdapter.subscribeCurrentUserSession) {
    window.firebaseAdapter.subscribeCurrentUserSession(currentUser.id, (change) => {
      if (change && change.deleted) {
        if (window.triggerForcedLogout) {
          window.triggerForcedLogout(change.reason || 'Akun Anda telah dinonaktifkan atau dihapus oleh Administrator Puskesmas Kokop.');
        } else {
          localStorage.removeItem('malekkas_user');
          localStorage.removeItem('malekkas_token');
          localStorage.removeItem('malekkas_role');
          alert('Akun Anda telah dinonaktifkan atau dihapus oleh Administrator Puskesmas Kokop.');
          window.location.replace('login.html');
        }
      }
    });
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
      if (cloudProfile && cloudProfile.deleted) {
        if (window.triggerForcedLogout) {
          window.triggerForcedLogout('Akun Anda telah dinonaktifkan atau dihapus oleh Petugas Puskesmas Kokop.');
          return;
        }
      }

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

  // Inisialisasi subscription real-time Firestore untuk Kasus & Laporan + Lifecycle Sync
  initRealtimeSubscriptions();

  // Selalu muat data mutakhir langsung dari Cloud/Adapter (menghilangkan delay onSnapshot)
  const syncPromises = [fetchCases(), fetchReports()];
  if (currentUser && (currentUser.role === 'NAKES' || currentUser.role === 'ADMIN')) {
    syncPromises.push(fetchUsers());
  }
  await Promise.allSettled(syncPromises);
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
        // Merge: proteksi respon partisipan yang sudah di-submit lokal
        const prevCases = window.currentCases || [];
        let mergedData = res.data;
        if (prevCases.length > 0 && Array.isArray(mergedData)) {
          mergedData = mergedData.map(cc => {
            const prev = prevCases.find(pc => String(pc.id) === String(cc.id) || (pc.case_number && pc.case_number === cc.case_number));
            if (!prev || !Array.isArray(prev.participants)) return cc;
            const hasLocalResponse = prev.participants.some(p => p.response && p.response !== 'PENDING');
            if (!hasLocalResponse) return cc;

            // Merge per pilar peran: jangan pernah timpakan respon lokal yang aktif dengan PENDING dari cloud
            const mergedParts = (cc.participants || []).map(cp => {
              const lp = prev.participants.find(p => p.participant_role === cp.participant_role);
              if (lp && lp.response && lp.response !== 'PENDING' && (!cp.response || cp.response === 'PENDING')) {
                return { ...cp, response: lp.response, responded_at: lp.responded_at, note: lp.note || cp.note, response_note: lp.response_note || cp.response_note, user_id: lp.user_id || cp.user_id, phone: lp.phone || cp.phone, name: lp.name || cp.name };
              }
              return cp;
            });
            prev.participants.forEach(lp => {
              if (lp.response && lp.response !== 'PENDING' && !mergedParts.some(mp => mp.participant_role === lp.participant_role)) {
                mergedParts.push(lp);
              }
            });

            let readyCount = 0;
            let hasAny = false;
            mergedParts.forEach(p => {
              if (p.response && p.response !== 'PENDING') hasAny = true;
              if (p.response === 'READY' || p.response === 'SIAP' || p.response === 'AGREE') readyCount++;
            });
            let effectiveStatus = prev.status || cc.status;
            if (cc.status === 'MONITORING' || cc.status === 'CLOSED' || prev.status === 'MONITORING' || prev.status === 'CLOSED') {
              effectiveStatus = (cc.status === 'CLOSED' || prev.status === 'CLOSED') ? 'CLOSED' : 'MONITORING';
            } else if (readyCount >= 2) {
              effectiveStatus = 'READY_FOR_EVACUATION';
            } else if (hasAny && (cc.status === 'SIAGA' || prev.status === 'COORDINATION')) {
              effectiveStatus = 'COORDINATION';
            }

            return { ...cc, participants: mergedParts, status: effectiveStatus };
          });
        }
        window.currentCases = mergedData;

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
        if (window.initOrUpdateLeafletMap) window.initOrUpdateLeafletMap();

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
        if (window.handleKaderSearchFilter) window.handleKaderSearchFilter();
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
    const currentUser = window.currentUser;
    if (currentUser && currentUser.role !== 'NAKES' && currentUser.role !== 'ADMIN') {
      return;
    }
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
  window.setupLifecycleSync = setupLifecycleSync;
  window.startSyncHeartbeat = startSyncHeartbeat;
  window.loadData = loadData;
  window.fetchCases = fetchCases;
  window.fetchReports = fetchReports;
  window.fetchUsers = fetchUsers;

  window.DataSync = {
    loadVillages,
    initRealtimeSubscriptions,
    setupLifecycleSync,
    startSyncHeartbeat,
    loadData,
    fetchCases,
    fetchReports,
    fetchUsers
  };
}
