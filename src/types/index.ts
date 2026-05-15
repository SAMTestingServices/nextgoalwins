export type EventType = 'goal' | 'yellow_card' | 'red_card' | 'foul' | 'substitution' | 'corner' | 'penalty';

export interface Player {
  id: string;
  name: string;
  number: number;
  team: 'home' | 'away';
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  players: Player[];
}

export interface Match {
  id: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoff: string;
  score: { home: number; away: number };
  minute: number;
  status: 'scheduled' | 'live' | 'halftime' | 'finished';
}

export interface EventConfig {
  type: EventType;
  label: string;
  points: number;
  icon: string;
  active: boolean;
}

export interface MatchEvent {
  id: string;
  type: EventType;
  playerId: string;
  playerName: string;
  team: 'home' | 'away';
  minute: number;
  timestamp: number;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  predictions: Partial<Record<EventType, string>>;
  score: number;
  correctPredictions: number;
}

export interface Game {
  id: string;
  match: Match;
  participants: Participant[];
  events: MatchEvent[];
  eventConfigs: EventConfig[];
  status: 'lobby' | 'live' | 'finished';
  createdAt: number;
}
