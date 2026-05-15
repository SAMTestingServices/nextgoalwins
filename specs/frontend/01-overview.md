# Frontend — Overview

## Concept

NextGoalWins lets a group of friends predict live football events together. One person creates a game, picks a fixture, configures event types (goal, card, foul, etc.) and their point values, then shares a 6-character join code. Friends enter the code and their name to join. When the host starts the game, everyone simultaneously predicts which player will be *next* to trigger each active event. Predictions can be changed at any time until the event actually happens, at which point points are awarded and everyone picks again for the next occurrence.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript (strict) |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v7 (hash-based, works without a server) |
| Icons | Lucide React |
| State | React Context + `useState` / `useCallback` |
| Real-time (future) | SignalR JS client (`@microsoft/signalr`) |
| Data layer (now) | `mockBackend` service (localStorage) |
| Data layer (future) | REST + SignalR via real backend |

## User Flows

### Host flow
1. Open app → "Create a Game"
2. Enter name → pick match → configure events → Create
3. Share game code with friends
4. Wait in lobby → see friends join
5. Click "Start Game"
6. During game: pick players for each event, watch the leaderboard update as events fire
7. Game ends → Results screen

### Guest flow
1. Receive a link or code from host
2. Open app → "Join a Game" → enter code + name → Join
3. Wait in lobby for host to start
4. Same game experience as host (minus the Start button)

### Join via shared link
- Direct URL: `/#/join/:gameId`
- Pre-fills the game code; user only needs to enter their name

## Key UX Decisions

- **No account/login** — a participant ID (GUID) is issued on create/join and stored in `sessionStorage`. This is the auth token.
- **Hash router** — the app can be served from any static host without server-side routing config.
- **Continuous re-prediction** — after each event fires, the prediction card stays open so the user immediately picks for the next occurrence. There is no "locked" state between events.
- **Visible to all** — everyone can see everyone else's current picks (transparent competition).
- **Simulator panel** — a yellow dev panel in the game view lets anyone fire manual or random events. This is present in the mock backend era and will be host-only (or removed) when the real backend is wired up.
