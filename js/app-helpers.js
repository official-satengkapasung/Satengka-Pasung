/**
 * SATENGKA PASUNG EWS — Shared Utilities & Formatters
 * Modul pembantu bersama untuk index.html, login.html, dan register.html
 */

(function(window) {
  'use strict';

  // 1. Helper Format Status Berbahasa Indonesia Resmi
  function formatStatusIndo(status) {
    const map = {
      'SIAGA': 'Siaga',
      'READY_FOR_EVACUATION': 'Siap Evakuasi',
      'COORDINATION': 'Koordinasi Terpadu',
      'EVACUATION': 'Proses Evakuasi',
      'MONITORING': 'Pemantauan & Kontrol',
      'CLOSED': 'Terkontrol',
      'NEW': 'Laporan Baru',
      'VALIDATED': 'Tervalidasi',
      'REPORTED': 'Dilaporkan',
      'PROCESS': 'Sedang Diproses',
      'DONE': 'Terkontrol'
    };
    return map[status] || status || 'Menunggu';
  }

  // 2. Helper Format Prioritas
  function formatPriorityIndo(priority) {
    const map = {
      'EMERGENCY': 'Gawat Darurat',
      'HIGH': 'Prioritas Tinggi',
      'NORMAL': 'Normal',
      'LOW': 'Rendah'
    };
    return map[priority] || priority || 'Normal';
  }

  // 3. Helper Kepatuhan Obat
  function formatComplianceIndo(compliance) {
    const map = {
      'RUTIN': 'Rutin & Teratur',
      'PERLU_PERHATIAN': 'Perlu Perhatian',
      'PUTUS_OBAT': 'Putus Obat'
    };
    return map[compliance] || compliance || 'Rutin';
  }

  // 4. Helper Format Respon Partisipan / Pilar
  function formatParticipantResponseIndo(response) {
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

  // 5. Helper Sanitasi Nama Akun dari Tanda Kurung Peran
  function cleanRoleAccountName(name) {
    if (!name || typeof name !== 'string') return name || '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  }

  // 6. Helper Escape HTML (XSS Protection)
  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 7. Helper Metadata Visual & Label Peran
  function getRoleVisualMeta(role) {
    const map = {
      'NAKES': { title: 'Nakes', badge: 'Nakes', icon: './assets/icons/role_nakes.png' },
      'ADMIN': { title: 'Admin', badge: 'Admin', icon: './assets/icons/role_nakes.png' },
      'KADER': { title: "Bhuppa' Babhu'", badge: "Bhuppa' Babhu'", icon: './assets/icons/role_bhupa.png' },
      'GURU': { title: "Ghuru", badge: "Ghuru", icon: './assets/icons/role_bhu-ghuru.png' },
      'RATO': { title: "Rato", badge: "Rato", icon: './assets/icons/role_rato.png' }
    };
    return map[role] || { title: role, badge: role, icon: './assets/icons/role_nakes.png' };
  }

  // Export ke window global
  window.formatStatusIndo = formatStatusIndo;
  window.formatPriorityIndo = formatPriorityIndo;
  window.formatComplianceIndo = formatComplianceIndo;
  window.formatParticipantResponseIndo = formatParticipantResponseIndo;
  window.cleanRoleAccountName = cleanRoleAccountName;
  window.escapeHtml = escapeHtml;
  window.getRoleVisualMeta = getRoleVisualMeta;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      formatStatusIndo,
      formatPriorityIndo,
      formatComplianceIndo,
      formatParticipantResponseIndo,
      cleanRoleAccountName,
      escapeHtml,
      getRoleVisualMeta
    };
  }
})(typeof window !== 'undefined' ? window : global);
