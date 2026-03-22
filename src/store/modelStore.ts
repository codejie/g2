import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { getActiveModels } from '../api/client'
import type { ModelInfo } from '../types/ui'

export const useModelStore = defineStore('model', () => {
  const models = ref<ModelInfo[]>([])
  const loading = ref(false)

  // 尝试从持久化存储中获取
  const savedModelId = localStorage.getItem('g2_selected_model_id')
  const selectedModel = ref<ModelInfo | null>(null)

  const fetchModels = async (directory?: string) => {
    loading.value = true
    try {
      const activeModels = await getActiveModels(directory)
      models.value = activeModels

      // 优先级逻辑：
      // 1. 如果已持久化了 ID，且列表中存在该模型，则选中它
      // 2. 否则，如果当前没有选中的，则选第一个
      if (savedModelId && activeModels.length > 0) {
        const found = activeModels.find(m => m.id === savedModelId)
        if (found) {
          selectedModel.value = found
        }
      }

      if (!selectedModel.value && activeModels.length > 0) {
        selectedModel.value = activeModels[0]
      }
    } catch (err) {
      console.error('Failed to fetch models:', err)
    } finally {
      loading.value = false
    }
  }

  const selectModel = (model: ModelInfo) => {
    selectedModel.value = model
    // 记录到本地存储
    localStorage.setItem('g2_selected_model_id', model.id)
  }

  return {
    models,
    selectedModel,
    loading,
    fetchModels,
    selectModel
  }
})
