<template>
  <aside
    class="relative h-full border-r border-border-100 bg-bg-000 flex flex-col transition-all duration-300 ease-in-out z-30"
    :style="{ width: isCollapsed ? '0px' : '260px', opacity: isCollapsed ? 0 : 1, marginLeft: isCollapsed ? '-260px' : '0px' }"
  >
    <!-- Header -->
    <div class="p-4 flex items-center gap-3 border-b border-border-100 h-14 shrink-0 overflow-hidden">
      <div class="w-8 h-8 rounded-lg bg-accent-brand flex items-center justify-center text-white shrink-0 shadow-sm">
        <Box :size="20" />
      </div>
      <span class="font-bold text-text-100 truncate tracking-tight">G2 Engine</span>
    </div>

    <!-- Actions -->
    <div class="p-2 space-y-1">
      <button
        @click="handleCreateProject"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-accent-brand text-white text-sm font-medium hover:bg-accent-main-000 transition-colors group shadow-sm"
      >
        <Plus :size="18" class="group-hover:rotate-90 transition-transform duration-300" />
        <span>创建项目</span>
      </button>
    </div>

    <div class="px-4 py-2 text-[10px] font-bold text-text-400 uppercase tracking-wider">
      项目列表
    </div>

    <!-- Chat List (Simulated Project List) -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
      <div
        v-for="i in 5"
        :key="i"
        class="group px-3 py-2.5 rounded-xl hover:bg-bg-100 cursor-pointer text-sm text-text-200 flex items-center gap-3 transition-colors"
      >
        <MessageSquare :size="16" class="shrink-0 text-text-400 group-hover:text-accent-brand transition-colors" />
        <span class="truncate">Project {{ i }}</span>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="p-3 border-t border-border-100 space-y-1 bg-bg-000">
      <button
        @click="$emit('open-settings')"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-100 text-sm text-text-200 transition-colors group"
      >
        <Settings :size="18" class="text-text-400 group-hover:rotate-45 transition-transform duration-500" />
        <span>Settings</span>
      </button>
    </div>
  </aside>

  <!-- Toggle Button (Floating) -->
  <button
    @click="toggle"
    class="absolute top-1/2 -translate-y-1/2 z-40 w-6 h-12 flex items-center justify-center bg-bg-000 border border-border-100 rounded-r-lg shadow-sm hover:bg-bg-100 transition-all group"
    :style="{ left: isCollapsed ? '0px' : '260px' }"
  >
    <div class="w-1 h-4 bg-border-300 rounded-full group-hover:bg-accent-brand transition-colors"></div>
    <ChevronLeft
      v-if="!isCollapsed"
      :size="14"
      class="absolute text-text-400 group-hover:text-accent-brand transition-colors"
    />
    <ChevronRight
      v-else
      :size="14"
      class="absolute text-text-400 group-hover:text-accent-brand transition-colors"
    />
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
  Plus
} from 'lucide-vue-next'
import { useChatStore } from '../store/chatStore'

const isCollapsed = ref(false)
const chatStore = useChatStore()

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleCreateProject = () => {
  chatStore.startNewSession()
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
