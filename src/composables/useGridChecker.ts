import { Ref } from 'vue';

export function useGridChecker(rows: Ref<number>, cols: Ref<number>, lines: Ref<Map<string, string>>) {

  function getLineId(r1: number, c1: number, r2: number, c2: number): string {
    if (r1 > r2 || (r1 === r2 && c1 > c2)) {
      [r1, c1, r2, c2] = [r2, c2, r1, c1];
    }
    return `${r1},${c1}-${r2},${c2}`;
  }
  
  // Checks if a specific square (identified by its top-left dot) is complete.
  function checkSquare(r: number, c: number): boolean {
    const top = getLineId(r, c, r, c + 1);
    const bottom = getLineId(r + 1, c, r + 1, c + 1);
    const left = getLineId(r, c, r + 1, c);
    const right = getLineId(r, c + 1, r + 1, c + 1);
    return lines.value.has(top) && lines.value.has(bottom) && lines.value.has(left) && lines.value.has(right);
  }

  // When a line is added, we only need to check the squares adjacent to it.
  function checkSquaresAfterLine(lineId: string): string[] {
    const [p1, p2] = lineId.split('-').map(p => p.split(',').map(Number));
    const [r1, c1] = p1;

    const completedSquares: string[] = [];

    // is horizontal line
    if (p1[0] === p2[0]) {
      // Check square above
      if (r1 > 0) {
        if (checkSquare(r1 - 1, c1)) {
          completedSquares.push(`${r1 - 1},${c1}`);
        }
      }
      // Check square below
      if (r1 < rows.value - 1) {
        if (checkSquare(r1, c1)) {
          completedSquares.push(`${r1},${c1}`);
        }
      }
    } 
    // is vertical line
    else if (p1[1] === p2[1]) {
      // Check square to the left
      if (c1 > 0) {
        if (checkSquare(r1, c1 - 1)) {
          completedSquares.push(`${r1},${c1 - 1}`);
        }
      }
      // Check square to the right
      if (c1 < cols.value - 1) {
        if (checkSquare(r1, c1)) {
          completedSquares.push(`${r1},${c1}`);
        }
      }
    }
    return completedSquares;
  }

    return { checkSquare, checkSquaresAfterLine };
}
