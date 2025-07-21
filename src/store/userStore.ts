import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: localStorage.getItem('userId') || null as string | null,
    username: localStorage.getItem('username') || 'Guest',
  }),
  actions: {
    initUser() {
      if (!this.userId) {
        this.userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', this.userId);
      }
    },
    setUser(id: string, name: string) {
      this.userId = id;
      this.username = name;
      localStorage.setItem('userId', id);
      localStorage.setItem('username', name);
    },
  },
})
