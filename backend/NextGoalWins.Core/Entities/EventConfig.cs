namespace NextGoalWins.Core.Entities;

public class EventConfig
{
    public Guid Id { get; set; }
    public string GameId { get; set; } = string.Empty;
    public EventType EventType { get; set; }
    public string Label { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Icon { get; set; } = string.Empty;

    public Game Game { get; set; } = null!;
}
