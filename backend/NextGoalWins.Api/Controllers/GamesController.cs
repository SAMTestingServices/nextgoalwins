using Microsoft.AspNetCore.Mvc;
using NextGoalWins.Api.Mapping;
using NextGoalWins.Api.Middleware;
using NextGoalWins.Core;
using NextGoalWins.Core.Entities;
using NextGoalWins.Core.Interfaces;

namespace NextGoalWins.Api.Controllers;

[ApiController]
[Route("api/games")]
public class GamesController(IGameService gameService) : ControllerBase
{
    private Participant? CurrentParticipant =>
        HttpContext.Items[ParticipantTokenMiddleware.ParticipantKey] as Participant;

    // POST /api/games
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGameBody body, CancellationToken ct)
    {
        var request = new CreateGameRequest(
            body.HostName,
            body.MatchId,
            body.EventConfigs.Select(e => new EventConfigRequest(e.Type, e.Label, e.Points, e.Icon)));

        var (game, host) = await gameService.CreateGameAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { gameId = game.Id },
            new { game = game.ToDto(), participantToken = host.Id });
    }

    // GET /api/games/{gameId}
    [HttpGet("{gameId}")]
    public async Task<IActionResult> GetById(string gameId, CancellationToken ct)
    {
        try
        {
            var game = await gameService.GetGameAsync(gameId, ct);
            return Ok(game.ToDto());
        }
        catch (GameNotFoundException)
        {
            return NotFound(Error("GameNotFound", $"Game '{gameId}' not found."));
        }
    }

    // POST /api/games/{gameId}/join
    [HttpPost("{gameId}/join")]
    public async Task<IActionResult> Join(string gameId, [FromBody] JoinGameBody body, CancellationToken ct)
    {
        try
        {
            var (game, participant) = await gameService.JoinGameAsync(gameId, body.PlayerName, ct);
            return Ok(new { game = game.ToDto(), participantToken = participant.Id });
        }
        catch (GameNotFoundException)
        {
            return NotFound(Error("GameNotFound", $"Game '{gameId}' not found."));
        }
        catch (GameAlreadyStartedException)
        {
            return Conflict(Error("GameAlreadyStarted", "This game has already started and cannot be joined."));
        }
    }

    // POST /api/games/{gameId}/start
    [HttpPost("{gameId}/start")]
    public async Task<IActionResult> Start(string gameId, CancellationToken ct)
    {
        var participant = RequireToken();
        if (participant is null) return Unauthorized(Error("MissingToken", "X-Participant-Token header is required."));

        try
        {
            var game = await gameService.StartGameAsync(gameId, participant.Id, ct);
            return Ok(game.ToDto());
        }
        catch (GameNotFoundException)
        {
            return NotFound(Error("GameNotFound", $"Game '{gameId}' not found."));
        }
        catch (NotHostException)
        {
            return Forbid();
        }
        catch (GameAlreadyStartedException)
        {
            return Conflict(Error("GameAlreadyStarted", "Game is not in lobby status."));
        }
    }

    // PUT /api/games/{gameId}/predictions/{eventType}
    [HttpPut("{gameId}/predictions/{eventType}")]
    public async Task<IActionResult> UpdatePrediction(
        string gameId, string eventType, [FromBody] UpdatePredictionBody body, CancellationToken ct)
    {
        var participant = RequireToken();
        if (participant is null) return Unauthorized(Error("MissingToken", "X-Participant-Token header is required."));

        if (!Enum.TryParse<EventType>(eventType, ignoreCase: true, out var parsedType))
            return BadRequest(Error("InvalidEventType", $"Unknown event type '{eventType}'."));

        try
        {
            var prediction = await gameService.UpdatePredictionAsync(gameId, participant.Id, parsedType, body.PlayerId, ct);
            return Ok(new { eventType = parsedType.ToString().ToLowerInvariant(), playerId = prediction.PlayerId });
        }
        catch (GameNotFoundException)
        {
            return NotFound(Error("GameNotFound", $"Game '{gameId}' not found."));
        }
        catch (GameNotLiveException)
        {
            return Conflict(Error("GameNotLive", "Predictions can only be updated while the game is live."));
        }
        catch (PlayerNotInMatchException ex)
        {
            return BadRequest(Error("PlayerNotInMatch", ex.Message));
        }
        catch (EventNotActiveException ex)
        {
            return BadRequest(Error("EventNotActive", ex.Message));
        }
    }

    // POST /api/games/{gameId}/events
    [HttpPost("{gameId}/events")]
    public async Task<IActionResult> FireEvent(string gameId, [FromBody] FireEventBody body, CancellationToken ct)
    {
        var participant = RequireToken();
        if (participant is null) return Unauthorized(Error("MissingToken", "X-Participant-Token header is required."));

        try
        {
            var request = new FireEventRequest(body.Type, body.PlayerId, body.Minute);
            var (matchEvent, awards) = await gameService.FireEventAsync(gameId, participant.Id, request, ct);

            var awardDtos = awards.Select(a => new
            {
                participantId = a.ParticipantId,
                points = a.Points,
            });

            return Ok(new { @event = matchEvent.ToDto(), pointsAwarded = awardDtos });
        }
        catch (GameNotFoundException)
        {
            return NotFound(Error("GameNotFound", $"Game '{gameId}' not found."));
        }
        catch (NotHostException)
        {
            return Forbid();
        }
        catch (GameNotLiveException)
        {
            return Conflict(Error("GameNotLive", "Events can only be fired while the game is live."));
        }
        catch (PlayerNotInMatchException ex)
        {
            return BadRequest(Error("PlayerNotInMatch", ex.Message));
        }
        catch (EventNotActiveException ex)
        {
            return BadRequest(Error("EventNotActive", ex.Message));
        }
    }

    // PATCH /api/games/{gameId}/clock
    [HttpPatch("{gameId}/clock")]
    public async Task<IActionResult> AdvanceClock(string gameId, [FromBody] AdvanceClockBody body, CancellationToken ct)
    {
        var participant = RequireToken();
        if (participant is null) return Unauthorized(Error("MissingToken", "X-Participant-Token header is required."));

        try
        {
            var match = await gameService.AdvanceClockAsync(gameId, participant.Id, body.Minute, ct);
            return Ok(new { minute = match.Minute });
        }
        catch (GameNotFoundException)
        {
            return NotFound(Error("GameNotFound", $"Game '{gameId}' not found."));
        }
        catch (NotHostException)
        {
            return Forbid();
        }
    }

    // POST /api/games/{gameId}/end
    [HttpPost("{gameId}/end")]
    public async Task<IActionResult> EndGame(string gameId, CancellationToken ct)
    {
        var participant = RequireToken();
        if (participant is null) return Unauthorized(Error("MissingToken", "X-Participant-Token header is required."));

        try
        {
            var game = await gameService.EndGameAsync(gameId, participant.Id, ct);
            return Ok(game.ToDto());
        }
        catch (GameNotFoundException)
        {
            return NotFound(Error("GameNotFound", $"Game '{gameId}' not found."));
        }
        catch (NotHostException)
        {
            return Forbid();
        }
    }

    private Participant? RequireToken() => CurrentParticipant;

    private static object Error(string code, string message) => new { error = code, message };
}

// Request body records
public record CreateGameBody(string HostName, Guid MatchId, List<EventConfigBody> EventConfigs);
public record EventConfigBody(string Type, string Label, int Points, string Icon);
public record JoinGameBody(string PlayerName);
public record UpdatePredictionBody(Guid PlayerId);
public record FireEventBody(string Type, Guid PlayerId, int Minute);
public record AdvanceClockBody(int Minute);
