<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// Placeholder data
const winner = 'Player 1';
const scores = { 'Player 1': 5, 'Player 2': 3 };

function rematch() {
  console.log('Initiating rematch...');
  // Navigate back to a new lobby or the same one
  router.push('/lobby/rematch-game');
}

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
    <h1 class="text-6xl font-extrabold mb-4">Game Over</h1>
    <h2 class="text-4xl font-bold text-yellow-400 mb-8">{{ winner }} Wins!</h2>
    
    <div class="text-2xl mb-8">
      <p>Final Score:</p>
      <p>Player 1: {{ scores['Player 1'] }}</p>
      <p>Player 2: {{ scores['Player 2'] }}</p>
    </div>

    <div class="space-x-4">
      <button @click="rematch" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold transition-colors">
        Rematch
      </button>
      <button @click="goHome" class="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-xl font-semibold transition-colors">
        Home
      </button>
    </div>
  </div>
</template>
