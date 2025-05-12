export interface Card {
  suit: '♠' | '♥' | '♣' | '♦';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export type HandType = 'single' | 'pair' | 'triple' | 'quad' | 'run' | 'none';

export interface PlayedHand {
  type: HandType;
  cards: Card[];
  playerId: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  currentTurn: string; // player ID
  currentTrick: PlayedHand[];
  lastValidHand: PlayedHand | null;
  drawPileCount: number;
  players: Player[];
  status: 'playing' | 'finished';
}

export interface GameCreatedEvent {
  gameCode: string;
  playerId: string;
}

export interface PlayersEvent {
  players: Player[];
}

export interface GameStartedEvent {
  drawPileCount: number;
  players: Player[];
}

export interface GameStateEvent {
  gameState: GameState;
}

export interface CardsEvent {
  cards: Card[];
  drawPileCount: number;
}

export interface PlayHandEvent {
  cards: Card[];
}

export interface HandPlayedEvent {
  gameState: GameState;
  validPlay: boolean;
  error?: string;
}

// Constants for game rules
export const CARDS_PER_PLAYER = {
  3: 10,
  4: 8
};

export const SUIT_HIERARCHY = {
  '♦': 4,
  '♥': 3,
  '♠': 2,
  '♣': 1
} as const;

export const RANK_VALUES = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14
} as const; 