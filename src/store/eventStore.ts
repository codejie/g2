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
  const lastHeartbeatTime = ref<number>(Date.now())
  const isServerActive = ref<boolean>(true)

  let heartbeatCheckTimer: ReturnType<typeof setTimeout> | null = null

  const startHeartbeatCheck = () => {
    if (heartbeatCheckTimer) clearInterval(heartbeatCheckTimer)
    heartbeatCheckTimer = setInterval(() => {
      const now = Date.now()
      // 如果超过 30 秒没有收到心跳，标记为不活跃
      isServerActive.value = (now - lastHeartbeatTime.value) < 30000
    }, 5000)
  }

  const init = () => {
    const callbacks: EventCallbacks = {
      onPartDelta: (payload) => {
        messageStore.handlePartDelta(payload)
      },
      onPartUpdated: (payload: any) => {
        const part = payload.part
        const mID = part.messageID || part.messageId || part.message_id
        const pID = part.id || part.partID || part.id
        const pType = part.type || part.field || part.type

        if (mID && pID && pType) {
          messageStore.updatePartType(mID, pID, pType)
        }
      },
      onSessionStatus: (payload) => {
        console.log('[SSE] Session Status:', payload)
        // 消息完成时触发文件树刷新 (idle 表示工作完成)
        if (payload.status && typeof payload.status === 'object' && payload.status.type === 'idle') {
          serverStore.triggerFileTreeRefresh()
        }
      },
      onServerHeartbeat: () => {
        lastHeartbeatTime.value = Date.now()
        isServerActive.value = true
      },
      onError: (error) => {
        console.error('[SSE] Error:', error)
      },
      onReconnected: (reason) => {
        console.log('[SSE] Reconnected:', reason)
        lastHeartbeatTime.value = Date.now()
        isServerActive.value = true
      }
    }

    const unsubscribe = subscribeToEvents(callbacks)
    startHeartbeatCheck()

    watch(() => serverStore.baseUrl, () => {
      reconnectSSE()
    })

    return () => {
      unsubscribe()
      if (heartbeatCheckTimer) clearInterval(heartbeatCheckTimer)
    }
  }

  return {
    connection,
    lastEvent,
    isServerActive,
    init
  }
})
