/**
 * SATENGKA PASUNG EWS — Realtime Therapeutic Chat Module (ES6 Module)
 * Mengelola ruang obrolan musyawarah terapeutik lintas 4-Pilar (Nakes, Ghuru, Rato, Bhuppa' Babhu').
 */

let chatPollInterval = null;
let chatUnsubscribe = null;
let cachedChatMessages = [];
let selectedChatCaseId = null;

export function populateChatCaseSelector(targetCaseId = null) {
  if (typeof document === 'undefined') return;
  const select = document.getElementById('chatCaseSelector');
  if (!select) return;

  const currentCases = window.currentCases || [];

  if (currentCases.length === 0) {
    select.innerHTML = `<option value="">Semua Kasus Terpadu</option>`;
    return;
  }

  select.innerHTML = currentCases.map(c => `
    <option value="${c.id}" ${targetCaseId && targetCaseId == c.id ? 'selected' : ''}>
      ${c.patient_name} (${c.village_name || 'Desa Kokop'}) - ${c.case_number}
    </option>
  `).join('');

  if (targetCaseId) {
    select.value = targetCaseId;
  }
  onChatCaseChanged();
}

export function onChatCaseChanged() {
  if (typeof document === 'undefined') return;
  const select = document.getElementById('chatCaseSelector');
  const currentCases = window.currentCases || [];
  const rawVal = select ? select.value : null;
  const val = rawVal && !isNaN(Number(rawVal)) ? Number(rawVal) : rawVal;
  selectedChatCaseId = val || (currentCases.length > 0 ? currentCases[0].id : null);
  window.selectedChatCaseId = selectedChatCaseId;

  const targetCase = currentCases.find(c => String(c.id) === String(selectedChatCaseId) || c.case_number === selectedChatCaseId);
  const caseBadge = document.getElementById('chatTargetCaseNumber');
  if (caseBadge) {
    caseBadge.innerText = targetCase ? `#${targetCase.case_number}` : 'Umum / Terbuka';
  }

  fetchTherapeuticChats();
}

export async function openTherapeuticChatModal(targetCaseId = null) {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalTherapeuticChat');
  if (!modal) return;
  modal.classList.remove('hidden');

  const currentCases = window.currentCases || [];
  const activeSelectedCase = window.activeSelectedCase;
  const currentUser = window.currentUser;

  if (currentCases.length === 0 && window.fetchCases) {
    await window.fetchCases();
  }

  let chosenId = targetCaseId;
  if (!chosenId && activeSelectedCase) {
    chosenId = activeSelectedCase.id;
  } else if (!chosenId && currentCases.length > 0) {
    chosenId = currentCases[0].id;
  }
  selectedChatCaseId = chosenId;
  window.selectedChatCaseId = selectedChatCaseId;

  populateChatCaseSelector(chosenId);

  const badge = document.getElementById('chatSenderRoleBadge');
  if (badge && currentUser) {
    const roleLabels = {
      'NAKES': 'Nakes',
      'GURU': "Ghuru",
      'RATO': "Rato",
      'KADER': "Bhuppa' Babhu'",
      'ADMIN': 'Admin'
    };
    const cleanRole = window.cleanRoleAccountName || (n => n);
    const cleanCurrentName = cleanRole(currentUser.name || roleLabels[currentUser.role] || 'Pengguna');
    badge.innerHTML = `Mengirim sebagai: <strong class="text-emerald-800">${cleanCurrentName}</strong> • <span class="text-emerald-600 font-semibold">${roleLabels[currentUser.role] || currentUser.role}</span>`;
  }

  if (window.firebaseAdapter && window.firebaseAdapter.isFirebaseActive) {
    if (chatUnsubscribe) chatUnsubscribe();
    chatUnsubscribe = window.firebaseAdapter.subscribeTherapeuticChat(selectedChatCaseId, (messages) => {
      cachedChatMessages = messages;
      renderTherapeuticChatMessages(cachedChatMessages);
    });
  } else {
    fetchTherapeuticChats();
  }
}

export function closeTherapeuticChatModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modalTherapeuticChat');
  if (modal) modal.classList.add('hidden');
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
    chatPollInterval = null;
  }
}

export function useChatTemplate(text) {
  if (typeof document === 'undefined') return;
  const input = document.getElementById('therapeuticChatInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}

export async function fetchTherapeuticChats(isManual = false) {
  if (typeof document === 'undefined') return;
  const icon = document.getElementById('iconSyncTherapeuticChat');
  if (icon && isManual) {
    icon.classList.add('fa-spin');
  }

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.getTherapeuticChats && selectedChatCaseId) {
      const res = await window.firebaseAdapter.getTherapeuticChats(selectedChatCaseId);
      if (res && res.success && Array.isArray(res.data)) {
        cachedChatMessages = res.data;
        renderTherapeuticChatMessages(cachedChatMessages);
      }
    } else {
      const chats = JSON.parse(localStorage.getItem('malekkas_chats') || '{}');
      cachedChatMessages = chats[String(selectedChatCaseId)] || [];
      renderTherapeuticChatMessages(cachedChatMessages);
    }

    if (window.firebaseAdapter && window.firebaseAdapter.subscribeTherapeuticChat && selectedChatCaseId) {
      if (chatUnsubscribe) chatUnsubscribe();
      chatUnsubscribe = window.firebaseAdapter.subscribeTherapeuticChat(selectedChatCaseId, (messages) => {
        cachedChatMessages = messages;
        renderTherapeuticChatMessages(cachedChatMessages);
      });
    }

    if (isManual && window.showToast) {
      window.showToast('Pesan obrolan berhasil disinkronkan.');
    }
  } catch (err) {
    console.warn('Sync chat error:', err);
  } finally {
    if (icon && isManual) {
      setTimeout(() => {
        icon.classList.remove('fa-spin');
      }, 600);
    }
  }
}

export function renderTherapeuticChatMessages(messages) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('therapeuticChatMessagesArea');
  if (!container) return;

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-400">
        <i class="fa-regular fa-comment-dots text-2xl mb-2 text-emerald-600 block"></i>
        <p>Belum ada percakapan untuk kasus ini. Mulai obrolan terapeutik dengan santun dan berempati.</p>
      </div>
    `;
    return;
  }

  const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
  const currentUser = window.currentUser;
  const escape = window.escapeHtml || (s => s);
  const cleanRole = window.cleanRoleAccountName || (n => n);

  container.innerHTML = messages.map(msg => {
    const isMe = currentUser && (msg.sender_id == currentUser.id || msg.sender_role === currentUser.role);

    let roleBadge = '';
    if (msg.sender_role === 'NAKES') {
      roleBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 inline-flex items-center gap-1"><img src="./assets/icons/role_nakes.png" class="w-3 h-3 object-contain"> NAKES</span>';
    } else if (msg.sender_role === 'GURU') {
      roleBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-[#145861] inline-flex items-center gap-1"><img src="./assets/icons/role_bhu-ghuru.png" class="w-3 h-3 object-contain"> GHURU</span>';
    } else if (msg.sender_role === 'RATO') {
      roleBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 inline-flex items-center gap-1"><img src="./assets/icons/role_rato.png" class="w-3 h-3 object-contain"> RATO</span>';
    } else {
      roleBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1"><img src="./assets/icons/role_bhupa.png" class="w-3 h-3 object-contain"> BHUPPA\' BABHU\'</span>';
    }

    const safeName = escape(cleanRole(msg.sender_name));
    const safeMessage = escape(msg.message);

    return `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
        <div class="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
          <span class="font-bold ${isMe ? 'text-emerald-800' : 'text-slate-700'}">${safeName}</span>
          ${roleBadge}
          <span class="font-mono text-[9px]">${msg.time_formatted || ''}</span>
        </div>
        <div class="max-w-[85%] p-3 rounded-2xl ${isMe
        ? 'bg-emerald-700 text-white rounded-tr-none shadow-sm'
        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
      }">
          <p class="leading-relaxed whitespace-pre-wrap">${safeMessage}</p>
          ${msg.is_therapeutic_template == 1 ? `
            <div class="mt-1.5 pt-1.5 border-t ${isMe ? 'border-emerald-600/60 text-emerald-200' : 'border-slate-100 text-slate-400'} text-[9px] flex items-center space-x-1">
              <i class="fa-solid fa-heart-pulse"></i>
              <span>Pesan Pendekatan Terapeutik</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (isAtBottom) {
    container.scrollTop = container.scrollHeight;
  }
}

export async function handleSendTherapeuticChat(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof document === 'undefined') return;

  const input = document.getElementById('therapeuticChatInput');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  const btn = document.getElementById('btnSendTherapeuticChat');
  if (btn) btn.disabled = true;

  const activeSelectedCase = window.activeSelectedCase;
  const currentCases = window.currentCases || [];
  const currentUser = window.currentUser;
  const cleanRole = window.cleanRoleAccountName || (n => n);

  const caseId = selectedChatCaseId || (activeSelectedCase ? activeSelectedCase.id : (currentCases.length > 0 ? currentCases[0].id : 1));
  const senderId = currentUser ? currentUser.id : 1;
  const senderName = cleanRole(currentUser ? currentUser.name : 'Pengguna Faskes');
  const senderRole = currentUser ? currentUser.role : 'NAKES';

  // Optimistic Message Object
  const optimisticId = 'msg_' + Date.now();
  const timeFormatted = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const newMsg = {
    id: optimisticId,
    case_id: String(caseId),
    sender_id: senderId,
    sender_name: senderName,
    sender_role: senderRole,
    message: text,
    time_formatted: timeFormatted,
    timestamp: Date.now(),
    is_therapeutic_template: (text.includes('Hallo') || text.includes('Assalamu') || text.includes('Rembuk') || text.includes('Kiai') || text.includes('restu') || text.includes('keluarga')) ? 1 : 0
  };

  // 1. Optimistic Render ke Layar Seketika
  cachedChatMessages.push(newMsg);
  renderTherapeuticChatMessages(cachedChatMessages);
  if (input) input.value = '';
  
  const area = document.getElementById('therapeuticChatMessagesArea');
  if (area) {
    setTimeout(() => { area.scrollTop = area.scrollHeight; }, 10);
  }

  try {
    if (window.firebaseAdapter && window.firebaseAdapter.sendRealtimeMessage) {
      await window.firebaseAdapter.sendRealtimeMessage(caseId, newMsg);
    } else {
      const chats = JSON.parse(localStorage.getItem('malekkas_chats') || '{}');
      const cKey = String(caseId);
      if (!chats[cKey]) chats[cKey] = [];
      chats[cKey].push(newMsg);
      localStorage.setItem('malekkas_chats', JSON.stringify(chats));
    }
  } catch (err) {
    console.error("Gagal kirim pesan:", err);
    // Tampilkan notifikasi jika benar-benar gagal
    if (window.showToast) {
      window.showToast("Gagal menyinkronkan pesan ke cloud: " + (err.message || "Koneksi offline"), "error");
    }
  } finally {
    if (btn) btn.disabled = false;
    if (input) input.focus();
  }
}

// 🛡️ Global Scope Preservation (Window Bridge)
if (typeof window !== 'undefined') {
  window.populateChatCaseSelector = populateChatCaseSelector;
  window.onChatCaseChanged = onChatCaseChanged;
  window.openTherapeuticChatModal = openTherapeuticChatModal;
  window.closeTherapeuticChatModal = closeTherapeuticChatModal;
  window.useChatTemplate = useChatTemplate;
  window.fetchTherapeuticChats = fetchTherapeuticChats;
  window.renderTherapeuticChatMessages = renderTherapeuticChatMessages;
  window.handleSendTherapeuticChat = handleSendTherapeuticChat;
}
