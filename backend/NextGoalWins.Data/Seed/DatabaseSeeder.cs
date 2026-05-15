using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace NextGoalWins.Data.Seed;

public class DatabaseSeeder(AppDbContext db, ILogger<DatabaseSeeder> logger)
{
    public async Task SeedAsync(CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);

        if (await db.Teams.AnyAsync(ct))
        {
            logger.LogInformation("Database already seeded, skipping.");
            return;
        }

        logger.LogInformation("Seeding database...");

        await db.Teams.AddRangeAsync(SeedData.Teams(), ct);
        await db.SaveChangesAsync(ct);

        await db.Players.AddRangeAsync(SeedData.Players(), ct);
        await db.SaveChangesAsync(ct);

        await db.Matches.AddRangeAsync(SeedData.Matches(), ct);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Database seeded successfully.");
    }
}
