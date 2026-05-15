using NextGoalWins.Core.Models;

namespace NextGoalWins.Core.Interfaces;

public interface IGameHubNotifier
{
    Task ParticipantJoined(string gameId, ParticipantDto participant, CancellationToken ct = default);
    Task GameStarted(string gameId, CancellationToken ct = default);
    Task PredictionUpdated(string gameId, PredictionUpdatedPayload payload, CancellationToken ct = default);
    Task EventFired(string gameId, EventFiredPayload payload, CancellationToken ct = default);
    Task ClockAdvanced(string gameId, int minute, CancellationToken ct = default);
    Task GameEnded(string gameId, IEnumerable<ParticipantDto> finalStandings, CancellationToken ct = default);
}
