using NextGoalWins.Core.Entities;
using NextGoalWins.Core.Interfaces;

namespace NextGoalWins.Core.Services;

public class GameService(
    IGameRepository gameRepo,
    IMatchRepository matchRepo,
    IGameHubNotifier hubNotifier) : IGameService
{
    public async Task<(Game Game, Participant Host)> CreateGameAsync(CreateGameRequest request, CancellationToken ct = default)
    {
        var match = await matchRepo.GetByIdAsync(request.MatchId, ct)
            ?? throw new MatchNotFoundException(request.MatchId);

        var gameId = await GameIdGenerator.GenerateUniqueAsync(gameRepo, ct);

        var host = new Participant
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Name = request.HostName.Trim(),
            IsHost = true,
        };

        var eventConfigs = request.EventConfigs.Select(e => new EventConfig
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            EventType = Enum.Parse<EventType>(e.Type, ignoreCase: true),
            Label = e.Label,
            Points = e.Points,
            Icon = e.Icon,
        }).ToList();

        var game = new Game
        {
            Id = gameId,
            MatchId = match.Id,
            Match = match,
            Participants = [host],
            EventConfigs = eventConfigs,
        };

        await gameRepo.CreateAsync(game, ct);
        return (game, host);
    }

    public async Task<(Game Game, Participant NewParticipant)> JoinGameAsync(string gameId, string playerName, CancellationToken ct = default)
    {
        // Use AsNoTracking so the middleware's already-tracked Participant doesn't
        // confuse the change tracker when includes re-encounter the same entity.
        var game = await gameRepo.GetByIdNoTrackingAsync(gameId, ct)
            ?? throw new GameNotFoundException(gameId);

        if (game.Status != GameStatus.Lobby)
            throw new GameAlreadyStartedException(gameId);

        var participant = new Participant
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Name = playerName.Trim(),
            IsHost = false,
        };

        // Insert directly — only this one entity is in the change tracker.
        await gameRepo.AddParticipantAsync(participant, ct);
        game.Participants.Add(participant); // keep the in-memory game complete for the DTO

        await hubNotifier.ParticipantJoined(gameId, new Models.ParticipantDto(
            participant.Id, participant.Name, participant.IsHost,
            new Dictionary<string, Guid?>(), 0, 0), ct);

        return (game, participant);
    }

    public async Task<Game> GetGameAsync(string gameId, CancellationToken ct = default)
    {
        return await gameRepo.GetByIdAsync(gameId, ct)
            ?? throw new GameNotFoundException(gameId);
    }

    public async Task<Game> StartGameAsync(string gameId, Guid participantId, CancellationToken ct = default)
    {
        var game = await gameRepo.GetByIdAsync(gameId, ct)
            ?? throw new GameNotFoundException(gameId);

        var participant = RequireHost(game, participantId);

        if (game.Status != GameStatus.Lobby)
            throw new GameAlreadyStartedException(gameId);

        game.Status = GameStatus.Live;
        game.Match.Status = MatchStatus.Live;
        await gameRepo.SaveChangesAsync(ct);
        await hubNotifier.GameStarted(gameId, ct);

        return game;
    }

    public async Task<Prediction> UpdatePredictionAsync(
        string gameId, Guid participantId, EventType eventType, Guid playerId, CancellationToken ct = default)
    {
        var game = await gameRepo.GetByIdAsync(gameId, ct)
            ?? throw new GameNotFoundException(gameId);

        if (game.Status != GameStatus.Live)
            throw new GameNotLiveException(gameId);

        if (!game.EventConfigs.Any(e => e.EventType == eventType))
            throw new EventNotActiveException(eventType);

        var allPlayerIds = game.Match.HomeTeam.Players
            .Concat(game.Match.AwayTeam.Players)
            .Select(p => p.Id)
            .ToHashSet();

        if (!allPlayerIds.Contains(playerId))
            throw new PlayerNotInMatchException(playerId);

        var participant = game.Participants.FirstOrDefault(p => p.Id == participantId)
            ?? throw new UnauthorizedAccessException("Participant not found in this game.");

        var existing = participant.Predictions.FirstOrDefault(p => p.EventType == eventType);
        if (existing is not null)
        {
            existing.PlayerId = playerId;
            existing.UpdatedAtUtc = DateTime.UtcNow;
        }
        else
        {
            existing = new Prediction
            {
                Id = Guid.NewGuid(),
                ParticipantId = participantId,
                GameId = gameId,
                EventType = eventType,
                PlayerId = playerId,
            };
            participant.Predictions.Add(existing);
        }

        await gameRepo.SaveChangesAsync(ct);

        var allPlayers = game.Match.HomeTeam.Players.Concat(game.Match.AwayTeam.Players);
        var player = allPlayers.First(p => p.Id == playerId);

        await hubNotifier.PredictionUpdated(gameId, new(
            participantId, participant.Name,
            eventType.ToString(), playerId, player.Name), ct);

        return existing;
    }

    public async Task<(MatchEvent Event, IEnumerable<PointAward> Awards)> FireEventAsync(
        string gameId, Guid participantId, FireEventRequest request, CancellationToken ct = default)
    {
        var game = await gameRepo.GetByIdAsync(gameId, ct)
            ?? throw new GameNotFoundException(gameId);

        RequireHost(game, participantId);

        if (game.Status != GameStatus.Live)
            throw new GameNotLiveException(gameId);

        var eventType = Enum.Parse<EventType>(request.Type, ignoreCase: true);
        var config = game.EventConfigs.FirstOrDefault(e => e.EventType == eventType)
            ?? throw new EventNotActiveException(eventType);

        var allPlayers = game.Match.HomeTeam.Players.Concat(game.Match.AwayTeam.Players).ToList();
        var player = allPlayers.FirstOrDefault(p => p.Id == request.PlayerId)
            ?? throw new PlayerNotInMatchException(request.PlayerId);

        var team = game.Match.HomeTeam.Players.Any(p => p.Id == player.Id) ? "home" : "away";

        var matchEvent = new MatchEvent
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            EventType = eventType,
            PlayerId = player.Id,
            PlayerName = player.Name,
            Team = team,
            Minute = request.Minute,
        };

        game.MatchEvents.Add(matchEvent);

        // Update scoreline if goal
        if (eventType == EventType.Goal)
        {
            if (team == "home") game.Match.HomeScore++;
            else game.Match.AwayScore++;
        }

        game.Match.Minute = request.Minute;

        // Award points to correct predictors
        var awards = new List<PointAward>();
        foreach (var p in game.Participants)
        {
            var prediction = p.Predictions.FirstOrDefault(pr => pr.EventType == eventType);
            if (prediction?.PlayerId == player.Id)
            {
                var award = new PointAward
                {
                    Id = Guid.NewGuid(),
                    MatchEventId = matchEvent.Id,
                    ParticipantId = p.Id,
                    Points = config.Points,
                };
                matchEvent.PointAwards.Add(award);
                p.Score += config.Points;
                p.CorrectPredictions++;
                awards.Add(award);
            }
        }

        await gameRepo.SaveChangesAsync(ct);

        var pointsAwarded = awards.Select(a =>
        {
            var participant = game.Participants.First(p => p.Id == a.ParticipantId);
            return new Models.PointAwardedDto(a.ParticipantId, participant.Name, a.Points);
        });

        await hubNotifier.EventFired(gameId, new(
            new(matchEvent.Id, eventType.ToString(), player.Id, player.Name, team, request.Minute,
                DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()),
            pointsAwarded,
            new(game.Match.HomeScore, game.Match.AwayScore),
            request.Minute), ct);

        return (matchEvent, awards);
    }

    public async Task<Entities.Match> AdvanceClockAsync(string gameId, Guid participantId, int minute, CancellationToken ct = default)
    {
        var game = await gameRepo.GetByIdAsync(gameId, ct)
            ?? throw new GameNotFoundException(gameId);

        RequireHost(game, participantId);

        game.Match.Minute = minute;
        await gameRepo.SaveChangesAsync(ct);
        await hubNotifier.ClockAdvanced(gameId, minute, ct);

        return game.Match;
    }

    public async Task<Game> EndGameAsync(string gameId, Guid participantId, CancellationToken ct = default)
    {
        var game = await gameRepo.GetByIdAsync(gameId, ct)
            ?? throw new GameNotFoundException(gameId);

        RequireHost(game, participantId);

        game.Status = GameStatus.Finished;
        game.Match.Status = MatchStatus.Finished;
        await gameRepo.SaveChangesAsync(ct);

        var standings = game.Participants
            .OrderByDescending(p => p.Score)
            .Select(p => new Models.ParticipantDto(
                p.Id, p.Name, p.IsHost,
                p.Predictions.ToDictionary(pr => pr.EventType.ToString(), pr => (Guid?)pr.PlayerId),
                p.Score, p.CorrectPredictions));

        await hubNotifier.GameEnded(gameId, standings, ct);

        return game;
    }

    private static Participant RequireHost(Game game, Guid participantId)
    {
        var participant = game.Participants.FirstOrDefault(p => p.Id == participantId)
            ?? throw new UnauthorizedAccessException("Participant not found in this game.");

        if (!participant.IsHost)
            throw new NotHostException();

        return participant;
    }
}
