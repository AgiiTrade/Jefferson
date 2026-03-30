# UniPrep — Student Success Platform

## Setup Instructions for Institutions

### Quick Start

1. **Deploy** — Upload the `student-saas/` folder to any static hosting (Netlify, Vercel, S3, etc.)
2. **Configure** — Edit `js/saas.js` to add your Stripe keys (see Stripe Setup below)
3. **Customize** — Update branding, pricing, and university data as needed

### File Structure

```
student-saas/
├── index.html          # Landing page with pricing, features, testimonials
├── dashboard.html      # Student dashboard (post-login)
├── pricing.html        # Detailed pricing comparison & billing FAQ
├── affiliate.html      # Affiliate program page
├── INSTALLED-README.md # This file
├── css/
│   ├── saas.css        # Global SaaS styles
│   └── dashboard.css   # Dashboard-specific styles
└── js/
    └── saas.js         # Auth, usage tracking, Stripe checkout, plan logic
```

### Plan Tiers

| Feature              | Free ($0)        | Pro ($9.99/mo)       | Institution ($49.99/mo) |
|---------------------|------------------|----------------------|------------------------|
| Recommendations      | 3 total          | Unlimited            | Unlimited              |
| Essay Tools          | ✗                | ✓                    | ✓                      |
| Application Tracking | ✗                | ✓                    | ✓                      |
| Analytics            | ✗                | ✓                    | ✓                      |
| Students             | 1                | 1                    | Up to 50               |
| Custom Branding      | ✗                | ✗                    | ✓                      |
| CSV Export           | ✗                | ✗                    | ✓                      |
| Support              | Community        | Priority Email       | Dedicated + Phone      |

### Stripe Setup (Production)

The platform includes a Stripe checkout placeholder. To enable real payments:

1. Create a Stripe account at https://stripe.com
2. Create Products & Prices in the Stripe Dashboard:
   - `price_pro_monthly` — $9.99/mo recurring
   - `price_institution_monthly` — $49.99/mo recurring
   - `price_pro_annual` — $7.99/mo billed annually ($95.88/yr)
   - `price_institution_annual` — $39.99/mo billed annually ($479.88/yr)
3. Create a backend endpoint (`/api/create-checkout-session`) that:
   - Accepts `priceId` and `plan` from the frontend
   - Creates a Stripe Checkout Session
   - Returns `{ sessionId, url }`
4. Create a Customer Portal endpoint (`/api/create-portal-session`) for subscription management
5. Update `js/saas.js` → `SaasStripe` object:
   - Replace `publishableKey` with your Stripe publishable key
   - Uncomment the real fetch calls in `createCheckoutSession()` and `openCustomerPortal()`
   - Remove the demo `confirm()` dialog

### Customization

#### Change University Data
Edit `js/saas.js` to modify universities, programs, or add new countries. The recommendation engine uses GPA, test scores, budget, and location preferences.

#### Rebrand
1. Search/replace "UniPrep" in all HTML files
2. Update CSS variables in `css/saas.css` (`:root` block) for colors
3. Replace the 🎓 emoji logo with your own

#### Add Authentication
The current system uses `localStorage` for demo purposes. For production:
- Replace `SaasAuth` in `js/saas.js` with Firebase Auth, Auth0, or your own backend
- Add server-side session management
- Store user data and usage in a database (PostgreSQL, MongoDB, etc.)

### Deployment

**Netlify:**
```bash
cd student-saas
netlify deploy --prod
```

**Vercel:**
```bash
cd student-saas
vercel --prod
```

**Manual / Any Host:**
Upload all files preserving the directory structure.

### Institution Features

When you purchase the Institution plan:
- **Multi-student management** — Add up to 50 student accounts under one billing
- **Analytics dashboard** — Track all students' progress, recommendations, and applications
- **Custom branding** — Upload your school logo, set brand colors
- **CSV export** — Download student data and analytics
- **SSO integration** — Connect with your school's identity provider
- **Dedicated account manager** — Direct support channel

Contact: support@uniprep.com for Institution onboarding.

---

© 2026 UniPrep. Built for students, by educators.
