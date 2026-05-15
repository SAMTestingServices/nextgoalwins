# Backend — SignalR Real-Time

## Overview

SignalR is used to push game state changes to all connected clients instantly, replacing the polling loop currently in `LobbyPage`.

The hub endpoint is `/hubs/game`.

Each game has its own SignalR group named after the game ID (e.g., `"ABC123"`). Clients join the group when they load the lobby or game page and leave when they navigate away.

---

## Hub: `GameHub`

**Namespace:** `NextGoalWins.Api.Hubs`  
**Endpoint:** `/hubs/game`

### Client → Server methods (invocable by connected clients)

#### `JoinGameGroup(gameId)`

Called by the client when it loads the lobby or game page. Adds the connection to the SignalR group for that game so it receives all subsequent push events.

```csharp
public async Task JoinGameGroup(string gameId)
{
    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
}
```

#### `LeaveGameGroup(gameId)`

Called when the client navigates away. Optional — connections are cleaned up automatically on disconnect, but explicit leave is cleaner.

```csharp
public async Task LeaveGameGroup(string gameId)
{
    await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
}
```

---

## Server → Client events (pushed to group)

All events are sent to the game's group (all connected participants receive them).

### `ParticipantJoined`

Fired when a new player joins the lobby.

**Payload**
```json
{
  "participant": {
    "id": "uuid",
    "name": "Bob",
    "isHost": false,
    "score": 0,
    "correctPredictions": 0,
    "predictions": {}
  }
}
```

Replaces lobby polling on the client side.

---

### `GameStarted`

Fired when the host clicks Start.

**Payload**
```json
{
  "gameId": "ABC123",
  "startedAt": "2026-05-15T15:02:00Z"
}
```

Client reaction: navigate to `/game/:gameId`.

---

### `PredictionUpdated`

Fired when any participant changes their pick for an event.

**Payload**
```json
{
  "participantId": "uuid",
  "participantName": "Alice",
  "eventType": "goal",
  "playerId": "player-uuid",
  "playerName": "Bukayo Saka"
}
```

Client reaction: update the relevant participant's prediction in local state.

---

### `EventFired`

Fired when the host records a real match event. This is the main scoring event.

**Payload**
```json
{
  "event": {
    "id": "event-uuid",
    "type": "goal",
    "playerId": "player-uuid",
    "playerName": "Bukayo Saka",
    "team": "home",
    "minute": 23,
    "timestamp": 1747300920000
  },
  "updatedScores": [
    { "participantId": "uuid", "name": "Alice", "score": 50, "correctPredictions": 2 },
    { "participantId": "uuid", "name": "Bob",   "score": 25, "correctPredictions": 1 }
  ],
  "matchScore": { "home": 1, "away": 0 },
  "matchMinute": 23
}
```

Client reaction: append the event to the feed, update all participant scores, update the match scoreline.

---

### `ClockAdvanced`

Fired when the match clock is updated.

**Payload**
```json
{
  "minute": 45
}
```

---

### `GameEnded`

Fired when the host ends the game.

**Payload**
```json
{
  "gameId": "ABC123",
  "finalStandings": [
    { "participantId": "uuid", "name": "Alice", "score": 75, "correctPredictions": 3 }
  ]
}
```

Client reaction: navigate to `/results/:gameId`.

---

## Client Integration (Frontend)

The frontend will use `@microsoft/signalr` npm package.

```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('https://localhost:7000/hubs/game')
  .withAutomaticReconnect()
  .build();

await connection.start();
await connection.invoke('JoinGameGroup', gameId);

connection.on('EventFired', (payload) => {
  // update game state
});
```

This wiring lives in `GameContext`, replacing the polling interval.

---

## `IGameHubNotifier` Interface

Defined in `NextGoalWins.Core` so the service layer can trigger notifications without depending directly on SignalR:

```csharp
public interface IGameHubNotifier
{
    Task ParticipantJoined(string gameId, ParticipantDto participant);
    Task GameStarted(string gameId);
    Task PredictionUpdated(string gameId, PredictionUpdatedPayload payload);
    Task EventFired(string gameId, EventFiredPayload payload);
    Task ClockAdvanced(string gameId, int minute);
    Task GameEnded(string gameId, IEnumerable<ParticipantDto> finalStandings);
}
```

`GameHubNotifier` in `NextGoalWins.Api` implements this using `IHubContext<GameHub>`.
