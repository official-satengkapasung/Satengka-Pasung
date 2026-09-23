/**
 * SATENGKA PASUNG EWS — Wilayah Kerja & Geolokasi Puskesmas Kokop (ES6 Module)
 * Menyediakan titik koordinat, 13 desa binaan, kalkulator jarak Haversine, dan navigasi faskes.
 */

// Posko Induk Puskesmas Kokop (Pusat Komando Siaga EWS)
export const PUSKESMAS_KOKOP = {
  name: "Puskesmas Kokop Bangkalan",
  role: "Posko Induk Siaga EWS",
  address: "Jl. Raya Kokop, Kec. Kokop, Kab. Bangkalan, Jawa Timur",
  latitude: -7.014523,
  longitude: 113.023412
};

// 13 Desa Binaan di Wilayah Kerja Puskesmas Kokop
export const KOKOP_VILLAGES = [
  { id: 1, name: "Kokop", latitude: -7.014523, longitude: 113.023412 },
  { id: 2, name: "Amparaan", latitude: -7.025100, longitude: 113.041200 },
  { id: 3, name: "Bandang Laok", latitude: -7.038200, longitude: 113.018900 },
  { id: 4, name: "Banda Soleh", latitude: -7.009400, longitude: 113.053100 },
  { id: 5, name: "Batokorogan", latitude: -7.042100, longitude: 113.036500 },
  { id: 6, name: "Dupok", latitude: -7.018900, longitude: 113.012300 },
  { id: 7, name: "Durjan", latitude: -7.031500, longitude: 112.998400 },
  { id: 8, name: "Katol Timur", latitude: -6.998200, longitude: 113.034500 },
  { id: 9, name: "Lembung Gunong", latitude: -7.047800, longitude: 113.007600 },
  { id: 10, name: "Mandung", latitude: -7.029400, longitude: 113.061200 },
  { id: 11, name: "Mano'an", latitude: -7.004100, longitude: 113.015600 },
  { id: 12, name: "Tlokoh", latitude: -6.989500, longitude: 113.027800 },
  { id: 13, name: "Tramok", latitude: -7.035600, longitude: 113.049800 }
];

/**
 * Menghitung jarak garis lurus (great-circle distance) dengan rumus Haversine dalam kilometer.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Jarak dalam km (dibulatkan 2 desimal)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius Bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

/**
 * Menghitung jarak dari lokasi suatu kasus ke Puskesmas Kokop.
 * @param {number} caseLat 
 * @param {number} caseLng 
 * @returns {number}
 */
export function getDistanceToPuskesmas(caseLat, caseLng) {
  return calculateHaversineDistance(
    caseLat,
    caseLng,
    PUSKESMAS_KOKOP.latitude,
    PUSKESMAS_KOKOP.longitude
  );
}

/**
 * Menghasilkan URL navigasi Google Maps untuk membuka rute evakuasi.
 * @param {number} lat 
 * @param {number} lng 
 * @param {string} [label] 
 * @returns {string}
 */
export function buildGoogleMapsRouteUrl(lat, lng, label = '') {
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${query}`;
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.GeoKokop = {
    PUSKESMAS_KOKOP,
    KOKOP_VILLAGES,
    calculateHaversineDistance,
    getDistanceToPuskesmas,
    buildGoogleMapsRouteUrl
  };
}
