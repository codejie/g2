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
            <h2 class="text-2xl font-bold text-text-100 mb-2">How can I help you today?</h2>

            <!-- Description -->
            <p class="text-text-400 max-w-md text-center text-sm leading-relaxed mb-8">
              I'm G2, connected via {{ modelStore.selectedModel?.name }}. You can ask me to write code, debug, or explore your workspace.
            </p>

            <!-- Chat Input Box (In Empty State) -->
            <div class="w-full">
              <div class="relative group">
                <div class="bg-bg-000 border border-border-200 focus-within:border-accent-brand/50 rounded-2xl shadow-float transition-all duration-200 relative">
                  <textarea
                    v-model="inputMessage"
                    class="w-full bg-transparent border-none focus:ring-0 p-4 pb-12 resize-none text-text-100 placeholder:text-text-400 min-h-[100px] outline-none"
                    placeholder="Message G2..."
                    @keydown.enter.exact.prevent="handleSendMessage"
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
                      class="p-2 bg-accent-brand hover:bg-accent-main-000 text-white rounded-xl shadow-sm transition-all active:scale-95"
                    >
                      <ArrowUp :size="20" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Case 2: Chat state (With messages) -->
          <div v-else class="max-w-3xl mx-auto w-full pt-8">
            <div class="flex gap-4 mb-8">
              <div class="w-8 h-8 rounded-full bg-accent-brand shrink-0 flex items-center justify-center text-white">
                <Sparkles :size="18" />
              </div>
              <div class="space-y-2 flex-1">
                <p class="text-text-100 leading-relaxed">Hello! I'm G2, connected via {{ modelStore.selectedModel?.name }}. How can I help you today?</p>
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
                  placeholder="Message G2..."
                  @keydown.enter.exact.prevent="handleSendMessage"
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
                    class="p-2 bg-accent-brand hover:bg-accent-main-000 text-white rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    <ArrowUp :size="20" />
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
          Reserved Area (3:4 ratio)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Sparkles,
  Paperclip,
  Globe,
  ArrowUp,
  Zap
} from 'lucide-vue-next'
import { useModelStore } from '../store/modelStore'
import { useChatStore } from '../store/chatStore'

const modelStore = useModelStore()
const chatStore = useChatStore()
const inputMessage = ref('')
const scrollContainer = ref<HTMLElement | null>(null)

const handleSendMessage = () => {
  if (!inputMessage.value.trim()) return

  // Transition to chat state via store
  chatStore.startNewSession()
  inputMessage.value = ''
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
