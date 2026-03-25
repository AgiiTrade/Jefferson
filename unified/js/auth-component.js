// Reusable Login Component for All Apps

class AuthComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.user = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-overlay" id="authOverlay">
        <div class="auth-modal">
          <button class="auth-close" id="authClose">&times;</button>
          <div class="auth-header">
            <h2>Welcome! 👋</h2>
            <p>Sign in to save your progress and sync across devices</p>
          </div>
          
          <div class="auth-social">
            <button class="auth-btn google" id="googleBtn">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            
            <button class="auth-btn facebook" id="facebookBtn">
              <i class="fab fa-facebook-f"></i>
              Continue with Facebook
            </button>
            
            <button class="auth-btn apple" id="appleBtn">
              <i class="fab fa-apple"></i>
              Continue with Apple
            </button>
            
            <button class="auth-btn guest" id="guestBtn">
              <i class="fas fa-user-secret"></i>
              Continue as Guest
            </button>
          </div>
          
          <div class="auth-divider"><span>or</span></div>
          
          <form class="auth-email" id="emailForm">
            <input type="email" placeholder="Email address" required>
            <input type="password" placeholder="Password" required>
            <button type="submit" class="auth-btn email">Sign In</button>
          </form>
          
          <p class="auth-footer">
            Don't have an account? <a href="#" id="showSignup">Sign up</a>
          </p>
        </div>
      </div>
      
      <div class="auth-status" id="authStatus" style="display:none">
        <span id="userName"></span>
        <button id="signOutBtn">Sign Out</button>
      </div>
    `;
  }

  attachEvents() {
    // Google Sign In
    document.getElementById('googleBtn')?.addEventListener('click', async () => {
      const result = await window.authFunctions.signInWithGoogle();
      if (result.success) this.onLoginSuccess(result.user);
    });

    // Facebook Sign In
    document.getElementById('facebookBtn')?.addEventListener('click', async () => {
      const result = await window.authFunctions.signInWithFacebook();
      if (result.success) this.onLoginSuccess(result.user);
    });

    // Apple Sign In
    document.getElementById('appleBtn')?.addEventListener('click', async () => {
      const result = await window.authFunctions.signInWithApple();
      if (result.success) this.onLoginSuccess(result.user);
    });

    // Guest Sign In
    document.getElementById('guestBtn')?.addEventListener('click', async () => {
      const result = await window.authFunctions.signInAsGuest();
      if (result.success) this.onLoginSuccess(result.user);
    });

    // Email Form
    document.getElementById('emailForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      const password = e.target.querySelector('input[type="password"]').value;
      const result = await window.authFunctions.signInWithEmail(email, password);
      if (result.success) this.onLoginSuccess(result.user);
    });

    // Close Modal
    document.getElementById('authClose')?.addEventListener('click', () => {
      document.getElementById('authOverlay').style.display = 'none';
    });

    // Sign Out
    document.getElementById('signOutBtn')?.addEventListener('click', async () => {
      await window.authFunctions.signOut();
      this.onLogout();
    });
  }

  onLoginSuccess(user) {
    this.user = user;
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('authStatus').style.display = 'flex';
    document.getElementById('userName').textContent = user.displayName || user.email || 'Guest';
    localStorage.setItem('user', JSON.stringify({ uid: user.uid, name: user.displayName }));
  }

  onLogout() {
    this.user = null;
    document.getElementById('authStatus').style.display = 'none';
    localStorage.removeItem('user');
  }

  showLogin() {
    document.getElementById('authOverlay').style.display = 'flex';
  }
}

// Export
window.AuthComponent = AuthComponent;
