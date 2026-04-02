<template>
  <main class="flex-1 flex min-w-0 h-full overflow-hidden flex-col">
    <!-- Header -->
    <header class="h-14 border-b border-border-100 flex items-center justify-between px-4 bg-bg-000/80 backdrop-blur-md z-20 shrink-0 sticky top-0">
      <div class="flex items-center gap-3">
        <!-- Logo & Brand (Visible when sidebar is collapsed) -->
        <div v-if="chatStore.isSidebarCollapsed" class="flex items-center gap-3 mr-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <div class="w-8 h-8 rounded-lg bg-accent-brand flex items-center justify-center text-white shrink-0 shadow-sm">
            <Box :size="20" />
          </div>
          <span class="font-bold text-text-100 truncate tracking-tight">{{ $t('app_title') }}</span>
          <div class="w-px h-4 bg-border-200 mx-1"></div>
        </div>

        <!-- Model Selector -->
        <div class="flex items-center gap-2 bg-bg-100 px-3 py-1.5 rounded-full border border-border-200 cursor-pointer hover:bg-bg-200 transition-colors">
          <el-dropdown @command="handleModelChange" trigger="click" popper-class="model-selector-dropdown">
            <div class="flex items-center gap-2 outline-none">
              <div class="w-2 h-2 rounded-full" :class="modelStore.loading ? 'bg-warning-100 animate-pulse' : 'bg-success-100'"></div>
              <span class="text-xs font-medium text-text-200">
                {{ modelStore.selectedModel?.name || $t('models.loading') }}
              </span>
              <ChevronDown :size="14" class="text-text-400" />
            </div>
<template #dropdown>
	<el-dropdown-menu class="max-h-[400px] overflow-y-auto custom-scrollbar">
		<ModelFilterHeader v-model="modelSearchQuery" />
		<el-dropdown-item
			v-for="m in filteredModels"
			:key="`${m.providerId}-${m.id}`"
			:command="m"
			class="model-item"
		>
			<div class="flex items-center justify-between py-0.5 gap-4">
				<div class="flex flex-col">
					<span>
						<span class="text-xs font-bold">{{ m.name }}</span>
						<span class="ml-4 text-[10px] text-text-400">{{ m.providerName }}</span>
					</span>
				</div>
				<span class="text-[10px] text-text-400 shrink-0">{{ formatContextLimit(m.contextLimit) }}</span>
			</div>
		</el-dropdown-item>
		<el-dropdown-item v-if="!filteredModels.length && modelStore.models.length" disabled>
			{{ $t('models.noMatch') }}
		</el-dropdown-item>
		<el-dropdown-item v-if="!modelStore.models.length" disabled>{{ $t('models.noActive') }}</el-dropdown-item>
	</el-dropdown-menu>
</template>
          </el-dropdown>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="p-2 hover:bg-bg-100 rounded-lg transition-colors"
          :class="[eventStore.isServerActive ? 'text-accent-brand' : 'text-text-400 opacity-50 cursor-not-allowed']"
        >
          <Share2 :size="18" />
        </button>
      </div>
    </header>

    <!-- Content Area (Home / Chat) -->
    <div class="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-bg-100">
      <Home />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Share2, Box } from 'lucide-vue-next'
import { useModelStore } from '../store/modelStore'
import { useChatStore } from '../store/chatStore'
import { useEventStore } from '../store/eventStore'
import Home from './Home.vue'
import ModelFilterHeader from './ModelFilterHeader.vue'
import type { ModelInfo } from '../types/ui'

const modelStore = useModelStore()
const chatStore = useChatStore()
const eventStore = useEventStore()

const modelSearchQuery = ref('')

const filteredModels = computed(() => {
	const query = modelSearchQuery.value.toLowerCase().trim()
	if (!query) return modelStore.models

	return modelStore.models.filter(m => {
		const searchStr = `${m.name} ${m.providerName}`.toLowerCase()
		return searchStr.includes(query)
	})
})

const handleModelChange = (model: ModelInfo) => {
	modelStore.selectModel(model)
}

const formatContextLimit = (limit: number): string => {
	if (limit >= 1000000) {
		return `${(limit / 1000000).toFixed(0)}M`
	}
	if (limit >= 1000) {
		return `${(limit / 1000).toFixed(0)}k`
	}
	return limit.toString()
}
</script>

<style>
/* 调整 Dropdown 样式 */
.model-selector-dropdown .el-dropdown-menu {
  padding: 4px 0 !important;
}

.model-item {
  padding: 4px 12px !important;
  line-height: 1.2 !important;
}

.model-item:hover {
  background-color: var(--bg-100) !important;
}

/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--border-300) !important; /* 加深颜色以更明显 */
  border-radius: 10px;
}
/* 强制在非悬停状态也显示 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--border-300) transparent;
}
</style>
