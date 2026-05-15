namespace NextGoalWins.Core.Entities;

public class Prediction
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public string GameId { get; set; } = string.Empty;
    public EventType EventType { get; set; }
    public Guid PlayerId { get; set; }
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public Participant Participant { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
