(() => {
  let state = JSON.parse(localStorage.getItem('outreachState')) || {
    campaigns: [],
    settings: { name: 'Arfeen Ahmad', title: 'Founder, Agilitas Innovations', company: 'Agilitas Innovations', website: 'https://agii.ca', calendly: '', signature: 'Best,\nArfeen Ahmad\nFounder, Agilitas Innovations\nagii.ca' }
  };

  const EMAIL_TEMPLATES = {
    intro: [
      `Hi {{firstName}},\n\nI was looking at {{companyName}} and noticed you're in the {{industry}} space.\n\nHow much time does your team spend manually copying data between systems?\n\nMost companies with 5+ tools waste 10–20 hours/week on this.\n\nWe helped a {{similarIndustry}} firm slash manual entry from 200 hrs to just 20 hrs/month with Oracle Integration Cloud. Project paid for itself in 3 months.\n\nWorth 15 minutes to explore?\n\n{{signature}}\nP.S. Free Integration Assessment this month — 30 min, no strings.`,
      `Hi {{firstName}},\n\nFollowing up — quick result:\n\nA logistics client reduced manual data entry by 180 hrs/month. That's $12K+ back every 30 days.\n\n{{similarIndustry}} firms are getting the same results. Does {{companyName}} have similar challenges?\n\nLet's schedule 15 minutes.\n\n{{calendly}}\n{{signature}}`
    ]
  };

  const LINKEDIN_TEMPLATES = {
    connection: [
      `Hi {{firstName}}, I noticed we're both in the {{industry}} space. I help companies like {{companyName}} automate operations with Oracle Integration Cloud. Would be great to connect.`
    ],
    'dm-intro': [
      `Hey {{firstName}} — I'm Arfeen, Founder at Agii.ca. We help {{industry}} companies cut manual data entry by 80%+. If {{companyName}} ever needs integration help, I'd love to assist.`
    ]
  };

  const p = (id) => document.getElementById(id);
  const m = (s) => s.replace(/{{(\w+)}}/g, (_, k) => state.settings[k] || p(k)?.value || `{{${k}}}`);

  function saveSettings() {
    state.settings = { name: p('settings-name').value, title: p('settings-title').value, company: p('settings-company').value, website: p('settings-website').value, calendly: p('settings-calendly').value, signature: p('settings-signature').value };
    localStorage.setItem('outreachState', JSON.stringify(state));
    alert('Settings saved!');
  }

  function generateEmail() {
    const raw = EMAIL_TEMPLATES.intro[Math.floor(Math.random()*EMAIL_TEMPLATES.intro.length)];
    p('email-subject').value = `Quick question about ${p('companyName').value || state.settings.company}'s systems`;
    p('email-body').value = m(raw);
  }

  function generateLinkedIn() {
    const type = p('linkedin-type').value;
    const raw = (LINKEDIN_TEMPLATES[type] || LINKEDIN_TEMPLATES.connection)[0];
    p('linkedin-preview').textContent = m(raw);
  }

  function copyEmail() {
    navigator.clipboard.writeText(p('email-subject').value + '\n\n' + p('email-body').value).then(() => {
      alert('Copied to clipboard!');
      logCampaign('email', p('companyName').value || 'Unknown', p('email-subject').value);
    });
  }

  function copyLinkedIn() {
    navigator.clipboard.writeText(p('linkedin-preview').textContent).then(() => {
      alert('LinkedIn message copied!');
      logCampaign('linkedin', p('companyName').value || 'Unknown', p('linkedin-preview').textContent.substring(0,50)+'...');
    });
  }

  function logCampaign(type, prospect, snippet) {
    state.campaigns.unshift({ date: new Date().toLocaleDateString(), type, prospect, template: snippet.substring(0,100), sent: true, replied: false });
    localStorage.setItem('outreachState', JSON.stringify(state));
    renderCampaigns();
  }

  function renderCampaigns() {
    const tbody = p('campaign-table');
    tbody.innerHTML = state.campaigns.map(c => `
      <tr>
        <td>${c.date}</td>
        <td>${c.type === 'email' ? '📧' : '💼'}</td>
        <td>${c.prospect}</td>
        <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.template}</td>
        <td><input type="checkbox" ${c.sent?'checked':''} onchange="toggleSent('${c.date}-${c.prospect}',this)"></td>
        <td><input type="checkbox" ${c.replied?'checked':''} onchange="toggleReply('${c.date}-${c.prospect}',this)"></td>
      </tr>
    `).join('');
    p('stat-emails').textContent = state.campaigns.filter(c=>c.type==='email').length;
    p('stat-linkedin').textContent = state.campaigns.filter(c=>c.type==='linkedin').length;
    p('stat-replies').textContent = state.campaigns.filter(c=>c.replied).length;
  }

  // Global for inline handlers
  window.toggleSent = (key, el) => {
    const rec = state.campaigns.find(c => `${c.date}-${c.prospect}` === key);
    if (rec) { rec.sent = el.checked; localStorage.setItem('outreachState', JSON.stringify(state)); }
  };
  window.toggleReply = (key, el) => {
    const rec = state.campaigns.find(c => `${c.date}-${c.prospect}` === key);
    if (rec) { rec.replied = el.checked; localStorage.setItem('outreachState', JSON.stringify(state)); renderCampaigns(); }
  };

  window.exportData = () => {
    const csv = ['Date,Type,Prospect,Template,Sent,Replied', ...state.campaigns.map(c => [
      c.date, c.type, `"${c.prospect}"`, `"${c.template.replace(/"/g,'""')}"`, c.sent, c.replied
    ].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = 'agii-outreach.csv';
    a.click();
  };

  window.fillRandom = () => {
    p('firstName').value = 'Sarah';
    p('companyName').value = 'TechCorp Inc.';
    p('industry').value = 'Logistics';
    p('title').value = 'CTO';
    p('city').value = 'Toronto';
    p('revenue').value = '$100M-$500M';
    p('email-subject').value = `Quick question about ${p('companyName').value}'s systems`;
  };

  window.clearFields = () => {
    ['firstName','companyName','industry','title','city','revenue','email-subject','email-body'].forEach(id => { const el = p(id); if(el) el.value = ''; });
  };

  window.generateEmailTemplate = generateEmail;
  window.generateLinkedInTemplate = generateLinkedIn;
  window.copyEmail = copyEmail;
  window.copyLinkedIn = copyLinkedIn;
  window.saveSettings = () => { state.settings = { name: p('settings-name').value, title: p('settings-title').value, company: p('settings-company').value, website: p('settings-website').value, calendly: p('settings-calendly').value, signature: p('settings-signature').value }; localStorage.setItem('outreachState', JSON.stringify(state)); alert('Settings saved!'); };
  window.loadSettings = () => {
    const s = state.settings;
    if(s.name) p('settings-name').value = s.name;
    if(s.title) p('settings-title').value = s.title;
    if(s.company) p('settings-company').value = s.company;
    if(s.website) p('settings-website').value = s.website;
    if(s.calendly) p('settings-calendly').value = s.calendly;
    if(s.signature) p('settings-signature').value = s.signature;
  };

  window.renderCampaigns = renderCampaigns;
  window.exportData = exportData;
  window.importData = (input) => {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const lines = e.target.result.split('\n').filter(l => l.trim());
        state.campaigns = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/(?:[^,"]*|"(?:[^"]|"")*")+/g) || [];
          if (cols.length >= 6) {
            state.campaigns.push({
              date: cols[0],
              type: cols[1].includes('email') ? 'email' : 'linkedin',
              prospect: cols[2].replace(/^"|"$/g, '').replace(/""/g, '"'),
              template: cols[3].replace(/^"|"$/g, '').replace(/""/g, '"'),
              sent: cols[4] === 'true',
              replied: cols[5] === 'true'
            });
          }
        }
        localStorage.setItem('outreachState', JSON.stringify(state));
        alert('Imported ' + state.campaigns.length + ' campaigns.');
        renderCampaigns();
      } catch (err) { alert('Import failed: ' + err.message); }
    };
    reader.readAsText(file);
  };
  window.clearAllData = () => { if (confirm('Delete all campaigns?')) { state.campaigns = []; localStorage.setItem('outreachState', JSON.stringify(state)); renderCampaigns(); } };

  window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    renderCampaigns();
  });
})();
