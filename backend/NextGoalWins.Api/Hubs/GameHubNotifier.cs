using Microsoft.AspNetCore.SignalR;
using NextGoalWins.Core.Interfaces;
using NextGoalWins.Core.Models;

namespace NextGoalWins.Api.Hubs;

public class GameHubNotifier(IHubContext<GameHub> hub) : IGameHubNotifier
{
    public Task ParticipantJoined(string gameId, ParticipantDto participant, CancellationToken ct = default)
        => hub.Clients.Group(gameId).SendAsync("ParticipantJoined", new { participant }, cancellationToken: ct);

    public Task GameStarted(string gameId, CancellationToken ct = default)
        => hub.Clients.Group(gameId).SendAsync("GameStarted", new { gameId, startedAt = DateTime.UtcNow }, cancellationToken: ct);

    public Task PredictionUpdated(string gameId, PredictionUpdatedPayload payload, CancellationToken ct = default)
        => hub.Clients.Group(gameId).SendAsync("PredictionUpdated", payload, cancellationToken: ct);

    public Task EventFired(string gameId, EventFiredPayload payload, CancellationToken ct = default)
        => hub.Clients.Group(gameId).SendAsync("EventFired", payload, cancellationToken: ct);

    public Task ClockAdvanced(string gameId, int minute, CancellationToken ct = default)
        => hub.Clients.Group(gameId).SendAsync("ClockAdvanced", new { minute }, cancellationToken: ct);

    public Task GameEnded(string gameId, IEnumerable<ParticipantDto> finalStandings, CancellationToken ct = default)
        => hub.Clients.Group(gameId).SendAsync("GameEnded", new { gameId, finalStandings }, cancellationToken: ct);
}
