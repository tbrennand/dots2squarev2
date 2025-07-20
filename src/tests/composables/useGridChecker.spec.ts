import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useGridChecker } from '../../composables/useGridChecker';

describe('useGridChecker', () => {
  it('should return false for an incomplete square', () => {
    const rows = ref(5);
    const cols = ref(5);
    const lines = ref(new Map<string, string>());
    const { checkSquare } = useGridChecker(rows, cols, lines);
    expect(checkSquare(0, 0)).toBe(false);
  });
});
