/* Portal Shared JS - StudyCanada Student Portal */

// ==================== AUTH STATE ====================
const PortalAuth = {
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('portal_user'));
    } catch { return null; }
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  setUser(user) {
    localStorage.setItem('portal_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('portal_user');
    window.location.href = 'login.html';
  },

  getDisplayName() {
    const u = this.getUser();
    if (!u) return 'Student';
    return u.name || u.email || 'Student';
  },

  getInitials() {
    const name = this.getDisplayName();
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
};

// ==================== PROFILE ====================
const PortalProfile = {
  STORAGE_KEY: 'portal_profile',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || this.emptyProfile();
    } catch { return this.emptyProfile(); }
  },

  save(profile) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    PortalUI.toast('Profile saved successfully!', 'success');
  },

  emptyProfile() {
    return {
      firstName: '', lastName: '', email: '', phone: '',
      country: '', nationality: '',
      gpa: '', gpaScale: '4.0',
      satScore: '', ieltsScore: '', toeflScore: '',
      program: '', budgetMin: '', budgetMax: '',
      provinces: [],
      extracurriculars: '',
      workExperience: '',
      targetSchools: 0,
      applicationStatus: 'Not Started'
    };
  },

  completionPercent() {
    const p = this.get();
    const fields = [
      p.firstName, p.lastName, p.email, p.country, p.nationality,
      p.gpa, p.program, p.budgetMin, p.provinces.length > 0,
      p.extracurriculars
    ];
    const filled = fields.filter(f => f).length;
    return Math.round((filled / fields.length) * 100);
  }
};

// ==================== UNIVERSITY DATA ====================
const Universities = [
  {
    name: 'University of Toronto',
    location: 'Toronto, ON',
    province: 'Ontario',
    tuitionIntl: 58680,
    programs: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Sciences'],
    minGPA: 3.7, minSAT: 1400, minIELTS: 6.5, minTOEFL: 89,
    ranking: 1, description: 'Top-ranked research university in Canada',
    website: 'https://www.utoronto.ca'
  },
  {
    name: 'University of British Columbia',
    location: 'Vancouver, BC',
    province: 'British Columbia',
    tuitionIntl: 51000,
    programs: ['Computer Science', 'Engineering', 'Business', 'Forestry', 'Arts', 'Sciences'],
    minGPA: 3.5, minSAT: 1350, minIELTS: 6.5, minTOEFL: 90,
    ranking: 2, description: 'Leading global research university on the Pacific',
    website: 'https://www.ubc.ca'
  },
  {
    name: 'McGill University',
    location: 'Montreal, QC',
    province: 'Quebec',
    tuitionIntl: 49000,
    programs: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Law'],
    minGPA: 3.5, minSAT: 1380, minIELTS: 6.5, minTOEFL: 86,
    ranking: 3, description: 'Prestigious trilingual research university',
    website: 'https://www.mcgill.ca'
  },
  {
    name: 'University of Waterloo',
    location: 'Waterloo, ON',
    province: 'Ontario',
    tuitionIntl: 53000,
    programs: ['Computer Science', 'Engineering', 'Mathematics', 'Sciences', 'Business'],
    minGPA: 3.3, minSAT: 1320, minIELTS: 6.5, minTOEFL: 90,
    ranking: 4, description: 'World-renowned for co-op and STEM programs',
    website: 'https://uwaterloo.ca'
  },
  {
    name: 'University of Alberta',
    location: 'Edmonton, AB',
    province: 'Alberta',
    tuitionIntl: 32000,
    programs: ['Engineering', 'Business', 'Sciences', 'Medicine', 'Arts', 'Education'],
    minGPA: 3.0, minSAT: 1250, minIELTS: 6.5, minTOEFL: 86,
    ranking: 5, description: 'Top research university with affordable tuition',
    website: 'https://www.ualberta.ca'
  },
  {
    name: 'McMaster University',
    location: 'Hamilton, ON',
    province: 'Ontario',
    tuitionIntl: 42000,
    programs: ['Engineering', 'Health Sciences', 'Business', 'Sciences', 'Humanities'],
    minGPA: 3.3, minSAT: 1300, minIELTS: 6.5, minTOEFL: 86,
    ranking: 6, description: 'Known for problem-based learning and health sciences',
    website: 'https://www.mcmaster.ca'
  },
  {
    name: 'University of Montreal',
    location: 'Montreal, QC',
    province: 'Quebec',
    tuitionIntl: 27000,
    programs: ['Computer Science', 'Engineering', 'Arts', 'Sciences', 'Law', 'Medicine'],
    minGPA: 3.0, minSAT: 1200, minIELTS: 6.0, minTOEFL: 80,
    ranking: 7, description: 'Leading French-language research university',
    website: 'https://www.umontreal.ca'
  },
  {
    name: 'University of Calgary',
    location: 'Calgary, AB',
    province: 'Alberta',
    tuitionIntl: 28000,
    programs: ['Engineering', 'Business', 'Sciences', 'Kinesiology', 'Arts'],
    minGPA: 3.0, minSAT: 1200, minIELTS: 6.5, minTOEFL: 86,
    ranking: 8, description: 'Dynamic research university near the Rocky Mountains',
    website: 'https://www.ucalgary.ca'
  },
  {
    name: 'Queen\'s University',
    location: 'Kingston, ON',
    province: 'Ontario',
    tuitionIntl: 51000,
    programs: ['Engineering', 'Business', 'Arts', 'Sciences', 'Law', 'Health Sciences'],
    minGPA: 3.5, minSAT: 1350, minIELTS: 6.5, minTOEFL: 88,
    ranking: 9, description: 'Prestigious university with strong community',
    website: 'https://www.queensu.ca'
  },
  {
    name: 'Western University',
    location: 'London, ON',
    province: 'Ontario',
    tuitionIntl: 44000,
    programs: ['Business', 'Engineering', 'Health Sciences', 'Arts', 'Sciences', 'Law'],
    minGPA: 3.3, minSAT: 1300, minIELTS: 6.5, minTOEFL: 83,
    ranking: 10, description: 'Comprehensive research university with top business school',
    website: 'https://www.uwo.ca'
  },
  {
    name: 'University of Ottawa',
    location: 'Ottawa, ON',
    province: 'Ontario',
    tuitionIntl: 40000,
    programs: ['Computer Science', 'Engineering', 'Arts', 'Law', 'Business', 'Medicine'],
    minGPA: 3.0, minSAT: 1200, minIELTS: 6.5, minTOEFL: 80,
    ranking: 11, description: 'Bilingual university in Canada\'s capital',
    website: 'https://www.uottawa.ca'
  },
  {
    name: 'Dalhousie University',
    location: 'Halifax, NS',
    province: 'Nova Scotia',
    tuitionIntl: 28000,
    programs: ['Computer Science', 'Engineering', 'Health Sciences', 'Arts', 'Sciences', 'Law'],
    minGPA: 3.0, minSAT: 1200, minIELTS: 6.5, minTOEFL: 86,
    ranking: 12, description: 'Atlantic Canada\'s leading research university',
    website: 'https://www.dal.ca'
  },
  {
    name: 'Simon Fraser University',
    location: 'Burnaby, BC',
    province: 'British Columbia',
    tuitionIntl: 33000,
    programs: ['Computer Science', 'Business', 'Engineering', 'Arts', 'Sciences'],
    minGPA: 3.0, minSAT: 1200, minIELTS: 6.5, minTOEFL: 88,
    ranking: 13, description: 'Innovative university known for co-op programs',
    website: 'https://www.sfu.ca'
  },
  {
    name: 'University of Manitoba',
    location: 'Winnipeg, MB',
    province: 'Manitoba',
    tuitionIntl: 20000,
    programs: ['Engineering', 'Business', 'Sciences', 'Agriculture', 'Arts', 'Medicine'],
    minGPA: 2.8, minSAT: 1100, minIELTS: 6.5, minTOEFL: 86,
    ranking: 14, description: 'Manitoba\'s largest and most comprehensive university',
    website: 'https://umanitoba.ca'
  },
  {
    name: 'University of Saskatchewan',
    location: 'Saskatoon, SK',
    province: 'Saskatchewan',
    tuitionIntl: 24000,
    programs: ['Engineering', 'Agriculture', 'Sciences', 'Business', 'Arts', 'Medicine'],
    minGPA: 2.8, minSAT: 1100, minIELTS: 6.5, minTOEFL: 86,
    ranking: 15, description: 'Leading research in water, food, and energy',
    website: 'https://www.usask.ca'
  },
  {
    name: 'Concordia University',
    location: 'Montreal, QC',
    province: 'Quebec',
    tuitionIntl: 26000,
    programs: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Design'],
    minGPA: 2.8, minSAT: 1100, minIELTS: 6.0, minTOEFL: 75,
    ranking: 16, description: 'Creative and innovative next-generation university',
    website: 'https://www.concordia.ca'
  },
  {
    name: 'York University',
    location: 'Toronto, ON',
    province: 'Ontario',
    tuitionIntl: 33000,
    programs: ['Business', 'Computer Science', 'Arts', 'Engineering', 'Law', 'Health'],
    minGPA: 2.8, minSAT: 1100, minIELTS: 6.5, minTOEFL: 83,
    ranking: 17, description: 'Toronto\'s diverse and comprehensive university',
    website: 'https://www.yorku.ca'
  }
];

// ==================== RECOMMENDATION ENGINE ====================
const RecommendationEngine = {
  calculateMatch(profile, uni) {
    let score = 0;
    let maxScore = 0;

    // GPA match (30%)
    maxScore += 30;
    if (profile.gpa) {
      const gpa = parseFloat(profile.gpa);
      const scale = parseFloat(profile.gpaScale) || 4.0;
      const normalized = (gpa / scale) * 4.0;
      if (normalized >= uni.minGPA) score += 30;
      else if (normalized >= uni.minGPA - 0.3) score += 20;
      else if (normalized >= uni.minGPA - 0.5) score += 10;
    } else {
      score += 15; // neutral if no data
    }

    // Program match (25%)
    maxScore += 25;
    if (profile.program) {
      const progLower = profile.program.toLowerCase();
      const match = uni.programs.some(p => p.toLowerCase().includes(progLower) || progLower.includes(p.toLowerCase()));
      if (match) score += 25;
    } else {
      score += 12;
    }

    // Budget match (20%)
    maxScore += 20;
    if (profile.budgetMax) {
      const budget = parseFloat(profile.budgetMax);
      if (uni.tuitionIntl <= budget) score += 20;
      else if (uni.tuitionIntl <= budget * 1.2) score += 10;
    } else {
      score += 10;
    }

    // Province preference (15%)
    maxScore += 15;
    if (profile.provinces && profile.provinces.length > 0) {
      if (profile.provinces.includes(uni.province)) score += 15;
    } else {
      score += 7;
    }

    // Test scores (10%)
    maxScore += 10;
    if (profile.ieltsScore) {
      if (parseFloat(profile.ieltsScore) >= uni.minIELTS) score += 10;
      else score += 4;
    } else if (profile.toeflScore) {
      if (parseInt(profile.toeflScore) >= uni.minTOEFL) score += 10;
      else score += 4;
    } else if (profile.satScore) {
      if (parseInt(profile.satScore) >= uni.minSAT) score += 10;
      else score += 4;
    } else {
      score += 5;
    }

    return Math.round((score / maxScore) * 100);
  },

  getRecommendations(profile) {
    return Universities.map(uni => ({
      ...uni,
      matchPercent: this.calculateMatch(profile, uni)
    })).sort((a, b) => b.matchPercent - a.matchPercent);
  },

  filterRecommendations(recommendations, filters) {
    return recommendations.filter(uni => {
      if (filters.program) {
        const p = filters.program.toLowerCase();
        if (!uni.programs.some(prog => prog.toLowerCase().includes(p))) return false;
      }
      if (filters.province && uni.province !== filters.province) return false;
      if (filters.maxTuition && uni.tuitionIntl > parseInt(filters.maxTuition)) return false;
      if (filters.minMatch && uni.matchPercent < parseInt(filters.minMatch)) return false;
      return true;
    });
  }
};

// ==================== UI HELPERS ====================
const PortalUI = {
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
  },

  initSidebar() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.portal-sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggle) {
          sidebar.classList.remove('open');
        }
      });
    }
  },

  initUserInfo() {
    const avatar = document.querySelector('.user-avatar');
    const name = document.querySelector('.user-name');
    const email = document.querySelector('.user-email');
    const user = PortalAuth.getUser();
    if (user && avatar) avatar.textContent = PortalAuth.getInitials();
    if (user && name) name.textContent = PortalAuth.getDisplayName();
    if (user && email) email.textContent = user.email || '';
  },

  renderSidebar(activePage) {
    const pages = [
      { href: 'dashboard.html', icon: '📊', label: 'Dashboard' },
      { href: 'profile.html', icon: '👤', label: 'Profile' },
      { href: 'recommendations.html', icon: '🎓', label: 'Recommendations' },
      { href: 'services.html', icon: '💎', label: 'Services' },
    ];

    return `
      <aside class="portal-sidebar" id="portalSidebar">
        <div class="portal-sidebar-header">
          <a href="../index.html" class="logo">🍁 Study<span>Canada</span></a>
          <div class="subtitle">Student Portal</div>
        </div>
        <nav class="portal-nav">
          ${pages.map(p => `
            <a href="${p.href}" class="${activePage === p.href ? 'active' : ''}">
              <span class="nav-icon">${p.icon}</span>
              ${p.label}
            </a>
          `).join('')}
          <div class="portal-nav-divider"></div>
          <a href="../uniprep/index.html">
            <span class="nav-icon">📚</span>
            UniPrep Tools
          </a>
          <a href="../index.html">
            <span class="nav-icon">🏠</span>
            Main Site
          </a>
        </nav>
        <div class="portal-sidebar-footer">
          <div class="user-info">
            <div class="user-avatar"></div>
            <div class="user-details">
              <div class="user-name"></div>
              <div class="user-email"></div>
            </div>
          </div>
        </div>
      </aside>
    `;
  },

  renderTopbar(title) {
    return `
      <header class="portal-topbar">
        <div style="display:flex;align-items:center;gap:12px;">
          <button class="mobile-menu-toggle" id="menuToggle">☰</button>
          <h1>${title}</h1>
        </div>
        <div class="topbar-actions">
          <a href="../index.html" class="back-to-site">← Main Site</a>
          <button class="portal-btn portal-btn-outline" onclick="PortalAuth.logout()" style="font-size:12px;padding:8px 16px;">Sign Out</button>
        </div>
      </header>
    `;
  },

  initPage(title, activePage) {
    document.body.innerHTML = `
      <div class="portal-wrapper">
        ${this.renderSidebar(activePage)}
        <main class="portal-main">
          ${this.renderTopbar(title)}
          <div class="portal-content" id="portalContent"></div>
        </main>
      </div>
    `;

    // Load CSS if not loaded
    if (!document.querySelector('link[href*="portal.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/portal.css';
      document.head.appendChild(link);
    }

    this.initSidebar();
    this.initUserInfo();
  }
};

// Make globally available
window.PortalAuth = PortalAuth;
window.PortalProfile = PortalProfile;
window.PortalUI = PortalUI;
window.RecommendationEngine = RecommendationEngine;
window.Universities = Universities;
