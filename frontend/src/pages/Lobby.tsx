import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { Users, Copy } from 'lucide-react';

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, playerId, leaveRoom, startGame, updateSettings } = useMultiplayerStore();

  useEffect(() => {
    if (!gameState) {
      navigate('/online-setup');
    } else if (
      gameState.status === 'STARTING' || 
      gameState.status === 'PLAYING' || 
      gameState.status === 'LEVEL_INTRO' ||
      gameState.status === 'ROUND_RESULT' ||
      gameState.status === 'LEVEL_RESULT'
    ) {
      navigate('/online-game');
    }
  }, [gameState, navigate]);

  if (!gameState || !playerId) return null;

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const isHost = myPlayer?.isHost || false;

  return (
    <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-widest uppercase">Lobby</h1>
        <Button variant="outline" size="sm" onClick={() => leaveRoom()}>Leave Room</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Room Code & Settings */}
        <div className="flex flex-col gap-6">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/20 to-transparent border-primary/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Room Code</p>
            <h2 className="text-6xl font-display font-bold tracking-widest text-white drop-shadow-lg mb-4">{gameState.code}</h2>
            
            <Button variant="secondary" size="md" className="mx-auto" onClick={() => navigator.clipboard.writeText(gameState.code)}>
              <Copy size={16} className="mr-2" /> COPY CODE
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold uppercase tracking-widest text-sm text-white/60 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Game Settings
            </h3>
            
            <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <span className="text-white/60 font-medium">Mode</span>
              <span className="font-bold tracking-wider text-white bg-white/10 px-3 py-1 rounded-full text-sm">
                {gameState.settings.mode.replace('_', ' ')}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-white/60 text-sm font-medium mb-1">Select Theme</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'everyday', name: 'Everyday', icon: '🌎' },
                  { id: 'college', name: 'College', icon: '🎓' },
                  { id: 'school', name: 'School', icon: '🎒' },
                  { id: 'work', name: 'Work', icon: '💼' },
                  { id: 'spicy', name: 'Spicy', icon: '🌶️' },
                  { id: 'entertainment', name: 'Media', icon: '🎬' },
                ].map((genre) => {
                  const isSelected = (gameState.settings.genreId || 'everyday') === genre.id;
                  
                  return (
                    <motion.button
                      key={genre.id}
                      whileHover={isHost ? { scale: 1.05 } : {}}
                      whileTap={isHost ? { scale: 0.95 } : {}}
                      onClick={() => isHost && updateSettings({ genreId: genre.id })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-b from-primary/30 to-primary/10 border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)] scale-105' 
                          : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:bg-white/10'
                      } ${!isHost && 'cursor-default'}`}
                    >
                      <span className="text-3xl mb-2 drop-shadow-md">{genre.icon}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider text-center leading-tight ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {genre.name}
                      </span>
                      {isSelected && (
                        <motion.div 
                          layoutId="active-genre-indicator"
                          className="absolute -inset-px border-2 border-primary rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {isHost ? (
              <Button 
                size="xl" 
                className="w-full mt-8 relative overflow-hidden group" 
                onClick={startGame}
                disabled={gameState.players.length < 2}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative font-bold tracking-widest">START GAME</span>
              </Button>
            ) : (
              <div className="mt-8 text-center p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary font-medium animate-pulse">
                Waiting for host to start...
              </div>
            )}
            {gameState.players.length < 2 && isHost && (
              <p className="text-xs text-center text-red-400 mt-3 font-medium">Need at least 2 players to start</p>
            )}
          </Card>
        </div>

        {/* Right Column: Players */}
        <div className="flex flex-col gap-6">
          <Card className="p-6 flex-1 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold uppercase tracking-widest text-sm text-white/60 flex items-center">
                <Users size={16} className="mr-2" /> Players ({gameState.players.length}/8)
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {gameState.players.map(player => (
                  <motion.div 
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.id === playerId ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{player.name} {player.id === playerId && '(You)'}</span>
                    </div>
                    {player.isHost && (
                      <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Host</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
