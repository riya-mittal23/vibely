import type { GameRoomState, Player, RoomSettings } from '../types/index.js';
import { GameRoom } from './GameRoom.js';

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();

  constructor() { }

  public createRoom(hostPlayer: Player, settings: RoomSettings): GameRoom {
    const roomCode = this.generateRoomCode();
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newRoom = new GameRoom(roomId, roomCode, hostPlayer, settings);
    this.rooms.set(roomId, newRoom);

    return newRoom;
  }

  public getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  public findRoomByCode(code: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.getState().code.toUpperCase() === code.toUpperCase()) {
        return room;
      }
    }
    return undefined;
  }

  public deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like O,0,I,1
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.findRoomByCode(code)); // Ensure uniqueness

    return code;
  }
}

// Export a singleton instance for now (in-memory fallback)
export const gameManager = new GameManager();
