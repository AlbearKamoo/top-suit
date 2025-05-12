import { describe, it, expect } from 'vitest';
import {
  Card,
  HandType,
  PlayedHand,
  isRun,
  getHandType,
  compareCards,
  compareHands,
  canBeatHand,
  validateHand,
  findWinningHand
} from '../gameLogic'

describe('Game Logic', () => {
  // Test isRun function
  describe('isRun', () => {
    it('should identify valid runs', () => {
      const validRun: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '6' },
        { suit: '♠', rank: '7' }
      ];
      expect(isRun(validRun)).toBe(true);
    });

    it('should reject runs with different suits', () => {
      const mixedSuitRun: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♥', rank: '6' },
        { suit: '♠', rank: '7' }
      ];
      expect(isRun(mixedSuitRun)).toBe(false);
    });

    it('should reject non-sequential cards', () => {
      const nonSequential: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '7' },
        { suit: '♠', rank: '9' }
      ];
      expect(isRun(nonSequential)).toBe(false);
    });

    it('should reject runs with less than 3 cards', () => {
      const tooShort: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '6' }
      ];
      expect(isRun(tooShort)).toBe(false);
    });
  });

  // Test getHandType function
  describe('getHandType', () => {
    it('should identify single cards', () => {
      const single: Card[] = [{ suit: '♠', rank: '5' }];
      expect(getHandType(single)).toBe('single');
    });

    it('should identify pairs', () => {
      const pair: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♥', rank: '5' }
      ];
      expect(getHandType(pair)).toBe('pair');
    });

    it('should identify triples', () => {
      const triple: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♥', rank: '5' },
        { suit: '♦', rank: '5' }
      ];
      expect(getHandType(triple)).toBe('triple');
    });

    it('should identify quads', () => {
      const quad: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♥', rank: '5' },
        { suit: '♦', rank: '5' },
        { suit: '♣', rank: '5' }
      ];
      expect(getHandType(quad)).toBe('quad');
    });

    it('should identify runs', () => {
      const run: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '6' },
        { suit: '♠', rank: '7' }
      ];
      expect(getHandType(run)).toBe('run');
    });

    it('should return none for invalid combinations', () => {
      const invalid: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♥', rank: '6' }
      ];
      expect(getHandType(invalid)).toBe('none');
    });
  });

  // Test compareCards function
  describe('compareCards', () => {
    it('should compare cards of the same suit by rank', () => {
      const lower: Card = { suit: '♠', rank: '5' };
      const higher: Card = { suit: '♠', rank: '7' };
      expect(compareCards(lower, higher)).toBeLessThan(0);
      expect(compareCards(higher, lower)).toBeGreaterThan(0);
    });

    it('should handle diamonds as highest suit', () => {
      const diamond: Card = { suit: '♦', rank: '2' };
      const heart: Card = { suit: '♥', rank: 'A' };
      expect(compareCards(diamond, heart)).toBeGreaterThan(0);
    });

    it('should follow suit hierarchy (♦ > ♥ > ♠ > ♣)', () => {
      const diamond: Card = { suit: '♦', rank: '5' };
      const heart: Card = { suit: '♥', rank: '5' };
      const spade: Card = { suit: '♠', rank: '5' };
      const club: Card = { suit: '♣', rank: '5' };

      expect(compareCards(diamond, heart)).toBeGreaterThan(0);
      expect(compareCards(heart, spade)).toBeGreaterThan(0);
      expect(compareCards(spade, club)).toBeGreaterThan(0);
      expect(compareCards(club, heart)).toBeGreaterThan(0);
    });
  });

  // Test compareHands function
  describe('compareHands', () => {
    it('should compare single cards', () => {
      const hand1: PlayedHand = {
        type: 'single',
        cards: [{ suit: '♠', rank: '5' }],
        playerId: 'player1'
      };
      const hand2: PlayedHand = {
        type: 'single',
        cards: [{ suit: '♥', rank: '5' }],
        playerId: 'player2'
      };
      expect(compareHands(hand1, hand2)).toBeLessThan(0);
    });

    it('should compare pairs by highest card', () => {
      const hand1: PlayedHand = {
        type: 'pair',
        cards: [
          { suit: '♠', rank: '5' },
          { suit: '♥', rank: '5' }
        ],
        playerId: 'player1'
      };
      const hand2: PlayedHand = {
        type: 'pair',
        cards: [
          { suit: '♦', rank: '5' },
          { suit: '♣', rank: '5' }
        ],
        playerId: 'player2'
      };
      expect(compareHands(hand1, hand2)).toBeLessThan(0);
    });

    it('should return 0 for different hand types', () => {
      const single: PlayedHand = {
        type: 'single',
        cards: [{ suit: '♠', rank: '5' }],
        playerId: 'player1'
      };
      const pair: PlayedHand = {
        type: 'pair',
        cards: [
          { suit: '♦', rank: '2' },
          { suit: '♥', rank: '2' }
        ],
        playerId: 'player2'
      };
      expect(compareHands(single, pair)).toBe(0);
    });
  });

  // Test validateHand function
  describe('validateHand', () => {
    it('should validate first hand of a trick', () => {
      const hand: Card[] = [{ suit: '♠', rank: '5' }];
      const result = validateHand(hand, null);
      expect(result.valid).toBe(true);
      expect(result.type).toBe('single');
    });

    it('should validate hand that can beat previous hand', () => {
      const previousHand: PlayedHand = {
        type: 'single',
        cards: [{ suit: '♠', rank: '5' }],
        playerId: 'player1'
      };
      const hand: Card[] = [{ suit: '♦', rank: '5' }];
      const result = validateHand(hand, previousHand);
      expect(result.valid).toBe(true);
      expect(result.type).toBe('single');
    });

    it('should reject hand that cannot beat previous hand', () => {
      const previousHand: PlayedHand = {
        type: 'single',
        cards: [{ suit: '♦', rank: '5' }],
        playerId: 'player1'
      };
      const hand: Card[] = [{ suit: '♠', rank: '5' }];
      const result = validateHand(hand, previousHand);
      expect(result.valid).toBe(false);
    });

    it('should reject hand of different type than previous', () => {
      const previousHand: PlayedHand = {
        type: 'single',
        cards: [{ suit: '♠', rank: '5' }],
        playerId: 'player1'
      };
      const hand: Card[] = [
        { suit: '♦', rank: '2' },
        { suit: '♥', rank: '2' }
      ];
      const result = validateHand(hand, previousHand);
      expect(result.valid).toBe(false);
    });
  });

  // Test findWinningHand function
  describe('findWinningHand', () => {
    it('should find the winning hand in a trick', () => {
      const trick: PlayedHand[] = [
        {
          type: 'single',
          cards: [{ suit: '♠', rank: '5' }],
          playerId: 'player1'
        },
        {
          type: 'single',
          cards: [{ suit: '♦', rank: '5' }],
          playerId: 'player2'
        },
        {
          type: 'single',
          cards: [{ suit: '♥', rank: '5' }],
          playerId: 'player3'
        }
      ];
      const winner = findWinningHand(trick);
      expect(winner.playerId).toBe('player2');
    });

    it('should handle tricks with passes', () => {
      const trick: PlayedHand[] = [
        {
          type: 'single',
          cards: [{ suit: '♠', rank: '5' }],
          playerId: 'player1'
        },
        {
          type: 'none',
          cards: [],
          playerId: 'player2'
        },
        {
          type: 'none',
          cards: [],
          playerId: 'player3'
        }
      ];
      const winner = findWinningHand(trick);
      expect(winner.playerId).toBe('player1');
    });
  });
}); 