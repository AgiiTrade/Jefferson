const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:3100/api`
  : '/api';

// ── Code Analysis ──────────────────────────────────────────
async function runDemo() {
  const code = document.getElementById('demoCode').value.trim();
  const lang = document.getElementById('langSelect').value;
  const output = document.getElementById('demoOutput');
  const btn = document.getElementById('runBtn');

  if (!code) { alert('Please paste some code first'); return; }

  btn.disabled = true;
  btn.textContent = '⚡ Analyzing...';
  output.innerHTML = '<p class="placeholder">Running AI analysis pipeline...</p>';

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language: lang })
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    renderResults(data, output);
  } catch (err) {
    output.innerHTML = `<p style="color:#e94560">Error: ${err.message}</p>
      <p style="color:#9aa0a6;margin-top:8px">Make sure the backend is running on port 3100.</p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Analyze Code';
  }
}

function renderResults(data, container) {
  let html = '';

  // Modernization score
  const score = data.modernizationScore || 50;
  const scoreClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-medium' : 'score-low';
  html += `<div class="result-section">
    <h4>Modernization Score</h4>
    <span class="score-badge ${scoreClass}">${score}/100</span>
  </div>`;

  // Overview
  html += `<div class="result-section">
    <h4>Overview</h4>
    <p style="color:var(--text2)">
      <strong>${data.lines}</strong> lines • 
      <strong>${data.language}</strong> • 
      <strong>${data.functions?.length || 0}</strong> functions •
      Complexity: <span class="complexity-badge complexity-${data.complexity}">${data.complexity}</span>
    </p>
    <p style="color:var(--text2);margin-top:4px">Estimated tech debt: <strong>${data.techDebt}</strong></p>
  </div>`;

  // Functions
  if (data.functions?.length) {
    html += `<div class="result-section"><h4>Functions Detected</h4><ul>`;
    data.functions.forEach(f => {
      html += `<li><code>${f.name}</code> (${f.params} params) — complexity: ${f.complexity}</li>`;
    });
    html += `</ul></div>`;
  }

  // Issues
  if (data.issues?.length) {
    html += `<div class="result-section"><h4>⚠️ Issues Found</h4><ul>`;
    data.issues.forEach(i => {
      html += `<li style="color:#e94560">${i.message}${i.line ? ` (line ${i.line})` : ''}</li>`;
    });
    html += `</ul></div>`;
  }

  // Suggestions
  if (data.suggestions?.length) {
    html += `<div class="result-section"><h4>💡 Recommendations</h4><ul>`;
    data.suggestions.forEach(s => { html += `<li>${s}</li>`; });
    html += `</ul></div>`;
  }

  // Refactoring steps
  if (data.refactoringSteps?.length) {
    html += `<div class="result-section"><h4>🔄 Refactoring Roadmap</h4><ul>`;
    data.refactoringSteps.forEach(s => { html += `<li>${s}</li>`; });
    html += `</ul></div>`;
  }

  // Test suggestions
  if (data.testCoverage?.suggestions?.length) {
    html += `<div class="result-section"><h4>🧪 Test Coverage Suggestions</h4>
      <p style="color:var(--text2);font-size:0.85rem;margin-bottom:6px">Estimated coverage potential: ${data.testCoverage.estimated}%</p><ul>`;
    data.testCoverage.suggestions.slice(0, 5).forEach(s => {
      html += `<li style="font-family:monospace;font-size:0.8rem">${escapeHtml(s)}</li>`;
    });
    html += `</ul></div>`;
  }

  container.innerHTML = html;
}

// ── Contact Form ───────────────────────────────────────────
async function submitContact() {
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage')?.value.trim() || '';
  const msg = document.getElementById('contactSuccess');

  if (!email) { alert('Please enter your email'); return; }

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message })
    });
    if (res.ok) {
      msg.style.display = 'block';
      document.getElementById('contactEmail').value = '';
    }
  } catch (err) {
    alert('Could not send. Please try again.');
  }
}

// ── Stats ──────────────────────────────────────────────────
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    document.getElementById('stat-analyses').textContent = data.totalAnalyses || 0;
  } catch { /* silent */ }
}

// ── Helpers ────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
});
