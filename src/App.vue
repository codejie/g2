<template>
  <div class="relative h-[var(--app-height)] flex bg-bg-100 overflow-hidden"
       :style="{ paddingTop: 'var(--safe-area-inset-top)' }">

    <!-- Sidebar Component -->
    <Sidebar @open-settings="showSettings = true" />

    <!-- Main Content Area -->
    <MainView />

    <!-- Right Panel -->
    <aside class="hidden xl:flex w-80 border-l border-border-100 bg-bg-000 flex-col">
      <FileBrowser />
    </aside>

    <!-- Dialogs -->
    <SettingsDialog v-model="showSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useModelStore } from './store/modelStore'
import { useEventStore } from './store/eventStore'
import { useServerStore } from './store/serverStore'
import { useChatStore } from './store/chatStore'
import Sidebar from './components/Sidebar.vue'
import MainView from './components/MainView.vue'
import FileBrowser from './components/FileBrowser.vue'
import SettingsDialog from './components/SettingsDialog.vue'

const modelStore = useModelStore()
const eventStore = useEventStore()
const serverStore = useServerStore()
const chatStore = useChatStore()

const showSettings = ref(false)
let unsubscribeSSE: (() => void) | null = null

onMounted(async () => {
  // 1. 同步服务器真实路径
  await serverStore.initializePaths()

  // 2. 获取初始模型列表
  modelStore.fetchModels()

  // 3. 获取会话列表 (在路径同步后执行)
  chatStore.fetchSessions()

  // 4. 初始化 SSE 全局连接
  unsubscribeSSE = eventStore.init()
})

onUnmounted(() => {
  if (unsubscribeSSE) {
    unsubscribeSSE()
  }
})
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border-300) / 0.4);
  border-radius: 99px;
}
</style>
