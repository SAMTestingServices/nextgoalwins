using Microsoft.EntityFrameworkCore;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<EventConfig> EventConfigs => Set<EventConfig>();
    public DbSet<Prediction> Predictions => Set<Prediction>();
    public DbSet<MatchEvent> MatchEvents => Set<MatchEvent>();
    public DbSet<PointAward> PointAwards => Set<PointAward>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
