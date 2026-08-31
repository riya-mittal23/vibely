import type { SpectrumDefinition } from '../../data/spectrums';

export type GameMode = 'solo' | 'pass_and_play';
export type GameStatus = 'setup' | 'clue' | 'pass_to_guess' | 'guess' | 'reveal' | 'result' | 'game_over';

export interface RoundHistory {
  roundNumber: number;
  spectrum: SpectrumDefinition;
  clue: string;
  targetPosition: number;
  guessPosition: number;
  distance: number;
  score: number;
}

export interface GameState {
  status: GameStatus;
  roundNumber: number;
  totalRounds: number;
  spectrum: SpectrumDefinition | null;
  targetPosition: number;
  targetWidth: number;
  clue: string;
  guessPosition: number;
  score: number;
  roundScore: number;
  history: RoundHistory[];
  mode: GameMode;
  usedSpectrumIds: string[];
}
