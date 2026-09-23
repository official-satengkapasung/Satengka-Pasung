/**
 * SATENGKA PASUNG EWS — Local Storage & Session Service (ES6 Module)
 * Mengelola persistensi data sesi pengguna, token otentikasi, dan offline cache.
 */

export const STORAGE_KEYS = {
  USER: 'malekkas_user',
  TOKEN: 'malekkas_token',
  CASES: 'cases',
  REPORTS: 'reports',
  USERS: 'users',
  CACHED_REPORTS: 'malekkas_reports'
};

/**
 * Mengambil dan mem-parsing data JSON dari localStorage secara aman.
 * @param {string} key 
 * @param {*} defaultValue 
 * @returns {*}
 */
export function getJson(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[StorageService] Gagal mem-parsing key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Menyimpan data objek/primitif ke localStorage.
 * @param {string} key 
 * @param {*} value 
 * @returns {boolean}
 */
export function setJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[StorageService] Gagal menyimpan key "${key}":`, err);
    return false;
  }
}

/**
 * Menghapus data dari localStorage.
 * @param {string} key 
 */
export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[StorageService] Gagal menghapus key "${key}":`, err);
  }
}

/**
 * Mengambil data sesi pengguna saat ini.
 * @returns {Object|null}
 */
export function getCurrentUser() {
  return getJson(STORAGE_KEYS.USER, null);
}

/**
 * Menyimpan sesi pengguna saat ini.
 * @param {Object} user 
 */
export function setCurrentUser(user) {
  return setJson(STORAGE_KEYS.USER, user);
}

/**
 * Mengambil token autentikasi.
 * @returns {string|null}
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (err) {
    return null;
  }
}

/**
 * Menyimpan token autentikasi.
 * @param {string} token 
 */
export function setAuthToken(token) {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Menghapus seluruh data sesi (Logout).
 */
export function clearSession() {
  remove(STORAGE_KEYS.USER);
  remove(STORAGE_KEYS.TOKEN);
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.StorageService = {
    STORAGE_KEYS,
    getJson,
    setJson,
    remove,
    getCurrentUser,
    setCurrentUser,
    getAuthToken,
    setAuthToken,
    clearSession
  };
}
