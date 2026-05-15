using NextGoalWins.Core.Entities;
using NextGoalWins.Core.Interfaces;

namespace NextGoalWins.Core.Services;

public class MatchService(IMatchRepository matchRepo) : IMatchService
{
    public Task<IEnumerable<Match>> GetAvailableMatchesAsync(CancellationToken ct = default)
        => matchRepo.GetAllAsync(ct);

    public Task<Match?> GetMatchByIdAsync(Guid matchId, CancellationToken ct = default)
        => matchRepo.GetByIdAsync(matchId, ct);
}
