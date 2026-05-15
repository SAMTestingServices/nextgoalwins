namespace NextGoalWins.Core.Entities;

public class MatchEvent
{
    public Guid Id { get; set; }
    public string GameId { get; set; } = string.Empty;
    public EventType EventType { get; set; }
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty; // denormalised
    public string Team { get; set; } = string.Empty;       // "home" | "away"
    public int Minute { get; set; }
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;

    public Game Game { get; set; } = null!;
    public Player Player { get; set; } = null!;
    public List<PointAward> PointAwards { get; set; } = [];
}
