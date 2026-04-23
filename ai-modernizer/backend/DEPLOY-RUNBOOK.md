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
- `DB_PATH`
- `ALLOWED_ORIGINS`
- `HEALTHCHECK_TIMEOUT_MS`

## 3. Start locally for validation
```bash
NODE_ENV=production node server.js
```

## 4. Verify endpoints
- `GET /api/health`
- `GET /api/ready`
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
- use a dedicated writable data directory for `DB_PATH`
- monitor both `/api/health` and `/api/ready`
- rotate logs or connect them to your host logging stack
- schedule recurring database backups if staying on SQLite

## 7. Minimum production checks
- backend refuses default JWT secret in production
- CORS allowlist is restricted
- rate limiting is active
- logs are visible
- restart policy is enabled
- WAL mode is enabled for SQLite durability
- `npm test` passes before deployment

## 8. Backup command
If you are staying on SQLite for production or pilot use, create recurring backups.

```bash
npm run backup:db
```

This writes a timestamped copy of the current database into `backend/backups/`.
