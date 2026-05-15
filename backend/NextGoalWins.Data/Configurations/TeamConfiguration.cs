using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(100).IsRequired();
        builder.Property(t => t.ShortName).HasMaxLength(5).IsRequired();
        builder.Property(t => t.PrimaryColor).HasMaxLength(7).IsRequired();
        builder.Property(t => t.SecondaryColor).HasMaxLength(7).IsRequired();

        builder.HasMany(t => t.Players)
            .WithOne(p => p.Team)
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
