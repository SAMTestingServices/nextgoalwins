import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { mockBackend } from '../services/mockBackend';
import type { EventConfig } from '../types';

export function CreateGamePage() {
  const navigate = useNavigate();
  const matches = mockBackend.getAvailableMatches();
  const [step, setStep] = useState(1);
  const [hostName, setHostName] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id ?? '');
  const [eventConfigs, setEventConfigs] = useState<EventConfig[]>(
    mockBackend.getDefaultEventConfigs()
  );
  const [nameError, setNameError] = useState('');

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!hostName.trim()) {
      setNameError('Please enter your name.');
      return;
    }
    setNameError('');
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
  }

  function handleCreate() {
    const game = mockBackend.createGame(hostName.trim(), selectedMatchId, eventConfigs);
    navigate(`/lobby/${game.id}`);
  }

  function toggleEvent(type: string) {
    setEventConfigs((prev) =>
      prev.map((e) => (e.type === type ? { ...e, active: !e.active } : e))
    );
  }

  function updatePoints(type: string, points: number) {
    setEventConfigs((prev) =>
      prev.map((e) => (e.type === type ? { ...e, points: Math.max(1, points) } : e))
    );
  }

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/'))}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s
                    ? 'bg-green-500 text-white'
                    : step === s
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Your name */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-white text-2xl font-bold mb-1">Who are you?</h2>
            <p className="text-gray-400 text-sm mb-6">Your name will appear on the leaderboard.</p>
            <div>
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-2">
                Your Name
              </label>
              <input
                autoFocus
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none text-lg"
              />
              {nameError && <p className="text-red-400 text-sm mt-2">{nameError}</p>}
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Pick a match */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-white text-2xl font-bold mb-1">Pick a match</h2>
              <p className="text-gray-400 text-sm mb-6">Select the fixture your game is based on.</p>
              <div className="space-y-3">
                {matches.map((match) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => setSelectedMatchId(match.id)}
                    className={`w-full rounded-xl p-4 border text-left transition-all ${
                      selectedMatchId === match.id
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xs text-gray-400 mb-2">{match.competition}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold">{match.homeTeam.name}</div>
                      <div className="text-gray-400 text-sm font-bold">vs</div>
                      <div className="text-white font-semibold">{match.awayTeam.name}</div>
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      {new Date(match.kickoff).toLocaleString([], {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3: Configure events */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-white text-2xl font-bold mb-1">Configure events</h2>
              <p className="text-gray-400 text-sm mb-6">
                Choose which events to predict and how many points each is worth.
              </p>
              <div className="space-y-3">
                {eventConfigs.map((event) => (
                  <div
                    key={event.type}
                    className={`rounded-xl p-4 border transition-all ${
                      event.active ? 'border-gray-700 bg-gray-800' : 'border-gray-800 bg-gray-900 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleEvent(event.type)}
                          className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                            event.active ? 'bg-green-500' : 'bg-gray-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${
                              event.active ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-lg">{event.icon}</span>
                        <span className="text-white font-medium">{event.label}</span>
                      </div>
                      {event.active && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updatePoints(event.type, event.points - 5)}
                            className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="text-green-400 font-bold w-8 text-center">{event.points}</span>
                          <button
                            onClick={() => updatePoints(event.type, event.points + 5)}
                            className="w-7 h-7 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedMatch && (
              <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
                <div className="text-gray-400 text-xs mb-1">{selectedMatch.competition}</div>
                <div className="text-white font-semibold">
                  {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                </div>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={eventConfigs.filter((e) => e.active).length === 0}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Create Game <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
