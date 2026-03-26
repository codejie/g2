import i18n from 'vue-i18n'

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: typeof i18n.global.t
  }
}
