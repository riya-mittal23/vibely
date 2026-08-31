import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { Spectrum } from '../components/game/Spectrum';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const MultiplayerGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, playerId, submitClue, updateGuess, lockGuess, nextRound, leaveRoom, refreshSpectrum } = useMultiplayerStore();
  const [inputClue, setInputClue] = useState('');

  useEffect(() => {
    if (!gameState) {
      navigate('/online-setup');
    } else if (gameState.status === 'LOBBY') {
      navigate('/lobby');
    }
  }, [gameState, navigate]);

  // Clear input clue when a new round starts
  useEffect(() => {
    if (gameState?.currentRound?.status === 'CLUE') {
      setInputClue('');
    }
  }, [gameState?.currentRound?.number]);

  if (!gameState || !playerId) return null;

  const round = gameState.currentRound;

  // Host leaving or game ended
  if (!round && gameState.status === 'GAME_OVER') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <h2 className="text-4xl font-bold mb-2 text-primary tracking-widest uppercase">Game Complete</h2>
        <Card className="w-full max-w-lg mt-8 p-8 flex flex-col items-center">
          {gameState.settings.mode === 'TEAM' && (
            <div className="text-4xl font-display font-bold text-white mb-8">
              {gameState.teams[0].score > gameState.teams[1].score ? `${gameState.teams[0].name} Wins!` :
                gameState.teams[1].score > gameState.teams[0].score ? `${gameState.teams[1].name} Wins!` : "Tie!"}
            </div>
          )}

          <div className="w-full grid grid-cols-2 gap-4 text-center mb-8">
            {gameState.teams.map(t => {
              const teamMembers = gameState.players
                .filter(p => p.teamId === t.id)
                .map(p => p.name)
                .join(', ');
              return (
                <div key={t.id} className="p-4 flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/10">
                  <div className="text-sm font-bold tracking-widest text-white/50 uppercase mb-2">{t.name}</div>
                  <div className="text-4xl font-bold mb-3">{t.score}</div>
                  <div className="text-base md:text-lg font-medium text-white/90 mt-4 bg-black/20 px-4 py-2 rounded-lg w-full shadow-inner border border-white/5">
                    {teamMembers}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 w-full mt-4">
            {gameState.hostPlayerId === playerId ? (
              <Button size="lg" className="flex-1" onClick={() => useMultiplayerStore.getState().playAgain()}>PLAY AGAIN</Button>
            ) : (
              <div className="flex-1 text-center p-4 bg-white/5 rounded-lg border border-white/10 text-white/60 font-medium">
                Waiting for host...
              </div>
            )}
            <Button size="lg" variant="secondary" onClick={() => leaveRoom()}>LEAVE ROOM</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!round) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  const isClueGiver = round.clueGiverId === playerId;
  const isGuessController = round.guessControllerId === playerId;
  const myTeamId = gameState.players.find(p => p.id === playerId)?.teamId;
  const myTeamName = gameState.teams.find(t => t.id === myTeamId)?.name;
  const isMyTeamGuessing = round.guessingTeamId === myTeamId;

  const targetWidth = round.targetWidth || 14;
  const targetPosition = round.targetPosition !== undefined ? round.targetPosition : 50;
  const showTarget = isClueGiver || round.status === 'REVEAL' || round.status === 'RESULT';

  // Build role message
  let roleMessage = "";
  if (isClueGiver) roleMessage = "YOU ARE THE CLUE GIVER";
  else if (isGuessController) roleMessage = "YOU CONTROL THE GUESS";
  else if (isMyTeamGuessing) roleMessage = "YOUR TEAM IS GUESSING";
  else roleMessage = "OPPOSING TEAM IS GUESSING";

  return (
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto pb-2 px-2 h-full min-h-0">

      {/* Multiplayer Header */}
      <div className="flex justify-between items-center py-2 mb-2 border-b border-white/10 shrink-0">
        <div className="text-sm font-bold tracking-widest uppercase text-white/50">Round {round.number} / {gameState.settings.rounds}</div>

        {gameState.settings.mode === 'TEAM' && (
          <div className="flex gap-8">
            <div className="text-center">
              <span className="text-secondary font-bold mr-3">{gameState.teams[0].name}</span>
              <span className="text-xl font-display">{gameState.teams[0].score}</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-display mr-3">{gameState.teams[1].score}</span>
              <span className="text-accent font-bold">{gameState.teams[1].name}</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mb-2 flex flex-col items-center gap-2 shrink-0">
        {gameState.settings.mode === 'TEAM' && myTeamName && (
          <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white font-bold text-sm tracking-widest uppercase border border-white/20">
            YOU ARE ON {myTeamName}
          </div>
        )}
        <div className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          {roleMessage}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative min-h-0">
        <AnimatePresence mode="wait">

          {/* CLUE PHASE */}
          {round.status === 'CLUE' && (
            <motion.div
              key="clue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 min-h-0"
            >
              <div className="w-full lg:w-3/5 flex-1 min-h-0 flex items-center justify-center">
                <Spectrum
                  leftLabel={round.leftLabel}
                  rightLabel={round.rightLabel}
                  targetPosition={targetPosition}
                  targetWidth={targetWidth}
                  guessPosition={50}
                  showTarget={showTarget}
                  interactive={false}
                />
              </div>

              <div className="w-full lg:w-2/5 flex items-center justify-center shrink-0">
                {isClueGiver ? (
                  <Card className="w-full max-w-xl text-center space-y-4 p-4">
                    <div className="flex items-center justify-between">
                      <div className="w-8"></div>
                      <h3 className="font-bold text-lg">GIVE YOUR CLUE</h3>
                      <button
                        onClick={() => refreshSpectrum()}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        title="Get a new spectrum"
                      >
                        <RefreshCw size={16} />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputClue}
                        onChange={(e) => setInputClue(e.target.value.substring(0, 120))}
                        placeholder="Type your clue..."
                        className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-4 text-center text-lg focus:outline-none focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && inputClue.trim() && submitClue(inputClue)}
                      />
                    </div>
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!inputClue.trim()}
                      onClick={() => submitClue(inputClue)}
                    >
                      LOCK CLUE
                    </Button>
                  </Card>
                ) : (
                  <Card className="w-full max-w-md text-center p-4">
                    <h3 className="font-bold text-white/50 animate-pulse">Waiting for Clue Giver...</h3>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {/* GUESS PHASE */}
          {round.status === 'GUESS' && (
            <motion.div
              key="guess"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 min-h-0"
            >
              <div className="w-full lg:w-3/5 flex-1 min-h-0 flex items-center justify-center">
                <Spectrum
                  leftLabel={round.leftLabel}
                  rightLabel={round.rightLabel}
                  targetPosition={targetPosition}
                  targetWidth={targetWidth}
                  guessPosition={round.guessPosition || 50}
                  showTarget={showTarget}
                  interactive={isGuessController}
                  onGuessChange={(val) => updateGuess(val)}
                />
              </div>

              <div className="w-full lg:w-2/5 flex items-center justify-center shrink-0">
                <Card className="w-full max-w-xl text-center space-y-4 p-4">
                  <h3 className="font-bold text-sm tracking-widest text-primary uppercase">The Clue</h3>
                  <p className="text-xl sm:text-2xl font-display font-medium italic pb-2">"{round.clue}"</p>

                  {isGuessController ? (
                    <div className="pt-6 border-t border-white/10">
                      <Button size="lg" className="w-full min-h-[60px]" onClick={lockGuess}>
                        LOCK IT
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-6 border-t border-white/10 text-white/50 font-medium">
                      {isMyTeamGuessing ? "Discuss where it belongs!" : "Waiting for them to lock..."}
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          )}

          {/* REVEAL / RESULT PHASE */}
          {(round.status === 'REVEAL' || round.status === 'RESULT') && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 min-h-0"
            >
              <div className="w-full lg:w-3/5 flex-1 min-h-0 flex items-center justify-center">
                <Spectrum
                  leftLabel={round.leftLabel}
                  rightLabel={round.rightLabel}
                  targetPosition={targetPosition}
                  targetWidth={targetWidth}
                  guessPosition={round.guessPosition || 50}
                  showTarget={true}
                  interactive={false}
                />
              </div>

              <div className="w-full lg:w-2/5 flex items-center justify-center shrink-0">
                {round.status === 'RESULT' && (
                  <Card className="w-full max-w-md text-center flex flex-col items-center p-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center border-4 border-accent mb-6"
                    >
                      <span className="text-4xl font-bold text-accent">+{round.roundScore}</span>
                    </motion.div>

                    <h3 className="text-3xl font-bold mb-8">
                      {round.roundScore === 20 ? "PERFECT VIBE" :
                        round.roundScore === 15 ? "SO CLOSE" :
                          round.roundScore === 10 ? "NOT BAD" : "WAY OFF 😭"}
                    </h3>

                    {gameState.hostPlayerId === playerId ? (
                      <Button size="lg" className="w-full" onClick={() => { setInputClue(''); nextRound(); }}>
                        NEXT ROUND
                      </Button>
                    ) : (
                      <div className="text-white/50 font-medium">Waiting for host...</div>
                    )}
                  </Card>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
