// auth-browser.js — mobile/in-app browser handling for Firebase Google auth
(function () {
  'use strict';

  const ua = navigator.userAgent || '';
  const isiOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isiOS || isAndroid || /Mobile/i.test(ua);

  // Google blocks OAuth in many embedded/in-app browsers (Instagram, Facebook,
  // TikTok, LinkedIn, Pinterest, etc.). Detect those early and push users to
  // email/password or a real browser before Firebase throws auth/internal-error.
  const isKnownInApp = /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Twitter|XTwitter|Snapchat|TikTok|Bytedance|MicroMessenger|Line\/|KAKAOTALK|Pinterest|GSA|wv/i.test(ua);
  const isIOSWebView = isiOS && /AppleWebKit/i.test(ua) && !/Safari\//i.test(ua) && !/CriOS\//i.test(ua) && !/FxiOS\//i.test(ua) && !/EdgiOS\//i.test(ua);
  const isInAppBrowser = isKnownInApp || isIOSWebView;

  function currentUrl() {
    return window.location.href;
  }

  function realBrowserName() {
    if (isiOS) return 'Safari';
    if (isAndroid) return 'Chrome';
    return 'your browser';
  }

  function inAppMessage() {
    return `Google sign-in is blocked in this app browser. Use email/password below, or tap the menu (⋯/⋮) and open this page in ${realBrowserName()}.`;
  }

  function googleErrorMessage(err) {
    const code = err && err.code;
    const msg = (err && err.message) || '';
    if (isInAppBrowser || code === 'auth/internal-error' || /disallowed_useragent|webview|in-app|popup|blocked/i.test(msg)) {
      return inAppMessage();
    }
    return null;
  }

  function shouldUseRedirectForGoogle() {
    // Popup auth is unreliable on phones even in real browsers. Redirect is the
    // safer Firebase flow for Safari/Chrome mobile, but still not for in-app browsers.
    return isMobile && !isInAppBrowser;
  }

  function applyAuthBrowserUi(options) {
    const warningEl = document.getElementById(options.warningId);
    const googleBtn = document.getElementById(options.googleButtonId);
    const emailInput = document.getElementById('email');

    if (!warningEl || !googleBtn) return;

    if (isInAppBrowser) {
      warningEl.innerHTML = `${inAppMessage()}<br><button type="button" class="btn btn-outline btn-full auth-copy-link" id="copy-browser-link">Copy page link</button>`;
      warningEl.classList.add('visible');

      googleBtn.disabled = true;
      googleBtn.classList.add('is-disabled');
      googleBtn.textContent = 'Google sign-in unavailable in this browser';
      googleBtn.title = 'Open this page in Safari/Chrome or use email/password.';

      const copyBtn = document.getElementById('copy-browser-link');
      if (copyBtn) {
        copyBtn.addEventListener('click', async function () {
          try {
            await navigator.clipboard.writeText(currentUrl());
            copyBtn.textContent = 'Link copied — open it in Safari/Chrome';
          } catch (_) {
            copyBtn.textContent = currentUrl();
          }
        });
      }

      if (emailInput) emailInput.focus({ preventScroll: true });
    }
  }

  window.PNPAuthBrowser = {
    isMobile,
    isInAppBrowser,
    shouldUseRedirectForGoogle,
    inAppMessage,
    googleErrorMessage,
    applyAuthBrowserUi
  };
})();
