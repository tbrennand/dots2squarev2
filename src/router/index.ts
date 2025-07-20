import { createRouter, createWebHistory } from 'vue-router'
import HomeScreen from '../views/HomeScreen.vue'
import MatchLobby from '../views/MatchLobby.vue'
import GameBoard from '../views/GameBoard.vue'
import GameResult from '../views/GameResult.vue'

const routes = [
  { path: '/', component: HomeScreen },
  { path: '/lobby/:id', component: MatchLobby },
  { path: '/game/:id', component: GameBoard },
  { path: '/result/:id', component: GameResult },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
