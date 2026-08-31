import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ClientGameState } from '../types/multiplayer';
import { socket } from '../hooks/useSocket';

interface MultiplayerStore {
  gameState: ClientGameState | null;
  playerId: string | null;
  error: string | null;
  setGameState: (state: ClientGameState) => void;
  setPlayerId: (id: string) => void;
  setError: (error: string | null) => void;
  
  // Actions
  createRoom: (name: string, settings: any) => void;
  joinRoom: (name: string, code: string) => void;
  leaveRoom: () => void;
  updateSettings: (settings: any) => void;
  changeTeam: (teamId: string) => void;
  startGame: () => void;
  submitClue: (clue: string) => void;
  updateGuess: (position: number) => void;
  lockGuess: () => void;
  nextRound: () => void;
  playAgain: () => void;
  refreshSpectrum: () => void;
}

export const useMultiplayerStore = create<MultiplayerStore>()(
  persist(
    (set) => ({
      gameState: null,
  playerId: null,
  error: null,
  
  setGameState: (state) => set({ gameState: state }),
  setPlayerId: (id) => set({ playerId: id }),
  setError: (error) => set({ error }),
  
  createRoom: (name, settings) => {
    socket.emit('room:create', { name, settings });
  },
  
  joinRoom: (name, code) => {
    socket.emit('room:join', { name, code });
  },
  
  leaveRoom: () => {
    socket.emit('room:leave');
    set({ gameState: null, playerId: null });
    sessionStorage.removeItem('vibely-multiplayer-storage');
  },
  
  updateSettings: (settings) => {
    socket.emit('lobby:updateSettings', settings);
  },
  
  changeTeam: (teamId) => {
    socket.emit('lobby:changeTeam', teamId);
  },
  
  startGame: () => {
    socket.emit('lobby:startGame');
  },
  
  submitClue: (clue) => {
    socket.emit('game:submitClue', { clue });
  },
  
  refreshSpectrum: () => {
    socket.emit('game:refreshSpectrum');
  },
  
  updateGuess: (position) => {
    socket.emit('game:updateGuess', { position });
    set((state) => {
      if (state.gameState && state.gameState.currentRound) {
        return {
          gameState: {
            ...state.gameState,
            currentRound: {
              ...state.gameState.currentRound,
              guessPosition: position,
            }
          }
        };
      }
      return state;
    });
  },
  
  lockGuess: () => {
    socket.emit('game:lockGuess');
  },
  
  nextRound: () => {
    socket.emit('game:nextRound');
  },
  
  playAgain: () => {
    socket.emit('game:playAgain');
  }
    }),
    {
      name: 'vibely-multiplayer-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ gameState: state.gameState, playerId: state.playerId }),
    }
  )
);
