import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { EventConfig, Player, MatchEvent, Participant } from '../types';

interface PredictionCardProps {
  config: EventConfig;
  players: Player[];
  currentPrediction: string | undefined;
  lastEvent: MatchEvent | undefined;
  myParticipant: Participant | undefined;
  onPredict: (playerId: string) => void;
  isLive: boolean;
}

export function PredictionCard({
  config,
  players,
  currentPrediction,
  lastEvent,
  myParticipant,
  onPredict,
  isLive,
}: PredictionCardProps) {
  const [open, setOpen] = useState(false);
  const [filterTeam, setFilterTeam] = useState<'all' | 'home' | 'away'>('all');

  const homePlayers = players.filter((p) => p.team === 'home');
  const awayPlayers = players.filter((p) => p.team === 'away');
  const filteredPlayers =
    filterTeam === 'home' ? homePlayers : filterTeam === 'away' ? awayPlayers : players;

  const selectedPlayer = players.find((p) => p.id === currentPrediction);
  const isCorrect =
    lastEvent && currentPrediction && lastEvent.playerId === currentPrediction;

  return (
    <div
      className={`bg-gray-900 rounded-2xl border overflow-hidden transition-all ${
        lastEvent
          ? isCorrect
            ? 'border-green-500'
            : 'border-gray-700'
          : 'border-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className="text-white font-semibold text-sm">{config.label}</div>
            <div className="text-green-400 text-xs font-bold">{config.points} pts</div>
          </div>
        </div>
        {isCorrect && (
          <div className="flex items-center gap-1 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-lg">
            <Check className="w-3 h-3" /> +{config.points}
          </div>
        )}
      </div>

      {/* Last event */}
      {lastEvent && (
        <div className="px-4 py-2 bg-gray-800/50 text-xs text-gray-400 border-b border-gray-800">
          Last: <span className="text-white font-medium">{lastEvent.playerName}</span>{' '}
          <span className="text-gray-500">({lastEvent.minute}')</span>
        </div>
      )}

      {/* Current pick */}
      <div className="p-4">
        {isLive && (
          <>
            <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
              Your pick
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 flex items-center justify-between gap-2 transition-colors"
            >
              {selectedPlayer ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      selectedPlayer.team === 'home'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    #{selectedPlayer.number}
                  </span>
                  <span className="text-white font-medium">{selectedPlayer.name}</span>
                  <span className="text-gray-500 text-xs">{selectedPlayer.position}</span>
                </div>
              ) : (
                <span className="text-gray-500 text-sm">Tap to pick a player...</span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Player picker */}
            {open && (
              <div className="mt-2 bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                {/* Team filter */}
                <div className="flex border-b border-gray-700">
                  {(['all', 'home', 'away'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterTeam(t)}
                      className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                        filterTeam === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t === 'all' ? 'All' : t === 'home' ? 'Home' : 'Away'}
                    </button>
                  ))}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredPlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => {
                        onPredict(player.id);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left ${
                        currentPrediction === player.id ? 'bg-green-500/10' : ''
                      }`}
                    >
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded w-8 text-center ${
                          player.team === 'home'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {player.number}
                      </span>
                      <span className="text-white text-sm flex-1">{player.name}</span>
                      <span className="text-gray-500 text-xs">{player.position}</span>
                      {currentPrediction === player.id && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Others' picks */}
        {myParticipant && (
          <div className="mt-3 text-xs text-gray-500">
            {selectedPlayer
              ? `Locked: ${selectedPlayer.name}`
              : 'No pick yet — you won\'t score points for this event'}
          </div>
        )}
      </div>
    </div>
  );
}
