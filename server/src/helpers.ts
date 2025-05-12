// Fisher-Yates shuffle algorithm
export function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Generate a random game code
export function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}