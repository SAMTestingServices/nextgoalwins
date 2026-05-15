using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class MatchConfiguration : IEntityTypeConfiguration<Match>
{
    public void Configure(EntityTypeBuilder<Match> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Competition).HasMaxLength(100).IsRequired();
        builder.Property(m => m.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(m => m.HomeTeam)
            .WithMany()
            .HasForeignKey(m => m.HomeTeamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.AwayTeam)
            .WithMany()
            .HasForeignKey(m => m.AwayTeamId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => m.HomeTeamId).HasDatabaseName("IX_Matches_HomeTeamId");
        builder.HasIndex(m => m.AwayTeamId).HasDatabaseName("IX_Matches_AwayTeamId");
    }
}
