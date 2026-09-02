import { GameRoom } from './GameRoom.js';
import type { Player, RoundState, LevelResult } from '../types/index.js';
import { genreManager } from '../content/GenreManager.js';
import { levelManager } from './LevelManager.js';

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
    if (state.players.length < 2) { // 4 is required per phase 2 spec but let's keep 2 for testing or adjust later
      throw new Error('NOT_ENOUGH_PLAYERS');
    }

    if (state.status !== 'LOBBY') {
      throw new Error('INVALID_STATE');
    }

    // Setup teams if needed
    if (state.settings.mode === 'TEAM') {
      this.assignTeams();
    } else {
      state.teams = [];
    }

    // Initialize the GameRun
    state.run = {
      runId: Math.random().toString(36).substring(2, 9),
      genreId: state.settings.genreId || 'everyday',
      currentLevel: 1,
      highestLevelReached: 1,
      lives: 10,
      status: 'ACTIVE',
      totalScore: 0,
      levels: []
    };

    state.status = 'STARTING';
    state.roundNumber = 0; // Means vibe index across the whole run if needed
    state.roundHistory = [];
    state.usedSpectrumIds = [];
    this.room.updateActivity();

    this.startLevel();
  }

  private startLevel(): void {
    const state = this.room.getState();
    if (!state.run) throw new Error('NO_ACTIVE_RUN');

    const config = levelManager.getLevelConfig(state.run.currentLevel);
    if (!config) {
      this.finishGame();
      return;
    }

    // We get 10 random vibes for this level
    const vibes = genreManager.getRandomVibesForLevel(state.run.genreId, state.run.currentLevel as 1 | 2 | 3 | 4 | 5, 10, state.usedSpectrumIds);
    if (vibes.length === 0) {
      // Fallback if no content
      this.finishGame();
      return;
    }

    // Initialize LevelResult
    state.run.levels.push({
      levelNumber: state.run.currentLevel,
      score: 0,
      requiredScore: config.passScore,
      status: 'CLEARED', // temp
      vibesAnswered: 0,
      perfectVibes: 0,
      stars: 0,
      startedAt: Date.now(),
      completedAt: 0
    });

    state.status = 'LEVEL_INTRO';
    state.currentRound = null;
    this.room.updateActivity();
  }

  public startRound(): void {
    const state = this.room.getState();
    if (!state.run) throw new Error('NO_ACTIVE_RUN');

    state.roundNumber++; // Global vibe counter

    // Calculate current vibe in level (1 to 10)
    // Actually we can just check if we have reached 10 vibes in the current level result
    let currentLevelResult = state.run.levels[state.run.levels.length - 1];
    if (!currentLevelResult) {
      throw new Error('NO_LEVEL_RESULT');
    }

    if (currentLevelResult.vibesAnswered >= 10) {
      // Level is finished, handled in nextRound typically, but if we get here something is wrong
      throw new Error('LEVEL_ALREADY_FINISHED');
    }

    const config = levelManager.getLevelConfig(state.run.currentLevel);
    if (!config) throw new Error('MISSING_LEVEL_CONFIG');

    const vibeContent = genreManager.getRandomVibesForLevel(state.run.genreId, state.run.currentLevel as 1 | 2 | 3 | 4 | 5, 1, state.usedSpectrumIds)[0];
    if (!vibeContent) throw new Error('NOT_ENOUGH_VIBES');

    state.usedSpectrumIds.push(vibeContent.id);

    const targetPosition = Math.floor(Math.random() * 81) + 10;

    const { clueGiverId, guessingTeamId, guessControllerId } = this.assignRoles();

    const roundState: RoundState = {
      number: state.roundNumber,
      spectrumId: vibeContent.id,
      leftLabel: vibeContent.leftLabel,
      rightLabel: vibeContent.rightLabel,
      targetPosition,
      targetWidth: config.targetWidth,
      clue: null,
      clueGiverId,
      guessingTeamId,
      guessControllerId,
      guessPosition: 50,
      guessLocked: false,
      status: 'CLUE',
      startedAt: Date.now(),
      deadlineAt: null, // Timer only starts during GUESS phase
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

    // Modifiers validation
    if (state.run) {
      const config = levelManager.getLevelConfig(state.run.currentLevel);
      // In phase 2 we'd use ModifierManager to validate here
      if (config && config.modifiers.includes('THREE_WORD_CLUE')) {
        if (trimmedClue.split(/\s+/).length > 3) {
          throw new Error('CLUE_TOO_LONG');
        }
      }
    }

    // Set deadline for the guess phase
    if (state.run) {
      const config = levelManager.getLevelConfig(state.run.currentLevel);
      round.deadlineAt = config && config.timeLimit ? Date.now() + (config.timeLimit * 1000) : null;
    }

    round.clue = trimmedClue;
    round.status = 'GUESS';
    this.room.updateActivity();
  }

  public refreshSpectrum(playerId: string): void {
    const state = this.room.getState();
    const round = state.currentRound;
    if (!round || state.status !== 'PLAYING' || round.status !== 'CLUE') throw new Error('INVALID_STATE');
    if (round.clueGiverId !== playerId) throw new Error('NOT_CLUE_GIVER');
    if (!state.run) throw new Error('NO_RUN');

    const vibeContent = genreManager.getRandomVibesForLevel(state.run.genreId, state.run.currentLevel as 1 | 2 | 3 | 4 | 5, 1, state.usedSpectrumIds)[0];
    if (vibeContent) {
      state.usedSpectrumIds.push(vibeContent.id);
      round.spectrumId = vibeContent.id;
      round.leftLabel = vibeContent.leftLabel;
      round.rightLabel = vibeContent.rightLabel;
      round.targetPosition = Math.floor(Math.random() * 81) + 10;
    }
    this.room.updateActivity();
  }

  public updateGuess(playerId: string, position: number): void {
    const state = this.room.getState();
    const round = state.currentRound;
    if (!round || state.status !== 'PLAYING' || round.status !== 'GUESS') throw new Error('INVALID_STATE');
    if (round.guessLocked) throw new Error('ALREADY_LOCKED');

    if (state.settings.mode === 'TEAM') {
      if (round.guessControllerId !== playerId) throw new Error('NOT_GUESS_CONTROLLER');
    } else {
      if (round.clueGiverId === playerId) throw new Error('NOT_GUESS_CONTROLLER');
    }

    round.guessPosition = Math.max(0, Math.min(100, position));
    this.room.updateActivity();
  }

  public lockGuess(playerId: string): void {
    const state = this.room.getState();
    const round = state.currentRound;
    if (!round || state.status !== 'PLAYING' || round.status !== 'GUESS') throw new Error('INVALID_STATE');
    if (round.guessLocked) throw new Error('ALREADY_LOCKED');
    if (state.settings.mode === 'TEAM' && round.guessControllerId !== playerId) throw new Error('NOT_GUESS_CONTROLLER');

    round.guessLocked = true;
    round.status = 'REVEAL';
    this.room.updateActivity();
    this.revealRound();
  }

  public revealRound(): void {
    const state = this.room.getState();
    const round = state.currentRound;
    if (!round || round.status !== 'REVEAL') return;
    if (!state.run) return;

    const distance = Math.abs(round.targetPosition - (round.guessPosition || 50));
    let score = 0;

    const targetWidth = round.targetWidth || 14;

    // New scoring logic based on physical bands in the spectrum (0.1, 0.3, 0.5 of targetWidth)
    if (distance <= targetWidth * 0.1) score = 100;
    else if (distance <= targetWidth * 0.3) score = 75;
    else if (distance <= targetWidth * 0.5) score = 50;
    else score = 0;

    round.roundScore = score;
    round.status = 'RESULT';

    // Update Run state
    const currentLevelResult = state.run.levels[state.run.levels.length - 1];
    if (currentLevelResult) {
      currentLevelResult.score += score;
      currentLevelResult.vibesAnswered += 1;
      if (score === 100) currentLevelResult.perfectVibes += 1;
    }
    state.run.totalScore += score;

    // Update team score
    if (state.settings.mode === 'TEAM' && round.guessingTeamId) {
      const team = state.teams.find(t => t.id === round.guessingTeamId);
      if (team) {
        team.score += score;
      }
    }

    state.roundHistory.push({
      roundNumber: round.number,
      spectrumId: round.spectrumId,
      clue: round.clue || '',
      targetPosition: round.targetPosition,
      guessPosition: round.guessPosition || 50,
      distance,
      score
    });

    if (currentLevelResult && currentLevelResult.vibesAnswered >= 10) {
      currentLevelResult.completedAt = Date.now();
      currentLevelResult.stars = levelManager.calculateStars(currentLevelResult.score);
      if (currentLevelResult.score >= currentLevelResult.requiredScore) {
        currentLevelResult.status = 'CLEARED';
      } else {
        currentLevelResult.status = 'FAILED';
        state.run.lives -= 1;
        if (state.run.lives <= 0) {
          state.run.status = 'FAILED';
        }
      }
      state.status = 'LEVEL_RESULT';
    } else {
      state.status = 'ROUND_RESULT';
    }

    this.room.updateActivity();
  }

  public nextRound(playerId: string): void {
    const state = this.room.getState();
    if (state.hostPlayerId !== playerId) throw new Error('NOT_HOST');
    if (state.status !== 'ROUND_RESULT' && state.status !== 'LEVEL_INTRO' && state.status !== 'LEVEL_RESULT') throw new Error('INVALID_STATE');
    if (!state.run) throw new Error('NO_RUN');

    if (state.status === 'LEVEL_INTRO') {
      this.startRound();
      return;
    }

    if (state.status === 'LEVEL_RESULT') {
      if (state.run.status === 'FAILED') {
        this.finishGame();
      } else if (state.run.currentLevel === 5 && state.run.levels[state.run.levels.length - 1]?.status === 'CLEARED') {
        state.run.status = 'COMPLETED';
        this.finishGame();
      } else {
        const lastResult = state.run.levels[state.run.levels.length - 1];
        if (lastResult?.status === 'CLEARED') {
          state.run.currentLevel++;
          state.run.highestLevelReached = state.run.currentLevel;
        }
        // If FAILED but game is not FAILED, we just call startLevel again for the same level (retry)
        this.startLevel();
      }
      return;
    }

    // Next vibe
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
    state.run = null;
    state.teams.forEach(t => t.score = 0);
    state.players.forEach(p => p.score = 0);
    this.room.updateActivity();
  }

  private assignTeams(): void {
    const state = this.room.getState();
    const players = [...state.players];

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
      const clueGiverTeamIndex = (state.roundNumber - 1) % 2;
      const clueGiverTeam = state.teams[clueGiverTeamIndex];
      const guessingTeam = state.teams[clueGiverTeamIndex === 0 ? 1 : 0];

      if (!clueGiverTeam || !guessingTeam) {
        throw new Error('Teams not properly initialized');
      }

      const activeClueGivers = clueGiverTeam.playerIds.filter(id => state.players.find(p => p.id === id)?.connected);
      const finalClueGivers = activeClueGivers.length > 0 ? activeClueGivers : clueGiverTeam.playerIds;
      const clueGiverIdx = Math.floor((state.roundNumber - 1) / 2) % finalClueGivers.length;
      const clueGiverId = finalClueGivers[clueGiverIdx];

      const activeGuessers = guessingTeam.playerIds.filter(id => state.players.find(p => p.id === id)?.connected);
      const finalGuessers = activeGuessers.length > 0 ? activeGuessers : guessingTeam.playerIds;
      const guessControllerIdx = Math.floor((state.roundNumber - 1) / 2) % finalGuessers.length;
      const guessControllerId = finalGuessers[guessControllerIdx];

      return {
        clueGiverId: clueGiverId ?? null,
        guessingTeamId: guessingTeam.id ?? null,
        guessControllerId: guessControllerId ?? null
      };
    } else {
      const activePlayers = state.players.filter(p => p.connected);
      const finalPlayers = activePlayers.length > 0 ? activePlayers : state.players;
      const clueGiverId = finalPlayers[(state.roundNumber - 1) % finalPlayers.length]!.id;
      return { clueGiverId, guessingTeamId: null, guessControllerId: null };
    }
  }
}
