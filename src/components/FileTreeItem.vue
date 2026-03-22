<template>
  <div class="space-y-0.5">
    <!-- Folder/File Item -->
    <div
      class="flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors group"
      :class="[isSelected ? 'bg-accent-brand/10 text-accent-brand' : 'hover:bg-bg-100 text-text-200']"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="toggle"
    >
      <div v-if="node.type === 'directory'" class="shrink-0 flex items-center">
        <ChevronRight
          v-if="!isExpanded"
          :size="14"
          class="text-text-400 group-hover:text-text-200"
        />
        <ChevronDown
          v-else
          :size="14"
          class="text-accent-brand"
        />
        <Folder
          :size="14"
          class="ml-0.5"
          :class="isExpanded ? 'text-accent-brand fill-accent-brand/20' : 'text-text-400'"
        />
      </div>

      <File v-else :size="14" class="text-text-500 shrink-0" />

      <span class="text-xs truncate font-medium">{{ node.name }}</span>
    </div>

    <!-- Recursive Sub-tree -->
    <div v-if="isExpanded && children.length" class="overflow-hidden">
      <FileTreeItem
        v-for="child in children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
        @select="$emit('select', $event)"
      />
    </div>

    <!-- Loading Placeholder -->
    <div
      v-if="isExpanded && loading"
      class="flex items-center gap-2 py-1 pl-4"
      :style="{ paddingLeft: `${(depth + 1) * 12 + 8}px` }"
    >
      <Loader2 :size="12" class="animate-spin text-text-400" />
      <span class="text-[10px] text-text-400 italic">Reading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Loader2
} from 'lucide-vue-next'
import { listDirectory } from '../api/file'
import type { FileNode } from '../api/types'

const props = defineProps<{
  node: FileNode
  depth: number
  isSelected?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', node: FileNode): void
}>()

const isExpanded = ref(false)
const children = ref<FileNode[]>([])
const loading = ref(false)
const workspacePath = import.meta.env.VITE_WORKSPACE || './'

const toggle = async () => {
  if (props.node.type === 'file') {
    emit('select', props.node)
    return
  }

  isExpanded.value = !isExpanded.value

  // 如果展开且尚未加载过子节点，则发起请求
  if (isExpanded.value && !children.value.length) {
    loading.value = true
    try {
      // 获取子目录列表
      children.value = await listDirectory(props.node.path, workspacePath)
    } catch (err) {
      console.error('Failed to expand directory:', err)
      isExpanded.value = false
    } finally {
      loading.value = false
    }
  }
}
</script>
