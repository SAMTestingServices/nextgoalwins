import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Users, Crown, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';

export function LobbyPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { game, currentUserId, loadGame, startGame } = useGame();

  useEffect(() => {
    if (gameId) loadGame(gameId);
  }, [gameId, loadGame]);

  // Navigate when game starts (triggered by host API call or SignalR GameStarted event)
  useEffect(() => {
    if (game?.status === 'live') {
      navigate(`/game/${game.id}`);
    }
  }, [game, navigate]);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  const currentParticipant = game.participants.find((p) => p.id === currentUserId);
  const isHost = currentParticipant?.isHost ?? false;
  const shareUrl = `${window.location.origin}/#/join/${game.id}`;

  function copyCode() {
    navigator.clipboard.writeText(game!.id).catch(() => {});
  }

  async function handleStart() {
    await startGame();
    // Navigation is handled by the useEffect watching game.status
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-white text-3xl font-extrabold mb-1">Lobby</h1>
          <p className="text-gray-400 text-sm">
            {game.match.homeTeam.name} vs {game.match.awayTeam.name}
          </p>
        </div>

        {/* Share code */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Game Code</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-white text-5xl font-mono font-extrabold tracking-widest">
              {game.id}
            </span>
            <button
              onClick={copyCode}
              className="text-gray-400 hover:text-green-400 transition-colors"
              title="Copy code"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-500 text-xs">
            Share this code — friends can join at{' '}
            <span className="text-gray-300 font-mono">{shareUrl}</span>
          </p>
        </div>

        {/* Participants */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">
            <Users className="w-4 h-4" />
            Players ({game.participants.length})
          </div>
          <div className="space-y-3">
            {game.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium flex-1">{p.name}</span>
                {p.id === currentUserId && <span className="text-xs text-green-400 font-medium">You</span>}
                {p.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Event summary */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Active Events</div>
          <div className="flex flex-wrap gap-2">
            {game.eventConfigs.map((e) => (
              <div key={e.type} className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-3 py-1.5 text-sm">
                <span>{e.icon}</span>
                <span className="text-gray-300">{e.label}</span>
                <span className="text-green-400 font-bold">{e.points}pts</span>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={game.participants.length < 1}
            className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
          >
            Start Game
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-400 py-4">
            <Clock className="w-5 h-5 animate-pulse" />
            <span>Waiting for host to start the game…</span>
          </div>
        )}
      </div>
    </div>
  );
}
