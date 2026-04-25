// download.js
const FREE_LIMIT = 2;
let selected = []; // {id, name, code}
let offset = 0, total = 0, filterDept = '', filterCourse = '';

document.addEventListener('DOMContentLoaded', async () => {
  // inject icons
  const si = document.getElementById('search-icon');       if(si) si.innerHTML = icon('search',16);
  const zi = document.getElementById('zip-icon');          if(zi) zi.innerHTML = icon('zip',16);
  const fi = document.getElementById('fab-zip-icon');      if(fi) fi.innerHTML = icon('zip',16);
  const ei = document.getElementById('search-empty-icon'); if(ei) ei.innerHTML = icon('search',32);
  const li = document.getElementById('modal-lock-icon');   if(li) li.innerHTML = icon('lock',24);
  const mc = document.getElementById('modal-close-btn');   if(mc) mc.innerHTML = icon('x',14);

  const deptSel = document.getElementById('dl-dept');
  const courseSel = document.getElementById('dl-course');

  await loadDepts(deptSel, 'All departments');

  // Pre-select from URL
  const params = new URLSearchParams(location.search);
  if (params.get('dept')) { deptSel.value = params.get('dept'); await loadCourses(params.get('dept'), courseSel, 'All courses'); }

  deptSel.addEventListener('change', async () => { await loadCourses(deptSel.value, courseSel, 'All courses'); });

  document.getElementById('dl-search').addEventListener('click', () => {
    offset = 0; filterDept = deptSel.value; filterCourse = courseSel.value; fetchNotes(true);
  });
  document.getElementById('load-more').addEventListener('click', () => fetchNotes(false));
  document.getElementById('dl-zip-btn').addEventListener('click', downloadZip);

  fetchNotes(true);
  updateSidebar();
});

async function fetchNotes(reset) {
  if (reset) { offset = 0; document.getElementById('notes-list').innerHTML = buildSkel(5); }
  const url = `${API}/notes.php?action=list&limit=15&offset=${offset}`
    + (filterDept   ? `&dept_id=${filterDept}`   : '')
    + (filterCourse ? `&course_id=${filterCourse}` : '');

  const data = await apiGet(url);
  total = data.total || 0;
  const notes = data.notes || [];
  const list  = document.getElementById('notes-list');
  if (reset) list.innerHTML = '';

  if (!notes.length && reset) {
    list.innerHTML = `<div class="empty" style="padding:3rem 0"><div style="color:var(--muted-2);margin-bottom:0.75rem" >${icon('file',36)}</div><p>No notes found.</p><p class="t-small t-muted" style="margin-top:0.25rem">Be the first to <a href="upload.html" style="color:var(--purple)">contribute</a>!</p></div>`;
    document.getElementById('load-more-wrap').style.display = 'none'; return;
  }

  notes.forEach(n => list.appendChild(noteCard(n)));
  offset += notes.length;
  document.getElementById('load-more-wrap').style.display = offset < total ? 'block' : 'none';
}

function buildSkel(n) {
  return Array(n).fill(0).map(()=>`
    <div style="display:flex;gap:0.9rem;padding:0.9rem 1rem;background:var(--surface);border:1px solid var(--surface-border);border-radius:var(--r-lg)">
      <div style="width:40px;height:40px;border-radius:var(--r);background:var(--surface-border)"></div>
      <div style="flex:1"><div style="width:55%;height:12px;background:var(--surface-border);border-radius:4px;margin-bottom:8px"></div><div style="width:35%;height:10px;background:var(--muted-2);border-radius:4px;opacity:0.4"></div></div>
    </div>`).join('');
}

function noteCard(n) {
  const card = document.createElement('div');
  card.className = 'note-item anim-fade-in';
  const added = selected.some(s => s.id == n.course_id);
  const ext = n.file_ext || '';
  card.innerHTML = `
    <div class="note-file-icon">${icon(fileIconName(ext), 18)}</div>
    <div class="note-body">
      <div class="note-title">${n.title}</div>
      <div class="note-meta">
        <span class="ext ${extClass(ext)}">${ext.toUpperCase()}</span>
        <span>${n.course_name}</span>
        <span>${n.dept_name}</span>
        <span>Sem ${n.note_semester}</span>
        <span>${fmtBytes(n.file_size)}</span>
        <span>by ${n.uploader_name}</span>
        <span>${timeAgo(n.uploaded_at)}</span>
        <span>${icon('download',12)} ${n.download_count}</span>
      </div>
    </div>
    <div class="note-actions">
      <button class="btn btn-outline btn-sm add-btn" data-cid="${n.course_id}" data-cname="${n.course_name}" data-ccode="${n.course_code}" ${added?'disabled':''} style="gap:0.3rem">
        ${added ? icon('check',14) : icon('plus',14)} ${added?'Added':'Add'}
      </button>
      <button class="btn btn-solid btn-sm dl-btn" data-nid="${n.id}" data-fname="${n.file_name}" style="gap:0.3rem">
        ${icon('download',14)} ZIP
      </button>
    </div>`;

  card.querySelector('.add-btn')?.addEventListener('click', function() {
    addCourse({id:this.dataset.cid, name:this.dataset.cname, code:this.dataset.ccode});
    this.disabled = true;
    this.innerHTML = `${icon('check',14)} Added`;
  });
  card.querySelector('.dl-btn')?.addEventListener('click', function() {
    dlSingle(this.dataset.nid, this.dataset.fname);
  });
  return card;
}

function addCourse(c) {
  if (!getUser() && selected.length >= FREE_LIMIT) { openModal('login-modal'); return; }
  if (selected.some(s => s.id == c.id)) return;
  selected.push(c);
  updateSidebar();

  // mobile popup
  const pop = document.createElement('div');
  pop.style.cssText = `position:fixed;bottom:5rem;right:1.5rem;z-index:60;background:var(--fg);color:var(--bg);padding:0.6rem 1rem;border-radius:var(--r-pill);font-size:0.82rem;font-weight:600;box-shadow:var(--shadow);animation:toast-in 0.3s ease`;
  pop.textContent = `${c.code} added`;
  document.body.appendChild(pop);
  setTimeout(()=>pop.remove(), 1800);

  if (!getUser() && selected.length > FREE_LIMIT - 1) {
    document.getElementById('guest-notice').style.display = 'block';
  }
}

function removeCourse(id) {
  selected = selected.filter(s => s.id != id);
  updateSidebar();
  document.querySelectorAll(`.add-btn[data-cid="${id}"]`).forEach(b => {
    b.disabled = false; b.innerHTML = `${icon('plus',14)} Add`;
  });
}

function updateSidebar() {
  const list   = document.getElementById('sel-list');
  const count  = document.getElementById('sel-count');
  const fabCnt = document.getElementById('fab-count');
  const dlBtn  = document.getElementById('dl-zip-btn');
  const banner = document.getElementById('limit-banner');
  const status = document.getElementById('user-status-msg');

  count.textContent  = selected.length;
  if(fabCnt) fabCnt.textContent = selected.length;
  dlBtn.disabled = selected.length === 0;

  if (selected.length === 0) {
    list.innerHTML = `<p class="t-small t-muted" style="text-align:center;padding:0.75rem 0">No courses selected.<br>Add courses from the list.</p>`;
  } else {
    list.innerHTML = '';
    selected.forEach(c => {
      const item = document.createElement('div');
      item.className = 'sel-item';
      item.innerHTML = `
        <div><div class="t-small" style="font-weight:600;color:var(--fg)">${c.code}</div><div style="font-size:0.72rem;color:var(--muted)">${c.name}</div></div>
        <button class="sel-remove btn btn-ghost" style="padding:0.2rem;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center" data-id="${c.id}">${icon('x',12)}</button>`;
      item.querySelector('.sel-remove').addEventListener('click', () => removeCourse(c.id));
      list.appendChild(item);
    });
  }

  const user = getUser();
  if (user) {
    status.textContent = `Signed in · unlimited access`;
    banner.style.display = 'none';
  } else {
    const rem = Math.max(0, FREE_LIMIT - selected.length);
    status.textContent = `Guest · ${rem} free course${rem!==1?'s':''} left`;
    banner.style.display = selected.length >= FREE_LIMIT ? 'block' : 'none';
  }
}

async function dlSingle(noteId, fileName) {
  toast('Preparing ZIP…', 'info', 1800);
  try {
    const res = await fetch(`${API}/notes.php?action=download&note_id=${noteId}`, {credentials:'include'});
    if (res.status === 401) { openModal('login-modal'); return; }
    if (!res.ok) { const d=await res.json(); toast(d.error||'Download failed.','error'); return; }
    const blob = await res.blob();
    const stem = fileName.replace(/\.[^.]+$/,'');
    triggerDownload(blob, stem.replace(/[^a-zA-Z0-9_\- ]/g,'_')+'.zip');
    toast('Downloaded!', 'success');
  } catch { toast('Download error.','error'); }
}

async function downloadZip() {
  if (!selected.length) return;
  const user = getUser();
  if (!user && selected.length > FREE_LIMIT) { openModal('login-modal'); return; }

  const btn = document.getElementById('dl-zip-btn');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Building ZIP…`;
  toast(`Bundling ${selected.length} course(s)…`, 'info', 3500);

  try {
    const res = await fetch(`${API}/notes.php?action=download_zip`, {
      method:'POST', credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({course_ids: selected.map(s=>s.id)})
    });
    if (res.status === 401) { openModal('login-modal'); btn.disabled=false; btn.innerHTML=orig; return; }
    if (!res.ok) { const d=await res.json().catch(()=>{}); toast((d&&d.error)||'Download failed.','error'); btn.disabled=false; btn.innerHTML=orig; return; }
    const blob = await res.blob();
    triggerDownload(blob, `notown_${new Date().toISOString().slice(0,10)}.zip`);
    toast('ZIP downloaded!', 'success', 4000);
  } catch { toast('Network error.','error'); }
  btn.disabled = false; btn.innerHTML = orig;
}
