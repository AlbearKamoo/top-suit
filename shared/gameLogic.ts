import { Card, HandType, PlayedHand, SUITS } from "./types";

const SUIT_HIERARCHY: Record<string, string[]> = {
    [SUITS.DIAMONDS]: [],
    [SUITS.HEARTS]: [SUITS.CLUBS, SUITS.DIAMONDS],
    [SUITS.SPADES]: [SUITS.HEARTS, SUITS.DIAMONDS],
    [SUITS.CLUBS]: [SUITS.SPADES, SUITS.DIAMONDS],
  } as const;
  
  const RANK_VALUES = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  } as const;
  
  // Check if cards form a valid run (sequential cards of the same suit)
  export function isRun(cards: Card[]): boolean {
    if (cards.length < 3) return false;
  
    // Check same suit
    const suit = cards[0].suit;
    if (!cards.every((card) => card.suit === suit)) return false;
  
    // Sort by rank and check sequence
    const sortedCards = [...cards].sort(
      (a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]
    );
    for (let i = 1; i < sortedCards.length; i++) {
      if (
        RANK_VALUES[sortedCards[i].rank] !==
        RANK_VALUES[sortedCards[i - 1].rank] + 1
      ) {
        return false;
      }
    }
    return true;
  }
  
  // Determine the type of hand
  export function getHandType(cards: Card[]): HandType {
    if (cards.length === 0) return "none";
    if (cards.length === 1) return "single";
  
    // Check for same rank combinations
    const ranks = cards.map((card) => card.rank);
    const uniqueRanks = new Set(ranks);
  
    if (uniqueRanks.size === 1) {
      switch (cards.length) {
        case 2:
          return "pair";
        case 3:
          return "triple";
        case 4:
          return "quad";
      }
    }
  
    if (isRun(cards)) return "run";
  
    return "none";
  }
  
  // Compare two cards
  export function compareCards(card1: Card, card2: Card): number {
    // Same suit, compare ranks
    if (card1.suit == card2.suit) {
      return RANK_VALUES[card1.rank] - RANK_VALUES[card2.rank];
    }
  
    // Check for diamonds
    if (card1.suit == SUITS.DIAMONDS) return 1;
    if (card2.suit == SUITS.DIAMONDS) return -1;
  
    // Consider suit hierarchy
    return SUIT_HIERARCHY[card1.suit].includes(card2.suit) ? -1 : 1;
  }
  
  // Compare two hands
  export function compareHands(hand1: PlayedHand, hand2: PlayedHand): number {
    if (hand1.type !== hand2.type) return 0;
  
    // For quads, only compare ranks
    if (hand1.type === "quad") {
      return RANK_VALUES[hand1.cards[0].rank] - RANK_VALUES[hand2.cards[0].rank];
    }
  
    // Get the highest card of each hand (considering suit hierarchy)
    const topCard1 = hand1.cards[hand1.cards.length - 1];
    const topCard2 = hand2.cards[hand2.cards.length - 1];
  
    return compareCards(topCard1, topCard2);
  }
  
  // Check if a hand can beat another hand
  export function canBeatHand(
    newHand: PlayedHand,
    previousHand: PlayedHand | null
  ): boolean {
    if (!previousHand) return true;
    if (newHand.type !== previousHand.type) return false;
    return compareHands(newHand, previousHand) > 0;
  }
  
  // Determine if a run can be validly extended by up to 2 cards
  export function canExtendRun(newCards: Card[], prevCards: Card[]): boolean {
    const extra = newCards.length - prevCards.length;
    if (extra < 1 || extra > 2) return false;
    // Sort by rank
    const sortedPrev = [...prevCards].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);
    const sortedNew = [...newCards].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);
    const suit = sortedPrev[0].suit;
    if (!sortedNew.every(c => c.suit === suit)) return false;
  
    // Extras must be sequentially higher
    const baseValue = RANK_VALUES[sortedPrev[sortedPrev.length - 1].rank];
    for (let j = sortedPrev.length; j < sortedNew.length; j++) {
      if (RANK_VALUES[sortedNew[j].rank] !== baseValue + (j - sortedPrev.length + 1)) return false;
    }
    return true;
  }
  
  // Validate a hand
  export function validateHand(
    cards: Card[],
    previousHand: PlayedHand | null
  ): { valid: boolean; type: HandType; error?: string } {
    const type = getHandType(cards);
  
    if (type === "none") {
      return { valid: false, type, error: "Not a valid hand combination" };
    }
  
    if (!previousHand) {
      return { valid: true, type };
    }
  
    if (type !== previousHand.type) {
      return { valid: false, type, error: `Must play a ${previousHand.type}` };
    }
  
    // Special run extension rule
    if (type === 'run' && previousHand.type === 'run') {
      if (!canExtendRun(cards, previousHand.cards)) {
        return { valid: false, type, error: 'Invalid run extension' };
      }
      return { valid: true, type };
    }
  
    const newHand: PlayedHand = { type, cards, playerId: "" };
    if (!canBeatHand(newHand, previousHand)) {
      return { valid: false, type, error: "Hand is not strong enough" };
    }
  
    return { valid: true, type };
  }