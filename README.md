# TicketMaster - High-Performance Scalable Football Ticketing System

Scalable ticketing system for managing high-concurrency football events with 20,000+ simultaneous users.

## Architecture

- **Backend**: Express.js + TypeScript + Prisma + PostgreSQL + Redis
- **Frontend**: React + TypeScript + Vite + React Query
- **Core Features**: Distributed locking, rate limiting, queue/waiting room, transactional reservations

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/        # Authentication (JWT, session management)
│   │   ├── events/      # Event CRUD and availability caching
│   │   ├── tickets/     # Core reservation logic with distributed locking
│   │   ├── orders/      # Order lifecycle management
│   │   ├── payments/    # Payment gateway integration
│   │   └── queue/       # Waiting room and queue management
│   └── shared/
│       ├── db.ts        # Prisma client
│       ├── redis.ts     # Redis connection
│       ├── lock.ts      # Redlock for distributed locking
│       ├── errors.ts    # Error handling
│       ├── rateLimiter.ts
│       └── reservationSweeper.ts
├── prisma/
│   └── schema.prisma    # Database schema

frontend/
├── src/
│   ├── pages/           # Event list, details, checkout, queue
│   ├── components/      # UI components
│   ├── hooks/           # Custom hooks (ticket availability)
│   └── api/             # API client and queries
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Key Features

1. **Transactional Ticket Reservations**: Atomic DB transactions + distributed locking prevent overselling
2. **Reservation Expiration**: 10-minute hold with automatic cleanup
3. **Redis Caching**: Event availability cached for 20 seconds
4. **Rate Limiting**: 100 requests per minute per IP
5. **Waiting Room**: Queue system for high-traffic events
6. **Stateless Backend**: Horizontal scaling ready

## API Endpoints

- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details with availability
- `POST /api/tickets/reserve` - Reserve tickets (core transaction)
- `POST /api/queue/enter` - Join waiting room
- `GET /api/queue/status/:eventId/:sessionId` - Check queue position

## Next Steps

- [ ] Auth module (JWT)
- [ ] Payment processing integration
- [ ] WebSocket real-time updates
- [ ] Queue management UI
- [ ] Load testing and optimization
