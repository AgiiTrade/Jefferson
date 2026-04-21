# Scrum Board Backend

Backend API for the Jefferson / Scrum Board app.

## Run
```bash
cd backend
npm install
npm start
```

Default port: `3210`

## Managed process option
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
```

## Environment
Copy `.env.example` to `.env` if you want explicit runtime config.

## Public saving note
The frontend is now backend-capable, but phone/public saving only works when this backend is deployed on a stable host. A GitHub Pages frontend cannot persist to a backend that only exists on localhost.

## Main endpoints
- `GET /api/health`
- `GET /api/summary`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

## Notes
- Uses SQLite for persistence
- Stores subtasks, notes, tags, and assigned users as JSON on tasks/events for simplicity
- CORS, validation, and basic error handling are included
- See `DEPLOY-RUNBOOK.md` for stable deployment steps
