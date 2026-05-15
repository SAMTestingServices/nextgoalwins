# Frontend — State & Context

---

## `GameContext`

**Location:** `src/context/GameContext.tsx`

The single shared state store for the active game. All pages that need game data consume this context via the `useGame()` hook.

### State

| Field | Type | Description |
|---|---|---|
| `game` | `Game \| null` | The full current game object |
| `currentUserId` | `string \| null` | Participant ID for the current user (from `sessionStorage`) |

### Actions exposed via context

| Action | Signature | Description |
|---|---|---|
| `loadGame` | `(gameId: string) => void` | Fetch game from backend/mock and set state |
| `refreshGame` | `() => void` | Re-fetch the current game (used for polling) |
| `updatePrediction` | `(eventType, playerId) => void` | Update the current user's pick for one event |
| `fireEvent` | `(eventType, playerId, minute) => void` | Fire a match event (used by SimulatorPanel) |
| `advanceClock` | `(minute: number) => void` | Move the match clock |
| `endGame` | `() => void` | Transition game to finished |

### Notes

- `GameProvider` wraps the entire app so the game state is preserved across route navigations.
- `currentUserId` is initialised from `sessionStorage` on mount. When the user creates or joins a game, the backend issues a participant ID which is stored in `sessionStorage` and loaded here.
- All actions call the backend service and then update local state with the response — there is no optimistic update that diverges from server state.

---

## Polling

While a real-time SignalR connection is not yet wired up, `LobbyPage` polls `loadGame` every 2 seconds to detect new participants joining and the game transitioning to `live`. Once SignalR is integrated, this polling loop will be replaced by hub event handlers.

---

## Session Storage Keys

| Key | Value | Set when |
|---|---|---|
| `ngw_user_id` | Participant GUID | User creates or joins a game |
| `ngw_game_id` | Game ID (6-char) | User creates or joins a game |

These keys survive page refreshes but not closing the browser tab (by design — no persistent accounts).

---

## Future: SignalR Integration

When the real backend is connected, `GameContext` will:

1. Establish a SignalR connection to `GameHub` on `loadGame`.
2. Subscribe to hub events: `ParticipantJoined`, `GameStarted`, `PredictionUpdated`, `EventFired`, `GameEnded`.
3. On each hub event, update the `game` state directly — eliminating the need for polling.
4. Disconnect and clean up the hub connection when the component unmounts or the game finishes.

The actions (`updatePrediction`, `fireEvent`, etc.) will call REST endpoints rather than hub methods; the hub is receive-only from the client's perspective.
