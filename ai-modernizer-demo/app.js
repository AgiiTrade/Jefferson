const DEMO_EMAIL = 'viewer@demo.local';
const DEMO_PASS = '971MiizoHCf2omvYCfXAvhwr';

function isAuthed() {
  return sessionStorage.getItem('agiiDemoAuth') === 'yes';
}

function requireAuth() {
  if (!isAuthed()) location.href = pathToLogin();
}

function pathToLogin() {
  return location.pathname.includes('/demos/') ? '../../login/' : '../login/';
}

function doLogin() {
  const e = document.getElementById('email').value.trim();
  const p = document.getElementById('password').value;
  const msg = document.getElementById('msg');
  if (e === DEMO_EMAIL && p === DEMO_PASS) {
    sessionStorage.setItem('agiiDemoAuth', 'yes');
    sessionStorage.setItem('agiiDemoUser', e);
    location.href = '../dashboard/';
  } else {
    msg.textContent = 'Invalid demo credentials.';
    msg.style.color = '#ffb0b0';
  }
}

function logout() {
  sessionStorage.removeItem('agiiDemoAuth');
  location.href = '../login/';
}

function analyze() {
  const code = (document.getElementById('code') || {}).value || '';
  const lang = (document.getElementById('lang') || {}).value || 'legacy';
  const lines = code.split('\n').filter(Boolean).length || 42;
  const funcs = (code.match(/function|class|SUBROUTINE|BusComp|Applet|SELECT|PROCEDURE/gi) || []).length || 3;
  const score = Math.max(48, 88 - Math.min(30, Math.floor(lines / 12)) - funcs * 2);
  const targets = {
    siebel: 'Salesforce / modern CRM + API layer',
    cobol: 'Java/Spring or .NET service decomposition',
    plsql: 'API-backed data services + managed database',
    legacy: 'Cloud-native service architecture'
  };
  document.getElementById('out').textContent = `Modernization score: ${score}/100
Language/profile: ${lang}
Detected size: ${lines} logical lines
Detected components: ${funcs}
Target recommendation: ${targets[lang] || targets.legacy}

Priority roadmap:
1. Inventory screens, jobs, integrations, and data ownership.
2. Separate business rules from UI/database coupling.
3. Create API contracts and migration parity tests.
4. Pilot one high-value workflow before full migration.

Risk notes:
- Validate security and role mapping before go-live.
- Reconcile legacy data quality defects early.
- Keep rollback plan until user acceptance is complete.`;
}
