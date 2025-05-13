export const SUITS = {
    DIAMONDS: "♦",
    HEARTS: "♥",
    SPADES: "♠",
    CLUBS: "♣",
  };
  
  export interface Card {
    suit: "♠" | "♥" | "♣" | "♦";
    rank: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"
  }
  
  export type HandType = "single" | "pair" | "triple" | "quad" | "run" | "none";
  
  export interface PlayedHand {
    type: HandType;
    cards: Card[];
    playerId: string;
  }