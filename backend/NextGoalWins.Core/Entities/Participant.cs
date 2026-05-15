namespace NextGoalWins.Core.Entities;

public class Participant
{
    public Guid Id { get; set; } // also serves as the session token
    public string GameId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsHost { get; set; }
    public int Score { get; set; }
    public int CorrectPredictions { get; set; }
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;

    public Game Game { get; set; } = null!;
    public List<Prediction> Predictions { get; set; } = [];
    public List<PointAward> PointAwards { get; set; } = [];
}
