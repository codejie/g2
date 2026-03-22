<template>
  <div class="relative h-[var(--app-height)] flex bg-bg-100 overflow-hidden"
       :style="{ paddingTop: 'var(--safe-area-inset-top)' }">

    <!-- Sidebar Component -->
    <Sidebar @open-settings="showSettings = true" />

    <!-- Main Content Area -->
    <MainView />

    <!-- Right Panel -->
    <aside class="hidden xl:flex w-80 border-l border-border-100 bg-bg-000 flex-col">
      <FileBrowser />
    </aside>

    <!-- Dialogs -->
    <SettingsDialog v-model="showSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModelStore } from './store/modelStore'
import Sidebar from './components/Sidebar.vue'
import MainView from './components/MainView.vue'
import FileBrowser from './components/FileBrowser.vue'
import SettingsDialog from './components/SettingsDialog.vue'

const modelStore = useModelStore()
const showSettings = ref(false)

onMounted(() => {
  modelStore.fetchModels()
})
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border-300) / 0.4);
  border-radius: 99px;
}
</style>
