namespace NextGoalWins.Core.Entities;

public class Game
{
    public string Id { get; set; } = string.Empty; // 6-char join code
    public Guid MatchId { get; set; }
    public GameStatus Status { get; set; } = GameStatus.Lobby;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public Match Match { get; set; } = null!;
    public List<Participant> Participants { get; set; } = [];
    public List<EventConfig> EventConfigs { get; set; } = [];
    public List<MatchEvent> MatchEvents { get; set; } = [];
}
