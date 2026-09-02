import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../types/index.js';

import { registerRoomHandlers } from './roomHandlers.js';
import { registerLobbyHandlers } from './lobbyHandlers.js';
import { registerGameHandlers } from './gameHandlers.js';
import { gameManager } from '../game/GameManager.js';

export let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function setupSocketIO(server: http.Server) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://vibelyr.vercel.app'
  ];

  if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
    allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerLobbyHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (socket.data.roomId && socket.data.playerId) {
        const room = gameManager.getRoom(socket.data.roomId);
        if (room) {
          const player = room.getPlayer(socket.data.playerId);
          if (player) {
            player.connected = false;
            player.lastSeenAt = Date.now();
            
            // Broadcast state so others see the disconnect icon
            import('./state.js').then(({ serializeGameStateForPlayer }) => {
              const state = room.getState();
              state.players.forEach((p: any) => {
                if (p.connected && p.socketId) {
                  io.to(p.socketId).emit('lobby:updated', serializeGameStateForPlayer(state, p.id));
                  io.to(p.socketId).emit('game:state', serializeGameStateForPlayer(state, p.id));
                }
              });
            });
            
            // If host disconnected, maybe assign a new host if anyone else is connected
            if (player.isHost) {
              const state = room.getState();
              const nextHost = state.players.find(p => p.connected && p.id !== player.id);
              if (nextHost) {
                player.isHost = false;
                nextHost.isHost = true;
                state.hostPlayerId = nextHost.id;
                io.to(state.id).emit('player:hostChanged', nextHost.id);
              }
            }
          }
        }
      }
    });
  });

  console.log('Socket.IO initialized');
}
