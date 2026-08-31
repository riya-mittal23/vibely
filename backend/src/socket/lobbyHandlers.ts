import { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../types/index.js';
import { gameManager } from '../game/GameManager.js';
import { serializeGameStateForPlayer } from './state.js';

export function registerLobbyHandlers(
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
      io.to(p.socketId).emit('lobby:updated', serializeGameStateForPlayer(state, p.id));
    });
  };

  socket.on('lobby:updateSettings', (settings) => {
    try {
      const { room, playerId } = getRoomContext();
      if (room.getState().hostPlayerId !== playerId) throw new Error('NOT_HOST');
      
      room.getState().settings = { ...room.getState().settings, ...settings };
      broadcastState(room);
    } catch (e: any) {
      socket.emit('error', { code: 'LOBBY_ERROR', message: e.message });
    }
  });

  socket.on('lobby:changeTeam', (teamId) => {
    try {
      const { room, playerId } = getRoomContext();
      if (room.getState().status !== 'LOBBY') throw new Error('INVALID_STATE');
      
      const player = room.getPlayer(playerId);
      if (player) {
        player.teamId = teamId;
        broadcastState(room);
      }
    } catch (e: any) {
      socket.emit('error', { code: 'LOBBY_ERROR', message: e.message });
    }
  });

  socket.on('lobby:startGame', () => {
    try {
      const { room, playerId } = getRoomContext();
      room.getEngine().startGame(playerId);
      
      io.to(room.getState().id).emit('game:started');
      
      const state = room.getState();
      state.players.forEach((p: any) => {
        io.to(p.socketId).emit('game:roundStarted', serializeGameStateForPlayer(state, p.id));
        io.to(p.socketId).emit('game:state', serializeGameStateForPlayer(state, p.id));
      });
    } catch (e: any) {
      socket.emit('error', { code: 'LOBBY_ERROR', message: e.message });
    }
  });
}
