<template>
  <aside
    class="relative h-full border-r border-border-100 bg-bg-000 flex flex-col transition-all duration-300 ease-in-out z-30 overflow-hidden"
    :style="{ width: chatStore.isSidebarCollapsed ? '0px' : '260px', opacity: chatStore.isSidebarCollapsed ? 0 : 1 }"
  >
    <!-- Header -->
    <div class="p-4 flex items-center gap-3 border-b border-border-100 h-14 shrink-0 overflow-hidden">
      <div class="w-8 h-8 rounded-lg bg-accent-brand flex items-center justify-center text-white shrink-0 shadow-sm">
        <Box :size="20" />
      </div>
      <span class="font-bold text-text-100 truncate tracking-tight">{{ $t('app_title') }}</span>
    </div>

    <!-- Actions -->
    <div class="p-2 pt-6 space-y-1">
      <button
        @click="handleCreateProject"
        :disabled="chatStore.loading"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-accent-brand text-white text-sm font-medium hover:bg-accent-main-000 transition-colors group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus v-if="!chatStore.loading" :size="18" class="group-hover:rotate-90 transition-transform duration-300" />
        <Loader2 v-else :size="18" class="animate-spin" />
        <span>{{ chatStore.loading ? $t('sidebar.creating') : $t('sidebar.newChat') }}</span>
      </button>
    </div>

    <!-- Current Session Info -->
    <div v-if="chatStore.currentSession" class="px-2 py-1">
      <div class="px-4 py-2 text-[10px] font-bold text-text-400 uppercase tracking-wider">
        {{ $t('sidebar.currentSession') }}
      </div>
      <div class="px-3 py-2 rounded-xl bg-accent-brand/5 border border-accent-brand/10 flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-success-100 animate-pulse"></div>
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-xs font-bold text-text-100 truncate">{{ chatStore.currentSession.title || $t('sidebar.activeSession') }}</span>
          <span class="text-[10px] text-text-400 truncate opacity-70">{{ chatStore.currentSession.id }}</span>
        </div>
      </div>
    </div>

    <div class="px-4 py-2 text-[10px] font-bold text-text-400 uppercase tracking-wider mt-2">
      {{ $t('sidebar.sessionHistory') }}
    </div>

    <!-- Session List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
      <div v-if="chatStore.listLoading && chatStore.sessionList.length === 0" class="p-4 flex justify-center">
        <Loader2 :size="20" class="animate-spin text-text-400" />
      </div>
      <div
        v-else-if="chatStore.sessionList.length === 0"
        class="p-4 text-center text-xs text-text-400 italic"
      >
        {{ $t('sidebar.noHistory') }}
      </div>
      <div
        v-for="session in chatStore.sessionList"
        :key="session.id"
        @click="handleSelectSession(session)"
        class="group px-3 py-1.5 rounded-xl hover:bg-bg-100 cursor-pointer text-sm text-text-200 flex items-center gap-3 transition-colors"
        :class="[chatStore.currentSession?.id === session.id ? 'bg-bg-100' : '']"
      >
        <MessageSquare
          :size="16"
          class="shrink-0 transition-colors"
          :class="[chatStore.currentSession?.id === session.id ? 'text-accent-brand' : 'text-text-400 group-hover:text-accent-brand']"
        />
        <template v-if="editingSessionId === session.id">
          <input
            v-model="editTitle"
            ref="editInput"
            @blur="handleSaveEdit(session.id)"
            @keyup.enter="handleSaveEdit(session.id)"
            @keyup.esc="handleCancelEdit"
            @click.stop
            class="flex-1 bg-bg-000 border border-accent-brand/50 rounded px-1.5 py-0.5 text-xs focus:outline-none"
          />
        </template>
        <template v-else>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="truncate text-sm font-medium text-text-100">{{ session.title || session.id }}</span>
            <span class="text-[10px] text-text-400 mt-0.5">{{ formatDate(session.time.created) }}</span>
          </div>
          <div class="invisible group-hover:visible flex items-center gap-1 shrink-0">
            <button
              @click.stop="handleStartEdit(session)"
              class="p-1 hover:bg-bg-200 rounded text-text-400 hover:text-accent-brand transition-colors"
              :title="$t('sidebar.rename')"
            >
              <Pencil :size="14" />
            </button>
            <button
              @click.stop="handleDeleteSession(session.id)"
              class="p-1 hover:bg-danger-100/10 rounded text-text-400 hover:text-danger-100 transition-colors"
              :title="$t('sidebar.delete')"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-3 border-t border-border-100 space-y-1 bg-bg-000">
      <button
        @click="$emit('open-settings')"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-100 text-sm text-text-200 transition-colors group"
      >
        <Settings :size="18" class="text-text-400 group-hover:rotate-45 transition-transform duration-500" />
        <span>{{ $t('sidebar.settings') }}</span>
      </button>
    </div>
  </aside>

  <!-- Toggle Button (Floating) -->
  <button
    @click="chatStore.toggleSidebar"
    class="absolute top-20 z-40 w-4 h-16 flex flex-col items-center justify-center bg-bg-000 border border-border-100 rounded-r-lg shadow-sm hover:bg-bg-100 transition-all group"
    :style="{ left: chatStore.isSidebarCollapsed ? '0px' : '260px' }"
  >
    <div class="w-2 h-1 bg-border-300 rounded-full group-hover:bg-accent-brand transition-colors mb-1"></div>
    <ChevronLeft
      v-if="!chatStore.isSidebarCollapsed"
      :size="12"
      class="text-text-400 group-hover:text-accent-brand transition-colors"
    />
    <ChevronRight
      v-else
      :size="12"
      class="text-text-400 group-hover:text-accent-brand transition-colors"
    />
    <div class="w-2 h-1 bg-border-300 rounded-full group-hover:bg-accent-brand transition-colors mt-1"></div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Box,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-vue-next'
import { useChatStore } from '../store/chatStore'
import { nextTick } from 'vue'
import type { ApiSession } from '../api/types'
import { ElMessageBox, ElMessage } from 'element-plus'
import i18n from '../i18n'

const chatStore = useChatStore()

const editingSessionId = ref<string | null>(null)
const editTitle = ref('')
const editInput = ref<HTMLInputElement | null>(null)

const handleCreateProject = async () => {
  try {
    await chatStore.startNewSession()
  } catch (err) {
    console.error('Failed to create project:', err)
  }
}

const handleSelectSession = (session: ApiSession) => {
  if (editingSessionId.value === session.id) return
  chatStore.selectSession(session)
}

const formatDate = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isThisYear = date.getFullYear() === now.getFullYear()
  if (isThisYear) {
    return `${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return date.toLocaleDateString()
}

const handleStartEdit = (session: ApiSession) => {
  editingSessionId.value = session.id
  editTitle.value = session.title || session.id
  nextTick(() => {
    editInput.value?.focus()
  })
}

const handleSaveEdit = async (sessionId: string) => {
  if (!editingSessionId.value) return
  const title = editTitle.value.trim()
  if (title) {
    try {
      await chatStore.updateSessionTitle(sessionId, title)
    } catch (err) {
      console.error('Failed to update title:', err)
    }
  }
  editingSessionId.value = null
}

const handleCancelEdit = () => {
  editingSessionId.value = null
}

const handleDeleteSession = async (sessionId: string) => {
  try {
    await ElMessageBox.confirm(
      i18n.t('sidebar.deleteConfirmDesc'),
      i18n.t('sidebar.deleteConfirmTitle'),
      {
        confirmButtonText: i18n.t('delete'),
        cancelButtonText: i18n.t('cancel'),
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        center: true
      }
    )

    await chatStore.handleDeleteSession(sessionId)
    ElMessage.success(i18n.t('sidebar.deleteSuccess'))
  } catch (err) {
    if (err !== 'cancel') {
      console.error('Failed to delete session:', err)
      ElMessage.error(i18n.t('sidebar.deleteError'))
    }
  }
}

defineEmits<{
  (e: 'open-settings'): void
}>()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: var(--border-200);
}
</style>
