# Security Review — PNP Homes Portal

## Reviewed by: Claude (automated review, 2026-05-13)
## Source: `property-saas/` (RentBoss prototype)
## New build: `pnphomes-saas/`

---

## Critical Vulnerabilities Found in the Original Prototype

### 1. Passwords stored with `btoa()` — CRITICAL

**File:** `property-saas/js/secure-storage.js` (lines 53, 66)

```js
password: btoa(password)    // signup
u.password === btoa(password) // login check
```

`btoa()` is Base64 encoding — it is **not encryption**. Any attacker who gains
read access to localStorage (via XSS, browser extension, or physical device
access) can decode every password in milliseconds with `atob()`.

**Mitigation in PNP Homes Portal:**  
Passwords are never stored anywhere by the portal. Firebase Auth handles all
credential management server-side using secure hashing (bcrypt internally).
The portal calls `auth.signInWithEmailAndPassword()` and `auth.createUserWithEmailAndPassword()`.

---

### 2. PII in localStorage — HIGH

**File:** `property-saas/js/secure-storage.js`, `property-saas/js/property.js`

Tenant names, email addresses, phone numbers, lease terms, and financial
records were persisted to `localStorage` under the `rb_` prefix, base64-encoded.
localStorage is:
- Readable by any JavaScript on the same origin (XSS risk).
- Not encrypted at rest.
- Not protected by HTTPS in transit (it never leaves the browser).
- Shared across tabs and sessions with no access controls.
- Not appropriate for storing PII under PIPEDA/PHIPA.

**Mitigation in PNP Homes Portal:**  
All data is stored in Firestore (Google Cloud, `northamerica-northeast1` region
if configured). Firestore is HTTPS-only, encrypted at rest by Google, and
access-controlled by the security rules in `firestore.rules`.

---

### 3. Firebase config was placeholder only — HIGH

**File:** `property-saas/js/firebase-integration.js` (lines 3–10)

The Firebase config contained `"YOUR_API_KEY"` etc. This means the Firebase
backend was never actually connected. All data lived only in localStorage.

**Mitigation in PNP Homes Portal:**  
`js/firebase-config.js` has placeholder values with a clear comment block
directing the operator to fill them in from the Firebase Console before
deploying. The comment explains that web API keys are not secrets (security
comes from Firestore Rules), but real values must be filled in before the
portal accepts user registrations.

---

### 4. No auth guard on protected pages — HIGH

**Files:** All `property-saas/*.html` pages

The original pages rendered dashboard content regardless of login state.
`SecureDB.isLoggedIn()` was sometimes called, but it returned `true` if a
`rb_user` key existed in localStorage — easily forged.

**Mitigation in PNP Homes Portal:**  
`js/auth-guard.js` runs on every protected page. It hides the page with
`visibility: hidden` on first paint, then calls `auth.onAuthStateChanged()`.
If Firebase returns `null` (no authenticated session), the visitor is
immediately redirected to `login.html` with `window.location.replace()` (no
back-button bypass). Only a real Firebase Auth token grants page access.

---

### 5. Firestore rules allowed `sharedWith` array bypass — MEDIUM

**File:** `property-saas/firestore.rules` (lines 26–27)

```
allow read: if isAuthenticated() &&
  (resource.data.userId == request.auth.uid ||
   resource.data.sharedWith has request.auth.uid);
```

Any user who could write a document and add their own UID to another user's
`sharedWith` array could read that landlord's properties. No server-side
validation prevented self-granting access.

**Mitigation in PNP Homes Portal:**  
The `sharedWith` mechanism is removed entirely. Rules enforce
`resource.data.userId == request.auth.uid` without any alternative path.

---

### 6. Tenant email bypass allowed cross-user reads — MEDIUM

**File:** `property-saas/firestore.rules` (lines 39–41)

```
allow read: if isAuthenticated() &&
  (resource.data.userId == request.auth.uid ||
   resource.data.email == request.auth.token.email);
```

A logged-in user who shared an email address with a tenant record could read
that tenant's PII across account boundaries.

**Mitigation in PNP Homes Portal:**  
Removed. Only the owning landlord (`userId == request.auth.uid`) can read or
write tenant records.

---

### 7. No email verification enforced — LOW

The original prototype had no concept of email verification.

**Mitigation in PNP Homes Portal:**  
`signup.js` calls `cred.user.sendEmailVerification()` immediately after account
creation. Users are prompted to verify their address. (Login is not blocked
until verified — see Future Work.)

---

### 8. Firebase Auth used `localStorage` session persistence — LOW

**File:** `property-saas/js/firebase-integration.js` (lines 37–43)

The integration cached user info in `localStorage.setItem('rentboss_user', …)` and
used it as a fallback for `isLoggedIn()`. This means logging out from Firebase
Auth while the cached key remained would still pass the `isLoggedIn()` check.

**Mitigation in PNP Homes Portal:**  
No manual localStorage session caching. Auth state is checked exclusively via
`auth.onAuthStateChanged()`. Firebase SDK manages its own secure session tokens
(IndexedDB-backed in compat mode). `pnpLogout()` calls `auth.signOut()` and
redirects — the SDK clears its own tokens.

---

## New Security Controls Added

| Control | Implementation |
|---|---|
| Firebase Auth (real) | `js/firebase-config.js` + `auth.onAuthStateChanged()` |
| Auth guard on every protected page | `js/auth-guard.js` |
| Firestore-only data storage | `js/firestore-store.js` (no localStorage) |
| Owner-only Firestore rules | `firestore.rules` (hardened) |
| Email verification trigger | `js/signup.js` |
| Firebase error messages | `js/login.js`, `js/signup.js`, `js/forgot-password.js` |
| Password reset flow | `forgot-password.html` + `js/forgot-password.js` |
| Content Security Policy | `<meta http-equiv="Content-Security-Policy">` on all pages |
| No inline scripts | All JS in external files (CSP-compatible) |
| Privacy Policy link | Footer on every page |
| Form validation | Client-side + Firebase-enforced server-side |

---

## Future Work (Out of Scope for This Pass)

The following controls are recommended for production hardening but were not
implemented in this phase:

- **MFA / TOTP 2FA** — Firebase Auth supports TOTP MFA. Recommended for
  landlords who manage more than a handful of properties.
- **Email-verification gate at login** — Currently users can sign in before
  verifying their email. Enforce `user.emailVerified` check in the auth guard
  to block unverified sessions.
- **Audit logging** — Firebase does not provide built-in audit logs for
  Firestore writes. Cloud Functions with a write-through logging pattern to a
  separate `audit_log` collection is the standard approach.
- **Cloud Functions server-side validation** — Firestore rules validate who
  can write, not whether the data is valid. A Cloud Function trigger can
  validate field types, ranges, and business rules before data is committed.
- **Encryption-at-rest beyond Firestore defaults** — Firestore encrypts data
  at rest using Google-managed keys. For highly sensitive data, customer-managed
  encryption keys (CMEK) can be configured at the Firebase project level.
- **Brute-force rate limiting** — Firebase Auth has built-in rate limiting, but
  a Cloud Function proxy with stricter limits is better for regulated environments.
- **DNS / domain setup** — HTTPS enforcement via Cloudflare or Firebase Hosting
  redirects for `pnphomes.ca`. (Arfeen to configure manually.)
- **Dependency scanning** — No npm dependencies in this build (vanilla JS +
  Firebase CDN), but future tooling additions should include `npm audit` in CI.
