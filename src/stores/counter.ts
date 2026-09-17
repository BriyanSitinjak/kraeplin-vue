import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Pinia setup store ≈ Zustand: refs are state, computed is a selector, functions are actions.
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
