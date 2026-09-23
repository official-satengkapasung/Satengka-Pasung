/**
 * SATENGKA PASUNG EWS — Table & Pagination Controller (ES6 Module)
 * Mengelola state paginasi, pencarian, filter, dan perender kontrol halaman tabel data faskes.
 */

export const paginationState = {
  cases: { page: 1, perPage: 10, query: '', status: '', priority: '', sort: 'priority_desc' },
  patients: { page: 1, perPage: 10, query: '', village: '', status: '', sort: 'latest' },
  kontrol: { page: 1, perPage: 5, query: '', compliance: '', sort: 'name_asc' },
  reports: { page: 1, perPage: 10, query: '', status: '', sort: 'latest' },
  kaderStatus: { page: 1, perPage: 6 },
  guruRequests: { page: 1, perPage: 4, query: '' },
  guruRiwayat: { page: 1, perPage: 4, query: '' },
  ratoRequests: { page: 1, perPage: 4, query: '' },
  ratoRiwayat: { page: 1, perPage: 4, query: '' }
};

/**
 * Render kontrol pagination HTML terpadu untuk semua tabel faskes.
 * @param {Object} options 
 */
export function renderPaginationControls({
  containerId,
  totalItems,
  currentPage,
  perPage,
  onPageChangeName,
  entityName = 'data'
}) {
  if (typeof document === 'undefined') return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endIdx = Math.min(currentPage * perPage, totalItems);

  if (totalItems === 0) {
    container.innerHTML = '';
    return;
  }

  let pageButtons = '';
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const isActive = i === currentPage;
      pageButtons += `
        <button type="button" onclick="${onPageChangeName}(${i})"
          class="w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
            isActive
              ? 'bg-[#145861] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }">
          ${i}
        </button>
      `;
    } else if (
      (i === currentPage - 2 && i > 1) ||
      (i === currentPage + 2 && i < totalPages)
    ) {
      pageButtons += `<span class="w-5 text-center text-slate-400 text-xs font-bold">...</span>`;
    }
  }

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 rounded-b-3xl">
      <div class="font-medium">
        Menampilkan <span class="font-bold text-slate-900">${startIdx}</span> - <span class="font-bold text-slate-900">${endIdx}</span> dari <span class="font-bold text-slate-900">${totalItems}</span> ${entityName}
      </div>
      <div class="flex items-center space-x-1.5">
        <button type="button" onclick="${onPageChangeName}(${Math.max(1, currentPage - 1)})"
          ${currentPage === 1 ? 'disabled' : ''}
          class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1">
          <i class="fa-solid fa-chevron-left text-[9px]"></i>
          <span>Sebelumnya</span>
        </button>
        <div class="flex items-center space-x-1">
          ${pageButtons}
        </div>
        <button type="button" onclick="${onPageChangeName}(${Math.min(totalPages, currentPage + 1)})"
          ${currentPage === totalPages ? 'disabled' : ''}
          class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1">
          <span>Selanjutnya</span>
          <i class="fa-solid fa-chevron-right text-[9px]"></i>
        </button>
      </div>
    </div>
  `;
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.paginationState = paginationState;
  window.renderPaginationControls = renderPaginationControls;
}
