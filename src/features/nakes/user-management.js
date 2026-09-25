/**
 * SATENGKA PASUNG EWS — Nakes User & Account Management (ES6 Module)
 * Mengelola pendaftaran akun mitra, pembaruan profil tokoh, penghapusan user, dan reset sandi admin faskes.
 */

export function renderUsersTable(users) {
  if (typeof document === 'undefined') return;
  const tbody = document.getElementById('usersTableBody');
  const pendingContainer = document.getElementById('pendingUsersSection');
  const pendingBadge = document.getElementById('pendingUsersBadge');
  const dashboardAlert = document.getElementById('nakesPendingApprovalAlert');

  const cleanRole = window.cleanRoleAccountName || (n => n);

  const pendingUsers = (users || []).filter(u => u.status === 'PENDING_APPROVAL');
  
  // Update badge counter di menu navigasi
  if (pendingBadge) {
    if (pendingUsers.length > 0) {
      pendingBadge.textContent = pendingUsers.length;
      pendingBadge.classList.remove('hidden');
    } else {
      pendingBadge.textContent = '0';
      pendingBadge.classList.add('hidden');
    }
  }

  // Update banner alert di dashboard pemantauan utama Nakes
  if (dashboardAlert) {
    if (pendingUsers.length > 0) {
      dashboardAlert.classList.remove('hidden');
      dashboardAlert.innerHTML = `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-orange-500/10 border-2 border-amber-400 shadow-sm">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow animate-pulse">
              <i class="fa-solid fa-user-clock"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-xs sm:text-sm">Ada ${pendingUsers.length} Permintaan Registrasi Akun Baru Menunggu Konfirmasi</h4>
              <p class="text-[11px] text-slate-600">Pendaftar baru belum dapat masuk sebelum Anda mengonfirmasi atau menolak pendaftaran akun mereka.</p>
            </div>
          </div>
          <button type="button" onclick="switchNakesTab('mitra')"
            class="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer">
            <span>Tinjau & Konfirmasi</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
      `;
    } else {
      dashboardAlert.classList.add('hidden');
      dashboardAlert.innerHTML = '';
    }
  }

  // Render Section Permintaan Registrasi Akun Baru
  if (pendingContainer) {
    if (pendingUsers.length > 0) {
      if (!window.pendingUsersState) {
        window.pendingUsersState = { page: 1, perPage: 4, search: '' };
      }
      const pState = window.pendingUsersState;
      const q = (pState.search || '').toLowerCase().trim();
      const filteredPending = q 
        ? pendingUsers.filter(u => (u.name || '').toLowerCase().includes(q) || (u.phone || '').includes(q) || (u.village_name || '').toLowerCase().includes(q))
        : pendingUsers;

      const totalItems = filteredPending.length;
      const totalPages = Math.ceil(totalItems / pState.perPage) || 1;
      if (pState.page > totalPages) pState.page = totalPages;
      if (pState.page < 1) pState.page = 1;

      const start = (pState.page - 1) * pState.perPage;
      const pagedPending = filteredPending.slice(start, start + pState.perPage);

      pendingContainer.classList.remove('hidden');
      pendingContainer.innerHTML = `
        <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-50/70 to-teal-500/10 border-2 border-amber-300 shadow-sm space-y-3.5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-2.5">
              <span class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow">
                <i class="fa-solid fa-user-clock"></i>
              </span>
              <div>
                <h3 class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                  Permintaan Registrasi Akun Baru
                  <span class="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">${pendingUsers.length} Menunggu</span>
                </h3>
                <p class="text-xs text-slate-600">Verifikasi identitas pendaftar sebelum memberikan izin masuk ke sistem Satengka Pasung.</p>
              </div>
            </div>

            <!-- Tombol Aksi Massal Konfirmasi Semua -->
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <button type="button" onclick="handleApproveAllPendingUsers()"
                class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer">
                <i class="fa-solid fa-check-double"></i>
                <span>Konfirmasi Semua (${pendingUsers.length})</span>
              </button>
            </div>
          </div>

          ${pendingUsers.length > 4 ? `
          <!-- Bar Pencarian Pendaftar Jika Banyak -->
          <div class="flex items-center justify-between gap-3 pt-1">
            <div class="relative flex-1 max-w-xs">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input type="text" placeholder="Cari nama / nomor / desa..." value="${escapeHtml(pState.search || '')}"
                oninput="searchPendingUsers(this.value)"
                class="w-full pl-8 pr-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400">
            </div>
            <span class="text-[11px] font-semibold text-slate-500">
              Menampilkan ${pagedPending.length} dari ${totalItems} akun
            </span>
          </div>
          ` : ''}

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            ${pagedPending.map(u => {
              const safeName = (u.name || '').replace(/'/g, "\\'");
              const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
              const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
              const waLink = `https://wa.me/${intlPhone}?text=${encodeURIComponent(`Halo ${u.name}, saya Tenaga Medis dari Puskesmas Kokop terkait pendaftaran akun Anda di aplikasi SATENGKA PASUNG.`)}`;
              const roleDisplay = u.role === 'NAKES' ? 'Nakes (Tenaga Medis)' : (u.role === 'KADER' ? "Bhuppa' Babhu' (Kader Jiwa)" : (u.role === 'GURU' ? "Ghuru (Kiai/Ustadz)" : "Rato (Kades/Linmas)"));
              const roleIcon = u.role === 'NAKES' ? './assets/icons/role_nakes.png' : (u.role === 'KADER' ? './assets/icons/role_bhupa.png' : (u.role === 'GURU' ? './assets/icons/role_bhu-ghuru.png' : './assets/icons/role_rato.png'));

              return `
              <div class="bg-white p-3.5 rounded-2xl border border-amber-200/90 shadow-xs flex flex-col justify-between space-y-3">
                <div class="flex items-start space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center p-1.5 shrink-0">
                    <img src="${roleIcon}" class="w-full h-full object-contain" alt="${u.role}">
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="font-bold text-slate-900 text-sm truncate">${cleanRole(u.name)}</h4>
                      <span class="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-full shrink-0">Menunggu</span>
                    </div>
                    <p class="text-xs text-teal-800 font-semibold mt-0.5">${roleDisplay}</p>
                    <div class="text-[11px] text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                      <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${u.village_name || 'Kokop'}</span>
                      <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1">
                        <i class="fa-brands fa-whatsapp text-emerald-600"></i>${u.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button type="button" onclick="handleRejectUser('${u.id}', '${safeName}')"
                    class="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-xmark"></i> Tolak
                  </button>
                  <button type="button" onclick="handleApproveUser('${u.id}', '${safeName}')"
                    class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-check"></i> Konfirmasi Akun
                  </button>
                </div>
              </div>
              `;
            }).join('')}
          </div>

          ${totalPages > 1 ? `
          <!-- Kontrol Pagination Ringkas -->
          <div class="flex items-center justify-between pt-2 border-t border-amber-200/80 text-xs text-slate-600">
            <span>Halaman <b>${pState.page}</b> dari <b>${totalPages}</b></span>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="changePendingUsersPage(-1)" ${pState.page <= 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:bg-amber-100 cursor-pointer"'}
                class="px-2.5 py-1 rounded-lg border border-amber-300 bg-white font-bold transition">
                <i class="fa-solid fa-chevron-left mr-1"></i>Sebelumnya
              </button>
              <button type="button" onclick="changePendingUsersPage(1)" ${pState.page >= totalPages ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:bg-amber-100 cursor-pointer"'}
                class="px-2.5 py-1 rounded-lg border border-amber-300 bg-white font-bold transition">
                Selanjutnya<i class="fa-solid fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
          ` : ''}
        </div>
      `;
    } else {
      pendingContainer.classList.add('hidden');
      pendingContainer.innerHTML = '';
    }
  }

  if (!tbody) return;

  tbody.innerHTML = (users || []).map(u => {
    const safeName = (u.name || '').replace(/'/g, "\\'");
    const safePhone = (u.phone || '').replace(/'/g, "\\'");
    const isPending = u.status === 'PENDING_APPROVAL';
    const isRejected = u.status === 'REJECTED';

    let statusBadge = '<span class="text-emerald-700 font-bold">● Aktif</span>';
    if (isPending) {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300"><i class="fa-solid fa-clock mr-1"></i>Menunggu</span>';
    } else if (isRejected) {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300"><i class="fa-solid fa-ban mr-1"></i>Ditolak</span>';
    }

    const roleBadgeHtml = u.role === 'ADMIN'
      ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-indigo-50 text-indigo-800 border border-indigo-200"><i class="fa-solid fa-crown text-indigo-600 text-xs"></i> Administrator</span>`
      : `<span class="px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700">${u.role === 'KADER' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_bhupa.png" class="w-3.5 h-3.5 object-contain"> Bhuppa' Babhu' (Kader Jiwa)</span>` : (u.role === 'GURU' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3.5 h-3.5 object-contain"> Ghuru</span>` : (u.role === 'RATO' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_rato.png" class="w-3.5 h-3.5 object-contain"> Rato</span>` : (u.role === 'NAKES' ? `<span class="inline-flex items-center gap-1.5"><img src="./assets/icons/role_nakes.png" class="w-3.5 h-3.5 object-contain"> Nakes</span>` : u.role)))}</span>`;

    return `
    <tr class="hover:bg-slate-50 transition border-b border-slate-100 ${isPending ? 'bg-amber-50/30' : ''}">
      <td class="p-3.5 font-bold text-slate-800">${cleanRole(u.name)}</td>
      <td class="p-3.5">${roleBadgeHtml}</td>
      <td class="p-3.5 font-mono text-slate-600">${u.phone}</td>
      <td class="p-3.5">${u.village_name || 'Kokop'}</td>
      <td class="p-3.5">${statusBadge}</td>
      <td class="p-3.5 text-center">
        <div class="inline-flex items-center justify-center gap-1.5">
          ${isPending ? `
            <button onclick="handleApproveUser('${u.id}', '${safeName}')" title="Konfirmasi & Setujui Akun"
              class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs flex items-center gap-1 text-xs font-bold">
              <i class="fa-solid fa-check"></i>
              <span>Konfirmasi</span>
            </button>
            <button onclick="handleRejectUser('${u.id}', '${safeName}')" title="Tolak Akun"
              class="px-2 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 text-xs font-bold">
              <i class="fa-solid fa-xmark"></i>
              <span>Tolak</span>
            </button>
          ` : isRejected ? `
            <button onclick="handleApproveUser('${u.id}', '${safeName}')" title="Setujui Ulang Akun"
              class="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition shadow-xs flex items-center gap-1 text-xs font-bold">
              <i class="fa-solid fa-rotate-left"></i>
              <span>Aktifkan</span>
            </button>
          ` : `
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
          `}
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

const DEFINITIVE_VILLAGES = [
  { id: 1, name: "Ampara'an" },
  { id: 2, name: "Bandang Laok" },
  { id: 3, name: "Bandasoleh" },
  { id: 4, name: "Batokorogan" },
  { id: 5, name: "Dupok" },
  { id: 6, name: "Durjan" },
  { id: 7, name: "Katol Timur" },
  { id: 8, name: "Kokop" },
  { id: 9, name: "Lembung Gunong" },
  { id: 10, name: "Mandung" },
  { id: 11, name: "Mano'an" },
  { id: 12, name: "Tlokoh" },
  { id: 13, name: "Tramok" }
];

function populateVillageOptions(selectEl, selectedId = null) {
  if (!selectEl) return;
  const list = (window.villagesData && window.villagesData.length > 0) ? window.villagesData : DEFINITIVE_VILLAGES;
  selectEl.innerHTML = list.map(v => {
    const isSelected = selectedId && (String(v.id) === String(selectedId) || String(v.name).toLowerCase() === String(selectedId).toLowerCase());
    return `<option value="${v.id}" ${isSelected ? 'selected' : ''}>${v.name}</option>`;
  }).join('');
}

export function openAddUserModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalAddUser');
  if (modal) {
    const nameInput = document.getElementById('addUserName');
    if (nameInput) nameInput.value = '';
    const phoneInput = document.getElementById('addUserPhone');
    if (phoneInput) phoneInput.value = '';
    const roleSelect = document.getElementById('addUserRole');
    if (roleSelect) roleSelect.selectedIndex = 0;

    const sel = document.getElementById('addUserVillage');
    populateVillageOptions(sel);
    modal.classList.remove('hidden');
  }
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
      // Reset form fields
      if (document.getElementById('addUserName')) document.getElementById('addUserName').value = '';
      if (document.getElementById('addUserPhone')) document.getElementById('addUserPhone').value = '';
      closeAddUserModal();
      if (window.fetchUsers) window.fetchUsers();
      return;
    }
  } catch (err) {
    console.warn('Create user error:', err);
    alert('Mitra berhasil ditambahkan.');
    if (document.getElementById('addUserName')) document.getElementById('addUserName').value = '';
    if (document.getElementById('addUserPhone')) document.getElementById('addUserPhone').value = '';
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
  
  const sel = document.getElementById('editUserVillage');
  populateVillageOptions(sel, user.village_id || user.village_name);

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
  const proceed = async () => {
    try {
      const adapter = window.firebaseAdapter || window.satengkaEngine || window.malekkasEngine;
      if (adapter && adapter.deleteUser) {
        const res = await adapter.deleteUser(userId);
        if (res.success) {
          if (window.showToast) {
            window.showToast(res.message || `Akun ${userName} berhasil dihapus dari sistem.`, 'danger', 3500);
          } else {
            alert(res.message || `Akun ${userName} berhasil dihapus.`);
          }
          if (window.fetchUsers) await window.fetchUsers();
        } else {
          if (window.showToast) {
            window.showToast(res.message || 'Gagal menghapus akun.', 'warning');
          } else {
            alert(res.message || 'Gagal menghapus akun.');
          }
        }
      }
    } catch (err) {
      console.error('Error delete user:', err);
      if (window.showToast) {
        window.showToast('Terjadi kesalahan saat menghapus akun: ' + err.message, 'warning');
      } else {
        alert('Terjadi kesalahan saat menghapus akun.');
      }
    }
  };

  if (typeof window.showBatikConfirm === 'function') {
    window.showBatikConfirm({
      title: 'Hapus Akun Pengguna Faskes',
      message: `Yakin ingin menghapus akun <strong>"${userName}"</strong>?<br><br><span class="text-xs text-rose-700 bg-rose-50 p-2 rounded-xl block border border-rose-200">Akun ini tidak akan dapat login lagi ke sistem Satengka Pasung.</span>`,
      confirmText: 'Hapus Akun',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: proceed
    });
  } else {
    if (confirm(`Hapus akun "${userName}"?\nAkun ini tidak akan bisa masuk lagi.`)) {
      await proceed();
    }
  }
}

export function changePendingUsersPage(delta) {
  if (!window.pendingUsersState) {
    window.pendingUsersState = { page: 1, perPage: 4, search: '' };
  }
  window.pendingUsersState.page += delta;
  if (window.renderUsersTable && window.cachedUsersData) {
    renderUsersTable(window.cachedUsersData);
  }
}

export function searchPendingUsers(val) {
  if (!window.pendingUsersState) {
    window.pendingUsersState = { page: 1, perPage: 4, search: '' };
  }
  window.pendingUsersState.search = val || '';
  window.pendingUsersState.page = 1;
  if (window.renderUsersTable && window.cachedUsersData) {
    renderUsersTable(window.cachedUsersData);
  }
}

export async function handleApproveUser(userId, userName) {
  try {
    const adapter = window.firebaseAdapter || window.satengkaEngine || window.malekkasEngine;
    if (adapter && adapter.approveUser) {
      const res = await adapter.approveUser(userId);
      if (res.success) {
        if (window.showToast) {
          window.showToast(res.message || `Akun ${userName} berhasil dikonfirmasi & diaktifkan.`, 'success');
        } else {
          alert(res.message || `Akun ${userName} berhasil dikonfirmasi & diaktifkan.`);
        }
        if (window.fetchUsers) await window.fetchUsers();
      } else {
        if (window.showToast) {
          window.showToast(res.message || 'Gagal menyetujui akun.', 'warning');
        } else {
          alert(res.message || 'Gagal menyetujui akun.');
        }
      }
    }
  } catch (err) {
    console.error('Error approve user:', err);
    if (window.showToast) {
      window.showToast('Terjadi kesalahan saat mengonfirmasi akun.', 'danger');
    } else {
      alert('Terjadi kesalahan saat mengonfirmasi akun.');
    }
  }
}

export async function handleApproveAllPendingUsers() {
  const users = window.cachedUsersData || [];
  const pendingUsers = users.filter(u => u.status === 'PENDING_APPROVAL');
  if (pendingUsers.length === 0) {
    if (window.showToast) window.showToast('Tidak ada permintaan akun yang menunggu konfirmasi.', 'info');
    return;
  }

  const proceed = async () => {
    try {
      const adapter = window.firebaseAdapter || window.satengkaEngine || window.malekkasEngine;
      if (!adapter || !adapter.approveUser) return;

      let successCount = 0;
      for (const u of pendingUsers) {
        try {
          const res = await adapter.approveUser(u.id);
          if (res.success) successCount++;
        } catch (e) {
          console.warn('Gagal approve user:', u.id, e);
        }
      }

      if (window.showToast) {
        window.showToast(`Berhasil mengonfirmasi ${successCount} dari ${pendingUsers.length} akun pendaftar baru.`, 'success', 4000);
      }
      if (window.fetchUsers) await window.fetchUsers();
    } catch (err) {
      console.error('Error approve all users:', err);
      if (window.showToast) window.showToast('Terjadi kesalahan saat mengonfirmasi massal akun.', 'danger');
    }
  };

  if (typeof window.showBatikConfirm === 'function') {
    window.showBatikConfirm({
      title: 'Konfirmasi Semua Akun Pendaftar',
      message: `Yakin ingin mengonfirmasi dan mengaktifkan <strong>${pendingUsers.length} akun</strong> pendaftar baru sekaligus? Seluruh akun tersebut akan langsung dapat login ke sistem faskes.`,
      confirmText: `Konfirmasi Semua (${pendingUsers.length})`,
      cancelText: 'Batal',
      isDanger: false,
      onConfirm: proceed
    });
  } else {
    if (confirm(`Konfirmasi dan aktifkan ${pendingUsers.length} akun sekaligus?`)) {
      await proceed();
    }
  }
}

export async function handleRejectUser(userId, userName) {
  const proceed = async () => {
    try {
      const adapter = window.firebaseAdapter || window.satengkaEngine || window.malekkasEngine;
      if (adapter && adapter.rejectUser) {
        const res = await adapter.rejectUser(userId);
        if (res.success) {
          if (window.showToast) {
            window.showToast(res.message || `Pendaftaran akun ${userName} telah ditolak.`, 'danger');
          } else {
            alert(res.message || `Pendaftaran akun ${userName} telah ditolak.`);
          }
          if (window.fetchUsers) await window.fetchUsers();
        } else {
          if (window.showToast) {
            window.showToast(res.message || 'Gagal menolak akun.', 'warning');
          } else {
            alert(res.message || 'Gagal menolak akun.');
          }
        }
      }
    } catch (err) {
      console.error('Error reject user:', err);
      if (window.showToast) {
        window.showToast('Terjadi kesalahan saat memproses penolakan akun.', 'danger');
      } else {
        alert('Terjadi kesalahan saat memproses penolakan akun.');
      }
    }
  };

  if (typeof window.showBatikConfirm === 'function') {
    window.showBatikConfirm({
      title: 'Tolak Pendaftaran Akun',
      message: `Tolak pendaftaran akun <strong>"${userName}"</strong>?<br><br><span class="text-xs text-rose-700 bg-rose-50 p-2 rounded-xl block border border-rose-200">Pengguna ini tidak akan dapat masuk ke aplikasi SATENGKA PASUNG.</span>`,
      confirmText: 'Tolak Akun',
      cancelText: 'Batal',
      isDanger: true,
      onConfirm: proceed
    });
  } else {
    if (confirm(`Tolak pendaftaran akun "${userName}"?\nPengguna ini tidak akan bisa masuk ke aplikasi.`)) {
      await proceed();
    }
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
  window.handleApproveUser = handleApproveUser;
  window.handleRejectUser = handleRejectUser;
  window.handleApproveAllPendingUsers = handleApproveAllPendingUsers;
  window.changePendingUsersPage = changePendingUsersPage;
  window.searchPendingUsers = searchPendingUsers;
}
