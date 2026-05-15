using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class PredictionConfiguration : IEntityTypeConfiguration<Prediction>
{
    public void Configure(EntityTypeBuilder<Prediction> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.GameId).HasMaxLength(6).IsRequired();
        builder.Property(p => p.EventType).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(p => p.Player)
            .WithMany()
            .HasForeignKey(p => p.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => new { p.ParticipantId, p.EventType })
            .IsUnique()
            .HasDatabaseName("UX_Predictions_ParticipantId_EventType");

        builder.HasIndex(p => p.GameId).HasDatabaseName("IX_Predictions_GameId");
    }
}
