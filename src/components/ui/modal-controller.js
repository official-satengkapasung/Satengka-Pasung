/**
 * SATENGKA PASUNG EWS — Modal & Dialog Controller (ES6 Module)
 * Mengontrol pembukaan, penutupan modal dialog, dan pengarah navigasi peta eksternal.
 */

// Koordinat target peta aktif saat membuka dialog navigasi
export const activeExtMapsCoords = {
  lat: -7.014523,
  lng: 113.023412,
  title: 'Puskesmas Kokop',
  address: 'Kec. Kokop'
};

/**
 * Membuka modal dialog berdasarkan ID elemen.
 * @param {string} modalId 
 */
export function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Menutup modal dialog berdasarkan ID elemen.
 * @param {string} modalId 
 */
export function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Membuka modal dialog pemilih aplikasi peta eksternal (Google Maps / Waze / Apple Maps).
 * @param {number} [lat] 
 * @param {number} [lng] 
 * @param {string} [title] 
 * @param {string} [address] 
 */
export function openExternalMapsModal(lat, lng, title, address) {
  if (lat !== undefined && lng !== undefined) {
    activeExtMapsCoords.lat = parseFloat(lat);
    activeExtMapsCoords.lng = parseFloat(lng);
    activeExtMapsCoords.title = title || 'Pasien Kokop';
    activeExtMapsCoords.address = address || 'Desa Kokop';
  } else if (typeof window !== 'undefined' && window.activeSelectedCase) {
    const c = window.activeSelectedCase;
    activeExtMapsCoords.lat = parseFloat(c.latitude) || -7.014523;
    activeExtMapsCoords.lng = parseFloat(c.longitude) || 113.023412;
    activeExtMapsCoords.title = c.patient_name || 'Pasien Kokop';
    activeExtMapsCoords.address = (c.village_name || 'Desa Kokop') + ' — Kec. Kokop';
  }

  const titleEl = document.getElementById('extMapsTargetTitle');
  const coordsEl = document.getElementById('extMapsTargetCoords');
  if (titleEl) titleEl.innerText = `${activeExtMapsCoords.title} (${activeExtMapsCoords.address})`;
  if (coordsEl) coordsEl.innerText = `${activeExtMapsCoords.lat.toFixed(6)}, ${activeExtMapsCoords.lng.toFixed(6)}`;

  openModal('modalExternalMapsChooser');
}

/**
 * Menutup modal dialog pemilih aplikasi peta eksternal.
 */
export function closeExternalMapsModal() {
  closeModal('modalExternalMapsChooser');
}

/**
 * Menjalankan deep-link navigasi ke aplikasi Maps yang dipilih pengguna.
 * @param {'google_maps'|'waze'|'apple_maps'|'geo_intent'} type 
 */
export function launchNavigationTarget(type) {
  const { lat, lng, title } = activeExtMapsCoords;
  const label = encodeURIComponent(title || 'Titik Evakuasi Puskesmas Kokop');
  let targetUrl = '';

  switch (type) {
    case 'google_maps':
      targetUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
      break;
    case 'waze':
      targetUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes&zoom=17`;
      break;
    case 'apple_maps':
      targetUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${label}`;
      break;
    case 'geo_intent':
      targetUrl = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
      break;
    default:
      targetUrl = `https://maps.google.com/?q=${lat},${lng}`;
  }

  closeExternalMapsModal();
  window.open(targetUrl, '_blank');
}

/**
 * Konversi dataURL base64 ke Blob biner
 * @param {string} dataurl
 * @returns {Blob|null}
 */
export function dataURLtoBlob(dataurl) {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting dataURL to Blob:', e);
    return null;
  }
}

/**
 * Membuka gambar dataURL di tab baru via Blob URL yang aman dari pencekalan Chrome
 * @param {string} dataUrl
 */
export function openSafeBlobImageInNewTab(dataUrl) {
  if (!dataUrl) return;
  if (dataUrl.startsWith('data:')) {
    const blob = dataURLtoBlob(dataUrl);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      return;
    }
  }
  window.open(dataUrl, '_blank');
}

/**
 * Membuka Modal Lightbox Preview Foto Laporan Temuan
 * @param {string} reportIdOrPhotoSrc
 * @param {string} [optionalTitle]
 */
export function previewReportPhoto(reportIdOrPhotoSrc, optionalTitle = '') {
  if (typeof document === 'undefined') return;

  let photoSrc = '';
  let repNumber = '';
  let patientName = '';
  let villageName = '';

  const reports = window.currentReports || window.reports || [];
  const matchedRep = reports.find(r => String(r.id) === String(reportIdOrPhotoSrc));

  if (matchedRep) {
    photoSrc = matchedRep.photo_path || matchedRep.photo_url || '';
    repNumber = matchedRep.report_number || `LAP-${matchedRep.id}`;
    patientName = matchedRep.patient_name_input || matchedRep.patient_name || 'Warga Kokop';
    villageName = matchedRep.village_name || matchedRep.address_input || 'Kecamatan Kokop';
  } else if (typeof reportIdOrPhotoSrc === 'string' && (reportIdOrPhotoSrc.startsWith('data:') || reportIdOrPhotoSrc.startsWith('http') || reportIdOrPhotoSrc.startsWith('./'))) {
    photoSrc = reportIdOrPhotoSrc;
    patientName = optionalTitle || 'Bukti Lapangan';
  }

  if (!photoSrc) {
    alert('Foto bukti belum tersedia pada laporan ini.');
    return;
  }

  const modal = document.getElementById('modalPhotoLightbox');
  const img = document.getElementById('photoLightboxImg');
  const title = document.getElementById('photoLightboxTitle');
  const sub = document.getElementById('photoLightboxSubtitle');
  const caption = document.getElementById('photoLightboxCaption');
  const newTabBtn = document.getElementById('photoLightboxNewTabBtn');
  const dlBtn = document.getElementById('photoLightboxDownloadBtn');

  if (img) img.src = photoSrc;
  if (title) title.innerText = repNumber ? `Foto Laporan: ${repNumber}` : 'Foto Bukti Lapangan';
  if (sub) sub.innerText = patientName ? `Pasien: ${patientName} • ${villageName}` : 'Dokumentasi resmi kader jiwa';
  if (caption) caption.innerText = `${patientName || 'Pasien'} (${villageName || 'Kokop'})`;

  if (newTabBtn) {
    newTabBtn.onclick = () => openSafeBlobImageInNewTab(photoSrc);
  }

  if (dlBtn) {
    dlBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = photoSrc;
      a.download = `${repNumber || 'FOTO-BUKTI-LAPORAN'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }

  if (modal) modal.classList.remove('hidden');
}

/**
 * Menutup Modal Lightbox Preview Foto
 */
export function closePhotoLightbox() {
  const modal = document.getElementById('modalPhotoLightbox');
  if (modal) modal.classList.add('hidden');
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.activeExtMapsCoords = activeExtMapsCoords;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openExternalMapsModal = openExternalMapsModal;
  window.closeExternalMapsModal = closeExternalMapsModal;
  window.launchNavigationTarget = launchNavigationTarget;
  window.dataURLtoBlob = dataURLtoBlob;
  window.openSafeBlobImageInNewTab = openSafeBlobImageInNewTab;
  window.previewReportPhoto = previewReportPhoto;
  window.closePhotoLightbox = closePhotoLightbox;
}
