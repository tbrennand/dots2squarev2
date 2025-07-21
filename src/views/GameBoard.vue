<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRef, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DotGrid from '@/components/DotGrid.vue';
import GameOverScreen from './GameOverScreen.vue';
import { useBoardStore } from '@/store/boardStore';
import { useMatchStore } from '@/store/matchStore';
import { useGridChecker } from '@/composables/useGridChecker';
import { useTurnManager } from '@/composables/useTurnManager';
import { subscribeToMatch, updateMatch, updateUserStats } from '@/firebase';
import { useUserStore } from '@/store/userStore';

const boardStore = useBoardStore();
const matchStore = useMatchStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

// Set matchId from route params on component setup
const matchId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
if (matchId) {
  matchStore.setMatch(matchId);
}

const { checkSquaresAfterLine } = useGridChecker(toRef(matchStore, 'gridSize'), toRef(matchStore, 'gridSize'), toRef(boardStore, 'lines'));
// The players array for the turn manager needs to be reactive
const players = ref(matchStore.players);
watch(() => matchStore.players, (newPlayers) => {
  players.value = newPlayers;
});
const { currentPlayer, nextTurn, setCurrentPlayer } = useTurnManager(players);

const turnTimer = ref(30);
let timerId: NodeJS.Timeout | undefined;
let isAITurnForced = false; // Flag to prevent double AI moves

const AI_PLAYER_ID = 'AI-Player';

const isGameOver = ref(false);
const winner = ref<string | null>(null);

// Sync local turn manager with store's current player
function startTurnTimer() {
  clearInterval(timerId);
  turnTimer.value = 30;
  timerId = setInterval(async () => {
    turnTimer.value--;
    if (turnTimer.value <= 0) {
      clearInterval(timerId);
      // Time's up, advance to the next player
      const newPlayer = nextTurn();
      await updateMatch(matchStore.matchId!, { currentPlayer: newPlayer });

      // If the next player is the AI, force its move immediately
      if (typeof newPlayer === 'string' && newPlayer === AI_PLAYER_ID) {
        isAITurnForced = true;
        // Use a short timeout to allow the UI to update to show it's the AI's turn
        setTimeout(() => makeAIMove(), 200);
      }
    }
  }, 1000);
}

// Sync local turn manager with store's current player
watch(() => matchStore.currentPlayer, (newPlayer) => {
    if (newPlayer) {
        setCurrentPlayer(newPlayer);
        startTurnTimer(); // Reset timer on turn change

        if (newPlayer === AI_PLAYER_ID && !isAITurnForced) {
          // AI's turn, make a move after a short delay
          setTimeout(() => {
            makeAIMove();
          }, 1000); // 1-second delay for effect
        } else if (isAITurnForced) {
          // Reset the flag after the forced turn has been processed
          isAITurnForced = false;
        }
    }
}, { immediate: true });

let unsubscribeFromMatch: () => void = () => {};

onMounted(() => {
  if (matchStore.matchId) {
    unsubscribeFromMatch = subscribeToMatch(matchStore.matchId, (data) => {
      if (data) {
        // Update stores with data from Firestore
        matchStore.setGameState(data);
        boardStore.setGameState(data);
      }
    });
  }
});

onUnmounted(() => {
  unsubscribeFromMatch();
  clearInterval(timerId);
});

function checkGameOver() {
  const size = matchStore.gridSize;
  const totalSquares = (size - 1) * (size - 1);
  if (boardStore.squares.size >= totalSquares) {
    isGameOver.value = true;
    clearInterval(timerId); // Stop the timer

    // Determine winner
    let maxScore = -1;
    let currentWinner: string | null = null;
    let isTie = false;

    for (const player of matchStore.players) {
      const score = matchStore.scores[player] || 0;
      if (score > maxScore) {
        maxScore = score;
        currentWinner = player;
        isTie = false;
      } else if (score === maxScore) {
        isTie = true;
      }
    }
    winner.value = isTie ? 'tie' : currentWinner;

    // Update stats for all players
    matchStore.players.forEach(player => {
      if (player === 'AI-Player') return;
      let result: 'win' | 'loss' | 'tie';
      if (winner.value === 'tie') {
        result = 'tie';
      } else if (player === winner.value) {
        result = 'win';
      } else {
        result = 'loss';
      }
      updateUserStats(player, result);
    });
  }
}

function restartGame() {
  // Reset local game over state if needed, though pushing to home effectively does this
  isGameOver.value = false;
  winner.value = null;
  router.push('/');
}

function getAvailableLines(): string[] {
  const allLines = [];
  const { rows, cols } = { rows: matchStore.gridSize, cols: matchStore.gridSize };

  // Horizontal lines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      allLines.push(`${r},${c}-${r},${c + 1}`);
    }
  }

  // Vertical lines
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      allLines.push(`${r},${c}-${r + 1},${c}`);
    }
  }

  return allLines.filter(line => !boardStore.lines.has(line));
}

async function makeAIMove() {
  const availableLines = getAvailableLines();
  if (availableLines.length === 0) return;

  // Smarter AI: Look for a move that completes a square
  let winningMove: string | null = null;
  for (const lineId of availableLines) {
    const newSquares = checkSquaresAfterLine(lineId);
    if (newSquares.length > 0) {
      winningMove = lineId;
      break; // Found a winning move, no need to look further
    }
  }

  if (winningMove) {
    await handleLineAdded(winningMove);
  } else {
    // No winning move found, pick a random line
    const randomLine = availableLines[Math.floor(Math.random() * availableLines.length)];
    await handleLineAdded(randomLine);
  }
}

async function handleLineAdded(lineId: string) {
  if (!matchStore.matchId || !matchStore.currentPlayer || boardStore.lines.has(lineId)) return;

  const playerMakingMove = matchStore.currentPlayer;

  // --- Perform local updates for immediate feedback ---
  boardStore.addLine(lineId, playerMakingMove);
  const newSquares = checkSquaresAfterLine(lineId);

  let nextPlayerId = playerMakingMove;

  if (newSquares.length > 0) {
    // Player scored, gets another turn
    const currentScore = matchStore.scores[playerMakingMove] || 0;
    matchStore.scores[playerMakingMove] = currentScore + newSquares.length;

    newSquares.forEach(square => {
      boardStore.addSquare(square, playerMakingMove);
    });
    checkGameOver();
  } else {
    // No score, next player's turn
    nextTurn();
    nextPlayerId = currentPlayer.value;
  }

  // --- Prepare data and update Firestore ---
  const updates = {
    lines: Object.fromEntries(boardStore.lines),
    squares: Object.fromEntries(boardStore.squares),
    scores: matchStore.scores,
    currentPlayer: nextPlayerId,
  };

  await updateMatch(matchStore.matchId, updates);
}

</script>

<template>
  <div class="bg-gray-800 text-white min-h-screen flex flex-col justify-center items-center p-4 font-sans">
    <div class="w-full max-w-lg mx-auto bg-gray-900 rounded-2xl shadow-lg p-6">
      <!-- Header -->
      <header class="flex justify-between items-center pb-4 border-b border-gray-700">
        <h1 class="text-3xl font-bold text-cyan-400 tracking-wider">Dots & Squares</h1>
        <div class="flex space-x-4">
          <div 
            v-for="player in matchStore.players" 
            :key="player" 
            class="text-center p-3 rounded-lg transition-all duration-300 w-24"
            :class="matchStore.currentPlayer === player ? 'shadow-lg' : ''"
            :style="{ backgroundColor: matchStore.playerColors[player] || '#2D3748' }"
          >
            <p class="text-sm font-semibold truncate">{{ matchStore.playerNames[player] || player }}</p>
            <p class="text-2xl font-bold">{{ matchStore.scores[player] || 0 }}</p>
          </div>
        </div>
      </header>

      <!-- Game Board -->
      <main class="my-6 flex justify-center">
        <DotGrid 
          :rows="matchStore.gridSize" 
          :cols="matchStore.gridSize" 
          :lines="boardStore.lines"
          :squares="boardStore.squares"
          :player-colors="matchStore.playerColors"
          @line-added="handleLineAdded" 
        />
      </main>

      <!-- Footer / Turn Indicator -->
      <footer class="pt-4 border-t border-gray-700 text-center">
        <div v-if="matchStore.currentPlayer === userStore.userId" class="text-2xl font-bold text-green-400 animate-pulse">
          Your Turn!
        </div>
        <div v-else class="text-lg text-yellow-400">
          Waiting for {{ matchStore.playerNames[matchStore.currentPlayer] || matchStore.currentPlayer }}...
        </div>
        <div class="text-5xl font-mono mt-2 tracking-widest">{{ turnTimer }}</div>
      </footer>
    </div>

    <!-- Game Over Screen -->
    <GameOverScreen 
      v-if="isGameOver"
      :winner="winner"
      :scores="matchStore.scores"
      :players="matchStore.players"
      :player-names="matchStore.playerNames"
      :player-colors="matchStore.playerColors"
      :lines="boardStore.lines"
      :squares="boardStore.squares"
      :grid-size="matchStore.gridSize"
      @play-again="restartGame"
    />
  </div>
</template>
