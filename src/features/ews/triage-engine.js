/**
 * SATENGKA PASUNG EWS — Triage & Clinical Alert Engine (ES6 Module)
 * Menghitung tingkat urgensi klinis, rekomendasi 4 Pilar, dan generator notifikasi Siaga.
 */

import { PRIORITY_EWS } from '../../constants/roles.js';

/**
 * Menghitung tingkat prioritas klinis EWS berdasarkan indikator risiko lapangan.
 * @param {Object} indicators
 * @param {boolean} indicators.isAggressive - Pasien gaduh gelisah / agresif fisik
 * @param {boolean} indicators.hasWeapon - Membawa senjata tajam atau benda berbahaya
 * @param {boolean} indicators.hasPhysicalInjury - Ada luka fisik / infeksi akibat pasung
 * @param {boolean} indicators.isMedicineDefault - Putus obat > 1 bulan
 * @param {boolean} indicators.hasFamilyResistance - Keluarga menolak penanganan / defensif
 * @returns {{ priority: string, score: number, alertLevel: string, recommendation: string }}
 */
export function assessEwsRisk(indicators = {}) {
  let score = 0;

  if (indicators.hasWeapon) score += 40;
  if (indicators.isAggressive) score += 30;
  if (indicators.hasPhysicalInjury) score += 20;
  if (indicators.isMedicineDefault) score += 15;
  if (indicators.hasFamilyResistance) score += 15;

  let priority = PRIORITY_EWS.NORMAL;
  let alertLevel = 'Waspada Rutin';
  let recommendation = 'Kunjungan berkala oleh Kader Bhuppa\' Babhu\' dan kontrol obat Puskesmas.';

  if (score >= 60) {
    priority = PRIORITY_EWS.EMERGENCY;
    alertLevel = 'Kritis / Gawat Darurat (Red Alert)';
    recommendation = 'Aktivasi segera Siaga Satengka Pasung: Pendampingan penuh Nakes, Linmas Rato/Kades, dan pendekatan persuasif Kiai.';
  } else if (score >= 30) {
    priority = PRIORITY_EWS.HIGH;
    alertLevel = 'Prioritas Tinggi (Yellow Alert)';
    recommendation = 'Koordinasi terpadu Nakes dan Kader untuk observasi langsung serta rembuk santun keluarga.';
  } else if (score < 15) {
    priority = PRIORITY_EWS.LOW;
    alertLevel = 'Terkontrol / Stabil (Green)';
    recommendation = 'Pemantauan kepatuhan minum obat dan evaluasi berkala.';
  }

  return {
    score,
    priority,
    alertLevel,
    recommendation
  };
}

/**
 * Membangun pesan WhatsApp resmi yang santun untuk Tokoh Agama (Ghuru / Kiai).
 * @param {Object} params
 * @param {string} params.patientName
 * @param {string} params.villageName
 * @param {string} [params.customNote]
 * @returns {string}
 */
export function buildGhuruAlertMessage({ patientName, villageName, customNote }) {
  const note = customNote || 'Mohon kesediaan Kiai mendampingi evakuasi medis.';
  return (
    `*NOTIFIKASI SIAGA SATENGKA PASUNG PUSKESMAS KOKOP*\n\n` +
    `Assalamu’alaikum Wr. Wb. Kiai,\n` +
    `Mohon bantuan pendekatan keagamaan persuasif & rembuk santun keluarga untuk penanganan warga di Desa ${villageName || 'Kokop'} (Pasien: ${patientName || 'Warga'}).\n\n` +
    `Catatan: ${note}\n\n` +
    `Terima kasih atas keridhoan & bimbingan Kiai.`
  );
}

/**
 * Membangun pesan WhatsApp resmi untuk Aparatur / Kepala Desa (Rato' / Klebun).
 * @param {Object} params
 * @param {string} params.patientName
 * @param {string} params.villageName
 * @param {string} [params.customNote]
 * @returns {string}
 */
export function buildRatoAlertMessage({ patientName, villageName, customNote }) {
  const note = customNote || 'Mohon koordinasi pengamanan kondusif saat penjemputan warga.';
  return (
    `*PEMBERITAHUAN SIAGA KOORDINASI EVAKUASI DESA*\n\n` +
    `Kepada Yth. Kepala Desa / Rato (${villageName || 'Kokop'}),\n` +
    `Petugas Puskesmas Kokop meminta pendampingan pengawalan linmas wilayah untuk penanganan evakuasi medis warga (Pasien: ${patientName || 'Warga'}).\n\n` +
    `Catatan: ${note}\n\n` +
    `Terima kasih atas kerja samanya.`
  );
}

/**
 * Memformat nomor WhatsApp ke standar internasional 62...
 * @param {string} phone 
 * @returns {string}
 */
export function sanitizeWhatsAppPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }
  return clean;
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.TriageEngine = {
    assessEwsRisk,
    buildGhuruAlertMessage,
    buildRatoAlertMessage,
    sanitizeWhatsAppPhone
  };
}
