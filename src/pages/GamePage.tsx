import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { PredictionCard } from '../components/PredictionCard';
import { Leaderboard } from '../components/Leaderboard';
import { SimulatorPanel } from '../components/SimulatorPanel';
import { Clock, LayoutList, Trophy } from 'lucide-react';
import type { EventType } from '../types';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { game, currentUserId, loadGame, updatePrediction, fireEvent, advanceClock, endGame } = useGame();
  const [mobileTab, setMobileTab] = useState<'predictions' | 'leaderboard'>('predictions');

  useEffect(() => {
    if (gameId) loadGame(gameId);
  }, [gameId, loadGame]);

  useEffect(() => {
    if (game?.status === 'finished') {
      navigate(`/results/${game.id}`);
    }
  }, [game, navigate]);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const allPlayers = [...game.match.homeTeam.players, ...game.match.awayTeam.players];
  const myParticipant = game.participants.find((p) => p.id === currentUserId);

  function lastEventForType(type: EventType) {
    return [...game!.events]
      .filter((e) => e.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Match header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
            {game.match.competition} — Live
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-right flex-1">
              <div className="text-white font-bold text-lg">{game.match.homeTeam.name}</div>
              <div className="text-gray-400 text-xs">{game.match.homeTeam.shortName}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-white text-3xl font-extrabold tracking-tight">
                {game.match.score.home} – {game.match.score.away}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-red-400 animate-pulse" />
                <span className="text-red-400 text-xs font-bold">{game.match.minute}'</span>
              </div>
            </div>
            <div className="text-left flex-1">
              <div className="text-white font-bold text-lg">{game.match.awayTeam.name}</div>
              <div className="text-gray-400 text-xs">{game.match.awayTeam.shortName}</div>
            </div>
          </div>

          {/* Event feed */}
          {game.events.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 justify-center">
              {[...game.events]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 6)
                .map((evt) => {
                  const config = game.eventConfigs.find((c) => c.type === evt.type);
                  return (
                    <div
                      key={evt.id}
                      className="flex-shrink-0 flex items-center gap-1.5 bg-gray-800 rounded-lg px-3 py-1.5 text-xs"
                    >
                      <span>{config?.icon ?? '📋'}</span>
                      <span className="text-white font-medium">{evt.playerName}</span>
                      <span className="text-gray-500">{evt.minute}'</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile tab switcher */}
      <div className="flex lg:hidden border-b border-gray-800 bg-gray-900">
        <button
          onClick={() => setMobileTab('predictions')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
            mobileTab === 'predictions' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'
          }`}
        >
          <LayoutList className="w-4 h-4" /> Predictions
        </button>
        <button
          onClick={() => setMobileTab('leaderboard')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
            mobileTab === 'leaderboard' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'
          }`}
        >
          <Trophy className="w-4 h-4" /> Leaderboard
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Prediction cards */}
          <div className={`lg:col-span-2 space-y-4 ${mobileTab !== 'predictions' ? 'hidden lg:block' : ''}`}>
            {game.eventConfigs.map((config) => (
              <PredictionCard
                key={config.type}
                config={config}
                players={allPlayers}
                currentPrediction={myParticipant?.predictions[config.type]}
                lastEvent={lastEventForType(config.type)}
                myParticipant={myParticipant}
                onPredict={(playerId) => updatePrediction(config.type, playerId)}
                isLive={game.status === 'live'}
              />
            ))}

            {/* Simulator (visible to all for demo purposes) */}
            <SimulatorPanel
              eventConfigs={game.eventConfigs}
              players={allPlayers}
              currentMinute={game.match.minute}
              onFireEvent={(type, playerId, minute) =>
                fireEvent(type as EventType, playerId, minute)
              }
              onAdvanceClock={advanceClock}
              onEndGame={endGame}
            />
          </div>

          {/* Leaderboard sidebar */}
          <div className={`space-y-4 ${mobileTab !== 'leaderboard' ? 'hidden lg:block' : ''}`}>
            <Leaderboard participants={game.participants} currentUserId={currentUserId} />

            {/* Participants' picks */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <span className="text-white font-semibold text-sm">Everyone's picks</span>
              </div>
              <div className="divide-y divide-gray-800">
                {game.participants.map((p) => (
                  <div key={p.id} className="px-4 py-3">
                    <div className={`text-sm font-medium mb-2 ${p.id === currentUserId ? 'text-green-400' : 'text-white'}`}>
                      {p.name} {p.id === currentUserId && '(you)'}
                    </div>
                    <div className="space-y-1">
                      {game.eventConfigs.map((cfg) => {
                        const pick = p.predictions[cfg.type];
                        const player = allPlayers.find((pl) => pl.id === pick);
                        return (
                          <div key={cfg.type} className="flex items-center gap-2 text-xs">
                            <span>{cfg.icon}</span>
                            <span className="text-gray-400 truncate">{player?.name ?? '—'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
