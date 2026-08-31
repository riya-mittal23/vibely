import { GameRoom } from './GameRoom.js';
import type { Player, RoundState } from '../types/index.js';
import { SPECTRUMS } from './spectrums.js';
import type { SpectrumDefinition } from './spectrums.js';

export class GameEngine {
  private room: GameRoom;

  constructor(room: GameRoom) {
    this.room = room;
  }

  public startGame(playerId: string): void {
    const state = this.room.getState();
    
    // Authorization
    if (state.hostPlayerId !== playerId) {
      throw new Error('NOT_HOST');
    }
    
    // Validation
    if (state.players.length < 2) {
      throw new Error('NOT_ENOUGH_PLAYERS');
    }
    
    if (state.status !== 'LOBBY') {
      throw new Error('INVALID_STATE');
    }

    // Setup teams if needed
    if (state.settings.mode === 'TEAM') {
      this.assignTeams();
    } else {
      // Free for all
      state.teams = [];
    }

    state.status = 'STARTING';
    state.roundNumber = 0;
    state.roundHistory = [];
    state.usedSpectrumIds = [];
    this.room.updateActivity();
    
    // We could add a delay here, but for now we transition immediately
    this.startRound();
  }

  public startRound(): void {
    const state = this.room.getState();
    
    state.roundNumber++;
    if (state.roundNumber > state.settings.rounds) {
      this.finishGame();
      return;
    }

    const spectrum = this.getRandomSpectrum();
    state.usedSpectrumIds.push(spectrum.id);
    
    const targetWidth = this.calculateTargetWidth(state.settings.vibe);
    const targetPosition = Math.floor(Math.random() * 81) + 10; // 10 to 90

    // Assign Roles
    const { clueGiverId, guessingTeamId, guessControllerId } = this.assignRoles();

    const roundState: RoundState = {
      number: state.roundNumber,
      spectrumId: spectrum.id,
      leftLabel: spectrum.leftLabel,
      rightLabel: spectrum.rightLabel,
      targetPosition,
      targetWidth,
      clue: null,
      clueGiverId,
      guessingTeamId,
      guessControllerId,
      guessPosition: 50,
      guessLocked: false,
      status: 'CLUE',
      startedAt: Date.now(),
      deadlineAt: null,
      roundScore: null
    };

    state.currentRound = roundState;
    state.status = 'PLAYING';
    this.room.updateActivity();
  }

  public submitClue(playerId: string, clue: string): void {
    const state = this.room.getState();
    const round = state.currentRound;

    if (!round || state.status !== 'PLAYING' || round.status !== 'CLUE') {
      throw new Error('INVALID_STATE');
    }

    if (round.clueGiverId !== playerId) {
      throw new Error('NOT_CLUE_GIVER');
    }

    const trimmedClue = clue.trim().substring(0, 120);
    if (!trimmedClue) {
      throw new Error('INVALID_CLUE');
    }

    round.clue = trimmedClue;
    round.status = 'GUESS';
    this.room.updateActivity();
  }

  public refreshSpectrum(playerId: string): void {
    const state = this.room.getState();
    const round = state.currentRound;

    if (!round || state.status !== 'PLAYING' || round.status !== 'CLUE') {
      throw new Error('INVALID_STATE');
    }

    if (round.clueGiverId !== playerId) {
      throw new Error('NOT_CLUE_GIVER');
    }

    const spectrum = this.getRandomSpectrum();
    state.usedSpectrumIds.push(spectrum.id);

    round.spectrumId = spectrum.id;
    round.leftLabel = spectrum.leftLabel;
    round.rightLabel = spectrum.rightLabel;
    round.targetPosition = Math.floor(Math.random() * 81) + 10;
    
    this.room.updateActivity();
  }

  public updateGuess(playerId: string, position: number): void {
    const state = this.room.getState();
    const round = state.currentRound;

    if (!round || state.status !== 'PLAYING' || round.status !== 'GUESS') {
      throw new Error('INVALID_STATE');
    }

    if (round.guessLocked) {
      throw new Error('ALREADY_LOCKED');
    }

    // In TEAM mode, only the guess controller can update
    if (state.settings.mode === 'TEAM') {
      if (round.guessControllerId !== playerId) {
        throw new Error('NOT_GUESS_CONTROLLER');
      }
    } else {
      // In Free For All, anyone except clue giver could update, but phase 2 spec prioritizes team mode.
      // We will assume team mode or handle free-for-all simplistically.
      if (round.clueGiverId === playerId) {
        throw new Error('NOT_GUESS_CONTROLLER');
      }
    }

    // Clamp
    round.guessPosition = Math.max(0, Math.min(100, position));
    this.room.updateActivity();
  }

  public lockGuess(playerId: string): void {
    const state = this.room.getState();
    const round = state.currentRound;

    if (!round || state.status !== 'PLAYING' || round.status !== 'GUESS') {
      throw new Error('INVALID_STATE');
    }

    if (round.guessLocked) {
      throw new Error('ALREADY_LOCKED');
    }

    if (state.settings.mode === 'TEAM' && round.guessControllerId !== playerId) {
      throw new Error('NOT_GUESS_CONTROLLER');
    }

    round.guessLocked = true;
    round.status = 'REVEAL';
    this.room.updateActivity();
    
    // Automatically reveal
    this.revealRound();
  }

  public revealRound(): void {
    const state = this.room.getState();
    const round = state.currentRound;

    if (!round || round.status !== 'REVEAL') return;

    // Calculate score based on Phase 2 rules
    const distance = Math.abs(round.targetPosition - (round.guessPosition || 50));
    let score = 0;
    
    if (distance <= round.targetWidth * 0.1) score = 20;
    else if (distance <= round.targetWidth * 0.3) score = 15;
    else if (distance <= round.targetWidth * 0.5) score = 10;
    else score = 0;

    round.roundScore = score;
    round.status = 'RESULT';
    
    // Update team score
    if (state.settings.mode === 'TEAM' && round.guessingTeamId) {
      const team = state.teams.find(t => t.id === round.guessingTeamId);
      if (team) {
        team.score += score;
      }
    } else {
      // Free for all - update guessing players? (Simplified for now)
      if (round.guessControllerId) {
        const player = state.players.find(p => p.id === round.guessControllerId);
        if (player) player.score += score;
      }
    }

    // Add to history
    state.roundHistory.push({
      roundNumber: round.number,
      spectrumId: round.spectrumId,
      clue: round.clue || '',
      targetPosition: round.targetPosition,
      guessPosition: round.guessPosition || 50,
      distance,
      score
    });

    state.status = 'ROUND_RESULT';
    this.room.updateActivity();
  }

  public nextRound(playerId: string): void {
    const state = this.room.getState();
    
    if (state.hostPlayerId !== playerId) {
      throw new Error('NOT_HOST');
    }
    
    if (state.status !== 'ROUND_RESULT') {
      throw new Error('INVALID_STATE');
    }
    
    this.startRound();
  }

  private finishGame(): void {
    const state = this.room.getState();
    state.status = 'GAME_OVER';
    state.currentRound = null;
    this.room.updateActivity();
  }

  public resetToLobby(): void {
    const state = this.room.getState();
    state.status = 'LOBBY';
    state.currentRound = null;
    state.roundNumber = 0;
    state.roundHistory = [];
    state.usedSpectrumIds = [];
    state.teams.forEach(t => t.score = 0);
    state.players.forEach(p => p.score = 0);
    this.room.updateActivity();
  }

  private assignTeams(): void {
    const state = this.room.getState();
    const players = [...state.players];
    
    // Shuffle players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j]!, players[i]!];
    }

    const mid = Math.ceil(players.length / 2);
    const teamAIds = players.slice(0, mid).map(p => p.id);
    const teamBIds = players.slice(mid).map(p => p.id);

    state.teams = [
      { id: 'TEAM_A', name: 'Team A', score: 0, playerIds: teamAIds },
      { id: 'TEAM_B', name: 'Team B', score: 0, playerIds: teamBIds }
    ];

    players.forEach(p => {
      p.teamId = teamAIds.includes(p.id) ? 'TEAM_A' : 'TEAM_B';
    });
  }

  private assignRoles(): { clueGiverId: string | null, guessingTeamId: string | null, guessControllerId: string | null } {
    const state = this.room.getState();
    if (state.settings.mode === 'TEAM' && state.teams.length >= 2) {
      // Alternate teams based on round number
      const clueGiverTeamIndex = (state.roundNumber - 1) % 2;
      const clueGiverTeam = state.teams[clueGiverTeamIndex];
      const guessingTeam = state.teams[clueGiverTeamIndex === 0 ? 1 : 0];

      if (!clueGiverTeam || !guessingTeam) {
        throw new Error('Teams not properly initialized');
      }
      
      // Rotate players within team
      const clueGiverIdx = Math.floor((state.roundNumber - 1) / 2) % clueGiverTeam.playerIds.length;
      const clueGiverId = clueGiverTeam.playerIds[clueGiverIdx];
      
      const guessControllerIdx = Math.floor((state.roundNumber - 1) / 2) % guessingTeam.playerIds.length;
      const guessControllerId = guessingTeam.playerIds[guessControllerIdx];

      return { 
        clueGiverId: clueGiverId ?? null, 
        guessingTeamId: guessingTeam.id ?? null, 
        guessControllerId: guessControllerId ?? null 
      };
    } else {
      // Free for all rotation
      const clueGiverId = state.players[(state.roundNumber - 1) % state.players.length]!.id;
      // In Free For All, guessControllerId could be the player guessing.
      // But actually all other players guess independently. 
      // We'll leave guessingTeamId and guessControllerId null.
      return { clueGiverId, guessingTeamId: null, guessControllerId: null };
    }
  }

  private calculateTargetWidth(vibe: string): number {
    switch (vibe) {
      case 'CASUAL': return 20;
      case 'NORMAL': return 14;
      case 'CHAOTIC': return 8;
      default: return 14;
    }
  }

  private getRandomSpectrum(): SpectrumDefinition {
    const state = this.room.getState();
    const available = SPECTRUMS.filter(s => !state.usedSpectrumIds.includes(s.id));
    if (available.length === 0) {
      // Reset if we used all of them
      return SPECTRUMS[Math.floor(Math.random() * SPECTRUMS.length)]!;
    }
    return available[Math.floor(Math.random() * available.length)]!;
  }
}
