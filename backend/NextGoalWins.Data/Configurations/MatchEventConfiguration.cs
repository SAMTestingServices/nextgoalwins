using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class MatchEventConfiguration : IEntityTypeConfiguration<MatchEvent>
{
    public void Configure(EntityTypeBuilder<MatchEvent> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.GameId).HasMaxLength(6).IsRequired();
        builder.Property(e => e.EventType).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.PlayerName).HasMaxLength(150).IsRequired();
        builder.Property(e => e.Team).HasMaxLength(4).IsRequired();

        builder.HasOne(e => e.Player)
            .WithMany()
            .HasForeignKey(e => e.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.PointAwards)
            .WithOne(a => a.MatchEvent)
            .HasForeignKey(a => a.MatchEventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.GameId).HasDatabaseName("IX_MatchEvents_GameId");
    }
}
