export interface Card {
  suit: '♠' | '♥' | '♣' | '♦';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export interface Player {
  id: string;
  name: string;
}

export interface GameCreatedEvent {
  gameCode: string;
  playerId: string;
}

export interface PlayersEvent {
  players: Player[];
}

export interface GameStartedEvent extends PlayersEvent {
  currentTurn: number;
  drawPileCount: number;
}

export interface CardsEvent {
  cards: Card[];
  drawPileCount: number;
} 