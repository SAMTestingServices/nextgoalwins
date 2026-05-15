import type { Game, Match, EventConfig, EventType, MatchEvent, Participant } from '../types';
import { MOCK_MATCHES, DEFAULT_EVENT_CONFIGS } from '../data/mockData';

const STORAGE_KEY = 'ngw_games';

function loadGames(): Record<string, Game> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveGames(games: Record<string, Game>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const mockBackend = {
  getAvailableMatches(): Match[] {
    return MOCK_MATCHES;
  },

  createGame(
    hostName: string,
    matchId: string,
    eventConfigs: EventConfig[]
  ): Game {
    const games = loadGames();
    const match = MOCK_MATCHES.find((m) => m.id === matchId);
    if (!match) throw new Error('Match not found');

    const hostId = generateId();
    const gameId = generateId();

    const host: Participant = {
      id: hostId,
      name: hostName,
      isHost: true,
      predictions: {},
      score: 0,
      correctPredictions: 0,
    };

    const game: Game = {
      id: gameId,
      match: { ...match },
      participants: [host],
      events: [],
      eventConfigs: eventConfigs.filter((e) => e.active),
      status: 'lobby',
      createdAt: Date.now(),
    };

    games[gameId] = game;
    saveGames(games);

    sessionStorage.setItem('ngw_user_id', hostId);
    sessionStorage.setItem('ngw_game_id', gameId);

    return game;
  },

  joinGame(gameId: string, playerName: string): Game {
    const games = loadGames();
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    if (game.status !== 'lobby') throw new Error('Game already started');

    const playerId = generateId();
    const participant: Participant = {
      id: playerId,
      name: playerName,
      isHost: false,
      predictions: {},
      score: 0,
      correctPredictions: 0,
    };

    game.participants.push(participant);
    saveGames(games);

    sessionStorage.setItem('ngw_user_id', playerId);
    sessionStorage.setItem('ngw_game_id', gameId);

    return game;
  },

  getGame(gameId: string): Game | null {
    const games = loadGames();
    return games[gameId] ?? null;
  },

  startGame(gameId: string): Game {
    const games = loadGames();
    const game = games[gameId];
    if (!game) throw new Error('Game not found');

    game.status = 'live';
    game.match.status = 'live';
    saveGames(games);
    return game;
  },

  updatePrediction(
    gameId: string,
    participantId: string,
    eventType: EventType,
    playerId: string
  ): Game {
    const games = loadGames();
    const game = games[gameId];
    if (!game) throw new Error('Game not found');

    const participant = game.participants.find((p) => p.id === participantId);
    if (!participant) throw new Error('Participant not found');

    participant.predictions[eventType] = playerId;
    saveGames(games);
    return game;
  },

  fireEvent(gameId: string, eventType: EventType, playerId: string, minute: number): Game {
    const games = loadGames();
    const game = games[gameId];
    if (!game) throw new Error('Game not found');

    const allPlayers = [
      ...game.match.homeTeam.players,
      ...game.match.awayTeam.players,
    ];
    const player = allPlayers.find((p) => p.id === playerId);
    if (!player) throw new Error('Player not found');

    const eventConfig = game.eventConfigs.find((e) => e.type === eventType);
    if (!eventConfig) throw new Error('Event not configured');

    const event: MatchEvent = {
      id: generateId(),
      type: eventType,
      playerId,
      playerName: player.name,
      team: player.team,
      minute,
      timestamp: Date.now(),
    };
    game.events.push(event);

    // Award points
    for (const participant of game.participants) {
      if (participant.predictions[eventType] === playerId) {
        participant.score += eventConfig.points;
        participant.correctPredictions += 1;
      }
    }

    // Update score if goal
    if (eventType === 'goal') {
      if (player.team === 'home') game.match.score.home += 1;
      else game.match.score.away += 1;
    }

    game.match.minute = minute;
    saveGames(games);
    return game;
  },

  advanceClock(gameId: string, minute: number): Game {
    const games = loadGames();
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    game.match.minute = minute;
    saveGames(games);
    return game;
  },

  endGame(gameId: string): Game {
    const games = loadGames();
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    game.status = 'finished';
    game.match.status = 'finished';
    saveGames(games);
    return game;
  },

  getCurrentUser(): { userId: string | null; gameId: string | null } {
    return {
      userId: sessionStorage.getItem('ngw_user_id'),
      gameId: sessionStorage.getItem('ngw_game_id'),
    };
  },

  getDefaultEventConfigs(): EventConfig[] {
    return DEFAULT_EVENT_CONFIGS.map((e) => ({ ...e }));
  },
};
