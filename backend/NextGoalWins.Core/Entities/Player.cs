namespace NextGoalWins.Core.Entities;

public class Player
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
    public PlayerPosition Position { get; set; }

    public Team Team { get; set; } = null!;
}
