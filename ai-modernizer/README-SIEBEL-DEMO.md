# Agii AI Modernizer — Siebel Migration Demo

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
- Legacy Siebel-style CRM frontend
- Migration cockpit with object counts, defects, and modernization phases
- Migrated modern CRM frontend
- Express backend APIs
- SQLite-backed demo data
- Create/advance service cases through live endpoints

## API endpoints
- `GET /api/health`
- `GET /api/siebel-demo`
- `POST /api/siebel-demo/cases`
- `PATCH /api/siebel-demo/cases/:id`

## Demo docs
See `DEMO-SCRIPT.md` for the client talk track.
