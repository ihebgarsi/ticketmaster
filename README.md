# TicketMaster - High-Performance Scalable Football Ticketing System

Scalable ticketing system for managing high-concurrency football events with queueing, reservations, and checkout.

## Architecture

- **Backend**: Express.js + TypeScript + Prisma + PostgreSQL + Redis
- **Frontend**: React + TypeScript + Vite + React Query
- **Core Features**: Distributed locking, rate limiting, queue/waiting room, transactional reservations

## Quick start with Docker (recommended for deployment)

### 1. Configure environment

```bash
cp .env.docker.example .env
```

Edit `.env` and set a strong `JWT_SECRET`.

### 2. Start the stack

```bash
docker compose up --build
```

Open **http://localhost:5323**

This starts:

| Service | Purpose |
|---|---|
| `postgres` | Database |
| `redis` | Queue, cache, locks, rate limiting |
| `backend` | API on port 4000 (internal) |
| `frontend` | nginx serving the React app and proxying `/api` |

Migrations run automatically when the backend container starts.

### 3. Promote an admin user

After signing up in the app:

```bash
# Set ADMIN_EMAIL in .env, then:
docker compose exec backend npm run seed
```

## Local development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5323** (Vite proxies `/api` to `http://localhost:4000`).

### Requirements

- Node.js 20+
- PostgreSQL 14+
- Redis 6+

## Production deployment

### Backend

```bash
cd backend
npm ci
npm run build
npm run start:prod
```

`start:prod` runs `prisma migrate deploy` before starting the server.

Required environment variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Strong secret for signing JWTs |
| `CLIENT_ORIGIN` | Yes | Frontend URL for CORS |
| `NODE_ENV` | Yes | Set to `production` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `QUEUE_ADMISSION_LIMIT` | Optional | Default `50` |

Health checks:

- `GET /health`
- `GET /api/health`

### Frontend

```bash
cd frontend
npm ci
npm run build
```

Serve `frontend/dist` behind nginx and proxy `/api` to the backend.

See `frontend/nginx.conf` for a working example used by the Docker frontend image.

### Manual nginx example

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:4000/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  root /var/www/ticketmaster/dist;
  try_files $uri $uri/ /index.html;
}
```

Set `CLIENT_ORIGIN` to your public site URL, for example `https://tickets.example.com`.

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/events` | List events |
| `GET` | `/api/events/:id` | Event details |
| `GET` | `/api/events/:id/tickets` | Available seats |
| `POST` | `/api/tickets/reserve` | Reserve selected tickets |
| `POST` | `/api/queue/enter` | Join waiting room (auth) |
| `GET` | `/api/queue/status/:eventId` | Queue position (auth) |
| `DELETE` | `/api/queue/leave/:eventId` | Leave queue (auth) |
| `GET` | `/api/orders/:orderId` | Order details (auth) |
| `POST` | `/api/orders/:orderId/complete` | Mock payment complete (auth) |
| `POST` | `/api/auth/register` | Register |
| `POST` | `/api/auth/login` | Login |

## Key features

1. **Transactional ticket reservations** with distributed locking
2. **Waiting room queue** with admission limits
3. **Reservation expiry** with automatic cleanup
4. **Redis caching** for availability
5. **Rate limiting** per IP
6. **Mock checkout** (replace with a real payment provider later)

## Notes for production

- Payment is currently mocked on the checkout page.
- Events do not auto-create tickets; add tickets via Prisma Studio or seed scripts.
- Set `NODE_ENV=production` so auth cookies are marked `secure` on HTTPS.
- The backend validates `JWT_SECRET` and `CLIENT_ORIGIN` on startup in production.

## Project structure

```
backend/          API, Prisma, queue, tickets, orders
frontend/         React app + nginx config for Docker
docker-compose.yml
.env.docker.example
```
