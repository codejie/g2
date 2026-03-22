import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiMessageWithParts, ApiTextPart, PartDeltaPayload } from '../api/types'
import { getSessionMessages } from '../api/message'

export const useMessageStore = defineStore('message', () => {
  const messages = ref<ApiMessageWithParts[]>([])
  const isStreaming = ref(false)

  // 加载历史消息
  const loadMessages = async (sessionId: string, directory?: string) => {
    try {
      const msgs = await getSessionMessages(sessionId, undefined, directory)
      messages.value = msgs
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
  }

  // 手动添加用户消息 (在 API 返回前显示)
  const addUserMessage = (text: string) => {
    const userMsg: ApiMessageWithParts = {
      id: `temp-${Date.now()}`,
      role: 'user',
      parts: [{ type: 'text', text } as ApiTextPart],
      createdAt: Date.now()
    } as any
    messages.value.push(userMsg)
  }

  // 处理 SSE 推送的消息增量 (Delta)
  const handlePartDelta = (payload: PartDeltaPayload) => {
    const { messageID, delta } = payload

    // 查找对应消息
    let message = messages.value.find(m => m.id === messageID)

    if (!message) {
      // 如果消息不存在，创建一个占位 (Assistant 消息)
      message = {
        id: messageID,
        role: 'assistant',
        parts: [{ type: 'text', text: '' } as ApiTextPart],
        createdAt: Date.now(),
      } as any
      messages.value.push(message)
    }

    // 更新最后一个 text part 的内容
    const lastPart = message.parts[message.parts.length - 1]
    if (lastPart && lastPart.type === 'text') {
      (lastPart as ApiTextPart).text += delta
    }
  }

  return {
    messages,
    isStreaming,
    loadMessages,
    clearMessages,
    addUserMessage,
    handlePartDelta
  }
})
