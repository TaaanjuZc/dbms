// reviews.js
let currentRating = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await fetchMe();
  const user = getUser();

  const gate = document.getElementById('review-gate');
  const form = document.getElementById('review-form');
  if (user) { gate.style.display='none'; form.style.display='flex'; }
  else      { gate.style.display='block'; form.style.display='none'; }

  // Star picker
  document.querySelectorAll('.star-btn').forEach(s => {
    s.addEventListener('mouseenter', () => litStars(+s.dataset.v));
    s.addEventListener('mouseleave', () => litStars(currentRating));
    s.addEventListener('click', () => { currentRating = +s.dataset.v; document.getElementById('rev-rating').value = currentRating; litStars(currentRating); });
  });

  // Type pills
  document.querySelectorAll('.type-pill').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('.type-pill').forEach(x => x.classList.remove('sel'));
      p.classList.add('sel');
      document.getElementById('c-type').value = p.dataset.t;
    });
  });

  // Review form
  document.getElementById('review-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('rev-btn');
    const err = document.getElementById('rev-err');
    err.classList.remove('show');
    const rating   = +document.getElementById('rev-rating').value;
    const headline = document.getElementById('rev-headline').value.trim();
    const body     = document.getElementById('rev-body').value.trim();
    if (!rating)              return setErr(err,'Select a rating.');
    if (headline.length < 3) return setErr(err,'Headline too short.');
    if (body.length < 10)    return setErr(err,'Review too short (min 10 chars).');
    btn.disabled=true; btn.innerHTML=`<span class="spinner"></span> Submitting…`;
    const data = await apiPost(`${API}/reviews.php?action=add_review`, {rating, headline, body});
    btn.disabled=false; btn.innerHTML='Submit review';
    if (data.success) { toast(data.message||'Review submitted!','success'); document.getElementById('review-form').reset(); currentRating=0; litStars(0); loadReviews(); }
    else setErr(err, data.error||'Submission failed.');
  });

  // Complaint form
  document.getElementById('complaint-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('c-btn');
    const err = document.getElementById('c-err');
    err.classList.remove('show');
    const type    = document.getElementById('c-type').value;
    const subject = document.getElementById('c-subject').value.trim();
    const desc    = document.getElementById('c-desc').value.trim();
    if (subject.length < 3) return setErr(err,'Subject too short.');
    if (desc.length < 10)   return setErr(err,'Description too short (min 10 chars).');
    btn.disabled=true; btn.innerHTML=`<span class="spinner"></span> Submitting…`;
    const data = await apiPost(`${API}/reviews.php?action=add_complaint`, {type, subject, description: desc});
    btn.disabled=false; btn.innerHTML='Submit feedback';
    if (data.success) { toast(data.message||'Feedback submitted!','success'); document.getElementById('complaint-form').reset(); document.querySelectorAll('.type-pill').forEach(p=>p.classList.remove('sel')); document.querySelector('.type-pill[data-t="bug"]').classList.add('sel'); }
    else setErr(err, data.error||'Submission failed.');
  });

  loadReviews();
});

async function loadReviews() {
  const list = document.getElementById('reviews-list');
  list.innerHTML = `<div class="empty"><p>Loading…</p></div>`;
  const data = await apiGet(`${API}/reviews.php?action=list_reviews`);
  const reviews = data.reviews || [];
  list.innerHTML = '';
  if (!reviews.length) { list.innerHTML=`<div class="empty">${icon('star',32)}<p style="margin-top:0.75rem">No reviews yet. Be the first!</p></div>`; return; }
  reviews.forEach(r => {
    const card = document.createElement('div');
    card.className = 'review-card anim-fade-in';
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5-r.rating);
    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:0.75rem;margin-bottom:0.75rem">
        <div class="nav-avatar" style="width:36px;height:36px;font-size:0.82rem;background:${r.avatar_color||'#554BF9'};color:#fff">${r.username[0].toUpperCase()}</div>
        <div>
          <div style="font-weight:600;font-size:0.9rem">${esc(r.username)}</div>
          <div style="display:flex;gap:0.5rem;align-items:center;margin-top:0.1rem">
            <span style="color:var(--lime);font-size:0.9rem;letter-spacing:1px">${stars}</span>
            <span class="t-small t-muted">${timeAgo(r.created_at)}</span>
          </div>
        </div>
      </div>
      <div style="font-weight:600;font-size:0.875rem;margin-bottom:0.3rem">${esc(r.headline)}</div>
      <div class="t-small t-muted">${esc(r.body)}</div>`;
    list.appendChild(card);
  });
}

function litStars(n) { document.querySelectorAll('.star-btn').forEach(s => s.classList.toggle('lit', +s.dataset.v <= n)); }
function setErr(el, m) { el.textContent=m; el.classList.add('show'); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
