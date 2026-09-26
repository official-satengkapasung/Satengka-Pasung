/**
 * SATENGKA PASUNG EWS — Auth & Role Interface Controller (ES6 Module)
 * Mengelola verifikasi sesi (checkSession), logout, perutean antarmuka peran (Nakes vs Mobile PWA),
 * drawer navigasi mobile, avatar pengguna, dan splash screen.
 */

import { cleanRoleAccountName, getRoleVisualMeta } from '../../utils/formatters.js';

export function dismissSplashScreen(delay = 500) {
  if (typeof document === 'undefined') return;
  const splash = document.getElementById('appSplashScreen');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('splash-hidden');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 550);
  }, delay);
}

export async function checkSession() {
  if (typeof window === 'undefined') return false;
  const savedUser = localStorage.getItem('malekkas_user');
  const savedToken = localStorage.getItem('malekkas_token');

  if (!savedUser || !savedToken) {
    window.location.href = 'login.html';
    return false;
  }

  try {
    window.currentUser = JSON.parse(savedUser);
    if (window.currentUser && window.currentUser.name) {
      window.currentUser.name = cleanRoleAccountName(window.currentUser.name);
    }
  } catch (e) {
    window.location.href = 'login.html';
    return false;
  }

  renderRoleInterface();
  return true;
}

export function handleLogout() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('malekkas_user');
    localStorage.removeItem('malekkas_token');
    localStorage.removeItem('malekkas_role');
    sessionStorage.clear();
    window.currentUser = null;
  } catch (err) {
    console.warn('[Auth] Gagal membersihkan local storage:', err);
  }

  // Gunakan replace agar riwayat navigasi bersih dan tidak terjebak cache back-forward
  window.location.replace('login.html');
}

export function toggleNakesMobileSidebar(show) {
  if (typeof document === 'undefined') return;
  const sidebar = document.getElementById('nakesSidebar');
  const backdrop = document.getElementById('nakesSidebarBackdrop');
  if (!sidebar || !backdrop) return;

  if (show) {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    backdrop.classList.remove('hidden');
  } else {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    backdrop.classList.add('hidden');
  }
}

export function switchSuperadminViewRole(targetRole) {
  const currentUser = window.currentUser;
  if (!currentUser || (currentUser.role !== 'ADMIN' && !currentUser.is_superadmin)) return;

  window.superadminSimulatedRole = targetRole;

  // Sinkronkan nilai select di kedua topbar
  const selectNakes = document.getElementById('superadminRoleSelectNakes');
  const selectPwa = document.getElementById('superadminRoleSelectPwa');
  if (selectNakes) selectNakes.value = targetRole;
  if (selectPwa) selectPwa.value = targetRole;

  renderRoleInterface();

  if (targetRole === 'NAKES') {
    if (window.switchNakesTab) window.switchNakesTab('dashboard');
  } else if (targetRole === 'KADER') {
    if (window.switchKaderPwaSub) window.switchKaderPwaSub('dashboard');
  }
}

export function renderRoleInterface() {
  if (typeof document === 'undefined') return;
  const currentUser = window.currentUser;
  if (!currentUser) return;

  const isSuperadmin = currentUser.role === 'ADMIN' || currentUser.is_superadmin;
  const effectiveRole = (isSuperadmin && window.superadminSimulatedRole) ? window.superadminSimulatedRole : currentUser.role;

  // Atur visibilitas widget Role Switcher untuk Superadmin
  const switcherNakes = document.getElementById('superadminNakesRoleSwitcher');
  const switcherPwa = document.getElementById('superadminPwaRoleSwitcher');
  const selectNakes = document.getElementById('superadminRoleSelectNakes');
  const selectPwa = document.getElementById('superadminRoleSelectPwa');

  if (isSuperadmin) {
    if (switcherNakes) {
      switcherNakes.classList.remove('hidden');
      switcherNakes.classList.add('flex');
    }
    if (switcherPwa) {
      switcherPwa.classList.remove('hidden');
      switcherPwa.classList.add('flex');
    }
    if (selectNakes) selectNakes.value = effectiveRole;
    if (selectPwa) selectPwa.value = effectiveRole;
  } else {
    if (switcherNakes) {
      switcherNakes.classList.add('hidden');
      switcherNakes.classList.remove('flex');
    }
    if (switcherPwa) {
      switcherPwa.classList.add('hidden');
      switcherPwa.classList.remove('flex');
    }
  }

  const viewNakes = document.getElementById('viewNakes');
  const viewMobilePwa = document.getElementById('viewMobilePwa');
  if (!viewNakes || !viewMobilePwa) return;

  viewNakes.classList.add('hidden');
  viewMobilePwa.classList.add('hidden');

  if (effectiveRole === 'NAKES' || effectiveRole === 'ADMIN') {
    viewNakes.classList.remove('hidden');
    const headerName = document.getElementById('nakesHeaderName');
    if (headerName) headerName.innerText = currentUser.name;
    const welcomeName = document.getElementById('nakesWelcomeName');
    if (welcomeName) welcomeName.innerText = currentUser.name;
    const nakesRoleTitle = document.getElementById('nakesRoleBadgeTitle');
    if (nakesRoleTitle) {
      nakesRoleTitle.innerText = isSuperadmin ? 'Superadmin Faskes' : 'Petugas Medis';
    }
    if (window.switchNakesTab) window.switchNakesTab('dashboard');
  } else {
    viewMobilePwa.classList.remove('hidden');

    const screenKader = document.getElementById('mobileScreenKader');
    const screenGuru = document.getElementById('mobileScreenGuru');
    const screenRato = document.getElementById('mobileScreenRato');
    if (screenKader) screenKader.classList.add('hidden');
    if (screenGuru) screenGuru.classList.add('hidden');
    if (screenRato) screenRato.classList.add('hidden');

    const navActionText = document.getElementById('mobileNavTextAction');

    if (effectiveRole === 'KADER') {
      if (screenKader) screenKader.classList.remove('hidden');
      const greet = document.getElementById('kaderGreetingName');
      if (greet) greet.innerText = currentUser.name;
      if (navActionText) navActionText.innerText = 'Lapor';
      if (window.switchKaderPwaSub) window.switchKaderPwaSub('dashboard');
    } else if (effectiveRole === 'GURU') {
      if (screenGuru) screenGuru.classList.remove('hidden');
      const greet = document.getElementById('guruGreetingName');
      if (greet) greet.innerText = currentUser.name;
      if (navActionText) navActionText.innerText = 'Bantuan';
    } else if (effectiveRole === 'RATO') {
      if (screenRato) screenRato.classList.remove('hidden');
      const greet = document.getElementById('ratoGreetingName');
      if (greet) greet.innerText = currentUser.name;
      if (navActionText) navActionText.innerText = 'Evakuasi';
    }

    if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();

    const roleLabelMap = {
      'KADER': "Bhuppa' Babhu'",
      'GURU': "Ghuru",
      'RATO': "Rato",
      'NAKES': 'Nakes',
      'ADMIN': 'Admin'
    };
    const badgeEl = document.getElementById('mobileRoleBadgeTitle');
    if (badgeEl) {
      badgeEl.innerText = isSuperadmin ? `Admin (${roleLabelMap[effectiveRole] || effectiveRole})` : (roleLabelMap[effectiveRole] || effectiveRole);
    }

    const headerProfileName = document.getElementById('headerProfileDisplayName');
    if (headerProfileName) headerProfileName.innerText = currentUser.name || 'Profil';

    const desktopPillText = document.getElementById('desktopPillTextAction');
    const desktopPillIcon = document.getElementById('desktopPillIconAction');
    if (effectiveRole === 'KADER') {
      if (desktopPillText) desktopPillText.innerText = 'Lapor Kasus';
      if (desktopPillIcon) desktopPillIcon.className = 'fa-solid fa-triangle-exclamation text-xs text-red-500';
    } else if (effectiveRole === 'GURU') {
      if (desktopPillText) desktopPillText.innerText = 'Permintaan Bantuan';
      if (desktopPillIcon) desktopPillIcon.className = 'fa-solid fa-hands-praying text-xs text-emerald-600';
    } else if (effectiveRole === 'RATO') {
      if (desktopPillText) desktopPillText.innerText = 'Pengawalan Evakuasi';
      if (desktopPillIcon) desktopPillIcon.className = 'fa-solid fa-shield-halved text-xs text-indigo-600';
    }
  }

  updateUserAvatarsUI();
}

export function updateUserAvatarsUI() {
  if (typeof document === 'undefined') return;
  const currentUser = window.currentUser;
  if (!currentUser) return;

  const roleMeta = getRoleVisualMeta(currentUser.role);
  const photoURL = currentUser.photoURL;

  const nakesAvatar = document.getElementById('nakesHeaderAvatarContainer');
  if (nakesAvatar) {
    if (photoURL) {
      nakesAvatar.innerHTML = `<img src="${photoURL}" alt="${currentUser.name}" class="w-full h-full object-cover">`;
    } else {
      nakesAvatar.innerHTML = `<i class="fa-solid fa-user-doctor"></i>`;
    }
  }

  const mobileAvatar = document.getElementById('mobileHeaderAvatarContainer');
  if (mobileAvatar) {
    if (photoURL) {
      mobileAvatar.innerHTML = `<img src="${photoURL}" alt="${currentUser.name}" class="w-full h-full object-cover">`;
    } else {
      mobileAvatar.innerHTML = `<i class="fa-solid fa-user"></i>`;
    }
  }

  const modalAvatar = document.getElementById('userProfileAvatar');
  if (modalAvatar) {
    if (photoURL) {
      modalAvatar.innerHTML = `<img src="${photoURL}" alt="${currentUser.name}" class="w-full h-full object-cover">`;
    } else {
      modalAvatar.innerHTML = `<img src="${roleMeta.icon}" alt="${roleMeta.title}" class="w-full h-full object-contain p-2">`;
    }
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.dismissSplashScreen = dismissSplashScreen;
  window.checkSession = checkSession;
  window.handleLogout = handleLogout;
  window.toggleNakesMobileSidebar = toggleNakesMobileSidebar;
  window.renderRoleInterface = renderRoleInterface;
  window.updateUserAvatarsUI = updateUserAvatarsUI;
  window.switchSuperadminViewRole = switchSuperadminViewRole;

  window.AuthController = {
    dismissSplashScreen,
    checkSession,
    handleLogout,
    toggleNakesMobileSidebar,
    renderRoleInterface,
    updateUserAvatarsUI,
    switchSuperadminViewRole
  };
}
