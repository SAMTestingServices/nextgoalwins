namespace NextGoalWins.Core;

public class GameNotFoundException(string gameId)
    : Exception($"Game '{gameId}' was not found.");

public class MatchNotFoundException(Guid matchId)
    : Exception($"Match '{matchId}' was not found.");

public class GameAlreadyStartedException(string gameId)
    : Exception($"Game '{gameId}' has already started and cannot be joined.");

public class GameNotLiveException(string gameId)
    : Exception($"Game '{gameId}' is not live.");

public class NotHostException()
    : Exception("This action requires the caller to be the game host.");

public class PlayerNotInMatchException(Guid playerId)
    : Exception($"Player '{playerId}' is not part of this match.");

public class EventNotActiveException(EventType eventType)
    : Exception($"Event type '{eventType}' is not active in this game.");
