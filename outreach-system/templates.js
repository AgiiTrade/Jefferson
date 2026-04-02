<div id="app-js" style="display:none"><script>
// ---------- STATE ----------
let state = JSON.parse(localStorage.getItem('outreachState')) || {
  emails: [],
  linkedin: [],
  campaigns: [],
  settings: { name: 'Arfeen Ahmad', title: 'Founder, Agilitas Innovations', company: 'Agilitas Innovations', website: 'https://agii.ca', calendly: '', signature: 'Best,\\nArfeen Ahmad\\nFounder, Agilitas Innovations\\nagii.ca', unsubscribe: 'Reply STOP to unsubscribe', attachment: '' }
};

// ---------- TEMPLATE LIBRARY ----------
const EMAIL_TEMPLATES = {
  intro: {
    direct: [
      `Hi {{firstName}},

I was looking at {{companyName}} and noticed you're in the {{industry}} space.

Quick question: How much time does your team spend manually copying data between systems?

Most companies with 5+ software tools waste 10–20 hours/week on this.

We just helped a {{similarIndustry}} firm slash manual entry from 200 hours to just 20 hours/month using Oracle Integration Cloud. The project paid for itself in 3 months.

Worth a 15‑minute call to see if we can do the same for {{companyName}}?

{{signature}}
P.S. I'm offering a free Integration Assessment this month — it's a 30‑min call, no strings attached.`,
      
      `Hi {{firstName}},

Following up on my last note — wanted to share a quick result:

A logistics client reduced manual data entry by 180 hours/month. That's $12,000+ back in their pocket every 30 days.

{{similarIndustry}} companies are getting the same results. Does {{companyName}} have similar challenges?

Let's schedule 15 minutes to explore.

{{calendly}}
{{signature}}`
    ],
    curiosity: [
      `Hi {{firstName}},

Ever feel like your systems are working against each other?

{{companyName}} has the scale where that friction really adds up — I bet your team wastes more hours than they realize on manual data entry.

We've cracked the code on connecting those systems automatically. I can show you exactly how in 15 minutes.

Interested? Reply "YES" and I'll send over a quick case study.

{{signature}}`
    ],
    'social-proof': [
      `Hi {{firstName}},

When companies like {{similarIndustry}} start automating their integrations, they typically see 10‑20 hrs/week saved within the first 30 days.

We've helped 3 firms in the {{industry}} space do just that this quarter. The ROI is always clear: projects pay for themselves within 3‑4 months.

Curious if {{companyName}} is ready for the same results?

I've got 3 free Integration Assessment slots open this month.

Would you or someone on your team benefit from a 30‑minute chat?

{{calendly}}
{{signature}}`
    ]
  },
  followup: {
    direct: [
      `Hi {{firstName}},

Just circling back on my last note about integration automation for {{companyName}}.

We launched a new case study this week highlighting a {{industry}} firm that saved $50K in 6 months with Oracle Integration Cloud.

I'd be happy to share it — just reply "Case Study" and I'll send it over.

{{signature}}`
    ]
  },
  're-engagement': [
    `Hi {{firstName}},

Haven't heard back — guessing system integrations aren't a priority right now.

No problem. I'll close your file and check back in a few months.

If anything changes, you know where to find me.

All the best,
{{signature}}`
  ]
};

const LINKEDIN_TEMPLATES = {
  connection: [
    `Hi {{firstName}}, I noticed we're both in the {{industry}} space. I help companies like {{companyName}} automate their operations with Oracle Integration Cloud. Would be great to connect.`,
    `Hi {{firstName}}, saw your post about {{topic}}. I'm working on similar challenges at Agii.ca. Let's connect and share insights.`
  ],
  'dm-intro': [
    `Thanks for connecting, {{firstName}}! I specialize in Oracle Integration Cloud for {{industry}} companies. If {{companyName}} ever needs help with system integrations, I'd be happy to assist.`,
    `Hey {{firstName}} — I noticed you're a {{title}} at {{companyName}}. We just helped a similar firm reduce manual entry by 180 hrs/month. Worth a quick chat?`
  ],
  'dm-followup': [
    `Following up on my message — we have a new case study showing 3× ROI for {{industry}} clients. Would you like me to share?`,
    `Hi {{firstName}}, just checking if you had a chance to see my note. We're opening 2 new assessment slots next week — interested?`
  ],
  'value-bite': [
    `Quick tip: 70% of companies with 5+ SaaS tools waste 10–20 hrs/week on manual data entry. A simple integration layer can cut that by 80%+. Want to know how?`,
    `Most IT directors don't realize their Oracle stack can talk directly to modern SaaS tools without middleware. I wrote a 2‑minute guide — DM me "ORACLE" and I'll send it.`
  ]
};

// ---------- HELPER FUNCTIONS ----------
function p(u){return document.getElementById(u)}
function showTab(t){document.querySelectorAll('.tab-content').forEach(e=>e.classList.add('hidden'));document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));p(t).classList.remove('hidden');document.getElementById(`tab-${t}`).classList.add('active');}
function $(s){return document.querySelector(s)}
function m(s){return s.replace(/\{\{(\w+)\}\}/g,(_,k){return state.settings[k]||p(k)?.value||`{{${k}}}`})}
function insField(t){const ta=p('email-body');ta.setRangeText(t,ta.selectionStart,ta.selectionEnd);ta.focus()}
function fillRandom(){p('firstName').value='Sarah';p('companyName').value='TechCorp Inc.';p('industry').value='Logistics';p('title').value='CTO';p('city').value='Toronto';p('revenue').value='$100M-$500M';}
function clearFields(){p('firstName').value='';p('companyName').value='';p('industry').value='';p('title').value='';p('city').value='';p('revenue').value='';}
function saveSettings(){const s={name:p('settings-name').value,title:p('settings-title').value,company:p('settings-company').value,website:p('settings-website').value,calendly:p('settings-calendly').value,signature:p('settings-signature').value,unsubscribe:p('settings-unsubscribe').value,attachment:p('settings-attachment').value};state.settings=s;localStorage.setItem('outreachState',JSON.stringify(state));alert('Settings saved!')}
function loadSettings(){const s=state.settings;Object.keys(s).forEach(k=>{const el=p(`settings-${k}`);if(el)el.value=s[k]})}

// ---------- EMAIL GENERATOR ----------
function generateEmailTemplate(){
  const seq=p('email-sequence').value
  const style=p('email-style').value
  const subjectEl=p('email-subject')
  const bodyEl=p('email-body')
  
  // Pick a random template from the matching sequence+style
  const pool = EMAIL_TEMPLATES[seq]?.[style] || EMAIL_TEMPLATES['intro']['direct']
  const raw = pool[Math.floor(Math.random()*pool.length)]
  
  // Apply merges
  let subbed = m(raw)
  
  // Auto‑generate subject if empty
  if(!subjectEl.value){
    const company = p('companyName').value || '{{companyName}}'
    subbed = subbed.replace(/\n/g,'<br>')
    subjectEl.value = `For ${company}: Quick question about systems integration`
  }
  
  bodyEl.value = subbed
  p('generated-list').innerHTML = `<div class="card" style="margin-top:12px;background:rgba(34,197,94,.1);border-color:var(--success)"><strong>✅ Ready to send</strong><br>${subbed.substring(0,200)}${subbed.length>200?'...':''}</div>`
}

// ---------- LINKEDIN GENERATOR ----------
function generateLinkedInTemplate(){
  const type=p('linkedin-type').value
  const tone=p('linkedin-tone').value
  const pool = LINKEDIN_TEMPLATES[type] || LINKEDIN_TEMPLATES['connection']
  const raw = pool[Math.floor(Math.random()*pool.length)]
  const subbed = m(raw)
  p('linkedin-preview').innerHTML = `<div style="line-height:1.6">${subbed.replace(/\n/g,'<br>')}</div>`
}

// ---------- COPY TO CLIPBOARD ----------
function copyEmail(){
  const text = p('email-subject').value + '\\n\\n' + p('email-body').value
  navigator.clipboard.writeText(text).then(()=>alert('Copied to clipboard! Include your Calendly link from settings.'))
  logCampaign('email', p('companyName').value || 'Unknown', p('email-subject').value)
}
function copyLinkedIn(){
  const text = p('linkedin-preview').innerText
  navigator.clipboard.writeText(text).then(()=>{alert('LinkedIn message copied! Paste into LinkedIn DM.'); logCampaign('linkedin', p('companyName').value || 'Unknown', text.substring(0,50)+'...')})
}

// ---------- CAMPAIGN TRACKER ----------
function logCampaign(type, prospect, templateSnippet){
  const record = { date: new Date().toLocaleDateString(), type, prospect, template: templateSnippet, sent: true, replied: false }
  state.campaigns.unshift(record)
  localStorage.setItem('outreachState', JSON.stringify(state))
  renderCampaigns()
}
function renderCampaigns(){
  const tbody = p('campaign-table')
  tbody.innerHTML = state.campaigns.map(c => `
    <tr>
      <td>${c.date}</td>
      <td>${c.type === 'email' ? '📧' : '💼'}</td>
      <td>${c.prospect}</td>
      <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.template}</td>
      <td><input type="checkbox" ${c.sent?'checked':''} onchange="toggleSent('${c.date}-${c.prospect}',this)"></td>
      <td><input type="checkbox" ${c.replied?'checked':''} onchange="toggleReply('${c.date}-${c.prospect}',this)"></td>
    </tr>
  `).join('')
  p('stat-emails').textContent = state.campaigns.filter(c=>c.type==='email').length
  p('stat-linkedin').textContent = state.campaigns.filter(c=>c.type==='linkedin').length
  p('stat-replies').textContent = state.campaigns.filter(c=>c.replied).length
}
function toggleSent(key,el){
  const rec = state.campaigns.find(c=>`${c.date}-${c.prospect}`===key)
  if(rec){rec.sent=el.checked;localStorage.setItem('outreachState',JSON.stringify(state))}
}
function toggleReply(key,el){
  const rec = state.campaigns.find(c=>`${c.date}-${c.prospect}`===key)
  if(rec){rec.replied=el.checked;localStorage.setItem('outreachState',JSON.stringify(state));renderCampaigns()}
}

// ---------- DATA IMPORT / EXPORT ----------
function exportData(){
  const csv = [
    ['Date','Type','Prospect','Template','Sent','Replied'].join(','),
    ...state.campaigns.map(c => [
      c.date,
      c.type,
      `"${c.prospect}"`,
      `"${c.template.replace(/"/g,'""')}"`,
      c.sent,
      c.replied
    ].join(','))
  ].join('\\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a');a.href=url;a.download='outreach-campaign.csv';a.click()
}
function importData(input){
  const file = input.files[0];if(!file)return
  const r = new FileReader();r.onload = e=>{
    try{
      const csv = e.target.result;const lines = csv.split('\\n').filter(l=>l.trim())
      state.campaigns = [] // replace
      for(let i=1;i<lines.length;i++){
        const cols = lines[i].match(/(?:[^,"]*|"(?:[^"]|"")*")+/g)||[]
        if(cols.length>=6){
          state.campaigns.push({
            date: cols[0],
            type: cols[1]==='"email"'?'email':'linkedin',
            prospect: cols[2].replace(/^"|"$/g,'').replace(/""/g,'"'),
            template: cols[3].replace(/^"|"$/g,'').replace(/""/g,'"'),
            sent: cols[4]==='true',
            replied: cols[5]==='true'
          })
        }
      }
      localStorage.setItem('outreachState',JSON.stringify(state))
      alert('Imported '+state.campaigns.length+' campaigns.')
      renderCampaigns()
    }catch(err){alert('Import failed: '+err.message)}
  };r.readAsText(file)
}
function clearAllData(){if(confirm('Delete all campaigns? This cannot be undone.')){state.campaigns=[];localStorage.setItem('outreachState',JSON.stringify(state));renderCampaigns()}}

// ---------- INIT ----------
window.addEventListener('DOMContentLoaded',()=>{
  loadSettings()
  renderCampaigns()
  
  // Welcome tip
  if(state.campaigns.length===0){
    p('generated-list').innerHTML = `<div class="card" style="margin-top:12px;background:rgba(245,158,11,.1);border-color:var(--gold)"><strong>💡 Quick start</strong><ol style="margin-left:20px;margin-top:8px"><li>Go to <strong>Settings</strong> and add your Calendly link (important for CTA)</li><li>Pick a template style and click "Generate Template"</li><li>Click "Copy to Clipboard" and paste into your email/LinkedIn</li><li>Mark as Sent in the Campaigns tab</li></ol></div>`
  }
})
</script></div>
