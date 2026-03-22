import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createSession } from '../api/session'
import { sendMessageAsync } from '../api/message'
import { useServerStore } from './serverStore'
import { useModelStore } from './modelStore'
import type { ApiSession } from '../api/types'

export const useChatStore = defineStore('chat', () => {
  const serverStore = useServerStore()
  const modelStore = useModelStore()

  const hasSession = ref(false)
  const currentSession = ref<ApiSession | null>(null)
  const loading = ref(false)
  const sending = ref(false)

  const startNewSession = async () => {
    loading.value = true
    try {
      const session = await createSession({
        directory: serverStore.workspace
      })
      currentSession.value = session
      hasSession.value = true
      return session
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const sendPrompt = async (text: string) => {
    if (!text.trim()) return

    // 如果还没有 session，先创建一个
    if (!currentSession.value) {
      await startNewSession()
    }

    if (!currentSession.value || !modelStore.selectedModel) {
      throw new Error('No active session or model selected')
    }

    sending.value = true
    try {
      await sendMessageAsync({
        sessionId: currentSession.value.id,
        text,
        attachments: [], // 后续可扩展附件支持
        model: {
          providerID: modelStore.selectedModel.providerId,
          modelID: modelStore.selectedModel.id
        },
        directory: serverStore.workspace
      })
    } catch (error) {
      console.error('Failed to send prompt:', error)
      throw error
    } finally {
      sending.value = false
    }
  }

  const resetSession = () => {
    hasSession.value = false
    currentSession.value = null
  }

  return {
    hasSession,
    currentSession,
    loading,
    sending,
    startNewSession,
    sendPrompt,
    resetSession
  }
})
