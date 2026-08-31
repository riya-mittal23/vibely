import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useMultiplayerStore } from '../store/useMultiplayerStore';

export const SetupOnline: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom, gameState, error } = useMultiplayerStore();
  const [mode, setMode] = useState<'CHOICE' | 'CREATE' | 'JOIN'>('CHOICE');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [rounds, setRounds] = useState(4);
  const [gameMode] = useState<'TEAM' | 'FREE_FOR_ALL'>('TEAM');
  const [vibe] = useState<'CASUAL' | 'NORMAL' | 'CHAOTIC'>('NORMAL');

  // Automatically navigate to lobby once room is joined
  useEffect(() => {
    if (gameState && gameState.status === 'LOBBY') {
      navigate('/lobby');
    }
  }, [gameState, navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <h1 className="text-4xl font-display font-bold text-center mb-8 uppercase tracking-widest text-primary">Play Online</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <Card className="w-full flex flex-col gap-6 p-6">
          {mode === 'CHOICE' && (
            <div className="flex flex-col gap-4">
              <Button size="xl" onClick={() => setMode('CREATE')}>CREATE ROOM</Button>
              <Button size="xl" variant="secondary" onClick={() => setMode('JOIN')}>JOIN ROOM</Button>
            </div>
          )}

          {mode === 'CREATE' && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-lg"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-2">Rounds</label>
                <div className="flex gap-2">
                  {[4, 8, 12].map(r => (
                    <button
                      key={r}
                      onClick={() => setRounds(r)}
                      className={`flex-1 py-2 rounded-lg font-bold ${rounds === r ? 'bg-primary text-white' : 'bg-white/5 border border-white/10'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                disabled={name.trim().length < 2}
                onClick={() => createRoom(name, { rounds, mode: gameMode, vibe })}
              >
                START A LOBBY
              </Button>

              <button onClick={() => setMode('CHOICE')} className="text-white/40 text-sm mt-2 hover:text-white uppercase font-bold tracking-widest">Back</button>
            </div>
          )}

          {mode === 'JOIN' && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-lg"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-white/60 mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-4 py-3 text-2xl font-display font-bold text-center tracking-widest uppercase"
                  placeholder="CODE"
                  maxLength={4}
                />
              </div>

              <Button
                size="lg"
                disabled={name.trim().length < 2 || roomCode.length < 4}
                onClick={() => joinRoom(name, roomCode)}
              >
                JOIN LOBBY
              </Button>

              <button onClick={() => setMode('CHOICE')} className="text-white/40 text-sm mt-2 hover:text-white uppercase font-bold tracking-widest">Back</button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
