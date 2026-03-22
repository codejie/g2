import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useServerStore = defineStore('server', () => {
  // Base URL 持久化
  const baseUrl = ref(
    localStorage.getItem('opencode_base_url') ||
    import.meta.env.VITE_OPENCODE_BASE_URL ||
    'http://localhost:4096'
  )

  // Workspace 持久化
  const workspace = ref(
    localStorage.getItem('opencode_workspace') ||
    import.meta.env.VITE_WORKSPACE ||
    './workspace'
  )

  watch(baseUrl, (newUrl) => {
    localStorage.setItem('opencode_base_url', newUrl)
  })

  watch(workspace, (newPath) => {
    localStorage.setItem('opencode_workspace', newPath)
  })

  const getActiveBaseUrl = () => baseUrl.value
  const getActiveWorkspace = () => workspace.value

  // 为适配同步过来的 utils/perServerStorage.ts 提供的导出
  const getActiveServerId = () => 'local'

  const setBaseUrl = (url: string) => {
    if (url && !url.startsWith('http')) {
      baseUrl.value = `http://${url}`
    } else {
      baseUrl.value = url
    }
  }

  const setWorkspace = (path: string) => {
    workspace.value = path
  }

  return {
    baseUrl,
    workspace,
    setBaseUrl,
    setWorkspace,
    getActiveBaseUrl,
    getActiveWorkspace,
    getActiveServerId
  }
})

// 兼容性导出：解决 "The requested module does not provide an export named 'serverStore'" 报错
// 因为同步过来的 utils 期望一个名为 serverStore 的单例对象而非 Pinia 的 useServerStore
export const serverStore = {
  getActiveServerId: () => useServerStore().getActiveServerId(),
  getActiveBaseUrl: () => useServerStore().getActiveBaseUrl(),
}
