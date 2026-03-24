import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createSession, getSessions } from '../api/session'
import { sendMessageAsync } from '../api/message'
import { useServerStore } from './serverStore'
import { useModelStore } from './modelStore'
import { useMessageStore } from './messageStore'
import type { ApiSession } from '../api/types'

export const useChatStore = defineStore('chat', () => {
  const serverStore = useServerStore()
  const modelStore = useModelStore()
  const messageStore = useMessageStore()

  const hasSession = ref(false)
  const currentSession = ref<ApiSession | null>(null)
  const sessionList = ref<ApiSession[]>([])
  const loading = ref(false)
  const listLoading = ref(false)
  const sending = ref(false)

  // 获取 Session 列表并尝试恢复当前 Session
  const fetchSessions = async () => {
    listLoading.value = true
    try {
      console.log('[ChatStore] Fetching sessions for workspace:', serverStore.workspace)
      const sessions = await getSessions({
        directory: serverStore.workspace,
        limit: 50 // 增加限制，确保能看到
      })
      console.log('[ChatStore] Sessions received:', sessions)
      sessionList.value = sessions

      // 自动恢复逻辑：从 LocalStorage 读取
      const savedSessionId = localStorage.getItem('g2_current_session_id')
      if (!currentSession.value && savedSessionId) {
        const found = sessions.find(s => s.id === savedSessionId)
        if (found) {
          console.log('[ChatStore] Auto-restoring session:', savedSessionId)
          selectSession(found)
        }
      }

      return sessions
    } catch (error) {
      console.error('[ChatStore] Failed to fetch sessions:', error)
    } finally {
      listLoading.value = false
    }
  }

  const startNewSession = async () => {
    loading.value = true
    try {
      console.log('[ChatStore] Creating new session...')
      const session = await createSession({
        directory: serverStore.workspace
      })
      console.log('[ChatStore] Session created:', session)

      messageStore.clearMessages()
      selectSession(session)

      // 强制刷新列表
      await fetchSessions()
      return session
    } catch (error) {
      console.error('[ChatStore] Failed to create session:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const selectSession = (session: ApiSession) => {
    console.log('[ChatStore] Selecting session:', session.id)
    currentSession.value = session
    hasSession.value = true

    // 持久化
    localStorage.setItem('g2_current_session_id', session.id)

    // 加载消息
    messageStore.loadMessages(session.id, serverStore.workspace)
  }

  const sendPrompt = async (text: string) => {
    if (!text.trim()) return

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
        attachments: [],
        model: {
          providerID: modelStore.selectedModel.providerId,
          modelID: modelStore.selectedModel.id
        },
        directory: serverStore.workspace
      })
    } catch (error) {
      console.error('[ChatStore] Failed to send prompt:', error)
      throw error
    } finally {
      sending.value = false
    }
  }

  const resetSession = () => {
    hasSession.value = false
    currentSession.value = null
    localStorage.removeItem('g2_current_session_id')
    messageStore.clearMessages()
  }

  return {
    hasSession,
    currentSession,
    sessionList,
    loading,
    listLoading,
    sending,
    fetchSessions,
    startNewSession,
    selectSession,
    sendPrompt,
    resetSession
  }
})
