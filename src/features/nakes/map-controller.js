/**
 * SATENGKA PASUNG EWS — Leaflet Map Controller (ES6 Module)
 * Mengelola peta spasial wilayah kerja Puskesmas Kokop, marker sebaran kasus, dan popup navigasi faskes.
 */

import { PUSKESMAS_KOKOP } from '../ews/geo-kokop.js';

export let leafletMapInstance = null;
export let leafletMarkerGroup = null;
export let activeMapCategoryFilter = 'ALL';

/**
 * Mengatur filter kategori marker pada peta Puskesmas Kokop.
 * @param {'ALL'|'EVAC_NEEDED'|'COORDINATION'|'READY_EVAC'|'MONITORING'|'FASKES'} category 
 */
export function setMapCategoryFilter(category) {
  activeMapCategoryFilter = category;

  if (typeof document !== 'undefined') {
    const filterButtons = document.querySelectorAll('.map-filter-btn');
    filterButtons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      if (cat === category) {
        btn.classList.add('bg-emerald-700', 'text-white', 'shadow-sm', 'font-bold');
        btn.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-50');
      } else {
        btn.classList.remove('bg-emerald-700', 'text-white', 'shadow-sm', 'font-bold');
        btn.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-50');
      }
    });
  }

  initOrUpdateLeafletMap();
}

/**
 * Memperbarui counter badge pada tombol filter peta.
 */
export function updateMapFilterCounters() {
  if (typeof document === 'undefined') return;

  const currentCases = (typeof window !== 'undefined' && window.currentCases) || [];

  const cAll = document.getElementById('mapCount_ALL');
  const cEvac = document.getElementById('mapCount_EVAC_NEEDED');
  const cCoord = document.getElementById('mapCount_COORDINATION');
  const cReady = document.getElementById('mapCount_READY_EVAC');
  const cMon = document.getElementById('mapCount_MONITORING');

  const evacCount = currentCases.filter(c => c.status === 'SIAGA' || c.status === 'REPORTED').length;
  const coordCount = currentCases.filter(c => c.status === 'COORDINATION').length;
  const readyCount = currentCases.filter(c => c.status === 'READY_FOR_EVACUATION').length;
  const monCount = currentCases.filter(c => c.status === 'MONITORING' || c.status === 'CLOSED').length;

  if (cAll) cAll.innerText = currentCases.length;
  if (cEvac) cEvac.innerText = evacCount;
  if (cCoord) cCoord.innerText = coordCount;
  if (cReady) cReady.innerText = readyCount;
  if (cMon) cMon.innerText = monCount;
}

/**
 * Inisialisasi atau render ulang marker pada peta spasial Leaflet.
 */
export function initOrUpdateLeafletMap() {
  if (typeof document === 'undefined' || typeof window === 'undefined' || typeof window.L === 'undefined') return;

  const mapEl = document.getElementById('nakesLeafletMap');
  if (!mapEl) return;

  const L = window.L;
  const kokopCenter = [PUSKESMAS_KOKOP.latitude, PUSKESMAS_KOKOP.longitude];
  const currentCases = window.currentCases || [];

  if (!leafletMapInstance) {
    leafletMapInstance = L.map('nakesLeafletMap', {
      zoomControl: true,
      attributionControl: true
    }).setView(kokopCenter, 12);

    const primaryTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Puskesmas Kokop Bangkalan'
    });

    primaryTile.on('tileerror', function () {
      console.warn('Fallback ke CartoDB Voyager Tile');
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; CARTO &copy; OSM contributors'
      }).addTo(leafletMapInstance);
    });

    primaryTile.addTo(leafletMapInstance);
    leafletMarkerGroup = L.layerGroup().addTo(leafletMapInstance);

    window.leafletMapInstance = leafletMapInstance;
    window.leafletMarkerGroup = leafletMarkerGroup;
  } else {
    leafletMapInstance.invalidateSize();
  }

  updateMapFilterCounters();

  if (leafletMarkerGroup) {
    leafletMarkerGroup.clearLayers();
    const markerBounds = [];

    // 1. Marker Faskes Induk: Puskesmas Kokop
    if (activeMapCategoryFilter === 'ALL' || activeMapCategoryFilter === 'FASKES') {
      const puskesmasIcon = L.divIcon({
        className: 'custom-pin-pusk',
        html: `<div class="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-sm shadow-lg border-2 border-white font-bold"><i class="fa-solid fa-hospital"></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      L.marker(kokopCenter, { icon: puskesmasIcon })
        .bindPopup(`
          <div class="space-y-1.5 p-0.5">
            <strong>Puskesmas Kokop</strong><br>
            <span class="text-slate-500 text-[10px]">Jl. Raya Kokop, Desa Dupok</span><br>
            <span class="text-emerald-700 font-bold text-[10px]">Posko Induk Siaga EWS</span>
            <div class="pt-1">
              <button type="button" onclick="openExternalMapsModal(${kokopCenter[0]}, ${kokopCenter[1]}, 'Puskesmas Kokop Bangkalan', 'Posko Induk Siaga EWS')" class="w-full px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px] flex items-center justify-center space-x-1 shadow-sm">
                <i class="fa-solid fa-diamond-turn-right text-[9px]"></i>
                <span>Buka di Aplikasi Maps</span>
              </button>
            </div>
          </div>
        `)
        .addTo(leafletMarkerGroup);
      markerBounds.push(kokopCenter);
    }

    // 2. Filter & Render Marker Kasus
    if (activeMapCategoryFilter !== 'FASKES') {
      let casesToDisplay = currentCases;
      if (activeMapCategoryFilter === 'EVAC_NEEDED') {
        casesToDisplay = currentCases.filter(c => c.status === 'SIAGA' || c.status === 'REPORTED');
      } else if (activeMapCategoryFilter === 'COORDINATION') {
        casesToDisplay = currentCases.filter(c => c.status === 'COORDINATION');
      } else if (activeMapCategoryFilter === 'READY_EVAC') {
        casesToDisplay = currentCases.filter(c => c.status === 'READY_FOR_EVACUATION');
      } else if (activeMapCategoryFilter === 'MONITORING') {
        casesToDisplay = currentCases.filter(c => c.status === 'MONITORING' || c.status === 'CLOSED');
      }

      casesToDisplay.forEach(c => {
        const lat = parseFloat(c.latitude) || (kokopCenter[0] + (Math.random() - 0.5) * 0.03);
        const lng = parseFloat(c.longitude) || (kokopCenter[1] + (Math.random() - 0.5) * 0.03);

        let pinColor = 'bg-amber-500';
        let statusLabel = 'Sedang Koordinasi';
        if (c.status === 'SIAGA' || c.status === 'REPORTED') {
          pinColor = 'bg-red-600 animate-bounce';
          statusLabel = 'Butuh Evakuasi';
        } else if (c.status === 'READY_FOR_EVACUATION') {
          pinColor = 'bg-emerald-600';
          statusLabel = 'Siap Evakuasi';
        } else if (c.status === 'MONITORING' || c.status === 'CLOSED') {
          pinColor = 'bg-blue-600';
          statusLabel = 'Kontrol Obat';
        }

        const caseIcon = L.divIcon({
          className: 'custom-pin-case',
          html: `<div class="w-6 h-6 rounded-full ${pinColor} text-white flex items-center justify-center text-xs shadow-md border border-white font-bold"><i class="fa-solid fa-location-dot"></i></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        });

        const safeName = (c.patient_name || '').replace(/'/g, "\\'");
        const safeVillage = (c.village_name || 'Desa Kokop').replace(/'/g, "\\'");

        L.marker([lat, lng], { icon: caseIcon })
          .bindPopup(`
            <div class="space-y-1.5 p-0.5">
              <p class="font-bold text-slate-800 text-xs">${c.patient_name} (${c.village_name || 'Desa Kokop'})</p>
              <p class="text-[10px] text-slate-500">${c.case_number || ''} • ${c.report_type || 'Pasung'}</p>
              <span class="px-2 py-0.5 rounded text-[9px] font-bold text-white ${pinColor.split(' ')[0]}">${statusLabel}</span>
              <div class="pt-1.5 flex space-x-1.5">
                <button onclick="selectCaseDetail('${c.id}')" class="px-2 py-1 bg-slate-800 text-white font-bold rounded text-[9px] hover:bg-black">Detail</button>
                <button onclick="openExternalMapsModal(${lat}, ${lng}, '${safeName}', '${safeVillage}')" class="px-2 py-1 bg-emerald-700 text-white font-bold rounded text-[9px] hover:bg-emerald-800 flex items-center space-x-1">
                  <i class="fa-solid fa-diamond-turn-right text-[8px]"></i>
                  <span>Maps</span>
                </button>
              </div>
            </div>
          `)
          .addTo(leafletMarkerGroup);

        markerBounds.push([lat, lng]);
      });
    }

    if (markerBounds.length > 1) {
      leafletMapInstance.fitBounds(L.latLngBounds(markerBounds), { padding: [35, 35], maxZoom: 15 });
    } else if (markerBounds.length === 1) {
      leafletMapInstance.setView(markerBounds[0], 14);
    }
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.NakesMap = {
    setMapCategoryFilter,
    updateMapFilterCounters,
    initOrUpdateLeafletMap
  };
  window.setMapCategoryFilter = setMapCategoryFilter;
  window.updateMapFilterCounters = updateMapFilterCounters;
  window.initOrUpdateLeafletMap = initOrUpdateLeafletMap;
}
