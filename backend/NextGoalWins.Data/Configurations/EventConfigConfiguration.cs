using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Configurations;

public class EventConfigConfiguration : IEntityTypeConfiguration<EventConfig>
{
    public void Configure(EntityTypeBuilder<EventConfig> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.GameId).HasMaxLength(6).IsRequired();
        builder.Property(e => e.EventType).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Label).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Icon).HasMaxLength(10).IsRequired();

        builder.HasIndex(e => new { e.GameId, e.EventType })
            .IsUnique()
            .HasDatabaseName("UX_EventConfigs_GameId_EventType");
    }
}
