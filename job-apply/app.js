// ApplyPro — Job Search & Resume Tailoring System
(function(){
"use strict";

const SK = { jobs:"ap.jobs", apps:"ap.apps", settings:"ap.settings" };
let jobs = JSON.parse(localStorage.getItem(SK.jobs)) || [];
let applications = JSON.parse(localStorage.getItem(SK.apps)) || [];
let settings = JSON.parse(localStorage.getItem(SK.settings)) || { mode:"personal", brandName:"ApplyPro" };

function save(){
  localStorage.setItem(SK.jobs, JSON.stringify(jobs));
  localStorage.setItem(SK.apps, JSON.stringify(applications));
  localStorage.setItem(SK.settings, JSON.stringify(settings));
}

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[<>"'&]/g,c=>({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','&':'&amp;'}[c]));

// ── Tabs ─────────────────────────────────────────────────
$$(".nav-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".nav-btn").forEach(b=>b.classList.remove("active"));
    $$(".tab").forEach(t=>t.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-"+btn.dataset.tab).classList.add("active");
    if(btn.dataset.tab==="search") refreshSearch();
    if(btn.dataset.tab==="pipeline") renderPipeline();
    if(btn.dataset.tab==="tailor") renderTailorPreview();
  });
});

// ── Job Search Tab ───────────────────────────────────────
const JOB_SOURCES = [
  { name:"LinkedIn", url:"https://www.linkedin.com/jobs/search/?keywords=program+director+remote&location=Canada&f_WT=2", icon:"💼" },
  { name:"Indeed", url:"https://ca.indeed.com/jobs?q=program+director+remote&l=Canada&remotejob=032b3046-06a3-4876-8dfd-474eb5e7ed11", icon:"🔍" },
  { name:"Glassdoor", url:"https://www.glassdoor.ca/Job/canada-program-director-remote-jobs-SRCH_IL.0,6_IN3_KO7,26.htm", icon:"🪟" },
  { name:"Remote.co", url:"https://remote.co/remote-jobs/search/?search_keywords=program+director", icon:"🌐" },
  { name:"We Work Remotely", url:"https://weworkremotely.com/remote-jobs/search?term=program+director", icon:"🏡" },
  { name:"FlexJobs", url:"https://www.flexjobs.com/search?search=program+director&location=Canada", icon:"🔄" },
  { name:"Built In", url:"https://builtin.com/jobs/remote?search=program+director", icon:"🏗️" },
  { name:"AngelList", url:"https://wellfound.com/role/r/program-director/remote", icon:"👼" },
  { name:"Dice", url:"https://www.dice.com/jobs?q=program+director&countryCode=CA&radius=30&radiusUnit=mi&page=1&pageSize=20&language=en&eid=ci", icon:"🎲" },
  { name:"SimplyHired", url:"https://www.simplyhired.com/search?q=program+director+remote&l=", icon:"📊" }
];

function refreshSearch(){
  const queries = [
    "Program Director Remote Canada",
    "Program Manager Remote Canada",
    "Project Director Remote Canada",
    "Project Manager Remote Canada",
    "Senior Program Manager Remote",
    "Director of Programs Remote",
    "Delivery Director Remote Canada",
    "Technical Program Manager Remote"
  ];
  const q = queries[Math.floor(Math.random()*queries.length)];
  $("#searchQuery").placeholder = `e.g., ${q}`;
  renderSources();
  renderSavedJobs();
}

function renderSources(){
  $("#jobSources").innerHTML = JOB_SOURCES.map(s=>`
    <a href="${s.url}" target="_blank" rel="noopener" class="source-card">
      <span class="source-icon">${s.icon}</span>
      <span class="source-name">${s.name}</span>
      <span class="source-arrow">→</span>
    </a>
  `).join('');
}

function renderSavedJobs(){
  const el = $("#savedJobs");
  if(!jobs.length){
    el.innerHTML = '<p class="empty">No jobs saved yet. Search job boards and paste job descriptions here.</p>';
    return;
  }
  el.innerHTML = jobs.map((j,i)=>`
    <div class="job-card ${applications.find(a=>a.jobId===j.id)?'applied':''}">
      <div class="job-header">
        <h4>${esc(j.title)}</h4>
        <span class="job-company">${esc(j.company)}</span>
      </div>
      <div class="job-meta">
        ${j.location?'<span>📍 '+esc(j.location)+'</span>':''}
        ${j.salary?'<span>💰 '+esc(j.salary)+'</span>':''}
        ${j.remote?'<span>🌐 Remote</span>':''}
        <span>📅 ${new Date(j.addedAt).toLocaleDateString()}</span>
      </div>
      <div class="job-match" id="match-${i}"></div>
      <div class="job-actions">
        <button class="btn-sm btn-primary" onclick="tailorForJob(${i})">📄 Tailor Resume</button>
        <button class="btn-sm btn-secondary" onclick="generateCover(${i})">✉️ Cover Letter</button>
        <button class="btn-sm btn-success" onclick="markApplied(${i})">✅ Applied</button>
        <button class="btn-sm btn-danger" onclick="removeJob(${i})">🗑️</button>
      </div>
    </div>
  `).join('');
  // Show match scores
  jobs.forEach((j,i)=>{
    const match = calculateMatch(j.description);
    const el = document.getElementById('match-'+i);
    if(el) el.innerHTML = `<div class="match-bar"><div class="match-fill" style="width:${match}%"></div></div><span class="match-pct">${match}% match</span>`;
  });
}

function calculateMatch(desc){
  if(!desc) return 0;
  const keywords = extractKeywords(desc.toLowerCase());
  const resumeText = JSON.stringify(MASTER_RESUME).toLowerCase();
  const hits = keywords.filter(k => resumeText.includes(k)).length;
  return Math.min(100, Math.round((hits / Math.max(keywords.length, 1)) * 100));
}

// Add job manually
$("#addJobForm").addEventListener("submit", e=>{
  e.preventDefault();
  const f = e.target;
  const job = {
    id: Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    title: f.jobTitle.value.trim(),
    company: f.jobCompany.value.trim(),
    location: f.jobLocation.value.trim(),
    salary: f.jobSalary.value.trim(),
    remote: f.jobRemote.checked,
    description: f.jobDesc.value.trim(),
    url: f.jobUrl.value.trim(),
    addedAt: new Date().toISOString(),
    source: "manual"
  };
  if(!job.title){ alert("Job title required"); return; }
  jobs.unshift(job);
  save();
  f.reset();
  renderSavedJobs();
});

function removeJob(idx){
  const j = jobs[idx];
  applications = applications.filter(a=>a.jobId!==j.id);
  jobs.splice(idx,1);
  save(); renderSavedJobs(); renderPipeline();
}

function markApplied(idx){
  const j = jobs[idx];
  if(applications.find(a=>a.jobId===j.id)){ alert("Already in pipeline"); return; }
  applications.push({
    id: Date.now().toString(36),
    jobId: j.id,
    title: j.title,
    company: j.company,
    status: "applied",
    appliedAt: new Date().toISOString(),
    notes: "",
    followUp: null
  });
  save();
  renderSavedJobs();
  renderPipeline();
  showToast("Added to pipeline!");
}

// ── Resume Tailor Tab ────────────────────────────────────
let currentTailored = null;
let currentJobIdx = -1;

function tailorForJob(idx){
  const j = jobs[idx];
  if(!j || !j.description){ alert("Add a job description first"); return; }
  currentJobIdx = idx;
  currentTailored = tailorResume(j.description, 4);
  renderTailorPreview();
  // Switch to tailor tab
  $$(".nav-btn").forEach(b=>b.classList.remove("active"));
  $$(".tab").forEach(t=>t.classList.remove("active"));
  $('[data-tab="tailor"]').classList.add("active");
  $("#tab-tailor").classList.add("active");
}

function renderTailorPreview(){
  const el = $("#tailorOutput");
  if(!currentTailored){
    el.innerHTML = '<p class="empty">Select a job from the Search tab and click "Tailor Resume" to generate a customized resume.</p>';
    return;
  }
  const r = currentTailored;
  const job = jobs[currentJobIdx] || {};
  let html = `<div class="tailored-resume">`;
  html += `<h3>${esc(r.name)}</h3><p class="cred">${esc(r.credentials)}</p>`;
  html += `<p class="contact">${esc(r.location)} • ${esc(r.phone)} • ${esc(r.email)}</p>`;
  html += `<hr><h4>PROFESSIONAL SUMMARY</h4><p>${esc(r.tailoredSummary)}</p>`;

  // Matched skills
  const allMatched = Object.values(r.matchedSkills).flat();
  if(allMatched.length){
    html += `<h4>CORE COMPETENCIES</h4><p>${allMatched.map(s=>esc(s)).join(' • ')}</p>`;
  }

  // Experience
  html += `<hr><h4>PROFESSIONAL EXPERIENCE</h4>`;
  r.experience.forEach(exp => {
    html += `<div class="exp-block"><strong>${esc(exp.title)} — ${esc(exp.company)}, ${esc(exp.location)}</strong><br><em>${esc(exp.period)}</em>`;
    exp.projects.slice(0,2).forEach(proj => {
      html += `<p><strong>${esc(proj.name)}${proj.budget ? ` (${esc(proj.budget)})` : ''}</strong>: ${esc(proj.summary)}</p><ul>`;
      const bullets = (proj.bullets||[]).slice(0, r.maxBullets);
      bullets.forEach(b => html += `<li>${esc(b)}</li>`);
      html += `</ul>`;
    });
    html += `</div>`;
  });

  // Education
  html += `<hr><h4>EDUCATION</h4><ul>`;
  r.education.forEach(edu => html += `<li>${esc(edu.degree)} — ${esc(edu.school)} (${edu.year})</li>`);
  html += `</ul>`;

  // Certifications
  html += `<h4>CERTIFICATIONS</h4><ul>`;
  r.certifications.forEach(c => html += `<li>${esc(c)}</li>`);
  html += `</ul>`;

  html += `</div>`;
  el.innerHTML = html;

  // Update actions
  $("#tailorActions").innerHTML = `
    <button class="btn-primary" onclick="copyResume()">📋 Copy to Clipboard</button>
    <button class="btn-secondary" onclick="downloadResume()">💾 Download .txt</button>
    <button class="btn-success" onclick="markApplied(${currentJobIdx})">✅ Mark Applied</button>
  `;
}

function copyResume(){
  if(!currentTailored) return;
  navigator.clipboard.writeText(generateResumeText(currentTailored));
  showToast("Resume copied!");
}

function downloadResume(){
  if(!currentTailored) return;
  const text = generateResumeText(currentTailored);
  const blob = new Blob([text], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Resume_${MASTER_RESUME.name.replace(/\s/g,'_')}_${currentTailored.keywords.slice(0,3).join('_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Cover Letter Tab ─────────────────────────────────────
function generateCover(idx){
  const j = jobs[idx];
  if(!j){ alert("Select a job first"); return; }
  const letter = generateCoverLetter(j.title, j.company, j.description||"");
  $("#coverOutput").innerHTML = `<div class="cover-letter"><pre>${esc(letter)}</pre></div>`;
  $("#coverActions").innerHTML = `
    <button class="btn-primary" onclick="copyCover()">📋 Copy</button>
    <button class="btn-secondary" onclick="downloadCover()">💾 Download</button>
  `;
  // Switch to cover tab
  $$(".nav-btn").forEach(b=>b.classList.remove("active"));
  $$(".tab").forEach(t=>t.classList.remove("active"));
  $('[data-tab="cover"]').classList.add("active");
  $("#tab-cover").classList.add("active");
  window._currentCover = letter;
}

function copyCover(){
  if(!window._currentCover) return;
  navigator.clipboard.writeText(window._currentCover);
  showToast("Cover letter copied!");
}

function downloadCover(){
  if(!window._currentCover) return;
  const blob = new Blob([window._currentCover], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CoverLetter_${MASTER_RESUME.name.replace(/\s/g,'_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Pipeline Tab ─────────────────────────────────────────
const STATUS_FLOW = ["applied","screening","interview","technical","final","offer","accepted","rejected","withdrawn"];
const STATUS_COLORS = { applied:"#3b82f6", screening:"#f59e0b", interview:"#8b5cf6", technical:"#ec4899", final:"#06b6d4", offer:"#22c55e", accepted:"#16a34a", rejected:"#ef4444", withdrawn:"#6b7280" };

function renderPipeline(){
  const stages = {};
  STATUS_FLOW.forEach(s => stages[s]=[]);
  applications.forEach(a => {
    if(stages[a.status]) stages[a.status].push(a);
  });

  const container = $("#pipelineBoard");
  container.innerHTML = STATUS_FLOW.map(status=>{
    const items = stages[status];
    return `
      <div class="pipeline-col" data-status="${status}">
        <div class="col-header" style="border-top:3px solid ${STATUS_COLORS[status]}">
          <span class="col-title">${status.charAt(0).toUpperCase()+status.slice(1)}</span>
          <span class="col-count">${items.length}</span>
        </div>
        <div class="col-items">
          ${items.map(a=>`
            <div class="pipeline-card">
              <h4>${esc(a.title)}</h4>
              <p>${esc(a.company)}</p>
              <div class="card-meta">
                <span>${new Date(a.appliedAt).toLocaleDateString()}</span>
                <select onchange="moveStage('${a.id}',this.value)">
                  ${STATUS_FLOW.map(s=>`<option value="${s}" ${s===a.status?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
              <textarea placeholder="Notes..." onchange="updateNotes('${a.id}',this.value)" rows="2">${esc(a.notes||'')}</textarea>
            </div>
          `).join('')}
          ${!items.length?'<p class="empty">No applications</p>':''}
        </div>
      </div>
    `;
  }).join('');

  // Update stats
  $("#stat-total").textContent = applications.length;
  $("#stat-interviews").textContent = applications.filter(a=>['interview','technical','final'].includes(a.status)).length;
  $("#stat-offers").textContent = applications.filter(a=>a.status==='offer'||a.status==='accepted').length;
  $("#stat-response").textContent = applications.length ? Math.round((applications.filter(a=>a.status!=='applied').length/applications.length)*100)+'%' : '0%';
}

function moveStage(appId, newStatus){
  const app = applications.find(a=>a.id===appId);
  if(app){ app.status = newStatus; save(); renderPipeline(); }
}

function updateNotes(appId, notes){
  const app = applications.find(a=>a.id===appId);
  if(app){ app.notes = notes; save(); }
}

// ── Settings Tab ─────────────────────────────────────────
function renderSettings(){
  $("#setting-mode").value = settings.mode;
  $("#setting-brand").value = settings.brandName;
}

$("#setting-mode").addEventListener("change", e=>{
  settings.mode = e.target.value;
  save();
});

$("#btn-export-all").addEventListener("click",()=>{
  const data = {jobs, applications, settings, resume: MASTER_RESUME};
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='applypro-backup.json'; a.click();
  URL.revokeObjectURL(url);
});

$("#btn-import-all").addEventListener("click",()=>{
  const input = document.createElement('input'); input.type='file'; input.accept='.json';
  input.addEventListener('change', e=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      try{
        const data = JSON.parse(ev.target.result);
        if(data.jobs) jobs = data.jobs;
        if(data.applications) applications = data.applications;
        if(data.settings) settings = {...settings,...data.settings};
        save(); refreshSearch(); renderPipeline();
        alert("Data imported!");
      }catch(err){ alert("Invalid file"); }
    };
    reader.readAsText(file);
  });
  input.click();
});

$("#btn-clear-all").addEventListener("click",()=>{
  if(!confirm("Clear ALL data?")) return;
  localStorage.removeItem(SK.jobs); localStorage.removeItem(SK.apps);
  jobs=[]; applications=[];
  save(); refreshSearch(); renderPipeline();
});

// ── Toast ────────────────────────────────────────────────
function showToast(msg){
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2000);
}

// ── Init ─────────────────────────────────────────────────
refreshSearch();
renderPipeline();
renderSettings();

})();
