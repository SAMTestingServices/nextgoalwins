import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
      <Link to="/" className="flex items-center gap-2 text-white hover:text-green-400 transition-colors">
        <Trophy className="w-6 h-6 text-green-400" />
        <span className="text-xl font-bold tracking-tight">NextGoalWins</span>
      </Link>
    </nav>
  );
}
