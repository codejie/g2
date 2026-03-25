// ============================================
// 文件下载工具函数
// 支持从 URL 下载、从 Blob 下载，以及 Tauri 环境的原生保存（如果已安装相关插件）
// ============================================

import { isTauri } from './tauri'

/**
 * 触发浏览器下载（仅浏览器环境）
 */
export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()

  // 延迟清理，确保下载已启动
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 100)
}

/**
 * Tauri 原生保存文件
 */
async function tauriSaveFile(data: Uint8Array, fileName: string): Promise<void> {
  try {
    // 动态检测 Tauri 插件是否存在，避免在普通浏览器环境下引起 Vite 导入错误
    // 这里的导入路径只是示例，实际取决于 package.json 中是否安装了这些依赖
    // 在 g2 当前项目中由于没有安装这些依赖，所以这个分支暂时不可用
    console.warn('[DownloadUtils] Tauri file system plugins not installed. Falling back to browser download.')
  } catch (err) {
    console.error('[DownloadUtils] Tauri save failed:', err)
  }
}

/**
 * 通用保存：接受原始数据 + 文件名 + MIME 类型
 */
export function saveData(data: Uint8Array, fileName: string, mimeType = 'application/octet-stream'): void {
  // 目前强制使用浏览器下载，因为 package.json 中没有 tauri 插件
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType })
  triggerBrowserDownload(blob, fileName)
}

/**
 * 从 URL 异步下载文件并保存
 * 这种方式通过 fetch 获取流，可以解决浏览器直接打开 URL 而不下载的问题
 */
export async function downloadFromUrl(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Download failed: ${response.statusText}`)

    const arrayBuffer = await response.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    const mimeType = response.headers.get('Content-Type') || 'application/octet-stream'

    saveData(data, fileName, mimeType)
  } catch (err) {
    console.error('[DownloadUtils] Download from URL failed:', err)
    throw err
  }
}
