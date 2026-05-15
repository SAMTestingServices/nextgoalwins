namespace NextGoalWins.Core.Models;

public record PlayerDto(Guid Id, string Name, int Number, string Team, string Position);

public record TeamDto(Guid Id, string Name, string ShortName, string PrimaryColor, string SecondaryColor, IEnumerable<PlayerDto> Players);

public record MatchDto(
    Guid Id,
    string Competition,
    TeamDto HomeTeam,
    TeamDto AwayTeam,
    DateTime Kickoff,
    ScoreDto Score,
    int Minute,
    string Status);

public record ScoreDto(int Home, int Away);

public record EventConfigDto(string Type, string Label, int Points, string Icon);

public record MatchEventDto(Guid Id, string Type, Guid PlayerId, string PlayerName, string Team, int Minute, long Timestamp);

public record ParticipantDto(
    Guid Id,
    string Name,
    bool IsHost,
    Dictionary<string, Guid?> Predictions,
    int Score,
    int CorrectPredictions);

public record GameDto(
    string Id,
    MatchDto Match,
    IEnumerable<ParticipantDto> Participants,
    IEnumerable<MatchEventDto> Events,
    IEnumerable<EventConfigDto> EventConfigs,
    string Status,
    long CreatedAt);

// SignalR payload types
public record PredictionUpdatedPayload(Guid ParticipantId, string ParticipantName, string EventType, Guid PlayerId, string PlayerName);

public record PointAwardedDto(Guid ParticipantId, string ParticipantName, int Points);

public record EventFiredPayload(
    MatchEventDto Event,
    IEnumerable<PointAwardedDto> PointsAwarded,
    ScoreDto MatchScore,
    int MatchMinute);
