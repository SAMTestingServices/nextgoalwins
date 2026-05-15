using NextGoalWins.Core.Entities;

namespace NextGoalWins.Core.Interfaces;

public interface IGameRepository
{
    Task<Game?> GetByIdAsync(string gameId, CancellationToken ct = default);
    Task<Game> CreateAsync(Game game, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task<bool> IdExistsAsync(string gameId, CancellationToken ct = default);
}
