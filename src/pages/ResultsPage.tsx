import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Star, RotateCcw } from 'lucide-react';
import { useGame } from '../context/GameContext';

export function ResultsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { game, currentUserId, loadGame } = useGame();

  useEffect(() => {
    if (gameId) loadGame(gameId);
  }, [gameId, loadGame]);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const sorted = [...game.participants].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const myPosition = sorted.findIndex((p) => p.id === currentUserId) + 1;
  const me = sorted.find((p) => p.id === currentUserId);

  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Final score */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">{game.match.competition} — Full Time</div>
          <div className="flex items-center justify-center gap-8">
            <div className="text-right">
              <div className="text-white font-bold text-lg">{game.match.homeTeam.name}</div>
            </div>
            <div className="text-white text-4xl font-extrabold">
              {game.match.score.home} – {game.match.score.away}
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg">{game.match.awayTeam.name}</div>
            </div>
          </div>
        </div>

        {/* Winner banner */}
        {winner && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 rounded-2xl p-6 text-center">
            <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
            <div className="text-yellow-400 text-xs uppercase tracking-wider font-bold mb-1">Winner</div>
            <div className="text-white text-2xl font-extrabold">{winner.name}</div>
            <div className="text-yellow-300 text-lg font-bold mt-1">{winner.score} points</div>
          </div>
        )}

        {/* My result */}
        {me && (
          <div
            className={`rounded-2xl p-4 border text-center ${
              myPosition === 1
                ? 'bg-yellow-500/10 border-yellow-500/40'
                : 'bg-gray-900 border-gray-800'
            }`}
          >
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your result</div>
            <div className="text-4xl mb-1">{medals[myPosition] ?? `#${myPosition}`}</div>
            <div className="text-white font-bold text-lg">{me.score} points</div>
            <div className="text-gray-400 text-sm">{me.correctPredictions} correct prediction{me.correctPredictions !== 1 ? 's' : ''}</div>
          </div>
        )}

        {/* Full leaderboard */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Final Standings</span>
          </div>
          <div className="divide-y divide-gray-800">
            {sorted.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-4 py-3 ${
                  p.id === currentUserId ? 'bg-green-500/5' : ''
                }`}
              >
                <div className="w-8 text-center text-lg">{medals[i + 1] ?? <span className="text-gray-500 text-sm">{i + 1}</span>}</div>
                <div className="flex-1">
                  <div className={`font-medium ${p.id === currentUserId ? 'text-green-400' : 'text-white'}`}>
                    {p.name} {p.id === currentUserId && <span className="text-xs text-gray-500">(you)</span>}
                  </div>
                  <div className="text-gray-500 text-xs">{p.correctPredictions} correct</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{p.score} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events recap */}
        {game.events.length > 0 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <span className="text-white font-semibold text-sm">Match Events</span>
            </div>
            <div className="divide-y divide-gray-800">
              {[...game.events]
                .sort((a, b) => a.minute - b.minute)
                .map((evt) => {
                  const config = game.eventConfigs.find((c) => c.type === evt.type);
                  const correctPickers = game.participants.filter(
                    (p) => p.predictions[evt.type] === evt.playerId
                  );
                  return (
                    <div key={evt.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-xl">{config?.icon ?? '📋'}</span>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          {evt.playerName}
                          <span className="text-gray-500 text-xs ml-1.5">{evt.minute}'</span>
                        </div>
                        {correctPickers.length > 0 && (
                          <div className="text-green-400 text-xs mt-0.5">
                            ✓ {correctPickers.map((p) => p.name).join(', ')} got {config?.points}pts
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </Link>
      </div>
    </div>
  );
}
