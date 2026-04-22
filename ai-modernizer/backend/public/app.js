// Agii.ca™ © 2022. All rights reserved.
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:3100/api`
  : '/api';

const SAMPLE_SNIPPETS = {
  javascript: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  if (total > 1000) total = total * 0.9;
  return total;
}

function processOrder(order, customer, discount, tax, shipping, insurance) {
  var subtotal = calculateTotal(order.items);
  var result = subtotal - discount;
  result = result + (result * tax);
  result = result + shipping + insurance;
  return result;
}`,
  python: `def calculate_total(items):
    total = 0
    for item in items:
        total += item['price'] * item['quantity']
    return total

def process_order(order, discount, tax_rate):
    subtotal = calculate_total(order)
    final_total = subtotal - discount
    final_total = final_total + (final_total * tax_rate)
    print(final_total)
    return final_total`,
  messy: `var users = [];

function saveUser(a,b,c,d,e,f){
  if(a){
    eval('users.push({name:a,email:b,role:c,active:d,team:e,meta:f})');
  }
  try {
  } catch(err) {}
  return users;
}`,
  cobol: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PAYROLL-CALC.
       ENVIRONMENT DIVISION.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-EMP-RECORD.
          05 WS-EMP-ID        PIC X(10).
          05 WS-EMP-NAME      PIC X(30).
          05 WS-HOURS-WORKED  PIC 9(3)V99.
          05 WS-HOURLY-RATE   PIC 9(5)V99.
          05 WS-GROSS-PAY     PIC 9(7)V99.
          05 WS-TAX-AMOUNT    PIC 9(7)V99.
          05 WS-NET-PAY       PIC 9(7)V99.
       01 WS-TAX-RATE         PIC 9V99 VALUE 0.22.
       01 WS-OVERTIME-MULT    PIC 9V9  VALUE 1.5.
       PROCEDURE DIVISION.
       0000-MAIN-PARA.
           PERFORM 1000-READ-EMPLOYEE
           PERFORM 2000-CALC-PAY
           PERFORM 3000-CALC-TAX
           PERFORM 4000-WRITE-PAYSLIP
           STOP RUN.
       1000-READ-EMPLOYEE.
           ACCEPT WS-EMP-ID
           ACCEPT WS-HOURS-WORKED
           ACCEPT WS-HOURLY-RATE.
       2000-CALC-PAY.
           IF WS-HOURS-WORKED > 40
               COMPUTE WS-GROSS-PAY =
                   (40 * WS-HOURLY-RATE) +
                   ((WS-HOURS-WORKED - 40) *
                    WS-HOURLY-RATE * WS-OVERTIME-MULT)
           ELSE
               COMPUTE WS-GROSS-PAY =
                   WS-HOURS-WORKED * WS-HOURLY-RATE
           END-IF.
       3000-CALC-TAX.
           COMPUTE WS-TAX-AMOUNT =
               WS-GROSS-PAY * WS-TAX-RATE.
           COMPUTE WS-NET-PAY =
               WS-GROSS-PAY - WS-TAX-AMOUNT.
       4000-WRITE-PAYSLIP.
           DISPLAY "Employee: " WS-EMP-ID
           DISPLAY "Gross:    " WS-GROSS-PAY
           DISPLAY "Tax:      " WS-TAX-AMOUNT
           DISPLAY "Net:      " WS-NET-PAY.`,
  java: `import java.util.*;

public class OrderProcessor {
    private List<Map<String, Object>> orders = new ArrayList<>();
    private static double TAX_RATE = 0.08;

    public double calculateTotal(List<Map<String, Object>> items) {
        double total = 0;
        for (Map<String, Object> item : items) {
            double price = (Double) item.get("price");
            int qty = (Integer) item.get("quantity");
            total += price * qty;
        }
        return total;
    }

    public Map<String, Object> processOrder(Map<String, Object> order,
            String customerId, double discount, boolean expedited) {
        double subtotal = calculateTotal(
            (List<Map<String, Object>>) order.get("items"));
        double taxed = subtotal + (subtotal * TAX_RATE);
        double finalTotal = taxed - discount;
        if (expedited) finalTotal += 15.00;

        Map<String, Object> result = new HashMap<>();
        result.put("customerId", customerId);
        result.put("total", finalTotal);
        result.put("status", "processed");
        System.out.println("Order processed: " + finalTotal);
        return result;
    }
}`,
  sql: `CREATE OR REPLACE PROCEDURE sp_monthly_payroll_report (
    p_department_id IN NUMBER,
    p_month        IN DATE
) AS
    v_total_gross  NUMBER(12,2) := 0;
    v_total_tax    NUMBER(12,2) := 0;
    v_emp_count    NUMBER := 0;
    CURSOR c_employees IS
        SELECT e.employee_id, e.first_name, e.last_name,
               e.salary, e.hire_date, d.department_name
        FROM employees e
        JOIN departments d ON e.department_id = d.department_id
        WHERE e.department_id = p_department_id
          AND e.status = 'ACTIVE'
        ORDER BY e.last_name;
BEGIN
    FOR emp IN c_employees LOOP
        v_emp_count := v_emp_count + 1;
        v_total_gross := v_total_gross + emp.salary;
        v_total_tax := v_total_tax + (emp.salary * 0.22);

        INSERT INTO payroll_ledger (employee_id, pay_period, gross_amount,
                                     tax_amount, net_amount, created_at)
        SELECT emp.employee_id, p_month, emp.salary,
               emp.salary * 0.22, emp.salary * 0.78, SYSDATE
        FROM dual;
    END LOOP;

    UPDATE department_summaries
    SET total_payroll = v_total_gross,
        total_tax = v_total_tax,
        headcount = v_emp_count,
        report_month = p_month
    WHERE department_id = p_department_id;

    COMMIT;
END sp_monthly_payroll_report;`,
  siebel: `function BusComp_PreSetFieldValue (FieldName, FieldValue) {
  if (FieldName == "Status" && FieldValue == "Approved") {
    var service = TheApplication().GetService("Workflow Process Manager");
    var inputs = TheApplication().NewPropertySet();
    inputs.SetProperty("ProcessName", "Submit Approved Case");
    inputs.SetProperty("RowId", this.GetFieldValue("Id"));
    service.InvokeMethod("RunProcess", inputs, TheApplication().NewPropertySet());
  }
  return (ContinueOperation);
}`,
  curam: `package curam.casework.impl;

public class EligibilityFacade {
  public boolean assessEligibility(CaseDetails details, Evidence evidence) {
    if (details == null || evidence == null) {
      return false;
    }
    if (evidence.getIncome() < 20000 && details.isActive()) {
      return true;
    }
    return false;
  }
}`
};

let lastAnalysis = null;
let progressTimer = null;
let lastUploadedFilename = '';

function getModernizationGuidance(language) {
  const map = {
    cobol: {
      targetPlatforms: [
        { name: 'Java Spring Boot', fit: 'Best for enterprise service decomposition and long-term backend modernization.' },
        { name: '.NET', fit: 'Strong fit when the target organization is standardized on Microsoft and Azure.' },
        { name: 'Service-first API layer', fit: 'Useful when preserving core rules while gradually replacing mainframe-adjacent workflows.' }
      ],
      modernizationBlueprint: [
        'Extract business rules and record layouts first.',
        'Create characterization tests around payroll, eligibility, tax, or batch logic.',
        'Move file, batch, and reporting flows into modular services and typed schemas.'
      ],
      migrationPaths: [
        { from: 'COBOL', to: 'Java Spring Boot', useWhen: 'You need durable enterprise services, APIs, and long-term maintainability.' },
        { from: 'COBOL', to: '.NET', useWhen: 'The target organization is Microsoft-centered and Azure is the strategic platform.' },
        { from: 'COBOL', to: 'Service-first API layer', useWhen: 'You want phased strangler-style modernization without a big-bang rewrite.' }
      ]
    },
    siebel: {
      targetPlatforms: [
        { name: 'Salesforce', fit: 'Best when the target state is CRM, case management, and workflow automation.' },
        { name: 'Java Spring Boot', fit: 'Best when Siebel scripts and integrations need to become APIs and backend services.' },
        { name: '.NET', fit: 'Strong option for enterprise internal-service modernization in Microsoft-heavy shops.' }
      ],
      modernizationBlueprint: [
        'Inventory Siebel business components, applets, workflows, and integration objects.',
        'Separate CRM process rules from UI event scripts and transport logic.',
        'Map each module into Salesforce, service APIs, or .NET services based on workflow fit.'
      ],
      migrationPaths: [
        { from: 'Siebel', to: 'Salesforce', useWhen: 'You are modernizing CRM, case handling, service workflows, and user operations.' },
        { from: 'Siebel', to: 'Java Spring Boot', useWhen: 'You need API-first backend services and custom workflow/integration control.' },
        { from: 'Siebel', to: '.NET', useWhen: 'The target enterprise stack is Microsoft-first and CRM logic is moving into internal services.' }
      ]
    },
    curam: {
      targetPlatforms: [
        { name: 'Java Spring Boot', fit: 'Best when rebuilding case-management logic into a modern enterprise service platform.' },
        { name: 'Salesforce', fit: 'Strong option for case workflows, worker experience, and service-centered operations.' },
        { name: '.NET', fit: 'Good fit when the target enterprise stack is Microsoft-first and case portals are being rebuilt.' }
      ],
      modernizationBlueprint: [
        'Inventory IBM Cúram case flows, evidence models, CER rules, and eligibility decisions.',
        'Separate rules, case orchestration, and channel UX before migration starts.',
        'Rebuild by module with regression tests around eligibility and case outcomes.'
      ],
      migrationPaths: [
        { from: 'IBM Cúram', to: 'Java Spring Boot', useWhen: 'You want a strong enterprise case-management backend with modular business services.' },
        { from: 'IBM Cúram', to: 'Salesforce', useWhen: 'You want worker-facing case workflows and service operations on a modern CRM platform.' },
        { from: 'IBM Cúram', to: '.NET', useWhen: 'The organization is standardizing on Microsoft and rebuilding portals plus back-office workflows.' }
      ]
    },
    powerbuilder: {
      targetPlatforms: [
        { name: 'Java Spring Boot + React', fit: 'Best for replacing thick-client UI with modern web services and frontend.' },
        { name: '.NET + React', fit: 'Strong fit in Microsoft enterprises modernizing rich-client internal apps.' }
      ],
      modernizationBlueprint: [
        'Separate UI events from business rules and database access.',
        'Extract data flows into service APIs.',
        'Rebuild screens incrementally on a modern web frontend.'
      ],
      migrationPaths: [
        { from: 'PowerBuilder', to: 'Java Spring Boot + React', useWhen: 'You want a web-native rebuild with flexible backend services.' },
        { from: 'PowerBuilder', to: '.NET + React', useWhen: 'Your enterprise is Microsoft-first and replacing thick-client internal apps.' }
      ]
    },
    natural: {
      targetPlatforms: [
        { name: 'Java Spring Boot', fit: 'Best for enterprise business-rule modernization with strong service boundaries.' },
        { name: '.NET', fit: 'Good fit for Microsoft-based modernization programs with strong internal tooling.' }
      ],
      modernizationBlueprint: [
        'Map Natural subroutines and data access flows first.',
        'Document Adabas or related data relationships.',
        'Replace batch and procedural flows with tested services.'
      ],
      migrationPaths: [
        { from: 'Natural', to: 'Java Spring Boot', useWhen: 'You want service boundaries and durable enterprise modernization.' },
        { from: 'Natural', to: '.NET', useWhen: 'The target operating model is Microsoft-based with internal enterprise tooling.' }
      ]
    },
    adabas: {
      targetPlatforms: [
        { name: 'Postgres-backed service platform', fit: 'Best for migrating legacy data access into relational services.' },
        { name: 'Java Spring Boot', fit: 'Best when complex domain logic and integration services need a durable landing zone.' }
      ],
      modernizationBlueprint: [
        'Model files and access patterns before schema migration.',
        'Preserve query behavior with regression tests.',
        'Move data access behind typed repositories and APIs.'
      ],
      migrationPaths: [
        { from: 'Adabas', to: 'Postgres-backed service platform', useWhen: 'You are modernizing data access and moving toward relational service architectures.' },
        { from: 'Adabas', to: 'Java Spring Boot', useWhen: 'You need durable business services around complex domain logic and integrations.' }
      ]
    }
  };

  return map[language] || {
    targetPlatforms: [
      { name: 'Java Spring Boot', fit: 'Strong default for enterprise backend modernization.' },
      { name: '.NET', fit: 'Strong option for Microsoft-centered enterprise environments.' },
      { name: 'Modern web app + API', fit: 'Good fit when flexibility and phased rebuild matter more than platform lock-in.' }
    ],
    modernizationBlueprint: [
      'Preserve current behavior with regression tests first.',
      'Separate business rules from UI, database, and transport concerns.',
      'Rebuild in phased work packages with service boundaries and clear ownership.'
    ],
    migrationPaths: [
      { from: String(language || 'Legacy system').toUpperCase(), to: 'Java Spring Boot', useWhen: 'You need enterprise APIs, modular services, and long-term maintainability.' },
      { from: String(language || 'Legacy system').toUpperCase(), to: '.NET', useWhen: 'The target organization is Microsoft-centered and wants a familiar enterprise stack.' },
      { from: String(language || 'Legacy system').toUpperCase(), to: 'Modern web app + API', useWhen: 'You want a phased rebuild with flexible frontend and backend choices.' }
    ]
  };
}

async function runDemo() {
  const code = document.getElementById('demoCode').value.trim();
  const lang = document.getElementById('langSelect').value;
  const output = document.getElementById('demoOutput');
  const btn = document.getElementById('runBtn');

  if (!code) {
    showToast('Paste code or upload a file first.', 'error');
    return;
  }

  btn.disabled = true;
  btn.classList.add('loading');
  output.innerHTML = `<div class="progress-bar"><div class="fill" id="analysisProgress"></div></div><p class="placeholder">Running AI analysis pipeline...</p>`;
  startProgressAnimation();

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language: lang, filename: lastUploadedFilename })
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    lastAnalysis = data;
    renderResults(data, output);
    showToast('Analysis complete.', 'success');
    loadStats();
    loadActivityTicker();
    loadAnalytics();
  } catch (err) {
    const fallback = fallbackAnalyze(code, lang);
    fallback.fallbackMode = true;
    fallback.error = err.message;
    lastAnalysis = fallback;
    renderResults(fallback, output);
    showToast('Backend unavailable, used built-in demo analyzer.', 'error');
    loadActivityTicker();
  } finally {
    stopProgressAnimation();
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

function renderResults(data, container) {
  const score = data.modernizationScore || 50;
  const guidance = {
    targetPlatforms: data.targetPlatforms || getModernizationGuidance(data.language).targetPlatforms,
    modernizationBlueprint: data.modernizationBlueprint || getModernizationGuidance(data.language).modernizationBlueprint,
    migrationPaths: data.migrationPaths || getModernizationGuidance(data.language).migrationPaths
  };
  const stroke = 2 * Math.PI * 22;
  const dash = stroke - (stroke * score / 100);
  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#e94560';

  let html = `<div class="result-section">
    <h4>Modernization Score</h4>
    <div class="score-ring">
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <circle class="track" cx="28" cy="28" r="22"></circle>
        <circle class="value" cx="28" cy="28" r="22" stroke="${scoreColor}" stroke-dasharray="${stroke}" stroke-dashoffset="${dash}"></circle>
      </svg>
      <div class="label">${score}/100</div>
    </div>
  </div>`;

  html += `<div class="result-section">
    <h4>Overview</h4>
    <p style="color:var(--text2)">
      <strong>${data.lines}</strong> lines •
      <strong>${data.language}</strong> •
      <strong>${data.functions?.length || 0}</strong> functions •
      Complexity: <span class="complexity-badge complexity-${data.complexity}">${data.complexity}</span>
    </p>
    <p style="color:var(--text2);margin-top:4px">Estimated tech debt: <strong>${data.techDebt}</strong></p>
    <p style="color:var(--text2);margin-top:4px">Request ID: <strong>${escapeHtml(data.requestId || 'n/a')}</strong></p>
  </div>`;

  if (data.fallbackMode) {
    html += `<div class="result-section">
      <h4>Demo Mode</h4>
      <p style="color:var(--warning)">Backend API was unavailable, so this result used the built-in browser analyzer. It is useful for demos, but backend mode gives richer persistence and reporting.</p>
    </div>`;
  }

  if (data.functions?.length) {
    html += `<div class="result-section"><h4>Functions Detected</h4><ul>`;
    data.functions.forEach(f => {
      html += `<li><code>${escapeHtml(f.name)}</code> (${f.params} params)${f.startLine ? `, line ${f.startLine}` : ''} — complexity: ${escapeHtml(f.complexity)}</li>`;
    });
    html += `</ul></div>`;
  }

  if (data.issues?.length) {
    html += `<div class="result-section"><h4>Issues Found</h4><ul>`;
    data.issues.forEach(i => {
      html += `<li style="color:#e94560">${escapeHtml(i.message)}${i.line ? ` (line ${i.line})` : ''}</li>`;
    });
    html += `</ul></div>`;
  }

  if (data.suggestions?.length) {
    html += `<div class="result-section"><h4>Recommendations</h4><ul>`;
    data.suggestions.forEach(s => { html += `<li>${escapeHtml(s)}</li>`; });
    html += `</ul></div>`;
  }

  if (data.refactoringSteps?.length) {
    html += `<div class="result-section"><h4>Refactoring Roadmap</h4><ul>`;
    data.refactoringSteps.forEach(s => { html += `<li>${escapeHtml(s)}</li>`; });
    html += `</ul></div>`;
  }

  if (guidance.targetPlatforms?.length) {
    html += `<div class="result-section"><h4>Recommended Target Platforms</h4><div style="display:grid;gap:10px">`;
    guidance.targetPlatforms.forEach(t => {
      html += `<div style="border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.02)"><div style="font-weight:700;margin-bottom:4px">${escapeHtml(t.name)}</div><div style="color:var(--text2);font-size:0.9rem">${escapeHtml(t.fit)}</div></div>`;
    });
    html += `</div></div>`;
  }

  if (guidance.modernizationBlueprint?.length) {
    html += `<div class="result-section"><h4>Modernization Blueprint</h4><ol>`;
    guidance.modernizationBlueprint.forEach(step => {
      html += `<li>${escapeHtml(step)}</li>`;
    });
    html += `</ol></div>`;
  }

  if (guidance.migrationPaths?.length) {
    html += `<div class="result-section"><h4>Source to Target Migration Paths</h4><div style="display:grid;gap:10px">`;
    guidance.migrationPaths.forEach(path => {
      html += `<div style="border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.02)"><div style="font-weight:700;margin-bottom:4px">${escapeHtml(path.from)} → ${escapeHtml(path.to)}</div><div style="color:var(--text2);font-size:0.9rem">${escapeHtml(path.useWhen)}</div></div>`;
    });
    html += `</div></div>`;
  }

  if (data.testCoverage?.suggestions?.length) {
    html += `<div class="result-section"><h4>Test Coverage Suggestions</h4>
      <p style="color:var(--text2);font-size:0.85rem;margin-bottom:6px">Estimated coverage potential: ${data.testCoverage.estimated}%</p><ul>`;
    data.testCoverage.suggestions.slice(0, 5).forEach(s => {
      html += `<li style="font-family:monospace;font-size:0.8rem">${escapeHtml(s)}</li>`;
    });
    html += `</ul></div>`;
  }

  container.innerHTML = html;
}

async function submitContact() {
  const name = document.getElementById('contactName')?.value.trim() || '';
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage')?.value.trim() || '';
  const msg = document.getElementById('contactSuccess');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid work email.', 'error');
    return;
  }

  const fullMessage = name ? `Name: ${name}\n\n${message}` : message;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message: fullMessage })
    });
    if (!res.ok) throw new Error('Contact request failed');
    msg.textContent = 'Thanks, your assessment request has been received. We will reply with the fastest path to a focused pilot.';
    msg.style.display = 'block';
    document.getElementById('contactEmail').value = '';
    const nameField = document.getElementById('contactName');
    const messageField = document.getElementById('contactMessage');
    if (nameField) nameField.value = '';
    if (messageField) messageField.value = '';
    loadStats();
    showToast('Assessment request sent.', 'success');
    loadAnalytics();
  } catch (err) {
    window.location.href = `mailto:hello@agii.ai?subject=${encodeURIComponent('AI Modernization Inquiry')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request Assessment';
    }
  }
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    setStat('stat-analyses', data.totalAnalyses || 0);
    setStat('stat-avg-score', data.avgModernizationScore || 0);
    setStat('stat-contacts', data.totalContacts || 0);
  } catch {
    setStat('stat-analyses', 0);
    setStat('stat-avg-score', 0);
    setStat('stat-contacts', 0);
  }
}

async function checkApiHealth() {
  const el = document.getElementById('apiStatus');
  if (!el) return;
  el.classList.remove('ok', 'warn');
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('health check failed');
    el.textContent = 'API live';
    el.classList.add('ok');
  } catch {
    el.textContent = 'Static demo mode';
    el.classList.add('warn');
  }
}

function loadSample(kind) {
  const code = document.getElementById('demoCode');
  const lang = document.getElementById('langSelect');
  if (!code || !lang) return;
  const extMap = { python: 'py', cobol: 'cob', java: 'java', sql: 'sql', javascript: 'js', messy: 'js', siebel: 'ejs', curam: 'java' };
  lastUploadedFilename = `${kind}-sample.${extMap[kind] || 'txt'}`;
  code.value = SAMPLE_SNIPPETS[kind] || SAMPLE_SNIPPETS.javascript;
  const langMap = { python: 'python', cobol: 'cobol', java: 'java', sql: 'plsql', javascript: 'javascript', messy: 'javascript', siebel: 'siebel', curam: 'curam' };
  lang.value = langMap[kind] || 'auto';
}

function copyResults() {
  if (!lastAnalysis) return showToast('Run an analysis first.', 'error');
  navigator.clipboard.writeText(JSON.stringify(lastAnalysis, null, 2))
    .then(() => showToast('Analysis copied.', 'success'))
    .catch(() => showToast('Could not copy analysis.', 'error'));
}

function downloadResults(format = 'json') {
  if (!lastAnalysis) return showToast('Run an analysis first.', 'error');

  if (format === 'html') {
    const d = lastAnalysis;
    const score = d.modernizationScore || 50;
    const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#e94560';
    const scoreLabel = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Critical';
    const issueRows = (d.issues || []).map(i => `<tr><td style="color:#e94560;font-weight:600">${escapeHtml(i.type || 'issue')}</td><td>${escapeHtml(i.message)}</td><td>${i.line || '—'}</td></tr>`).join('');
    const funcRows = (d.functions || []).map(f => `<tr><td><code>${escapeHtml(f.name)}</code></td><td>${f.params}</td><td>${f.lines || '—'}</td><td><span class="badge badge-${f.complexity}">${f.complexity}</span></td></tr>`).join('');
    const sugList = (d.suggestions || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
    const roadmapList = (d.refactoringSteps || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
    const testList = (d.testCoverage?.suggestions || []).slice(0, 6).map(s => `<li><code>${escapeHtml(s)}</code></li>`).join('');
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Agii Modernization Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;line-height:1.6;padding:0}
.cover{background:linear-gradient(135deg,#0f3460,#533483,#e94560);color:#fff;padding:60px 48px 48px;position:relative}
.cover h1{font-size:2rem;margin-bottom:8px}
.cover p{opacity:0.85;font-size:0.95rem}
.cover .logo{font-size:1.1rem;font-weight:800;margin-bottom:24px;letter-spacing:0.5px}
.main{max-width:800px;margin:0 auto;padding:40px 48px 60px}
h2{font-size:1.15rem;color:#533483;margin:32px 0 12px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #f0f0f0;padding-bottom:8px}
.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:20px 0}
.summary-box{background:#f8f9fa;border-radius:12px;padding:16px;text-align:center}
.summary-box .num{font-size:1.6rem;font-weight:800;color:#0f3460}
.summary-box .lbl{font-size:0.75rem;color:#666;margin-top:4px}
.score-ring-wrap{text-align:center;margin:24px 0}
.score-num{font-size:3rem;font-weight:800;color:${scoreColor}}
.score-label{font-size:0.9rem;color:#666}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:0.88rem}
th{background:#f8f9fa;text-align:left;padding:10px 12px;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.3px;color:#666}
td{padding:10px 12px;border-bottom:1px solid #f0f0f0}
code{background:#f0f0f5;padding:2px 6px;border-radius:4px;font-size:0.82rem}
ul{margin:8px 0 8px 20px}
li{margin:6px 0;font-size:0.9rem}
.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:0.75rem;font-weight:600}
.badge-low{background:#d1fae5;color:#065f46}
.badge-medium{background:#fef3c7;color:#92400e}
.badge-high{background:#fee2e2;color:#991b1b}
.footer{text-align:center;margin-top:48px;padding-top:24px;border-top:1px solid #e5e5e5;color:#999;font-size:0.78rem}
@media print{.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="cover">
<div class="logo">&#x2B21; Agii.ca</div>
<h1>Legacy Code Modernization Report</h1>
<p>Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &bull; ${escapeHtml(d.language)} &bull; ${d.lines} lines analyzed</p>
</div>
<div class="main">
<div class="score-ring-wrap">
<div class="score-num">${score}<span style="font-size:1.2rem;color:#999">/100</span></div>
<div class="score-label">Modernization Score &mdash; ${scoreLabel}</div>
</div>
<div class="summary-grid">
<div class="summary-box"><div class="num">${d.lines}</div><div class="lbl">Lines</div></div>
<div class="summary-box"><div class="num">${(d.functions||[]).length}</div><div class="lbl">Functions</div></div>
<div class="summary-box"><div class="num">${(d.issues||[]).length}</div><div class="lbl">Issues</div></div>
<div class="summary-box"><div class="num">${escapeHtml(d.techDebt||'—')}</div><div class="lbl">Est. Tech Debt</div></div>
</div>
${(d.issues||[]).length ? `<h2>Issues Found</h2><table><thead><tr><th>Type</th><th>Description</th><th>Line</th></tr></thead><tbody>${issueRows}</tbody></table>` : ''}
${(d.functions||[]).length ? `<h2>Functions Analyzed</h2><table><thead><tr><th>Name</th><th>Params</th><th>Lines</th><th>Complexity</th></tr></thead><tbody>${funcRows}</tbody></table>` : ''}
${(d.suggestions||[]).length ? `<h2>Recommendations</h2><ul>${sugList}</ul>` : ''}
${(d.refactoringSteps||[]).length ? `<h2>Refactoring Roadmap</h2><ol>${roadmapList}</ol>` : ''}
${(d.testCoverage?.suggestions||[]).length ? `<h2>Test Coverage Suggestions</h2><p style="color:#666;font-size:0.85rem;margin-bottom:8px">Estimated coverage potential: ${d.testCoverage.estimated}%</p><ul>${testList}</ul>` : ''}
<div class="footer">
<p><strong>Agii.ca</strong> &mdash; AI-Powered Legacy Modernization</p>
<p style="margin-top:4px">This report was generated by the Agii.ca analysis engine. Request ID: ${escapeHtml(d.requestId || 'n/a')}</p>
</div>
</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agii-modernization-report-${safeTimestamp()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'csv') {
    const d = lastAnalysis;
    const rows = [['Field', 'Value']];
    rows.push(['Language', d.language]);
    rows.push(['Lines', d.lines]);
    rows.push(['Functions', (d.functions || []).length]);
    rows.push(['Complexity', d.complexity]);
    rows.push(['Modernization Score', d.modernizationScore]);
    rows.push(['Tech Debt Estimate', d.techDebt]);
    rows.push(['Issues Count', (d.issues || []).length]);
    rows.push(['Request ID', d.requestId || '']);
    rows.push(['Timestamp', d.timestamp || '']);
    rows.push([]);
    if ((d.issues || []).length) {
      rows.push(['Issue Type', 'Message', 'Line']);
      (d.issues || []).forEach(i => rows.push([i.type || '', i.message, i.line || '']));
      rows.push([]);
    }
    if ((d.functions || []).length) {
      rows.push(['Function', 'Params', 'Lines', 'Complexity']);
      (d.functions || []).forEach(f => rows.push([f.name, f.params, f.lines || '', f.complexity]));
      rows.push([]);
    }
    if ((d.suggestions || []).length) {
      rows.push(['Recommendations']);
      (d.suggestions || []).forEach(s => rows.push([s]));
    }
    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agii-analysis-${safeTimestamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'pdf') {
    downloadResults('html');
    showToast('Report downloaded. Open it in your browser and use Print > Save as PDF for a polished PDF.', 'success');
    return;
  }

  const blob = new Blob([JSON.stringify(lastAnalysis, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agii-analysis-${safeTimestamp()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function fallbackAnalyze(code, forcedLanguage) {
  const lines = code.split('\n').length;
  const upper = code.toUpperCase();
  const language = forcedLanguage && forcedLanguage !== 'auto'
    ? forcedLanguage
    : (upper.includes('IDENTIFICATION DIVISION') || upper.includes('PROCEDURE DIVISION')
        ? 'cobol'
        : upper.includes('CREATE OR REPLACE PROCEDURE') || upper.includes('EXEC SQL')
          ? 'plsql'
          : upper.includes('SELECT ') || upper.includes('INSERT INTO ') || upper.includes('UPDATE ')
            ? 'sql'
            : /\bSUB\b|\bFUNCTION\b|ON ERROR RESUME NEXT/i.test(code)
              ? 'vb'
              : upper.includes('USING SYSTEM;') || upper.includes('CONSOLE.WRITELINE')
                ? 'csharp'
                : upper.includes('PUBLIC CLASS') || upper.includes('SYSTEM.OUT.PRINT')
                  ? 'java'
                  : /^\s*[A-Z0-9_]+\s+BEGSR\b/gim.test(code)
                    ? 'rpg'
                    : upper.includes('BUSCOMP_') || upper.includes('THESERVICE') || upper.includes('THEAPPLICATION().GETBUSOBJECT')
                      ? 'siebel'
                      : upper.includes('CURAM.') || upper.includes('CER_') || (upper.includes('EVIDENCE') && upper.includes('ELIGIBILITY'))
                        ? 'curam'
                        : code.includes('def ')
                          ? 'python'
                          : 'javascript');
  const functions = language === 'python'
    ? [...code.matchAll(/^(\s*)def\s+(\w+)\s*\(([^)]*)\):/gm)].map(m => ({ name: m[2], params: m[3].split(',').filter(Boolean).length, complexity: 'medium' }))
    : language === 'cobol'
      ? [...upper.matchAll(/^\s*(\d{4}-[A-Z0-9-]+|[A-Z0-9-]+)\.\s*$/gm)].map(m => ({ name: m[1], params: 0, complexity: 'medium' }))
      : ['java','csharp'].includes(language)
        ? [...code.matchAll(/(?:public|private|protected|internal)?\s*(?:static\s+)?[A-Za-z0-9_<>,\[\]?]+\s+(\w+)\s*\(([^)]*)\)\s*\{/g)].map(m => ({ name: m[1], params: (m[2] || '').split(',').filter(Boolean).length, complexity: 'medium' }))
        : language === 'vb'
          ? [...code.matchAll(/(?:Public|Private|Protected|Friend)?\s*(?:Shared\s+)?(?:Function|Sub)\s+(\w+)\s*\(([^)]*)\)/gi)].map(m => ({ name: m[1], params: (m[2] || '').split(',').filter(Boolean).length, complexity: 'medium' }))
          : ['sql','plsql'].includes(language)
            ? [...upper.matchAll(/\b(PROCEDURE|FUNCTION|TRIGGER|PACKAGE)\s+([A-Z0-9_]+)/gi)].map(m => ({ name: m[2], params: 0, complexity: 'medium' }))
            : language === 'rpg'
              ? [...code.matchAll(/^\s*([A-Z0-9_]+)\s+BEGSR\b/gim)].map(m => ({ name: m[1], params: 0, complexity: 'medium' }))
              : language === 'siebel'
                ? [...code.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)|\b(BusComp_[A-Za-z0-9_]+)\b|\b(Applet_[A-Za-z0-9_]+)\b/gi)].map(m => ({ name: m[1] || m[3] || m[4] || '(anonymous)', params: (m[2] || '').split(',').filter(Boolean).length, complexity: 'medium' }))
                : language === 'curam'
                  ? [...code.matchAll(/(?:class|interface)\s+([A-Za-z0-9_]+)/g)].map(m => ({ name: m[1], params: 0, complexity: 'medium' }))
                  : [...code.matchAll(/function\s+(\w+)\s*\(([^)]*)\)|const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g)].map(m => ({ name: m[1] || m[3] || '(anonymous)', params: (m[2] || m[4] || '').split(',').filter(Boolean).length, complexity: 'medium' }));
  const issues = [];
  const suggestions = [];
  if (language === 'cobol') {
    if (upper.includes('GO TO ')) {
      issues.push({ message: 'GO TO detected, which makes legacy control flow harder to modernize safely' });
      suggestions.push('Replace GO TO branching with structured PERFORM blocks before deeper translation.');
    }
    if (upper.includes('FILE SECTION')) suggestions.push('Isolate file I/O rules from payroll logic before rewriting into services.');
    suggestions.push('Create characterization tests for payroll, tax, bonus, and leave-status rules before refactoring.');
  } else if (['java','csharp','vb','sql','plsql','rpg','siebel','curam'].includes(language)) {
    if (language === 'vb' && upper.includes('ON ERROR RESUME NEXT')) {
      issues.push({ message: 'On Error Resume Next detected, which can hide failures in legacy VB code' });
      suggestions.push('Replace On Error Resume Next with explicit Try/Catch flow.');
    }
    if (['sql','plsql'].includes(language) && upper.includes('SELECT *')) suggestions.push('Replace SELECT * with explicit fields before migration into services or APIs.');
    if (language === 'rpg' && upper.includes('GOTO')) suggestions.push('Replace GOTO-driven RPG flows with structured subroutines before deeper modernization.');
    if (language === 'siebel') suggestions.push('Map Siebel business components and workflow rules into Salesforce, service APIs, or .NET modules before translation.');
    if (language === 'curam') suggestions.push('Inventory IBM Cúram case flows, CER rules, and eligibility logic before choosing the target stack.');
    suggestions.push('Create characterization tests around business rules before migration.');
    suggestions.push('Separate business rules from infrastructure and I/O first.');
  } else {
    if (code.includes('var ')) {
      issues.push({ message: 'Legacy var declarations detected' });
      suggestions.push('Replace var with const/let.');
    }
    if (code.includes('eval(')) {
      issues.push({ message: 'eval() detected, which is a security and maintainability risk' });
      suggestions.push('Remove eval and replace it with direct logic.');
    }
    if (!/try\s*\{|try:/.test(code) && lines > 8) suggestions.push('Add clearer error handling around business-critical flows.');
    if (functions.some(f => f.params >= 5)) suggestions.push('Collapse long parameter lists into an options object or typed payload.');
  }
  if (!suggestions.length) suggestions.push('Split business logic into smaller services and add unit tests.');
  const score = Math.max(25, 82 - (issues.length * 14) - (lines > 120 ? 10 : 0) - (['cobol','vb','rpg','sql','plsql','java','csharp'].includes(language) ? 6 : 0));
  const guidance = getModernizationGuidance(language);
  return {
    language,
    lines,
    functions,
    complexity: lines > 120 ? 'high' : lines > 40 ? 'medium' : 'low',
    modernizationScore: score,
    techDebt: ['cobol','vb','rpg','sql','plsql','java','csharp','siebel','curam'].includes(language) ? (lines > 120 ? '2-4 weeks' : '1-2 weeks') : (lines > 120 ? '1-2 weeks' : lines > 40 ? '2-4 days' : '1-2 days'),
    issues,
    suggestions,
    refactoringSteps: language === 'cobol'
      ? [
          'Preserve payroll business rules with regression tests first',
          'Separate record parsing, validation, and pay calculation into services',
          'Map PIC-based records into typed schemas for the target platform'
        ]
      : ['java','csharp','vb','sql','plsql','rpg'].includes(language)
        ? [
            'Preserve legacy business behavior with regression tests first',
            'Isolate business rules from framework, database, or file I/O concerns',
            'Move high-risk modules into phased modernization work packages'
          ]
        : [
            'Extract reusable business logic into a service layer',
            'Add tests for the main code paths',
            'Introduce stricter typing and safer error handling'
          ],
    testCoverage: {
      estimated: Math.min(75, functions.length * 18 || 20),
      suggestions: functions.length
        ? functions.map(f => language === 'cobol'
            ? `Test paragraph ${f.name} for expected business-rule behavior and output records`
            : `Test ${f.name} for valid input, edge cases, and failure handling`)
        : ['Add baseline tests for key inputs and expected outputs']
    },
    targetPlatforms: guidance.targetPlatforms,
    modernizationBlueprint: guidance.modernizationBlueprint,
    migrationPaths: guidance.migrationPaths,
    timestamp: new Date().toISOString(),
    requestId: `fallback-${Date.now().toString(36)}`
  };
}

function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  readCodeFile(file);
}

function readCodeFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const code = document.getElementById('demoCode');
    const lang = document.getElementById('langSelect');
    code.value = String(reader.result || '');
    lastUploadedFilename = file.name;
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.py')) lang.value = 'python';
    else if (['.js','.jsx','.ts','.tsx','.mjs','.cjs'].some(ext => lower.endsWith(ext))) lang.value = 'javascript';
    else if (['.cob', '.cbl', '.cpy'].some(ext => lower.endsWith(ext))) lang.value = 'cobol';
    else if (lower.endsWith('.java')) lang.value = 'java';
    else if (lower.endsWith('.cs')) lang.value = 'csharp';
    else if (['.vb','.bas','.cls'].some(ext => lower.endsWith(ext))) lang.value = 'vb';
    else if (['.pkb','.pks'].some(ext => lower.endsWith(ext))) lang.value = 'plsql';
    else if (['.rpgle','.rpg'].some(ext => lower.endsWith(ext))) lang.value = 'rpg';
    else if (lower.endsWith('.sql')) lang.value = 'sql';
    else if (['.sif','.srf','.ejs','.ss'].some(ext => lower.endsWith(ext))) lang.value = 'siebel';
    else if (lower.endsWith('.curam')) lang.value = 'curam';
    else lang.value = 'auto';
    showToast(`Loaded ${file.name}`, 'success');
  };
  reader.onerror = () => showToast('Could not read file.', 'error');
  reader.readAsText(file);
}

function wireDropZone() {
  const zone = document.getElementById('dropZone');
  if (!zone) return;
  ['dragenter', 'dragover'].forEach(evt => zone.addEventListener(evt, (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  }));
  ['dragleave', 'dragend', 'drop'].forEach(evt => zone.addEventListener(evt, (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
  }));
  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) readCodeFile(file);
  });
}

function startProgressAnimation() {
  stopProgressAnimation();
  const fill = () => document.getElementById('analysisProgress');
  let progress = 8;
  progressTimer = setInterval(() => {
    const el = fill();
    if (!el) return;
    progress = Math.min(progress + Math.random() * 18, 92);
    el.style.width = `${progress}%`;
  }, 350);
}

function stopProgressAnimation() {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = null;
  const el = document.getElementById('analysisProgress');
  if (el) el.style.width = '100%';
}

function showToast(message, type = 'success') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 280);
  }, 2400);
}

function safeTimestamp() {
  return new Date().toISOString().slice(0,19).replace(/[T:]/g,'-');
}

function escapeHtml(str) {
  return String(str).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
}

function smoothNav(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const num = Number(value) || 0;
  el.dataset.target = String(num);
  el.dataset.animated = '';
  el.textContent = '0';
  animateCounters();
}

async function loadActivityTicker() {
  const container = document.getElementById('activityTicker');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/recent-analyses`);
    const data = await res.json();
    const rows = data.analyses || [];
    if (!rows.length) {
      container.innerHTML = '<p style="color:#555;text-align:center;padding:16px">No analyses yet. Be the first, try the demo below.</p>';
      return;
    }
    container.innerHTML = rows.map(r => {
      const scoreColor = (r.modernization_score || 50) >= 70 ? 'var(--success)' : (r.modernization_score || 50) >= 40 ? 'var(--warning)' : 'var(--highlight)';
      const ago = timeAgo(r.created_at);
      const name = r.filename || `${r.language || 'code'} snippet`;
      return `<div class="activity-row">
        <span class="activity-lang">${escapeHtml(r.language || '?')}</span>
        <span class="activity-name">${escapeHtml(name)}</span>
        <span class="activity-meta">${r.lines} lines &bull; ${escapeHtml(r.complexity || '—')}</span>
        <span class="activity-score" style="color:${scoreColor}">${r.modernization_score ?? '—'}/100</span>
        <span class="activity-time">${ago}</span>
      </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<p style="color:#555;text-align:center;padding:16px">Activity feed unavailable in static mode.</p>';
  }
}

async function loadAnalytics() {
  const langEl = document.getElementById('analyticsLanguages');
  const complexityEl = document.getElementById('analyticsComplexity');
  const trendEl = document.getElementById('analyticsTrend');
  const topRunEl = document.getElementById('analyticsTopRun');
  if (!langEl || !complexityEl || !trendEl || !topRunEl) return;

  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('analytics unavailable');
    const data = await res.json();

    renderAnalyticsBars(langEl, data.languages || []);
    renderAnalyticsBars(complexityEl, data.complexities || []);
    renderTrendChart(trendEl, data.trend || []);
    renderTopRun(topRunEl, data.topRun || null);
  } catch {
    const fallback = '<p class="analytics-empty">Analytics unavailable in static mode.</p>';
    langEl.innerHTML = fallback;
    complexityEl.innerHTML = fallback;
    trendEl.innerHTML = fallback;
    topRunEl.innerHTML = fallback;
  }
}

function renderAnalyticsBars(container, rows) {
  if (!rows.length) {
    container.innerHTML = '<p class="analytics-empty">No analytics yet.</p>';
    return;
  }
  const max = Math.max(...rows.map(r => Number(r.count) || 0), 1);
  container.innerHTML = rows.map(row => {
    const pct = Math.max(8, Math.round(((Number(row.count) || 0) / max) * 100));
    const label = escapeHtml(row.language || row.complexity || 'unknown');
    return `<div class="analytics-row">
      <span class="analytics-label">${label}</span>
      <div class="analytics-bar"><span style="width:${pct}%"></span></div>
      <span class="analytics-value">${Number(row.count) || 0}</span>
    </div>`;
  }).join('');
}

function renderTrendChart(container, rows) {
  if (!rows.length) {
    container.innerHTML = '<p class="analytics-empty">No recent trend data yet.</p>';
    return;
  }
  const max = Math.max(...rows.map(r => Number(r.count) || 0), 1);
  container.innerHTML = rows.map(row => {
    const count = Number(row.count) || 0;
    const pct = Math.max(8, Math.round((count / max) * 100));
    const label = formatDayLabel(row.day);
    return `<div class="trend-day">
      <div class="trend-count">${count}</div>
      <div class="trend-bar-wrap"><div class="trend-bar" style="height:${pct}%"></div></div>
      <div class="trend-label">${label}</div>
    </div>`;
  }).join('');
}

function renderTopRun(container, topRun) {
  if (!topRun) {
    container.innerHTML = '<p class="analytics-empty">No scored analyses yet.</p>';
    return;
  }
  const score = Number(topRun.modernization_score) || 0;
  const scoreColor = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--highlight)';
  const name = topRun.filename || `${topRun.language || 'legacy'} snippet`;
  container.innerHTML = `<div class="top-run-score" style="color:${scoreColor}">${score}</div>
    <div class="top-run-meta">
      <h4>${escapeHtml(name)}</h4>
      <p><strong>Language:</strong> ${escapeHtml(topRun.language || 'unknown')}</p>
      <p><strong>Captured:</strong> ${escapeHtml(timeAgo(topRun.created_at))}</p>
      <p>Use this section as a live signal of what teams are analyzing and how modernization quality is trending.</p>
    </div>`;
}

function formatDayLabel(day) {
  if (!day) return '—';
  const date = new Date(`${day}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function animateCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target) || target === 0 || el.dataset.animated) return;
    el.dataset.animated = '1';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

function setupCounterObserver() {
  const bar = document.querySelector('.stats-bar');
  if (!bar) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(bar);
}

document.addEventListener('DOMContentLoaded', () => {
  loadSample('javascript');
  checkApiHealth();
  loadStats();
  loadActivityTicker();
  loadAnalytics();
  wireDropZone();
  setupCounterObserver();

  document.getElementById('demoCode')?.addEventListener('input', () => { if (!document.getElementById('demoCode').value.trim()) lastUploadedFilename = ''; });
  document.getElementById('demoCode')?.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runDemo();
  });
});
