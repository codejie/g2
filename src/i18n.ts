import i18n from 'i18next'

const modules = import.meta.glob('./locales/*/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>

const resources: Record<string, Record<string, any>> = {}

for (const path in modules) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) continue
  const [, lang, ns] = match
  if (!resources[lang]) resources[lang] = {}
  resources[lang][ns] = (modules[path] as any).default ?? modules[path]
}

const savedLng = localStorage.getItem('g2_language') || 'zh-CN'

const allNs = new Set<string>()
for (const lang in resources) {
  for (const ns in resources[lang]) {
    allNs.add(ns)
  }
}
const namespaces = Array.from(allNs)

i18n
  .init({
    resources,
    lng: savedLng,
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    ns: namespaces,
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('g2_language', lng)
})

export default i18n
