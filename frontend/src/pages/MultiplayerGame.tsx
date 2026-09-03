import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, Clock, Target, Trophy, Swords, Zap } from 'lucide-react';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { Spectrum } from '../components/game/Spectrum';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LEVEL_CONFIGS } from '../data/levels';

export const MultiplayerGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, playerId, submitClue, updateGuess, lockGuess, nextRound, leaveRoom, refreshSpectrum } = useMultiplayerStore();
  const [inputClue, setInputClue] = useState('');
  const [currentLevelState, setCurrentLevelState] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (gameState?.currentRound?.deadlineAt && gameState.currentRound.status === 'GUESS') {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((gameState.currentRound!.deadlineAt! - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          const isGuessController = gameState.currentRound?.guessControllerId === playerId;
          if (isGuessController && !gameState.currentRound?.guessLocked) {
            useMultiplayerStore.getState().lockGuess();
          }
          clearInterval(interval);
        }
      }, 250);

      // Initial set
      setTimeLeft(Math.max(0, Math.ceil((gameState.currentRound.deadlineAt - Date.now()) / 1000)));

      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [gameState?.currentRound?.deadlineAt, gameState?.currentRound?.status, playerId]);

  useEffect(() => {
    if (gameState?.run) {
      const currentLvl = gameState.run.currentLevel;
      if (currentLvl !== currentLevelState) {
        setCurrentLevelState(currentLvl);
      }
    }
  }, [gameState?.run?.currentLevel, currentLevelState, gameState?.run?.levels]);

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

  if (gameState.status === 'LEVEL_INTRO' && gameState.run) {
    const isHost = gameState.hostPlayerId === playerId;
    const config = LEVEL_CONFIGS[gameState.run.currentLevel];

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
          <Card className="p-8 text-center bg-black/40 border-primary/50 relative overflow-hidden">
            <h2 className="text-sm font-bold text-white/50 mb-2 uppercase tracking-widest">LEVEL {gameState.run.currentLevel}</h2>
            <h3 className="text-3xl font-display font-bold text-white mb-6 uppercase">{gameState.run.genreId}</h3>

            <div className="space-y-4 mb-8 text-left">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Vibes:</span>
                <span className="font-bold">10</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Pass Score:</span>
                <span className="font-bold">{config?.passScore}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Modifiers:</span>
                <span className="font-bold text-xs max-w-[120px] text-right">
                  {config?.modifiers.length ? config.modifiers.join(', ') : 'None'}
                </span>
              </div>
            </div>

            {isHost ? (
              <Button size="xl" className="w-full" onClick={() => nextRound()}>
                START LEVEL
              </Button>
            ) : (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-white/60 font-medium">
                Waiting for host to start...
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  if (gameState.status === 'LEVEL_RESULT' && gameState.run) {
    const isHost = gameState.hostPlayerId === playerId;
    const currentLvlResult = gameState.run.levels[gameState.run.levels.length - 1];

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
          <Card className="p-8 text-center bg-black/40 border-primary/50 relative overflow-hidden">
            <h2 className="text-sm font-bold text-white/50 mb-2 uppercase tracking-widest">
              LEVEL {gameState.run.currentLevel} {currentLvlResult?.status === 'CLEARED' ? 'COMPLETE' : 'FAILED'}
            </h2>

            <div className="text-6xl mb-6">
              {currentLvlResult?.status === 'CLEARED' ? '🎉' : '💀'}
            </div>

            <h3 className={`text-4xl font-display font-bold mb-8 uppercase ${currentLvlResult?.status === 'CLEARED' ? 'text-green-400' : 'text-red-400'}`}>
              {currentLvlResult?.status}
            </h3>

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3].map(star => (
                <span key={star} className={`text-4xl ${currentLvlResult && currentLvlResult.stars >= star ? 'text-yellow-400' : 'text-white/20'}`}>
                  ⭐
                </span>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Score:</span>
                <span className="font-bold">{currentLvlResult?.score} / {currentLvlResult?.requiredScore}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Perfect Vibes:</span>
                <span className="font-bold">{currentLvlResult?.perfectVibes}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/60">Lives Remaining:</span>
                <span className={`font-bold ${gameState.run.lives <= 3 ? 'text-red-400' : 'text-green-400'}`}>
                  {gameState.run.lives}
                </span>
              </div>
            </div>

            {isHost ? (
              <Button size="xl" className="w-full" onClick={() => nextRound()}>
                {currentLvlResult?.status === 'CLEARED'
                  ? (gameState.run.currentLevel === 5 ? 'FINISH GAME' : 'NEXT LEVEL')
                  : (gameState.run.lives > 0 ? 'RETRY LEVEL' : 'END GAME')}
              </Button>
            ) : (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-white/60 font-medium">
                Waiting for host...
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    );
  }

  const round = gameState.currentRound;

  // Host leaving or game ended
  if (!round && gameState.status === 'GAME_OVER') {
    const isMaster = gameState.run?.status === 'COMPLETED';

    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <h2 className="text-4xl font-bold mb-2 text-primary tracking-widest uppercase">
          {isMaster ? '🎉 VIBELY MASTER 🎉' : 'Game Over'}
        </h2>
        <Card className="w-full max-w-lg mt-8 p-8 flex flex-col items-center">
          {gameState.run ? (
            <div className="text-center mb-8 w-full">
              <h3 className="text-2xl font-bold text-white/80 mb-2">FINAL SCORE</h3>
              <div className="text-5xl font-display font-bold text-primary mb-6">
                {gameState.run.totalScore}
              </div>
              <div className="text-lg text-white/60">
                Reached Level {gameState.run.highestLevelReached}
              </div>
            </div>
          ) : gameState.settings.mode === 'TEAM' ? (
            <div className="text-4xl font-display font-bold text-white mb-8">
              {gameState.teams[0].score > gameState.teams[1].score ? `${gameState.teams[0].name} Wins!` :
                gameState.teams[1].score > gameState.teams[0].score ? `${gameState.teams[1].name} Wins!` : "Tie!"}
            </div>
          ) : null}

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
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto pb-2 px-2 min-h-full">

      {/* Premium HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 py-4 mb-4 rounded-3xl glass-panel shadow-2xl relative z-10 shrink-0 gap-4">

        {/* Left Side: Progress HUD */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full md:w-auto">
          {/* Level Badge */}
          <div className="flex items-center gap-3 bg-black/20 border border-white/10 px-4 py-2 rounded-2xl shadow-inner">
            <Trophy className="text-primary w-5 h-5 opacity-80" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold leading-none mb-1">Current</span>
              <span className="text-sm font-bold text-white leading-none">
                {gameState.run ? `Level ${gameState.run.currentLevel}` : `Round ${round.number}`}
              </span>
            </div>
          </div>

          {/* Vibe Progress */}
          {gameState.run && (
            <div className="flex items-center gap-3 bg-black/20 border border-white/10 px-4 py-2 rounded-2xl shadow-inner">
              <Target className="text-secondary w-5 h-5 opacity-80" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold leading-none mb-1">Vibes</span>
                <span className="text-sm font-bold text-white leading-none">
                  {gameState.run.levels[gameState.run.levels.length - 1]?.vibesAnswered || 0} <span className="text-white/40">/ 10</span>
                </span>
              </div>
            </div>
          )}

          {/* Lives */}
          {gameState.run && (
            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl shadow-inner transition-colors border ${gameState.run.lives <= 3 ? 'bg-red-500/10 border-red-500/30' : 'bg-black/20 border-white/10'}`}>
              <Heart
                className={`w-5 h-5 ${gameState.run.lives <= 3 ? 'text-red-400 animate-pulse' : 'text-green-400 opacity-80'}`}
                fill={gameState.run.lives <= 3 ? '#f87171' : 'currentColor'}
              />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold leading-none mb-1">Lives</span>
                <span className={`text-sm font-bold leading-none ${gameState.run.lives <= 3 ? 'text-red-400' : 'text-green-400'}`}>
                  {gameState.run.lives}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Mode-Specific HUD */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">

          {/* Timer */}
          {round.deadlineAt && timeLeft !== null && (
            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl shadow-inner border transition-colors ${timeLeft <= 5 ? 'bg-red-500/20 border-red-500/50 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-black/20 border-white/10'}`}>
              <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400' : 'text-white/60'}`} />
              <div className="flex flex-col text-left">
                <span className={`text-[9px] uppercase tracking-widest font-bold leading-none mb-1 ${timeLeft <= 5 ? 'text-red-400/80' : 'text-white/50'}`}>Time Left</span>
                <span className={`text-lg font-display font-bold leading-none ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          )}

          {/* Teams or FFA Score */}
          {gameState.settings.mode === 'TEAM' ? (
            <div className="flex items-center bg-black/30 border border-white/10 p-1 rounded-2xl shadow-inner">
              <div className="flex flex-col items-center px-4 py-1.5 rounded-xl">
                <span className="text-[9px] text-secondary font-bold uppercase tracking-widest mb-1">{gameState.teams[0].name}</span>
                <span className="text-xl font-display font-bold text-white leading-none">{gameState.teams[0].score}</span>
              </div>
              <div className="px-1 text-white/20"><Swords className="w-5 h-5" /></div>
              <div className="flex flex-col items-center px-4 py-1.5 rounded-xl">
                <span className="text-[9px] text-accent font-bold uppercase tracking-widest mb-1">{gameState.teams[1].name}</span>
                <span className="text-xl font-display font-bold text-white leading-none">{gameState.teams[1].score}</span>
              </div>
            </div>
          ) : gameState.run ? (
            <div className="flex items-center gap-3 bg-black/20 border border-white/10 px-4 py-2 rounded-2xl shadow-inner">
              <Trophy className="text-yellow-400 w-5 h-5 opacity-80" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold leading-none mb-1">Level Score</span>
                <span className="text-sm font-bold text-white leading-none">
                  {gameState.run.levels[gameState.run.levels.length - 1]?.score || 0}
                  <span className="text-white/30 text-xs ml-1 font-normal">/ {LEVEL_CONFIGS[gameState.run.currentLevel]?.passScore}</span>
                </span>
              </div>
            </div>
          ) : null}

        </div>
      </div>

      {/* Role and Modifiers */}
      <div className="flex flex-col items-center gap-3 mb-6 shrink-0 relative z-10">
        {gameState.run && LEVEL_CONFIGS[gameState.run.currentLevel]?.modifiers.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {LEVEL_CONFIGS[gameState.run.currentLevel].modifiers.map(mod => (
              <div key={mod} className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                <Zap className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-300 tracking-widest uppercase mt-0.5">
                  {mod.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {gameState.settings.mode === 'TEAM' && myTeamName && (
            <div className="px-5 py-1.5 rounded-full bg-black/40 border border-white/10 text-white/80 font-bold text-[11px] tracking-widest uppercase backdrop-blur-md">
              Team <span className={myTeamId === gameState.teams[0].id ? 'text-secondary' : 'text-accent'}>{myTeamName}</span>
            </div>
          )}
          <div className="px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-[11px] tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-md">
            {roleMessage}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <AnimatePresence mode="wait">

          {/* CLUE PHASE */}
          {round.status === 'CLUE' && (
            <motion.div
              key="clue"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 py-4"
            >
              <div className="w-full lg:w-3/5 flex-1 flex items-center justify-center">
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
                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        value={inputClue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (gameState.run && LEVEL_CONFIGS[gameState.run.currentLevel]?.modifiers.includes('THREE_WORD_CLUE')) {
                            if (val.trim().split(/\s+/).length > 3 && val.length > inputClue.length) return;
                          }
                          setInputClue(val.substring(0, 120));
                        }}
                        placeholder="Type your clue..."
                        className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-4 text-center text-lg focus:outline-none focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && inputClue.trim() && submitClue(inputClue)}
                      />
                      {gameState.run && LEVEL_CONFIGS[gameState.run.currentLevel]?.modifiers.includes('THREE_WORD_CLUE') && (
                        <div className="text-xs font-bold text-orange-400 text-right pr-2">
                          MAX 3 WORDS
                        </div>
                      )}
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
              className="w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 py-4"
            >
              <div className="w-full lg:w-3/5 flex-1 flex items-center justify-center">
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
              className="w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 py-4"
            >
              <div className="w-full lg:w-3/5 flex-1 flex items-center justify-center">
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
                      {round.roundScore === 100 ? "PERFECT VIBE" :
                        round.roundScore === 75 ? "SO CLOSE" :
                          round.roundScore === 50 ? "NOT BAD" : "WAY OFF 😭"}
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
