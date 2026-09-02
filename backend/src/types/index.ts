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

export interface RoundState {
  number: number;
  spectrumId: string;
  leftLabel: string;
  rightLabel: string;
  targetPosition: number;
  targetWidth: number;
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

export interface GameRoomState {
  id: string;
  code: string;
  hostPlayerId: string;
  status: RoomStatus;
  settings: RoomSettings;
  players: Player[];
  teams: Team[];
  currentRound: RoundState | null;
  roundNumber: number;
  createdAt: number;
  lastActivityAt: number;
  roundHistory: RoundHistoryItem[];
  usedSpectrumIds: string[];
  run: GameRun | null;
}

export interface RoundHistoryItem {
  roundNumber: number;
  spectrumId: string;
  clue: string;
  targetPosition: number;
  guessPosition: number;
  distance: number;
  score: number;
}

// Client-safe state (never contains targetPosition/Width for guessers during round)
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

// Socket IO Events
export interface ServerToClientEvents {
  'room:created': (state: ClientGameState, playerId: string) => void;
  'room:joined': (state: ClientGameState, playerId: string) => void;
  'room:rejoinFailed': (payload: { message: string }) => void;
  'room:updated': (state: ClientGameState) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'player:disconnected': (playerId: string) => void;
  'player:reconnected': (player: Player) => void;
  'player:hostChanged': (playerId: string) => void;
  'lobby:updated': (state: ClientGameState) => void;
  'game:started': () => void;
  'game:roundStarted': (state: ClientGameState) => void;
  'game:state': (state: ClientGameState) => void;
  'game:clueSubmitted': (clue: string) => void;
  'game:guessUpdated': (position: number) => void;
  'game:guessLocked': () => void;
  'game:revealed': (payload: any) => void;
  'game:roundResult': (state: ClientGameState) => void;
  'game:gameOver': (state: ClientGameState) => void;
  'error': (err: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: { name: string; settings: RoomSettings }) => void;
  'room:join': (data: { name: string; code: string; sessionId?: string }) => void;
  'room:rejoin': (data: { code: string; playerId: string }) => void;
  'room:leave': () => void;
  'lobby:updateSettings': (settings: Partial<RoomSettings>) => void;
  'lobby:changeTeam': (teamId: string) => void;
  'lobby:startGame': () => void;
  'game:submitClue': (data: { clue: string }) => void;
  'game:updateGuess': (data: { position: number }) => void;
  'game:lockGuess': () => void;
  'game:nextRound': () => void;
  'game:playAgain': () => void;
  'game:refreshSpectrum': () => void;
}

export interface InterServerEvents {
  // Empty for now, used for server-to-server communication in socket.io
}

export interface SocketData {
  playerId: string;
  sessionId: string;
  roomId: string;
}
