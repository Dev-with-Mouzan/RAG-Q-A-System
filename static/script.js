const form = document.getElementById('queryForm');
const input = document.getElementById('queryText');
const sendBtn = document.getElementById('sendBtn');
const messages = document.getElementById('messages');
const statusBadge = document.getElementById('statusBadge');
const pdfFile = document.getElementById('pdfFile');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const uploadZone = document.getElementById('uploadZone');
const emptyState = document.getElementById('emptyState');
const scrollBottom = document.getElementById('scrollBottom');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');

let fileAttached = null;
let currentConvId = null;
let isLoadingMessages = false;

// ─── Helpers ───
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Auto-resize textarea ───
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});

// ─── Enter to send, Shift+Enter for newline ───
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

// ─── Update send button state ───
function updateSendBtn() {
  sendBtn.disabled = !input.value.trim() || !fileAttached;
}

input.addEventListener('input', updateSendBtn);

// ─── Scroll to bottom ───
function scrollToBottom(smooth = true) {
  messages.scrollTo({ top: messages.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
}

messages.addEventListener('scroll', () => {
  const dist = messages.scrollHeight - messages.scrollTop - messages.clientHeight;
  scrollBottom.classList.toggle('visible', dist > 120);
});

scrollBottom.addEventListener('click', () => scrollToBottom());

// ─── Toggle empty state ───
function toggleEmptyState() {
  const hasMessages = messages.querySelectorAll('.message:not(#typingMessage)').length > 0;
  emptyState.style.display = hasMessages ? 'none' : 'flex';
}

// ─── File upload ───
pdfFile.addEventListener('change', handleFileSelect);

function handleFileSelect(e) {
  const f = pdfFile.files[0];
  if (!f) return;
  fileAttached = f;
  fileName.textContent = f.name;
  fileSize.textContent = formatSize(f.size);
  uploadZone.classList.add('file-loaded');
  uploadZone.style.borderColor = '';
  updateSendBtn();
}

// ─── Drag & drop on upload zone ───
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f && f.type === 'application/pdf') {
    pdfFile.files = e.dataTransfer.files;
    handleFileSelect();
  }
});

// ─── Simple Markdown renderer ───
function renderMarkdown(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  return html;
}

// ─── Add message ───
function addMessage(role, content, extraClass = '') {
  const avatarSvg = role === 'assistant'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  const time = getTime();
  const copyBtn = role === 'assistant'
    ? '<button class="copy-btn" onclick="copyMessage(this)" aria-label="Copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>'
    : '';

  const div = document.createElement('div');
  div.className = `message ${role}${extraClass ? ' ' + extraClass : ''}`;
  div.innerHTML = `
    <div class="avatar">${avatarSvg}</div>
    <div class="bubble${extraClass ? ' ' + extraClass : ''}">
      ${copyBtn}
      ${renderMarkdown(content)}
      <div class="message-time">${time}</div>
    </div>
  `;
  messages.appendChild(div);
  toggleEmptyState();
  scrollToBottom();
  return div;
}

// ─── Copy message content ───
function copyMessage(btn) {
  const bubble = btn.closest('.bubble');
  const timeEl = bubble.querySelector('.message-time');
  const cleanText = bubble.innerText.replace(timeEl ? timeEl.innerText : '', '').replace('Copy', '').trim();
  navigator.clipboard.writeText(cleanText).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 2000);
  });
}

// ─── Show typing ───
function showTyping() {
  const div = document.createElement('div');
  div.className = 'message assistant';
  div.id = 'typingMessage';
  div.innerHTML = `
    <div class="avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
    <div class="bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
  `;
  messages.appendChild(div);
  scrollToBottom();
}

function removeTyping() {
  const el = document.getElementById('typingMessage');
  if (el) el.remove();
}

// ─── Set status ───
function setStatus(state) {
  statusBadge.className = 'status-badge';
  if (state === 'ready') {
    statusBadge.innerHTML = '<span class="status-dot"></span> Ready';
  } else if (state === 'busy') {
    statusBadge.className = 'status-badge busy';
    statusBadge.innerHTML = '<span class="status-dot"></span> Processing';
  } else if (state === 'error') {
    statusBadge.className = 'status-badge error';
    statusBadge.innerHTML = '<span class="status-dot"></span> Error';
  }
}

// ─── Conversation list ───
async function loadConversations() {
  try {
    const res = await fetch('/api/conversations');
    const list = await res.json();
    renderConversationList(list);
  } catch {}
}

function renderConversationList(list) {
  chatList.innerHTML = '';
  list.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'chat-list-item' + (conv.id === currentConvId ? ' active' : '');
    item.dataset.id = conv.id;
    item.innerHTML = `
      <div class="chat-dot ${conv.message_count > 0 ? '' : 'inactive'}"></div>
      <div class="chat-info">
        <div class="chat-title">${escapeHtml(conv.title)}</div>
        <div class="chat-meta">${conv.message_count || 0} messages · ${formatDate(conv.updated_at)}</div>
      </div>
      <button class="chat-del" onclick="event.stopPropagation(); deleteConversation(${conv.id})" aria-label="Delete">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    `;
    item.addEventListener('click', () => switchConversation(conv.id));
    chatList.appendChild(item);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── Switch conversation ───
async function switchConversation(convId) {
  if (isLoadingMessages) return;
  isLoadingMessages = true;

  currentConvId = convId;
  messages.querySelectorAll('.message').forEach(el => el.remove());
  toggleEmptyState();
  setStatus('busy');

  try {
    const [convRes, msgRes] = await Promise.all([
      fetch(`/api/conversations/${convId}`),
      fetch(`/api/conversations/${convId}/messages`),
    ]);
    const conv = await convRes.json();
    const msgs = await msgRes.json();

    // Restore PDF reference — file is still on server, no re-upload needed
    pdfFile.value = '';
    if (conv.pdf_name) {
      fileAttached = conv.pdf_name;
      fileName.textContent = conv.pdf_name;
      fileSize.textContent = '';
      uploadZone.classList.add('file-loaded');
    } else {
      fileAttached = null;
      fileName.textContent = 'Upload PDF';
      fileSize.textContent = '';
      uploadZone.classList.remove('file-loaded');
    }

    msgs.forEach(m => addMessage(m.role, m.content));
    setStatus('ready');
  } catch {
    setStatus('error');
  }

  updateSendBtn();
  loadConversations();
  isLoadingMessages = false;
}

// ─── Delete conversation ───
async function deleteConversation(convId) {
  try {
    await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
    if (currentConvId === convId) {
      currentConvId = null;
      fileAttached = null;
      pdfFile.value = '';
      fileName.textContent = 'Upload PDF';
      fileSize.textContent = '';
      uploadZone.classList.remove('file-loaded');
      messages.querySelectorAll('.message').forEach(el => el.remove());
      toggleEmptyState();
    }
    loadConversations();
  } catch {}
}

// ─── New Chat ───
newChatBtn.addEventListener('click', async () => {
  currentConvId = null;
  fileAttached = null;
  pdfFile.value = '';
  fileName.textContent = 'Upload PDF';
  fileSize.textContent = '';
  uploadZone.classList.remove('file-loaded');
  messages.querySelectorAll('.message').forEach(el => el.remove());
  toggleEmptyState();
  setStatus('ready');
  input.value = '';
  input.style.height = 'auto';
  updateSendBtn();
  loadConversations();
});

// ─── Submit ───
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  if (!fileAttached) {
    addMessage('assistant', 'Please upload a PDF file first.');
    return;
  }

  addMessage('user', query);
  input.value = '';
  input.style.height = 'auto';
  updateSendBtn();

  showTyping();
  setStatus('busy');
  sendBtn.disabled = true;

  const formData = new FormData();
  formData.append('query', query);
  if (typeof fileAttached === 'string') {
    formData.append('pdf_name', fileAttached);
  } else {
    formData.append('file', fileAttached);
  }
  if (currentConvId) {
    formData.append('conversation_id', currentConvId);
  }

  try {
    const res = await fetch('/query', { method: 'POST', body: formData });
    const data = await res.json();

    removeTyping();

    if (!res.ok) {
      addMessage('assistant', `**Error:** ${data.detail || 'Something went wrong.'}`, 'error');
      setStatus('error');
      return;
    }

    // Store conversation id from server
    currentConvId = data.conversation_id;

    addMessage('assistant', data.response || 'No answer generated.');
    setStatus('ready');
    loadConversations();
  } catch (err) {
    removeTyping();
    addMessage('assistant', `**Error:** ${err.message}`, 'error');
    setStatus('error');
  } finally {
    sendBtn.disabled = false;
  }
});

// ─── Init ───
toggleEmptyState();
updateSendBtn();
loadConversations();
