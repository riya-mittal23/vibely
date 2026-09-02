import type { Genre, VibeContent } from '../types/index.js';
import { collegeGenre } from './genres/college.js';
import { everydayGenre } from './genres/everyday.js';
import { schoolGenre } from './genres/school.js';
import { workGenre } from './genres/work.js';
import { spicyGenre } from './genres/spicy.js';
import { entertainmentGenre } from './genres/entertainment.js';

class GenreManager {
  private genres: Map<string, Genre> = new Map();

  constructor() {
    this.registerGenre(collegeGenre);
    this.registerGenre(everydayGenre);
    this.registerGenre(schoolGenre);
    this.registerGenre(workGenre);
    this.registerGenre(spicyGenre);
    this.registerGenre(entertainmentGenre);
  }

  private registerGenre(genre: Genre) {
    this.genres.set(genre.id, genre);
  }

  public getAllGenres(): Genre[] {
    return Array.from(this.genres.values());
  }

  public getGenreById(id: string): Genre | undefined {
    return this.genres.get(id);
  }

  public getRandomVibesForLevel(genreId: string, levelNumber: 1 | 2 | 3 | 4 | 5, count: number, excludeIds: string[] = []): any[] {
    const genre = this.getGenreById(genreId);
    if (!genre) return [];

    let availableVibes = genre.levels[levelNumber] || [];
    availableVibes = availableVibes.filter((v: VibeContent) => !excludeIds.includes(v.id));

    // Shuffle and pick
    const shuffled = [...availableVibes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const genreManager = new GenreManager();
