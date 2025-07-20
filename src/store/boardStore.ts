import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
  state: () => ({
    // Represents lines drawn between dots
    // e.g., '0,0-0,1' for a horizontal line
    lines: new Map<string, string>(), // key: 'r,c-r,c', value: playerId
    // Represents completed squares
    // e.g., '0,0' for the top-left square
    squares: new Map<string, string>(), // key: 'r,c', value: playerId
  }),
  actions: {
    addLine(lineId: string, playerId: string) {
      this.lines.set(lineId, playerId);
    },
    addSquare(squareId: string, playerId: string) {
      this.squares.set(squareId, playerId);
    },
    setGameState(state: any) {
        this.lines = new Map(Object.entries(state.lines || {}));
        this.squares = new Map(Object.entries(state.squares || {}));
    },
  },
})
