# Scrum Board backend deploy runbook

## Current truth
The scrum-board frontend can now talk to the backend API, but **public persistence only works when the backend is deployed on a stable host**.
A GitHub Pages page cannot save to a backend that only exists on localhost.

## 1. Install dependencies
```bash
cd backend
npm install
```

## 2. Create environment file
Copy `.env.example` to `.env` and set at minimum:
- `NODE_ENV=production`
- `PORT`
- `ALLOWED_ORIGINS`

## 3. Validate locally
```bash
PORT=3210 node server.js
```
Then verify:
- `GET /api/health`
- `GET /api/summary`
- create/update/delete task flow

## 4. Run under a managed process
Example with PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

## 5. Production hosting requirement
To make the scrum board save reliably from phone/public links, deploy the backend on a stable host and point the frontend to that real API URL.

The frontend now supports a configurable backend API base by either:
- setting `window.SCRUM_API_BASE`
- opening the page with `?api=https://your-api.example.com/api`
- or letting it use same-origin `/api` when hosted together

## 6. Minimum production checks
- backend restarts automatically
- logs are retained
- health endpoint is reachable
- allowed origins are restricted
- frontend is pointed at the real API URL
- database file is backed up if SQLite stays in use
