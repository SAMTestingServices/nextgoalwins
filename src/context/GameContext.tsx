import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Game, EventType } from '../types';
import { apiClient, mapParticipant, mapEvent, apiToEventType } from '../services/apiClient';
import { getHubConnection, startHub } from '../services/gameHub';

interface GameContextValue {
  game: Game | null;
  currentUserId: string | null;
  loadGame: (gameId: string) => Promise<void>;
  refreshGame: () => Promise<void>;
  startGame: () => Promise<void>;
  updatePrediction: (eventType: EventType, playerId: string) => Promise<void>;
  fireEvent: (eventType: EventType, playerId: string, minute: number) => Promise<void>;
  advanceClock: (minute: number) => Promise<void>;
  endGame: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    () => sessionStorage.getItem('ngw_participant_token')
  );
  const joinedGroupRef = useRef<string | null>(null);

  // Wire up SignalR event handlers for real-time updates from other clients
  useEffect(() => {
    const conn = getHubConnection();

    conn.on('ParticipantJoined', ({ participant }: any) => {
      setGame((g) => {
        if (!g) return g;
        if (g.participants.some((p) => p.id === participant.id)) return g;
        return { ...g, participants: [...g.participants, mapParticipant(participant)] };
      });
    });

    conn.on('GameStarted', () => {
      setGame((g) => (g ? { ...g, status: 'live' } : g));
    });

    conn.on('PredictionUpdated', (payload: any) => {
      const eventType = apiToEventType(payload.eventType);
      setGame((g) => {
        if (!g) return g;
        return {
          ...g,
          participants: g.participants.map((p) =>
            p.id === payload.participantId
              ? { ...p, predictions: { ...p.predictions, [eventType]: payload.playerId } }
              : p
          ),
        };
      });
    });

    conn.on('EventFired', (payload: any) => {
      const newEvent = mapEvent(payload.event);
      setGame((g) => {
        if (!g) return g;
        const updatedParticipants = g.participants.map((p) => {
          const award = (payload.pointsAwarded as any[]).find((a) => a.participantId === p.id);
          if (!award) return p;
          return { ...p, score: p.score + award.points, correctPredictions: p.correctPredictions + 1 };
        });
        return {
          ...g,
          events: [...g.events, newEvent],
          participants: updatedParticipants,
          match: {
            ...g.match,
            score: { home: payload.matchScore.home, away: payload.matchScore.away },
            minute: payload.matchMinute,
          },
        };
      });
    });

    conn.on('ClockAdvanced', ({ minute }: any) => {
      setGame((g) => (g ? { ...g, match: { ...g.match, minute } } : g));
    });

    conn.on('GameEnded', ({ finalStandings }: any) => {
      setGame((g) => {
        if (!g) return g;
        return { ...g, status: 'finished', participants: (finalStandings as any[]).map(mapParticipant) };
      });
    });

    return () => {
      conn.off('ParticipantJoined');
      conn.off('GameStarted');
      conn.off('PredictionUpdated');
      conn.off('EventFired');
      conn.off('ClockAdvanced');
      conn.off('GameEnded');
    };
  }, []);

  const joinHubGroup = useCallback(async (gameId: string) => {
    try {
      const conn = await startHub();
      if (joinedGroupRef.current && joinedGroupRef.current !== gameId) {
        await conn.invoke('LeaveGameGroup', joinedGroupRef.current).catch(() => {});
      }
      if (joinedGroupRef.current !== gameId) {
        await conn.invoke('JoinGameGroup', gameId);
        joinedGroupRef.current = gameId;
      }
    } catch (err) {
      console.warn('SignalR connection failed, real-time updates unavailable:', err);
    }
  }, []);

  const loadGame = useCallback(async (gameId: string) => {
    const loaded = await apiClient.getGame(gameId);
    setGame(loaded);
    const token = sessionStorage.getItem('ngw_participant_token');
    setCurrentUserId(token);
    await joinHubGroup(gameId);
  }, [joinHubGroup]);

  const refreshGame = useCallback(async () => {
    if (!game) return;
    const fresh = await apiClient.getGame(game.id);
    if (fresh) setGame(fresh);
  }, [game]);

  const startGame = useCallback(async () => {
    if (!game) return;
    const updated = await apiClient.startGame(game.id);
    setGame(updated);
  }, [game]);

  const updatePrediction = useCallback(async (eventType: EventType, playerId: string) => {
    if (!game || !currentUserId) return;
    // Optimistic update
    setGame((g) => {
      if (!g) return g;
      return {
        ...g,
        participants: g.participants.map((p) =>
          p.id === currentUserId
            ? { ...p, predictions: { ...p.predictions, [eventType]: playerId } }
            : p
        ),
      };
    });
    try {
      await apiClient.updatePrediction(game.id, currentUserId, eventType, playerId);
    } catch (err) {
      // Roll back optimistic update on failure
      const fresh = await apiClient.getGame(game.id);
      if (fresh) setGame(fresh);
      throw err;
    }
  }, [game, currentUserId]);

  const fireEvent = useCallback(async (eventType: EventType, playerId: string, minute: number) => {
    if (!game) return;
    const updated = await apiClient.fireEvent(game.id, eventType, playerId, minute);
    setGame(updated);
  }, [game]);

  const advanceClock = useCallback(async (minute: number) => {
    if (!game) return;
    const updated = await apiClient.advanceClock(game.id, minute);
    setGame(updated);
  }, [game]);

  const endGame = useCallback(async () => {
    if (!game) return;
    const updated = await apiClient.endGame(game.id);
    setGame(updated);
  }, [game]);

  return (
    <GameContext.Provider
      value={{ game, currentUserId, loadGame, refreshGame, startGame, updatePrediction, fireEvent, advanceClock, endGame }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
