import type { GameRoomState, Player, RoomSettings, RoomStatus, Team, RoundHistoryItem, RoundState } from '../types/index.js';
import { GameEngine } from './GameEngine.js';

export class GameRoom {
  private state: GameRoomState;
  private engine: GameEngine;

  constructor(id: string, code: string, hostPlayer: Player, settings: RoomSettings) {
    this.state = {
      id,
      code,
      hostPlayerId: hostPlayer.id,
      status: 'LOBBY',
      settings,
      players: [hostPlayer],
      teams: [],
      currentRound: null,
      roundNumber: 0,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      roundHistory: [],
      usedSpectrumIds: []
    };
    
    this.engine = new GameEngine(this);
    this.updateActivity();
  }

  public getState(): GameRoomState {
    return this.state;
  }

  public getEngine(): GameEngine {
    return this.engine;
  }

  public updateActivity(): void {
    this.state.lastActivityAt = Date.now();
  }

  public addPlayer(player: Player): void {
    if (!this.state.players.find(p => p.id === player.id)) {
      this.state.players.push(player);
    }
    this.updateActivity();
  }

  public removePlayer(playerId: string): void {
    this.state.players = this.state.players.filter(p => p.id !== playerId);
    this.updateActivity();
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.state.players.find(p => p.id === playerId);
  }
}
