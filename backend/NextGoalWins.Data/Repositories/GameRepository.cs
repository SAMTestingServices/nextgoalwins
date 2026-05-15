using Microsoft.EntityFrameworkCore;
using NextGoalWins.Core.Entities;
using NextGoalWins.Core.Interfaces;

namespace NextGoalWins.Data.Repositories;

public class GameRepository(AppDbContext db) : IGameRepository
{
    public async Task<Game?> GetByIdAsync(string gameId, CancellationToken ct = default)
    {
        return await db.Games
            .Include(g => g.Match)
                .ThenInclude(m => m.HomeTeam)
                    .ThenInclude(t => t.Players)
            .Include(g => g.Match)
                .ThenInclude(m => m.AwayTeam)
                    .ThenInclude(t => t.Players)
            .Include(g => g.Participants)
                .ThenInclude(p => p.Predictions)
            .Include(g => g.Participants)
                .ThenInclude(p => p.PointAwards)
            .Include(g => g.EventConfigs)
            .Include(g => g.MatchEvents)
                .ThenInclude(e => e.PointAwards)
            .FirstOrDefaultAsync(g => g.Id == gameId, ct);
    }

    public async Task<Game> CreateAsync(Game game, CancellationToken ct = default)
    {
        db.Games.Add(game);
        await db.SaveChangesAsync(ct);
        return game;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);

    public Task<bool> IdExistsAsync(string gameId, CancellationToken ct = default)
        => db.Games.AnyAsync(g => g.Id == gameId, ct);
}
