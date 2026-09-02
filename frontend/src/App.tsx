import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { HowToPlay } from './pages/HowToPlay';
import { SetupOnline } from './pages/SetupOnline';
import { Lobby } from './pages/Lobby';
import { MultiplayerGame } from './pages/MultiplayerGame';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* routes */}
          <Route path="/" element={<Home />} />
          <Route path="/online-setup" element={<SetupOnline />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/online-game" element={<MultiplayerGame />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
