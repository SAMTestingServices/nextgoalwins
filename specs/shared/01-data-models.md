# Shared Data Models

These are the canonical types used by both the frontend (TypeScript) and backend (C#). The backend exposes these as JSON; the frontend consumes them. Both sides must stay in sync.

---

## EventType

Enumeration of supported match events.

```
goal | yellow_card | red_card | foul | substitution | corner | penalty
```

---

## Player

A player on one of the two teams.

| Field | Type | Notes |
|---|---|---|
| id | string / GUID | Unique across the match |
| name | string | Full display name |
| number | int | Shirt number |
| team | `"home"` \| `"away"` | Which side they play for |
| position | `"GK"` \| `"DEF"` \| `"MID"` \| `"FWD"` | Playing position |

---

## Team

| Field | Type | Notes |
|---|---|---|
| id | string / GUID | |
| name | string | Full name e.g. "Arsenal" |
| shortName | string | 3-letter e.g. "ARS" |
| primaryColor | string | Hex colour e.g. `#EF0107` |
| secondaryColor | string | Hex colour |
| players | Player[] | Full squad for this match |

---

## Match

The real football fixture the game is based on.

| Field | Type | Notes |
|---|---|---|
| id | string / GUID | |
| competition | string | e.g. "Premier League" |
| homeTeam | Team | |
| awayTeam | Team | |
| kickoff | string (ISO 8601) | UTC datetime |
| score | `{ home: int, away: int }` | Live score |
| minute | int | Current match minute (0–120) |
| status | `"scheduled"` \| `"live"` \| `"halftime"` \| `"finished"` | |

---

## EventConfig

Configures one prediction event type for a game.

| Field | Type | Notes |
|---|---|---|
| type | EventType | |
| label | string | Display name e.g. "Next Goal" |
| points | int | Points awarded for a correct pick |
| icon | string | Emoji icon e.g. "⚽" |
| active | bool | Whether this event is included in the game |

---

## MatchEvent

A real event that occurred during the match (fires scoring).

| Field | Type | Notes |
|---|---|---|
| id | string / GUID | |
| type | EventType | |
| playerId | string / GUID | Player who performed the event |
| playerName | string | Denormalised for display speed |
| team | `"home"` \| `"away"` | Denormalised |
| minute | int | Match minute |
| timestamp | long (Unix ms) | When the event was recorded |

---

## Participant

A person playing in a game.

| Field | Type | Notes |
|---|---|---|
| id | string / GUID | Assigned on create/join — acts as session token |
| name | string | Display name |
| isHost | bool | Whether this participant created the game |
| predictions | `Record<EventType, playerId>` | Current active pick per event type |
| score | int | Total points accumulated |
| correctPredictions | int | Count of correct picks |

---

## Game

The top-level game object.

| Field | Type | Notes |
|---|---|---|
| id | string (6-char) | Uppercase alphanumeric join code e.g. `"ABC123"` |
| match | Match | |
| participants | Participant[] | All players including host |
| events | MatchEvent[] | All events that have fired so far |
| eventConfigs | EventConfig[] | Active event types and their point values |
| status | `"lobby"` \| `"live"` \| `"finished"` | |
| createdAt | long (Unix ms) | |
