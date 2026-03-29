<template>
  <div class="flex flex-col h-full bg-bg-000">
    <div class="p-3 border-b border-border-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <FolderOpen :size="16" class="text-accent-brand" />
        <span class="text-xs font-bold text-text-200 uppercase tracking-wider">{{ $t('workspace.title') }}</span>
      </div>
      <button @click="refresh" :class="{ 'animate-spin': loading }" class="p-1 hover:bg-bg-100 rounded text-text-400">
        <RotateCw :size="14" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
      <div v-if="loading && !files.length" class="flex items-center justify-center h-20">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="!files.length" class="flex flex-col items-center justify-center h-40 opacity-40">
        <Search :size="32" class="mb-2" />
        <p class="text-xs">No files found</p>
      </div>

      <div v-else class="space-y-0.5">
        <FileTreeItem
          v-for="node in files"
          :key="node.path"
          :node="node"
          :depth="0"
          @select="handleFileSelect"
        />
      </div>
    </div>

    <FilePreviewPanel v-model="selectedFile" />

    <div class="px-4 py-3 border-t border-border-100 bg-bg-000">
      <div class="flex items-center gap-2 text-[10px] text-text-400 font-medium">
        <Monitor :size="12" class="opacity-70" />
        <span class="truncate opacity-70">{{ serverStore.workspace }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { FolderOpen, RotateCw, Search, Monitor } from 'lucide-vue-next'
import { listDirectory } from '../api/file'
import { useServerStore } from '../store/serverStore'
import type { FileNode } from '../api/types'
import FileTreeItem from './FileTreeItem.vue'
import FilePreviewPanel from './FilePreviewPanel.vue'

const emit = defineEmits(['select-file'])
const serverStore = useServerStore()
const files = ref<FileNode[]>([])
const loading = ref(false)
const selectedFile = ref<string | null>(null)

const refresh = async () => {
  if (!serverStore.workspace) return
  loading.value = true
  try {
    // 列出根目录
    files.value = await listDirectory('.', serverStore.workspace)
  } catch (err) {
    console.error('Failed to list workspace:', err)
    files.value = []
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (node: FileNode) => {
  if (node.type === 'file') {
    selectedFile.value = node.path
  }
}

// 监听工作区变化自动刷新
watch(() => serverStore.workspace, refresh)

// 监听文件树刷新触发
watch(() => serverStore.fileTreeRefreshKey, () => {
  console.log('[FileBrowser] Refresh triggered by key change')
  refresh()
})

onMounted(refresh)
</script>
