export type RoomStatus =
  | 'LOBBY'
  | 'STARTING'
  | 'LEVEL_INTRO'
  | 'PLAYING'
  | 'ROUND_RESULT'
  | 'LEVEL_RESULT'
  | 'GAME_OVER';
export type GameMode = 'TEAM' | 'FREE_FOR_ALL';
export type Vibe = 'CASUAL' | 'NORMAL' | 'CHAOTIC';

export interface RoomSettings {
  mode: GameMode;
  genreId: string | null;
}

export type ModifierType = 'TIGHT_TARGET' | 'THREE_WORD_CLUE' | 'TIME_PRESSURE' | 'CAMPUS_BAN' | 'CORPORATE_BAN' | 'ACTOR_BAN' | 'COLOR_BAN';

export interface LevelConfig {
  levelNumber: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD' | 'MASTER';
  passScore: number;
  targetWidth: number;
  timeLimit: number;
  modifiers: ModifierType[];
}

export interface VibeContent {
  id: string;
  leftLabel: string;
  rightLabel: string;
  difficulty: number;
}

export interface Genre {
  id: string;
  name: string;
  description: string;
  icon: string;
  levels: {
    1: VibeContent[];
    2: VibeContent[];
    3: VibeContent[];
    4: VibeContent[];
    5: VibeContent[];
  };
}

export interface Player {
  id: string;
  sessionId: string;
  socketId: string | null;
  name: string;
  avatar: string;
  teamId: string | null;
  connected: boolean;
  isHost: boolean;
  score: number;
  joinedAt: number;
  lastSeenAt: number;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  playerIds: string[];
}

export type RoundStatus = 'INTRO' | 'CLUE' | 'GUESS' | 'REVEAL' | 'RESULT';

export interface RoundHistoryItem {
  roundNumber: number;
  spectrumId: string;
  clue: string;
  targetPosition: number;
  guessPosition: number;
  distance: number;
  score: number;
}

export interface ClientRoundState {
  number: number;
  spectrumId: string;
  leftLabel: string;
  rightLabel: string;
  targetPosition?: number;
  targetWidth?: number;
  clue: string | null;
  clueGiverId: string | null;
  guessingTeamId: string | null;
  guessControllerId: string | null;
  guessPosition: number | null;
  guessLocked: boolean;
  status: RoundStatus;
  startedAt: number;
  deadlineAt: number | null;
  roundScore: number | null;
}

export interface ClientGameState {
  id: string;
  code: string;
  hostPlayerId: string;
  status: RoomStatus;
  settings: RoomSettings;
  players: Player[];
  teams: Team[];
  currentRound: ClientRoundState | null;
  roundNumber: number;
  roundHistory: RoundHistoryItem[];
  run: GameRun | null;
}

export interface GameRun {
  runId: string;
  genreId: string;
  currentLevel: number;
  highestLevelReached: number;
  lives: number;
  status: 'ACTIVE' | 'FAILED' | 'COMPLETED' | 'TEAM_LEFT';
  totalScore: number;
  levels: LevelResult[];
}

export interface LevelResult {
  levelNumber: number;
  score: number;
  requiredScore: number;
  status: 'CLEARED' | 'FAILED';
  vibesAnswered: number;
  perfectVibes: number;
  stars: number;
  startedAt: number;
  completedAt: number;
}
