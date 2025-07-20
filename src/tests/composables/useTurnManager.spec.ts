import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useTurnManager } from '../../composables/useTurnManager';

describe('useTurnManager', () => {
  it('should switch turns correctly', () => {
        const players = ref(['player1', 'player2']);
    const { currentPlayer, nextTurn } = useTurnManager(players);
    expect(currentPlayer.value).toBe('player1');
    nextTurn();
    expect(currentPlayer.value).toBe('player2');
    nextTurn();
    expect(currentPlayer.value).toBe('player1');
  });
});
