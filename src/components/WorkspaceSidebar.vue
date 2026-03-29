<template>
  <div class="relative flex h-full">
    <!-- Toggle Button (Floating on the left edge, top position) -->
    <button
      @click="chatStore.toggleRightSidebar"
      class="absolute top-20 z-40 w-4 h-16 flex flex-col items-center justify-center bg-bg-000 border border-border-100 rounded-l-lg shadow-sm hover:bg-bg-100 transition-all group -left-4"
    >
      <div class="w-2 h-1 bg-border-300 rounded-full group-hover:bg-accent-brand transition-colors mb-1"></div>

      <ChevronRight
        v-if="!chatStore.isRightSidebarCollapsed"
        :size="12"
        class="text-text-400 group-hover:text-accent-brand transition-colors"
      />
      <ChevronLeft
        v-else
        :size="12"
        class="text-text-400 group-hover:text-accent-brand transition-colors"
      />

      <div class="w-2 h-1 bg-border-300 rounded-full group-hover:bg-accent-brand transition-colors mt-1"></div>
    </button>

    <!-- Sidebar Container -->
    <aside
      class="h-full border-l border-border-100 bg-bg-000 flex flex-col transition-[opacity] duration-300 ease-in-out relative overflow-hidden"
      :style="{
        width: chatStore.isRightSidebarCollapsed ? '0px' : chatStore.rightSidebarWidth + 'px',
        opacity: chatStore.isRightSidebarCollapsed ? 0 : 1
      }"
    >
      <!-- Resize Handle -->
      <div
        v-if="!chatStore.isRightSidebarCollapsed"
        class="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-accent-brand/30 active:bg-accent-brand/50 transition-colors z-50"
        @mousedown="startResizing"
      ></div>

      <div
        v-if="!chatStore.isRightSidebarCollapsed"
        class="flex-1 flex flex-col h-full animate-in fade-in duration-300"
        :style="{ minWidth: chatStore.rightSidebarWidth + 'px' }"
      >
        <FileBrowser />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useChatStore } from '../store/chatStore'
import FileBrowser from './FileBrowser.vue'

const chatStore = useChatStore()

const isResizing = ref(false)

const startResizing = (e: MouseEvent) => {
  e.preventDefault()
  isResizing.value = true
  document.addEventListener('mousemove', handleResizing)
  document.addEventListener('mouseup', stopResizing)
  document.body.style.cursor = 'col-resize'
}

const handleResizing = (e: MouseEvent) => {
  if (!isResizing.value) return
  // 侧边栏在右侧，宽度 = 窗口宽度 - 鼠标位置
  const newWidth = window.innerWidth - e.clientX
  chatStore.setRightSidebarWidth(newWidth)
}

const stopResizing = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResizing)
  document.removeEventListener('mouseup', stopResizing)
  document.body.style.cursor = ''
}

onUnmounted(() => {
  stopResizing()
})
</script>
