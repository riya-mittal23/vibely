import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../types/index.js';

import { registerRoomHandlers } from './roomHandlers.js';
import { registerLobbyHandlers } from './lobbyHandlers.js';
import { registerGameHandlers } from './gameHandlers.js';
import { gameManager } from '../game/GameManager.js';

export let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function setupSocketIO(server: http.Server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://vibelyr.vercel.app'
      ],
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
      // The room:leave handler logic is explicitly triggered by the client,
      // but if they disconnect abruptly, we could handle it here or rely on the grace period logic described in Phase 2.
      // For now we'll just log. Real implementation would mark `connected = false` and set a timeout to remove them.
    });
  });

  console.log('Socket.IO initialized');
}
