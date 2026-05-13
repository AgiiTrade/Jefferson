// signup.js — PNP Homes Portal
document.documentElement.style.visibility = 'hidden';

auth.onAuthStateChanged(function (user) {
  if (user) { window.location.replace('dashboard.html'); return; }
  document.documentElement.style.visibility = 'visible';
});

document.addEventListener('DOMContentLoaded', function () {
  const form    = document.getElementById('signup-form');
  const errEl   = document.getElementById('signup-error');
  const okEl    = document.getElementById('signup-success');
  const btnEl   = document.getElementById('signup-btn');

  const FIREBASE_ERRORS = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/operation-not-allowed':'Email sign-up is not enabled. Contact support.'
  };

  function showError(msg) { errEl.textContent = msg; errEl.classList.add('visible'); okEl.classList.remove('visible'); }
  function clearMessages() { errEl.classList.remove('visible'); okEl.classList.remove('visible'); }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearMessages();

    const name  = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value;
    const pass2 = document.getElementById('password2').value;

    if (!name || !email || !pass || !pass2) { showError('All fields are required.'); return; }
    if (pass !== pass2) { showError('Passwords do not match.'); return; }
    if (pass.length < 6) { showError('Password must be at least 6 characters.'); return; }

    btnEl.disabled    = true;
    btnEl.textContent = 'Creating account…';

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
      await cred.user.sendEmailVerification();

      // Save profile doc (uid-scoped collection)
      await db.collection('users').doc(cred.user.uid).set({
        uid:       cred.user.uid,
        name,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      okEl.textContent = 'Account created! Check your email to verify your address, then sign in.';
      okEl.classList.add('visible');
      form.reset();
      btnEl.disabled = false;
      btnEl.textContent = 'Create Account';
    } catch (err) {
      showError(FIREBASE_ERRORS[err.code] || 'Sign-up failed. Please try again.');
      btnEl.disabled    = false;
      btnEl.textContent = 'Create Account';
    }
  });

  form.querySelectorAll('input').forEach(el => el.addEventListener('input', clearMessages));
});
