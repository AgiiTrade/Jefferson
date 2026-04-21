# AI Modernizer backend deploy runbook

## 1. Install dependencies
```bash
cd backend
npm install
```

## 2. Create environment file
Copy `.env.example` to `.env` and set:
- `NODE_ENV=production`
- `PORT`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`

## 3. Start locally for validation
```bash
NODE_ENV=production node server.js
```

## 4. Verify endpoints
- `GET /api/health`
- `GET /api/stats`
- `POST /api/analyze`
- `POST /api/contact`

## 5. Run under a managed process
Example with PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

## 6. Production deploy expectations
- run with process supervision
- ensure reverse proxy forwards real IP headers
- keep database file in a backed-up location if staying on SQLite
- set monitoring on health endpoint
- rotate logs or connect them to your host logging stack

## 7. Minimum production checks
- backend refuses default JWT secret in production
- CORS allowlist is restricted
- rate limiting is active
- logs are visible
- restart policy is enabled
- `npm test` passes before deployment
