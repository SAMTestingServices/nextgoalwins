import { Trophy, Medal } from 'lucide-react';
import type { Participant } from '../types';

interface LeaderboardProps {
  participants: Participant[];
  currentUserId: string | null;
}

export function Leaderboard({ participants, currentUserId }: LeaderboardProps) {
  const sorted = [...participants].sort((a, b) => b.score - a.score);

  const medals: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-800">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-white font-semibold text-sm">Leaderboard</span>
      </div>
      <div className="divide-y divide-gray-800">
        {sorted.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              p.id === currentUserId ? 'bg-green-500/5' : ''
            }`}
          >
            <div className="w-6 text-center text-sm font-bold">
              {medals[i] ?? <span className="text-gray-500">{i + 1}</span>}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 text-sm font-bold">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-medium text-sm truncate ${
                    p.id === currentUserId ? 'text-green-400' : 'text-white'
                  }`}
                >
                  {p.name}
                </span>
                {p.id === currentUserId && (
                  <span className="text-xs text-gray-500">(you)</span>
                )}
              </div>
              <div className="text-gray-500 text-xs">
                {p.correctPredictions} correct
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{p.score}</div>
              <div className="text-gray-500 text-xs">pts</div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">
            <Medal className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No players yet
          </div>
        )}
      </div>
    </div>
  );
}
