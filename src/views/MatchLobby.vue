<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { subscribeToMatch, updateMatch } from '@/firebase';
import { arrayUnion, arrayRemove } from 'firebase/firestore';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const gameId = ref(route.params.id as string);
const players = ref<string[]>([]);
const matchState = ref<'lobby' | 'in-progress' | 'finished'>('lobby');
const inviteStatusMessage = ref('');
const playerColors = ref<Record<string, string>>({});

const AVAILABLE_COLORS = ['#4F46E5', '#E11D48', '#10B981', '#F59E0B']; // Indigo, Rose, Emerald, Amber

let unsubscribe = () => {};

async function joinMatch() {
  if (!userStore.userId) return;
  await updateMatch(gameId.value, {
    players: arrayUnion(userStore.userId)
  });
}

async function leaveMatch() {
  if (!userStore.userId) return;
  await updateMatch(gameId.value, {
    players: arrayRemove(userStore.userId)
  });
}

async function startGame() {
  if (players.value.length > 1) { // Typically 2 players
    await updateMatch(gameId.value, {
      state: 'in-progress',
      currentPlayer: players.value[0] // First player starts
    });
  }
}

async function shareOrCopyInviteLink() {
  const inviteLink = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Dots to Squares Invitation',
        text: `Come play Dots to Squares with me! Join my game here: ${inviteLink}`,
        url: inviteLink,
      });
      inviteStatusMessage.value = 'Shared!';
    } catch (error) {
      console.error('Error sharing:', error);
      inviteStatusMessage.value = 'Could not share';
    }
  } else {
    // Fallback for browsers that don't support Web Share API
    await navigator.clipboard.writeText(inviteLink);
    inviteStatusMessage.value = 'Link Copied!';
  }

  // Reset the message after a few seconds
  if (inviteStatusMessage.value) {
    setTimeout(() => {
      inviteStatusMessage.value = '';
    }, 3000);
  }
}

onMounted(() => {
  joinMatch();
  unsubscribe = subscribeToMatch(gameId.value, (data) => {
    if (data) {
      players.value = data.players || [];
      playerColors.value = data.playerColors || {};
      matchState.value = data.state;

      // Assign color to the current player if they don't have one yet
      const currentUser = userStore.userId;
      if (currentUser && players.value.includes(currentUser) && !playerColors.value[currentUser]) {
        const assignedColors = Object.values(playerColors.value);
        const nextColor = AVAILABLE_COLORS.find(color => !assignedColors.includes(color));
        if (nextColor) {
          updateMatch(gameId.value, {
            [`playerColors.${currentUser}`]: nextColor
          });
        }
      }
    }
  });
});

onUnmounted(() => {
  // User is not automatically removed from the match on unmount.
  // They must explicitly leave or the match creator can start the game.
  unsubscribe();
});

// Watch for the game to start, then navigate
watch(matchState, (newState) => {
  if (newState === 'in-progress') {
    router.push(`/game/${gameId.value}`);
  }
});

</script>

<template>
  <div class="bg-gray-800 text-white min-h-screen flex flex-col justify-center items-center p-4 font-sans">
    <div class="w-full max-w-lg mx-auto bg-gray-900 rounded-2xl shadow-lg p-8">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-cyan-400 tracking-wider">Match Lobby</h1>
        <p class="text-gray-400 mt-2">Waiting for players to join...</p>
      </header>

      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-300 mb-2">Invite Link</h2>
        <div class="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
          <input type="text" :value="gameId" readonly class="flex-grow bg-transparent font-mono text-gray-400 focus:outline-none" />
          <button @click="shareOrCopyInviteLink" class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            {{ inviteStatusMessage || 'Copy' }}
          </button>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-300 mb-4">Players Joined</h2>
        <ul class="space-y-3">
          <li v-for="player in players" :key="player" class="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
            <div class="flex items-center gap-4">
              <span class="w-5 h-5 rounded-full border-2 border-gray-700" :style="{ backgroundColor: playerColors[player] || '#4A5568' }"></span>
              <span class="font-medium truncate">{{ player }}</span>
            </div>
            <span class="text-green-400 font-semibold">Ready</span>
          </li>
          <li v-if="players.length < 2" class="flex items-center justify-center bg-gray-800 p-4 rounded-lg animate-pulse">
            <span class="text-gray-500">Waiting for opponent...</span>
          </li>
        </ul>
      </div>

      <footer class="text-center">
        <button @click="startGame" :disabled="players.length < 2" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-xl disabled:bg-gray-600 disabled:cursor-not-allowed">
          Start Game
        </button>
        <p v-if="players.length < 2" class="text-gray-500 text-sm mt-2">You need at least 2 players to start.</p>
      </footer>
    </div>
  </div>
</template>
