/**
 * SATENGKA PASUNG EWS — Nakes Dashboard & Case Controller (ES6 Module)
 * Mengelola kartu antrian aksi cepat, banner laporan baru, counter metrik faskes,
 * navigasi tab nakes, filter kategori peta spasial, dan modal reminder WA faskes.
 */

import {
  formatDateIndo,
  formatStatusIndo,
  formatTriageIndo,
  formatComplianceIndo,
  cleanRoleAccountName
} from '../../utils/formatters.js';

    export function updateNakesCounters(cases) {
      const newReportsCount = currentReports.filter(r => r.status === 'NEW').length;
      const siagaCount = cases.filter(c => c.status === 'SIAGA' || c.status === 'REPORTED').length + newReportsCount;
      const koordinasiCount = cases.filter(c => c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION').length;
      const selesaiCount = cases.filter(c => c.status === 'MONITORING' || c.status === 'CLOSED').length;

      const statEvak = document.getElementById('statButuhEvakuasi');
      if (statEvak) statEvak.innerText = siagaCount;
      const statKoord = document.getElementById('statSedangKoordinasi');
      if (statKoord) statKoord.innerText = koordinasiCount;
      const statDone = document.getElementById('statSelesai');
      if (statDone) statDone.innerText = selesaiCount;
      const statTotal = document.getElementById('statTotalKasus');
      if (statTotal) statTotal.innerText = cases.length + newReportsCount;

      // Update Badge Laporan Baru di Sidebar & Topbar Bell
      const sideBadge = document.getElementById('nakesSidebarLaporanBadge');
      const bellDot = document.getElementById('nakesTopbarBellDot');
      const bellBadge = document.getElementById('nakesTopbarBellBadge');

      if (newReportsCount > 0) {
        if (sideBadge) {
          sideBadge.innerText = newReportsCount;
          sideBadge.classList.remove('hidden');
        }
        if (bellDot) bellDot.classList.remove('hidden');
        if (bellBadge) bellBadge.classList.remove('hidden');
      } else {
        if (sideBadge) sideBadge.classList.add('hidden');
        if (bellDot) bellDot.classList.add('hidden');
        if (bellBadge) bellBadge.classList.add('hidden');
      }
    }

    // Fungsi Pembaharuan Metrik KPI untuk Kader (Bhupa'), Guru (Kiai), dan Rato (Kades)
    export function updateRoleMetricCounters() {
      if (!currentUser) return;

      if (currentUser.role === 'KADER') {
        const total = currentReports.length;
        const inProcess = currentReports.filter(r => r.status === 'NEW' || (r.effective_status && r.effective_status !== 'CLOSED' && r.effective_status !== 'MONITORING')).length;
        const closed = currentReports.filter(r => r.status === 'CLOSED' || r.effective_status === 'CLOSED' || r.effective_status === 'MONITORING').length;

        const elTotal = document.getElementById('kaderStatTotalReports');
        if (elTotal) elTotal.innerText = total;
        const elProcess = document.getElementById('kaderStatInProcess');
        if (elProcess) elProcess.innerText = inProcess;
        const elClosed = document.getElementById('kaderStatClosed');
        if (elClosed) elClosed.innerText = closed;
      } else if (currentUser.role === 'GURU') {
        const reqs = currentCases.filter(c => c.status === 'SIAGA' || c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION').length;
        const agreed = currentCases.filter(c => (c.participants || []).some(p => p.participant_role === 'GURU' && p.response === 'AGREE')).length;
        const done = currentCases.filter(c => c.status === 'CLOSED' || c.status === 'MONITORING').length;

        const elReq = document.getElementById('guruStatRequests');
        if (elReq) elReq.innerText = reqs;
        const elAgree = document.getElementById('guruStatAgreed');
        if (elAgree) elAgree.innerText = agreed;
        const elDone = document.getElementById('guruStatDone');
        if (elDone) elDone.innerText = done;
      } else if (currentUser.role === 'RATO') {
        const reqs = currentCases.filter(c => c.status === 'SIAGA' || c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION').length;
        const ready = currentCases.filter(c => (c.participants || []).some(p => p.participant_role === 'RATO' && p.response === 'READY')).length;
        const done = currentCases.filter(c => c.status === 'CLOSED' || c.status === 'MONITORING').length;

        const elReq = document.getElementById('ratoStatRequests');
        if (elReq) elReq.innerText = reqs;
        const elReady = document.getElementById('ratoStatReady');
        if (elReady) elReady.innerText = ready;
        const elDone = document.getElementById('ratoStatDone');
        if (elDone) elDone.innerText = done;
      }
    }

    // Render Kasus Membutuhkan Aksi & Laporan Baru di Dashboard Nakes (Persis Gambar 2)
    export function renderNakesDashboardCases(cases) {
      // 1. Render Banner Alert Laporan Masuk Baru dari Kader (Jika Ada)
      const pendingReports = currentReports.filter(r => r.status === 'NEW');
      const bannerContainer = document.getElementById('nakesPendingReportsContainer');
      const bannerList = document.getElementById('nakesPendingReportsList');
      const bannerTitle = document.getElementById('nakesPendingReportsTitle');

      if (bannerContainer && bannerList) {
        if (pendingReports.length > 0) {
          bannerContainer.classList.remove('hidden');
          if (bannerTitle) {
            bannerTitle.innerText = `${pendingReports.length} Laporan Pasung Baru Masuk dari Kader Jiwa!`;
          }
          bannerList.innerHTML = pendingReports.map(r => `
            <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div class="space-y-0.5 cursor-pointer flex-1" onclick="openReportDetail('${r.id}')">
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-white text-sm">${r.patient_name_input}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-red-700 font-bold">${r.report_number}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] bg-amber-400 text-slate-900 font-black uppercase">${r.report_type || 'Pasung'}</span>
                </div>
                <p class="text-xs text-white/90">
                  <i class="fa-solid fa-user-tag text-[10px] mr-1"></i>Pelapor: <strong>${r.reporter_name || 'Kader'}</strong> (${r.reporter_phone || '-'}) • <i class="fa-solid fa-location-dot text-[10px] mr-1"></i>${r.address_input || 'Desa Kokop'}
                </p>
              </div>
              <div class="flex items-center space-x-2 self-end md:self-center shrink-0">
                <button type="button" onclick="openReportDetail('${r.id}')" class="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition flex items-center shadow-xs">
                  <i class="fa-solid fa-eye mr-1.5"></i> Detail
                </button>
                ${r.latitude ? `<a href="https://maps.google.com/?q=${r.latitude},${r.longitude}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition flex items-center"><i class="fa-solid fa-map-location-dot mr-1"></i> GPS</a>` : ''}
                <button onclick="openSiagaFromReport('${r.id}')" class="px-3.5 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 font-black text-xs shadow-md transition flex items-center">
                  <i class="fa-solid fa-clipboard-check mr-1.5"></i> Validasi Satengka & Pemetaan
                </button>
              </div>
            </div>
          `).join('');
        } else {
          bannerContainer.classList.add('hidden');
        }
      }

      // 2. Render Daftar Aksi Cepat
      const container = document.getElementById('nakesAksiList');
      if (!container) return;

      // Gabungkan laporan NEW di paling atas daftar aksi jika ada
      let actionItemsHtml = '';

      if (pendingReports.length > 0) {
        actionItemsHtml += pendingReports.map(r => `
          <div onclick="openReportDetail('${r.id}')" class="p-3.5 rounded-2xl border-2 border-red-300 bg-red-50/50 hover:bg-red-50 cursor-pointer transition flex justify-between items-center shadow-xs">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm shrink-0">
                <i class="fa-solid fa-bell animate-bounce"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h4 class="font-bold text-slate-900 text-sm">${r.patient_name_input}</h4>
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-200 text-red-800 font-bold">${r.report_number}</span>
                </div>
                <p class="text-xs text-slate-500">${r.address_input || 'Desa Kokop'} • <span class="text-red-600 font-semibold">Laporan Kader (Belum Divalidasi)</span></p>
              </div>
            </div>
            <div class="flex items-center space-x-1.5 shrink-0">
              <button onclick="event.stopPropagation(); openReportDetail('${r.id}');" class="px-2.5 py-1.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 font-bold text-xs rounded-xl shadow-xs">
                <i class="fa-solid fa-eye mr-1 text-slate-400"></i> Detail
              </button>
              <button onclick="event.stopPropagation(); openSiagaFromReport('${r.id}');" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow">
                Validasi Satengka
              </button>
            </div>
          </div>
        `).join('');
      }

      if (cases.length > 0) {
        actionItemsHtml += cases.slice(0, 5).map(c => {
          let badgeHtml = '';
          if (c.status === 'SIAGA' || c.status === 'REPORTED') {
            badgeHtml = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 flex items-center"><i class="fa-solid fa-triangle-exclamation mr-1 text-[10px]"></i> Butuh Evakuasi</span>`;
          } else if (c.status === 'READY_FOR_EVACUATION') {
            badgeHtml = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Siap Evakuasi</span>`;
          } else {
            badgeHtml = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Sedang Koordinasi</span>`;
          }

          const parts = c.participants || [];
          const guruP = parts.find(p => p.participant_role === 'GURU');
          const ratoP = parts.find(p => p.participant_role === 'RATO');

          let partnerPills = '';
          if (guruP && (guruP.response === 'AGREE' || guruP.response === 'SIAP' || guruP.response === 'READY')) {
            partnerPills += `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain inline-block" alt="Ghuru"> Ghuru: Siap</span>`;
          } else if (guruP && guruP.response === 'NEED_TIME') {
            partnerPills += `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain inline-block" alt="Ghuru"> Ghuru: Butuh Waktu</span>`;
          }

          if (ratoP && (ratoP.response === 'READY' || ratoP.response === 'SIAP' || ratoP.response === 'AGREE')) {
            partnerPills += `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1"><img src="./assets/icons/role_rato.png" class="w-3 h-3 object-contain inline-block" alt="Rato"> Rato: Siap</span>`;
          }

          // Info Narahubung Pelapor & Tokoh Kemitraan
          let repName = c.reporter_name;
          let repPhone = c.reporter_phone;
          if ((!repName || repName === 'Siti') && c.report_id) {
            const matchedRep = (currentReports || []).find(r => String(r.id) === String(c.report_id));
            if (matchedRep && matchedRep.reporter_name) {
              repName = matchedRep.reporter_name;
              if (matchedRep.reporter_phone) repPhone = matchedRep.reporter_phone;
            }
          }
          if (!repName || repName === 'Siti') {
            const bhupaP = parts.find(p => p.participant_role === 'BHUPA');
            if (bhupaP && bhupaP.name) {
              repName = bhupaP.name;
              if (bhupaP.phone) repPhone = bhupaP.phone;
            }
          }
          if (!repName || repName === 'Siti') {
            const matchedKader = (currentUsers || []).find(u => u.role === 'KADER' && (String(u.id) === String(c.reporter_id) || (u.village_id && String(u.village_id) === String(c.village_id))));
            if (matchedKader) {
              repName = matchedKader.name;
              if (matchedKader.phone) repPhone = matchedKader.phone;
            }
          }
          const reporterName = cleanRoleAccountName(repName || "Kader Jiwa");
          const reporterPhone = repPhone || '-';
          const cleanRepPhone = reporterPhone.replace(/\D/g, '').replace(/^0/, '62');

          const guruName = cleanRoleAccountName((guruP && guruP.name) ? guruP.name : "Kiai H. Kholil");
          const guruPhone = (guruP && guruP.phone) ? guruP.phone : '081234567892';
          const cleanGuruPhone = guruPhone.replace(/\D/g, '').replace(/^0/, '62');
          let guruResponseText = 'Menunggu Konfirmasi';
          let guruResponseClass = 'text-slate-500';
          if (guruP && (guruP.response === 'AGREE' || guruP.response === 'SIAP' || guruP.response === 'READY')) { guruResponseText = '✓ Siap Dampingi'; guruResponseClass = 'text-emerald-700 font-bold'; }
          else if (guruP && guruP.response === 'NEED_TIME') { guruResponseText = '▲ Butuh Waktu'; guruResponseClass = 'text-amber-700 font-bold'; }

          const ratoName = cleanRoleAccountName((ratoP && ratoP.name) ? ratoP.name : 'Klebun Kokop');
          const ratoPhone = (ratoP && ratoP.phone) ? ratoP.phone : '081234567893';
          const cleanRatoPhone = ratoPhone.replace(/\D/g, '').replace(/^0/, '62');
          let ratoResponseText = 'Menunggu Linmas';
          let ratoResponseClass = 'text-slate-500';
          if (ratoP && (ratoP.response === 'READY' || ratoP.response === 'SIAP' || ratoP.response === 'AGREE')) { ratoResponseText = '✓ Siap Kawal'; ratoResponseClass = 'text-indigo-700 font-bold'; }

          return `
            <div onclick="selectCaseDetail('${c.id}')" class="p-4 rounded-2xl md:rounded-3xl border border-slate-200/90 bg-white hover:border-emerald-500 hover:shadow-md cursor-pointer transition space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    <i class="fa-solid fa-hospital-user"></i>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <h4 class="font-black text-slate-900 text-sm sm:text-base">${c.patient_name}</h4>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">${c.case_number || 'CAS-001'}</span>
                    </div>
                    <p class="text-xs text-slate-500 font-medium">${c.patient_address || c.village_name} • <span class="text-slate-700 font-semibold">${c.report_type || 'Kasus Pasung'}</span></p>
                  </div>
                </div>
                <div class="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
                  ${partnerPills}
                  ${badgeHtml}
                </div>
              </div>

              <!-- Baris Narahubung Lengkap (Bhuppa' Babhu', Ghuru, Rato) -->
              <div class="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]" onclick="event.stopPropagation()">
                <!-- Bhuppa' Babhu' -->
                <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-2xs">
                  <div class="truncate mr-1">
                    <span class="text-[9px] font-bold uppercase text-emerald-700 flex items-center gap-1 tracking-wider">
                      <img src="./assets/icons/role_bhupa.png" class="w-3.5 h-3.5 object-contain inline-block" alt="Bhuppa' Babhu'"> Bhuppa' Babhu'
                    </span>
                    <span class="font-bold text-slate-800 truncate block">${reporterName}</span>
                    <span class="text-[10px] text-slate-400 font-mono">${reporterPhone}</span>
                  </div>
                  <a href="https://wa.me/${cleanRepPhone}?text=${encodeURIComponent('Halo ' + reporterName + ', koordinasi faskes Puskesmas Kokop terkait laporan pasien ' + c.patient_name)}" target="_blank" class="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 transition shadow-xs" title="Chat WhatsApp Bhuppa' Babhu'">
                    <i class="fa-brands fa-whatsapp"></i>
                  </a>
                </div>

                <!-- Ghuru -->
                <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-2xs">
                  <div class="truncate mr-1">
                    <span class="text-[9px] font-bold uppercase text-teal-700 flex items-center gap-1 tracking-wider">
                      <img src="./assets/icons/role_bhu-ghuru.png" class="w-3.5 h-3.5 object-contain inline-block" alt="Ghuru"> Ghuru
                    </span>
                    <span class="font-bold text-slate-800 truncate block">${guruName}</span>
                    <span class="text-[10px] ${guruResponseClass} block">${guruResponseText}</span>
                  </div>
                  <a href="https://wa.me/${cleanGuruPhone}?text=${encodeURIComponent('Assalamualaikum ' + guruName + ', koordinasi pendekatan rembuk santun pasien ' + c.patient_name + ' dari Puskesmas Kokop')}" target="_blank" class="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 transition shadow-xs" title="Chat WhatsApp Ghuru">
                    <i class="fa-brands fa-whatsapp"></i>
                  </a>
                </div>

                <!-- Rato -->
                <div class="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-2xs">
                  <div class="truncate mr-1">
                    <span class="text-[9px] font-bold uppercase text-indigo-700 flex items-center gap-1 tracking-wider">
                      <img src="./assets/icons/role_rato.png" class="w-3.5 h-3.5 object-contain inline-block" alt="Rato"> Rato
                    </span>
                    <span class="font-bold text-slate-800 truncate block">${ratoName}</span>
                    <span class="text-[10px] ${ratoResponseClass} block">${ratoResponseText}</span>
                  </div>
                  <a href="https://wa.me/${cleanRatoPhone}?text=${encodeURIComponent('Halo ' + ratoName + ', koordinasi pengamanan evakuasi pasien ' + c.patient_name + ' dari Puskesmas Kokop')}" target="_blank" class="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center text-xs shrink-0 transition shadow-xs" title="Chat WhatsApp Rato">
                    <i class="fa-brands fa-whatsapp"></i>
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      if (!actionItemsHtml) {
        container.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Tidak ada kasus yang membutuhkan aksi saat ini.</p>`;
      } else {
        container.innerHTML = actionItemsHtml;
      }

      // 3. Render Peta Interaktif Leaflet.js
      setTimeout(initOrUpdateLeafletMap, 50);
    }

    // Inisialisasi / Sinkronisasi Peta Interaktif Leaflet (Desa Kokop)
    let leafletMapInstance = null;
    let leafletMarkerGroup = null;
    let activeMapCategoryFilter = 'ALL';

    export function setMapCategoryFilter(category) {
      activeMapCategoryFilter = category;
      const categories = ['ALL', 'EVAC_NEEDED', 'COORDINATION', 'READY_EVAC', 'MONITORING', 'FASKES'];
      categories.forEach(c => {
        const btn = document.getElementById(`mapFilter_${c}`);
        if (!btn) return;
        if (c === category) {
          btn.className = 'px-3 py-1.5 rounded-xl font-bold bg-[#145861] text-white shadow-xs transition shrink-0 flex items-center gap-1.5';
        } else {
          btn.className = 'px-3 py-1.5 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0 flex items-center gap-1.5';
        }
      });
      initOrUpdateLeafletMap();
    }

    // Logika Peta Spasial Leaflet Puskesmas Kokop & Marker Kasus telah diekstrak ke
    // src/features/nakes/map-controller.js (ES6 Module) dan tersedia via window.NakesMap

    // Switch Navigasi Desktop Nakes
    export function switchNakesTab(tab) {
      const allTabs = [
        'nakesSubDashboard', 'nakesSubDetailKasus', 'nakesSubValidasi',
        'nakesSubAktivasiEWS', 'nakesSubMonitoring', 'nakesSubMitra',
        'nakesSubKasus', 'nakesSubPasien', 'nakesSubEvakuasi',
        'nakesSubKontrol', 'nakesSubLaporan'
      ];
      allTabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });

      // Update active nav styling
      const navMap = {
        'dashboard': 'nakesNavDashboard',
        'kasus': 'nakesNavKasus',
        'pasien': 'nakesNavPasien',
        'mitra': 'nakesNavMitra',
        'evakuasi': 'nakesNavEvakuasi',
        'kontrol': 'nakesNavKontrol',
        'laporan': 'nakesNavLaporan'
      };

      Object.values(navMap).forEach(navId => {
        const nEl = document.getElementById(navId);
        if (nEl) {
          nEl.classList.remove('bg-teal-600/40', 'border-l-4', 'border-teal-300', 'bg-teal-800/85', 'bg-teal-700/90', 'border-teal-300/40', 'shadow-lg', 'shadow-md', 'bg-slate-950/35', 'border-white/15');
          nEl.classList.add('text-white/90', 'hover:text-white', 'hover:bg-white/10');
        }
      });

      if (navMap[tab]) {
        const activeNav = document.getElementById(navMap[tab]);
        if (activeNav) {
          activeNav.classList.remove('text-white/90', 'hover:bg-white/10', 'bg-slate-950/35', 'border-white/15');
          activeNav.classList.add('bg-teal-600/40', 'text-white', 'font-semibold', 'border-l-4', 'border-teal-300', 'shadow-sm');
        }
      }

      if (tab === 'dashboard') {
        document.getElementById('nakesSubDashboard').classList.remove('hidden');
        setTimeout(initOrUpdateLeafletMap, 50);
      }
      if (tab === 'detail') document.getElementById('nakesSubDetailKasus').classList.remove('hidden');
      if (tab === 'validasi') document.getElementById('nakesSubValidasi').classList.remove('hidden');
      if (tab === 'aktivasi_ews') document.getElementById('nakesSubAktivasiEWS').classList.remove('hidden');
      if (tab === 'monitoring') {
        document.getElementById('nakesSubMonitoring').classList.remove('hidden');
        const monCase = currentCases.find(c => c.id === activeMonitoringCaseId) || currentCases[0];
        if (monCase) {
          document.getElementById('monCaseNumber').innerText = monCase.case_number;
          updateMonitoringStepper(monCase);
          startMonitoringWatch(monCase.activated_at || null);
        }
      }
      if (tab === 'mitra') document.getElementById('nakesSubMitra').classList.remove('hidden');

      if (tab === 'kasus') {
        document.getElementById('nakesSubKasus').classList.remove('hidden');
        renderAllCasesTable();
      }
      if (tab === 'pasien') {
        document.getElementById('nakesSubPasien').classList.remove('hidden');
        renderPatientsTable();
      }
      if (tab === 'evakuasi') {
        document.getElementById('nakesSubEvakuasi').classList.remove('hidden');
        renderEvacuationCards();
      }
      if (tab === 'kontrol') {
        document.getElementById('nakesSubKontrol').classList.remove('hidden');
        renderControlSchedules();
      }
      if (tab === 'laporan') {
        document.getElementById('nakesSubLaporan').classList.remove('hidden');
        renderAllReportsTable();
      }
    }

    // =========================================================================
    // STATE PAGINATION & KONTROL TABEL (TELAH DIMODULARISASI KE table-controller.js)
    // Tersedia secara global via window.paginationState & window.renderPaginationControls
    // =========================================================================

    // -------------------------------------------------------------------------
    // 1. MODUL SEMUA KASUS & 2. BASIS DATA PASIEN (DIMODULARISASI KE table-controller.js)
    // Fungsi: changeCasesPage, changeCasesPerPage, handleCasesFilterSort, renderAllCasesTable,
    //         changePatientsPage, changePatientsPerPage, handlePatientsFilterSort, renderPatientsTable
    // Tersedia secara global melalui window bridge di table-controller.js.
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // 3. MODUL EVAKUASI AKTIF
    // -------------------------------------------------------------------------
    export function renderEvacuationCards() {
      const container = document.getElementById('evacuationCardsContainer');
      if (!container) return;
      const evacs = currentCases.filter(c => c.status === 'READY_FOR_EVACUATION' || c.status === 'EVACUATION' || c.status === 'SIAGA');
      if (evacs.length === 0) {
        container.innerHTML = `<div class="col-span-2 p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">Tidak ada jadwal evakuasi yang aktif saat ini.</div>`;
        return;
      }
      container.innerHTML = evacs.map(c => `
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div class="flex justify-between items-start border-b pb-3">
            <div>
              <span class="font-mono text-xs font-bold text-slate-400">${c.case_number}</span>
              <h3 class="font-bold text-base text-slate-900">${c.patient_name}</h3>
              <p class="text-xs text-slate-500">${c.patient_address || c.village_name}</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold ${c.status === 'EVACUATION' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}">
              ${formatStatusIndo(c.status)}
            </span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Didampingi oleh pilar <strong>Bhu' Ghuru</strong> dan <strong>Rato</strong> setempat. Ambulans siaga dari Puskesmas Kokop.
          </p>
          <div class="flex space-x-2 pt-1">
            <button onclick="selectCaseDetail('${c.id}')" class="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center">
              <i class="fa-solid fa-truck-medical mr-1.5"></i> Buka Monitoring Evakuasi
            </button>
          </div>
        </div>
      `).join('');
    }


    // MODAL REMINDER WHATSAPP OTOMATIS
    // =========================================================================
    export function openReminderWaModal() {
      const modal = document.getElementById('modalReminderWa');
      const listContainer = document.getElementById('reminderWaPatientList');
      if (!modal || !listContainer) return;

      const activePatients = currentCases.filter(c => c.status !== 'CLOSED');
      if (activePatients.length === 0) {
        listContainer.innerHTML = `
          <div class="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <i class="fa-regular fa-bell-slash text-2xl mb-2 text-slate-300 block"></i>
            Tidak ada pasien yang membutuhkan reminder kontrol saat ini. Semua kasus telah berstatus selesai.
          </div>
        `;
      } else {
        listContainer.innerHTML = activePatients.map(c => {
          const kader = currentUsers.find(u => u.role === 'KADER' && String(u.village_id) === String(c.village_id)) || currentUsers.find(u => u.role === 'KADER');
          const kaderPhone = kader ? (kader.phone || '081234567891') : (c.reporter_phone || '081234567891');
          const famPhone = c.family_phone || '081987654321';
          const history = Array.isArray(c.control_history) ? c.control_history : [];
          const lastVisit = history.length > 0 ? history[history.length - 1] : null;
          const compliance = lastVisit ? lastVisit.compliance : (c.drug_compliance || 'RUTIN');

          return `
            <div class="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 text-xs space-y-3 transition">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">${c.patient_name}</h4>
                  <p class="text-[11px] text-slate-500">${c.village_name || 'Desa Kokop'} • ${c.case_number || ''}</p>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    compliance === 'PUTUS_OBAT' ? 'bg-rose-100 text-rose-700' :
                    compliance === 'PERLU_PERHATIAN' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }">
                    ${formatComplianceIndo(compliance)}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    ${formatStatusIndo(c.status)}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <button type="button" onclick="sendDirectWaReminder('keluarga', '${c.id}')"
                  class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-xs">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                  <span>WA Keluarga (${famPhone})</span>
                </button>
                <button type="button" onclick="sendDirectWaReminder('kader', '${c.id}')"
                  class="w-full px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-xs">
                  <i class="fa-brands fa-whatsapp text-sm"></i>
                  <span>WA Kader (${cleanRoleAccountName(kader ? kader.name : 'Bhuppa\' Babhu\'')})</span>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }

      modal.classList.remove('hidden');
    }

    export function closeReminderWaModal() {
      const modal = document.getElementById('modalReminderWa');
      if (modal) modal.classList.add('hidden');
    }

    export function sendDirectWaReminder(targetRole, caseId) {
      const targetCase = currentCases.find(c => c.id === caseId);
      if (!targetCase) return;
      activeDrugMonitoringCase = targetCase;
      sendTargetedDrugReminder(targetRole);
    }

    // =========================================================================
    // MODAL BASIS DATA PASIEN ODGJ (CRUD LENGKAP NAKES)
    // =========================================================================
    export function openAddPatientModal() {
      const form = document.getElementById('formPatientData');
      if (form) form.reset();

      document.getElementById('patientFormCaseId').value = '';
      document.getElementById('patientFormTitle').innerText = 'Tambah Data Pasien Baru';
      document.getElementById('patientFormSubmitText').innerText = 'Simpan Data Pasien';
      const icon = document.getElementById('patientFormHeaderIcon');
      if (icon) icon.className = 'fa-solid fa-user-plus';

      const modal = document.getElementById('modalPatientForm');
      if (modal) modal.classList.remove('hidden');
    }



// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.updateNakesCounters = updateNakesCounters;
  window.updateRoleMetricCounters = updateRoleMetricCounters;
  window.renderNakesDashboardCases = renderNakesDashboardCases;
  window.setMapCategoryFilter = setMapCategoryFilter;
  window.switchNakesTab = switchNakesTab;
  window.renderEvacuationCards = renderEvacuationCards;
  window.openReminderWaModal = openReminderWaModal;
  window.closeReminderWaModal = closeReminderWaModal;
  window.sendDirectWaReminder = sendDirectWaReminder;
  window.openAddPatientModal = openAddPatientModal;

  window.NakesView = {
    updateNakesCounters,
    updateRoleMetricCounters,
    renderNakesDashboardCases,
    setMapCategoryFilter,
    switchNakesTab,
    renderEvacuationCards,
    openReminderWaModal,
    closeReminderWaModal,
    sendDirectWaReminder,
    openAddPatientModal
  };
}
