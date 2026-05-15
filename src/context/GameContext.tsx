import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Game, EventType } from '../types';
import { mockBackend } from '../services/mockBackend';

interface GameContextValue {
  game: Game | null;
  currentUserId: string | null;
  loadGame: (gameId: string) => void;
  refreshGame: () => void;
  updatePrediction: (eventType: EventType, playerId: string) => void;
  fireEvent: (eventType: EventType, playerId: string, minute: number) => void;
  advanceClock: (minute: number) => void;
  endGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    () => sessionStorage.getItem('ngw_user_id')
  );

  const loadGame = useCallback((gameId: string) => {
    const loaded = mockBackend.getGame(gameId);
    setGame(loaded);
    const { userId } = mockBackend.getCurrentUser();
    setCurrentUserId(userId);
  }, []);

  const refreshGame = useCallback(() => {
    if (!game) return;
    const fresh = mockBackend.getGame(game.id);
    if (fresh) setGame(fresh);
  }, [game]);

  const updatePrediction = useCallback(
    (eventType: EventType, playerId: string) => {
      if (!game || !currentUserId) return;
      const updated = mockBackend.updatePrediction(game.id, currentUserId, eventType, playerId);
      setGame({ ...updated });
    },
    [game, currentUserId]
  );

  const fireEvent = useCallback(
    (eventType: EventType, playerId: string, minute: number) => {
      if (!game) return;
      const updated = mockBackend.fireEvent(game.id, eventType, playerId, minute);
      setGame({ ...updated });
    },
    [game]
  );

  const advanceClock = useCallback(
    (minute: number) => {
      if (!game) return;
      const updated = mockBackend.advanceClock(game.id, minute);
      setGame({ ...updated });
    },
    [game]
  );

  const endGame = useCallback(() => {
    if (!game) return;
    const updated = mockBackend.endGame(game.id);
    setGame({ ...updated });
  }, [game]);

  return (
    <GameContext.Provider
      value={{ game, currentUserId, loadGame, refreshGame, updatePrediction, fireEvent, advanceClock, endGame }}
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
