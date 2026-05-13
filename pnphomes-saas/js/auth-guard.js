// ===== AUTH GUARD — PNP Homes Portal =====
// Include on every protected page AFTER firebase-config.js.
// Hides the document until Firebase confirms auth state.
// Redirects to login.html if the user is not signed in.
// Dispatches 'pnp:ready' with { user } so page scripts know when to load data.

let pnpCurrentUser = null;

document.documentElement.style.visibility = 'hidden';

auth.onAuthStateChanged(function (user) {
  if (!user) {
    window.location.replace('login.html');
    return;
  }

  pnpCurrentUser = user;
  document.documentElement.style.visibility = 'visible';

  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';

  const nameEl   = document.getElementById('sidebar-user-name');
  const emailEl  = document.getElementById('sidebar-user-email');
  const avatarEl = document.getElementById('sidebar-user-avatar');
  if (nameEl)   nameEl.textContent   = user.displayName || user.email.split('@')[0];
  if (emailEl)  emailEl.textContent  = user.email;
  if (avatarEl) avatarEl.textContent = (user.displayName || user.email || 'U')[0].toUpperCase();

  const dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-CA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  document.dispatchEvent(new CustomEvent('pnp:ready', { detail: { user } }));
});

function pnpLogout() {
  auth.signOut().then(function () {
    window.location.replace('login.html');
  });
}
