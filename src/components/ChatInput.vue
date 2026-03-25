<template>
  <div class="w-full max-w-3xl mx-auto">
    <!-- Quick Actions -->
    <div class="flex flex-wrap justify-end gap-2 mb-3">
      <button
        v-for="action in quickActions"
        :key="action.id"
        @click="handleQuickAction(action)"
        class="px-4 py-1.5 rounded-full text-xs transition-all duration-200 border border-border-200/50 hover:border-accent-brand/30 shadow-sm"
        :class="[
          isFloating
            ? 'bg-bg-200/40 backdrop-blur-sm hover:bg-bg-300 text-text-300 hover:text-text-100'
            : 'bg-bg-200 hover:bg-bg-300 text-text-300 hover:text-text-100'
        ]"
      >
        {{ action.label }}
      </button>
    </div>

    <!-- Input Area -->
    <div class="relative group">
      <div class="bg-bg-000 border border-border-200 focus-within:border-accent-brand/50 rounded-2xl shadow-float transition-all duration-200 relative">
        <textarea
          v-model="inputMessage"
          ref="textareaRef"
          class="w-full bg-transparent border-none focus:ring-0 p-4 pb-12 resize-none text-text-100 placeholder:text-text-400 min-h-[100px] outline-none"
          :placeholder="$t('home.placeholder')"
          @keydown.ctrl.enter="handleSend"
          @keydown.meta.enter="handleSend"
        ></textarea>

        <!-- Bottom Controls -->
        <div class="absolute bottom-3 left-3 flex items-center gap-2">
          <!-- Skills Selector -->
          <div class="flex items-center rounded-xl bg-bg-100 p-1 border border-border-100 hover:bg-bg-200 transition-colors cursor-pointer group/skill">
            <el-dropdown @command="handleSkillSelect" trigger="click" popper-class="skill-dropdown">
              <div class="flex items-center gap-2 px-2 py-1 outline-none">
                <Package :size="14" class="text-text-400 group-hover/skill:text-accent-brand transition-colors" />
                <span class="text-[10px] font-bold text-text-300 uppercase tracking-tight">Skills</span>
                <ChevronDown :size="12" class="text-text-400" />
              </div>
              <template #dropdown>
                <el-dropdown-menu class="skill-dropdown-menu max-h-80 overflow-y-auto custom-scrollbar">
                  <el-dropdown-item v-for="skill in chatStore.skills" :key="skill.name" :command="skill.name">
                    <div class="flex flex-col py-0.5 w-full">
                      <span class="font-bold text-xs">{{ skill.name }}</span>
                      <span v-if="skill.description" class="text-[10px] text-text-400 leading-snug line-clamp-2 mt-0.5 whitespace-normal">{{ skill.description }}</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="!chatStore.skills.length" disabled>No skills available</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="absolute bottom-3 right-3 flex items-center gap-2">
          <!-- Mode Selector -->
          <div class="flex items-center rounded-xl bg-bg-100 p-1 border border-border-100 hover:bg-bg-200 transition-colors cursor-pointer group/mode">
            <el-dropdown @command="handleModeChange" trigger="click" popper-class="mode-dropdown">
              <div class="flex items-center gap-2 px-2 py-1 outline-none">
                <span class="text-xs font-bold text-text-200 uppercase tracking-tight min-w-[40px] text-center">
                  {{ chatStore.currentMode }}
                </span>
                <ChevronDown :size="12" class="text-text-400 group-hover/mode:text-accent-brand transition-colors" />
              </div>
              <template #dropdown>
                <el-dropdown-menu class="mode-dropdown-menu">
                  <el-dropdown-item command="build" :class="{ 'is-active': chatStore.currentMode === 'build' }">
                    <div class="flex items-center gap-2">
                      <Zap :size="14" />
                      <div class="flex flex-col">
                        <span class="font-bold">{{ $t('home.modes.build') }}</span>
                        <span class="text-[10px] opacity-60">{{ $t('home.modes.buildDesc') }}</span>
                      </div>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="plan" :class="{ 'is-active': chatStore.currentMode === 'plan' }">
                    <div class="flex items-center gap-2">
                      <Brain :size="14" />
                      <div class="flex flex-col">
                        <span class="font-bold">{{ $t('home.modes.plan') }}</span>
                        <span class="text-[10px] opacity-60">{{ $t('home.modes.planDesc') }}</span>
                      </div>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- Send Button -->
          <button
            @click="handleSend"
            :disabled="chatStore.sending || !inputMessage.trim()"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Zap, ChevronDown, ArrowUp, Loader2, Brain, Package } from 'lucide-vue-next'
import { useChatStore } from '../store/chatStore'
import { useMessageStore } from '../store/messageStore'
import i18n from '../i18n'

interface Props {
  isFloating?: boolean
}

defineProps<Props>()

const chatStore = useChatStore()
const messageStore = useMessageStore()
const inputMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

onMounted(() => {
  chatStore.fetchSkills()
})

interface QuickAction {
  id: string
  label: string
  prompt: string
}

const quickActions = computed<QuickAction[]>(() => [
  { id: 'writing', label: i18n.t('home.actions.writing'), prompt: i18n.t('home.prompts.writing') },
  { id: 'page', label: i18n.t('home.actions.page'), prompt: i18n.t('home.prompts.page') },
  { id: 'app', label: i18n.t('home.actions.app'), prompt: i18n.t('home.prompts.app') },
  { id: 'miniapp', label: i18n.t('home.actions.miniapp'), prompt: i18n.t('home.prompts.miniapp') },
  { id: 'ppt', label: i18n.t('home.actions.ppt'), prompt: i18n.t('home.prompts.ppt') },
  { id: 'excel', label: i18n.t('home.actions.excel'), prompt: i18n.t('home.prompts.excel') }
])

const handleQuickAction = (action: QuickAction) => {
  inputMessage.value = action.prompt
  textareaRef.value?.focus()
}

const handleSkillSelect = (skillName: string) => {
  const t = i18n.t('execute_skills')
  const text = `${t} ${skillName} `
  inputMessage.value = text + inputMessage.value
  textareaRef.value?.focus()
}

const handleModeChange = (mode: 'build' | 'plan') => {
  chatStore.currentMode = mode
}

const handleSend = async () => {
  const text = inputMessage.value.trim()
  if (!text || chatStore.sending) return

  try {
    messageStore.addUserMessage(text)
    inputMessage.value = ''
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

:deep(.mode-dropdown-menu) {
  padding: 4px !important;
  border-radius: 12px !important;
  border: 1px solid var(--border-100) !important;
  background: var(--bg-000) !important;
}

:deep(.el-dropdown-menu__item) {
  border-radius: 8px !important;
  padding: 8px 12px !important;
  margin: 2px 0 !important;
  color: var(--text-200) !important;
  font-size: 12px !important;
}

:deep(.skill-dropdown-menu) {
  width: 110px !important;
  padding: 2px !important;
}

:deep(.skill-dropdown-menu .el-dropdown-menu__item) {
  padding: 4px 10px !important;
  margin: 0 !important;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--bg-100) !important;
  color: var(--accent-brand) !important;
}

:deep(.el-dropdown-menu__item.is-active) {
  background-color: var(--accent-brand-light) !important;
  color: var(--accent-brand) !important;
}
</style>

<style>
/* 全局样式，用于处理 el-dropdown 挂载到 body 后的宽度 */
.skill-dropdown-menu {
  width: 320px !important;
  min-width: 320px !important;
  max-width: 320px !important;
}
.skill-dropdown-menu .el-dropdown-menu__item {
  padding: 4px 10px !important;
  margin: 0 !important;
}
</style>
