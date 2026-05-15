# Backend — API Endpoints

Base path: `/api`  
All requests and responses use `application/json` with camelCase field names.  
All endpoints that act on a specific game require the `X-Participant-Token` header (the participant GUID issued on create/join).

---

## Matches

### `GET /api/matches`

Returns the list of available fixtures users can base a game on.

**Response 200**
```json
[
  {
    "id": "match-uuid",
    "competition": "Premier League",
    "homeTeam": { ... },
    "awayTeam": { ... },
    "kickoff": "2026-05-15T15:00:00Z",
    "score": { "home": 0, "away": 0 },
    "minute": 0,
    "status": "scheduled"
  }
]
```

> Initially this returns a seeded/hardcoded list. Later it can integrate with a live football data API.

---

## Games

### `POST /api/games`

Creates a new game.

**Request body**
```json
{
  "hostName": "Alice",
  "matchId": "match-uuid",
  "eventConfigs": [
    { "type": "goal",        "label": "Next Goal",        "points": 25, "icon": "⚽" },
    { "type": "yellow_card", "label": "Next Yellow Card", "points": 15, "icon": "🟨" }
  ]
}
```

**Response 201**
```json
{
  "game": { ... full Game object ... },
  "participantToken": "host-participant-uuid"
}
```

The `participantToken` must be stored by the client and sent in `X-Participant-Token` on all subsequent requests.

---

### `GET /api/games/{gameId}`

Returns the full current state of a game.

**Headers:** `X-Participant-Token: <uuid>`

**Response 200** — full `Game` object (see shared data models).  
**Response 404** — game not found.

---

### `POST /api/games/{gameId}/join`

Join an existing game in lobby status.

**Request body**
```json
{
  "playerName": "Bob"
}
```

**Response 200**
```json
{
  "game": { ... },
  "participantToken": "participant-uuid"
}
```

**Response 404** — game not found.  
**Response 409** — game already started or finished.

---

### `POST /api/games/{gameId}/start`

Start the game. Host only.

**Headers:** `X-Participant-Token: <host-uuid>`

**Response 200** — updated `Game` object.  
**Response 403** — caller is not the host.  
**Response 409** — game is not in lobby status.

Side effect: pushes `GameStarted` event to all connected SignalR clients in the game group.

---

### `PUT /api/games/{gameId}/predictions/{eventType}`

Update the current participant's prediction for one event type.

**Headers:** `X-Participant-Token: <uuid>`

**Request body**
```json
{
  "playerId": "player-uuid"
}
```

**Response 200** — updated `Participant` object.  
**Response 400** — invalid event type or player not in this match.  
**Response 409** — game is not live.

Side effect: pushes `PredictionUpdated` event to all SignalR clients in the game group.

---

### `POST /api/games/{gameId}/events`

Record a real match event and award points. Host only (or admin in future).

**Headers:** `X-Participant-Token: <host-uuid>`

**Request body**
```json
{
  "type": "goal",
  "playerId": "player-uuid",
  "minute": 23
}
```

**Response 200**
```json
{
  "event": { ... MatchEvent ... },
  "pointsAwarded": [
    { "participantId": "uuid", "participantName": "Alice", "points": 25 }
  ]
}
```

**Response 403** — caller is not the host.  
**Response 400** — event type not active in this game, or player not in this match.

Side effect: pushes `EventFired` event to all SignalR clients in the game group.

---

### `PATCH /api/games/{gameId}/clock`

Advance the match clock (used by SimulatorPanel / host tooling).

**Headers:** `X-Participant-Token: <host-uuid>`

**Request body**
```json
{ "minute": 45 }
```

**Response 200** — updated `Match` object (score + minute).

---

### `POST /api/games/{gameId}/end`

End the game. Host only.

**Headers:** `X-Participant-Token: <host-uuid>`

**Response 200** — final `Game` object with `status: "finished"`.

Side effect: pushes `GameEnded` event to all SignalR clients in the game group.

---

## Error Responses

All errors follow a consistent shape:

```json
{
  "error": "GameAlreadyStarted",
  "message": "This game has already started and cannot be joined."
}
```

| HTTP Status | When |
|---|---|
| 400 Bad Request | Invalid input (missing fields, unknown event type, player not in match) |
| 403 Forbidden | Action requires host, but caller is not the host |
| 404 Not Found | Game or match does not exist |
| 409 Conflict | State conflict (joining a started game, starting an already-live game) |
| 500 Internal | Unexpected server error |
