import { computed } from 'vue';

export function useVictoryCheck(scores: Record<string, number>, totalSquares: number) {
  const isGameOver = computed(() => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return totalScore >= totalSquares;
  });

  const winner = computed(() => {
    if (!isGameOver.value) return null;
    let maxScore = -1;
    let winnerId: string | null = null;
    for (const [playerId, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        winnerId = playerId;
      }
    }
    return winnerId;
  });

  return { isGameOver, winner };
}
