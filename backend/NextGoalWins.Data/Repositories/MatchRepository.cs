using Microsoft.EntityFrameworkCore;
using NextGoalWins.Core;
using NextGoalWins.Core.Entities;
using NextGoalWins.Core.Interfaces;

namespace NextGoalWins.Data.Repositories;

public class MatchRepository(AppDbContext db) : IMatchRepository
{
    public async Task<IEnumerable<Match>> GetAllAsync(CancellationToken ct = default)
    {
        return await db.Matches
            .Include(m => m.HomeTeam).ThenInclude(t => t.Players)
            .Include(m => m.AwayTeam).ThenInclude(t => t.Players)
            .Where(m => m.Status == MatchStatus.Scheduled || m.Status == MatchStatus.Live)
            .OrderBy(m => m.KickoffUtc)
            .ToListAsync(ct);
    }

    public async Task<Match?> GetByIdAsync(Guid matchId, CancellationToken ct = default)
    {
        return await db.Matches
            .Include(m => m.HomeTeam).ThenInclude(t => t.Players)
            .Include(m => m.AwayTeam).ThenInclude(t => t.Players)
            .FirstOrDefaultAsync(m => m.Id == matchId, ct);
    }
}
