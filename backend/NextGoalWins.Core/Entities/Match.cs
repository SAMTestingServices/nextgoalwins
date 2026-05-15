namespace NextGoalWins.Core.Entities;

public class Match
{
    public Guid Id { get; set; }
    public string Competition { get; set; } = string.Empty;
    public Guid HomeTeamId { get; set; }
    public Guid AwayTeamId { get; set; }
    public DateTime KickoffUtc { get; set; }
    public int HomeScore { get; set; }
    public int AwayScore { get; set; }
    public int Minute { get; set; }
    public MatchStatus Status { get; set; } = MatchStatus.Scheduled;

    public Team HomeTeam { get; set; } = null!;
    public Team AwayTeam { get; set; } = null!;
    public List<Game> Games { get; set; } = [];
}
