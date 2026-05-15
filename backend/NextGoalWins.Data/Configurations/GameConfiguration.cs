using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasMaxLength(6);
        builder.Property(g => g.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(g => g.Match)
            .WithMany(m => m.Games)
            .HasForeignKey(g => g.MatchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(g => g.Participants)
            .WithOne(p => p.Game)
            .HasForeignKey(p => p.GameId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(g => g.EventConfigs)
            .WithOne(e => e.Game)
            .HasForeignKey(e => e.GameId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(g => g.MatchEvents)
            .WithOne(e => e.Game)
            .HasForeignKey(e => e.GameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
