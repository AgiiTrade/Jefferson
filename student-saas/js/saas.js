/* UniPrep SaaS Logic */

// ==================== AUTH ====================
const SaasAuth = {
  STORAGE_KEY: 'uniprep_user',

  getUser() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
    catch { return {}; }
  },

  isLoggedIn() {
    const u = this.getUser();
    return !!(u.email || u.name);
  },

  setUser(user) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  },

  demoLogin() {
    this.setUser({ name: 'Demo Student', email: 'demo@uniprep.com', plan: 'free' });
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('uniprep_usage');
    window.location.href = 'index.html';
  }
};

// ==================== PLANS ====================
const SaasPlans = {
  FREE: {
    name: 'Free',
    price: 0,
    recommendations: 3,
    essayTools: false,
    tracking: false,
    analytics: false,
    branding: false,
    students: 1
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    recommendations: Infinity,
    essayTools: true,
    tracking: true,
    analytics: true,
    branding: false,
    students: 1
  },
  INSTITUTION: {
    name: 'Institution',
    price: 49.99,
    recommendations: Infinity,
    essayTools: true,
    tracking: true,
    analytics: true,
    branding: true,
    students: 50
  },

  getPlanLabel(planId) {
    const labels = { free: 'Free Plan', pro: 'Pro Plan', institution: 'Institution Plan' };
    return labels[planId] || 'Free Plan';
  },

  getPlan(planId) {
    return this[planId.toUpperCase()] || this.FREE;
  }
};

// ==================== USAGE TRACKING ====================
const SaasUsage = {
  STORAGE_KEY: 'uniprep_usage',

  get() {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
      if (data) return data;
    } catch {}
    return this.reset();
  },

  save(usage) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usage));
  },

  reset() {
    const defaults = {
      plan: 'free',
      recommendationsUsed: 0,
      essaysWritten: 0,
      applicationsTracked: 0,
      lastActive: new Date().toISOString(),
      stripeSessionId: null
    };
    this.save(defaults);
    return defaults;
  },

  incrementRecommendations() {
    const usage = this.get();
    usage.recommendationsUsed++;
    usage.lastActive = new Date().toISOString();
    this.save(usage);
    return usage;
  },

  incrementEssay() {
    const usage = this.get();
    usage.essaysWritten = Math.max(usage.essaysWritten, usage.essaysWritten + 0); // placeholder
    usage.lastActive = new Date().toISOString();
    this.save(usage);
  },

  canGetRecommendation() {
    const usage = this.get();
    if (usage.plan !== 'free') return true;
    return usage.recommendationsUsed < SaasPlans.FREE.recommendations;
  },

  getRemainingRecommendations() {
    const usage = this.get();
    if (usage.plan !== 'free') return Infinity;
    return Math.max(0, SaasPlans.FREE.recommendations - usage.recommendationsUsed);
  },

  upgradePlan(planId) {
    const usage = this.get();
    usage.plan = planId;
    usage.lastActive = new Date().toISOString();
    this.save(usage);
    return usage;
  }
};

// ==================== STRIPE CHECKOUT (PLACEHOLDER) ====================
const SaasStripe = {
  // Replace with your actual Stripe publishable key
  publishableKey: 'pk_test_PLACEHOLDER',

  async createCheckoutSession(planId) {
    const plan = SaasPlans.getPlan(planId);

    // --- PLACEHOLDER: Replace with real Stripe integration ---
    // In production, this calls your backend to create a Stripe Checkout Session:
    //
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     plan: planId,
    //     priceId: planId === 'pro' ? 'price_pro_monthly' : 'price_institution_monthly',
    //     successUrl: window.location.origin + '/dashboard.html?upgraded=true',
    //     cancelUrl: window.location.origin + '/pricing.html',
    //   })
    // });
    // const { sessionId, url } = await response.json();
    // window.location.href = url;

    // Demo: simulate upgrade
    console.log(`[Stripe Placeholder] Creating checkout for: ${plan.name} ($${plan.price}/mo)`);

    const confirmed = confirm(
      `Upgrade to ${plan.name} Plan — $${plan.price}/mo\n\n` +
      `This is a demo. In production, this redirects to Stripe Checkout.\n\n` +
      `Proceed with simulated upgrade?`
    );

    if (confirmed) {
      SaasUsage.upgradePlan(planId);
      SaasUI.toast(`Upgraded to ${plan.name} plan!`, 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    }
  },

  async openCustomerPortal() {
    // --- PLACEHOLDER: Replace with real Stripe Customer Portal ---
    // In production:
    // const response = await fetch('/api/create-portal-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ customerId: currentUser.stripeCustomerId })
    // });
    // const { url } = await response.json();
    // window.location.href = url;

    alert('Stripe Customer Portal — Coming soon. Contact support@uniprep.com to manage your subscription.');
  }
};

// ==================== UI HELPERS ====================
const SaasUI = {
  toast(message, type = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Make globally available
window.SaasAuth = SaasAuth;
window.SaasPlans = SaasPlans;
window.SaasUsage = SaasUsage;
window.SaasStripe = SaasStripe;
window.SaasUI = SaasUI;
