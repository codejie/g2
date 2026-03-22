import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getActiveModels } from '../api/client'
import type { ModelInfo } from '../types/ui'

export const useModelStore = defineStore('model', () => {
  const models = ref<ModelInfo[]>([])
  const selectedModel = ref<ModelInfo | null>(null)
  const loading = ref(false)

  const fetchModels = async (directory?: string) => {
    loading.value = true
    try {
      const activeModels = await getActiveModels(directory)
      models.value = activeModels

      // 默认选择第一个模型（如果没有已选择的）
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
  }

  return {
    models,
    selectedModel,
    loading,
    fetchModels,
    selectModel
  }
})
