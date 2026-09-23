/**
 * SATENGKA PASUNG EWS — Auth & Role Interface Controller (ES6 Module)
 * Mengelola verifikasi sesi (checkSession), logout, perutean antarmuka peran (Nakes vs Mobile PWA),
 * drawer navigasi mobile, avatar pengguna, dan splash screen.
 */

import { cleanRoleAccountName, getRoleVisualMeta } from '../../utils/formatters.js';

export function dismissSplashScreen(delay = 1400) {
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
  if (confirm('Keluar dari aplikasi SATENGKA PASUNG?')) {
    localStorage.removeItem('malekkas_user');
    localStorage.removeItem('malekkas_token');
    window.location.href = 'login.html';
  }
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

export function renderRoleInterface() {
  if (typeof document === 'undefined') return;
  const currentUser = window.currentUser;
  if (!currentUser) return;

  const viewNakes = document.getElementById('viewNakes');
  const viewMobilePwa = document.getElementById('viewMobilePwa');
  if (!viewNakes || !viewMobilePwa) return;

  viewNakes.classList.add('hidden');
  viewMobilePwa.classList.add('hidden');

  if (currentUser.role === 'NAKES' || currentUser.role === 'ADMIN') {
    viewNakes.classList.remove('hidden');
    const headerName = document.getElementById('nakesHeaderName');
    if (headerName) headerName.innerText = currentUser.name;
    const welcomeName = document.getElementById('nakesWelcomeName');
    if (welcomeName) welcomeName.innerText = currentUser.name;
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

    if (currentUser.role === 'KADER') {
      if (screenKader) screenKader.classList.remove('hidden');
      const greet = document.getElementById('kaderGreetingName');
      if (greet) greet.innerText = currentUser.name;
      if (navActionText) navActionText.innerText = 'Lapor';
      if (window.switchKaderPwaSub) window.switchKaderPwaSub('dashboard');
    } else if (currentUser.role === 'GURU') {
      if (screenGuru) screenGuru.classList.remove('hidden');
      const greet = document.getElementById('guruGreetingName');
      if (greet) greet.innerText = currentUser.name;
      if (navActionText) navActionText.innerText = 'Bantuan';
    } else if (currentUser.role === 'RATO') {
      if (screenRato) screenRato.classList.remove('hidden');
      const greet = document.getElementById('ratoGreetingName');
      if (greet) greet.innerText = currentUser.name;
      if (navActionText) navActionText.innerText = 'Evakuasi';
    }

    if (window.updateRoleMetricCounters) window.updateRoleMetricCounters();

    const roleLabelMap = {
      'KADER': "Bhupa' Bhabu'",
      'GURU': "Ghuru",
      'RATO': "Rato'",
      'NAKES': 'Nakes',
      'ADMIN': 'Admin'
    };
    const badgeEl = document.getElementById('mobileRoleBadgeTitle');
    if (badgeEl) badgeEl.innerText = roleLabelMap[currentUser.role] || currentUser.role;

    const headerProfileName = document.getElementById('headerProfileDisplayName');
    if (headerProfileName) headerProfileName.innerText = currentUser.name || 'Profil';

    const desktopPillText = document.getElementById('desktopPillTextAction');
    const desktopPillIcon = document.getElementById('desktopPillIconAction');
    if (currentUser.role === 'KADER') {
      if (desktopPillText) desktopPillText.innerText = 'Lapor Kasus';
      if (desktopPillIcon) desktopPillIcon.className = 'fa-solid fa-triangle-exclamation text-xs text-red-500';
    } else if (currentUser.role === 'GURU') {
      if (desktopPillText) desktopPillText.innerText = 'Permintaan Bantuan';
      if (desktopPillIcon) desktopPillIcon.className = 'fa-solid fa-hands-praying text-xs text-emerald-600';
    } else if (currentUser.role === 'RATO') {
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

  window.AuthController = {
    dismissSplashScreen,
    checkSession,
    handleLogout,
    toggleNakesMobileSidebar,
    renderRoleInterface,
    updateUserAvatarsUI
  };
}
