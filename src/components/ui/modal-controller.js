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

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.activeExtMapsCoords = activeExtMapsCoords;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openExternalMapsModal = openExternalMapsModal;
  window.closeExternalMapsModal = closeExternalMapsModal;
  window.launchNavigationTarget = launchNavigationTarget;
}
