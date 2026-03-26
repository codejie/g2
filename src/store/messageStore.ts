import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiMessageWithParts, ApiTextPart } from '../api/types'
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

  /**
   * 1. 核心修复：更新 Part 类型并锁定，防止被后续错误字段覆盖
   * 由 message.part.updated 事件触发
   */
  const updatePartType = (messageID: string, partID: string, type: string) => {
    const messageIndex = messages.value.findIndex(m => (m.info?.id === messageID))
    if (messageIndex === -1) return

    const message = messages.value[messageIndex]
    const partIndex = message.parts.findIndex((p: any) => p.id === partID)

    if (partIndex === -1) {
      message.parts.push({
        id: partID,
        type: type,
        text: ''
      } as any)
    } else {
      const part = message.parts[partIndex] as any
      if (part.type !== type) {
        if (part.type === 'text' && (type === 'reasoning' || type === 'thought' || type === 'thinking')) {
          console.log(`[STORE-TYPE] Part ${partID} 升级为推理类型: ${type}`)
          part.type = 'reasoning'
          message.parts[partIndex] = { ...part }
        } else if (type === 'text' && part.type === 'reasoning') {
          console.warn(`[STORE-TYPE] 拒绝将推理 Part ${partID} 降级为 text`)
        } else {
          part.type = type
          message.parts[partIndex] = { ...part }
        }
      }
    }

    message.parts = [...message.parts]
    messages.value[messageIndex] = { ...message }
  }

  // 手动添加用户消息
  const addUserMessage = (text: string) => {
    const userMsg: ApiMessageWithParts = {
      info: {
        id: `temp-${Date.now()}`,
        role: 'user',
        time: { created: Date.now() },
      } as any,
      parts: [{ type: 'text', text } as ApiTextPart],
    }
    messages.value.push(userMsg)
  }

  /**
   * 2. 处理增量内容
   * 增加逻辑：如果 Part 已经是 reasoning，忽略 delta 包中的 field: "text"
   */
  const handlePartDelta = (payload: any) => {
    const { messageID, partID, field, delta } = payload

    let messageIndex = messages.value.findIndex(m => (m.info?.id === messageID))

    if (messageIndex === -1) {
      const newMessage: ApiMessageWithParts = {
        info: {
          id: messageID,
          role: 'assistant',
          time: { created: Date.now() },
        } as any,
        parts: [],
      }
      messages.value.push(newMessage)
      messageIndex = messages.value.length - 1
    }

    const message = messages.value[messageIndex]
    let partIndex = message.parts.findIndex((p: any) => p.id === partID)

    if (partIndex === -1) {
      const type = (field === 'reasoning' || field === 'thought') ? 'reasoning' : 'text'
      const newPart = {
        id: partID,
        type: type,
        text: '',
      } as any
      message.parts.push(newPart)
      partIndex = message.parts.length - 1
    }

    const part = message.parts[partIndex]

    // 增量内容时的类型保护
    const p = part as any
    if ((field === 'reasoning' || field === 'thought') && p.type !== 'reasoning') {
      p.type = 'reasoning'
    }

    if (part.type === 'text' || part.type === 'reasoning') {
      (part as any).text += (delta || '')
      // 强制触发响应式
      message.parts = [...message.parts]
      messages.value[messageIndex] = { ...message }
    }
  }

  return {
    messages,
    isStreaming,
    loadMessages,
    clearMessages,
    addUserMessage,
    handlePartDelta,
    updatePartType
  }
})
