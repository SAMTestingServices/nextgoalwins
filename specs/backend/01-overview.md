# Backend — Overview

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | ASP.NET Core 9 (minimal API style or controller-based) |
| Language | C# 13 |
| ORM | Entity Framework Core 9 |
| Database | SQL Server (latest) |
| Real-time | ASP.NET Core SignalR |
| Auth | Sessionless — participant token issued on create/join |
| Serialisation | `System.Text.Json` with camelCase naming |
| API docs | Swagger / OpenAPI (Swashbuckle) |

---

## Repository Location

The backend lives inside the same repo under `/backend/`:

```
NextGoalWins/
  src/                    ← React frontend
  specs/                  ← Spec files
  backend/
    NextGoalWins.Api/     ← ASP.NET Core Web API project
    NextGoalWins.Core/    ← Domain models, interfaces, business logic
    NextGoalWins.Data/    ← EF Core DbContext, migrations, repositories
    NextGoalWins.sln      ← Solution file
```

---

## Architecture

Three-layer clean architecture:

```
HTTP Request
    ↓
Controllers / Minimal API endpoints   (NextGoalWins.Api)
    ↓
Services / Business logic             (NextGoalWins.Core)
    ↓
Repositories + DbContext              (NextGoalWins.Data)
    ↓
SQL Server
```

**SignalR** sits alongside the controllers in `NextGoalWins.Api` and is called from the service layer via an `IGameHubNotifier` interface (so the core layer does not take a direct dependency on SignalR).

---

## Project Responsibilities

### `NextGoalWins.Core`
- Domain entity classes (`Game`, `Participant`, `MatchEvent`, etc.)
- Service interfaces (`IGameService`, `IMatchService`)
- Service implementations
- `IGameHubNotifier` interface (implemented in Api layer)
- Custom exception types (`GameNotFoundException`, `GameAlreadyStartedException`, etc.)

### `NextGoalWins.Data`
- `AppDbContext` (EF Core)
- Entity configurations (Fluent API)
- Repository implementations
- EF Core migrations

### `NextGoalWins.Api`
- Controllers or minimal API endpoint groups
- `GameHub` (SignalR)
- `GameHubNotifier` (implements `IGameHubNotifier`)
- DTOs / request-response models
- Middleware (global error handling, CORS)
- `Program.cs` / DI registration

---

## CORS

The API must allow requests from the React dev server (`http://localhost:3000`) during development. In production, configure to the deployed frontend origin.

---

## Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "Default": "Server=.;Database=NextGoalWins;Trusted_Connection=True;"
  },
  "Jwt": {
    "Secret": "... (not used in sessionless mode, reserved)"
  },
  "AllowedOrigins": ["http://localhost:3000"]
}
```

---

## Running Locally

```bash
cd backend
dotnet restore
dotnet ef database update --project NextGoalWins.Data --startup-project NextGoalWins.Api
dotnet run --project NextGoalWins.Api
```

API will be available at `https://localhost:7000` (or `http://localhost:5000`).
Swagger UI at `/swagger`.
