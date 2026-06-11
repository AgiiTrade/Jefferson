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
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase API key is invalid.',
    'auth/api-key-not-valid': 'Firebase API key is invalid.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled in Firebase. Enable it under Authentication → Sign-in method → Google.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add pnphomes.ca under Authentication → Settings → Authorized domains.',
    'auth/cancelled-popup-request': '',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Please use email & password sign-in, or open this page in Safari or Chrome.',
    'auth/internal-error': 'Google sign-in failed. Please try email & password, or open this page in Safari or Chrome.',
    'permission-denied': 'Signed in, but Firestore blocked profile setup. Publish the Firestore rules from pnphomes-saas/firestore.rules.'
  };

  function friendlyError(err) {
    console.error('PNP Homes login error:', err.code, err.message, err);
    const browserMsg = window.PNPAuthBrowser && window.PNPAuthBrowser.googleErrorMessage(err);
    if (browserMsg) return browserMsg;
    return FIREBASE_ERRORS[err.code] || FIREBASE_ERRORS[err.message] || 'Sign-in failed. Please try again.';
  }

  if (window.PNPAuthBrowser) {
    window.PNPAuthBrowser.applyAuthBrowserUi({
      warningId: 'inapp-warning',
      googleButtonId: 'google-login-btn'
    });
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

  // Capture result when Google redirects back after authentication
  auth.getRedirectResult().then(async function (result) {
    if (result && result.user) {
      try {
        await saveUserProfile(result.user);
        window.location.replace('dashboard.html');
      } catch (err) {
        showError(friendlyError(err));
      }
    }
  }).catch(function (err) {
    if (err.code && err.code !== 'auth/cancelled-popup-request') {
      showError(friendlyError(err));
    }
  });

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
      if (window.PNPAuthBrowser && window.PNPAuthBrowser.isInAppBrowser) {
        showError(window.PNPAuthBrowser.inAppMessage());
        return;
      }

      if (window.PNPAuthBrowser && window.PNPAuthBrowser.shouldUseRedirectForGoogle()) {
        googleBtn.textContent = 'Redirecting to Google…';
        await auth.signInWithRedirect(googleProvider());
        return;
      }

      const result = await auth.signInWithPopup(googleProvider());
      await saveUserProfile(result.user);
      window.location.replace('dashboard.html');
    } catch (err) {
      // Popup was blocked — fall back to redirect only in real browsers, not in app webviews.
      if ((err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') && !(window.PNPAuthBrowser && window.PNPAuthBrowser.isInAppBrowser)) {
        googleBtn.textContent = 'Redirecting to Google…';
        try {
          await auth.signInWithRedirect(googleProvider());
        } catch (redirectErr) {
          showError(friendlyError(redirectErr));
          googleBtn.disabled = false;
          googleBtn.textContent = 'Continue with Google';
        }
      } else {
        showError(friendlyError(err));
        googleBtn.disabled = false;
        googleBtn.textContent = 'Continue with Google';
      }
    }
  });

  [emailEl, passEl].forEach(el => el.addEventListener('input', clearError));
});
