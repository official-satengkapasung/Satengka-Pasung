/**
 * SATENGKA PASUNG — Zero-Cost Client Storage Engine
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
      { id: 1, name: "Administrator Satengka", phone: "081100000001", role: "ADMIN", village_id: 1, village_name: "Kokop", status: "ACTIVE" },
      { id: 2, name: "dr. Siti Amelia", phone: "081234567890", role: "NAKES", village_id: 1, village_name: "Kokop", status: "ACTIVE" },
      { id: 3, name: "Siti", phone: "081234567891", role: "KADER", village_id: 1, village_name: "Kokop", status: "ACTIVE" },
      { id: 4, name: "Kiai H. Kholil", phone: "081234567892", role: "GURU", village_id: 1, village_name: "Kokop", status: "ACTIVE" },
      { id: 5, name: "Klebun Kokop", phone: "081234567893", role: "RATO", village_id: 1, village_name: "Kokop", status: "ACTIVE" }
    ],
    cases: [],
    reports: [],
    chats: {}
  };

  function getLocalStore(key, defaultVal) {
    const v = localStorage.getItem("malekkas_" + key) || localStorage.getItem("satengka_" + key);
    if (!v) {
      localStorage.setItem("malekkas_" + key, JSON.stringify(defaultVal));
      localStorage.setItem("satengka_" + key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    try { return JSON.parse(v); } catch(e) { return defaultVal; }
  }

  function setLocalStore(key, val) {
    const serialized = JSON.stringify(val);
    localStorage.setItem("malekkas_" + key, serialized);
    localStorage.setItem("satengka_" + key, serialized);
  }

  // Inisialisasi awal
  getLocalStore("villages", DEFAULT_SEED.villages);
  getLocalStore("users", DEFAULT_SEED.users);
  getLocalStore("cases", DEFAULT_SEED.cases);
  getLocalStore("reports", DEFAULT_SEED.reports);
  getLocalStore("chats", DEFAULT_SEED.chats);

  // Delegasikan ke malekkasEngine jika sudah terdefinisi, atau definisikan objek engine lengkap
  const engine = window.malekkasEngine || {
    isMock: true,
    isFirebaseActive: false,
    appId: "satengka-pasung-standalone",

    init: async function() {
      return { success: true, message: "Satengka Standalone Storage Ready!" };
    },

    login: async function(phone, role, email = null) {
      if (window.malekkasEngine && window.malekkasEngine.login) {
        return await window.malekkasEngine.login(phone, role, email);
      }
      return { success: false, message: "Storage engine tidak ditemukan" };
    }
  };

  window.satengkaEngine = window.malekkasEngine || engine;
  window.SatengkaEngine = window.satengkaEngine;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.satengkaEngine;
  }

})(typeof window !== 'undefined' ? window : global);
