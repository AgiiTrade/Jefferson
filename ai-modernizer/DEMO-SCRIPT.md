# Enterprise Siebel Migration Client Demo Script — Agii AI Modernization

## Demo URL
- Public temporary: `https://video-wallpapers-wolf-blake.trycloudflare.com/siebel-demo/`
- Local/backend route: `http://localhost:3100/siebel-demo/`
- API payload: `http://localhost:3100/api/siebel-demo`
- Health check: `http://localhost:3100/api/health`

## 15-minute enterprise demo flow

### 0. Executive overview — 2 minutes
Open **0. Executive**.
- Position this as a realistic migration command center, not a UI mockup.
- Show program progress, migration completion, interface volume, data quality pass rate.
- Explain target architecture: Siebel UI/workflow/EAI/batch → modern customer 360, APIs, event flows, observability, audit.

Key line:
“Agii de-risks modernization by treating Siebel as a business-critical operating system: screens, workflows, integrations, data, security, and cutover all move through governed migration workstreams.”

### 1. Legacy Siebel pain — 2 minutes
Open **1. Legacy Siebel**.
- Show old applet navigation, account grid, service request applet.
- Emphasize fragmented context, manual routing, hidden integration failures, reporting delay.

Key line:
“The visible UI is only the surface. The migration risk is in business components, workflow scripts, EAI interfaces, data quality, and role visibility.”

### 2. Migration factory — 2 minutes
Open **2. Migration Factory**.
- Show discovery, data migration, API modernization, defects, migrated/source counts.
- Explain AI-assisted inventory, mapping, spec generation, test generation, and human approval gates.

Key line:
“AI accelerates the migration factory, but business-critical decisions remain controlled by owners, architects, and QA gates.”

### 3. Data quality/reconciliation — 2 minutes
Open **3. Data Quality**.
- Show duplicates, consent flags, invalid product codes, orphan references, free-text statuses.
- Explain why CRM migrations fail when data is ignored.

Key line:
“A clean modern UI on dirty CRM data is still a failed migration. We make data quality visible early.”

### 4. Integration modernization — 2 minutes
Open **4. Integrations**.
- Show SOAP, MQ, SFTP, LDAP, CTI moving to REST/events/OAuth.
- Emphasize idempotency, replay queue, observability, contract tests.

Key line:
“Siebel migrations succeed when interfaces become observable, testable, and replayable.”

### 5. Modern CRM — 3 minutes
Open **5. Modern CRM**.
- Show Customer 360, AI Case Queue, opportunity next-best actions.
- Create a new service case.
- Advance workflow.

Key line:
“This is the target operating model: modern UX, live APIs, AI triage, measurable SLA improvement, and sales/service intelligence.”

### 6. Testing/parity — 1.5 minutes
Open **6. Testing/Parity**.
- Show golden-data tests proving legacy and modern outputs match.
- Explain parity is where executives gain go-live confidence.

Key line:
“We do not just rebuild screens. We prove the business rules still behave correctly.”

### 7. Backend proof — 30 seconds
Open **7. Backend Proof**.
- Show `/api/health` and `/api/siebel-demo` payload.
- Mention Node/Express backend and SQLite-backed persistent demo records.

Key line:
“This is a working full-stack demo, not slides.”

## Discovery questions for client
1. Which Siebel modules are in scope: Sales, Call Center, Service, Field Service, Marketing, Partner Portal?
2. How many business components, applets, workflows, and scripts are customized?
3. What are the top 10 critical workflows that must prove parity?
4. Which integrations exist: Oracle ERP, billing, CTI, data warehouse, identity, email, document management?
5. What target platform is preferred: Salesforce, Dynamics, Oracle CX, custom React/Java/.NET, or hybrid?
6. What data issues are already known: duplicates, consent, orphan contacts, retired products, free-text statuses?
7. What compliance/audit requirements must survive migration?
8. What is the preferred cutover pattern: big bang, phased by module, phased by region, or strangler/API facade?

## Suggested paid pilot offer
**4-week Siebel Modernization Assessment + Prototype**
- Week 1: Inventory screens/workflows/integrations/data risks
- Week 2: Target architecture and migration backlog
- Week 3: Working prototype for one high-value workflow
- Week 4: Parity test pack, executive roadmap, fixed-scope implementation plan

Deliverables:
- Siebel modernization assessment
- Integration map
- Data quality report
- Target architecture
- Working prototype
- Cost/risk roadmap
- Implementation proposal
