import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const CONFIG_WORKSPACE = import.meta.env.VITE_WORKSPACE || '/workspace'

export const useServerStore = defineStore('server', () => {
  // Base URL 持久化
  const baseUrl = ref(
    localStorage.getItem('opencode_base_url') ||
    import.meta.env.VITE_OPENCODE_BASE_URL ||
    'http://localhost:4000'
  )

  // Workspace 始终固定为配置文件中的值，不可修改
  const workspace = ref(CONFIG_WORKSPACE)

  // 触发文件树刷新的计数器
  const fileTreeRefreshKey = ref(0)

  // 检查是否开启自动刷新文件树
  const isAutoRefreshFileTree = () => {
    return localStorage.getItem('g2_auto_refresh_file_tree') === 'true'
  }

  // 触发文件树刷新
  const triggerFileTreeRefresh = () => {
    if (isAutoRefreshFileTree()) {
      fileTreeRefreshKey.value++
      console.log('[ServerStore] Triggered file tree refresh, key:', fileTreeRefreshKey.value)
    }
  }

  watch(baseUrl, (newUrl) => {
    localStorage.setItem('opencode_base_url', newUrl)
  })

  const getActiveBaseUrl = () => baseUrl.value
  const getActiveWorkspace = () => CONFIG_WORKSPACE

  // 为适配同步过来的 utils/perServerStorage.ts 提供的导出
  const getActiveServerId = () => 'local'

  const setBaseUrl = (url: string) => {
    if (url && !url.startsWith('http')) {
      baseUrl.value = `http://${url}`
    } else {
      baseUrl.value = url
    }
  }

  const setWorkspace = async (_path: string) => {
    // 忽略传入的 path，始终使用配置中的值
    // workspace 不可修改
    console.log('[ServerStore] Workspace is fixed to:', CONFIG_WORKSPACE)
  }

  const initializePaths = async () => {
    try {
      const { updateConfig, getPath } = await import('../api/client')

      // 通知服务器当前工作区配置
      await updateConfig({}, CONFIG_WORKSPACE)
      console.log('[ServerStore] Informed server about workspace:', CONFIG_WORKSPACE)

      // 获取服务器确认后的路径信息
      const pathInfo = await getPath(CONFIG_WORKSPACE)
      console.log('[ServerStore] Path info:', pathInfo)
    } catch (err) {
      console.error('[ServerStore] Failed to initialize paths:', err)
    }
  }

  return {
    baseUrl,
    workspace,
    fileTreeRefreshKey,
    setBaseUrl,
    setWorkspace,
    initializePaths,
    getActiveBaseUrl,
    getActiveWorkspace,
    getActiveServerId,
    triggerFileTreeRefresh,
    isAutoRefreshFileTree
  }
})

// 兼容性导出：解决 "The requested module does not provide an export named 'serverStore'" 报错
// 因为同步过来的 utils 期望一个名为 serverStore 的单例对象而非 Pinia 的 useServerStore
export const serverStore = {
  getActiveServerId: () => useServerStore().getActiveServerId(),
  getActiveBaseUrl: () => useServerStore().getActiveBaseUrl(),
  getActiveAuth: () => ({ username: '', password: '' }),
}
