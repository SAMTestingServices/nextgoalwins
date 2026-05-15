import { useState } from 'react';
import { Zap, ChevronDown } from 'lucide-react';
import type { EventConfig, EventType, Player } from '../types';

interface SimulatorPanelProps {
  eventConfigs: EventConfig[];
  players: Player[];
  currentMinute: number;
  onFireEvent: (eventType: string, playerId: string, minute: number) => void;
  onAdvanceClock: (minute: number) => void;
  onEndGame: () => void;
}

export function SimulatorPanel({
  eventConfigs,
  players,
  currentMinute,
  onFireEvent,
  onAdvanceClock,
  onEndGame,
}: SimulatorPanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventType | ''>(eventConfigs[0]?.type ?? '');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [minute, setMinute] = useState(currentMinute + 1);

  function handleFire() {
    if (!selectedEvent || !selectedPlayer) return;
    onFireEvent(selectedEvent, selectedPlayer, minute);
    setMinute((m) => m + Math.floor(Math.random() * 10) + 1);
  }

  function fireRandom() {
    const config = eventConfigs[Math.floor(Math.random() * eventConfigs.length)];
    if (!config) return;
    const player = players[Math.floor(Math.random() * players.length)];
    if (!player) return;
    const newMinute = Math.min(90, minute + Math.floor(Math.random() * 10) + 1);
    onFireEvent(config.type, player.id, newMinute);
    setMinute(newMinute + 1);
  }

  return (
    <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 font-semibold text-sm">Match Simulator (Dev)</span>
        <span className="text-xs text-gray-500 ml-1">— simulate events to test the app</span>
      </div>

      {/* Manual event */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Event</label>
          <div className="relative">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as EventType)}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-yellow-500 focus:outline-none appearance-none pr-7"
            >
              {eventConfigs.map((e) => (
                <option key={e.type} value={e.type}>
                  {e.icon} {e.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Player</label>
          <div className="relative">
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-yellow-500 focus:outline-none appearance-none pr-7"
            >
              <option value="">Pick player</option>
              <optgroup label="Home">
                {players.filter((p) => p.team === 'home').map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Away">
                {players.filter((p) => p.team === 'away').map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Minute</label>
          <input
            type="number"
            min={1}
            max={120}
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-yellow-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleFire}
          disabled={!selectedEvent || !selectedPlayer}
          className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-gray-900 font-semibold text-sm py-2 rounded-lg transition-colors"
        >
          Fire Event
        </button>
        <button
          onClick={fireRandom}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
        >
          Random Event
        </button>
        <button
          onClick={onEndGame}
          className="bg-red-700 hover:bg-red-600 text-white font-semibold text-sm px-3 py-2 rounded-lg transition-colors"
        >
          End
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs">Advance clock to:</span>
        <input
          type="number"
          min={currentMinute + 1}
          max={120}
          defaultValue={currentMinute + 5}
          id="clock-advance"
          className="w-16 bg-gray-800 text-white text-sm rounded-lg px-2 py-1 border border-gray-700 focus:outline-none"
        />
        <button
          onClick={() => {
            const el = document.getElementById('clock-advance') as HTMLInputElement;
            onAdvanceClock(Number(el.value));
          }}
          className="text-xs text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded-lg transition-colors"
        >
          Set
        </button>
      </div>
    </div>
  );
}
