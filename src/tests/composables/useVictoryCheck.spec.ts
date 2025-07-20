import { describe, it, expect } from 'vitest';
import { useVictoryCheck } from '../../composables/useVictoryCheck';

describe('useVictoryCheck', () => {
  it('should determine the winner correctly', () => {
    const scores = { player1: 5, player2: 4 };
    const totalSquares = 9;
    const { isGameOver, winner } = useVictoryCheck(scores, totalSquares);
    expect(isGameOver.value).toBe(true);
    expect(winner.value).toBe('player1');
  });
});
