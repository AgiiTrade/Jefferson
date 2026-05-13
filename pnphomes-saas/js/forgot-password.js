// forgot-password.js — PNP Homes Portal
document.documentElement.style.visibility = 'hidden';

auth.onAuthStateChanged(function (user) {
  if (user) { window.location.replace('dashboard.html'); return; }
  document.documentElement.style.visibility = 'visible';
});

document.addEventListener('DOMContentLoaded', function () {
  const form  = document.getElementById('forgot-form');
  const errEl = document.getElementById('forgot-error');
  const okEl  = document.getElementById('forgot-success');
  const btnEl = document.getElementById('forgot-btn');

  const FIREBASE_ERRORS = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/invalid-email':  'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.'
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errEl.classList.remove('visible');
    okEl.classList.remove('visible');

    const email = document.getElementById('email').value.trim();
    if (!email) { errEl.textContent = 'Please enter your email.'; errEl.classList.add('visible'); return; }

    btnEl.disabled    = true;
    btnEl.textContent = 'Sending…';

    try {
      await auth.sendPasswordResetEmail(email);
      okEl.textContent = 'Password reset email sent. Check your inbox (and spam folder).';
      okEl.classList.add('visible');
    } catch (err) {
      errEl.textContent = FIREBASE_ERRORS[err.code] || 'Could not send reset email. Please try again.';
      errEl.classList.add('visible');
    }
    btnEl.disabled    = false;
    btnEl.textContent = 'Send Reset Email';
  });
});
