import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMultiplayerStore } from '../store/useMultiplayerStore';

export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
  autoConnect: false, // We'll connect when needed
});

export function useSocket() {
  const setGameState = useMultiplayerStore(state => state.setGameState);
  const setPlayerId = useMultiplayerStore(state => state.setPlayerId);
  const setError = useMultiplayerStore(state => state.setError);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log('Connected to socket server');
      setError(null);

      const storeState = useMultiplayerStore.getState();
      if (storeState.playerId && storeState.gameState?.code) {
        console.log('Attempting to rejoin room...');
        socket.emit('room:rejoin', {
          code: storeState.gameState.code,
          playerId: storeState.playerId
        });
      }
    };

    const onDisconnect = () => {
      console.log('Disconnected from socket server');
    };

    const onError = (err: { code: string; message: string }) => {
      console.error('Socket error:', err);
      setError(err.message);
    };

    // const onStateUpdate = (state: any) => {
    //   setGameState(state);
    // };

    // Generic state listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('error', onError);

    socket.on('room:rejoinFailed', (payload) => {
      console.warn('Rejoin failed:', payload?.message);
      useMultiplayerStore.setState({ gameState: null, playerId: null, error: payload?.message || 'Failed to rejoin room' });
      sessionStorage.removeItem('vibely-multiplayer-storage');
    });

    // Room and Lobby listeners
    socket.on('room:created', (state, playerId) => {
      setGameState(state);
      setPlayerId(playerId);
    });

    socket.on('room:joined', (state, playerId) => {
      setGameState(state);
      setPlayerId(playerId);
    });
    socket.on('room:updated', (state) => setGameState(state));
    socket.on('lobby:updated', (state) => setGameState(state));

    // Game listeners
    socket.on('game:state', (state) => setGameState(state));
    socket.on('game:roundStarted', (state) => setGameState(state));
    socket.on('game:roundResult', (state) => setGameState(state));
    socket.on('game:gameOver', (state) => setGameState(state));

    // Incremental UI updates
    socket.on('game:clueSubmitted', (clue) => {
      useMultiplayerStore.setState((prev) => {
        if (prev.gameState && prev.gameState.currentRound) {
          const newState = { ...prev.gameState };
          newState.currentRound = { ...prev.gameState.currentRound, clue, status: 'GUESS' as const };
          return { gameState: newState };
        }
        return prev;
      });
    });

    socket.on('game:guessUpdated', (position) => {
      useMultiplayerStore.setState((prev) => {
        if (prev.gameState && prev.gameState.currentRound) {
          const newState = { ...prev.gameState };
          newState.currentRound = { ...prev.gameState.currentRound, guessPosition: position };
          return { gameState: newState };
        }
        return prev;
      });
    });

    socket.on('game:guessLocked', () => {
      useMultiplayerStore.setState((prev) => {
        if (prev.gameState && prev.gameState.currentRound) {
          const newState = { ...prev.gameState };
          newState.currentRound = { ...prev.gameState.currentRound, guessLocked: true, status: 'REVEAL' as const };
          return { gameState: newState };
        }
        return prev;
      });
    });

    socket.on('game:revealed', (payload: any) => {
      useMultiplayerStore.setState((prev) => {
        if (prev.gameState && prev.gameState.currentRound) {
          const currentRound = {
            ...prev.gameState.currentRound,
            targetPosition: payload.targetPosition,
            targetWidth: payload.targetWidth,
            guessPosition: payload.guessPosition,
            roundScore: payload.score,
            status: 'RESULT' as const
          };

          const newState = {
            ...prev.gameState,
            currentRound,
            roundHistory: [
              ...prev.gameState.roundHistory,
              {
                roundNumber: currentRound.number,
                spectrumId: currentRound.spectrumId,
                clue: currentRound.clue || '',
                targetPosition: payload.targetPosition || 0,
                guessPosition: payload.guessPosition || 0,
                distance: payload.distance || 0,
                score: payload.score || 0
              }
            ]
          };

          return { gameState: newState };
        }
        return prev;
      });
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('error', onError);
      socket.off('room:rejoinFailed');
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:updated');
      socket.off('lobby:updated');
      socket.off('game:state');
      socket.off('game:roundStarted');
      socket.off('game:roundResult');
      socket.off('game:gameOver');
      socket.off('game:clueSubmitted');
      socket.off('game:guessUpdated');
      socket.off('game:guessLocked');
      socket.off('game:revealed');
    };
  }, [setGameState, setError]);

  return { socket };
}
