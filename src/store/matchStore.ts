import { defineStore } from 'pinia'

export const useMatchStore = defineStore('match', {
  state: () => ({
    gridSize: 6, // Default size
    matchId: null as string | null,
    players: [] as string[],
    currentPlayer: null as string | null,
    scores: {} as Record<string, number>,
    state: 'lobby' as 'lobby' | 'in-progress' | 'finished',
    winner: null as string | null,
    playerColors: {} as Record<string, string>,
    playerNames: {} as Record<string, string>,
  }),
  actions: {
    setMatch(id: string) {
      this.matchId = id;
    },
    setGameState(gameState: any) {
      this.players = gameState.players ?? this.players;
      this.scores = gameState.scores ?? this.scores;
      this.currentPlayer = gameState.currentPlayer ?? this.currentPlayer;
      this.state = gameState.state ?? this.state;
      this.winner = gameState.winner ?? this.winner;
      this.playerColors = gameState.playerColors ?? this.playerColors;
      this.playerNames = gameState.playerNames ?? this.playerNames;
      this.gridSize = gameState.gridSize ?? this.gridSize;
    },
  },
})
