/**
 * SATENGKA PASUNG EWS — User Profile Controller (ES6 Module)
 * Mengelola modal profil pengguna, kompresi foto canvas WebP client-side,
 * upload avatar pengguna, serta pembaruan profil di Firebase/localStorage.
 */

import { getRoleVisualMeta } from '../../utils/formatters.js';

export function openUserProfileModal() {
  if (typeof document === 'undefined') return;
  const currentUser = window.currentUser;
  if (!currentUser) return;

  const modal = document.getElementById('modalUserProfile');
  if (!modal) return;

  const roleInfo = getRoleVisualMeta(currentUser.role);

  const editName = document.getElementById('profileEditName');
  if (editName) editName.value = currentUser.name || '';

  const editPhone = document.getElementById('profileEditPhone');
  if (editPhone) editPhone.value = currentUser.phone || '';

  const roleStatic = document.getElementById('profileRoleStatic');
  if (roleStatic) roleStatic.value = roleInfo.title;

  const villageStatic = document.getElementById('profileVillageStatic');
  if (villageStatic) {
    villageStatic.value = currentUser.village_name ? `Desa ${currentUser.village_name}, Kokop` : 'Kecamatan Kokop';
  }

  const displayName = document.getElementById('userProfileDisplayName');
  if (displayName) displayName.innerText = currentUser.name || 'Pengguna';

  const roleBadge = document.getElementById('userProfileRoleBadge');
  if (roleBadge) roleBadge.innerText = roleInfo.badge;

  const metaSub = document.getElementById('userProfileMetaSub');
  if (metaSub) {
    metaSub.innerText = currentUser.village_name ? `Desa ${currentUser.village_name} • Puskesmas Kokop` : 'Puskesmas Kokop (P3526150101)';
  }

  if (typeof window.updateUserAvatarsUI === 'function') {
    window.updateUserAvatarsUI();
  }

  modal.classList.remove('hidden');
}

export function closeUserProfileModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalUserProfile');
  if (modal) modal.classList.add('hidden');
}

/**
 * Kompresi Gambar Canvas WebP Client-Side (Maks 500x500px, hemat kuota & jaringan)
 * @param {File} file 
 * @param {number} maxDimension 
 * @param {number} quality 
 * @returns {Promise<Blob>}
 */
export async function compressImageCanvas(file, maxDimension = 500, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Gagal kompresi gambar'));
          }
        }, 'image/webp', quality);
      };
      img.onerror = () => reject(new Error('Gagal memuat berkas gambar'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas'));
    reader.readAsDataURL(file);
  });
}

export async function handleProfilePhotoSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Mohon pilih berkas gambar yang valid (JPG, PNG, WebP).');
    event.target.value = '';
    return;
  }

  const MAX_RAW_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_RAW_SIZE) {
    alert('Ukuran berkas melebihi 10MB. Silakan pilih foto dengan ukuran lebih kecil.');
    event.target.value = '';
    return;
  }

  const loadingOverlay = document.getElementById('profilePhotoLoadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
    loadingOverlay.classList.remove('hidden');
  }

  try {
    const compressedBlob = await compressImageCanvas(file, 500, 0.85);

    let uploadResult = null;
    if (window.firebaseAdapter && window.firebaseAdapter.uploadUserProfilePhoto) {
      uploadResult = await window.firebaseAdapter.uploadUserProfilePhoto(window.currentUser.id, compressedBlob);
    } else {
      const reader = new FileReader();
      uploadResult = await new Promise((resolve) => {
        reader.onload = () => resolve({ success: true, photoURL: reader.result });
        reader.readAsDataURL(compressedBlob);
      });
    }

    if (uploadResult && uploadResult.photoURL) {
      window.currentUser.photoURL = uploadResult.photoURL;
      localStorage.setItem('malekkas_user', JSON.stringify(window.currentUser));
      if (typeof window.updateUserAvatarsUI === 'function') {
        window.updateUserAvatarsUI();
      }
      alert('✓ Foto profil berhasil diperbarui!');
    }
  } catch (err) {
    console.error('Gagal mengunggah foto profil:', err);
    alert('Gagal memproses foto profil. Silakan coba kembali.');
  } finally {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
      loadingOverlay.classList.add('hidden');
    }
    event.target.value = '';
  }
}

export async function handleSaveUserProfile(e) {
  if (e && e.preventDefault) e.preventDefault();
  const newName = (document.getElementById('profileEditName')?.value || '').trim();
  const newPhone = (document.getElementById('profileEditPhone')?.value || '').trim();

  if (!newName || !newPhone) {
    alert('Mohon lengkapi nama dan nomor WhatsApp.');
    return;
  }

  if (window.currentUser) {
    window.currentUser.name = newName;
    window.currentUser.phone = newPhone;
    localStorage.setItem('malekkas_user', JSON.stringify(window.currentUser));
  }

  if (window.firebaseAdapter && window.firebaseAdapter.updateUserProfile && window.currentUser) {
    try {
      await window.firebaseAdapter.updateUserProfile(window.currentUser.id, {
        name: newName,
        phone: newPhone
      });
    } catch (err) {
      console.warn('Gagal sinkron via adapter:', err);
    }
  }

  // Perbarui label nama di seluruh tampilan UI
  ['nakesHeaderName', 'nakesWelcomeName', 'kaderGreetingName', 'guruGreetingName', 'ratoGreetingName', 'headerProfileDisplayName', 'userProfileDisplayName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = newName;
  });

  closeUserProfileModal();
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.openUserProfileModal = openUserProfileModal;
  window.closeUserProfileModal = closeUserProfileModal;
  window.compressImageCanvas = compressImageCanvas;
  window.handleProfilePhotoSelect = handleProfilePhotoSelect;
  window.handleSaveUserProfile = handleSaveUserProfile;

  window.ProfileController = {
    openUserProfileModal,
    closeUserProfileModal,
    compressImageCanvas,
    handleProfilePhotoSelect,
    handleSaveUserProfile
  };
}
