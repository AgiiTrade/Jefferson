// login.js — PNP Homes Portal

document.addEventListener('DOMContentLoaded', async function () {
  const form      = document.getElementById('login-form');
  const errEl     = document.getElementById('login-error');
  const emailEl   = document.getElementById('email');
  const passEl    = document.getElementById('password');
  const btnEl     = document.getElementById('login-btn');
  const googleBtn = document.getElementById('google-login-btn');

  function showError(msg) {
    errEl.textContent = msg;
    errEl.classList.add('visible');
  }
  function clearError() { errEl.classList.remove('visible'); }

  const FIREBASE_ERRORS = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase API key is invalid. Copy the Firebase config as text from Project Settings → Your apps → SDK setup/config and paste it to Jefferson.',
    'auth/api-key-not-valid': 'Firebase API key is invalid. Copy the Firebase config as text from Project Settings → Your apps → SDK setup/config and paste it to Jefferson.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled in Firebase Authentication. Enable it under Authentication → Sign-in method → Google.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase Authentication. Add agiitrade.github.io, pnphomes.ca, and portal.pnphomes.ca under Authentication → Settings → Authorized domains.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'auth/popup-blocked': 'Your browser blocked Google sign-in. Open this page in Safari/Chrome, or use email/password sign-in.',
    'auth/internal-error': 'Google sign-in redirect failed in this browser. Open this page in Safari/Chrome, or use email/password sign-in.',
    'permission-denied': 'Signed in, but Firestore blocked profile setup. Publish the Firestore rules from pnphomes-saas/firestore.rules.'
  };

  function friendlyError(err) {
    console.error('PNP Homes login error:', err);
    return FIREBASE_ERRORS[err.code] || FIREBASE_ERRORS[err.message] || `${err.message || 'Sign-in failed.'} (${err.code || 'unknown-error'})`;
  }

  async function saveUserProfile(user) {
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      userId: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  function googleProvider() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  }

  auth.onAuthStateChanged(function (user) {
    if (user) window.location.replace('dashboard.html');
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();
    const email = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) { showError('Please enter your email and password.'); return; }

    btnEl.disabled = true;
    btnEl.textContent = 'Signing in…';

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.replace('dashboard.html');
    } catch (err) {
      showError(friendlyError(err));
      btnEl.disabled = false;
      btnEl.textContent = 'Sign In';
    }
  });

  googleBtn.addEventListener('click', async function () {
    clearError();
    googleBtn.disabled = true;
    googleBtn.textContent = 'Opening Google…';

    try {
      const result = await auth.signInWithPopup(googleProvider());
      await saveUserProfile(result.user);
      window.location.replace('dashboard.html');
    } catch (err) {
      showError(friendlyError(err));
      googleBtn.disabled = false;
      googleBtn.textContent = 'Continue with Google';
    }
  });

  [emailEl, passEl].forEach(el => el.addEventListener('input', clearError));
});
