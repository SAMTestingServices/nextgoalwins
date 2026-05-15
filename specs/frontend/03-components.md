# Frontend — Components

---

## `Navbar`

**Location:** `src/components/Navbar.tsx`  
**Used on:** every page (rendered in `App.tsx` above `<Routes>`)

- Shows the NextGoalWins logo and name.
- Logo links back to `/`.
- No navigation items beyond the logo for now.

---

## `PredictionCard`

**Location:** `src/components/PredictionCard.tsx`  
**Used on:** `GamePage`

One card per active event type. Handles a single prediction slot.

### Props

| Prop | Type | Description |
|---|---|---|
| `config` | `EventConfig` | Event type, label, points, icon |
| `players` | `Player[]` | All players from both teams |
| `currentPrediction` | `string \| undefined` | Player ID of the user's current pick |
| `lastEvent` | `MatchEvent \| undefined` | Most recent event of this type |
| `myParticipant` | `Participant \| undefined` | Current user's participant object |
| `onPredict` | `(playerId: string) => void` | Called when user selects a player |
| `isLive` | `boolean` | Whether the game is in live status |

### Behaviour

- Displays the event icon, label, and point value in the header.
- Shows the last event that fired for this type (player name + minute) in a subdued bar.
- Shows a green "+N pts" badge in the header if the user's current pick matched the last event.
- Player picker is a dropdown (collapsed by default) with a team filter (`All / Home / Away`).
- Selected player is highlighted with a green background and checkmark.
- If no pick is set, shows a "Tap to pick a player..." placeholder.
- Footer shows a short note: the player name if picked, or a warning that no pick means no points.
- When `isLive` is false (lobby or finished), the picker is hidden.

---

## `Leaderboard`

**Location:** `src/components/Leaderboard.tsx`  
**Used on:** `GamePage`, could be reused on `ResultsPage`

### Props

| Prop | Type | Description |
|---|---|---|
| `participants` | `Participant[]` | All participants in the game |
| `currentUserId` | `string \| null` | Current user's participant ID |

### Behaviour

- Sorts participants by score descending.
- Shows position medal (🥇🥈🥉) for top 3, number for the rest.
- Highlights the current user's row with a green tint and "(you)" label.
- Shows correct prediction count below the name.

---

## `SimulatorPanel`

**Location:** `src/components/SimulatorPanel.tsx`  
**Used on:** `GamePage` (dev/demo purposes only)

A yellow-bordered panel that lets a tester simulate match events without a real backend.

### Props

| Prop | Type | Description |
|---|---|---|
| `eventConfigs` | `EventConfig[]` | Active event types (populates event dropdown) |
| `players` | `Player[]` | All players (populates player dropdown) |
| `currentMinute` | `number` | Current match minute |
| `onFireEvent` | `(type, playerId, minute) => void` | Fire a specific event |
| `onAdvanceClock` | `(minute: number) => void` | Move the match clock forward |
| `onEndGame` | `() => void` | Trigger end-of-game |

### Behaviour

- **Manual event**: select event type + player + minute → "Fire Event" button.
- **Random event**: picks a random event type and player, increments the minute.
- **End**: calls `onEndGame`.
- **Advance clock**: text input + "Set" button to jump the match minute.
- Will be gated to host-only (or removed) when the real backend takes over event management.

---

## Layout / `App.tsx`

`App.tsx` wraps everything in `HashRouter` → `GameProvider` → `Navbar` + `Routes`. No layout component is needed beyond this; each page manages its own full-screen layout.
