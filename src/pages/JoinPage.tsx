import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient';

export function JoinPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [gameExists, setGameExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (!gameId) return;
    apiClient.getGame(gameId).then((g) => {
      setGameExists(!!g && g.status === 'lobby');
    });
  }, [gameId]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setJoining(true);
    try {
      await apiClient.joinGame(gameId!, name.trim());
      navigate(`/lobby/${gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join game.');
    } finally {
      setJoining(false);
    }
  }

  if (gameExists === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Checking game…</div>
      </div>
    );
  }

  if (!gameExists) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-white text-xl font-bold mb-2">Game not found</h2>
          <p className="text-gray-400 text-sm mb-6">This game doesn't exist or has already started.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-1">Join Game</h2>
          <p className="text-gray-400 text-sm">
            Code: <span className="font-mono text-white font-bold">{gameId}</span>
          </p>
        </div>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-2">Your Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={joining}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {joining ? 'Joining…' : <><span>Join</span> <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
