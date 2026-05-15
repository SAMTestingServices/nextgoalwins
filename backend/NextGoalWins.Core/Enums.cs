namespace NextGoalWins.Core;

public enum EventType
{
    Goal,
    YellowCard,
    RedCard,
    Foul,
    Substitution,
    Corner,
    Penalty
}

public enum GameStatus
{
    Lobby,
    Live,
    Finished
}

public enum MatchStatus
{
    Scheduled,
    Live,
    Halftime,
    Finished
}

public enum PlayerPosition
{
    GK,
    DEF,
    MID,
    FWD
}
