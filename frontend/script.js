// ══════════════════════════════════════════════
// RAGFlow Application Script
// Cosmic Deep-Tech Edition
// ══════════════════════════════════════════════

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ── Detect reduced motion preference ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ══════════════════════════════════════════════
// STARFIELD BACKGROUND (canvas particle system)
// ══════════════════════════════════════════════

function initStarfield() {
  const canvas = $('#starfield');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  let stars = [];
  let meteors = [];
  const pointer = { x: 0.5, y: 0.5 };
  let running = true;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars();
  }

  function buildStars() {
    // Density scales with viewport area, capped for perf
    const count = Math.min(Math.floor((W * H) / 9000), 220);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.9 + 0.25,
        depth: Math.random() * 0.8 + 0.2,
        hue: Math.random() > 0.85 ? 'teal' : 'white'
      });
    }
  }

  function spawnMeteor() {
    if (meteors.length >= 2) return;
    const startX = Math.random() * W * 0.7 + W * 0.2;
    meteors.push({
      x: startX,
      y: -20,
      vx: -(Math.random() * 3 + 4),
      vy: Math.random() * 2 + 3,
      life: 1,
      len: Math.random() * 80 + 60
    });
  }

  function draw(t) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    // Parallax offset derived from pointer position
    const px = (pointer.x - 0.5) * 24;
    const py = (pointer.y - 0.5) * 16;

    for (const s of stars) {
      const twinkle = s.baseAlpha * (0.6 + 0.4 * Math.sin(t * 0.001 * s.speed + s.phase));
      const ox = px * s.depth;
      const oy = py * s.depth;

      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
      if (s.hue === 'teal') {
        ctx.fillStyle = 'rgba(94, 234, 212, ' + twinkle.toFixed(3) + ')';
      } else {
        ctx.fillStyle = 'rgba(226, 236, 250, ' + twinkle.toFixed(3) + ')';
      }
      ctx.fill();
    }

    // Meteors — rare, subtle streaks
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= 0.008;

      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * (m.len / 5), m.y - m.vy * (m.len / 5));
      grad.addColorStop(0, 'rgba(94, 234, 212, ' + (0.7 * m.life).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(94, 234, 212, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * (m.len / 5), m.y - m.vy * (m.len / 5));
      ctx.stroke();

      if (m.life <= 0 || m.x < -100 || m.y > H + 100) meteors.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', e => {
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = e.clientY / window.innerHeight;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else {
      running = true;
      requestAnimationFrame(draw);
    }
  });

  resize();
  requestAnimationFrame(draw);

  if (!prefersReducedMotion) {
    setInterval(() => {
      if (!document.hidden && Math.random() < 0.35) spawnMeteor();
    }, 6000);
  }
}

// ══════════════════════════════════════════════
// 3D TILT CARDS (pointer-driven, transform only)
// ══════════════════════════════════════════════

function initTiltCards() {
  if (prefersReducedMotion) return;

  $$('.tilt-card').forEach(card => {
    let raf = null;
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;

    function animate() {
      curRX += (targetRX - curRX) * 0.12;
      curRY += (targetRY - curRY) * 0.12;
      card.style.transform = 'perspective(900px) rotateX(' + curRX.toFixed(2) + 'deg) rotateY(' + curRY.toFixed(2) + 'deg)';
      if (Math.abs(targetRX - curRX) > 0.05 || Math.abs(targetRY - curRY) > 0.05) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    }

    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
      const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      targetRX = rx;
      targetRY = ry;
      if (!raf) raf = requestAnimationFrame(animate);
    });

    card.addEventListener('pointerleave', () => {
      targetRX = 0;
      targetRY = 0;
      if (!raf) raf = requestAnimationFrame(animate);
    });
  });
}

// ══════════════════════════════════════════════
// MAGNETIC BUTTONS (subtle pull toward cursor)
// ══════════════════════════════════════════════

function initMagneticButtons() {
  if (prefersReducedMotion) return;

  $$('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = 'translate(' + (dx * 0.15).toFixed(1) + 'px, ' + (dy * 0.25).toFixed(1) + 'px)';
    });

    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });
}

// ══════════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════════

const navbarNav = $('#navbarNav');
const mobileMenuBtn = $('#mobileMenuBtn');
const settingsBtn = $('#settingsBtn');
const statusIndicator = $('#statusIndicator');

// Pages map
const pages = {
  home: $('#pageHome'), pdf: $('#pagePdf'), arxiv: $('#pageArxiv'),
  semantic: $('#pageSemantic'), pubmed: $('#pagePubmed'), hybrid: $('#pageHybrid'),
  knowledge: $('#pageKnowledge'), settings: $('#pageSettings')
};

// PDF tab elements
const formPdf = $('#formPdf');
const inputPdf = $('#inputPdf');
const messagesPdf = $('#messagesPdf');
const emptyPdf = $('#emptyPdf');
const scrollPdf = $('#scrollPdf');
const pdfFile = $('#pdfFile');
const pdfUploadZone = $('#pdfUploadZone');
const pdfUploadLabel = $('#pdfUploadLabel');
const pdfUploadMeta = $('#pdfUploadMeta');

// Search tabs config
const searchTabs = {
  arxiv: { form: $('#formSearchArxiv'), input: $('#inputSearchArxiv'), results: $('#resultsArxiv'), empty: $('#emptyArxiv'), source: 'arxiv' },
  semantic: { form: $('#formSearchSemantic'), input: $('#inputSearchSemantic'), results: $('#resultsSemantic'), empty: $('#emptySemantic'), source: 'semantic_scholar' },
  pubmed: { form: $('#formSearchPubmed'), input: $('#inputSearchPubmed'), results: $('#resultsPubmed'), empty: $('#emptyPubmed'), source: 'pubmed' },
  hybrid: { form: $('#formSearchHybrid'), input: $('#inputSearchHybrid'), results: $('#resultsHybrid'), empty: $('#emptyHybrid'), source: 'hybrid' }
};

// Knowledge
const kbGrid = $('#kbGrid');
const uploadBtn = $('#uploadBtn');
const kbFileInput = $('#kbFileInput');

// Settings
const geminiKey = $('#geminiKey');
const geminiModel = $('#geminiModel');
const geminiStatus = $('#geminiStatus');
const openaiKey = $('#openaiKey');
const openaiModel = $('#openaiModel');
const openaiStatus = $('#openaiStatus');
const defaultProvider = $('#defaultProvider');
const defaultSource = $('#defaultSource');
const useGeminiBtn = $('#useGemini');
const useOpenaiBtn = $('#useOpenai');
const toastContainer = $('#toastContainer');

// State
let fileAttached = null, currentView = 'home', currentSourceType = 'user';
let settings = { geminiKey: '', geminiModel: 'gemini-2.5-flash', openaiKey: '', openaiModel: 'gpt-4o', defaultProvider: 'gemini', defaultSource: 'user', activeProvider: 'gemini' };

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(s) {
  const d = new Date(s), n = new Date(), diff = (n - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function escapeHtml(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

function renderMarkdown(t) {
  let h = escapeHtml(t);
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/### (.+)/g, '<h3>$1</h3>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\n/g, '<br>');
  return h;
}

function showToast(msg, type) {
  const t = document.createElement('div');
  t.className = 'toast ' + (type || 'info');
  t.textContent = msg;
  toastContainer.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════

function switchPage(page) {
  currentView = page;
  Object.values(pages).forEach(p => p.classList.remove('active'));
  if (pages[page]) pages[page].classList.add('active');
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.nav === page));
  navbarNav.classList.remove('open');
  window.scrollTo(0, 0);
}

$$('[data-nav]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    switchPage(el.dataset.nav);
  });
});

settingsBtn.addEventListener('click', () => switchPage('settings'));
mobileMenuBtn.addEventListener('click', () => navbarNav.classList.toggle('open'));

// ══════════════════════════════════════════════
// STATUS
// ══════════════════════════════════════════════

function setStatus(s) {
  statusIndicator.className = 'status-indicator';
  if (s === 'busy') statusIndicator.classList.add('busy');
  else if (s === 'error') statusIndicator.classList.add('error');

  const footerStatus = $('#footerStatus');
  const footerStatusText = $('#footerStatusText');
  if (footerStatus && footerStatusText) {
    footerStatus.className = 'footer-status' + (s === 'busy' ? ' busy' : s === 'error' ? ' error' : '');
    footerStatusText.textContent = s === 'busy' ? 'Processing...' : s === 'error' ? 'Something went wrong' : 'All systems ready';
  }
}

// ══════════════════════════════════════════════
// SKELETON LOADERS
// ══════════════════════════════════════════════

function showSkeletons(container, count) {
  count = count || 3;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'skeleton-msg';
    s.innerHTML = '<div class="skeleton-avatar skeleton"></div><div class="skeleton-body"><div class="skeleton-line skeleton"></div><div class="skeleton-line skeleton"></div><div class="skeleton-line skeleton"></div></div>';
    container.appendChild(s);
  }
}

function removeSkeletons(container) {
  container.querySelectorAll('.skeleton-msg').forEach(el => el.remove());
}

// ══════════════════════════════════════════════
// PDF TAB - UPLOAD
// ══════════════════════════════════════════════

pdfUploadZone.addEventListener('click', () => pdfFile.click());
pdfFile.addEventListener('change', handlePdfSelect);

pdfUploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  pdfUploadZone.classList.add('dragover');
});

pdfUploadZone.addEventListener('dragleave', () => {
  pdfUploadZone.classList.remove('dragover');
});

pdfUploadZone.addEventListener('drop', e => {
  e.preventDefault();
  pdfUploadZone.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f && f.type === 'application/pdf') {
    pdfFile.files = e.dataTransfer.files;
    handlePdfSelect();
  }
});

function handlePdfSelect() {
  const f = pdfFile.files[0];
  if (!f) return;
  fileAttached = f;
  pdfUploadLabel.textContent = f.name;
  pdfUploadMeta.textContent = (f.size / 1024).toFixed(1) + ' KB';
  pdfUploadZone.classList.add('loaded');
}

// ══════════════════════════════════════════════
// PDF TAB - CHAT
// ══════════════════════════════════════════════

function addPdfMessage(role, content) {
  const av = role === 'assistant'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const cb = role === 'assistant'
    ? '<button class="msg-copy" onclick="copyMsg(this)" aria-label="Copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>'
    : '';
  const d = document.createElement('div');
  d.className = 'message ' + role;
  d.innerHTML = '<div class="msg-avatar">' + av + '</div><div class="msg-body">' + cb + renderMarkdown(content) + '<div class="msg-time">' + getTime() + '</div></div>';
  messagesPdf.appendChild(d);
  togglePdfEmpty();
  messagesPdf.scrollTo({ top: messagesPdf.scrollHeight, behavior: 'smooth' });
}

function togglePdfEmpty() {
  emptyPdf.style.display = messagesPdf.querySelectorAll('.message').length > 0 ? 'none' : 'flex';
}

formPdf.addEventListener('submit', async e => {
  e.preventDefault();
  const query = inputPdf.value.trim();
  if (!query) return;
  if (!fileAttached) {
    addPdfMessage('assistant', 'Please upload a PDF first.');
    return;
  }
  addPdfMessage('user', query);
  inputPdf.value = '';
  inputPdf.style.height = 'auto';
  setStatus('busy');
  const fd = new FormData();
  fd.append('query', query);
  fd.append('source_type', 'user');
  if (fileAttached.name) fd.append('file', fileAttached);
  try {
    const r = await fetch('/query', { method: 'POST', body: fd });
    const data = await r.json();
    if (!r.ok) {
      addPdfMessage('assistant', 'Error: ' + (data.detail || 'Failed'));
      setStatus('error');
      return;
    }
    addPdfMessage('assistant', data.response || 'No answer generated.');
    setStatus('ready');
  } catch (err) {
    addPdfMessage('assistant', 'Error: ' + err.message);
    setStatus('error');
  }
});

// ══════════════════════════════════════════════
// SEARCH TABS
// ══════════════════════════════════════════════

Object.entries(searchTabs).forEach(([key, tab]) => {
  tab.form.addEventListener('submit', e => {
    e.preventDefault();
    const q = tab.input.value.trim();
    if (q) searchSource(key, q);
  });
  const page = tab.form.closest('.page');
  if (page) {
    page.querySelectorAll('.search-suggestions .shortcut-chip').forEach(c => {
      c.addEventListener('click', () => {
        tab.input.value = c.dataset.query;
        searchSource(key, c.dataset.query);
      });
    });
  }
});

async function searchSource(key, query) {
  const tab = searchTabs[key];
  tab.empty.style.display = 'none';
  tab.results.innerHTML = '';
  showSkeletons(tab.results, 2);
  setStatus('busy');
  try {
    const r = await fetch('/search?q=' + encodeURIComponent(query) + '&source=' + tab.source);
    const data = await r.json();
    removeSkeletons(tab.results);
    renderResults(tab.results, data.results || [], key);
    setStatus('ready');
  } catch (e) {
    removeSkeletons(tab.results);
    tab.results.innerHTML = '<div class="search-empty"><h3>Search failed</h3><p>Please try again.</p></div>';
    setStatus('error');
  }
}

function renderResults(container, results, sourceKey) {
  if (!results.length) {
    container.innerHTML = '<div class="search-empty"><h3>No results found</h3><p>Try a different query.</p></div>';
    return;
  }
  results.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = (i * 60) + 'ms';
    const authors = r.authors ? (Array.isArray(r.authors) ? r.authors.join(', ') : r.authors) : '';
    const sourceLabel = { arxiv: 'arXiv', semantic: 'Semantic Scholar', pubmed: 'PubMed', hybrid: r.source || 'Mixed' }[sourceKey] || r.source || '';
    card.innerHTML =
      '<div class="result-header"><div class="result-title">' + escapeHtml(r.title || '') + '</div><span class="result-source">' + escapeHtml(sourceLabel) + '</span></div>' +
      (authors ? '<div class="result-authors">' + escapeHtml(authors) + '</div>' : '') +
      '<div class="result-abstract">' + escapeHtml(r.abstract || r.summary || '') + '</div>' +
      '<div class="result-footer">' +
        (r.url ? '<a href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener" class="result-link">View Paper &rarr;</a>' : '') +
        (r.date ? '<span class="result-meta">' + escapeHtml(r.date) + '</span>' : '') +
        '<div class="result-actions"><button class="result-chat-btn" data-title="' + escapeHtml(r.title || '').replace(/"/g, '&quot;') + '" data-source="' + escapeHtml(sourceLabel) + '">Chat about this</button></div>' +
      '</div>';
    card.querySelector('.result-chat-btn').addEventListener('click', function() {
      startPaperChat(this.dataset.title, this.dataset.source);
    });
    container.appendChild(card);
  });
}

function startPaperChat(title, source) {
  showToast('Opening chat about: ' + title.substring(0, 50) + '...', 'info');
}

// ══════════════════════════════════════════════
// KNOWLEDGE BASE
// ══════════════════════════════════════════════

uploadBtn.addEventListener('click', () => kbFileInput.click());

kbFileInput.addEventListener('change', async () => {
  const f = kbFileInput.files[0];
  if (!f) return;
  const fd = new FormData();
  fd.append('file', f);
  try {
    showToast('Uploading ' + f.name + '...', 'info');
    const r = await fetch('/upload', { method: 'POST', body: fd });
    const data = await r.json();
    if (r.ok) {
      showToast('Uploaded!', 'success');
      loadKnowledgeBase();
    } else {
      showToast(data.detail || 'Failed', 'error');
    }
  } catch (e) {
    showToast('Upload failed', 'error');
  }
  kbFileInput.value = '';
});

async function loadKnowledgeBase() {
  try {
    const r = await fetch('/api/conversations');
    const list = await r.json();
    kbGrid.innerHTML = '';
    if (!list.length) {
      kbGrid.innerHTML = '<div class="kb-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>No documents uploaded yet.</p></div>';
      return;
    }
    list.forEach((c, i) => {
      const card = document.createElement('div');
      card.className = 'kb-card';
      card.style.animationDelay = (i * 60) + 'ms';
      card.innerHTML =
        '<div class="kb-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>' +
        '<div class="kb-card-title">' + escapeHtml(c.title) + '</div>' +
        '<div class="kb-card-meta">' + (c.message_count || 0) + ' messages &middot; ' + formatDate(c.updated_at) + '</div>' +
        '<span class="kb-card-badge">' + (c.pdf_name || 'Chat') + '</span>';
      card.addEventListener('click', () => { switchPage('pdf'); });
      kbGrid.appendChild(card);
    });
  } catch (e) { /* silent */ }
}

// ══════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════

function loadSettings() {
  try {
    const s = localStorage.getItem('ragflow_settings');
    if (s) settings = { ...settings, ...JSON.parse(s) };
  } catch (e) { /* silent */ }
  applySettings();
}

function saveSettings() {
  try {
    localStorage.setItem('ragflow_settings', JSON.stringify(settings));
  } catch (e) { /* silent */ }
  applySettings();
  showToast('Settings saved', 'success');
}

function applySettings() {
  geminiKey.value = settings.geminiKey || '';
  geminiModel.value = settings.geminiModel || 'gemini-2.5-flash';
  openaiKey.value = settings.openaiKey || '';
  openaiModel.value = settings.openaiModel || 'gpt-4o';
  defaultProvider.value = settings.defaultProvider || 'gemini';
  defaultSource.value = settings.defaultSource || 'user';
  geminiStatus.textContent = settings.geminiKey ? 'Configured' : 'Not configured';
  geminiStatus.className = 'provider-status' + (settings.geminiKey ? ' configured' : '');
  openaiStatus.textContent = settings.openaiKey ? 'Configured' : 'Not configured';
  openaiStatus.className = 'provider-status' + (settings.openaiKey ? ' configured' : '');
  useGeminiBtn.classList.toggle('active', settings.activeProvider === 'gemini');
  useOpenaiBtn.classList.toggle('active', settings.activeProvider === 'openai');
}

$('#saveGemini').addEventListener('click', () => {
  settings.geminiKey = geminiKey.value.trim();
  settings.geminiModel = geminiModel.value;
  saveSettings();
});

$('#saveOpenai').addEventListener('click', () => {
  settings.openaiKey = openaiKey.value.trim();
  settings.openaiModel = openaiModel.value;
  saveSettings();
});

$('#saveGeneral').addEventListener('click', () => {
  settings.defaultProvider = defaultProvider.value;
  settings.defaultSource = defaultSource.value;
  saveSettings();
});

useGeminiBtn.addEventListener('click', () => {
  settings.activeProvider = 'gemini';
  saveSettings();
});

useOpenaiBtn.addEventListener('click', () => {
  settings.activeProvider = 'openai';
  saveSettings();
});

$$('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = document.getElementById(btn.dataset.target);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
});

// ══════════════════════════════════════════════
// PDF SCROLL FAB
// ══════════════════════════════════════════════

messagesPdf.addEventListener('scroll', () => {
  scrollPdf.classList.toggle('visible',
    messagesPdf.scrollHeight - messagesPdf.scrollTop - messagesPdf.clientHeight > 120
  );
});

scrollPdf.addEventListener('click', () => {
  messagesPdf.scrollTo({ top: messagesPdf.scrollHeight, behavior: 'smooth' });
});

// ══════════════════════════════════════════════
// COPY MESSAGE
// ══════════════════════════════════════════════

window.copyMsg = function(btn) {
  const b = btn.closest('.msg-body');
  const t = b.querySelector('.msg-time');
  const clean = b.innerText.replace(t ? t.innerText : '', '').replace('Copy', '').trim();
  navigator.clipboard.writeText(clean).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 2000);
  });
};

// ══════════════════════════════════════════════
// AUTO-RESIZE TEXTAREAS
// ══════════════════════════════════════════════

$$('textarea').forEach(ta => {
  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  });
});

// ══════════════════════════════════════════════
// SCROLL REVEAL (IntersectionObserver)
// ══════════════════════════════════════════════

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => revealObserver.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('visible'));
}

// ══════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const activeSearch = document.querySelector('.page.active .search-bar input');
    if (activeSearch) activeSearch.focus();
  }

  if (e.key === 'Escape') {
    navbarNav.classList.remove('open');
  }
});

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════

initStarfield();
initTiltCards();
initMagneticButtons();
loadSettings();
