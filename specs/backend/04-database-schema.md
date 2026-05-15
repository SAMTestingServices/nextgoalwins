# Backend — Database Schema

Database: SQL Server  
ORM: Entity Framework Core 9 (code-first, migrations)

---

## Tables

### `Teams`

Stores football clubs. Seeded at startup.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK |
| `Name` | `nvarchar(100)` | NOT NULL |
| `ShortName` | `nvarchar(5)` | NOT NULL |
| `PrimaryColor` | `nvarchar(7)` | NOT NULL — hex e.g. `#EF0107` |
| `SecondaryColor` | `nvarchar(7)` | NOT NULL |

---

### `Players`

Players belonging to a team.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK |
| `TeamId` | `uniqueidentifier` | FK → `Teams.Id` |
| `Name` | `nvarchar(150)` | NOT NULL |
| `Number` | `int` | NOT NULL |
| `Position` | `nvarchar(3)` | NOT NULL — `GK`, `DEF`, `MID`, `FWD` |

**Indexes:** `IX_Players_TeamId`

---

### `Matches`

Available fixtures that games can be based on. Seeded/managed by admin.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK |
| `Competition` | `nvarchar(100)` | NOT NULL |
| `HomeTeamId` | `uniqueidentifier` | FK → `Teams.Id` |
| `AwayTeamId` | `uniqueidentifier` | FK → `Teams.Id` |
| `KickoffUtc` | `datetime2` | NOT NULL |
| `HomeScore` | `int` | NOT NULL, default 0 |
| `AwayScore` | `int` | NOT NULL, default 0 |
| `Minute` | `int` | NOT NULL, default 0 |
| `Status` | `nvarchar(20)` | NOT NULL — `scheduled`, `live`, `halftime`, `finished` |

**Indexes:** `IX_Matches_HomeTeamId`, `IX_Matches_AwayTeamId`

---

### `Games`

A prediction game created by a host, linked to a match.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `nvarchar(6)` | PK — uppercase alphanumeric join code |
| `MatchId` | `uniqueidentifier` | FK → `Matches.Id` |
| `Status` | `nvarchar(20)` | NOT NULL — `lobby`, `live`, `finished` |
| `CreatedAtUtc` | `datetime2` | NOT NULL, default `GETUTCDATE()` |

---

### `Participants`

Players in a game. The `Id` doubles as the session token.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK — issued on create/join, used as auth token |
| `GameId` | `nvarchar(6)` | FK → `Games.Id` |
| `Name` | `nvarchar(100)` | NOT NULL |
| `IsHost` | `bit` | NOT NULL, default 0 |
| `Score` | `int` | NOT NULL, default 0 |
| `CorrectPredictions` | `int` | NOT NULL, default 0 |
| `JoinedAtUtc` | `datetime2` | NOT NULL, default `GETUTCDATE()` |

**Indexes:** `IX_Participants_GameId`

---

### `EventConfigs`

The event types and point values configured for a specific game.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK |
| `GameId` | `nvarchar(6)` | FK → `Games.Id` |
| `EventType` | `nvarchar(20)` | NOT NULL — `goal`, `yellow_card`, `red_card`, `foul`, `substitution`, `corner`, `penalty` |
| `Label` | `nvarchar(50)` | NOT NULL |
| `Points` | `int` | NOT NULL |
| `Icon` | `nvarchar(10)` | NOT NULL |

**Unique index:** `UX_EventConfigs_GameId_EventType` (one config per event type per game)  
**Indexes:** `IX_EventConfigs_GameId`

---

### `Predictions`

Each participant's current pick per event type. One row per participant per event type — upserted when the player changes their pick.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK |
| `ParticipantId` | `uniqueidentifier` | FK → `Participants.Id` |
| `GameId` | `nvarchar(6)` | FK → `Games.Id` (denormalised for query convenience) |
| `EventType` | `nvarchar(20)` | NOT NULL |
| `PlayerId` | `uniqueidentifier` | FK → `Players.Id` |
| `UpdatedAtUtc` | `datetime2` | NOT NULL |

**Unique index:** `UX_Predictions_ParticipantId_EventType` (one active pick per participant per event type)  
**Indexes:** `IX_Predictions_GameId`, `IX_Predictions_ParticipantId`

---

### `MatchEvents`

Events that have actually occurred in the match (fired by the host).

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK |
| `GameId` | `nvarchar(6)` | FK → `Games.Id` |
| `EventType` | `nvarchar(20)` | NOT NULL |
| `PlayerId` | `uniqueidentifier` | FK → `Players.Id` |
| `PlayerName` | `nvarchar(150)` | NOT NULL — denormalised for display |
| `Team` | `nvarchar(4)` | NOT NULL — `home` or `away` |
| `Minute` | `int` | NOT NULL |
| `OccurredAtUtc` | `datetime2` | NOT NULL, default `GETUTCDATE()` |

**Indexes:** `IX_MatchEvents_GameId`

---

### `PointAwards`

Audit log of points awarded per event. Useful for recaps and dispute resolution.

| Column | Type | Constraints |
|---|---|---|
| `Id` | `uniqueidentifier` | PK |
| `MatchEventId` | `uniqueidentifier` | FK → `MatchEvents.Id` |
| `ParticipantId` | `uniqueidentifier` | FK → `Participants.Id` |
| `Points` | `int` | NOT NULL |
| `AwardedAtUtc` | `datetime2` | NOT NULL, default `GETUTCDATE()` |

**Indexes:** `IX_PointAwards_MatchEventId`, `IX_PointAwards_ParticipantId`

---

## Relationships Summary

```
Teams ──< Players
Teams ──< Matches (homeTeam, awayTeam)
Matches ──< Games
Games ──< Participants
Games ──< EventConfigs
Games ──< MatchEvents
Participants ──< Predictions
Participants ──< PointAwards
MatchEvents ──< PointAwards
Players ──< Predictions
Players ──< MatchEvents
```

---

## Seeding

On first run, the following data is seeded via EF Core's `HasData` or a startup service:

- Teams: Arsenal, Man City, Liverpool, Chelsea (with squad rosters)
- Players: full squad per team
- Matches: at least 2 fixtures linking the seeded teams
