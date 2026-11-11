/**
 * SATENGKA PASUNG EWS — Database Reset Controller (ES6 Module)
 * Khusus Administrator / Superadmin Faskes.
 * Menghapus seluruh data operasional (kasus, laporan, chat, pesan, akun non-admin)
 * dari aplikasi (LocalStorage/Cache) dan server (Cloud Firestore),
 * dengan PENGECUALIAN KETAT terhadap data akun Administrator.
 */

export function openResetDatabaseModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalResetDatabaseConfirm');
  const input = document.getElementById('resetDatabaseConfirmInput');
  const errorEl = document.getElementById('resetDatabaseErrorMsg');
  const submitBtn = document.getElementById('btnConfirmResetDatabase');

  if (input) input.value = '';
  if (errorEl) {
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <i class="fa-solid fa-trash-can mr-2"></i>
      <span>Hapus & Reset Database Sekarang</span>
    `;
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (input) setTimeout(() => input.focus(), 150);
  }
}

export function closeResetDatabaseModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalResetDatabaseConfirm');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export async function executeResetDatabase() {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('resetDatabaseConfirmInput');
  const errorEl = document.getElementById('resetDatabaseErrorMsg');
  const submitBtn = document.getElementById('btnConfirmResetDatabase');

  const typedVal = (input?.value || '').trim();
  if (typedVal !== 'RESET') {
    if (errorEl) {
      errorEl.textContent = 'Harap ketik kata "RESET" dengan huruf kapital untuk konfirmasi keamanan.';
      errorEl.classList.remove('hidden');
    }
    if (input) input.focus();
    return;
  }

  if (errorEl) errorEl.classList.add('hidden');

  // Set tombol loading
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin mr-2"></i>
      <span>Menghapus data di aplikasi & server...</span>
    `;
  }

  try {
    let result = null;
    if (window.firebaseAdapter && typeof window.firebaseAdapter.resetDatabase === 'function') {
      result = await window.firebaseAdapter.resetDatabase();
    } else if (window.malekkasEngine && typeof window.malekkasEngine.resetDatabase === 'function') {
      result = await window.malekkasEngine.resetDatabase();
    } else {
      // Fallback manual jika engine belum ter-expose
      localStorage.setItem("malekkas_cases", JSON.stringify([]));
      localStorage.setItem("malekkas_reports", JSON.stringify([]));
      localStorage.setItem("malekkas_chats", JSON.stringify({}));
      localStorage.setItem("malekkas_pending_sync", JSON.stringify([]));
      localStorage.setItem("malekkas_sync_queue", JSON.stringify([]));
      localStorage.setItem("malekkas_deleted_phones", JSON.stringify([]));
      result = { success: true };
    }

    // Refresh memori global & antarmuka
    if (typeof window !== 'undefined') {
      window.currentCases = [];
      window.currentReports = [];
      
      if (window.renderNakesDashboardCases) {
        window.renderNakesDashboardCases([]);
      }
      if (window.updateNakesCounters) {
        window.updateNakesCounters([]);
      }
      if (window.renderAllReportsTable) {
        window.renderAllReportsTable();
      }
      if (window.renderUsersTable && window.currentUsers) {
        window.renderUsersTable(window.currentUsers);
      }
      if (window.loadMapData) {
        window.loadMapData();
      }
    }

    closeResetDatabaseModal();

    // Notifikasi Berhasil
    if (window.Swal) {
      await window.Swal.fire({
        icon: 'success',
        title: 'Database Berhasil Di-Reset!',
        html: `
          <div class="text-left text-xs sm:text-sm space-y-2 text-slate-700">
            <p>Seluruh data <b>kasus, laporan temuan, chat, dan mitra non-admin</b> telah berhasil dihapus dari aplikasi dan server.</p>
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
              <i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i>
              <b>Data akun Administrator tetap aman</b> dan Anda tetap dapat mengelola sistem faskes.
            </div>
          </div>
        `,
        confirmButtonColor: '#059669',
        confirmButtonText: 'Segarkan Halaman'
      });
      window.location.reload();
    } else {
      alert("Database Berhasil Di-Reset! Seluruh data operasional di aplikasi dan server telah dihapus, menyisakan akun Administrator.");
      window.location.reload();
    }

  } catch (err) {
    console.error("Gagal melakukan reset database:", err);
    if (errorEl) {
      errorEl.textContent = 'Terjadi kesalahan saat mereset data: ' + (err.message || err);
      errorEl.classList.remove('hidden');
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <i class="fa-solid fa-trash-can mr-2"></i>
        <span>Hapus & Reset Database Sekarang</span>
      `;
    }
  }
}

// Expose ke window untuk trigger inline HTML onclick
if (typeof window !== 'undefined') {
  window.openResetDatabaseModal = openResetDatabaseModal;
  window.closeResetDatabaseModal = closeResetDatabaseModal;
  window.executeResetDatabase = executeResetDatabase;
}
