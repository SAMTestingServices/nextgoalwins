using NextGoalWins.Core;
using NextGoalWins.Core.Entities;

namespace NextGoalWins.Data.Seed;

public static class SeedData
{
    public static readonly Guid ArsenalId = new("11111111-0000-0000-0000-000000000001");
    public static readonly Guid ManCityId = new("11111111-0000-0000-0000-000000000002");
    public static readonly Guid LiverpoolId = new("11111111-0000-0000-0000-000000000003");
    public static readonly Guid ChelseaId = new("11111111-0000-0000-0000-000000000004");

    public static readonly Guid Match1Id = new("22222222-0000-0000-0000-000000000001");
    public static readonly Guid Match2Id = new("22222222-0000-0000-0000-000000000002");

    public static IEnumerable<Team> Teams() =>
    [
        new() { Id = ArsenalId, Name = "Arsenal", ShortName = "ARS", PrimaryColor = "#EF0107", SecondaryColor = "#FFFFFF" },
        new() { Id = ManCityId, Name = "Man City", ShortName = "MCI", PrimaryColor = "#6CABDD", SecondaryColor = "#FFFFFF" },
        new() { Id = LiverpoolId, Name = "Liverpool", ShortName = "LIV", PrimaryColor = "#C8102E", SecondaryColor = "#F6EB61" },
        new() { Id = ChelseaId, Name = "Chelsea", ShortName = "CHE", PrimaryColor = "#034694", SecondaryColor = "#FFFFFF" },
    ];

    public static IEnumerable<Player> Players() =>
    [
        // Arsenal
        P(ArsenalId, "David Raya", 22, PlayerPosition.GK),
        P(ArsenalId, "Ben White", 4, PlayerPosition.DEF),
        P(ArsenalId, "William Saliba", 12, PlayerPosition.DEF),
        P(ArsenalId, "Gabriel Magalhães", 6, PlayerPosition.DEF),
        P(ArsenalId, "Kieran Tierney", 3, PlayerPosition.DEF),
        P(ArsenalId, "Thomas Partey", 5, PlayerPosition.MID),
        P(ArsenalId, "Martin Ødegaard", 8, PlayerPosition.MID),
        P(ArsenalId, "Declan Rice", 41, PlayerPosition.MID),
        P(ArsenalId, "Bukayo Saka", 7, PlayerPosition.FWD),
        P(ArsenalId, "Leandro Trossard", 19, PlayerPosition.FWD),
        P(ArsenalId, "Gabriel Martinelli", 11, PlayerPosition.FWD),
        P(ArsenalId, "Kai Havertz", 29, PlayerPosition.FWD),
        // Man City
        P(ManCityId, "Ederson", 31, PlayerPosition.GK),
        P(ManCityId, "Kyle Walker", 2, PlayerPosition.DEF),
        P(ManCityId, "Rúben Dias", 3, PlayerPosition.DEF),
        P(ManCityId, "Manuel Akanji", 25, PlayerPosition.DEF),
        P(ManCityId, "Joško Gvardiol", 24, PlayerPosition.DEF),
        P(ManCityId, "Rodri", 16, PlayerPosition.MID),
        P(ManCityId, "Kevin De Bruyne", 17, PlayerPosition.MID),
        P(ManCityId, "Bernardo Silva", 20, PlayerPosition.MID),
        P(ManCityId, "Phil Foden", 47, PlayerPosition.FWD),
        P(ManCityId, "Erling Haaland", 9, PlayerPosition.FWD),
        P(ManCityId, "Jeremy Doku", 11, PlayerPosition.FWD),
        // Liverpool
        P(LiverpoolId, "Alisson Becker", 1, PlayerPosition.GK),
        P(LiverpoolId, "Trent Alexander-Arnold", 66, PlayerPosition.DEF),
        P(LiverpoolId, "Virgil van Dijk", 4, PlayerPosition.DEF),
        P(LiverpoolId, "Ibrahima Konaté", 5, PlayerPosition.DEF),
        P(LiverpoolId, "Andy Robertson", 26, PlayerPosition.DEF),
        P(LiverpoolId, "Alexis Mac Allister", 10, PlayerPosition.MID),
        P(LiverpoolId, "Dominik Szoboszlai", 8, PlayerPosition.MID),
        P(LiverpoolId, "Curtis Jones", 17, PlayerPosition.MID),
        P(LiverpoolId, "Mohamed Salah", 11, PlayerPosition.FWD),
        P(LiverpoolId, "Darwin Núñez", 9, PlayerPosition.FWD),
        P(LiverpoolId, "Luis Díaz", 7, PlayerPosition.FWD),
        // Chelsea
        P(ChelseaId, "Robert Sánchez", 1, PlayerPosition.GK),
        P(ChelseaId, "Reece James", 24, PlayerPosition.DEF),
        P(ChelseaId, "Thiago Silva", 6, PlayerPosition.DEF),
        P(ChelseaId, "Levi Colwill", 26, PlayerPosition.DEF),
        P(ChelseaId, "Ben Chilwell", 21, PlayerPosition.DEF),
        P(ChelseaId, "Enzo Fernández", 8, PlayerPosition.MID),
        P(ChelseaId, "Moises Caicedo", 25, PlayerPosition.MID),
        P(ChelseaId, "Cole Palmer", 20, PlayerPosition.MID),
        P(ChelseaId, "Raheem Sterling", 17, PlayerPosition.FWD),
        P(ChelseaId, "Nicolas Jackson", 15, PlayerPosition.FWD),
        P(ChelseaId, "Mykhailo Mudryk", 10, PlayerPosition.FWD),
    ];

    public static IEnumerable<Match> Matches() =>
    [
        new()
        {
            Id = Match1Id,
            Competition = "Premier League",
            HomeTeamId = ArsenalId,
            AwayTeamId = ManCityId,
            KickoffUtc = new DateTime(2026, 5, 15, 15, 0, 0, DateTimeKind.Utc),
            Status = MatchStatus.Scheduled,
        },
        new()
        {
            Id = Match2Id,
            Competition = "Premier League",
            HomeTeamId = LiverpoolId,
            AwayTeamId = ChelseaId,
            KickoffUtc = new DateTime(2026, 5, 15, 17, 30, 0, DateTimeKind.Utc),
            Status = MatchStatus.Scheduled,
        },
    ];

    private static Player P(Guid teamId, string name, int number, PlayerPosition pos) => new()
    {
        Id = Guid.NewGuid(),
        TeamId = teamId,
        Name = name,
        Number = number,
        Position = pos,
    };
}
