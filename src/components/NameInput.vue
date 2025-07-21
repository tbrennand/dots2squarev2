<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';

const userStore = useUserStore();
const playerName = ref(userStore.username !== 'Guest' ? userStore.username : '');
const emit = defineEmits<{
  nameSubmitted: [name: string]
}>();

function submitName() {
  if (playerName.value.trim()) {
    userStore.setUser(userStore.userId || `user_${Math.random().toString(36).substr(2, 9)}`, playerName.value.trim());
    emit('nameSubmitted', playerName.value.trim());
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    submitName();
  }
}
</script>

<template>
  <div class="bg-gray-800 text-white min-h-screen flex flex-col justify-center items-center p-4 font-sans">
    <div class="w-full max-w-md mx-auto bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
      <h1 class="text-4xl font-bold text-cyan-400 tracking-wider mb-6">Welcome!</h1>
      
      <div class="mb-6">
        <label for="playerName" class="block text-lg font-semibold text-gray-300 mb-3">
          Enter Your Name
        </label>
        <input 
          id="playerName"
          v-model="playerName"
          @keypress="handleKeyPress"
          type="text" 
          placeholder="Your name here..."
          class="w-full bg-gray-800 border-2 border-gray-700 focus:border-cyan-500 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors text-center text-xl"
          maxlength="20"
          autocomplete="off"
        />
      </div>
      
      <button 
        @click="submitName"
        :disabled="!playerName.trim()"
        class="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors text-xl"
      >
        Continue
      </button>
      
      <p class="text-gray-500 text-sm mt-4">
        Your name will be displayed to other players
      </p>
    </div>
  </div>
</template> 