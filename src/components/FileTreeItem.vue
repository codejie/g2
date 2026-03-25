<template>
  <div class="space-y-0.5">
    <!-- Folder/File Item -->
    <div
      class="flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors group relative"
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

      <span class="text-xs truncate font-medium flex-1">{{ node.name }}</span>

      <!-- Download Button (Visible on Hover) -->
      <button
        @click.stop="handleDownload"
        class="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-200 rounded text-text-400 transition-all shrink-0 active:scale-95"
        :title="$t('download')"
      >
        <Download :size="12" />
      </button>
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
  Loader2,
  Download
} from 'lucide-vue-next'
import { listDirectory, getFileDownloadUrl } from '../api/file'
import { downloadFromUrl } from '../utils/downloadUtils'
import { useServerStore } from '../store/serverStore'
import { ElMessageBox } from 'element-plus'
import i18n from '../i18n'
import type { FileNode } from '../api/types'

const props = defineProps<{
  node: FileNode
  depth: number
  isSelected?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', node: FileNode): void
}>()

const serverStore = useServerStore()
const isExpanded = ref(false)
const children = ref<FileNode[]>([])
const loading = ref(false)

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
      // 获取子目录列表，传入当前工作区
      children.value = await listDirectory(props.node.path, serverStore.workspace)
    } catch (err) {
      console.error('Failed to expand directory:', err)
      isExpanded.value = false
    } finally {
      loading.value = false
    }
  }
}

const handleDownload = async () => {
  const isDir = props.node.type === 'directory'
  const confirmMsg = isDir
    ? i18n.t('file.downloadConfirmDir', { name: props.node.name })
    : i18n.t('file.downloadConfirm', { name: props.node.name })

  try {
    await ElMessageBox.confirm(confirmMsg, i18n.t('download'), {
      confirmButtonText: i18n.t('confirm'),
      cancelButtonText: i18n.t('cancel'),
      type: 'info',
    })

    const url = getFileDownloadUrl(props.node.path, serverStore.workspace)
    const downloadName = isDir ? `${props.node.name}.zip` : props.node.name
    await downloadFromUrl(url, downloadName)
  } catch (err) {
    // cancelled
  }
}
</script>
