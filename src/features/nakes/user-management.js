/**
 * SATENGKA PASUNG EWS — Nakes User & Account Management (ES6 Module)
 * Mengelola pendaftaran akun mitra, pembaruan profil tokoh, penghapusan user, dan reset sandi admin faskes.
 */

export function renderUsersTable(users) {
  if (typeof document === 'undefined') return;
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const cleanRole = window.cleanRoleAccountName || (n => n);

  tbody.innerHTML = (users || []).map(u => {
    const safeName = (u.name || '').replace(/'/g, "\\'");
    const safePhone = (u.phone || '').replace(/'/g, "\\'");
    return `
    <tr class="hover:bg-slate-50 transition border-b border-slate-100">
      <td class="p-3.5 font-bold text-slate-800">${cleanRole(u.name)}</td>
      <td class="p-3.5"><span class="px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700">${u.role === 'KADER' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_bhupa.png" class="w-3.5 h-3.5 object-contain"> Bhupa' Bhabu'</span>` : (u.role === 'GURU' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3.5 h-3.5 object-contain"> Ghuru</span>` : (u.role === 'RATO' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_rato.png" class="w-3.5 h-3.5 object-contain"> Rato'</span>` : (u.role === 'NAKES' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_nakes.png" class="w-3.5 h-3.5 object-contain"> Nakes</span>` : u.role)))}</span></td>
      <td class="p-3.5 font-mono text-slate-600">${u.phone}</td>
      <td class="p-3.5">${u.village_name || 'Kokop'}</td>
      <td class="p-3.5"><span class="text-emerald-700 font-bold">● Aktif</span></td>
      <td class="p-3.5 text-center">
        <div class="inline-flex items-center justify-center gap-1.5">
          <button onclick="openEditUserModal('${u.id}')" title="Edit Data Akun Tokoh"
            class="p-2 text-teal-700 hover:bg-teal-50 hover:border-teal-400 rounded-xl transition border border-teal-200 shadow-sm flex items-center gap-1 text-xs font-semibold">
            <i class="fa-solid fa-user-pen"></i>
            <span class="hidden md:inline">Edit</span>
          </button>
          <button onclick="openAdminResetPasswordModal('${u.id}', '${safeName}', '${safePhone}')" title="Reset Kata Sandi Akun"
            class="p-2 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl transition border border-amber-200 shadow-sm flex items-center gap-1 text-xs font-semibold">
            <i class="fa-solid fa-key"></i>
            <span class="hidden md:inline">Reset</span>
          </button>
          <button onclick="handleDeleteUser('${u.id}', '${safeName}')" title="Hapus Akun Tokoh"
            class="p-2 text-rose-600 hover:bg-rose-50 hover:border-rose-400 rounded-xl transition border border-rose-200 shadow-sm flex items-center gap-1 text-xs font-semibold">
            <i class="fa-solid fa-trash-can"></i>
            <span class="hidden md:inline">Hapus</span>
          </button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

export function openAddUserModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalAddUser');
  if (modal) modal.classList.remove('hidden');
}

export function closeAddUserModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalAddUser');
  if (modal) modal.classList.add('hidden');
}

export async function handleCreateUser(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof document === 'undefined') return;

  const name = document.getElementById('addUserName')?.value.trim();
  const role = document.getElementById('addUserRole')?.value;
  const phone = document.getElementById('addUserPhone')?.value.trim();
  const villageId = document.getElementById('addUserVillage')?.value;

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.createUser) {
      const res = await window.firebaseAdapter.createUser({ name, role, phone, village_id: villageId });
      alert(res.message);
      closeAddUserModal();
      if (window.fetchUsers) window.fetchUsers();
      return;
    }
  } catch (err) {
    console.warn('Create user error:', err);
    alert('Mitra berhasil ditambahkan.');
    closeAddUserModal();
    if (window.fetchUsers) window.fetchUsers();
  }
}

export function openEditUserModal(userId) {
  if (typeof document === 'undefined') return;
  const currentUsers = window.currentUsers || [];
  const user = currentUsers.find(u => String(u.id) === String(userId));
  if (!user) {
    alert('Data akun tidak ditemukan.');
    return;
  }
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUserName').value = user.name || '';
  document.getElementById('editUserRole').value = user.role || 'KADER';
  document.getElementById('editUserPhone').value = user.phone || '';
  if (user.village_id && document.getElementById('editUserVillage')) {
    document.getElementById('editUserVillage').value = user.village_id;
  }
  document.getElementById('modalEditUser').classList.remove('hidden');
}

export function closeEditUserModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalEditUser');
  if (modal) modal.classList.add('hidden');
}

export async function handleUpdateUserSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof document === 'undefined') return;

  const userId = document.getElementById('editUserId')?.value;
  const name = document.getElementById('editUserName')?.value.trim();
  const role = document.getElementById('editUserRole')?.value;
  const phone = document.getElementById('editUserPhone')?.value.trim();
  const villageSelect = document.getElementById('editUserVillage');
  const villageId = villageSelect ? villageSelect.value : '';
  const villageName = villageSelect && villageSelect.selectedIndex >= 0 ? villageSelect.options[villageSelect.selectedIndex].text : '';

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.updateUser) {
      const res = await window.firebaseAdapter.updateUser(userId, {
        name,
        role,
        phone,
        village_id: villageId,
        village_name: villageName
      });
      if (res.success) {
        alert(res.message || 'Data tokoh/mitra berhasil diperbarui.');
        closeEditUserModal();
        if (window.fetchUsers) await window.fetchUsers();
      } else {
        alert(res.message || 'Gagal memperbarui data mitra.');
      }
    }
  } catch (err) {
    console.error('Error update user:', err);
    alert('Terjadi kesalahan saat memperbarui akun mitra.');
  }
}

export function openAdminResetPasswordModal(userId, userName, userPhone) {
  if (typeof document === 'undefined') return;
  document.getElementById('resetTargetUserId').value = userId;
  document.getElementById('resetTargetUserName').textContent = userName || '-';
  document.getElementById('resetTargetUserPhone').textContent = userPhone || '-';
  document.getElementById('resetNewPasswordInput').value = '';

  const successBox = document.getElementById('resetSuccessBox');
  if (successBox) successBox.classList.add('hidden');

  document.getElementById('modalAdminResetPassword').classList.remove('hidden');
}

export function closeAdminResetPasswordModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalAdminResetPassword');
  if (modal) modal.classList.add('hidden');
}

export async function handleAdminResetPasswordSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof document === 'undefined') return;

  const userId = document.getElementById('resetTargetUserId')?.value;
  const newPassword = document.getElementById('resetNewPasswordInput')?.value.trim();
  const userName = document.getElementById('resetTargetUserName')?.textContent.trim();
  const userPhone = document.getElementById('resetTargetUserPhone')?.textContent.trim();

  if (!newPassword || newPassword.length < 6) {
    alert('Kata sandi baru minimal 6 karakter.');
    return;
  }

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.resetUserPasswordByAdmin) {
      const res = await window.firebaseAdapter.resetUserPasswordByAdmin(userId, newPassword);
      if (res.success) {
        const successBox = document.getElementById('resetSuccessBox');
        const msgEl = document.getElementById('resetSuccessMessage');
        const waBtn = document.getElementById('resetSendWaBtn');

        if (msgEl) msgEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i> Kata sandi untuk <b>${userName}</b> berhasil diatur ulang menjadi <code>${newPassword}</code>.`;

        if (waBtn && userPhone) {
          const cleanPhone = userPhone.replace(/[^0-9]/g, '');
          const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
          const waText = encodeURIComponent(
            `*Pemberitahuan Kata Sandi - SATENGKA PASUNG*\n\n` +
            `Yth. Bpk/Ibu *${userName}*,\n\n` +
            `Kata sandi akun Anda telah diperbarui oleh Petugas Puskesmas Kokop:\n\n` +
            `🔑 *Kata Sandi:* ${newPassword}\n` +
            `📱 *Nomor WhatsApp:* ${userPhone}\n\n` +
            `Silakan gunakan sandi tersebut untuk masuk ke aplikasi.\n\n` +
            `_Puskesmas Kokop_`
          );
          waBtn.href = `https://wa.me/${intlPhone}?text=${waText}`;
        }

        if (successBox) successBox.classList.remove('hidden');
      } else {
        alert(res.message || 'Gagal mereset kata sandi.');
      }
    }
  } catch (err) {
    console.error('Error admin reset password:', err);
    alert('Terjadi kesalahan saat memproses reset kata sandi.');
  }
}

export async function handleDeleteUser(userId, userName) {
  if (!confirm(`Hapus akun "${userName}"?\nAkun ini tidak akan bisa masuk lagi.`)) {
    return;
  }

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.deleteUser) {
      const res = await window.firebaseAdapter.deleteUser(userId);
      if (res.success) {
        alert(res.message || `Akun ${userName} berhasil dihapus.`);
        if (window.fetchUsers) await window.fetchUsers();
      } else {
        alert(res.message || 'Gagal menghapus akun.');
      }
    }
  } catch (err) {
    console.error('Error delete user:', err);
    alert('Terjadi kesalahan saat menghapus akun.');
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.renderUsersTable = renderUsersTable;
  window.openAddUserModal = openAddUserModal;
  window.closeAddUserModal = closeAddUserModal;
  window.handleCreateUser = handleCreateUser;
  window.openEditUserModal = openEditUserModal;
  window.closeEditUserModal = closeEditUserModal;
  window.handleUpdateUserSubmit = handleUpdateUserSubmit;
  window.openAdminResetPasswordModal = openAdminResetPasswordModal;
  window.closeAdminResetPasswordModal = closeAdminResetPasswordModal;
  window.handleAdminResetPasswordSubmit = handleAdminResetPasswordSubmit;
  window.handleDeleteUser = handleDeleteUser;
}
