<template>
  <Transition name="slide-up">
    <div
      v-if="modelValue"
      class="absolute inset-x-0 bottom-0 z-50 flex flex-col bg-bg-000 border-t border-border-100 shadow-2xl h-[70%] max-h-[80vh] overflow-hidden rounded-t-xl"
    >
      <!-- Header -->
      <div class="h-11 px-4 border-b border-border-100 flex items-center justify-between bg-bg-100/30 backdrop-blur-md shrink-0">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-6 h-6 rounded bg-accent-brand/10 flex items-center justify-center text-accent-brand shrink-0">
            <FileCode :size="14" />
          </div>
          <span class="text-xs font-bold text-text-100 truncate tracking-tight">{{ fileName }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="handleDownload"
            class="p-1.5 hover:bg-bg-200 rounded-lg text-text-400 hover:text-text-100 transition-all active:scale-95"
            :title="$t('download')"
          >
            <Download :size="16" />
          </button>
          <button
            @click="close"
            class="p-1.5 hover:bg-bg-200 rounded-lg text-text-400 hover:text-text-100 transition-all active:scale-95"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative bg-bg-000">
        <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-bg-000/60 backdrop-blur-[2px] z-10 gap-3">
          <Loader2 class="animate-spin text-accent-brand" :size="24" />
          <span class="text-[10px] text-text-400 font-medium uppercase tracking-widest">Loading Content</span>
        </div>

        <div
          ref="scrollContainer"
          class="h-full overflow-auto custom-scrollbar p-5 font-mono text-[13px] leading-relaxed"
        >
          <div v-if="!loading" class="markdown-body" v-html="highlightedCode"></div>
        </div>
      </div>

      <!-- Footer / Status Bar -->
      <div class="h-6 px-3 bg-bg-100/50 border-t border-border-100 flex items-center justify-between shrink-0">
        <div class="text-[9px] text-text-400 font-medium uppercase tracking-wider truncate max-w-[70%]">
          {{ modelValue }}
        </div>
        <div class="text-[9px] text-text-500 font-mono">
          {{ language }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { X, FileCode, Loader2, Download } from 'lucide-vue-next'
import { getFileContent, getFileDownloadUrl } from '../api/file'
import { downloadFromUrl } from '../utils/downloadUtils'
import { useServerStore } from '../store/serverStore'
import { renderMarkdown } from '../utils/markdownUtils'
import { detectLanguage } from '../utils/languageUtils'
import { ElMessageBox } from 'element-plus'
import i18n from '../i18n'

const props = defineProps<{
  modelValue: string | null // Selected file path relative to workspace
}>()

const emit = defineEmits(['update:modelValue'])

const serverStore = useServerStore()
const loading = ref(false)
const highlightedCode = ref('')
const scrollContainer = ref<HTMLElement | null>(null)

const fileName = computed(() => props.modelValue?.split('/').pop() || '')
const language = computed(() => detectLanguage(props.modelValue || ''))

const close = () => emit('update:modelValue', null)

const fetchAndHighlight = async (path: string) => {
  loading.value = true
  try {
    const res = await getFileContent(path, serverStore.workspace)
    const lang = detectLanguage(path)

    highlightedCode.value = renderMarkdown(`\`\`\`${lang}\n${res.content}\n\`\`\``)

    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = 0
    }
  } catch (err) {
    console.error('[FilePreview] Failed to load content:', err)
    highlightedCode.value = `<div class="p-4 text-error-100 bg-error-100/10 rounded-lg border border-error-100/20 text-xs">
      Failed to load file content. Please check if the file exists and is accessible.
    </div>`
  } finally {
    loading.value = false
  }
}

const handleDownload = async () => {
  if (!props.modelValue) return

  try {
    await ElMessageBox.confirm(
      i18n.t('file.downloadConfirm', { name: fileName.value }),
      i18n.t('download'),
      {
        confirmButtonText: i18n.t('confirm'),
        cancelButtonText: i18n.t('cancel'),
        type: 'info',
      }
    )

    const url = getFileDownloadUrl(props.modelValue, serverStore.workspace)
    await downloadFromUrl(url, fileName.value)
  } catch (err) {
    // cancelled
  }
}

watch(() => props.modelValue, (newPath) => {
  if (newPath) {
    fetchAndHighlight(newPath)
  } else {
    highlightedCode.value = ''
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Shiki styles override */
:deep(.markdown-body) {
  background-color: transparent !important;
}

:deep(.shiki) {
  margin: 0 !important;
  padding: 0 !important;
  background-color: transparent !important;
}

:deep(.shiki pre) {
  margin: 0 !important;
  background-color: transparent !important;
  white-space: pre-wrap !important;
  word-break: break-all !important;
}

:deep(.shiki code) {
  counter-reset: step;
  counter-increment: step 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border-300) / 0.4);
  border-radius: 99px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
