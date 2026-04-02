<template>
  <div class="flex items-center gap-2 px-2 py-1.5 border-b border-border-100 sticky top-0 bg-bg-000 z-10" @click.stop>
    <el-input
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="$t('components:modelFilter.searchPlaceholder')"
      size="small"
      class="flex-1"
      clearable
      @click.stop
      @focus.stop
      @mousedown.stop
    >
      <template #prefix>
        <Search :size="14" class="text-text-400" />
      </template>
    </el-input>
    <el-button
      size="small"
      type="primary"
      :icon="Plus"
      @click.stop="showAddDialog = true"
      class="!px-2"
    />
    <AddProviderDialog
      v-model="showAddDialog"
      @success="$emit('success')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus } from 'lucide-vue-next'
import AddProviderDialog from './AddProviderDialog.vue'

defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'success'): void
}>()

const showAddDialog = ref(false)
</script>
