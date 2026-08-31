export type RoomStatus = 'LOBBY' | 'STARTING' | 'PLAYING' | 'ROUND_RESULT' | 'GAME_OVER';
export type GameMode = 'TEAM' | 'FREE_FOR_ALL';
export type Vibe = 'CASUAL' | 'NORMAL' | 'CHAOTIC';

export interface RoomSettings {
  rounds: number;
  mode: GameMode;
  vibe: Vibe;
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
}
