// dashboard.js
let deleteId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // inject icons
  const gl = document.getElementById('gate-lock'); if(gl) gl.innerHTML = icon('lock',24);
  const dm = document.getElementById('del-modal-close'); if(dm) dm.innerHTML = icon('x',14);

  await fetchMe();
  const user = getUser();
  if (!user) { document.getElementById('dash-gate').style.display='block'; return; }
  document.getElementById('dash-content').style.display = 'block';

  // populate header
  const av = document.getElementById('dash-avatar');
  av.textContent = user.username[0].toUpperCase();
  av.style.background = user.avatar_color || '#554BF9';
  document.getElementById('dash-username').textContent = user.username;
  document.getElementById('dash-email').textContent    = user.email;
  document.getElementById('dash-role').textContent     = cap(user.role||'student');
  document.getElementById('s-since').textContent       = new Date(user.created_at||Date.now()).getFullYear();

  loadUploads();

  document.getElementById('del-confirm-btn').addEventListener('click', async () => {
    if (!deleteId) return;
    const btn = document.getElementById('del-confirm-btn');
    btn.disabled=true; btn.textContent='Deleting…';
    const d = await apiGet(`${API}/notes.php?action=delete&note_id=${deleteId}`);
    btn.disabled=false; btn.textContent='Delete';
    closeModal('del-modal');
    if (d.success) { toast('Note deleted.','success'); loadUploads(); }
    else toast(d.error||'Delete failed.','error');
    deleteId = null;
  });
});

function switchDashTab(t) {
  document.getElementById('panel-uploads').style.display   = t==='uploads'   ? 'block' : 'none';
  document.getElementById('panel-downloads').style.display = t==='downloads' ? 'block' : 'none';
  document.getElementById('dt-uploads').classList.toggle('active', t==='uploads');
  document.getElementById('dt-downloads').classList.toggle('active', t==='downloads');
  if (t === 'downloads') loadDownloads();
}

async function loadUploads() {
  const tb = document.getElementById('uploads-tbody');
  tb.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem"><span class="spinner" style="display:block;margin:0 auto"></span></td></tr>`;
  const data = await apiGet(`${API}/notes.php?action=user&type=uploads`);
  const notes = data.notes || [];
  document.getElementById('s-uploads').textContent = notes.length;
  document.getElementById('s-views').textContent = notes.reduce((s,n)=>s+Number(n.download_count),0);
  if (!notes.length) { tb.innerHTML=`<tr><td colspan="7" style="text-align:center;padding:2.5rem;color:var(--muted)">No uploads yet. <a href="upload.html" style="color:var(--purple)">Contribute now →</a></td></tr>`; return; }
  tb.innerHTML = '';
  notes.forEach(n => {
    const ext = n.file_ext||'';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div style="display:flex;align-items:center;gap:0.65rem">
        <div class="note-file-icon" style="width:34px;height:34px">${icon(fileIconName(ext),16)}</div>
        <div><div style="font-size:0.875rem;font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.title)}</div>
        <div style="font-size:0.72rem;color:var(--muted)">${fmtBytes(n.file_size)} · <span class="ext ${extClass(ext)}">${ext.toUpperCase()}</span></div></div>
      </div></td>
      <td class="t-small">${esc(n.course_name)}</td>
      <td class="t-small t-muted">${esc(n.dept_name)}</td>
      <td><span class="badge badge-purple">Sem ${n.semester}</span></td>
      <td class="t-small">${n.download_count}</td>
      <td class="t-small t-muted">${timeAgo(n.uploaded_at)}</td>
      <td><button class="btn btn-sm" style="background:rgba(220,60,60,0.1);color:#C04040;border:1px solid rgba(220,60,60,0.2)" onclick="confirmDel(${n.id},'${esc2(n.title)}')">${icon('trash',14)}</button></td>`;
    tb.appendChild(tr);
  });
}

async function loadDownloads() {
  const tb = document.getElementById('downloads-tbody');
  tb.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:2rem"><span class="spinner" style="display:block;margin:0 auto"></span></td></tr>`;
  const data = await apiGet(`${API}/notes.php?action=user&type=downloads`);
  const dls = data.downloads || [];
  document.getElementById('s-dls').textContent = dls.length;
  if (!dls.length) { tb.innerHTML=`<tr><td colspan="4" style="text-align:center;padding:2.5rem;color:var(--muted)">No downloads yet. <a href="download.html" style="color:var(--purple)">Explore →</a></td></tr>`; return; }
  tb.innerHTML='';
  dls.forEach(d => {
    const ext = d.file_ext||'';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div style="display:flex;align-items:center;gap:0.6rem">
        <div class="note-file-icon" style="width:34px;height:34px">${icon(fileIconName(ext),16)}</div>
        <div style="font-size:0.875rem;font-weight:500;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.title)}</div>
      </div></td>
      <td class="t-small">${esc(d.course_name)}</td>
      <td class="t-small t-muted">${esc(d.dept_name)}</td>
      <td class="t-small t-muted">${timeAgo(d.downloaded_at)}</td>`;
    tb.appendChild(tr);
  });
}

function confirmDel(id, name) { deleteId=id; document.getElementById('del-name').textContent=name; openModal('del-modal'); }
function cap(s) { return s.charAt(0).toUpperCase()+s.slice(1); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function esc2(s) { return String(s).replace(/'/g,"\\'").replace(/"/g,'&quot;'); }
