# Agii AI Modernizer — Enterprise Siebel Migration Demo

## Run
```bash
cd active/deploy/ai-modernizer/backend
npm install
npm start
```

Open:
```text
http://localhost:3100/siebel-demo/
```

## What it demonstrates
This is a fuller client-facing showcase, not a tiny prototype:

- Executive migration command center
- Legacy Siebel-style CRM frontend
- Migration factory cockpit
- Data quality and reconciliation dashboard
- Integration modernization from SOAP/MQ/SFTP/LDAP/CTI to REST/events/OAuth
- Modern migrated CRM / Customer 360 frontend
- AI case queue and live service case workflow
- Opportunity pipeline with next-best actions
- Testing/parity evidence dashboard
- Backend proof tab showing live API responses
- Express backend APIs
- SQLite-backed demo data

## API endpoints
- `GET /api/health`
- `GET /api/siebel-demo`
- `POST /api/siebel-demo/cases`
- `PATCH /api/siebel-demo/cases/:id`

## Backend demo domains
- `siebel_accounts`
- `siebel_cases`
- `siebel_opportunities`
- `migration_events`
- `siebel_integrations`
- `data_quality_rules`
- `parity_tests`
- `migration_workstreams`

## Demo docs
See `DEMO-SCRIPT.md` for the 15-minute enterprise talk track and pilot offer.
