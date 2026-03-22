import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const hasSession = ref(false)

  const startNewSession = () => {
    hasSession.value = true
  }

  const resetSession = () => {
    hasSession.value = false
  }

  return {
    hasSession,
    startNewSession,
    resetSession
  }
})
