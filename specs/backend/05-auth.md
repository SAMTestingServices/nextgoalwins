# Backend — Auth & Sessions

## Approach: Sessionless / Join-by-Code

There are no user accounts or logins. Identity is established at the point of creating or joining a game and lasts for the lifetime of that game session.

---

## How it works

### 1. Creating a game

`POST /api/games` accepts a host name and returns a `participantToken` (a `Guid`) alongside the game object.

```json
{
  "game": { ... },
  "participantToken": "a3f1c2d4-0000-0000-0000-000000000001"
}
```

The client stores this token in `sessionStorage` under `ngw_user_id`.

### 2. Joining a game

`POST /api/games/{gameId}/join` accepts a player name and returns the same `participantToken` shape.

### 3. Authenticated requests

Every subsequent request that acts on a game must include the token in a custom header:

```
X-Participant-Token: a3f1c2d4-0000-0000-0000-000000000001
```

The server uses this to:
- Identify which participant is making the request.
- Verify host-only actions (start, fire event, end game) by checking `Participant.IsHost == true`.

### 4. Session lifetime

Tokens are not time-limited — they persist as long as the game record exists in the database. If the user closes their browser tab, they lose their token and cannot re-authenticate to that game (by design — no persistent accounts). A future enhancement could support a "rejoin" link containing the token in the URL fragment.

---

## Server-side validation

### Middleware / filter: `ParticipantTokenFilter`

Applied to all endpoints that require a token. It:
1. Reads `X-Participant-Token` from the request headers.
2. Looks up the `Participant` by the GUID in the database.
3. Verifies the participant belongs to the game ID in the route (`{gameId}`).
4. Attaches the `Participant` entity to `HttpContext.Items["Participant"]` for downstream use.
5. Returns `401 Unauthorized` if the header is missing or the token is invalid.
6. Returns `403 Forbidden` if the participant doesn't belong to the requested game.

### Host-only check

Endpoints that are host-only (start, fire event, end) check `participant.IsHost` after the filter runs and return `403` if the caller is not the host.

---

## Security considerations

- Tokens are GUIDs — not guessable by brute force.
- No sensitive data is stored against participants (just a display name).
- The game ID (join code) is only 6 characters — games in `lobby` status are the only ones joinable, and they are short-lived. A future rate-limit on `POST /api/games/{gameId}/join` prevents enumeration.
- No HTTPS enforcement is added at the app level during local dev, but production deployment must use HTTPS.

---

## Future upgrade path

If user accounts are added later:
- Replace `X-Participant-Token` with a standard `Authorization: Bearer <jwt>` header.
- Add `POST /api/auth/register` and `POST /api/auth/login` endpoints.
- Participant records gain a `UserId` foreign key.
- The `ParticipantTokenFilter` is replaced by standard JWT Bearer middleware.
- Historical game results become visible across sessions.
