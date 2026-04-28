const $ = (id) => document.getElementById(id);
let state = null;

const money = (n) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n || 0);
const pct = (n) => `${Math.max(0, Math.min(100, Math.round(n || 0)))}%`;

async function api(path, options = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function load() {
  const [health, payload] = await Promise.all([api('/api/health'), api('/api/siebel-demo')]);
  state = payload;
  $('apiStatus').textContent = `API online · ${health.database?.status || health.status}`;
  $('apiStatus').classList.add('ok');
  $('healthOut').textContent = JSON.stringify({ status: health.status, database: health.database, uptime: Math.round(health.uptime) }, null, 2);
  $('payloadOut').textContent = JSON.stringify(payload, null, 2).slice(0, 5000);
  render();
}

function render() {
  renderLegacy();
  renderMigration();
  renderModern();
}

function renderLegacy() {
  $('legacyAccounts').innerHTML = state.accounts.map(a => `<tr><td>${a.legacy_id}</td><td>${a.name}</td><td>${a.industry}</td><td>${a.legacy_status}</td><td>${a.owner}</td></tr>`).join('');
  $('legacyCases').innerHTML = state.cases.map(c => `<tr><td>${c.legacy_ticket}</td><td>${c.severity}</td><td>${c.legacy_queue}</td><td>${c.title}</td></tr>`).join('');
}

function metric(label, value, hint = '') { return `<div class="metric"><b>${value}</b><span>${label}${hint ? ` · ${hint}` : ''}</span></div>`; }

function renderMigration() {
  $('migrationMetrics').innerHTML = [
    metric('Migration completion', pct(state.metrics.migrationPercent), 'validated objects'),
    metric('Open defects', state.metrics.migrationDefects, 'demo reconciliation'),
    metric('Customer records', state.metrics.accounts, 'seeded accounts'),
    metric('Pipeline migrated', money(state.metrics.pipeline), 'opportunities')
  ].join('');
  $('migrationCards').innerHTML = state.migration.map(p => {
    const done = Math.round((p.migrated_objects / Math.max(1, p.source_objects)) * 100);
    return `<article class="phase-card"><h3>${p.phase}<span class="badge ${p.status === 'Complete' ? '' : 'warn'}">${p.status}</span></h3><div class="bar"><i style="width:${done}%"></i></div><p>${p.notes}</p><div class="row"><span>${p.migrated_objects.toLocaleString()} / ${p.source_objects.toLocaleString()} objects</span><span>${p.defects} defects</span></div></article>`;
  }).join('');
}

function renderModern() {
  $('modernMetrics').innerHTML = [
    metric('Avg customer health', state.metrics.avgHealthScore, 'AI scored'),
    metric('Open service cases', state.metrics.openCases, `${state.metrics.criticalCases} urgent`),
    metric('Portfolio revenue', money(state.metrics.totalRevenue), 'customer 360'),
    metric('Sales pipeline', money(state.metrics.pipeline), 'next actions')
  ].join('');
  $('caseAccount').innerHTML = state.accounts.map(a => `<option value="${a.legacy_id}">${a.name}</option>`).join('');
  $('modernAccounts').innerHTML = state.accounts.map(a => `<div class="account"><h4>${a.name}</h4><div class="row"><span>${a.industry} · ${a.region}</span><b>${money(a.revenue)}</b></div><div class="row"><span>${a.modern_status}</span><span>Owner: ${a.owner}</span></div><div class="health"><i style="width:${a.health_score}%"></i></div></div>`).join('');
  $('modernCases').innerHTML = state.cases.map(c => `<div class="case ${String(c.severity).toLowerCase()}"><h4>${c.legacy_ticket}: ${c.title}</h4><div class="row"><span>${c.severity} · SLA ${c.sla_hours}h</span><b>${c.modern_stage}</b></div><div class="ai">🤖 ${c.ai_summary}</div><button onclick="advanceCase(${c.id})" style="margin-top:10px">Advance workflow</button></div>`).join('');
  $('opportunities').innerHTML = state.opportunities.map(o => `<div class="oppty"><h4>${o.name}</h4><div class="row"><span>${o.stage} · close ${o.close_date}</span><b>${money(o.amount)}</b></div><div class="ai">Next best action: ${o.ai_next_action}</div></div>`).join('');
}

async function advanceCase(id) {
  state = await api(`/api/siebel-demo/cases/${id}`, { method: 'PATCH', body: JSON.stringify({ modernStage: 'Customer update sent · resolution in progress' }) });
  $('payloadOut').textContent = JSON.stringify(state, null, 2).slice(0, 5000);
  render();
}

$('caseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = $('caseTitle').value.trim();
  if (!title) return;
  state = await api('/api/siebel-demo/cases', { method: 'POST', body: JSON.stringify({ accountLegacyId: $('caseAccount').value, severity: $('caseSeverity').value, title }) });
  $('caseTitle').value = '';
  $('payloadOut').textContent = JSON.stringify(state, null, 2).slice(0, 5000);
  render();
});

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab,.view').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  $(btn.dataset.view).classList.add('active');
}));

load().catch(err => {
  $('apiStatus').textContent = 'API error — start backend with npm start';
  $('healthOut').textContent = err.message;
  console.error(err);
});
