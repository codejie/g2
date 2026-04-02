import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createSession, getSessions, updateSession, deleteSession, summarizeSession } from '../api/session'
import { getSkills } from '../api/skill'
import { sendMessageAsync } from '../api/message'
import { useServerStore } from './serverStore'
import { useModelStore } from './modelStore'
import { useMessageStore } from './messageStore'
import type { ApiSession, Skill } from '../api/types'
import i18n from '../i18n'

export const useChatStore = defineStore('chat', () => {
  const serverStore = useServerStore()
  const modelStore = useModelStore()
  const messageStore = useMessageStore()

  const hasSession = ref(false)
  const currentSession = ref<ApiSession | null>(null)
  const sessionList = ref<ApiSession[]>([])
  const skills = ref<Skill[]>([])
  const loading = ref(false)
  const listLoading = ref(false)
  const sending = ref(false)
  const pendingMessage = ref('')
  const isSidebarCollapsed = ref(false)
  const isRightSidebarCollapsed = ref(false)
  const rightSidebarWidth = ref(320)
  const currentMode = ref<'build' | 'plan'>('build')

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const toggleRightSidebar = () => {
    isRightSidebarCollapsed.value = !isRightSidebarCollapsed.value
  }

  const setRightSidebarWidth = (width: number) => {
    rightSidebarWidth.value = Math.max(200, Math.min(width, 800))
  }

  const fetchSkills = async () => {
    try {
      skills.value = await getSkills(serverStore.workspace)
    } catch (error) {
      console.error('[ChatStore] Failed to fetch skills:', error)
    }
  }

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
      const session = await createSession({
        directory: serverStore.workspace,
        title: i18n.t('sidebar.newChat')
      })

      messageStore.clearMessages()
      await selectSession(session)

      if (pendingMessage.value) {
        const text = pendingMessage.value
        pendingMessage.value = ''
        messageStore.addUserMessage(text)
        await sendPrompt(text)
      }

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

  const selectSession = async (session: ApiSession) => {
    currentSession.value = session
    hasSession.value = true

    // 持久化
    localStorage.setItem('g2_current_session_id', session.id)

    // 加载消息
    await messageStore.loadMessages(session.id, serverStore.workspace)
  }

	const generateFallbackTitle = (text: string): string => {
		const maxChars = 32
		const maxChinese = 12
		let result = ''
		let chineseCount = 0
		let charCount = 0
		
		for (const char of text) {
			if (char === '\n') break
			if (/[\u4e00-\u9fa5]/.test(char)) {
				chineseCount++
				if (chineseCount > maxChinese) break
			} else {
				charCount++
				if (charCount > maxChars) break
			}
			result += char
		}
		
		return result.trim() || text.substring(0, maxChars)
	}

	const sendPrompt = async (text: string) => {
		if (!text.trim()) return

		if (!currentSession.value) {
			pendingMessage.value = text
			await startNewSession()
			return
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
        agent: currentMode.value,
        directory: serverStore.workspace
      })

      // 自动生成标题逻辑
      const isDefaultTitle =
        !currentSession.value?.title ||
        currentSession.value.title === i18n.t('sidebar.newChat') ||
        currentSession.value.title === currentSession.value.id

	if (isDefaultTitle) {
		console.log('[ChatStore] Triggering AI summary for title...')
		summarizeSession(currentSession.value.id, {
			providerID: modelStore.selectedModel.providerId,
			modelID: modelStore.selectedModel.id,
			auto: true
		}, serverStore.workspace).then(() => {
			fetchSessions()
		}).catch(async err => {
			console.error('[ChatStore] Failed to summarize session:', err)
			const fallbackTitle = generateFallbackTitle(text)
			await updateSessionTitle(currentSession.value!.id, fallbackTitle)
		})
	}
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

  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      await updateSession(sessionId, { title }, serverStore.workspace)
      // 更新列表中的标题
      const session = sessionList.value.find(s => s.id === sessionId)
      if (session) {
        session.title = title
      }
      // 如果是当前会话，更新当前会话标题
      if (currentSession.value?.id === sessionId) {
        currentSession.value.title = title
      }
    } catch (error) {
      console.error('[ChatStore] Failed to update session title:', error)
      throw error
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId, serverStore.workspace)
      // 从列表中移除
      sessionList.value = sessionList.value.filter(s => s.id !== sessionId)
      // 如果是当前会话，重置
      if (currentSession.value?.id === sessionId) {
        resetSession()
      }
    } catch (error) {
      console.error('[ChatStore] Failed to delete session:', error)
      throw error
    }
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
    resetSession,
    updateSessionTitle,
    handleDeleteSession,
    isSidebarCollapsed,
    isRightSidebarCollapsed,
    rightSidebarWidth,
    toggleSidebar,
    toggleRightSidebar,
    setRightSidebarWidth,
    skills,
    fetchSkills,
    currentMode,
    pendingMessage
  }
})
