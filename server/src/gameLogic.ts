import { PlayedHand } from "@shared/types";
import { compareHands } from "@shared/gameLogic";


// Get the next player's turn
export function getNextPlayer(
  currentPlayerId: string,
  players: { id: string }[]
): string {
  const currentIndex = players.findIndex((p) => p.id === currentPlayerId);
  return players[(currentIndex + 1) % players.length].id;
}

// Check if a trick is complete (everyone has played or passed)
export function isTrickComplete(
  currentTrick: PlayedHand[],
  players: { id: string }[]
): boolean {
  return currentTrick.length === players.length;
}

// Find the winning hand in a trick
export function findWinningHand(trick: PlayedHand[]): PlayedHand {
  return trick.reduce((winning, current) => {
    if (current.type === "none") return winning;
    if (winning.type === "none") return current;
    return compareHands(current, winning) > 0 ? current : winning;
  });
}
