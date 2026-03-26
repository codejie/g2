// ============================================
// 文件下载工具函数
// 支持从 URL 下载、从 Blob 下载
// ============================================

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
 * 通用保存：接受原始数据 + 文件名 + MIME 类型
 */
export function saveData(data: Uint8Array, fileName: string, mimeType = 'application/octet-stream'): void {
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
