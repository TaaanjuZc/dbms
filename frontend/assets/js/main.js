// ============================================================
//  main.js  —  Shared utilities for notown
// ============================================================

// ── API path ──────────────────────────────────────────────
// Vite dev (port 5173/4173): use /api  → Vite proxies to XAMPP
// XAMPP direct (port 80):    build path from current URL
const API = (() => {
  const port = location.port;
  if (port === '5173' || port === '4173') return '/api';

  // Direct XAMPP: http://localhost/notown/frontend/page.html
  //           → http://localhost/notown/backend/api
  const href = location.href.split('?')[0].split('#')[0];
  const idx  = href.indexOf('/frontend/');
  if (idx !== -1) return href.slice(0, idx) + '/backend/api';

  // Fallback
  return location.origin + '/notown/backend/api';
})();

// Debug: log the resolved API path (remove in production)
console.log('[EWU NotesHub] API base:', API);

// ── Icon library ──────────────────────────────────────────
const ICONS = {
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  upload: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  file: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrow_right: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eye_off: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  zip: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  book: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  star_fill: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

function icon(name, size = 18) {
  const svg = ICONS[name] || ICONS.file;
  return svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
}

// ── Theme — defaults to DARK ──────────────────────────────
function getTheme() { return localStorage.getItem('nt-theme') || 'dark'; }
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem('nt-theme', t);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = t === 'dark' ? icon('sun') : icon('moon');
}
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); }

// ── Auth state ────────────────────────────────────────────
let _user = null;

async function fetchMe() {
  try {
    const r = await fetch(`${API}/auth.php?action=me`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!r.ok) { _user = null; return null; }
    const text = await r.text();
    if (!text || text.trim()[0] !== '{') {
      console.warn('[notown] auth.php returned non-JSON:', text.slice(0, 200));
      _user = null; return null;
    }
    const d = JSON.parse(text);
    _user = d.user || null;
  } catch (e) {
    console.warn('[notown] fetchMe failed:', e.message);
    _user = null;
  }
  return _user;
}
function getUser()    { return _user; }
function isLoggedIn() { return !!_user; }

// ── Toast ─────────────────────────────────────────────────
function toast(msg, type = 'info', ms = 3200) {
  let rack = document.getElementById('toast-rack');
  if (!rack) {
    rack = document.createElement('div');
    rack.id = 'toast-rack';
    document.body.appendChild(rack);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
  rack.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 280); }, ms);
}

// ── Modals ────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) closeAllModals(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

// ── Safe API helpers — always return usable data ──────────
async function apiGet(url) {
  try {
    const r = await fetch(url, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    const text = await r.text();
    if (!text || text.trim()[0] !== '{') {
      console.warn('[notown] Non-JSON response from:', url, text.slice(0, 200));
      return { success: false, error: 'Server error', departments: [], courses: [], notes: [], total: 0 };
    }
    return JSON.parse(text);
  } catch (e) {
    console.warn('[notown] apiGet failed:', url, e.message);
    return { success: false, error: e.message, departments: [], courses: [], notes: [], total: 0 };
  }
}

async function apiPost(url, body) {
  try {
    const r = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    if (!text || text.trim()[0] !== '{') {
      console.warn('[notown] Non-JSON POST response:', text.slice(0, 200));
      return { success: false, error: 'Server error — check PHP logs' };
    }
    return JSON.parse(text);
  } catch (e) {
    console.warn('[notown] apiPost failed:', e.message);
    return { success: false, error: e.message };
  }
}

// ── Dept / Course loaders — with error recovery ───────────
async function loadDepts(sel, placeholder = 'All Departments') {
  sel.innerHTML = `<option value="">Loading…</option>`;
  sel.disabled = true;
  try {
    const d = await apiGet(`${API}/courses.php?action=departments`);
    const depts = d.departments || [];
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    if (depts.length === 0) {
      sel.innerHTML = `<option value="">No departments found</option>`;
      console.warn('[notown] No departments returned. Check DB connection.');
      return;
    }
    depts.forEach(dept => {
      const o = document.createElement('option');
      o.value = dept.id;
      o.textContent = `${dept.name} (${dept.code})`;
      sel.appendChild(o);
    });
  } catch (e) {
    sel.innerHTML = `<option value="">Failed to load</option>`;
    console.error('[notown] loadDepts error:', e);
  } finally {
    sel.disabled = false;
  }
}

async function loadCourses(deptId, sel, placeholder = 'Select Course') {
  if (!deptId) {
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    sel.disabled = true;
    return;
  }
  sel.innerHTML = `<option value="">Loading…</option>`;
  sel.disabled = true;
  try {
    const d = await apiGet(`${API}/courses.php?action=courses&dept_id=${deptId}`);
    const courses = d.courses || [];
    sel.innerHTML = `<option value="">${placeholder}</option>`;
    courses.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id;
      o.textContent = `${c.code} — ${c.name}`;
      sel.appendChild(o);
    });
  } catch (e) {
    sel.innerHTML = `<option value="">Failed to load</option>`;
    console.error('[notown] loadCourses error:', e);
  } finally {
    sel.disabled = false;
  }
}

// ── Formatters ────────────────────────────────────────────
function fmtBytes(b) {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
}

function timeAgo(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fileIconName(ext) {
  const e = (ext || '').toLowerCase();
  const map = { pdf:'file', doc:'file', docx:'file', xls:'file', xlsx:'file',
                ppt:'file', pptx:'file', zip:'zip', rar:'zip', tar:'zip', gz:'zip' };
  return map[e] || 'file';
}

function extClass(ext) {
  const e = (ext || '').toLowerCase();
  if (e === 'pdf') return 'ext-pdf';
  if (['doc','docx'].includes(e)) return 'ext-doc';
  if (['xls','xlsx','csv'].includes(e)) return 'ext-xls';
  if (['ppt','pptx'].includes(e)) return 'ext-ppt';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(e)) return 'ext-img';
  if (['zip','rar','tar','gz'].includes(e)) return 'ext-zip';
  if (['py','js','html','css','json','md','ipynb'].includes(e)) return 'ext-code';
  return 'ext-def';
}

// ── Logout ────────────────────────────────────────────────
async function logout() {
  try {
    await fetch(`${API}/auth.php?action=logout`, { credentials: 'include' });
  } catch (e) { /* ignore */ }
  _user = null;
  updateNav(null);
  toast('Signed out', 'success');
  setTimeout(() => location.href = 'index.html', 600);
}

// ── Nav update ────────────────────────────────────────────
function updateNav(user) {
  const loginBtn = document.getElementById('nav-login');
  const userArea = document.getElementById('nav-user');
  if (!loginBtn || !userArea) return;
  if (user) {
    loginBtn.style.display = 'none';
    userArea.style.display = 'flex';
    const av = document.getElementById('nav-avatar');
    const un = document.getElementById('nav-username');
    if (av) {
      av.textContent = user.username[0].toUpperCase();
      av.style.background = user.avatar_color || '#554BF9';
      av.style.color = '#fff';
    }
    if (un) un.textContent = user.username;
  } else {
    loginBtn.style.display = '';
    userArea.style.display = 'none';
  }
}

// ── Active nav highlight ──────────────────────────────────
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-link').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().split('?')[0];
    a.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
}

// ── Mobile drawer ─────────────────────────────────────────
function initMobileNav() {
  const btn    = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  const close  = document.getElementById('drawer-close');
  if (!btn || !drawer) return;
  btn.addEventListener('click', () => drawer.classList.toggle('open'));
  close?.addEventListener('click', () => drawer.classList.remove('open'));
  drawer.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => drawer.classList.remove('open'))
  );
}

// ── Blob download helper ──────────────────────────────────
function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Apply theme before anything renders
  applyTheme(getTheme());

  // Wire up theme toggle button
  const tt = document.getElementById('theme-toggle');
  if (tt) tt.addEventListener('click', toggleTheme);

  // Fetch current user (non-blocking)
  await fetchMe();
  updateNav(getUser());
  setActiveNav();
  initMobileNav();

  // Inject any data-icon attributes
  document.querySelectorAll('[data-icon]').forEach(el => {
    el.innerHTML = icon(el.dataset.icon, el.dataset.iconSize || 18);
  });
});
