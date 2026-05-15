using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class PointAwardConfiguration : IEntityTypeConfiguration<PointAward>
{
    public void Configure(EntityTypeBuilder<PointAward> builder)
    {
        builder.HasKey(a => a.Id);

        builder.HasIndex(a => a.MatchEventId).HasDatabaseName("IX_PointAwards_MatchEventId");
        builder.HasIndex(a => a.ParticipantId).HasDatabaseName("IX_PointAwards_ParticipantId");
    }
}
