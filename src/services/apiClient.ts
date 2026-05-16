import type { Game, Match, Team, Player, Participant, MatchEvent, EventConfig, EventType } from '../types';
import { API_URL } from '../config';
import { DEFAULT_EVENT_CONFIGS } from '../data/mockData';

const TOKEN_KEY = 'ngw_participant_token';
const GAME_KEY = 'ngw_game_id';

// C# enum YellowCard → "yellowcard" after toLower; frontend uses "yellow_card"
export function apiToEventType(s: string): EventType {
  if (s === 'yellowcard') return 'yellow_card';
  if (s === 'redcard') return 'red_card';
  return s as EventType;
}

function eventTypeToApi(t: EventType): string {
  if (t === 'yellow_card') return 'yellowcard';
  if (t === 'red_card') return 'redcard';
  return t;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['X-Participant-Token'] = token;
  Object.assign(headers, (options.headers as Record<string, string>) ?? {});

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function mapPlayer(p: any): Player {
  return { id: p.id, name: p.name, number: p.number, team: p.team, position: p.position };
}

function mapTeam(t: any): Team {
  return {
    id: t.id, name: t.name, shortName: t.shortName,
    primaryColor: t.primaryColor, secondaryColor: t.secondaryColor,
    players: (t.players ?? []).map(mapPlayer),
  };
}

function mapMatch(m: any): Match {
  return {
    id: m.id, competition: m.competition,
    homeTeam: mapTeam(m.homeTeam), awayTeam: mapTeam(m.awayTeam),
    kickoff: m.kickoff,
    score: { home: m.score.home, away: m.score.away },
    minute: m.minute,
    status: m.status as Match['status'],
  };
}

export function mapParticipant(p: any): Participant {
  const predictions: Partial<Record<EventType, string>> = {};
  for (const [key, value] of Object.entries(p.predictions ?? {})) {
    if (value) predictions[apiToEventType(key)] = value as string;
  }
  return { id: p.id, name: p.name, isHost: p.isHost, predictions, score: p.score, correctPredictions: p.correctPredictions };
}

export function mapEvent(e: any): MatchEvent {
  return {
    id: e.id, type: apiToEventType(e.type), playerId: e.playerId,
    playerName: e.playerName, team: e.team, minute: e.minute, timestamp: e.timestamp,
  };
}

function mapEventConfig(e: any): EventConfig {
  return { type: apiToEventType(e.type), label: e.label, points: e.points, icon: e.icon, active: true };
}

export function mapGame(g: any): Game {
  return {
    id: g.id,
    match: mapMatch(g.match),
    participants: (g.participants ?? []).map(mapParticipant),
    events: (g.events ?? []).map(mapEvent),
    eventConfigs: (g.eventConfigs ?? []).map(mapEventConfig),
    status: g.status as Game['status'],
    createdAt: g.createdAt,
  };
}

export const apiClient = {
  async getAvailableMatches(): Promise<Match[]> {
    const data = await apiFetch('/api/matches');
    return (data ?? []).map(mapMatch);
  },

  async createGame(hostName: string, matchId: string, eventConfigs: EventConfig[]): Promise<Game> {
    const body = {
      hostName,
      matchId,
      eventConfigs: eventConfigs.filter((e) => e.active).map((e) => ({
        type: eventTypeToApi(e.type), label: e.label, points: e.points, icon: e.icon,
      })),
    };
    const data = await apiFetch('/api/games', { method: 'POST', body: JSON.stringify(body) });
    sessionStorage.setItem(TOKEN_KEY, data.participantToken);
    sessionStorage.setItem(GAME_KEY, data.game.id);
    return mapGame(data.game);
  },

  async joinGame(gameId: string, playerName: string): Promise<Game> {
    const data = await apiFetch(`/api/games/${gameId}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
    sessionStorage.setItem(TOKEN_KEY, data.participantToken);
    sessionStorage.setItem(GAME_KEY, data.game.id);
    return mapGame(data.game);
  },

  async getGame(gameId: string): Promise<Game | null> {
    try {
      return mapGame(await apiFetch(`/api/games/${gameId}`));
    } catch {
      return null;
    }
  },

  async startGame(gameId: string): Promise<Game> {
    return mapGame(await apiFetch(`/api/games/${gameId}/start`, { method: 'POST' }));
  },

  async updatePrediction(_gameId: string, _participantId: string, eventType: EventType, playerId: string): Promise<void> {
    const gameId = sessionStorage.getItem(GAME_KEY)!;
    await apiFetch(`/api/games/${gameId}/predictions/${eventTypeToApi(eventType)}`, {
      method: 'PUT',
      body: JSON.stringify({ playerId }),
    });
  },

  async fireEvent(gameId: string, eventType: EventType, playerId: string, minute: number): Promise<Game> {
    await apiFetch(`/api/games/${gameId}/events`, {
      method: 'POST',
      body: JSON.stringify({ type: eventTypeToApi(eventType), playerId, minute }),
    });
    return mapGame(await apiFetch(`/api/games/${gameId}`));
  },

  async advanceClock(gameId: string, minute: number): Promise<Game> {
    await apiFetch(`/api/games/${gameId}/clock`, { method: 'PATCH', body: JSON.stringify({ minute }) });
    return mapGame(await apiFetch(`/api/games/${gameId}`));
  },

  async endGame(gameId: string): Promise<Game> {
    return mapGame(await apiFetch(`/api/games/${gameId}/end`, { method: 'POST' }));
  },

  getCurrentUser(): { userId: string | null; gameId: string | null } {
    return {
      userId: sessionStorage.getItem(TOKEN_KEY),
      gameId: sessionStorage.getItem(GAME_KEY),
    };
  },

  getDefaultEventConfigs(): EventConfig[] {
    return DEFAULT_EVENT_CONFIGS.map((e) => ({ ...e }));
  },
};
