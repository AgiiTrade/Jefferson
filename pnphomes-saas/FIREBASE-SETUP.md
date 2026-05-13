# Firebase Setup Guide — PNP Homes Portal

**Time required:** ~20 minutes  
**Prerequisites:** Google account, access to Firebase Console

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Name it: `pnphomes-portal` (or similar)
4. Disable Google Analytics (optional — not needed for this app)
5. Click **Create project** and wait for provisioning

---

## Step 2 — Enable Email/Password Authentication

1. In the Firebase Console, select your project
2. Left sidebar → **Authentication** → **Get started**
3. Click the **Sign-in method** tab
4. Click **Email/Password**
5. Toggle **Enable** ON (top switch)
6. Leave "Email link (passwordless)" OFF
7. Click **Save**

**Add authorized domain:**
1. Still in Authentication → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Add: `pnphomes.ca`
4. Add: `agiitrade.github.io` (for GitHub Pages testing)

---

## Step 3 — Enable Firestore Database

1. Left sidebar → **Firestore Database** → **Create database**
2. Select **Start in production mode**  
   *(The security rules file in this repo replaces the default rules.)*
3. Choose region: **northamerica-northeast1 (Montreal)** — recommended for
   Canadian tenant PII data (closest to GTA, keeps data in Canada)
4. Click **Enable**

---

## Step 4 — Apply Firestore Security Rules

1. In Firestore Database → click the **Rules** tab
2. Delete the default rules
3. Open `pnphomes-saas/firestore.rules` from this repo
4. Copy the entire file content and paste it into the Rules editor
5. Click **Publish**

**Verify the rules look correct:**  
The rules should deny all access to unauthenticated users and restrict every
collection to documents where `userId == request.auth.uid`.

---

## Step 5 — Create Required Firestore Indexes

Firestore requires composite indexes for multi-field queries. The portal uses
queries like "get tenants WHERE userId = X AND propertyId = Y ORDER BY createdAt".

**Create these indexes in Firestore → Indexes → Composite:**

| Collection | Fields | Order |
|---|---|---|
| `tenants` | `userId` ASC, `propertyId` ASC, `createdAt` DESC |
| `leases` | `userId` ASC, `status` ASC, `endDate` ASC |
| `transactions` | `userId` ASC, `type` ASC, `date` DESC |
| `transactions` | `userId` ASC, `propertyId` ASC, `date` DESC |
| `maintenance` | `userId` ASC, `propertyId` ASC, `createdAt` DESC |

**Shortcut:** When you first use the portal, Firestore will log index errors in
the browser console with a direct link to create the missing index. Click those
links for each collection and the indexes will be created automatically.

---

## Step 6 — Get Your Web App Config

1. In Firebase Console → Project Overview (gear icon) → **Project settings**
2. Scroll to **Your apps** → click the **</>** (Web) icon
3. Register app with nickname: `pnphomes-portal`
4. You do NOT need Firebase Hosting (we use GitHub Pages)
5. After registration, copy the `firebaseConfig` object shown

---

## Step 7 — Fill In the Config File

Open `pnphomes-saas/js/firebase-config.js` and replace each placeholder:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",          // ← paste your actual key
  authDomain:        "pnphomes-portal.firebaseapp.com",
  projectId:         "pnphomes-portal",
  storageBucket:     "pnphomes-portal.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abc123..."
};
```

**Security note:** Firebase web API keys are safe to include in client-side
JavaScript. They identify your project — security comes from Firestore Rules
and Firebase Auth, not from keeping the key secret. Do not confuse web API
keys with service account JSON keys (those must never be committed to git).

---

## Step 8 — Deploy to GitHub Pages

```bash
# In the Jefferson repo root
git add pnphomes-saas/ pnphomes.html
git commit -m "Add PNP Homes property management portal"
git push origin main
```

The portal will be live at:
`https://agiitrade.github.io/Jefferson/pnphomes-saas/login.html`

To use the custom domain `pnphomes.ca`:
1. Configure DNS CNAME: `portal.pnphomes.ca → agiitrade.github.io`
2. OR set up Firebase Hosting with a custom domain redirect

---

## Step 9 — Create Your First Account

1. Visit `https://agiitrade.github.io/Jefferson/pnphomes-saas/signup.html`
2. Enter your name, email, and password
3. Check your inbox for the verification email and click the link
4. Sign in at the login page
5. Start adding properties

---

## Ongoing Maintenance

- **Firestore backups:** Use the **Export** button in the Reports page to download
  a JSON backup. Schedule this monthly.
- **Firebase Auth users:** View and manage users at Authentication → Users in the
  Firebase Console. You can disable or delete accounts from there.
- **Monitoring costs:** Firestore free tier (Spark plan) allows 1 GiB storage,
  50K reads/day, 20K writes/day. A typical small landlord portfolio (10 units,
  daily use) will stay well within the free tier.
- **Upgrade plan:** If you exceed free tier, upgrade to Blaze (pay-as-you-go).
  For typical small portfolio use, monthly costs should be under $1 CAD.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Firebase not initialized" in console | `firebase-config.js` still has placeholder values | Fill in real config from Firebase Console |
| Portal redirects to login immediately | Firebase config invalid / project not created | Check config, verify project exists |
| "Missing index" error in console | Composite index not created | Click the link in the error message to auto-create |
| Reads blocked with PERMISSION_DENIED | Firestore rules not updated | Re-paste and publish `firestore.rules` |
| Email verification not arriving | Email in spam, or auth domain not set | Check spam; add `pnphomes.ca` to authorized domains |
