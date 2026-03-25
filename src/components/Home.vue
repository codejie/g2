<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Main Content Split -->
    <div class="flex-1 flex flex-col min-h-0 relative">
      <!-- Upper Section: Chat Area -->
      <div
        class="relative overflow-hidden flex flex-col transition-all duration-500 ease-in-out"
        :style="{ flex: !chatStore.hasSession ? '3' : '1' }"
      >
        <div
          ref="scrollContainer"
          class="absolute inset-0 overflow-y-auto custom-scrollbar p-4 flex flex-col"
          :class="[!chatStore.hasSession ? 'justify-center items-center' : '']"
        >
          <!-- Case 1: Empty state (Initial) -->
          <div v-if="!chatStore.hasSession" class="w-full max-w-3xl flex flex-col items-center">
            <!-- Icon -->
            <div class="w-16 h-16 rounded-2xl bg-accent-brand flex items-center justify-center text-white mb-6 shadow-lg shadow-accent-brand/20 shrink-0">
              <Sparkles :size="32" />
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-text-100 mb-2">{{ $t('home.welcome') }}</h2>

            <!-- Chat Input Box (In Empty State) -->
            <ChatInput />
          </div>

          <!-- Case 2: Chat state (With messages) -->
          <div v-else class="max-w-3xl mx-auto w-full pt-8 space-y-8 pb-40">
            <div
              v-for="msg in messageStore.messages"
              :key="msg.info?.id || msg.id"
              class="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white"
                   :class="(msg.role === 'user' || msg.info?.role === 'user') ? 'bg-bg-300 text-text-200' : 'bg-accent-brand'">
                <User v-if="msg.role === 'user' || msg.info?.role === 'user'" :size="16" />
                <Sparkles v-else :size="18" />
              </div>

              <div class="space-y-2 flex-1 overflow-hidden min-w-0">
                <div v-for="(part, idx) in msg.parts" :key="idx">
                  <template v-if="part.type === 'text'">
                    <div
                      v-if="(part as any).text"
                      class="markdown-body text-text-100 leading-relaxed break-words"
                      v-html="renderMarkdown((part as any).text)"
                    ></div>
                  </template>
                  <div v-else-if="part.type === 'reasoning' && (part as any).text.trim()" class="my-2 p-3 bg-bg-200/50 border-l-2 border-accent-brand/30 rounded-r-lg text-text-400 text-xs italic font-mono">
                    <div class="mb-1 opacity-50 flex items-center gap-2 select-none">
                      <Brain :size="12" /> Thinking...
                    </div>
                    <div class="whitespace-pre-wrap break-words">{{ (part as any).text.trim() }}</div>
                  </div>
                  <div v-else-if="part.type === 'agent'" class="p-2 bg-bg-200 rounded-md text-xs font-mono">
                    Executing: {{ (part as any).name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Input Box (Visible only in Chat state at bottom) -->
        <div
          v-if="chatStore.hasSession"
          class="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-bg-100 via-bg-100/90 to-transparent pt-12 px-4 pb-4"
        >
          <ChatInput :is-floating="true" />
        </div>
      </div>

      <!-- Lower Section: Reserved Space (Visible only when no messages) -->
      <div
        v-if="!chatStore.hasSession"
        class="flex-[4] border-t border-border-100 bg-bg-000 flex items-center justify-center relative overflow-hidden"
      >
        <!-- Diagonally striped background -->
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none stripes-bg"></div>

        <div class="text-text-400 text-sm italic z-10">
          {{ $t('home.reservedArea') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import {
  Sparkles,
  User,
  Brain
} from 'lucide-vue-next'
import { useChatStore } from '../store/chatStore'
import { useMessageStore } from '../store/messageStore'
import { renderMarkdown } from '../utils/markdownUtils'
import ChatInput from './ChatInput.vue'

const chatStore = useChatStore()
const messageStore = useMessageStore()

const scrollContainer = ref<HTMLElement | null>(null)

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

// 监听消息列表变化，自动滚动
watch(() => messageStore.messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border-300) / 0.4);
  border-radius: 99px;
}

.stripes-bg {
  background-image: linear-gradient(
    45deg,
    currentColor 12.5%,
    transparent 12.5%,
    transparent 50%,
    currentColor 50%,
    currentColor 62.5%,
    transparent 62.5%,
    transparent 100%
  );
  background-size: 8px 8px;
}
</style>
