# Frontend — Mock Backend

**Location:** `src/services/mockBackend.ts`

The mock backend simulates the full server API using `localStorage` for persistence and `sessionStorage` for session identity. It allows the app to be developed and tested without a running .NET server.

---

## Storage

| Store | Key | Contents |
|---|---|---|
| `localStorage` | `ngw_games` | JSON map of `gameId → Game` — all game state |
| `sessionStorage` | `ngw_user_id` | Current user's participant ID |
| `sessionStorage` | `ngw_game_id` | Current user's game ID |

---

## Methods

### `getAvailableMatches() → Match[]`
Returns a hardcoded list of mock Premier League fixtures from `src/data/mockData.ts`. In production this will be replaced by `GET /api/matches`.

### `getDefaultEventConfigs() → EventConfig[]`
Returns the default event config list (goal 25pts, yellow card 15pts, etc.). In production this will either be hardcoded on the client or fetched from the API.

### `createGame(hostName, matchId, eventConfigs) → Game`
1. Looks up the match by ID from mock data.
2. Generates a random 6-character uppercase game ID and a random participant ID for the host.
3. Constructs a `Game` in `lobby` status.
4. Persists to `localStorage`.
5. Writes `ngw_user_id` and `ngw_game_id` to `sessionStorage`.
6. Returns the created `Game`.

### `joinGame(gameId, playerName) → Game`
1. Looks up the game; throws if not found or not in `lobby` status.
2. Generates a new participant ID.
3. Appends the participant to `game.participants`.
4. Persists to `localStorage`.
5. Writes `ngw_user_id` and `ngw_game_id` to `sessionStorage`.
6. Returns the updated `Game`.

### `getGame(gameId) → Game | null`
Reads from `localStorage`. Returns `null` if not found.

### `startGame(gameId) → Game`
Sets `game.status = 'live'` and `game.match.status = 'live'`. Persists and returns.

### `updatePrediction(gameId, participantId, eventType, playerId) → Game`
Updates `participant.predictions[eventType]` and persists.

### `fireEvent(gameId, eventType, playerId, minute) → Game`
1. Finds the player and event config.
2. Appends a `MatchEvent` to `game.events`.
3. Awards `eventConfig.points` to any participant whose prediction for this event type matches `playerId`.
4. If the event is a goal, increments the appropriate score.
5. Updates `game.match.minute`.
6. Persists and returns.

### `advanceClock(gameId, minute) → Game`
Sets `game.match.minute`. Persists and returns.

### `endGame(gameId) → Game`
Sets `game.status = 'finished'` and `game.match.status = 'finished'`. Persists and returns.

### `getCurrentUser() → { userId, gameId }`
Reads from `sessionStorage`.

---

## Replacing the Mock with the Real API

When the .NET backend is ready, replace `mockBackend.ts` with an `apiClient.ts` that maps each method to the corresponding REST call:

| Mock method | Real endpoint |
|---|---|
| `getAvailableMatches()` | `GET /api/matches` |
| `createGame(...)` | `POST /api/games` |
| `joinGame(...)` | `POST /api/games/{id}/join` |
| `getGame(id)` | `GET /api/games/{id}` |
| `startGame(id)` | `POST /api/games/{id}/start` |
| `updatePrediction(...)` | `PUT /api/games/{id}/predictions/{eventType}` |
| `fireEvent(...)` | `POST /api/games/{id}/events` |
| `advanceClock(...)` | `PATCH /api/games/{id}/clock` |
| `endGame(id)` | `POST /api/games/{id}/end` |

`GameContext` calls the service layer — it does not call the mock directly — so the swap is contained to one file.
