import React from 'react';
import { useMultiplayerStore } from '../../store/useMultiplayerStore';

export const GameHeader: React.FC = () => {
  const gameState = useMultiplayerStore((state) => state.gameState);
  const playerId = useMultiplayerStore((state) => state.playerId);

  const roundNumber = gameState?.roundNumber || 1;
  const totalRounds = gameState?.settings?.rounds || 10;
  
  const player = gameState?.players.find(p => p.id === playerId);
  const score = player?.score || 0;

  return (
    <div className="w-full flex justify-between items-center mb-8 px-2 sm:px-0">
      <div className="text-xl font-display font-bold">VIBELY</div>
      
      <div className="flex flex-col items-end">
        <div className="text-sm font-bold text-white/60 tracking-wider">
          ROUND {roundNumber} <span className="mx-1 text-white/30">/</span> {totalRounds}
        </div>
        <div className="text-xl font-bold text-accent drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
          SCORE {score}
        </div>
      </div>
    </div>
  );
};
