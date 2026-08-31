import { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, Player } from '../types/index.js';
import { gameManager } from '../game/GameManager.js';
import { serializeGameStateForPlayer } from './state.js';

export function registerRoomHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, 
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  socket.on('room:create', (data) => {
    try {
      const { name, settings } = data;
      const playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
      
      const hostPlayer: Player = {
        id: playerId,
        sessionId: socket.id,
        socketId: socket.id,
        name: name.trim().substring(0, 20),
        avatar: 'circle',
        teamId: null,
        connected: true,
        isHost: true,
        score: 0,
        joinedAt: Date.now(),
        lastSeenAt: Date.now()
      };

      const room = gameManager.createRoom(hostPlayer, settings);
      
      socket.data.playerId = playerId;
      socket.data.roomId = room.getState().id;
      socket.data.sessionId = socket.id;

      socket.join(room.getState().id);
      
      socket.emit('room:created', serializeGameStateForPlayer(room.getState(), playerId), playerId);
    } catch (e: any) {
      socket.emit('error', { code: 'CREATE_ERROR', message: e.message });
    }
  });

  socket.on('room:join', (data) => {
    try {
      const { name, code } = data;
      const room = gameManager.findRoomByCode(code);

      if (!room) {
        return socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'This room does not exist.' });
      }

      const state = room.getState();
      if (state.players.length >= 8) {
        return socket.emit('error', { code: 'ROOM_FULL', message: 'This room is full.' });
      }

      if (state.status !== 'LOBBY') {
        return socket.emit('error', { code: 'GAME_STARTED', message: 'Game has already started.' });
      }

      const playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
      const newPlayer: Player = {
        id: playerId,
        sessionId: socket.id,
        socketId: socket.id,
        name: name.trim().substring(0, 20),
        avatar: 'circle',
        teamId: null,
        connected: true,
        isHost: false,
        score: 0,
        joinedAt: Date.now(),
        lastSeenAt: Date.now()
      };

      room.addPlayer(newPlayer);
      
      socket.data.playerId = playerId;
      socket.data.roomId = room.getState().id;
      socket.data.sessionId = socket.id;

      socket.join(room.getState().id);
      
      socket.emit('room:joined', serializeGameStateForPlayer(room.getState(), playerId), playerId);
      
      // Broadcast to others
      socket.to(room.getState().id).emit('player:joined', newPlayer);
      socket.to(room.getState().id).emit('lobby:updated', serializeGameStateForPlayer(room.getState(), 'SERVER')); // Safe payload for lobby
    } catch (e: any) {
      socket.emit('error', { code: 'JOIN_ERROR', message: e.message });
    }
  });

  socket.on('room:rejoin', (data) => {
    try {
      const { code, playerId } = data;
      const room = gameManager.findRoomByCode(code);
      if (!room) {
        return socket.emit('room:rejoinFailed', { message: 'Room not found' });
      }

      const player = room.getPlayer(playerId);
      if (!player) {
        return socket.emit('room:rejoinFailed', { message: 'Player not found in room' });
      }

      // Update socket bindings
      player.socketId = socket.id;
      player.sessionId = socket.id;
      player.connected = true;
      player.lastSeenAt = Date.now();

      socket.data.playerId = playerId;
      socket.data.roomId = room.getState().id;
      socket.data.sessionId = socket.id;

      socket.join(room.getState().id);
      
      socket.emit('room:joined', serializeGameStateForPlayer(room.getState(), playerId), playerId);
    } catch (e: any) {
      socket.emit('room:rejoinFailed', { message: e.message });
    }
  });

  socket.on('room:leave', () => {
    // Handled similarly to disconnect
    if (socket.data.roomId && socket.data.playerId) {
      const room = gameManager.getRoom(socket.data.roomId);
      if (room) {
        room.removePlayer(socket.data.playerId);
        socket.to(room.getState().id).emit('player:left', socket.data.playerId);
        socket.leave(room.getState().id);
        
        if (room.getState().players.length === 0) {
          gameManager.deleteRoom(room.getState().id);
        } else if (room.getState().hostPlayerId === socket.data.playerId) {
          // Transfer host
          const nextHost = room.getState().players[0]!;
          nextHost.isHost = true;
          room.getState().hostPlayerId = nextHost.id;
          io.to(room.getState().id).emit('player:hostChanged', nextHost.id);
        }
      }
    }
  });
}
