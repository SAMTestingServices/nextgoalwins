using NextGoalWins.Core.Entities;
using NextGoalWins.Core.Models;

namespace NextGoalWins.Api.Mapping;

public static class GameMapper
{
    public static PlayerDto ToDto(this Player p, string team) =>
        new(p.Id, p.Name, p.Number, team, p.Position.ToString());

    public static TeamDto ToDto(this Team t, string side) =>
        new(t.Id, t.Name, t.ShortName, t.PrimaryColor, t.SecondaryColor,
            t.Players.Select(p => p.ToDto(side)));

    public static MatchDto ToDto(this Match m) =>
        new(m.Id, m.Competition,
            m.HomeTeam.ToDto("home"),
            m.AwayTeam.ToDto("away"),
            m.KickoffUtc,
            new(m.HomeScore, m.AwayScore),
            m.Minute,
            m.Status.ToString().ToLowerInvariant());

    public static ParticipantDto ToDto(this Participant p) =>
        new(p.Id, p.Name, p.IsHost,
            p.Predictions.ToDictionary(
                pr => pr.EventType.ToString().ToLowerInvariant(),
                pr => (Guid?)pr.PlayerId),
            p.Score, p.CorrectPredictions);

    public static MatchEventDto ToDto(this MatchEvent e) =>
        new(e.Id, e.EventType.ToString().ToLowerInvariant(), e.PlayerId, e.PlayerName,
            e.Team, e.Minute, new DateTimeOffset(e.OccurredAtUtc).ToUnixTimeMilliseconds());

    public static EventConfigDto ToDto(this EventConfig e) =>
        new(e.EventType.ToString().ToLowerInvariant(), e.Label, e.Points, e.Icon);

    public static GameDto ToDto(this Game g) =>
        new(g.Id,
            g.Match.ToDto(),
            g.Participants.Select(p => p.ToDto()),
            g.MatchEvents.Select(e => e.ToDto()),
            g.EventConfigs.Select(e => e.ToDto()),
            g.Status.ToString().ToLowerInvariant(),
            new DateTimeOffset(g.CreatedAtUtc).ToUnixTimeMilliseconds());
}
