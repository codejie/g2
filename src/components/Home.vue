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

            <!-- Description -->
            <p class="text-text-400 max-w-md text-center text-sm leading-relaxed mb-8">
              {{ $t('home.description', { model: modelStore.selectedModel?.name }) }}
            </p>

            <!-- Chat Input Box (In Empty State) -->
            <div class="w-full">
              <div class="relative group">
                <div class="bg-bg-000 border border-border-200 focus-within:border-accent-brand/50 rounded-2xl shadow-float transition-all duration-200 relative">
                  <textarea
                    v-model="inputMessage"
                    class="w-full bg-transparent border-none focus:ring-0 p-4 pb-12 resize-none text-text-100 placeholder:text-text-400 min-h-[100px] outline-none"
                    :placeholder="$t('home.placeholder')"
                    @keydown.ctrl.enter="handleSendMessage"
                    @keydown.meta.enter="handleSendMessage"
                  ></textarea>
                  <div class="absolute bottom-3 left-3 flex items-center gap-1">
                    <button class="p-2 hover:bg-bg-100 rounded-lg text-text-400 transition-colors">
                      <Paperclip :size="18" />
                    </button>
                    <button class="p-2 hover:bg-bg-100 rounded-lg text-text-400 transition-colors">
                      <Globe :size="18" />
                    </button>
                  </div>
                  <div class="absolute bottom-3 right-3 flex items-center gap-2">
                    <div class="flex items-center gap-1 px-2 py-1 rounded-md bg-bg-100 text-[10px] font-bold text-text-300 border border-border-100">
                      <Zap :size="10" />
                      AUTO
                    </div>
                    <button
                      @click="handleSendMessage"
                      :disabled="chatStore.sending"
                      title="Ctrl + Enter to send"
                      class="p-2 bg-accent-brand hover:bg-accent-main-000 text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      <ArrowUp v-if="!chatStore.sending" :size="20" />
                      <Loader2 v-else :size="20" class="animate-spin" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Case 2: Chat state (With messages) -->
          <div v-else class="max-w-3xl mx-auto w-full pt-8 space-y-8 pb-32">
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
          <div class="max-w-3xl mx-auto w-full">
            <div class="relative group">
              <div class="bg-bg-000 border border-border-200 focus-within:border-accent-brand/50 rounded-2xl shadow-float transition-all duration-200 relative">
                <textarea
                  v-model="inputMessage"
                  class="w-full bg-transparent border-none focus:ring-0 p-4 pb-12 resize-none text-text-100 placeholder:text-text-400 min-h-[100px] outline-none"
                  :placeholder="$t('home.placeholder')"
                  @keydown.ctrl.enter="handleSendMessage"
                  @keydown.meta.enter="handleSendMessage"
                ></textarea>
                <div class="absolute bottom-3 left-3 flex items-center gap-1">
                  <button class="p-2 hover:bg-bg-100 rounded-lg text-text-400 transition-colors">
                    <Paperclip :size="18" />
                  </button>
                  <button class="p-2 hover:bg-bg-100 rounded-lg text-text-400 transition-colors">
                    <Globe :size="18" />
                  </button>
                </div>
                <div class="absolute bottom-3 right-3 flex items-center gap-2">
                  <div class="flex items-center gap-1 px-2 py-1 rounded-md bg-bg-100 text-[10px] font-bold text-text-300 border border-border-100">
                    <Zap :size="10" />
                    AUTO
                  </div>
                    <button
                      @click="handleSendMessage"
                      :disabled="chatStore.sending"
                      title="Ctrl + Enter to send"
                      class="p-2 bg-accent-brand hover:bg-accent-main-000 text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                    <ArrowUp v-if="!chatStore.sending" :size="20" />
                    <Loader2 v-else :size="20" class="animate-spin" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lower Section: Reserved Space (Visible only when no messages) -->
      <div
        v-if="!chatStore.hasSession"
        class="flex-[4] border-t border-border-100 bg-bg-000 flex items-center justify-center"
      >
        <div class="text-text-400 text-sm italic">
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
  Paperclip,
  Globe,
  ArrowUp,
  Zap,
  Loader2,
  User,
  Brain
} from 'lucide-vue-next'
import { useModelStore } from '../store/modelStore'
import { useChatStore } from '../store/chatStore'
import { useMessageStore } from '../store/messageStore'
import { renderMarkdown } from '../utils/markdownUtils'

const modelStore = useModelStore()
const chatStore = useChatStore()
const messageStore = useMessageStore()

const inputMessage = ref('')
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

const handleSendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || chatStore.sending) return

  try {
    // 1. 在 UI 上先添加用户消息
    messageStore.addUserMessage(text)
    inputMessage.value = ''

    // 2. 异步发送到后端
    await chatStore.sendPrompt(text)
  } catch (err) {
    console.error('Failed to send message:', err)
    inputMessage.value = text
  }
}
</script>

<style scoped>
.shadow-float {
  box-shadow: 0 4px 20px 0 rgb(0 0 0 / 0.1);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border-300) / 0.4);
  border-radius: 99px;
}
</style>
