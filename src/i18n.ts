import i18n from 'i18next'

// Eager-load all translation JSON files via Vite glob import
// Structure: src/locales/{lang}/{namespace}.json
const modules = import.meta.glob('./locales/*/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>

const resources: Record<string, Record<string, any>> = {}

for (const path in modules) {
  // path example: ./locales/en/common.json
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) continue
  const [, lang, ns] = match
  if (!resources[lang]) resources[lang] = {}
  resources[lang][ns] = (modules[path] as any).default ?? modules[path]
}

// 获取持久化的语言设置，默认为 'en'
const savedLng = localStorage.getItem('g2_language') || 'en'

i18n
  .init({
    resources,
    lng: savedLng, // 直接指定初始语言
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: Object.keys(resources['en'] || {}),
    interpolation: {
      escapeValue: false, // Vue also escapes by default
    },
  })

// 监听语言切换并保存到 localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('g2_language', lng)
})

export default i18n
