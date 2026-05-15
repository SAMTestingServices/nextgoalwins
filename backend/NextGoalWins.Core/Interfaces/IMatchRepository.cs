using NextGoalWins.Core.Entities;

namespace NextGoalWins.Core.Interfaces;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetAllAsync(CancellationToken ct = default);
    Task<Match?> GetByIdAsync(Guid matchId, CancellationToken ct = default);
}
