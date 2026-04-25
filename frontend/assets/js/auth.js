// auth.js
document.addEventListener('DOMContentLoaded', async () => {
  // Inject icons
  const inject = (id, name) => { const el = document.getElementById(id); if(el) el.innerHTML = icon(name, 16); };
  inject('icon-mail-1','mail'); inject('icon-mail-2','mail');
  inject('icon-lock-1','lock'); inject('icon-lock-2','lock'); inject('icon-lock-3','lock');
  inject('icon-user-1','user');
  inject('eye-si','eye'); inject('eye-su','eye');

  // Eye toggles
  makeEyeToggle('eye-si', 'si-pass');
  makeEyeToggle('eye-su', 'su-pass');

  // Redirect if already logged in
  await fetchMe();
  if (getUser()) {
    const next = new URLSearchParams(location.search).get('next') || 'dashboard.html';
    location.href = next; return;
  }

  // URL mode
  const mode = new URLSearchParams(location.search).get('mode') || 'signin';
  switchTab(mode === 'register' ? 'signup' : mode);

  // Sign In
  document.getElementById('signin-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('si-btn');
    const err = document.getElementById('si-err');
    err.classList.remove('show');

    const email = document.getElementById('si-email').value.trim();
    const pass  = document.getElementById('si-pass').value;
    if (!email || !pass) { showErr(err,'Email and password required.'); return; }

    setLoading(btn, true, 'Signing in…');
    const data = await apiPost(`${API}/auth.php?action=login`, { email, password: pass });
    setLoading(btn, false, 'Sign in');

    if (data.success) {
      toast('Welcome back, ' + data.user.username + '!', 'success');
      const next = new URLSearchParams(location.search).get('next') || 'dashboard.html';
      setTimeout(() => location.href = next, 600);
    } else {
      showErr(err, data.error || 'Sign in failed.');
    }
  });

  // Sign Up
  document.getElementById('signup-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('su-btn');
    const err = document.getElementById('su-err');
    err.classList.remove('show');

    const username = document.getElementById('su-name').value.trim();
    const email    = document.getElementById('su-email').value.trim();
    const pass     = document.getElementById('su-pass').value;
    const confirm  = document.getElementById('su-confirm').value;

    if (!username || !email || !pass) { showErr(err,'All fields required.'); return; }
    if (pass !== confirm) { showErr(err,'Passwords do not match.'); return; }
    if (pass.length < 6)  { showErr(err,'Password must be at least 6 characters.'); return; }

    setLoading(btn, true, 'Creating account…');
    const data = await apiPost(`${API}/auth.php?action=register`, { username, email, password: pass });
    setLoading(btn, false, 'Create account');

    if (data.success) {
      toast('Welcome to notown, ' + data.user.username + '!', 'success');
      const next = new URLSearchParams(location.search).get('next') || 'dashboard.html';
      setTimeout(() => location.href = next, 700);
    } else {
      showErr(err, data.error || 'Registration failed.');
    }
  });
});

function switchTab(tab) {
  const isSignin = tab === 'signin';
  document.getElementById('signin-form').style.display = isSignin ? 'flex' : 'none';
  document.getElementById('signup-form').style.display = isSignin ? 'none' : 'flex';
  document.getElementById('tab-signin').classList.toggle('active', isSignin);
  document.getElementById('tab-signup').classList.toggle('active', !isSignin);
}

function showErr(el, msg) { el.textContent = msg; el.classList.add('show'); }

function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.innerHTML = loading ? `<span class="spinner"></span> ${label}` : label;
}

function makeEyeToggle(btnId, inputId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  let visible = false;
  btn.addEventListener('click', () => {
    visible = !visible;
    input.type = visible ? 'text' : 'password';
    btn.innerHTML = icon(visible ? 'eye_off' : 'eye', 16);
  });
}
