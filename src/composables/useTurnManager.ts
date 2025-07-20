import { ref, Ref } from 'vue';

export function useTurnManager(players: Ref<string[]>) {
  const currentPlayerIndex = ref(0);

  const currentPlayer = ref(players.value[currentPlayerIndex.value]);

  function nextTurn() {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
    currentPlayer.value = players.value[currentPlayerIndex.value];
  }

  function setCurrentPlayer(playerId: string) {
    const index = players.value.indexOf(playerId);
    if (index !== -1) {
      currentPlayerIndex.value = index;
      currentPlayer.value = playerId;
    }
  }

  return { currentPlayer, nextTurn, setCurrentPlayer };
}
