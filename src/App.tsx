import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CreateGamePage } from './pages/CreateGamePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { ResultsPage } from './pages/ResultsPage';
import { JoinPage } from './pages/JoinPage';

function App() {
  return (
    <HashRouter>
      <GameProvider>
        <div className="min-h-screen bg-gray-950 flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateGamePage />} />
              <Route path="/lobby/:gameId" element={<LobbyPage />} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/results/:gameId" element={<ResultsPage />} />
              <Route path="/join/:gameId" element={<JoinPage />} />
            </Routes>
          </div>
        </div>
      </GameProvider>
    </HashRouter>
  );
}

export default App;
