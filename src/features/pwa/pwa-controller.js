/**
 * SATENGKA PASUNG EWS — PWA Navigation & Shell Controller (ES6 Module)
 * Mengelola navigasi tab mobile/desktop peran mitra (Kader, Guru, Rato),
 * instalasi PWA prompt otomatis, dan penanganan Service Worker.
 */

let deferredPromptGlobal = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptGlobal = e;
    console.log('💡 [PWA] Event beforeinstallprompt tertangkap, siap di-trigger!');
    const pBtn = document.getElementById('btnPwaInstallProfile');
    if (pBtn) {
      pBtn.classList.add('animate-pulse');
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('🎉 SATENGKA PASUNG PWA berhasil diinstal!');
    const pBtn = document.getElementById('btnPwaInstallProfile');
    if (pBtn) pBtn.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600"></i><span>Aplikasi Sudah Terpasang</span>';
  });

  // Registrasi PWA Service Worker (Offline Support)
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('🛡️ [PWA] Service Worker aktif:', reg.scope))
        .catch(err => console.warn('PWA SW registration failed:', err));
    });
  }
}

export function syncNavHighlight(type) {
  if (typeof document === 'undefined') return;

  // Highlight pada Desktop / Tablet Pills (sm:flex)
  const pillHome = document.getElementById('desktopPillHome');
  const pillAction = document.getElementById('desktopPillAction');
  const pillRiwayat = document.getElementById('desktopPillRiwayat');

  [pillHome, pillAction, pillRiwayat].forEach(p => {
    if (p) {
      p.classList.remove('bg-white', 'text-emerald-800', 'shadow-sm');
      p.classList.add('text-slate-600');
    }
  });

  if (type === 'home' && pillHome) {
    pillHome.classList.add('bg-white', 'text-emerald-800', 'shadow-sm');
    pillHome.classList.remove('text-slate-600');
  } else if (type === 'action' && pillAction) {
    pillAction.classList.add('bg-white', 'text-emerald-800', 'shadow-sm');
    pillAction.classList.remove('text-slate-600');
  } else if (type === 'riwayat' && pillRiwayat) {
    pillRiwayat.classList.add('bg-white', 'text-emerald-800', 'shadow-sm');
    pillRiwayat.classList.remove('text-slate-600');
  }

  // Highlight pada Mobile Bottom Bar (< 640px)
  const mHome = document.getElementById('mobileNavHome');
  const mAction = document.getElementById('mobileNavAction');
  const mRiwayat = document.getElementById('mobileNavRiwayat');

  [mHome, mAction, mRiwayat].forEach(btn => {
    if (btn) {
      btn.classList.remove('text-emerald-700', 'font-bold', 'scale-105');
      btn.classList.add('text-slate-400');
    }
  });

  if (type === 'home' && mHome) {
    mHome.classList.add('text-emerald-700', 'font-bold', 'scale-105');
    mHome.classList.remove('text-slate-400');
  } else if (type === 'action' && mAction) {
    mAction.classList.add('text-emerald-700', 'font-bold', 'scale-105');
    mAction.classList.remove('text-slate-400');
  } else if (type === 'riwayat' && mRiwayat) {
    mRiwayat.classList.add('text-emerald-700', 'font-bold', 'scale-105');
    mRiwayat.classList.remove('text-slate-400');
  }
}

export function handleMobileNavAction(type) {
  const currentUser = window.currentUser;
  if (!currentUser) return;

  const isSuperadmin = currentUser.role === 'ADMIN' || currentUser.is_superadmin;
  const currentRole = (isSuperadmin && window.superadminSimulatedRole) ? window.superadminSimulatedRole : currentUser.role;

  if (type === 'home') {
    if (currentRole === 'KADER') {
      if (window.switchKaderPwaSub) window.switchKaderPwaSub('dashboard');
    } else if (currentRole === 'GURU') {
      if (window.closeGuruDetailScreen) window.closeGuruDetailScreen();
      if (window.closeGuruRiwayatScreen) window.closeGuruRiwayatScreen();
      const frame = document.getElementById('mobileDeviceFrame');
      if (frame) frame.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentRole === 'RATO') {
      if (window.closeRatoDetailScreen) window.closeRatoDetailScreen();
      if (window.closeRatoRiwayatScreen) window.closeRatoRiwayatScreen();
      const frame = document.getElementById('mobileDeviceFrame');
      if (frame) frame.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else if (type === 'action') {
    if (currentRole === 'KADER') {
      if (window.switchKaderPwaSub) window.switchKaderPwaSub('form');
    } else if (currentRole === 'GURU') {
      if (window.closeGuruDetailScreen) window.closeGuruDetailScreen();
      if (window.closeGuruRiwayatScreen) window.closeGuruRiwayatScreen();
      const el = document.getElementById('guruRequestsContainer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-emerald-500', 'rounded-2xl', 'p-2', 'transition-all');
        setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500', 'p-2'), 1800);
      }
    } else if (currentRole === 'RATO') {
      if (window.closeRatoDetailScreen) window.closeRatoDetailScreen();
      if (window.closeRatoRiwayatScreen) window.closeRatoRiwayatScreen();
      const el = document.getElementById('ratoRequestsContainer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-indigo-500', 'rounded-2xl', 'p-2', 'transition-all');
        setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500', 'p-2'), 1800);
      }
    }
  } else if (type === 'riwayat') {
    if (currentRole === 'KADER') {
      if (window.switchKaderPwaSub) window.switchKaderPwaSub('status');
    } else if (currentRole === 'GURU') {
      if (window.openGuruRiwayatScreen) window.openGuruRiwayatScreen();
    } else if (currentRole === 'RATO') {
      if (window.openRatoRiwayatScreen) window.openRatoRiwayatScreen();
    }
  }

  syncNavHighlight(type);
}

export async function triggerPwaInstallGlobal() {
  if (deferredPromptGlobal) {
    deferredPromptGlobal.prompt();
    const choiceResult = await deferredPromptGlobal.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ User menerima instalasi SATENGKA PASUNG PWA');
    }
    deferredPromptGlobal = null;
  } else {
    const isStandalone = (typeof window !== 'undefined') && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
    if (isStandalone) {
      alert('Aplikasi SATENGKA PASUNG sudah terpasang dan berjalan dalam mode PWA Standalone!');
    } else {
      alert('Petunjuk Pasang SATENGKA PASUNG PWA:\n\n' +
        '📱 Di Ponsel Android / Chrome: Klik menu titik tiga (⋮) di kanan atas, lalu pilih "Tambahkan ke Layar Utama" / "Install Aplikasi".\n\n' +
        '🍎 Di iPhone / Safari: Klik tombol Share (ikon kotak tanda panah atas), lalu pilih "Add to Home Screen".\n\n' +
        '💻 Di Komputer Chrome/Edge: Klik ikon Install di bilah alamat URL browser.');
    }
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.syncNavHighlight = syncNavHighlight;
  window.handleMobileNavAction = handleMobileNavAction;
  window.triggerPwaInstallGlobal = triggerPwaInstallGlobal;

  window.PwaController = {
    syncNavHighlight,
    handleMobileNavAction,
    triggerPwaInstallGlobal
  };
}
