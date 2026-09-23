/**
 * SATENGKA PASUNG EWS — Shared Formatters & Utilities (ES6 Module)
 * Modul pemformat status, kepatuhan, sanitasi akun, dan perlindungan XSS.
 */

import { ROLES } from '../constants/roles.js';

// 1. Format Status Berbahasa Indonesia Resmi
export function formatStatusIndo(status) {
  const map = {
    'SIAGA': 'Siaga',
    'READY_FOR_EVACUATION': 'Siap Evakuasi',
    'COORDINATION': 'Koordinasi Terpadu',
    'EVACUATION': 'Proses Evakuasi',
    'MONITORING': 'Pemantauan & Kontrol',
    'CLOSED': 'Bebas Pasung / Selesai',
    'NEW': 'Laporan Baru',
    'VALIDATED': 'Tervalidasi',
    'REPORTED': 'Dilaporkan',
    'PROCESS': 'Sedang Diproses',
    'DONE': 'Selesai'
  };
  return map[status] || status || 'Menunggu';
}

// 2. Format Prioritas Kasus
export function formatPriorityIndo(priority) {
  const map = {
    'EMERGENCY': 'Gawat Darurat',
    'HIGH': 'Prioritas Tinggi',
    'NORMAL': 'Normal',
    'LOW': 'Rendah'
  };
  return map[priority] || priority || 'Normal';
}

// 3. Format Kepatuhan Minum Obat
export function formatComplianceIndo(compliance) {
  const map = {
    'RUTIN': 'Rutin & Teratur',
    'PERLU_PERHATIAN': 'Perlu Perhatian',
    'PUTUS_OBAT': 'Putus Obat'
  };
  return map[compliance] || compliance || 'Rutin';
}

// 4. Format Respon Partisipan / Tokoh Mitra
export function formatParticipantResponseIndo(response) {
  const map = {
    'AGREE': 'Siap Mendampingi (Setuju)',
    'READY': 'Siap Mengawal (Terkonfirmasi)',
    'SIAP': 'Siap Terkonfirmasi',
    'NEED_TIME': 'Sedang Menghubungi / Butuh Waktu',
    'PENDING': 'Menunggu Konfirmasi',
    'REJECT': 'Berhalangan'
  };
  return map[response] || response || 'Menunggu Konfirmasi';
}

// 5. Sanitasi Nama Akun dari Tanda Kurung Peran
export function cleanRoleAccountName(name) {
  if (!name || typeof name !== 'string') return name || '';
  return name.replace(/\s*\([^)]*\)/g, '').trim();
}

// 6. Escape HTML (XSS Prevention)
export function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 7. Metadata Visual & Label Peran
export function getRoleVisualMeta(role) {
  const map = {
    [ROLES.NAKES]: { title: 'Nakes', badge: 'Nakes', icon: './assets/icons/role_nakes.png' },
    [ROLES.ADMIN]: { title: 'Admin', badge: 'Admin', icon: './assets/icons/role_nakes.png' },
    [ROLES.KADER]: { title: "Bhupa' Bhabu'", badge: "Bhupa' Bhabu'", icon: './assets/icons/role_bhupa.png' },
    [ROLES.GURU]: { title: "Ghuru", badge: "Ghuru", icon: './assets/icons/role_bhu-ghuru.png' },
    [ROLES.RATO]: { title: "Rato'", badge: "Rato'", icon: './assets/icons/role_rato.png' }
  };
  return map[role] || { title: role, badge: role, icon: './assets/icons/role_nakes.png' };
}

// 🛡️ Global Scope Preservation (Menjamin Kompatibilitas dengan Event Handler Inline di HTML)
if (typeof window !== 'undefined') {
  window.formatStatusIndo = formatStatusIndo;
  window.formatPriorityIndo = formatPriorityIndo;
  window.formatComplianceIndo = formatComplianceIndo;
  window.formatParticipantResponseIndo = formatParticipantResponseIndo;
  window.cleanRoleAccountName = cleanRoleAccountName;
  window.escapeHtml = escapeHtml;
  window.getRoleVisualMeta = getRoleVisualMeta;
}
