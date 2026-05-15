using NextGoalWins.Core.Entities;

namespace NextGoalWins.Core.Interfaces;

public interface IMatchService
{
    Task<IEnumerable<Match>> GetAvailableMatchesAsync(CancellationToken ct = default);
    Task<Match?> GetMatchByIdAsync(Guid matchId, CancellationToken ct = default);
}
