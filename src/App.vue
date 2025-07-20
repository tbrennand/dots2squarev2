<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useUserStore } from './store/userStore';

const userStore = useUserStore();

onMounted(() => {
  userStore.initUser();
});
</script>

<template>
  <div class="bg-gray-900 text-white min-h-screen">
    <RouterView />
  </div>
</template>
