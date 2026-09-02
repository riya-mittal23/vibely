import type { LevelConfig } from '../types/multiplayer';

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    levelNumber: 1,
    difficulty: 'EASY',
    passScore: 500,
    targetWidth: 20,
    timeLimit: 30,
    modifiers: []
  },
  2: {
    levelNumber: 2,
    difficulty: 'MEDIUM',
    passScore: 550,
    targetWidth: 16,
    timeLimit: 25,
    modifiers: ['TIGHT_TARGET']
  },
  3: {
    levelNumber: 3,
    difficulty: 'HARD',
    passScore: 600,
    targetWidth: 13,
    timeLimit: 20,
    modifiers: ['THREE_WORD_CLUE']
  },
  4: {
    levelNumber: 4,
    difficulty: 'VERY_HARD',
    passScore: 650,
    targetWidth: 10,
    timeLimit: 15,
    modifiers: ['THREE_WORD_CLUE', 'TIME_PRESSURE']
  },
  5: {
    levelNumber: 5,
    difficulty: 'MASTER',
    passScore: 700,
    targetWidth: 7,
    timeLimit: 12,
    modifiers: ['THREE_WORD_CLUE', 'TIME_PRESSURE']
  }
};
