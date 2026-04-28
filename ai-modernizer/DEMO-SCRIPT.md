# Siebel Migration Client Demo Script — Agii AI Modernization

## Demo URL
- Local/backend route: `http://localhost:3100/siebel-demo/`
- API payload: `http://localhost:3100/api/siebel-demo`
- Health check: `http://localhost:3100/api/health`

## 10-minute flow

### 1. Set the business context — 60 seconds
“Today I’ll show a realistic Siebel CRM modernization journey: the legacy call-centre experience, the migration cockpit, and the migrated modern CRM backed by live APIs and database data.”

### 2. Show legacy Siebel pain — 2 minutes
Open **1. Legacy Siebel**.
- Point out old applet/screen navigation.
- Show accounts and service requests in separate grids.
- Emphasize manual queue routing, fragmented customer profile, and integration opacity.

Key line:
“Most migration risk is not just UI replacement. It’s hidden workflow, business rules, service queues, and integrations.”

### 3. Show migration cockpit — 2 minutes
Open **2. Migration Cockpit**.
- Explain discovery, data migration, API modernization, and validation.
- Show migrated/source object counts and defects.
- Position Agii as the controlled AI-assisted factory, not a risky rewrite.

Key line:
“We use AI to accelerate inventory, mapping, test generation, and migration planning, but keep human approval gates for critical business logic.”

### 4. Show modern CRM — 3 minutes
Open **3. Modern CRM**.
- Show Customer 360 cards.
- Show AI Case Queue summaries and SLA risk.
- Create a new service case using the form.
- Advance a workflow.
- Show sales pipeline and AI next-best actions.

Key line:
“This is the target operating model: clean UX, REST APIs, AI-assisted triage, and measurable process improvement.”

### 5. Prove full stack — 90 seconds
Open **4. Backend Proof**.
- Show `/api/health` response.
- Show `/api/siebel-demo` payload.
- Explain Node/Express API + SQLite-backed demo data.

Key line:
“This is not just a PowerPoint mockup. The UI is calling live backend endpoints with persistent demo records.”

## Discovery questions for client
1. Which Siebel modules are in scope: Sales, Call Center, Service, Field Service, Marketing?
2. How many integrations exist: ERP, billing, identity, data warehouse, CTI, email?
3. What target platform is preferred: Salesforce, Dynamics, custom React/Java/.NET, Oracle CX, or hybrid?
4. What is the migration priority: UI replacement, integration modernization, data cleanup, AI service automation, or cost reduction?
5. What compliance/audit constraints must be preserved?

## Suggested pilot offer
**2–4 week Siebel Modernization Assessment**
- Legacy screen/workflow inventory
- Integration map
- Data migration risk report
- Modern target architecture
- Working prototype for one high-value workflow
- Fixed-scope implementation roadmap
