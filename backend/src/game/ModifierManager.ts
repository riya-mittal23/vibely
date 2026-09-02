import type { ModifierType } from '../types/index.js';

export class ModifierManager {
  
  public getModifierDescription(modifier: ModifierType): string {
    switch (modifier) {
      case 'TIGHT_TARGET': return 'Tighter Target Width';
      case 'THREE_WORD_CLUE': return 'Maximum 3 Words in Clue';
      case 'TIME_PRESSURE': return 'Less Time to Guess';
      case 'CAMPUS_BAN': return 'Cannot use words: college, class, professor';
      case 'CORPORATE_BAN': return 'Cannot use words: meeting, boss, office';
      case 'ACTOR_BAN': return 'Cannot mention actor names';
      case 'COLOR_BAN': return 'Cannot mention colors';
      default: return 'Unknown Modifier';
    }
  }

  public validateClue(clue: string, modifiers: ModifierType[]): { valid: boolean; reason?: string } {
    const words = clue.trim().split(/\s+/);
    
    if (modifiers.includes('THREE_WORD_CLUE') && words.length > 3) {
      return { valid: false, reason: 'Clue must be 3 words or less.' };
    }

    if (modifiers.includes('CAMPUS_BAN')) {
      const banned = ['college', 'class', 'professor'];
      if (words.some(w => banned.includes(w.toLowerCase()))) {
        return { valid: false, reason: 'Contains banned campus words.' };
      }
    }

    if (modifiers.includes('CORPORATE_BAN')) {
      const banned = ['meeting', 'boss', 'office'];
      if (words.some(w => banned.includes(w.toLowerCase()))) {
        return { valid: false, reason: 'Contains banned corporate words.' };
      }
    }

    // Add more validation logic for other bans here...
    return { valid: true };
  }
}

export const modifierManager = new ModifierManager();
