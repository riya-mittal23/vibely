import { SPECTRUMS, type SpectrumDefinition } from '../../data/spectrums';

export function calculateTargetWidth(difficulty: string): number {
  switch (difficulty) {
    case 'casual': return 20;
    case 'normal': return 14;
    case 'chaotic': return 8;
    default: return 14;
  }
}

export function generateTarget(): number {
  // random between 10 and 90
  return Math.floor(Math.random() * 81) + 10;
}

export function calculateScore(targetPosition: number, guessPosition: number, targetWidth: number): { distance: number, score: number } {
  const distance = Math.abs(targetPosition - guessPosition);
  let score = 0;
  
  if (distance <= targetWidth * 0.1) score = 20;
  else if (distance <= targetWidth * 0.3) score = 15;
  else if (distance <= targetWidth * 0.5) score = 10;
  else score = 0;
  
  return { distance, score };
}

export function getGameRating(totalScore: number, totalRounds: number): string {
  const maxPossibleScore = totalRounds * 20;
  const percentage = (totalScore / maxPossibleScore) * 100;

  if (percentage <= 20) return "Bad";
  if (percentage <= 50) return "Good";
  if (percentage <= 60) return "Nice";
  if (percentage <= 80) return "Great";
  return "Excellent";
}

export function getRandomSpectrum(usedIds: string[]): SpectrumDefinition {
  const available = SPECTRUMS.filter(s => !usedIds.includes(s.id));
  if (available.length === 0) {
    // Reset if we used all of them
    return SPECTRUMS[Math.floor(Math.random() * SPECTRUMS.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}
