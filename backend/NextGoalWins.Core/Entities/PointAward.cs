namespace NextGoalWins.Core.Entities;

public class PointAward
{
    public Guid Id { get; set; }
    public Guid MatchEventId { get; set; }
    public Guid ParticipantId { get; set; }
    public int Points { get; set; }
    public DateTime AwardedAtUtc { get; set; } = DateTime.UtcNow;

    public MatchEvent MatchEvent { get; set; } = null!;
    public Participant Participant { get; set; } = null!;
}
