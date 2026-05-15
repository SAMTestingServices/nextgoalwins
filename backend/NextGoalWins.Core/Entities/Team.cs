namespace NextGoalWins.Core.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = string.Empty;
    public string SecondaryColor { get; set; } = string.Empty;

    public List<Player> Players { get; set; } = [];
}
