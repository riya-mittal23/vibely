import { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../types/index.js';
import { gameManager } from '../game/GameManager.js';
import { serializeGameStateForPlayer } from './state.js';

export function registerGameHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, 
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  const getRoomContext = () => {
    const roomId = socket.data.roomId;
    const playerId = socket.data.playerId;
    if (!roomId || !playerId) throw new Error('NOT_AUTHORIZED');
    const room = gameManager.getRoom(roomId);
    if (!room) throw new Error('ROOM_NOT_FOUND');
    return { room, playerId };
  };

  const broadcastState = (room: any) => {
    const state = room.getState();
    state.players.forEach((p: any) => {
      io.to(p.socketId).emit('game:state', serializeGameStateForPlayer(state, p.id));
    });
  };

  socket.on('game:submitClue', (data) => {
    try {
      const { room, playerId } = getRoomContext();
      room.getEngine().submitClue(playerId, data.clue);
      io.to(room.getState().id).emit('game:clueSubmitted', data.clue);
      broadcastState(room);
    } catch (e: any) {
      socket.emit('error', { code: 'GAME_ERROR', message: e.message });
    }
  });

  socket.on('game:updateGuess', (data) => {
    try {
      const { room, playerId } = getRoomContext();
      room.getEngine().updateGuess(playerId, data.position);
      socket.to(room.getState().id).emit('game:guessUpdated', data.position);
    } catch (e: any) {
      // Don't emit error for throttled events to avoid spam
    }
  });

  socket.on('game:lockGuess', () => {
    try {
      const { room, playerId } = getRoomContext();
      room.getEngine().lockGuess(playerId);
      io.to(room.getState().id).emit('game:guessLocked');
      
      // Since lockGuess automatically reveals in our engine:
      const state = room.getState();
      if (state.status === 'ROUND_RESULT' && state.currentRound) {
        io.to(state.id).emit('game:revealed', {
          targetPosition: state.currentRound.targetPosition,
          targetWidth: state.currentRound.targetWidth,
          guessPosition: state.currentRound.guessPosition,
          distance: state.roundHistory[state.roundHistory.length-1]!.distance,
          score: state.roundHistory[state.roundHistory.length-1]!.score
        });
      }
      broadcastState(room);
    } catch (e: any) {
      socket.emit('error', { code: 'GAME_ERROR', message: e.message });
    }
  });

  socket.on('game:nextRound', () => {
    try {
      const { room, playerId } = getRoomContext();
      room.getEngine().nextRound(playerId);
      io.to(room.getState().id).emit('game:roundStarted', serializeGameStateForPlayer(room.getState(), 'SERVER'));
      broadcastState(room);
    } catch (e: any) {
      socket.emit('error', { code: 'GAME_ERROR', message: e.message });
    }
  });

  socket.on('game:playAgain', () => {
    try {
      const { room, playerId } = getRoomContext();
      if (room.getState().hostPlayerId !== playerId) throw new Error('NOT_HOST');
      
      room.getEngine().resetToLobby();
      
      const state = room.getState();
      state.players.forEach((p: any) => {
        io.to(p.socketId).emit('lobby:updated', serializeGameStateForPlayer(state, p.id));
      });
    } catch (e: any) {
      socket.emit('error', { code: 'GAME_ERROR', message: e.message });
    }
  });

  socket.on('game:refreshSpectrum', () => {
    try {
      const { room, playerId } = getRoomContext();
      room.getEngine().refreshSpectrum(playerId);
      broadcastState(room);
    } catch (e: any) {
      socket.emit('error', { code: 'GAME_ERROR', message: e.message });
    }
  });
}
