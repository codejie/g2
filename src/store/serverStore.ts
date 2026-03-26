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
    '/workspace'
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

  const setWorkspace = async (path: string) => {
    workspace.value = path
    localStorage.setItem('opencode_workspace', path)

    try {
      const { updateConfig, getPath } = await import('../api/client')
      // 通知服务器切换目录
      await updateConfig({}, path)
      // 获取服务器确认后的绝对路径
      const pathInfo = await getPath(path)
      if (pathInfo && pathInfo.directory) {
        workspace.value = pathInfo.directory
        localStorage.setItem('opencode_workspace', pathInfo.directory)
      }
      console.log('[ServerStore] Workspace changed and synced:', workspace.value)
    } catch (err) {
      console.error('[ServerStore] Failed to sync workspace change to server:', err)
      throw err
    }
  }

  const initializePaths = async () => {
    try {
      const { getPath, updateConfig } = await import('../api/client')

      // 1. 如果本地已经有持久化的非默认工作区，先尝试设置给服务器
      const savedWorkspace = localStorage.getItem('opencode_workspace')
      if (savedWorkspace && savedWorkspace !== '/workspace') {
        try {
          // 通过发送带 directory 的空配置更新来初始化该工作区
          await updateConfig({}, savedWorkspace)
          workspace.value = savedWorkspace
          console.log('[ServerStore] Informed server about saved workspace:', savedWorkspace)
        } catch (err) {
          console.warn('[ServerStore] Failed to set workspace on server:', err)
        }
      }

      // 2. 同步服务器当前路径
      const pathInfo = await getPath(workspace.value !== '/workspace' ? workspace.value : undefined)
      if (pathInfo && pathInfo.directory) {
        // 如果本地是默认值，或者获取到了更准确的路径，则同步
        if (workspace.value === '/workspace' || !workspace.value) {
          workspace.value = pathInfo.directory
          localStorage.setItem('opencode_workspace', pathInfo.directory)
          console.log('[ServerStore] Workspace synced to server path:', pathInfo.directory)
        }
      }
    } catch (err) {
      console.error('[ServerStore] Failed to initialize paths:', err)
    }
  }

  return {
    baseUrl,
    workspace,
    setBaseUrl,
    setWorkspace,
    initializePaths,
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
  getActiveAuth: () => ({ username: '', password: '' }),
}
