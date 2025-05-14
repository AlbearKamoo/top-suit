import { describe, it, expect } from 'vitest';
import { Card, PlayedHand } from '../types';
import {
  isRun,
  getHandType,
  compareCards,
  compareHands,
  validateHand,
  canExtendRun,
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

    it('should follow suit hierarchy', () => {
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

    it('should compare pairs by winning suit', () => {
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
          { suit: '♦', rank: '2' },
          { suit: '♣', rank: '2' }
        ],
        playerId: 'player2'
      };
      expect(compareHands(hand1, hand2)).toBeLessThan(0);
    });

    it('should compare pairs by rank', () => {
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
          { suit: '♦', rank: '7' },
          { suit: '♥', rank: '7' }
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

  // Test canExtendRun function
  describe('canExtendRun', () => {
    it('should return true for valid extension by 1 card', () => {
      const prevCards: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '6' },
        { suit: '♠', rank: '7' }
      ];
      const newCards: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '6' },
        { suit: '♠', rank: '7' },
        { suit: '♠', rank: '8' }
      ];
      expect(canExtendRun(newCards, prevCards)).toBe(true);
    });

    it('should return true for valid extension by 2 cards', () => {
      const prevCards: Card[] = [
        { suit: '♥', rank: '10' },
        { suit: '♥', rank: 'J' },
        { suit: '♥', rank: 'Q' }
      ];
      const newCards: Card[] = [
        { suit: '♥', rank: '10' },
        { suit: '♥', rank: 'J' },
        { suit: '♥', rank: 'Q' },
        { suit: '♥', rank: 'K' },
        { suit: '♥', rank: 'A' }
      ];
      expect(canExtendRun(newCards, prevCards)).toBe(true);
    });

    it('should return false when extra cards are not sequential next ranks', () => {
      const prevCards: Card[] = [
        { suit: '♦', rank: '2' },
        { suit: '♦', rank: '3' },
        { suit: '♦', rank: '4' }
      ];
      const newCards: Card[] = [
        { suit: '♦', rank: '2' },
        { suit: '♦', rank: '3' },
        { suit: '♦', rank: '4' },
        { suit: '♦', rank: '6' }
      ];
      expect(canExtendRun(newCards, prevCards)).toBe(false);
    });

    it('should return false when extra cards exceed limit', () => {
      const prevCards: Card[] = [
        { suit: '♣', rank: '7' },
        { suit: '♣', rank: '8' },
        { suit: '♣', rank: '9' }
      ];
      const newCards: Card[] = [
        { suit: '♣', rank: '7' },
        { suit: '♣', rank: '8' },
        { suit: '♣', rank: '9' },
        { suit: '♣', rank: '10' },
        { suit: '♣', rank: 'J' },
        { suit: '♣', rank: 'Q' }
      ];
      expect(canExtendRun(newCards, prevCards)).toBe(false);
    });

    it('should return false for suit mismatch', () => {
      const prevCards: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '6' },
        { suit: '♠', rank: '7' }
      ];
      const newCards: Card[] = [
        { suit: '♠', rank: '5' },
        { suit: '♠', rank: '6' },
        { suit: '♠', rank: '7' },
        { suit: '♥', rank: '8' }
      ];
      expect(canExtendRun(newCards, prevCards)).toBe(false);
    });

    it('should return false for too few extra cards', () => {
      const prevCards: Card[] = [
        { suit: '♥', rank: '9' },
        { suit: '♥', rank: '10' },
        { suit: '♥', rank: 'J' }
      ];
      const newCards: Card[] = [
        { suit: '♥', rank: '9' },
        { suit: '♥', rank: '10' },
        { suit: '♥', rank: 'J' }
      ];
      expect(canExtendRun(newCards, prevCards)).toBe(false);
    });

    it('should handle unsorted input correctly', () => {
      const prevCards: Card[] = [
        { suit: '♦', rank: '4' },
        { suit: '♦', rank: '2' },
        { suit: '♦', rank: '3' }
      ];
      const newCards: Card[] = [
        { suit: '♦', rank: '6' },
        { suit: '♦', rank: '2' },
        { suit: '♦', rank: '3' },
        { suit: '♦', rank: '4' },
        { suit: '♦', rank: '5' }
      ];
      expect(canExtendRun(newCards, prevCards)).toBe(true);
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
        cards: [{ suit: '♣', rank: 'K' }],
        playerId: 'player1'
      };
      const hand: Card[] = [{ suit: '♠', rank: '3' }];
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
      const hand: Card[] = [{ suit: '♠', rank: '10' }];
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

}); 