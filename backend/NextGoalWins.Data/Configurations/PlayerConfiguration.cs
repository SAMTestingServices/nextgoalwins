using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class PlayerConfiguration : IEntityTypeConfiguration<Player>
{
    public void Configure(EntityTypeBuilder<Player> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(150).IsRequired();
        builder.Property(p => p.Position).HasConversion<string>().HasMaxLength(3);

        builder.HasIndex(p => p.TeamId).HasDatabaseName("IX_Players_TeamId");
    }
}
