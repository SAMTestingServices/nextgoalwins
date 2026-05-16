import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function HomePage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState<'create' | 'join'>('create');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError('');
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError('Please enter a game code.'); return; }
    const name = joinName.trim();
    if (!name) { setJoinError('Please enter your name.'); return; }

    setJoining(true);
    try {
      const game = await apiClient.getGame(code);
      if (!game) { setJoinError('Game not found. Check the code and try again.'); return; }
      if (game.status !== 'lobby') { setJoinError('This game has already started.'); return; }
      await apiClient.joinGame(code, name);
      navigate(`/lobby/${code}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join game.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-12 h-12 text-green-400" />
          <h1 className="text-5xl font-extrabold text-white tracking-tight">NextGoalWins</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-md">
          Predict the next player to score, foul, or get carded — live, with your mates.
        </p>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-800">
        <div className="flex">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              tab === 'create' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Create a Game
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              tab === 'join' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Join a Game
          </button>
        </div>

        <div className="p-8">
          {tab === 'create' ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Set up a prediction game</h2>
              <p className="text-gray-400 text-sm mb-6">
                Pick a match, configure events, and invite your friends.
              </p>
              <button
                onClick={() => navigate('/create')}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Create Game <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-white text-xl font-bold mb-1">Join a game</h2>
                <p className="text-gray-400 text-sm">Enter the code your friend shared.</p>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Game Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={10}
                  className="w-full bg-gray-800 text-white text-center text-2xl font-mono tracking-widest rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Your Name</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none"
                />
              </div>
              {joinError && <p className="text-red-400 text-sm text-center">{joinError}</p>}
              <button
                type="submit"
                disabled={joining}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {joining ? 'Joining…' : <><span>Join Game</span> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
