/**
 * SATENGKA PASUNG EWS — Nakes Dashboard & Case Controller (ES6 Module)
 * Mengelola kartu antrian aksi cepat, banner laporan baru, dan counter metrik faskes.
 */

import { cleanRoleAccountName } from '../../utils/formatters.js';

/**
 * Memperbarui counter statistik kasus pada dashboard Nakes/Admin.
 * @param {Array} cases 
 * @param {Array} reports 
 */
export function updateNakesCounters(cases = [], reports = []) {
  if (typeof document === 'undefined') return;

  const currentReports = reports || (typeof window !== 'undefined' ? window.currentReports : []) || [];
  const currentCases = cases || (typeof window !== 'undefined' ? window.currentCases : []) || [];

  const newReportsCount = currentReports.filter(r => r.status === 'NEW').length;
  const siagaCount = currentCases.filter(c => c.status === 'SIAGA' || c.status === 'REPORTED').length + newReportsCount;
  const koordinasiCount = currentCases.filter(c => c.status === 'COORDINATION' || c.status === 'READY_FOR_EVACUATION').length;
  const selesaiCount = currentCases.filter(c => c.status === 'MONITORING' || c.status === 'CLOSED').length;

  const statEvak = document.getElementById('statButuhEvakuasi');
  if (statEvak) statEvak.innerText = siagaCount;
  const statKoord = document.getElementById('statSedangKoordinasi');
  if (statKoord) statKoord.innerText = koordinasiCount;
  const statDone = document.getElementById('statSelesai');
  if (statDone) statDone.innerText = selesaiCount;
  const statTotal = document.getElementById('statTotalKasus');
  if (statTotal) statTotal.innerText = currentCases.length + newReportsCount;

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

/**
 * Memperbarui metrik KPI untuk Kader, Ghuru, dan Rato'.
 * @param {Object} currentUser 
 * @param {Array} currentCases 
 * @param {Array} currentReports 
 */
export function updateRoleMetricCounters(currentUser, currentCases = [], currentReports = []) {
  if (typeof document === 'undefined' || !currentUser) return;

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

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.NakesView = {
    updateNakesCounters,
    updateRoleMetricCounters
  };
}
