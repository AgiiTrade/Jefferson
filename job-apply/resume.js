// Master Resume Data — Arfeen Ahmad
const MASTER_RESUME = {
  name: "Arfeen Ahmad",
  title: "Senior Program Manager",
  credentials: "B.Sc. • M.S. • MMA • PMP • CSM",
  location: "Toronto, ON",
  phone: "(647) 838-3442",
  email: "arfeen.ahmad@queensu.ca",

  summary: "Senior Program Manager with 15+ years of experience delivering large-scale technology, cybersecurity, and regulatory transformation programs within Tier-1 Canadian banks (CIBC, TD, BMO). Proven track record managing multi-million-dollar enterprise initiatives ($1M–$32M+) spanning Identity & Access Management (IAM), fraud prevention, digital banking, payments, and regulatory compliance. Expert in end-to-end program governance, executive stakeholder management, and risk-controlled delivery under SDLC, PDLC, Agile, SAFe, and hybrid frameworks.",

  skills: {
    programManagement: ["Program & Portfolio Management","Agile / SAFe / Scrum / Hybrid Delivery","Budget Forecasting & Financial Management","Risk, Issue & Change Management","Governance, Risk & Compliance (GRC)","Executive Stakeholder & Steering Committee Management","Vendor & Contract Management"],
    cybersecurity: ["Identity & Access Management (IAM)","Privileged Access Management (PAM)","Single Sign-On (SSO)","Zero Trust Architecture","Fraud Prevention","Biometric Authentication","Threat Matrix (TMX)","Passive Voice Biometrics"],
    regulatory: ["FATCA Compliance","CEBA Regulatory","WCAG AA Accessibility","Payments Canada","Anti-Money Laundering","Data Privacy (PIPEDA)"],
    tools: ["Clarity PPM","Jira","Confluence","MS Project","SharePoint","Visio","Excel","Tableau","Python","R","SAS","Power BI"],
    domain: ["Digital Banking","Core Banking","Online & Mobile Banking","Payments (INTERAC, Cards)","Wealth Management","Capital Markets","Insurance"],
    frameworks: ["SDLC","PDLC","PMLC","SAFe","Scrum","Waterfall","Hybrid"]
  },

  experience: [
    {
      company: "CIBC",
      title: "Program Manager",
      location: "Toronto, ON",
      period: "April 2023 – Present",
      projects: [
        {
          name: "CEBA Regulatory Program",
          budget: "$15MM",
          summary: "Led delivery of the Canadian Emergency Business Account regulatory initiative supporting 86,000+ CIBC business clients.",
          bullets: [
            "Managed loan forgiveness processing, interest conversion workflows, and transition of delinquent accounts to Client Account Management (CAM).",
            "Coordinated regulatory compliance, platform updates, and operational readiness across Finance and Technology teams.",
            "Defined data scope and reporting requirements for the CEBA loan portfolio, covering structured client records across 86,000+ accounts.",
            "Managed data extraction, validation, and loading workflows to transition accounts into interest-bearing and CAM recovery pipelines.",
            "Produced executive dashboards in Clarity and Confluence, enabling real-time portfolio visibility for senior leadership."
          ]
        },
        {
          name: "Gatekeeper 2.0 – Passive Voice Biometrics Upgrade",
          budget: "$3.45MM",
          summary: "Upgraded end-of-life Passive Voice Biometrics platform to Gatekeeper 2.0, ensuring service continuity and enhanced fraud detection.",
          bullets: [
            "Delivered seamless voiceprint authentication across all IVR channels with zero service disruption.",
            "Coordinated full integration and performance testing across mobile and contact center systems.",
            "Reduced fraud risk through frictionless biometric voice authentication, improving authentication reliability."
          ],
          vendors: "Microsoft, Bell, HCL, DXC",
          timeline: "9 months"
        }
      ]
    },
    {
      company: "TD Bank",
      title: "Program Manager",
      location: "Toronto, ON",
      period: "April 2022 – March 2023",
      projects: [
        {
          name: "Trading Desk Modernization Program – Capital Markets",
          budget: "$10MM (NDA)",
          summary: "Managed 6 streams for TD's Capital Markets Trading Desk Modernization Program.",
          bullets: [
            "Delivery spanned six workstreams: Performance & Securities Process Flow Optimization, Statements Reporting, Tax Regulatory Reporting, Reconciliation, Data Management, Analytics, and Information Security.",
            "Coordinated eight vendors simultaneously (IBM, Croesus, CGI, Symcor, RRD, TBase, Deloitte, AWS), managing integration milestones, interdependencies, and compliance checkpoints.",
            "Managed team of 97 across 14-month timeline."
          ],
          teamSize: 97,
          timeline: "14 months"
        }
      ]
    },
    {
      company: "Conestoga College",
      title: "Visiting Professor (Part-Time)",
      location: "Kitchener, ON",
      period: "Jan 2023 – Aug 2025",
      projects: [{
        name: "Teaching",
        summary: "Taught Project Management and Business Communication courses in the Workforce Development Program.",
        bullets: ["Curriculum development and delivery for Project Management and Business Communication."]
      }]
    },
    {
      company: "BMO",
      title: "Senior Program Manager",
      location: "Toronto, ON",
      period: "August 2021 – April 2022",
      projects: [
        {
          name: "Deposit Edge – Mobile Deposit Modernization",
          budget: "$32MM",
          summary: "Delivered a Mobile Deposit solution integrated with BMO's online business banking platform.",
          bullets: [
            "Structured across 7 parallel work streams: Mobile App Integration & UI/UX, Core Banking & FIS Platform Connectivity, Fraud & Risk Controls, Regulatory & Compliance, QA & Testing, Infrastructure & Security, and Change Management & Training.",
            "Directed FIS vendor activities and monitored spending across all delivery phases.",
            "Ensured adherence to BMO's regulatory standards and Payments requirements throughout delivery."
          ],
          vendors: "FIS",
          teamSize: 56
        }
      ]
    },
    {
      company: "CIBC",
      title: "Program Manager / Senior Project Manager",
      location: "Toronto, ON",
      period: "June 2018 – July 2021",
      projects: [
        { name: "CIBC Banking App – Credit Score Program", budget: "$1.1MM", summary: "Enabled real-time credit score access for customers on the CIBC mobile app.", bullets: ["Managed end-to-end delivery from requirements through UAT and launch."], vendors: "IBM & Equifax", teamSize: 16, timeline: "6 months" },
        { name: "FATCA ITC 4 – Regulatory Compliance", budget: "$2.19MM", summary: "Led regulatory change enforcing updated self-certification collection upon client change of circumstance.", bullets: ["Implemented reasonability checks at point of self-certification for CIBC and Simplii Financial."] },
        { name: "Paymod TMX – Fraud Detection Enhancement", budget: "$3.7MM", summary: "Delivered device profiling integration across CIBC/Simplii OLB and Mobile sign-on flows.", bullets: ["Strengthened fraud detection via Threat Matrix (TMX)."], vendors: "TMX", teamSize: 15, timeline: "17 months" },
        { name: "Digital Accessibility – WCAG AA", budget: "$5.1MM", summary: "Brought CIBC and Simplii Financial digital platforms to WCAG AA compliance.", bullets: ["Managed compliance across OLB, Mobi-Web, iOS, Android platforms."], vendors: "Accenture, CNIB, TCS", teamSize: 12, timeline: "26 months" }
      ]
    },
    {
      company: "TD Bank",
      title: "Project Manager / Project Delivery Lead",
      location: "Toronto, ON",
      period: "Feb 2014 – June 2018",
      projects: [
        { name: "Enterprise SSO & Identity Authentication Upgrade", summary: "Modernized TD's legacy authentication framework to token-based and MFA.", bullets: ["Improved login security and audit traceability in alignment with IAM strategy."] },
        { name: "INTERAC e-Transfer Enhancement", budget: "$1.8MM", summary: "Delivered enhanced INTERAC e-Transfer experience on Easy WEB, Mobile, and Tablet.", bullets: ["Exceeded minimum mandated requirements for eligible personal and small business customers."], vendors: "Interac" },
        { name: "Enterprise Data Provisioning Pipeline", budget: "$1.7MM", summary: "Led release management for TD's Data Provisioning project.", bullets: ["Established data pipelines and adaptors across applications for centralized data storage."], teamSize: 15, timeline: "18 months" }
      ]
    },
    {
      company: "Finastra (D+H)",
      title: "Project Manager",
      location: "Mississauga, ON",
      period: "2012 – 2014",
      projects: [
        { name: "Credit Path Implementation – Trinity Rail", budget: "$600K", summary: "Led credit underwriting platform implementations.", bullets: ["Maintained rolling 24-month project roadmap across all clients.", "Led teams of up to 25."], teamSize: 7, timeline: "9 months" }
      ]
    },
    {
      company: "Tyco",
      title: "Project Manager",
      location: "Vaughan, ON",
      period: "2009 – 2012",
      projects: [
        { name: "DLS Implementation", summary: "Managed implementation and deployment involving 3 cross-functional teams.", bullets: ["Received Award of Excellence for DLS 1.7 project.", "Delivered workshops and training to 20+ end users."] }
      ]
    }
  ],

  education: [
    { degree: "Master of Management Analytics", school: "Smith School of Business, Queen's University", year: "2016–2017", focus: "Advanced Analytics: Optimization, Predictive & Cognitive Applications" },
    { degree: "Master of E-Commerce", school: "Bundelkhand University, India", year: "2000–2002" },
    { degree: "Bachelor of Science (Mathematics & Computer Science)", school: "Lucknow University, India", year: "1997–2000" },
    { degree: "Post Graduate Diploma in Business Management", school: "Centennial College, Toronto", year: "2007" }
  ],

  certifications: [
    "Project Management Professional (PMP) – PMI, 2015",
    "Certified Scrum Master (CSM) – Scrum Alliance, 2018",
    "ITIL v3 Foundation – Learning Tree, 2013",
    "Lean Six Sigma Yellow Belt – TD Bank, 2014"
  ],

  clearance: "Enhanced Security Cleared (PERC)"
};

// Resume Tailoring Engine
function tailorResume(jobDesc, maxBullets) {
  const jd = jobDesc.toLowerCase();
  const resume = JSON.parse(JSON.stringify(MASTER_RESUME));

  // Score each experience by keyword relevance
  const keywords = extractKeywords(jd);
  resume.experience.forEach(exp => {
    exp.relevanceScore = 0;
    exp.projects.forEach(proj => {
      const projText = [proj.name, proj.summary, ...(proj.bullets||[])].join(' ').toLowerCase();
      proj.keywordHits = keywords.filter(k => projText.includes(k)).length;
      proj.relevanceScore = proj.keywordHits + (proj.budget ? 1 : 0) + (proj.teamSize ? 0.5 : 0);
      exp.relevanceScore += proj.relevanceScore;
    });
    // Sort projects by relevance
    exp.projects.sort((a,b) => b.relevanceScore - a.relevanceScore);
  });

  // Sort experience by relevance
  resume.experience.sort((a,b) => b.relevanceScore - a.relevanceScore);

  // Filter skills by keyword match
  const matchedSkills = {};
  Object.entries(resume.skills).forEach(([cat, skills]) => {
    const matched = skills.filter(s => keywords.some(k => s.toLowerCase().includes(k)));
    if(matched.length) matchedSkills[cat] = matched;
  });
  resume.matchedSkills = matchedSkills;

  // Tailor summary
  const topKeywords = keywords.slice(0, 8);
  resume.tailoredSummary = resume.summary;
  if(topKeywords.length) {
    resume.tailoredSummary += ` Key strengths: ${topKeywords.join(', ')}.`;
  }

  resume.keywords = keywords;
  resume.maxBullets = maxBullets || 4;
  return resume;
}

function extractKeywords(jd) {
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','shall','this','that','these','those','it','its','as','not','no','all','each','every','both','few','more','most','other','some','such','than','too','very','just','also','any','into','over','after','before','between','under','above','below','up','down','out','off','through','during','until','about','against','among','within','without','along','across','behind','beyond','plus','except','upon','toward','towards','around','amongst','amidst','via','per','you','your','we','our','they','their','he','she','him','her','his','hers','them','us','my','me','i','who','what','which','where','when','how','why','if','then','else','so','because','since','while','although','though','even','still','already','yet','once','again','further','here','there','now','today','tomorrow','yesterday','always','never','sometimes','often','usually','well','however','therefore','thus','hence','accordingly','consequently','meanwhile','otherwise','instead','rather','namely','specifically','especially','particularly','generally','typically','usually','essentially','basically','fundamentally','primarily','mainly','largely','mostly','partly','somewhat','relatively','comparatively','similarly','likewise','accordingly','consequently','therefore','thus','hence']);

  const words = jd.replace(/[^a-zA-Z0-9+#/.]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const freq = {};
  words.forEach(w => {
    const lower = w.toLowerCase();
    if(!stopWords.has(lower) && !/^\d+$/.test(lower)) {
      freq[lower] = (freq[lower]||0) + 1;
    }
  });

  // Add multi-word phrases
  const phrases = [];
  const bigrams = jd.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
  bigrams.forEach(b => phrases.push(b.toLowerCase()));

  // Add tech terms
  const techTerms = jd.match(/\b(Agile|SAFe|Scrum|Waterfall|Jira|Confluence|Clarity|PMP|CSM|PMP|AWS|Azure|SQL|Python|Java|JavaScript|React|Node|API|REST|SOAP|CI\/CD|DevOps|SDLC|PDLC|ITIL|ITSM|PMP|CSM|IAM|SSO|MFA|IAM|PAM|Zero\s*Trust|PCI|SOX|GDPR|HIPAA|FATCA|WCAG|INTERAC|FIS|TMX|Snowflake|Tableau|Power\s*BI|Excel|SharePoint|MS\s*Project|Visio|Pega|SAP|Oracle|Salesforce|ServiceNow|Splunk|Qradar)\b/gi) || [];
  techTerms.forEach(t => phrases.push(t.toLowerCase()));

  const combined = {...freq};
  phrases.forEach(p => { combined[p] = (combined[p]||0) + 3; });

  return Object.entries(combined).sort((a,b) => b[1]-a[1]).slice(0, 30).map(e => e[0]);
}

// Generate formatted resume text
function generateResumeText(tailored) {
  let text = '';
  text += `${tailored.name}\n`;
  text += `${tailored.credentials}\n`;
  text += `${tailored.location} • ${tailored.phone} • ${tailored.email}\n\n`;

  text += `PROFESSIONAL SUMMARY\n${tailored.tailoredSummary}\n\n`;

  // Core competencies (matched)
  const allMatched = Object.values(tailored.matchedSkills).flat();
  if(allMatched.length) {
    text += `CORE COMPETENCIES\n${allMatched.join(' • ')}\n\n`;
  }

  text += `PROFESSIONAL EXPERIENCE\n`;
  tailored.experience.forEach(exp => {
    text += `\n${exp.title} — ${exp.company}, ${exp.location}\n${exp.period}\n`;
    exp.projects.slice(0, 2).forEach(proj => {
      text += `\n${proj.name}${proj.budget ? ` (${proj.budget})` : ''}: ${proj.summary}\n`;
      const bullets = proj.bullets.slice(0, tailored.maxBullets);
      bullets.forEach(b => text += `• ${b}\n`);
    });
  });

  text += `\nEDUCATION\n`;
  tailored.education.forEach(edu => {
    text += `• ${edu.degree} — ${edu.school} (${edu.year})\n`;
  });

  text += `\nCERTIFICATIONS\n`;
  tailored.certifications.forEach(cert => {
    text += `• ${cert}\n`;
  });

  return text;
}

// Generate cover letter
function generateCoverLetter(jobTitle, companyName, jobDesc) {
  const r = MASTER_RESUME;
  const keywords = extractKeywords(jobDesc.toLowerCase());
  const topSkills = keywords.slice(0, 5).join(', ');

  return `${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position${companyName ? ` at ${companyName}` : ''}. With over 15 years of experience delivering large-scale technology and regulatory transformation programs at Tier-1 Canadian banks — including CIBC, TD Bank, and BMO — I bring a proven track record of managing multi-million-dollar initiatives ($1M–$32M+) from inception through delivery.

Throughout my career, I have led complex, cross-functional programs spanning ${topSkills}, consistently delivering on time and within budget. My experience includes:

• Program Governance & Delivery: Led end-to-end program governance across Agile, SAFe, Waterfall, and hybrid frameworks, managing teams of up to 97 members and budgets exceeding $32M.

• Stakeholder Management: Established and chaired Executive Steering Committees, translating complex technical delivery into business impact for C-suite audiences.

• Regulatory & Compliance: Delivered regulatory programs (FATCA, CEBA, WCAG AA) ensuring full compliance with Canadian banking standards.

• Vendor Management: Coordinated multiple vendors simultaneously (IBM, Microsoft, FIS, Deloitte, AWS, Accenture) managing integration milestones and dependencies.

• Risk Management: Proactively identified and mitigated program risks, maintaining delivery velocity while ensuring compliance and security standards.

I am confident that my experience aligns well with the requirements for this role. I would welcome the opportunity to discuss how my background in ${topSkills} can contribute to your team's success.

Thank you for your consideration.

Sincerely,
${r.name}
${r.phone} | ${r.email}`;
}
