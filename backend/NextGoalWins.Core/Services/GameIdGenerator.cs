using NextGoalWins.Core.Interfaces;

namespace NextGoalWins.Core.Services;

public static class GameIdGenerator
{
    private const string Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous O/0/1/I

    public static async Task<string> GenerateUniqueAsync(IGameRepository repo, CancellationToken ct = default)
    {
        string id;
        do
        {
            id = Generate();
        } while (await repo.IdExistsAsync(id, ct));
        return id;
    }

    private static string Generate()
    {
        var chars = new char[6];
        for (var i = 0; i < 6; i++)
            chars[i] = Chars[Random.Shared.Next(Chars.Length)];
        return new string(chars);
    }
}
