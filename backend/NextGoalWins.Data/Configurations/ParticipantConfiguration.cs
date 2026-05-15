using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class ParticipantConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.GameId).HasMaxLength(6).IsRequired();
        builder.Property(p => p.Name).HasMaxLength(100).IsRequired();

        builder.HasMany(p => p.Predictions)
            .WithOne(pr => pr.Participant)
            .HasForeignKey(pr => pr.ParticipantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.PointAwards)
            .WithOne(a => a.Participant)
            .HasForeignKey(a => a.ParticipantId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(p => p.GameId).HasDatabaseName("IX_Participants_GameId");
    }
}
