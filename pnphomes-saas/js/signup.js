// signup.js — PNP Homes Portal

document.addEventListener('DOMContentLoaded', async function () {
  const form      = document.getElementById('signup-form');
  const errEl     = document.getElementById('signup-error');
  const okEl      = document.getElementById('signup-success');
  const btnEl     = document.getElementById('signup-btn');
  const googleBtn = document.getElementById('google-signup-btn');

  const FIREBASE_ERRORS = {
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase API key is invalid. Copy the Firebase config as text from Project Settings → Your apps → SDK setup/config and paste it to Jefferson.',
    'auth/api-key-not-valid': 'Firebase API key is invalid. Copy the Firebase config as text from Project Settings → Your apps → SDK setup/config and paste it to Jefferson.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Authentication. Enable Email/Password and Google under Authentication → Sign-in method.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase Authentication. Add agiitrade.github.io, pnphomes.ca, and portal.pnphomes.ca under Authentication → Settings → Authorized domains.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'auth/popup-blocked': 'Google sign-in popup was blocked. Tap the ⋯ menu and open this page in Safari/Chrome, or use email/password sign-in.',
    'auth/internal-error': 'Google sign-in is blocked by this in-app browser. Tap the ⋯ menu and open this page in Safari/Chrome, or use email/password sign-in.',
    'permission-denied': 'Account was created, but Firestore blocked profile setup. Publish the Firestore rules from pnphomes-saas/firestore.rules.'
  };

  function friendlyError(err) {
    console.error('PNP Homes signup error:', err);
    return FIREBASE_ERRORS[err.code] || FIREBASE_ERRORS[err.message] || `${err.message || 'Sign-up failed.'} (${err.code || 'unknown-error'})`;
  }

  function showError(msg) { errEl.textContent = msg; errEl.classList.add('visible'); okEl.classList.remove('visible'); }
  function clearMessages() { errEl.classList.remove('visible'); okEl.classList.remove('visible'); }

  async function saveUserProfile(user, name) {
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      userId: user.uid,
      name: name || user.displayName || '',
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
    clearMessages();

    const name  = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value;
    const pass2 = document.getElementById('password2').value;

    if (!name || !email || !pass || !pass2) { showError('All fields are required.'); return; }
    if (pass !== pass2) { showError('Passwords do not match.'); return; }
    if (pass.length < 6) { showError('Password must be at least 6 characters.'); return; }

    btnEl.disabled = true;
    btnEl.textContent = 'Creating account…';

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
      await saveUserProfile(cred.user, name);

      try {
        await cred.user.sendEmailVerification();
        okEl.textContent = 'Account created! Check your email to verify your address, then sign in.';
      } catch (verifyErr) {
        console.warn('Email verification could not be sent:', verifyErr);
        okEl.textContent = 'Account created. Verification email could not be sent yet, but you can sign in.';
      }

      okEl.classList.add('visible');
      form.reset();
    } catch (err) {
      showError(friendlyError(err));
    } finally {
      btnEl.disabled = false;
      btnEl.textContent = 'Create Account';
    }
  });

  googleBtn.addEventListener('click', async function () {
    clearMessages();
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

  form.querySelectorAll('input').forEach(el => el.addEventListener('input', clearMessages));
});
