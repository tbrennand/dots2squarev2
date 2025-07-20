<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createMatch, updateMatch } from '@/firebase';
import { useUserStore } from '@/store/userStore';

const router = useRouter();
const userStore = useUserStore();
const joinMatchId = ref('');
const selectedSize = ref(6); // Default size

const SIZES = [6, 8, 10];

async function createGame() {
  if (!userStore.userId) {
    alert('User not initialized. Please refresh.');
    return;
  }
  const matchId = await createMatch(userStore.userId, selectedSize.value);
  if (matchId) {
    router.push(`/lobby/${matchId}`);
  }
}

async function createAIGame() {
  if (!userStore.userId) {
    alert('User not initialized. Please refresh.');
    return;
  }
  const matchId = await createMatch(userStore.userId, selectedSize.value);
  if (matchId) {
    const aiPlayerId = 'AI-Player';
    await updateMatch(matchId, {
      players: [userStore.userId, aiPlayerId],
      playerColors: {
        [userStore.userId]: '#4F46E5', // Indigo for human
        [aiPlayerId]: '#E11D48', // Rose for AI
      },
      state: 'in-progress',
      currentPlayer: userStore.userId,
    });
    router.push(`/game/${matchId}`);
  }
}

function joinGame() {
  if (joinMatchId.value.trim()) {
    router.push(`/lobby/${joinMatchId.value.trim()}`);
  }
}
</script>

<template>
  <div class="bg-gray-800 text-white min-h-screen flex flex-col justify-center items-center p-4 font-sans">
    <div class="w-full max-w-md mx-auto bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
      <h1 class="text-5xl font-bold text-cyan-400 tracking-wider mb-6">Dots & Squares</h1>

      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-300 mb-3">Choose Grid Size</h2>
        <div class="flex justify-center gap-4">
          <button 
            v-for="size in SIZES" 
            :key="size" 
            @click="selectedSize = size"
            class="w-20 h-12 rounded-lg font-bold text-xl transition-all duration-200"
            :class="selectedSize === size ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'"
          >
            {{ size }}x{{ size }}
          </button>
        </div>
      </div>
      
      <div class="space-y-4">
        <button @click="createGame" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-xl">
          Create New Game
        </button>
        <button @click="createAIGame" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-xl">
          Play vs. AI
        </button>
      </div>

      <div class="my-8 flex items-center">
        <hr class="flex-grow border-t border-gray-700"/>
        <span class="px-4 text-gray-500">OR</span>
        <hr class="flex-grow border-t border-gray-700"/>
      </div>

      <form @submit.prevent="joinGame" class="space-y-4">
        <input 
          v-model="joinMatchId" 
          type="text" 
          placeholder="Enter Match ID to Join"
          class="w-full bg-gray-800 border-2 border-gray-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
        />
        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-xl">
          Join Game
        </button>
      </form>
    </div>
  </div>
</template>
