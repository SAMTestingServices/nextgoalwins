using NextGoalWins.Core.Entities;
using NextGoalWins.Core.Models;

namespace NextGoalWins.Core.Interfaces;

public record CreateGameRequest(string HostName, Guid MatchId, IEnumerable<EventConfigRequest> EventConfigs);
public record EventConfigRequest(string Type, string Label, int Points, string Icon);
public record FireEventRequest(string Type, Guid PlayerId, int Minute);

public interface IGameService
{
    Task<(Game Game, Participant Host)> CreateGameAsync(CreateGameRequest request, CancellationToken ct = default);
    Task<(Game Game, Participant NewParticipant)> JoinGameAsync(string gameId, string playerName, CancellationToken ct = default);
    Task<Game> GetGameAsync(string gameId, CancellationToken ct = default);
    Task<Game> StartGameAsync(string gameId, Guid participantId, CancellationToken ct = default);
    Task<Prediction> UpdatePredictionAsync(string gameId, Guid participantId, EventType eventType, Guid playerId, CancellationToken ct = default);
    Task<(MatchEvent Event, IEnumerable<PointAward> Awards)> FireEventAsync(string gameId, Guid participantId, FireEventRequest request, CancellationToken ct = default);
    Task<Entities.Match> AdvanceClockAsync(string gameId, Guid participantId, int minute, CancellationToken ct = default);
    Task<Game> EndGameAsync(string gameId, Guid participantId, CancellationToken ct = default);
}
