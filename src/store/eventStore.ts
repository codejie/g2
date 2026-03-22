import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { subscribeToEvents, reconnectSSE, getConnectionInfo, type ConnectionInfo } from '../api/events'
import { useServerStore } from './serverStore'
import { useMessageStore } from './messageStore'
import type { EventCallbacks, GlobalEvent } from '../api/types'

export const useEventStore = defineStore('event', () => {
  const serverStore = useServerStore()
  const messageStore = useMessageStore()
  const connection = ref<ConnectionInfo>(getConnectionInfo())
  const lastEvent = ref<GlobalEvent | null>(null)

  // 初始化 SSE 连接
  const init = () => {
    const callbacks: EventCallbacks = {
      onPartDelta: (payload) => {
        messageStore.handlePartDelta(payload)
      },
      onSessionStatus: (payload) => {
        console.log('[SSE] Session Status:', payload)
      },
      onError: (error) => {
        console.error('[SSE] Error:', error)
      },
      onReconnected: (reason) => {
        console.log('[SSE] Reconnected:', reason)
      }
    }

    // 订阅事件
    const unsubscribe = subscribeToEvents(callbacks)

    // 监听 Server URL 变化，自动重连
    watch(() => serverStore.baseUrl, () => {
      console.log('[SSE] Base URL changed, reconnecting...')
      reconnectSSE()
    })

    return unsubscribe
  }

  return {
    connection,
    lastEvent,
    init
  }
})
