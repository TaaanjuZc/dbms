// upload.js
document.addEventListener('DOMContentLoaded', async () => {
  // inject icons
  const lockEl = document.getElementById('lock-icon-lg');
  if (lockEl) lockEl.innerHTML = icon('lock', 24);
  const checkEl = document.getElementById('check-icon-lg');
  if (checkEl) checkEl.innerHTML = icon('check', 24);
  const zoneIcon = document.getElementById('upload-zone-icon');
  if (zoneIcon) zoneIcon.innerHTML = icon('upload', 36);

  await fetchMe();
  const user = getUser();
  const gate  = document.getElementById('auth-gate');
  const area  = document.getElementById('upload-area');

  if (user) { gate.style.display='none'; area.style.display='grid'; initForm(); }
  else      { gate.style.display='block'; area.style.display='none'; }
});

function initForm() {
  const deptSel  = document.getElementById('up-dept');
  const courseSel= document.getElementById('up-course');
  const zone     = document.getElementById('upload-zone');
  const fileInput= document.getElementById('up-file');
  const preview  = document.getElementById('file-preview');

  loadDepts(deptSel, 'Select department');
  deptSel.addEventListener('change', async () => {
    courseSel.disabled = !deptSel.value;
    await loadCourses(deptSel.value, courseSel, 'Select course');
  });

  // drag/drop
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) { const dt = new DataTransfer(); dt.items.add(f); fileInput.files = dt.files; showPreview(f); }
  });
  fileInput.addEventListener('change', () => { if(fileInput.files[0]) showPreview(fileInput.files[0]); });

  function showPreview(f) {
    const ext = f.name.split('.').pop().toLowerCase();
    preview.style.display = 'flex';
    preview.innerHTML = `
      <div class="note-file-icon">${icon(fileIconName(ext), 20)}</div>
      <div class="file-preview-info">
        <div class="file-preview-name">${f.name}</div>
        <div class="file-preview-size">${fmtBytes(f.size)} · <span class="ext ${extClass(ext)}">${ext.toUpperCase()}</span></div>
      </div>
      <button type="button" id="rm-file" style="margin-left:auto;color:var(--muted)">${icon('x',14)}</button>
    `;
    document.getElementById('rm-file')?.addEventListener('click', () => { fileInput.value=''; preview.style.display='none'; });
  }

  document.getElementById('upload-form').addEventListener('submit', async e => {
    e.preventDefault();
    const err    = document.getElementById('up-err');
    const btn    = document.getElementById('up-submit');
    const progWrap = document.getElementById('progress-wrap');
    const fill   = document.getElementById('up-fill');
    const pct    = document.getElementById('up-pct');
    err.classList.remove('show');

    const courseId = document.getElementById('up-course').value;
    const title    = document.getElementById('up-title').value.trim();
    const faculty  = document.getElementById('up-faculty').value.trim();
    const semester = document.getElementById('up-semester').value;
    const remarks  = document.getElementById('up-remarks').value.trim();
    const file     = fileInput.files[0];

    if (!courseId) return showE(err,'Select a course.');
    if (!title)    return showE(err,'Note title required.');
    if (!faculty)  return showE(err,'Faculty name required.');
    if (!semester) return showE(err,'Select a semester.');
    if (!file)     return showE(err,'Please attach a file.');
    if (file.size > 100*1024*1024) return showE(err,'File exceeds 100 MB.');

    const fd = new FormData();
    fd.append('course_id', courseId); fd.append('title', title);
    fd.append('faculty_name', faculty); fd.append('semester', semester);
    fd.append('remarks', remarks); fd.append('file', file);

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Uploading…`;
    progWrap.style.display = 'block';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API}/notes.php?action=upload`);
    xhr.withCredentials = true;
    xhr.upload.addEventListener('progress', ev => {
      if (ev.lengthComputable) { const p=Math.round(ev.loaded/ev.total*100); fill.style.width=p+'%'; pct.textContent=p+'%'; }
    });
    xhr.onload = () => {
      progWrap.style.display='none'; btn.disabled=false; btn.innerHTML='Upload notes';
      try {
        const d = JSON.parse(xhr.responseText);
        if (d.success) { document.getElementById('upload-form').reset(); preview.style.display='none'; openModal('success-modal'); }
        else showE(err, d.error||'Upload failed.');
      } catch { showE(err,'Unexpected server error.'); }
    };
    xhr.onerror = () => { progWrap.style.display='none'; btn.disabled=false; btn.innerHTML='Upload notes'; showE(err,'Network error.'); };
    xhr.send(fd);
  });
}

function showE(el, msg) { el.textContent=msg; el.classList.add('show'); }
