import { describe, it, expect } from 'vitest';
import { PlayedHand } from '@shared/types';
import {
  findWinningHand
} from '../gameLogic'

describe('Game Logic', () => {

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