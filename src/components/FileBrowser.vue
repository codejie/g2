<template>
  <div class="flex flex-col h-full bg-bg-000">
    <div class="p-3 border-b border-border-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <FolderOpen :size="16" class="text-accent-brand" />
        <span class="text-xs font-bold text-text-200 uppercase tracking-wider">Workspace</span>
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

    <div class="p-2 border-t border-border-100 bg-bg-100">
      <div class="flex items-center gap-2 px-2 py-1.5 rounded bg-bg-000 border border-border-200 text-[10px] text-text-300">
        <Monitor :size="12" />
        <span class="truncate">{{ workspacePath }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FolderOpen, RotateCw, Search, Monitor } from 'lucide-vue-next'
import { listDirectory } from '../api/file'
import type { FileNode } from '../api/types'
import FileTreeItem from './FileTreeItem.vue'

const files = ref<FileNode[]>([])
const loading = ref(false)
const workspacePath = import.meta.env.VITE_WORKSPACE || './'

const refresh = async () => {
  loading.value = true
  try {
    // 列出根目录
    files.value = await listDirectory('.', workspacePath)
  } catch (err) {
    console.error('Failed to list workspace:', err)
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (node: FileNode) => {
  console.log('Selected file:', node.path)
}

onMounted(refresh)
</script>
