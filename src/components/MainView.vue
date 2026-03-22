<template>
  <main class="flex-1 flex min-w-0 h-full overflow-hidden flex-col">
    <!-- Header -->
    <header class="h-14 border-b border-border-100 flex items-center justify-between px-4 bg-bg-000/80 backdrop-blur-md z-20 shrink-0">
      <div class="flex items-center gap-3">
        <button class="md:hidden p-2 hover:bg-bg-100 rounded-lg">
          <Menu :size="20" />
        </button>

        <!-- Model Selector -->
        <div class="flex items-center gap-2 bg-bg-100 px-3 py-1.5 rounded-full border border-border-200 cursor-pointer hover:bg-bg-200 transition-colors">
          <el-dropdown @command="handleModelChange" trigger="click">
            <div class="flex items-center gap-2 outline-none">
              <div class="w-2 h-2 rounded-full" :class="modelStore.loading ? 'bg-warning-100 animate-pulse' : 'bg-success-100'"></div>
              <span class="text-xs font-medium text-text-200">
                {{ modelStore.selectedModel?.name || 'Loading models...' }}
              </span>
              <ChevronDown :size="14" class="text-text-400" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="m in modelStore.models" :key="m.id" :command="m">
                  <div class="flex flex-col">
                    <span class="font-bold">{{ m.name }}</span>
                    <span class="text-[10px] text-text-400">{{ m.providerName }}</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item v-if="!modelStore.models.length" disabled>No active models</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="p-2 hover:bg-bg-100 rounded-lg text-text-300">
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
import { Menu, ChevronDown, Share2 } from 'lucide-vue-next'
import { useModelStore } from '../store/modelStore'
import Home from './Home.vue'
import type { ModelInfo } from '../types/ui'

const modelStore = useModelStore()

const handleModelChange = (model: ModelInfo) => {
  modelStore.selectModel(model)
}
</script>
