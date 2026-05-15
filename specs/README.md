# NextGoalWins — Specification Index

Real-time in-game football prediction app. Friends join a private lobby tied to a live match and predict which player will be next to score, foul, get carded, or be substituted. Predictions can be changed freely until each event fires; points are awarded instantly for correct picks.

---

## Specs

### Shared
- [Data Models](shared/01-data-models.md) — canonical types shared between frontend and backend

### Frontend
- [Overview](frontend/01-overview.md) — concept, tech stack, user flows
- [Routes & Pages](frontend/02-routes-and-pages.md) — all routes and what each page does
- [Components](frontend/03-components.md) — component breakdown and responsibilities
- [State & Context](frontend/04-state-and-context.md) — GameContext, state shape, data flow
- [Mock Backend](frontend/05-mock-backend.md) — how the mock works and how to replace it with the real API

### Backend
- [Overview](backend/01-overview.md) — .NET 9, SQL Server, architecture, project structure
- [API Endpoints](backend/02-api-endpoints.md) — all REST endpoints, request/response shapes
- [SignalR Real-Time](backend/03-signalr.md) — hub events pushed to connected clients
- [Database Schema](backend/04-database-schema.md) — tables, columns, relationships, indexes
- [Auth & Sessions](backend/05-auth.md) — sessionless join-by-code token approach

---

## Status

| Area | Status |
|---|---|
| Frontend (React) | ✅ Built — mock backend |
| Shared data models | ✅ Defined in `src/types/index.ts` |
| Backend (.NET 9) | 🔲 Not started |
| Database (SQL Server) | 🔲 Not started |
| Real-time (SignalR) | 🔲 Not started |
| Frontend → real API wiring | 🔲 Not started |
