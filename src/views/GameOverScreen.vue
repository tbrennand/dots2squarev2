<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import DotGrid from '@/components/DotGrid.vue';
import { useUserStore } from '@/store/userStore';
import { getUserStats } from '@/firebase';
import type { UserStats } from '@/firebase';

const props = defineProps<{
  winner: string | null;
  scores: Record<string, number>;
  players: string[];
  playerColors: Record<string, string>;
  lines: Map<string, string>;
  squares: Map<string, string>;
  gridSize: number;
}>();

const emit = defineEmits(['play-again']);

const playerStats = ref<Record<string, UserStats | null>>({});

async function fetchPlayerStats() {
  const stats: Record<string, UserStats | null> = {};
  for (const playerId of props.players) {
    if (playerId !== 'AI-Player') {
      stats[playerId] = await getUserStats(playerId);
    }
  }
  playerStats.value = stats;
}

// Fetch stats when the component is shown
watch(() => props.winner, (newWinner) => {
  if (newWinner) {
    fetchPlayerStats();
  }
}, { immediate: true });


const userStore = useUserStore();

const sortedPlayers = computed(() => {
  return [...props.players].sort((a, b) => (props.scores[b] || 0) - (props.scores[a] || 0));
});

const gameOverMessage = computed(() => {
  if (props.winner === 'tie') return "It's a Tie!";
  if (props.winner === userStore.userId) return 'You Won!';
  if (props.winner) return `${props.winner} Wins!`;
  return 'Game Over';
});

const handlePlayAgain = () => {
  emit('play-again');
};
</script>

<template>
  <div class="absolute inset-0 bg-gray-800 bg-opacity-95 flex flex-col justify-center items-center p-4 font-sans z-50">
    <div class="w-full max-w-2xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-8 text-center animate-fade-in-up">
      
      <header class="mb-6">
        <h1 class="text-5xl font-bold text-cyan-400 tracking-wider">{{ gameOverMessage }}</h1>
      </header>

      <div class="grid md:grid-cols-2 gap-8 items-center">
        <!-- Left Side: Scores & Players -->
        <div class="text-left bg-gray-800 p-6 rounded-lg">
          <h2 class="text-2xl font-semibold text-gray-300 mb-4">Final Scores</h2>
          <ul class="space-y-3">
            <li v-for="player in sortedPlayers" :key="player" class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
              <div class="flex items-center gap-4">
                <span class="w-5 h-5 rounded-full border-2" :style="{ backgroundColor: playerColors[player] || '#4A5568', borderColor: player === winner ? '#FBBF24' : '#4A5568' }"></span>
                <span class="font-medium truncate">{{ player === userStore.userId ? 'You' : player }}</span>
              </div>
              <div class="text-right">
                <span class="text-2xl font-bold" :style="{ color: playerColors[player] || '#FFFFFF' }">{{ scores[player] || 0 }}</span>
                <div v-if="playerStats[player]" class="text-xs text-gray-400 mt-1">
                  W:{{ playerStats[player]?.wins ?? 0 }} L:{{ playerStats[player]?.losses ?? 0 }} T:{{ playerStats[player]?.ties ?? 0 }}
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Right Side: Final Board -->
        <div class="flex flex-col items-center justify-center">
           <h2 class="text-2xl font-semibold text-gray-300 mb-4">Final Board</h2>
          <DotGrid 
            :rows="gridSize"
            :cols="gridSize"
            :lines="lines"
            :squares="squares"
            :player-colors="playerColors"
            class="pointer-events-none" />
        </div>
      </div>

      <footer class="mt-8">
        <button @click="handlePlayAgain" class="w-full max-w-xs mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-xl">
          Play Again
        </button>
      </footer>

    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
