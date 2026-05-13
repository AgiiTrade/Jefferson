// login.js — PNP Homes Portal
document.documentElement.style.visibility = 'hidden';

auth.onAuthStateChanged(function (user) {
  if (user) {
    window.location.replace('dashboard.html');
    return;
  }
  document.documentElement.style.visibility = 'visible';
});

document.addEventListener('DOMContentLoaded', function () {
  const form    = document.getElementById('login-form');
  const errEl   = document.getElementById('login-error');
  const emailEl = document.getElementById('email');
  const passEl  = document.getElementById('password');
  const btnEl   = document.getElementById('login-btn');

  function showError(msg) {
    errEl.textContent = msg;
    errEl.classList.add('visible');
  }
  function clearError() { errEl.classList.remove('visible'); }

  const FIREBASE_ERRORS = {
    'auth/user-not-found':   'No account found with this email address.',
    'auth/wrong-password':   'Incorrect password. Please try again.',
    'auth/invalid-email':    'Please enter a valid email address.',
    'auth/user-disabled':    'This account has been disabled.',
    'auth/too-many-requests':'Too many failed attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.'
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();
    const email    = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) { showError('Please enter your email and password.'); return; }

    btnEl.disabled    = true;
    btnEl.textContent = 'Signing in…';

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.replace('dashboard.html');
    } catch (err) {
      showError(FIREBASE_ERRORS[err.code] || 'Sign-in failed. Please try again.');
      btnEl.disabled    = false;
      btnEl.textContent = 'Sign In';
    }
  });

  [emailEl, passEl].forEach(el => el.addEventListener('input', clearError));
});
