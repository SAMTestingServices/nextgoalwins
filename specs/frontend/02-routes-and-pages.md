# Frontend — Routes & Pages

All routes use React Router v7 with a hash-based router (`HashRouter`), so URLs look like `http://localhost:3000/#/create`.

---

## Route Table

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Landing — create or join a game |
| `/create` | `CreateGamePage` | 3-step wizard to create a game |
| `/lobby/:gameId` | `LobbyPage` | Pre-game waiting room |
| `/game/:gameId` | `GamePage` | Main live prediction screen |
| `/results/:gameId` | `ResultsPage` | Post-game standings and recap |
| `/join/:gameId` | `JoinPage` | Direct join via shared link |

---

## Pages

### `HomePage`

Two tabs: **Create a Game** and **Join a Game**.

- **Create tab**: button navigates to `/create`.
- **Join tab**: text inputs for game code and player name. On submit, validates the code exists and the game is still in `lobby` status, calls `joinGame`, navigates to `/lobby/:gameId`.
- Shows a validation error if the game code is unknown or the game has already started.

---

### `CreateGamePage`

Three-step wizard with a progress indicator.

**Step 1 — Your name**
- Single text input for the host's display name.
- Validation: non-empty.

**Step 2 — Pick a match**
- Lists available fixtures from `getAvailableMatches()`.
- Each fixture shows: competition, home team, away team, kickoff date/time.
- Selection is highlighted with a green border.

**Step 3 — Configure events**
- Lists all supported event types with a toggle (on/off), point display, and +/− buttons to adjust points in steps of 5.
- At least one event must be active to enable "Create".
- On submit: calls `createGame(hostName, matchId, eventConfigs)` → navigates to `/lobby/:gameId`.

---

### `LobbyPage`

Pre-game waiting room. Polls the game state every 2 seconds to pick up new participants.

- Displays the 6-character game code prominently with a copy button.
- Shows a share URL (`/#/join/:gameId`).
- Lists all current participants with their name, a "You" badge (own entry), and a crown icon for the host.
- Shows active event configs as pills (icon + label + points).
- **Host only**: "Start Game" button → calls `startGame` → navigates to `/game/:gameId`.
- **Non-host**: shows "Waiting for host to start..." with an animated clock icon.
- When the game transitions to `live` status (detected via polling), non-hosts are automatically redirected to `/game/:gameId`.

---

### `GamePage`

The main live screen. Split into two panels on desktop; tab-switched on mobile.

**Match header** (full width)
- Competition name and "Live" label.
- Home team name + score + away team name, with a live minute counter.
- Scrollable event feed showing the last 6 match events as pills.

**Left panel — Prediction cards** (desktop: 2/3 width)
- One `PredictionCard` per active event config.
- Below the cards: `SimulatorPanel` (dev tool — fires events manually).

**Right panel — Leaderboard & Picks** (desktop: 1/3 width)
- `Leaderboard` component showing all participants sorted by score.
- "Everyone's picks" section: per-participant breakdown of current picks for each event type.

**Mobile**
- Tab switcher between "Predictions" and "Leaderboard" panels.

**Navigation**
- When game transitions to `finished`, automatically redirects to `/results/:gameId`.

---

### `ResultsPage`

Post-game summary.

- Full-time scoreline.
- Winner banner (name + total points).
- "Your result" card (position medal + points + correct prediction count).
- Full final standings table (sorted by score).
- Match events recap: each event with who triggered it, which participants got it right, and how many points were awarded.
- "Play Again" button → navigates to `/`.

---

### `JoinPage`

Handles direct links shared by the host (`/#/join/:gameId`).

- On mount, checks if the game exists and is in `lobby` status.
- If not found or already started: shows an error state with a "Go Home" button.
- If valid: shows a name-entry form. On submit: calls `joinGame` → navigates to `/lobby/:gameId`.
