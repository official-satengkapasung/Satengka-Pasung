/**
 * SATENGKA PASUNG EWS — Zero-Cost Data Layer & Local Storage Engine
 * Arsitektur: 100% Free Tier (Firebase Cloud / Local IndexedDB Engine)
 * TIDAK MEMERLUKAN PHP MAUPUN MARIADB!
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where, 
  serverTimestamp,
  deleteField
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import { firebaseConfig } from "../firebase-config.js";

let db = null;
let auth = null;
let storage = null;
export let isFirebaseActive = false;

// Inisialisasi Firebase Cloud Firestore, Firebase Auth, & Firebase Storage
try {
  if (firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("DUMMY")) {
    const app = initializeApp(firebaseConfig);
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (cacheErr) {
      db = getFirestore(app);
    }
    auth = getAuth(app);
    if (firebaseConfig.storageBucket) {
      storage = getStorage(app);
    }
    isFirebaseActive = true;
    if (typeof window !== "undefined") {
      window.firebaseAuth = auth;
      window.firebaseDb = db;
      window.firebaseStorage = storage;
    }
    console.log("🔥 [SATENGKA PASUNG] Terhubung ke Cloud Firestore & Firebase Auth (100% Free Tier Spark Plan)!");
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
    { id: 1, name: "Ampara'an", district: "Kokop", regency: "Bangkalan" },
    { id: 2, name: "Bandang Laok", district: "Kokop", regency: "Bangkalan" },
    { id: 3, name: "Bandasoleh", district: "Kokop", regency: "Bangkalan" },
    { id: 4, name: "Batokorogan", district: "Kokop", regency: "Bangkalan" },
    { id: 5, name: "Dupok", district: "Kokop", regency: "Bangkalan" },
    { id: 6, name: "Durjan", district: "Kokop", regency: "Bangkalan" },
    { id: 7, name: "Katol Timur", district: "Kokop", regency: "Bangkalan" },
    { id: 8, name: "Kokop", district: "Kokop", regency: "Bangkalan" },
    { id: 9, name: "Lembung Gunong", district: "Kokop", regency: "Bangkalan" },
    { id: 10, name: "Mandung", district: "Kokop", regency: "Bangkalan" },
    { id: 11, name: "Mano'an", district: "Kokop", regency: "Bangkalan" },
    { id: 12, name: "Tlokoh", district: "Kokop", regency: "Bangkalan" },
    { id: 13, name: "Tramok", district: "Kokop", regency: "Bangkalan" }
  ],
  users: [
    { id: 1, name: "Administrator EWS", phone: "081100000001", role: "ADMIN", village_id: 1, village_name: "Kokop" },
    { id: 2, name: "dr. Siti Amelia", phone: "081234567890", role: "NAKES", village_id: 1, village_name: "Kokop" },
    { id: 3, name: "Siti", phone: "081234567891", role: "KADER", village_id: 1, village_name: "Kokop" },
    { id: 4, name: "Kiai H. Kholil", phone: "081234567892", role: "GURU", village_id: 1, village_name: "Kokop" },
    { id: 5, name: "Klebun Kokop", phone: "081234567893", role: "RATO", village_id: 1, village_name: "Kokop" }
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

export async function loginUser(identifier, password) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const cleanId = (identifier || '').replace(/\D/g, '');
  const matchedLocal = users.find(u => {
    const uPhone = (u.phone || '').replace(/\D/g, '');
    const uEmail = (u.email || '').toLowerCase();
    return (cleanId && uPhone === cleanId) || (uEmail && uEmail === (identifier || '').toLowerCase());
  });

  // Jika Firebase Auth aktif, lakukan autentikasi Cloud Firebase
  if (isFirebaseActive && auth) {
    const isEmail = (identifier || '').includes("@");
    const emailToAuth = isEmail ? identifier : `${cleanId || 'user'}@satengka-pasung.id`;
    
    try {
      const cred = await signInWithEmailAndPassword(auth, emailToAuth, password);
      const fbUser = cred.user;
      let userRole = matchedLocal ? matchedLocal.role : "KADER";
      let userName = fbUser.displayName || (matchedLocal ? matchedLocal.name : identifier);
      let userVillage = matchedLocal ? (matchedLocal.village_name || "Kokop") : "Kokop";
      let userVillageId = matchedLocal ? (matchedLocal.village_id || 1) : 1;
      let userPhoto = fbUser.photoURL || (matchedLocal ? matchedLocal.photoURL : null);

      try {
        if (db) {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const d = userDoc.data();
            userRole = d.role || userRole;
            userName = d.name || userName;
            userVillage = d.village_name || userVillage;
            userVillageId = d.village_id || userVillageId;
            userPhoto = d.photoURL || userPhoto;

            // Validasi status akun pendaftar dari Cloud Firestore
            if (d.status === "PENDING_APPROVAL" && userRole !== "ADMIN") {
              return {
                success: false,
                message: "Akun Anda sedang menunggu konfirmasi/persetujuan dari Tenaga Medis (Nakes) Puskesmas Kokop."
              };
            }
            if (d.status === "REJECTED") {
              return {
                success: false,
                message: "Pendaftaran akun Anda ditolak oleh Petugas Puskesmas Kokop."
              };
            }
          } else {
            return {
              success: false,
              message: "Akun Firebase ini belum punya profil petugas. Minta Nakes Puskesmas Kokop mendaftarkan Anda."
            };
          }
        }
      } catch (err) {
        console.warn("User profile fetch:", err);
      }

      const token = await fbUser.getIdToken();
      const userObj = {
        id: fbUser.uid,
        name: userName,
        phone: matchedLocal ? matchedLocal.phone : identifier,
        email: fbUser.email,
        role: userRole,
        village_name: userVillage,
        village_id: userVillageId,
        status: "ACTIVE",
        is_superadmin: userRole === "ADMIN",
        photoURL: userPhoto
      };

      // Sinkronkan ke local store jika belum ada
      if (!matchedLocal && users) {
        users.push(userObj);
        setLocalStore("users", users);
      }

      return { success: true, message: "Login Firebase Auth berhasil.", data: { token, user: userObj } };
    } catch (authErr) {
      console.warn("Firebase Auth signIn:", authErr.code, authErr.message);

      // Cek apakah user ada di Cloud Firestore (misal password baru diatur ulang oleh Admin/Nakes)
      let cloudUserData = null;
      if (db) {
        try {
          const qPhone = query(collection(db, "users"), where("phone", "==", cleanId || identifier));
          const qSnap = await getDocs(qPhone);
          if (!qSnap.empty) {
            cloudUserData = qSnap.docs[0].data();
            cloudUserData.id = qSnap.docs[0].id;
          } else {
            const qEmail = query(collection(db, "users"), where("email", "==", emailToAuth));
            const qEmailSnap = await getDocs(qEmail);
            if (!qEmailSnap.empty) {
              cloudUserData = qEmailSnap.docs[0].data();
              cloudUserData.id = qEmailSnap.docs[0].id;
            }
          }
        } catch (dbFindErr) {
          console.warn("Firestore find user during login fallback:", dbFindErr);
        }
      }

      const candidateUser = cloudUserData || matchedLocal;

      if (candidateUser) {
        // Validasi status pendaftaran akun
        if (candidateUser.status === "PENDING_APPROVAL" && candidateUser.role !== "ADMIN") {
          return {
            success: false,
            message: "Akun Anda sedang menunggu konfirmasi/persetujuan dari Tenaga Medis (Nakes) Puskesmas Kokop."
          };
        }
        if (candidateUser.status === "REJECTED") {
          return {
            success: false,
            message: "Pendaftaran akun Anda ditolak oleh Petugas Puskesmas Kokop."
          };
        }

        const expectedPass = candidateUser.password;
        if (expectedPass && password === expectedPass) {
          const token = "token_" + Math.random().toString(36).substring(2) + Date.now();
          // Update / sinkronkan ke local users
          const userIdx = users.findIndex(u => String(u.id) === String(candidateUser.id) || u.phone === candidateUser.phone);
          if (userIdx !== -1) {
            users[userIdx] = { ...users[userIdx], ...candidateUser, password };
          } else {
            users.push({ ...candidateUser, password });
          }
          setLocalStore("users", users);

          return {
            success: true,
            message: "Login berhasil menggunakan kredensial faskes terbaru.",
            data: { token, user: candidateUser }
          };
        }
      }

      // Jika akun belum pernah terdaftar di Firebase Auth sama sekali, coba buatkan
      if (authErr.code === "auth/user-not-found" || (authErr.code === "auth/invalid-credential" && !candidateUser)) {
        if (matchedLocal) {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, emailToAuth, password);
            if (newCred && newCred.user) {
              const fbUser = newCred.user;
              await updateProfile(fbUser, { displayName: matchedLocal.name });
              if (db) {
                await setDoc(doc(db, "users", fbUser.uid), {
                  id: fbUser.uid,
                  name: matchedLocal.name,
                  role: matchedLocal.role,
                  phone: matchedLocal.phone,
                  email: fbUser.email,
                  village_name: matchedLocal.village_name || "Kokop",
                  village_id: matchedLocal.village_id || 1,
                  status: matchedLocal.status || "ACTIVE",
                  photoURL: matchedLocal.photoURL || null
                }, { merge: true });
              }
              const token = await fbUser.getIdToken();
              return { success: true, message: "Akun resmi tersinkronkan ke Firebase Cloud Auth.", data: { token, user: { ...matchedLocal, id: fbUser.uid } } };
            }
          } catch (createErr) {
            console.warn("Auto-register fallback:", createErr.code);
          }
        }
      }

      if (candidateUser) {
        return { success: false, message: "Kata sandi salah. Silakan periksa kembali." };
      }
    }
  }

  // Fallback ke penyimpanan lokal faskes (resiliensi offline)
  if (!matchedLocal) {
    return { success: false, message: "Nomor WhatsApp atau Email belum terdaftar di sistem faskes." };
  }

  const expectedPass = matchedLocal.password;
  if (!expectedPass || password !== expectedPass) {
    return { success: false, message: "Kata sandi salah. Silakan periksa kembali." };
  }

  const token = "token_" + Math.random().toString(36).substring(2) + Date.now();
  return { success: true, message: "Login berhasil.", data: { token, user: matchedLocal } };
}

export async function requestPasswordReset(identifier) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const cleanId = (identifier || '').replace(/\D/g, '');
  const user = users.find(u => {
    const uPhone = (u.phone || '').replace(/\D/g, '');
    const uEmail = (u.email || '').toLowerCase();
    return (cleanId && uPhone === cleanId) || (uEmail && uEmail === (identifier || '').toLowerCase());
  });

  // Eksekusi sendPasswordResetEmail jika Firebase Auth aktif dan format email valid
  let firebaseEmailSent = false;
  if (isFirebaseActive && auth) {
    const targetEmail = (identifier || '').includes('@') ? identifier : (user && user.email ? user.email : null);
    if (targetEmail) {
      try {
        await sendPasswordResetEmail(auth, targetEmail);
        firebaseEmailSent = true;
        console.log("📧 [Firebase Auth] Email reset password terkirim ke:", targetEmail);
      } catch (fbResetErr) {
        console.warn("Firebase sendPasswordResetEmail:", fbResetErr);
      }
    }
  }

  if (!user && !firebaseEmailSent) {
    return { success: false, message: "Kontak tersebut belum terdaftar sebagai pengguna resmi faskes." };
  }

  const ticketId = "RST-" + Math.random().toString(36).substring(2, 7).toUpperCase() + "-" + Date.now().toString().slice(-4);
  return {
    success: true,
    message: firebaseEmailSent 
      ? "Tautan reset kata sandi resmi telah dikirim ke email Anda via Firebase Auth." 
      : "Verifikasi identitas berhasil.",
    data: {
      user: user || { name: identifier, role: "KADER", phone: identifier },
      ticketId,
      firebaseEmailSent,
      adminPhone: "081100000001",
      adminName: "Administrator Puskesmas Kokop"
    }
  };
}

export async function getVillages() {
  return { success: true, data: getLocalStore("villages", DEFAULT_SEED.villages) };
}

export async function getUsers() {
  return { success: true, data: getLocalStore("users", DEFAULT_SEED.users) };
}

export async function createUser(userData) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const cleanPhone = (userData.phone || '').replace(/\D/g, '');
  const emailToAuth = (userData.email && userData.email.includes('@')) 
    ? userData.email 
    : `${cleanPhone || 'user_' + Date.now()}@satengka-pasung.id`;
  if (!userData.password || String(userData.password).length < 6) {
    throw new Error("Kata sandi wajib diisi, minimal 6 karakter.");
  }
  const publicRoles = ["KADER", "GURU", "RATO", "NAKES"];
  const role = publicRoles.includes(userData.role) ? userData.role : "KADER";
  const password = userData.password;

  let firebaseUid = null;

  if (isFirebaseActive && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailToAuth, password);
      if (cred && cred.user) {
        firebaseUid = cred.user.uid;
        await updateProfile(cred.user, { displayName: userData.name });
        console.log("Firebase Auth user registered:", cred.user.email);
      }
    } catch (authErr) {
      console.warn("Firebase createUser Auth:", authErr.code, authErr.message);
      if (authErr.code === "auth/email-already-in-use") {
        throw new Error("Nomor HP / Akun ini sudah terdaftar di Firebase Authentication. Silakan masuk langsung.");
      } else if (authErr.code === "auth/weak-password") {
        throw new Error("Kata sandi terlalu pendek. Minimal 6 karakter sesuai ketentuan keamanan Firebase.");
      } else {
        throw new Error(authErr.message || "Gagal mendaftarkan akun ke Firebase Authentication.");
      }
    }
  }

  const newId = firebaseUid || (users.length > 0 ? Math.max(...users.map(u => Number(u.id) || 0)) + 1 : 10);
  const newUser = {
    id: newId,
    uid: firebaseUid || String(newId),
    name: userData.name,
    phone: userData.phone,
    email: emailToAuth,
    role: role,
    village_id: userData.village_id || 1,
    village_name: userData.village_name || "Kokop",
    status: "PENDING_APPROVAL",
    created_at: new Date().toISOString()
  };

  if (isFirebaseActive && db) {
    try {
      const docId = firebaseUid || String(newId);
      await setDoc(doc(db, "users", docId), { ...newUser, updated_at: serverTimestamp() }, { merge: true });
      console.log("🔥 [FIRESTORE] Dokumen profil pendaftar berhasil disimpan ke Cloud:", docId);
    } catch (dbErr) {
      console.warn("Gagal simpan user ke Firestore:", dbErr);
    }
  }

  // Setelah data profil berhasil tersimpan di Firestore, sign out jika berstatus PENDING_APPROVAL
  if (isFirebaseActive && auth && userData.status === "PENDING_APPROVAL") {
    try {
      await signOut(auth);
      console.log("Firebase Auth signed out (menunggu persetujuan nakes).");
    } catch (signErr) {
      console.warn("Sign out pending user error:", signErr);
    }
  }

  users.push(newUser);
  setLocalStore("users", users);
  window.dispatchEvent(new Event("storage"));

  return { success: true, message: `Akun ${userData.name} berhasil didaftarkan.`, data: newUser };
}

export async function approveUser(userId) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const idx = users.findIndex(u => String(u.id) === String(userId) || (u.uid && String(u.uid) === String(userId)));
  if (idx === -1) {
    return { success: false, message: "Pengguna tidak ditemukan." };
  }

  users[idx].status = "ACTIVE";
  users[idx].approved_at = new Date().toISOString();

  if (isFirebaseActive && db) {
    try {
      const docId = users[idx].uid || String(users[idx].id);
      await updateDoc(doc(db, "users", docId), {
        status: "ACTIVE",
        approved_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } catch (e) {
      console.warn("Gagal approve user di Firestore:", e);
    }
  }

  setLocalStore("users", users);
  window.dispatchEvent(new Event("storage"));
  return { success: true, message: `Akun ${users[idx].name} berhasil disetujui & diaktifkan.`, data: users[idx] };
}

export async function rejectUser(userId) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const idx = users.findIndex(u => String(u.id) === String(userId) || (u.uid && String(u.uid) === String(userId)));
  if (idx === -1) {
    return { success: false, message: "Pengguna tidak ditemukan." };
  }

  users[idx].status = "REJECTED";
  users[idx].rejected_at = new Date().toISOString();

  if (isFirebaseActive && db) {
    try {
      const docId = users[idx].uid || String(users[idx].id);
      await updateDoc(doc(db, "users", docId), {
        status: "REJECTED",
        rejected_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } catch (e) {
      console.warn("Gagal reject user di Firestore:", e);
    }
  }

  setLocalStore("users", users);
  window.dispatchEvent(new Event("storage"));
  return { success: true, message: `Pendaftaran akun ${users[idx].name} telah ditolak.`, data: users[idx] };
}

export async function updateUser(userId, updatedData) {
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const idx = users.findIndex(u => String(u.id) === String(userId) || (u.uid && String(u.uid) === String(userId)));
  if (idx === -1) {
    return { success: false, message: "Data pengguna tidak ditemukan." };
  }

  const user = users[idx];
  users[idx] = {
    ...user,
    name: updatedData.name || user.name,
    role: updatedData.role || user.role,
    phone: updatedData.phone || user.phone,
    village_id: updatedData.village_id || user.village_id,
    village_name: updatedData.village_name || user.village_name,
    updated_at: new Date().toISOString()
  };

  // Sinkronisasi ke Cloud Firestore jika aktif
  if (isFirebaseActive && db) {
    try {
      const docId = user.uid || String(user.id);
      await updateDoc(doc(db, "users", docId), {
        name: users[idx].name,
        role: users[idx].role,
        phone: users[idx].phone,
        village_id: users[idx].village_id,
        village_name: users[idx].village_name,
        updated_at: serverTimestamp()
      });
      console.log("☁️ [Firestore] Profil user diperbarui di Cloud:", docId);
    } catch (e) {
      console.warn("Gagal update user di Firestore:", e);
    }
  }

  setLocalStore("users", users);
  window.dispatchEvent(new Event("storage"));
  return { success: true, message: `Data mitra ${users[idx].name} berhasil diperbarui.`, data: users[idx] };
}

export async function deleteUser(userId) {
  let users = getLocalStore("users", DEFAULT_SEED.users);
  const targetUser = users.find(u => String(u.id) === String(userId) || (u.uid && String(u.uid) === String(userId)));
  if (!targetUser) {
    return { success: false, message: "Pengguna tidak ditemukan." };
  }

  if (targetUser.role === "NAKES" || targetUser.role === "ADMIN") {
    const nakesCount = users.filter(u => u.role === "NAKES" || u.role === "ADMIN").length;
    if (nakesCount <= 1) {
      return { success: false, message: "Akun Nakes / Admin utama faskes tidak dapat dihapus." };
    }
  }

  // Hapus akun dari Firebase Authentication via Google Identity Toolkit REST API
  if (isFirebaseActive && firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("DUMMY")) {
    try {
      const cleanPhone = (targetUser.phone || '').replace(/\D/g, '');
      const emailToAuth = (targetUser.email && targetUser.email.includes('@')) 
        ? targetUser.email 
        : `${cleanPhone || 'user'}@satengka-pasung.id`;
      
      const passwordsToTry = [targetUser.password].filter(Boolean);
      for (const pass of passwordsToTry) {
        try {
          const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailToAuth, password: pass, returnSecureToken: true })
          });
          const authData = await authRes.json();
          if (authData && authData.idToken) {
            await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${firebaseConfig.apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: authData.idToken })
            });
            console.log("Firebase Auth user deleted successfully:", emailToAuth);
            break;
          }
        } catch (subErr) {
          // Lanjutkan mencoba password fallback jika ada
        }
      }
    } catch (authDelErr) {
      console.warn("Gagal menghapus user dari Firebase Auth:", authDelErr);
    }
  }

  users = users.filter(u => String(u.id) !== String(userId) && (!u.uid || String(u.uid) !== String(userId)));

  // Hapus dari Firestore jika aktif
  if (isFirebaseActive && db) {
    try {
      const docId = targetUser.uid || String(targetUser.id);
      await deleteDoc(doc(db, "users", docId));
      console.log("Firestore document deleted:", docId);
    } catch (e) {
      console.warn("Gagal hapus user di Firestore:", e);
    }
  }

  setLocalStore("users", users);
  window.dispatchEvent(new Event("storage"));
  return { success: true, message: `Akun mitra ${targetUser.name} berhasil dihapus dari sistem dan Firebase Auth.` };
}

export async function resetUserPasswordByAdmin(userId, newPassword) {
  if (!newPassword || String(newPassword).length < 6) {
    return { success: false, message: "Kata sandi baru minimal 6 karakter." };
  }
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const user = users.find(u => String(u.id) === String(userId) || (u.uid && String(u.uid) === String(userId)));
  if (!user) {
    return { success: false, message: "Data pengguna tidak ditemukan." };
  }

  user.password_reset_at = new Date().toISOString();
  delete user.password;

  if (isFirebaseActive && db) {
    try {
      const docId = user.uid || String(user.id);
      await updateDoc(doc(db, "users", docId), {
        password: deleteField(),
        password_reset_at: serverTimestamp()
      });
    } catch (e) {
      console.warn("Gagal menghapus field password di Firestore:", e);
    }
  }

  setLocalStore("users", users);
  window.dispatchEvent(new Event("storage"));
  return {
    success: false,
    message: "Sandi tidak lagi disimpan di basis data. Atur ulang lewat Firebase Authentication Console untuk akun " + user.name + ".",
    data: { user }
  };
}

export async function selfResetPassword() {
  return {
    success: false,
    message: "Ganti sandi mandiri lewat basis data dimatikan. Gunakan tautan reset email, atau minta Nakes."
  };
}

function mapDoc(d) {
  const data = d.data();
  return { ...data, id: data.id !== undefined ? data.id : d.id };
}

function scopedQuery(name, filterParams = {}) {
  const role = filterParams.role;
  const villageId = filterParams.villageId;
  const constraints = [limit(50)];
  if (villageId && role !== "NAKES" && role !== "ADMIN") {
    constraints.unshift(where("village_id", "==", villageId));
  }
  return query(collection(db, name), ...constraints);
}

export async function getCases(userId = null, role = null, villageId = null, villageName = null) {
  let cases = getLocalStore("cases", DEFAULT_SEED.cases);

  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(scopedQuery("cases", { role, villageId }));
      const cloudCases = snap.docs.map(mapDoc);
      if (cloudCases.length > 0) {
        cases = cloudCases;
        setLocalStore("cases", cases);
      }
    } catch (e) {
      console.warn("⚠️ Gagal mengambil kasus dari Firestore, fallback lokal:", e);
    }
  }

  const allReports = getLocalStore("reports", DEFAULT_SEED.reports);
  let didEnrich = false;
  cases.forEach(c => {
    if (c.report_id) {
      const rep = allReports.find(r => String(r.id) === String(c.report_id));
      if (rep) {
        if (!c.reporter_name || c.reporter_name === "Siti") {
          c.reporter_name = rep.reporter_name || "Kader Jiwa";
          didEnrich = true;
        }
        if (!c.reporter_phone || c.reporter_phone === "081234567891") {
          c.reporter_phone = rep.reporter_phone || "-";
          didEnrich = true;
        }
        if (!c.reporter_id && rep.reporter_id) {
          c.reporter_id = rep.reporter_id;
          didEnrich = true;
        }
        if (!c.village_name || c.village_name === "Kokop") {
          if (rep.village_name) {
            c.village_name = rep.village_name;
            didEnrich = true;
          }
        }
      }
    }
  });
  if (didEnrich) {
    setLocalStore("cases", cases);
  }

  return { success: true, data: filterCasesForUser(cases, { userId, role, villageId, villageName }) };
}


export async function getReports(reporterId = null, villageId = null, role = null, villageName = null) {
  let reports = getLocalStore("reports", DEFAULT_SEED.reports);

  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(scopedQuery("reports", { role, villageId }));
      const cloudReports = snap.docs.map(mapDoc);
      if (cloudReports.length > 0) {
        reports = cloudReports;
        setLocalStore("reports", reports);
      }
    } catch (e) {
      console.warn("⚠️ Gagal mengambil laporan dari Firestore, fallback lokal:", e);
    }
  }

  return { success: true, data: filterReportsForUser(reports, { reporterId, villageId, role, villageName }) };
}

function filterCasesForUser(cases, filterParams = {}) {
  const { userId = '', role = '', villageId = null, villageName = null } = filterParams;
  let list = [...cases];
  if (role === "KADER") {
    list = list.filter(c => {
      if (userId && String(c.reporter_id) === String(userId)) return true;
      if (villageId && String(c.village_id) === String(villageId)) return true;
      if (villageName && (c.village_name || '').trim().toLowerCase() === (villageName || '').trim().toLowerCase()) return true;
      if (!villageId && !villageName) return true;
      return false;
    });
  } else if (userId && (role === "GURU" || role === "RATO")) {
    list = list.filter(c => c.participants && c.participants.some(p => String(p.user_id) === String(userId) || p.participant_role === role));
  }
  // Urutkan ID terbesar / activated_at terbaru di atas
  return list.sort((a, b) => {
    const timeA = new Date(a.activated_at || a.created_at || 0).getTime();
    const timeB = new Date(b.activated_at || b.created_at || 0).getTime();
    return timeB - timeA || (Number(b.id) || 0) - (Number(a.id) || 0);
  });
}

function filterReportsForUser(reports, filterParams = {}) {
  const { reporterId = null, villageId = null, role = null, villageName = null } = filterParams;
  let list = [...reports];
  if (role === "KADER") {
    list = list.filter(r => {
      // 1. Laporan yang dibuat sendiri oleh kader WAJIB selalu tampil
      if (reporterId && String(r.reporter_id) === String(reporterId)) return true;
      // 2. Laporan di desa binaan kader
      if (villageId && String(r.village_id) === String(villageId)) return true;
      if (villageName && (r.village_name || '').trim().toLowerCase() === (villageName || '').trim().toLowerCase()) return true;
      // 3. Jika kader belum memiliki asosiasi desa spesifik, tampilkan seluruh laporan wilayah
      if (!villageId && !villageName) return true;
      return false;
    });
  } else if (reporterId) {
    list = list.filter(r => String(r.reporter_id) === String(reporterId));
  }
  // Urutkan tanggal laporan terbaru di atas
  return list.sort((a, b) => {
    const timeA = new Date(a.created_at || a.report_date || 0).getTime();
    const timeB = new Date(b.created_at || b.report_date || 0).getTime();
    return timeB - timeA || (Number(b.id) || 0) - (Number(a.id) || 0);
  });
}

export function subscribeCases(onUpdate, filterParams = {}) {
  // Callback instan dengan data lokal
  const initialCases = getLocalStore("cases", DEFAULT_SEED.cases);
  onUpdate(filterCasesForUser(initialCases, filterParams));

  let unsubscribeFirestore = null;
  if (isFirebaseActive && db) {
    try {
      unsubscribeFirestore = onSnapshot(scopedQuery("cases", filterParams), (snapshot) => {
        const cloudCases = snapshot.docs.map(mapDoc);
        setLocalStore("cases", cloudCases);
        onUpdate(filterCasesForUser(cloudCases, filterParams));
      }, (err) => {
        console.warn("⚠️ Firestore cases snapshot fallback:", err);
      });
    } catch (e) {
      console.warn("⚠️ Error initializing Firestore onSnapshot cases:", e);
    }
  }

  const storageListener = (e) => {
    if (!e || !e.key || e.key === "malekkas_cases") {
      const updated = (e && e.newValue) ? JSON.parse(e.newValue) : getLocalStore("cases", DEFAULT_SEED.cases);
      onUpdate(filterCasesForUser(updated, filterParams));
    }
  };
  window.addEventListener("storage", storageListener);

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener("storage", storageListener);
  };
}

export function subscribeReports(onUpdate, filterParams = {}) {
  // Callback instan dengan data lokal
  const initialReports = getLocalStore("reports", DEFAULT_SEED.reports);
  onUpdate(filterReportsForUser(initialReports, filterParams));

  let unsubscribeFirestore = null;
  if (isFirebaseActive && db) {
    try {
      unsubscribeFirestore = onSnapshot(scopedQuery("reports", filterParams), (snapshot) => {
        const cloudReports = snapshot.docs.map(mapDoc);
        setLocalStore("reports", cloudReports);
        onUpdate(filterReportsForUser(cloudReports, filterParams));
      }, (err) => {
        console.warn("⚠️ Firestore reports snapshot fallback:", err);
      });
    } catch (e) {
      console.warn("⚠️ Error initializing Firestore onSnapshot reports:", e);
    }
  }

  const storageListener = (e) => {
    if (!e || !e.key || e.key === "malekkas_reports") {
      const updated = (e && e.newValue) ? JSON.parse(e.newValue) : getLocalStore("reports", DEFAULT_SEED.reports);
      onUpdate(filterReportsForUser(updated, filterParams));
    }
  };
  window.addEventListener("storage", storageListener);

  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    window.removeEventListener("storage", storageListener);
  };
}

export async function updateControlVisit(caseId, visitNumber, updatedData) {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => c.id === caseId);
  if (!targetCase) return { success: false, message: "Kasus tidak ditemukan." };
  if (!Array.isArray(targetCase.control_history)) targetCase.control_history = [];
  
  const idx = targetCase.control_history.findIndex(v => Number(v.visit_number) === Number(visitNumber));
  if (idx === -1) return { success: false, message: "Kunjungan kontrol tidak ditemukan." };

  targetCase.control_history[idx] = {
    ...targetCase.control_history[idx],
    ...updatedData,
    visit_number: Number(visitNumber),
    updated_at: new Date().toISOString()
  };

  if (idx === targetCase.control_history.length - 1) {
    if (updatedData.compliance) targetCase.drug_compliance = updatedData.compliance;
    if (updatedData.notes) targetCase.drug_notes = updatedData.notes;
  }

  setLocalStore("cases", cases);
  return { success: true, message: `Kunjungan Ke-${visitNumber} berhasil diperbarui.`, data: targetCase };
}

export async function deleteControlVisit(caseId, visitNumber) {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => c.id === caseId);
  if (!targetCase) return { success: false, message: "Kasus tidak ditemukan." };
  if (!Array.isArray(targetCase.control_history)) return { success: false, message: "Riwayat kosong." };

  targetCase.control_history = targetCase.control_history.filter(v => Number(v.visit_number) !== Number(visitNumber));
  
  targetCase.control_history.forEach((v, i) => {
    v.visit_number = i + 1;
  });

  if (targetCase.control_history.length > 0) {
    const last = targetCase.control_history[targetCase.control_history.length - 1];
    targetCase.drug_compliance = last.compliance;
    targetCase.drug_notes = last.notes;
  } else {
    targetCase.drug_compliance = "RUTIN";
    targetCase.drug_notes = "Belum ada catatan kunjungan.";
  }

  setLocalStore("cases", cases);
  return { success: true, message: `Kunjungan Ke-${visitNumber} berhasil dihapus.`, data: targetCase };
}

export async function createPatient(patientData) {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const newId = cases.length > 0 ? Math.max(...cases.map(c => c.id || 0)) + 1 : 1;
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const caseNumber = `CAS-${dateStr}-${String(newId).padStart(3, '0')}`;

  const newCase = {
    id: newId,
    case_number: caseNumber,
    patient_id: newId,
    patient_name: patientData.patient_name,
    gender: patientData.gender || "L",
    patient_address: patientData.patient_address || "Desa Kokop",
    village_id: patientData.village_id || 1,
    village_name: patientData.village_name || "Kokop",
    family_phone: patientData.family_phone || "",
    family_name: patientData.family_name || "Keluarga Bhuppa' Bhu'",
    priority: patientData.priority || "NORMAL",
    status: patientData.status || "MONITORING",
    report_type: patientData.report_type || "Pasung",
    notes: patientData.notes || "Data pasien ditambahkan langsung oleh Petugas Nakes.",
    drug_compliance: patientData.drug_compliance || "RUTIN",
    drug_notes: patientData.drug_notes || "Mulai pendampingan kepatuhan obat.",
    control_history: [],
    participants: [
      { participant_role: "GURU", name: "Kiai H. Kholil", phone: "081234567892", user_id: 4, response: "AGREE", response_note: "Pendampingan siap" },
      { participant_role: "RATO", name: "Klebun Kokop", phone: "081234567893", user_id: 5, response: "READY", response_note: "Pengawalan wilayah siap" }
    ],
    created_at: new Date().toISOString()
  };

  cases.unshift(newCase);
  setLocalStore("cases", cases);
  return { success: true, message: `Data pasien ${patientData.patient_name} berhasil ditambahkan.`, data: newCase };
}

export async function updatePatient(caseId, patientData) {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => c.id === caseId);
  if (!targetCase) return { success: false, message: "Pasien tidak ditemukan." };

  if (patientData.patient_name) targetCase.patient_name = patientData.patient_name;
  if (patientData.gender) targetCase.gender = patientData.gender;
  if (patientData.patient_address) targetCase.patient_address = patientData.patient_address;
  if (patientData.village_id) targetCase.village_id = patientData.village_id;
  if (patientData.village_name) targetCase.village_name = patientData.village_name;
  if (patientData.family_phone !== undefined) targetCase.family_phone = patientData.family_phone;
  if (patientData.status) targetCase.status = patientData.status;
  if (patientData.priority) targetCase.priority = patientData.priority;
  if (patientData.notes !== undefined) targetCase.notes = patientData.notes;
  if (patientData.drug_compliance) targetCase.drug_compliance = patientData.drug_compliance;

  setLocalStore("cases", cases);
  return { success: true, message: `Data pasien ${targetCase.patient_name} berhasil diperbarui.`, data: targetCase };
}

export async function deletePatient(caseId) {
  const strId = String(caseId);
  let cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => String(c.id) === strId);
  const famPhone = targetCase ? (targetCase.family_phone || '').replace(/\D/g, '') : '';
  const patPhone = targetCase ? (targetCase.patient_phone || '').replace(/\D/g, '') : '';
  const caseUserId = targetCase && targetCase.user_id ? String(targetCase.user_id) : null;

  // 1. Hapus dokumen fisik di Cloud Firestore jika aktif
  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, "cases", strId)).catch(() => {});
      if (targetCase && targetCase.report_id) {
        await deleteDoc(doc(db, "reports", String(targetCase.report_id))).catch(() => {});
      }

      // Hapus akun otentikasi di Firestore users jika terikat dengan pasien/keluarga ini
      if (famPhone || patPhone || caseUserId) {
        const usersSnap = await getDocs(query(collection(db, "users"), where("phone", "==", famPhone || patPhone), limit(5))).catch(() => null);
        if (usersSnap && !usersSnap.empty) {
          for (const uDoc of usersSnap.docs) {
            const uData = uDoc.data();
            const uPhone = (uData.phone || '').replace(/\D/g, '');
            if ((famPhone && uPhone === famPhone) || (patPhone && uPhone === patPhone) || (caseUserId && String(uData.id) === caseUserId)) {
              await deleteDoc(doc(db, "users", uDoc.id)).catch(() => {});
              console.log(`🔥 [FIRESTORE] Akun pengguna ${uData.name || uDoc.id} terkait pasien berhasil dihapus.`);
            }
          }
        }
      }
      console.log(`🔥 [FIRESTORE] Kasus #${strId} berhasil dihapus dari Cloud Firestore.`);
    } catch (err) {
      console.warn("⚠️ Gagal menghapus dokumen kasus di Firestore Cloud:", err);
    }
  }

  if (!targetCase && (!cases || cases.length === 0)) {
    return { success: true, message: "Data pasien berhasil dihapus." };
  }

  const patientName = targetCase ? targetCase.patient_name : "Pasien";

  // 2. Hapus dari LocalStorage
  cases = cases.filter(c => String(c.id) !== strId);
  setLocalStore("cases", cases);

  let reports = getLocalStore("reports", DEFAULT_SEED.reports);
  if (targetCase && targetCase.report_id) {
    reports = reports.filter(r => String(r.id) !== String(targetCase.report_id));
    setLocalStore("reports", reports);
  }

  // 3. Hapus data otentikasi pengguna di LocalStorage
  let users = getLocalStore("users", DEFAULT_SEED.users);
  if (users && users.length > 0 && (famPhone || patPhone || caseUserId)) {
    users = users.filter(u => {
      const uPhone = (u.phone || '').replace(/\D/g, '');
      if (famPhone && uPhone && uPhone === famPhone) return false;
      if (patPhone && uPhone && uPhone === patPhone) return false;
      if (caseUserId && String(u.id) === caseUserId) return false;
      return true;
    });
    setLocalStore("users", users);
  }

  return { success: true, message: `Data pasien ${patientName} dan akun otentikasi terkait berhasil dihapus.` };
}

// =========================================================================
// REALTIME THERAPEUTIC LIVE CHAT (FIRESTORE ON-SNAPSHOT & FALLBACK)
// =========================================================================
export function subscribeTherapeuticChat(caseId, onUpdate) {
  const strCaseId = String(caseId);
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => String(c.id) === strCaseId || c.case_number === strCaseId);
  const possibleIds = Array.from(new Set([
    strCaseId,
    targetCase ? String(targetCase.id) : null,
    targetCase ? targetCase.case_number : null
  ].filter(Boolean)));

  const chatsCache = getLocalStore("chats", DEFAULT_SEED.chats);
  const initialMessages = chatsCache[strCaseId] || (targetCase && chatsCache[String(targetCase.id)]) || [];
  if (typeof onUpdate === "function") {
    onUpdate(initialMessages);
  }

  // 1. Jika Firestore aktif, gunakan onSnapshot listener tanpa orderBy agar tidak membutuhkan composite index
  if (isFirebaseActive && db) {
    try {
      const q = query(collection(db, "chats"), where("case_id", "==", strCaseId), limit(50));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cloudMessages = snapshot.docs.map(d => {
          const data = d.data();
          let timeFormatted = data.time_formatted;
          if (!timeFormatted && data.created_at && data.created_at.toDate) {
            timeFormatted = data.created_at.toDate().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          }
          return {
            id: d.id,
            ...data,
            time_formatted: timeFormatted || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          };
        });

        // Urutkan pesan berdasarkan timestamp secara andal di client
        cloudMessages.sort((a, b) => {
          const tA = (a.created_at && a.created_at.toMillis) ? a.created_at.toMillis() : (a.timestamp || 0);
          const tB = (b.created_at && b.created_at.toMillis) ? b.created_at.toMillis() : (b.timestamp || 0);
          return tA - tB;
        });

        // Sinkronkan ke cache lokal dengan merge deduplikasi agar pesan optimistik tidak hilang
        const currentChats = getLocalStore("chats", DEFAULT_SEED.chats);
        const existingLocal = currentChats[strCaseId] || [];
        const mergedMap = new Map();
        existingLocal.forEach(m => {
          const key = m.id || `${m.sender_id}_${m.message}_${m.timestamp || ''}`;
          mergedMap.set(key, m);
        });
        cloudMessages.forEach(m => {
          let matchedKey = null;
          for (const [k, v] of mergedMap.entries()) {
            if (v.id === m.id || (v.message === m.message && v.sender_id === m.sender_id && Math.abs((v.timestamp || 0) - ((m.created_at && m.created_at.toMillis ? m.created_at.toMillis() : m.timestamp) || 0)) < 15000)) {
              matchedKey = k;
              break;
            }
          }
          if (matchedKey) {
            mergedMap.delete(matchedKey);
          }
          mergedMap.set(m.id, m);
        });

        const finalMessages = Array.from(mergedMap.values());
        finalMessages.sort((a, b) => {
          const tA = (a.created_at && a.created_at.toMillis) ? a.created_at.toMillis() : (a.timestamp || 0);
          const tB = (b.created_at && b.created_at.toMillis) ? b.created_at.toMillis() : (b.timestamp || 0);
          return tA - tB;
        });

        currentChats[strCaseId] = finalMessages;
        if (targetCase) currentChats[String(targetCase.id)] = finalMessages;
        setLocalStore("chats", currentChats);

        if (typeof onUpdate === "function") {
          onUpdate(finalMessages);
        }
      }, (err) => {
        console.warn("Firestore onSnapshot chat fallback:", err);
      });

      return unsubscribe;
    } catch (e) {
      console.warn("Gagal inisialisasi query realtime chat:", e);
    }
  }

  // 2. Fallback Storage Event Listener
  const storageListener = function(e) {
    if (e.key === "malekkas_chats" || e.type === "satengka-chat-update") {
      const updatedChats = JSON.parse(localStorage.getItem("malekkas_chats") || "{}");
      if (typeof onUpdate === "function") {
        onUpdate(updatedChats[strCaseId] || []);
      }
    }
  };

  window.addEventListener("storage", storageListener);
  window.addEventListener("satengka-chat-update", storageListener);

  return function() {
    window.removeEventListener("storage", storageListener);
    window.removeEventListener("satengka-chat-update", storageListener);
  };
}

export async function getTherapeuticChats(caseId) {
  const strCaseId = String(caseId);
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => String(c.id) === strCaseId || c.case_number === strCaseId);
  const possibleIds = Array.from(new Set([
    strCaseId,
    targetCase ? String(targetCase.id) : null,
    targetCase ? targetCase.case_number : null
  ].filter(Boolean)));

  if (isFirebaseActive && db) {
    try {
      const q = query(collection(db, "chats"), where("case_id", "==", strCaseId), limit(50));

      const snap = await getDocs(q);
      const cloudMessages = snap.docs.map(d => {
        const data = d.data();
        let timeFormatted = data.time_formatted;
        if (!timeFormatted && data.created_at && data.created_at.toDate) {
          timeFormatted = data.created_at.toDate().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        }
        return {
          id: d.id,
          ...data,
          time_formatted: timeFormatted || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        };
      });

      cloudMessages.sort((a, b) => {
        const tA = (a.created_at && a.created_at.toMillis) ? a.created_at.toMillis() : (a.timestamp || 0);
        const tB = (b.created_at && b.created_at.toMillis) ? b.created_at.toMillis() : (b.timestamp || 0);
        return tA - tB;
      });

      const currentChats = getLocalStore("chats", DEFAULT_SEED.chats);
      const existingLocal = currentChats[strCaseId] || [];

      // Gabungkan cloudMessages dengan existingLocal (deduplikasi berdasarkan id atau pesan+timestamp)
      const mergedMap = new Map();
      existingLocal.forEach(m => {
        const key = m.id || `${m.sender_id}_${m.message}_${m.timestamp || ''}`;
        mergedMap.set(key, m);
      });
      cloudMessages.forEach(m => {
        // Jika ada pesan cloud yang sama isinya dengan pesan optimistik lokal, timpa dengan data cloud
        let matchedKey = null;
        for (const [k, v] of mergedMap.entries()) {
          if (v.id === m.id || (v.message === m.message && v.sender_id === m.sender_id && Math.abs((v.timestamp || 0) - ((m.created_at && m.created_at.toMillis ? m.created_at.toMillis() : m.timestamp) || 0)) < 15000)) {
            matchedKey = k;
            break;
          }
        }
        if (matchedKey) {
          mergedMap.delete(matchedKey);
        }
        mergedMap.set(m.id, m);
      });

      const finalMessages = Array.from(mergedMap.values());
      finalMessages.sort((a, b) => {
        const tA = (a.created_at && a.created_at.toMillis) ? a.created_at.toMillis() : (a.timestamp || 0);
        const tB = (b.created_at && b.created_at.toMillis) ? b.created_at.toMillis() : (b.timestamp || 0);
        return tA - tB;
      });

      currentChats[strCaseId] = finalMessages;
      if (targetCase) currentChats[String(targetCase.id)] = finalMessages;
      setLocalStore("chats", currentChats);

      return { success: true, data: finalMessages };
    } catch (e) {
      console.warn("getTherapeuticChats Firestore fetch error:", e);
    }
  }

  const chats = getLocalStore("chats", DEFAULT_SEED.chats);
  const list = chats[strCaseId] || (targetCase && chats[String(targetCase.id)]) || [];
  return { success: true, data: list };
}

export async function sendRealtimeMessage(caseId, messageData) {
  const strCaseId = String(caseId);
  const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const newMsg = {
    id: "msg_" + Date.now(),
    case_id: strCaseId,
    ...messageData,
    time_formatted: timeStr,
    timestamp: Date.now()
  };

  // 1. Simpan ke Cloud Firestore jika aktif
  if (isFirebaseActive && db) {
    try {
      await addDoc(collection(db, "chats"), {
        ...newMsg,
        created_at: serverTimestamp()
      });
      console.log(`🔥 [FIRESTORE] Pesan obrolan kasus #${strCaseId} terkirim ke Cloud Firestore.`);
    } catch (err) {
      console.warn("⚠️ Gagal mengirim pesan ke Firestore:", err);
    }
  }

  // 2. Simpan ke LocalStorage cache
  const chats = getLocalStore("chats", DEFAULT_SEED.chats);
  if (!chats[strCaseId]) chats[strCaseId] = [];
  chats[strCaseId].push(newMsg);
  setLocalStore("chats", chats);

  // Trigger update event untuk tab saat ini dan tab lain
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("satengka-chat-update", { detail: { caseId: strCaseId } }));
  }

  return true;
}

export async function createReport(reportInput, currentUser) {
  const reports = getLocalStore("reports", DEFAULT_SEED.reports);
  const newId = reports.length + 1;
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const reportNumber = `LAP-${dateStr}-${String(newId).padStart(3, '0')}`;

  // Cari nama desa yang sesuai
  const villages = getLocalStore("villages", DEFAULT_SEED.villages);
  const matchedVillage = villages.find(v => String(v.id) === String(reportInput.village_id));
  const resolvedVillageName = reportInput.village_name || (matchedVillage ? matchedVillage.name : (currentUser ? currentUser.village_name : "Kokop")) || "Kokop";

  const activeUser = currentUser || (typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("malekkas_user") || "null") : null);
  const fallbackReporterId = activeUser ? activeUser.id : 3;
  const fallbackReporterName = activeUser ? activeUser.name : "Kader Jiwa";
  const fallbackReporterPhone = activeUser ? (activeUser.phone || "-") : "-";

  const newReport = {
    id: newId,
    report_number: reportNumber,
    reporter_id: fallbackReporterId,
    reporter_name: fallbackReporterName,
    reporter_phone: fallbackReporterPhone,
    village_id: reportInput.village_id || (activeUser ? activeUser.village_id : 1) || 1,
    village_name: resolvedVillageName,
    patient_name_input: (reportInput.patient_name || '').toUpperCase(),
    address_input: reportInput.address || `Desa ${resolvedVillageName}`,
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

  // Simpan langsung ke Cloud Firestore
  if (isFirebaseActive && db) {
    try {
      const docRef = doc(db, "reports", String(newId));
      await setDoc(docRef, { ...newReport, created_at: serverTimestamp() }, { merge: true });
      console.log("☁️ [Firestore] Laporan baru tersimpan di Cloud:", reportNumber);
    } catch (e) {
      console.warn("⚠️ Gagal simpan laporan ke Firestore:", e);
    }
  }

  window.dispatchEvent(new Event("storage"));
  return { success: true, message: "Laporan berhasil dikirim ke Puskesmas.", data: { report_id: newId, report_number: reportNumber } };
}

export async function validateReport(reportId, validationData = {}) {
  const reports = getLocalStore("reports", DEFAULT_SEED.reports);
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);

  const rep = reports.find(r => String(r.id) === String(reportId));
  if (!rep) {
    return { success: false, message: "Laporan tidak ditemukan." };
  }

  const priority = validationData.priority || "HIGH";
  const notes = validationData.notes || "Laporan tervalidasi oleh Petugas Nakes Puskesmas Kokop.";

  rep.status = "VALIDATED";
  rep.priority = priority;
  rep.validated_at = new Date().toISOString();
  rep.nakes_notes = notes;

  let assignedCaseId = rep.case_id;

  // Jika laporan belum dikaitkan dengan kasus manapun di basis data kasus, buat entri kasus baru
  if (!assignedCaseId) {
    assignedCaseId = cases.length + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const caseNumber = `CAS-${dateStr}-${String(assignedCaseId).padStart(3, "0")}`;

    const newCase = {
      id: assignedCaseId,
      case_number: caseNumber,
      report_id: rep.id,
      patient_id: assignedCaseId,
      patient_name: rep.patient_name_input || "Pasien Baru",
      gender: rep.gender || "L",
      patient_address: rep.address_input || `Desa ${rep.village_name || 'Kokop'}`,
      village_id: rep.village_id || 1,
      village_name: rep.village_name || "Kokop",
      report_type: rep.report_type || "Pasung",
      priority: priority,
      status: (priority === "HIGH" || priority === "EMERGENCY") ? "SIAGA" : "VALIDATED",
      activated_at: new Date().toISOString(),
      reporter_id: rep.reporter_id || null,
      reporter_name: rep.reporter_name || "Kader Jiwa",
      reporter_phone: rep.reporter_phone || "-",
      latitude: rep.latitude || -7.0145,
      longitude: rep.longitude || 113.0234,
      photo_path: rep.photo_path || null,
      notes: notes,
      participants: [
        { participant_role: "BHUPA", name: rep.reporter_name || "Kader Jiwa", phone: rep.reporter_phone || "-", user_id: rep.reporter_id || null, response: "READY" },
        { participant_role: "GURU", name: "Kiai H. Kholil", phone: "081234567892", user_id: 4, response: "PENDING" },
        { participant_role: "RATO", name: "Klebun Kokop", phone: "081234567893", user_id: 5, response: "PENDING" }
      ]
    };

    rep.case_id = assignedCaseId;
    cases.unshift(newCase);
    setLocalStore("cases", cases);

    // Sinkronisasi kasus baru ke Firestore
    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "cases", String(assignedCaseId)), { ...newCase, updated_at: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn("⚠️ Gagal simpan kasus baru hasil validasi ke Firestore:", e);
      }
    }
  } else {
    // Jika kasus sudah ada, perbarui status dan prioritasnya
    const existingCase = cases.find(c => String(c.id) === String(assignedCaseId));
    if (existingCase) {
      existingCase.priority = priority;
      existingCase.notes = notes;
      if (existingCase.status === "REPORTED" || existingCase.status === "NEW") {
        existingCase.status = (priority === "HIGH" || priority === "EMERGENCY") ? "SIAGA" : "VALIDATED";
      }
      setLocalStore("cases", cases);
      if (isFirebaseActive && db) {
        try {
          await setDoc(doc(db, "cases", String(assignedCaseId)), { ...existingCase, updated_at: serverTimestamp() }, { merge: true });
        } catch (e) {
          console.warn("⚠️ Gagal update kasus hasil validasi ke Firestore:", e);
        }
      }
    }
  }

  setLocalStore("reports", reports);

  // Sinkronisasi pembaruan status laporan ke Firestore
  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "reports", String(rep.id)), {
        status: "VALIDATED",
        priority: priority,
        case_id: assignedCaseId,
        validated_at: rep.validated_at,
        nakes_notes: notes,
        updated_at: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("⚠️ Gagal update laporan validasi ke Firestore:", e);
    }
  }

  window.dispatchEvent(new Event("storage"));
  return {
    success: true,
    message: "Laporan berhasil divalidasi dan tersimpan di basis data kasus Puskesmas.",
    data: { report_id: rep.id, case_id: assignedCaseId }
  };
}

export async function activateSiagaEws(payload, currentUser) {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const reports = getLocalStore("reports", DEFAULT_SEED.reports);
  const users = getLocalStore("users", DEFAULT_SEED.users);

  const guru = users.find(u => String(u.id) === String(payload.guru_id)) || { id: 4, name: "Kiai H. Kholil", phone: "081234567892" };
  const rato = users.find(u => String(u.id) === String(payload.rato_id)) || { id: 5, name: "Klebun Kokop", phone: "081234567893" };

  let caseId = payload.case_id;

  if (!caseId && payload.report_id) {
    const rep = reports.find(r => r.id === payload.report_id);
    if (rep) rep.status = "VALIDATED";
    
    caseId = cases.length + 1;
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const caseNumber = `CAS-${dateStr}-${String(caseId).padStart(3, '0')}`;

    const repReporterName = rep ? (rep.reporter_name || "Kader Jiwa") : (currentUser ? currentUser.name : "Kader Jiwa");
    const repReporterPhone = rep ? (rep.reporter_phone || "-") : (currentUser ? (currentUser.phone || "-") : "-");
    const repReporterId = rep ? rep.reporter_id : (currentUser ? currentUser.id : null);
    const repVillageId = rep ? (rep.village_id || 1) : 1;
    const repVillageName = rep ? (rep.village_name || "Kokop") : "Kokop";

    const newCase = {
      id: caseId,
      case_number: caseNumber,
      report_id: payload.report_id,
      patient_id: caseId,
      patient_name: rep ? (rep.patient_name_input || rep.patient_name || "Pasien Baru") : "Pasien Baru",
      gender: rep ? (rep.gender || "L") : "L",
      patient_address: rep ? (rep.address_input || rep.patient_address || `Desa ${repVillageName}`) : `Desa ${repVillageName}`,
      village_id: repVillageId,
      village_name: repVillageName,
      report_type: rep ? (rep.report_type || "Pasung") : "Pasung",
      priority: payload.priority || "HIGH",
      status: "SIAGA",
      activated_at: new Date().toISOString(),
      reporter_id: repReporterId,
      reporter_name: repReporterName,
      reporter_phone: repReporterPhone,
      latitude: rep ? (rep.latitude || -7.0145) : -7.0145,
      longitude: rep ? (rep.longitude || 113.0234) : 113.0234,
      photo_path: rep ? rep.photo_path : null,
      notes: payload.notes || "Aktivasi EWS Siaga",
      participants: [
        { participant_role: "BHUPA", name: repReporterName, phone: repReporterPhone, user_id: repReporterId, response: "READY" },
        { participant_role: "GURU", name: guru.name, phone: guru.phone, user_id: guru.id, response: "PENDING" },
        { participant_role: "RATO", name: rato.name, phone: rato.phone, user_id: rato.id, response: "PENDING" }
      ]
    };
    cases.unshift(newCase);

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "cases", String(caseId)), { ...newCase, updated_at: serverTimestamp() }, { merge: true });
        if (rep) {
          await setDoc(doc(db, "reports", String(rep.id)), { status: "VALIDATED", updated_at: serverTimestamp() }, { merge: true });
        }
      } catch (e) {
        console.warn("⚠️ Gagal simpan kasus baru ke Firestore:", e);
      }
    }
  } else {
    const c = cases.find(item => String(item.id) === String(caseId) || (item.case_number && item.case_number === caseId));
    if (c) {
      c.status = "SIAGA";
      c.activated_at = new Date().toISOString();
      c.participants = [
        { participant_role: "GURU", name: guru.name, phone: guru.phone, user_id: guru.id, response: "PENDING" },
        { participant_role: "RATO", name: rato.name, phone: rato.phone, user_id: rato.id, response: "PENDING" }
      ];

      if (isFirebaseActive && db) {
        try {
          await setDoc(doc(db, "cases", String(c.id)), { ...c, updated_at: serverTimestamp() }, { merge: true });
        } catch (e) {
          console.warn("⚠️ Gagal update kasus ke Firestore:", e);
        }
      }
    }
  }

  setLocalStore("cases", cases);
  setLocalStore("reports", reports);
  window.dispatchEvent(new Event("storage"));

  return { success: true, message: "Tombol Siaga EWS Berhasil Diaktifkan!", data: { case_id: caseId } };
}

export async function respondParticipant(caseId, userId, responseVal, note = "", userRole = "") {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => String(c.id) === String(caseId) || (c.case_number && c.case_number === caseId));
  if (!targetCase) return { success: false, message: "Kasus tidak ditemukan." };

  let readyCount = 0;
  let hasAnyResponse = false;
  if (targetCase.participants && Array.isArray(targetCase.participants)) {
    targetCase.participants.forEach(p => {
      const matchId = userId && String(p.user_id) === String(userId);
      const matchRole = userRole && p.participant_role === userRole;
      const matchInferred = (responseVal === 'AGREE' || responseVal === 'NEED_TIME')
        ? p.participant_role === 'GURU'
        : (responseVal === 'READY' ? p.participant_role === 'RATO' : false);

      if (matchId || matchRole || matchInferred) {
        p.response = responseVal;
        p.responded_at = new Date().toISOString();
        if (note) {
          p.note = note;
          p.response_note = note;
        }
      }
      if (p.response && p.response !== "PENDING") {
        hasAnyResponse = true;
      }
      if (p.response === "READY" || p.response === "SIAP" || p.response === "AGREE") {
        readyCount++;
      }
    });
  }

  // Transisi Status Otomatis EWS Terpadu
  if (readyCount >= 2) {
    targetCase.status = "READY_FOR_EVACUATION";
  } else if (hasAnyResponse && targetCase.status === "SIAGA") {
    targetCase.status = "COORDINATION";
  }

  setLocalStore("cases", cases);

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "cases", String(targetCase.id)), { ...targetCase, updated_at: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn("⚠️ Gagal update respon ke Firestore:", e);
    }
  }

  window.dispatchEvent(new Event("storage"));
  return { success: true, message: "Tanggapan berhasil dicatat dan disinkronkan ke Puskesmas.", data: { ready_count: readyCount, status: targetCase.status } };
}

export async function respondCase(caseId, payload = {}) {
  const role = payload.participant_role || (payload.response === 'READY' ? 'RATO' : 'GURU');
  const note = payload.notes || payload.note || '';
  return await respondParticipant(caseId, payload.user_id, payload.response, note, role);
}

export async function updateCaseStatus(caseId, newStatus, note = "") {
  const cases = getLocalStore("cases", DEFAULT_SEED.cases);
  const targetCase = cases.find(c => c.id === caseId);
  if (targetCase) {
    targetCase.status = newStatus;
    setLocalStore("cases", cases);

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "cases", String(caseId)), { ...targetCase, updated_at: serverTimestamp() }, { merge: true });
      } catch (e) {
        console.warn("⚠️ Gagal update status kasus ke Firestore:", e);
      }
    }
    window.dispatchEvent(new Event("storage"));
  }
  return { success: true, message: `Status kasus berhasil diperbarui ke: ${newStatus}` };
}


export async function uploadUserProfilePhoto(userId, fileOrBlob) {
  if (!userId) throw new Error("User ID wajib disertakan untuk upload foto profil.");

  // Helper konversi file/blob ke dataUrl
  const fileToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });

  const localDataUrl = await fileToDataUrl(fileOrBlob);

  if (isFirebaseActive && storage) {
    try {
      const storageRef = ref(storage, `profile_photos/${userId}/avatar_${Date.now()}.webp`);
      const snapshot = await uploadBytes(storageRef, fileOrBlob, {
        contentType: fileOrBlob.type || "image/webp"
      });
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateUserProfile(userId, { photoURL: downloadURL });
      return { success: true, photoURL: downloadURL, storage: "firebase" };
    } catch (error) {
      console.warn("⚠️ Firebase Storage CORS/Network issue. Menggunakan Cloud Firestore & Local Sync fallback:", error);
      // Fallback: simpan foto ke dokumen user di Firestore dan Local Storage
      await updateUserProfile(userId, { photoURL: localDataUrl });
      return { success: true, photoURL: localDataUrl, storage: "local" };
    }
  }

  await updateUserProfile(userId, { photoURL: localDataUrl });
  return { success: true, photoURL: localDataUrl, storage: "local" };
}

export async function updateUserProfile(userId, updateData) {
  if (!userId) throw new Error("User ID tidak valid.");

  let users = getLocalStore("users", DEFAULT_SEED.users);
  const userIdx = users.findIndex(u => String(u.id) === String(userId) || u.phone === String(userId));
  if (userIdx !== -1) {
    users[userIdx] = { ...users[userIdx], ...updateData, updated_at: new Date().toISOString() };
    setLocalStore("users", users);
  }

  // Simpan ke dokumen user di Cloud Firestore
  if (isFirebaseActive && db) {
    try {
      const userDocRef = doc(db, "users", String(userId));
      await setDoc(userDocRef, { ...updateData, updated_at: serverTimestamp() }, { merge: true });
      console.log("☁️ [Firestore] Profil user berhasil diperbarui di Cloud:", userId);
    } catch (e) {
      console.warn("⚠️ Gagal update profil di Cloud Firestore:", e);
    }
  }

  const activeUserStr = localStorage.getItem("malekkas_user");
  if (activeUserStr) {
    try {
      const activeUser = JSON.parse(activeUserStr);
      if (String(activeUser.id) === String(userId) || activeUser.phone === String(userId)) {
        const merged = { ...activeUser, ...updateData };
        localStorage.setItem("malekkas_user", JSON.stringify(merged));
      }
    } catch (e) {}
  }

  return { success: true, data: updateData };
}

export async function getUserProfileFromCloud(userId) {
  if (!userId) return null;

  if (isFirebaseActive && db) {
    try {
      const userDocRef = doc(db, "users", String(userId));
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      }
    } catch (e) {
      console.warn("⚠️ Gagal mengambil profil user dari Cloud Firestore:", e);
    }
  }

  // Fallback ke penyimpanan lokal
  const users = getLocalStore("users", DEFAULT_SEED.users);
  const found = users.find(u => String(u.id) === String(userId) || u.phone === String(userId));
  return { success: !!found, data: found || null };
}