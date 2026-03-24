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
      },
      onError: (error) => {
        console.error('[SSE] Error:', error)
      },
      onReconnected: (reason) => {
        console.log('[SSE] Reconnected:', reason)
      }
    }

    const unsubscribe = subscribeToEvents(callbacks)

    watch(() => serverStore.baseUrl, () => {
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
