/**
 * SATENGKA PASUNG EWS — Main Application Bootstrap & Lifecycle (ES6 Native Module)
 * Titik masuk sentral aplikasi PWA Vite. Menginisialisasi koneksi Cloud Firestore,
 * validasi otentikasi sesi, pemuatan data awal, sinkronisasi antar-tab, dan dismiss splash screen.
 */

// Import Core Modules
import './utils/formatters.js';
import './services/storage.js';
import './services/ews-service.js';
import './features/ews/geo-kokop.js';
import './features/ews/triage-engine.js';
import './features/ews/siaga-controller.js';
import './components/ui/toast.js';
import './components/ui/modal-controller.js';
import './features/roles/mitra-view.js';
import './features/roles/kader-view.js';
import './features/nakes/nakes-view.js';
import './features/nakes/case-detail.js';
import './features/nakes/user-management.js';
import './features/nakes/map-controller.js';
import './features/nakes/monitoring-controller.js';
import './features/nakes/table-controller.js';
import './features/nakes/drug-controller.js';
import './features/chat/chat-controller.js';
import './features/profile/profile-controller.js';
import './services/data-sync.js';
import './features/pwa/pwa-controller.js';
import './features/auth/auth-controller.js';
import './services/mock-engine.js';

// Setup Global State jika belum ada
if (typeof window !== 'undefined') {
  window.currentUser = window.currentUser || null;
  window.currentUsers = window.currentUsers || [];
  window.currentCases = window.currentCases || [];
  window.currentReports = window.currentReports || [];
  window.activeSelectedCase = window.activeSelectedCase || null;
  window.activeDrugMonitoringCase = window.activeDrugMonitoringCase || null;
  window.editingControlVisitNum = window.editingControlVisitNum || null;
  window.activeMonitoringCaseId = window.activeMonitoringCaseId || null;
  window.monitoringTimer = window.monitoringTimer || null;
  window.monitoringStartTime = window.monitoringStartTime || null;
  window.mobileGpsCoords = window.mobileGpsCoords || { lat: -7.0145, lng: 113.0234 };
  window.mobilePhotoBase64 = window.mobilePhotoBase64 || null;
  window.chatUnsubscribe = window.chatUnsubscribe || null;
  window.casesUnsubscribe = window.casesUnsubscribe || null;
  window.reportsUnsubscribe = window.reportsUnsubscribe || null;

  // Firebase Adapter Dynamic Loader Promise
  if (!window.firebaseReadyPromise) {
    window.firebaseReadyPromise = (async () => {
      if (window.location.protocol.startsWith('http')) {
        try {
          const fbModule = await import('../js/firebase-adapter.js');
          if (fbModule) {
            window.firebaseAdapter = Object.assign(window.firebaseAdapter || {}, fbModule);
            console.log("🔥 [SATENGKA PASUNG] Cloud Firestore aktif di Dashboard!");
            return fbModule;
          }
        } catch (err) {
          console.warn("⚠️ Firebase Cloud module fallback:", err);
        }
      }
      return null;
    })();
  }
}

// 🚀 Inisialisasi Aplikasi (Bootstrap Lifecycle)
export async function initApp() {
  const isAuthed = window.checkSession ? await window.checkSession() : false;

  // Segera hilangkan splash screen begitu antarmuka awal siap (0ms jika unauthenticated/audit bot)
  if (window.dismissSplashScreen) {
    window.dismissSplashScreen(isAuthed ? 100 : 0);
  }

  // Muat Firebase dan sinkronisasi data faskes di background
  if (isAuthed) {
    if (window.firebaseReadyPromise) {
      try {
        await window.firebaseReadyPromise;
      } catch (e) {
        console.warn('Firebase readiness error:', e);
      }
    }
    if (window.loadVillages) await window.loadVillages();
    if (window.loadData) await window.loadData();
  }
}

// 🔄 Realtime Cross-tab & Multi-role Sync Event Listener
export function setupStorageSync() {
  window.addEventListener('storage', async (e) => {
    try {
      if (!e.key || e.key === 'cases' || e.key === 'reports') {
        if (window.fetchCases && window.fetchReports) {
          await Promise.all([window.fetchCases(), window.fetchReports()]);
        }
        const currentUser = window.currentUser;
        if (currentUser) {
          if (currentUser.role === 'GURU') {
            if (window.renderGuruMobileRequests) window.renderGuruMobileRequests(window.currentCases);
            if (typeof window.renderGuruRiwayatList === 'function') window.renderGuruRiwayatList();
          } else if (currentUser.role === 'RATO') {
            if (window.renderRatoMobileRequests) window.renderRatoMobileRequests(window.currentCases);
            if (typeof window.renderRatoRiwayatList === 'function') window.renderRatoRiwayatList();
          } else if (currentUser.role === 'KADER') {
            if (window.renderKaderRecentReports) window.renderKaderRecentReports(window.currentReports);
            if (typeof window.renderKaderStatusList === 'function') window.renderKaderStatusList(window.currentReports);
          } else {
            if (window.renderNakesDashboardCases) window.renderNakesDashboardCases(window.currentCases);
            if (typeof window.handleReportsFilterSort === 'function') window.handleReportsFilterSort(false);
            if (typeof window.handleCasesFilterSort === 'function') window.handleCasesFilterSort(false);
            if (window.activeSelectedCase) {
              const refreshed = window.currentCases.find(c => String(c.id) === String(window.activeSelectedCase.id));
              if (refreshed) {
                window.activeSelectedCase = refreshed;
                if (window.selectCaseDetail) window.selectCaseDetail(window.activeSelectedCase.id);
              }
            }
          }
          if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();
        }
      }
    } catch (err) {
      console.warn('Storage sync error:', err);
    }
  });
}

// Event Listeners Auto-Mount
if (typeof window !== 'undefined') {
  window.initApp = initApp;
  setupStorageSync();

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
