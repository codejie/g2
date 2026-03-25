<template>
  <el-dialog
    v-model="visible"
    :title="$t('settings.title')"
    width="500"
    destroy-on-close
    align-center
    class="g2-settings-dialog"
  >
    <el-form label-position="top">
      <el-form-item :label="$t('settings.language')">
        <el-select v-model="tempLanguage" :placeholder="$t('settings.language')" class="w-full">
          <el-option label="English" value="en" />
          <el-option label="简体中文" value="zh-CN" />
          <template #prefix>
            <Languages :size="14" />
          </template>
        </el-select>
      </el-form-item>

      <el-divider />

      <el-form-item :label="$t('settings.baseUrl')">
        <el-input
          v-model="tempBaseUrl"
          placeholder="e.g. http://127.0.0.1:4096"
          clearable
        >
          <template #prefix>
            <Globe :size="14" />
          </template>
        </el-input>
        <div class="text-[10px] text-text-400 mt-1 flex justify-between">
          <span>{{ $t('settings.envDefault') }}: {{ envBaseUrl }}</span>
          <el-link type="primary" :underline="false" style="font-size: 10px" @click="tempBaseUrl = envBaseUrl">{{ $t('settings.reset') }}</el-link>
        </div>
      </el-form-item>

      <el-divider />

      <el-form-item :label="$t('settings.workspace')">
        <el-input
          v-model="tempWorkspace"
          placeholder="e.g. ./workspace"
          clearable
        >
          <template #prefix>
            <Folder :size="14" />
          </template>
        </el-input>
        <div class="text-[10px] text-text-400 mt-1 flex justify-between">
          <span>{{ $t('settings.envDefault') }}: {{ envWorkspace }}</span>
          <el-link type="primary" :underline="false" style="font-size: 10px" @click="tempWorkspace = envWorkspace">{{ $t('settings.reset') }}</el-link>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <el-button @click="visible = false">{{ $t('settings.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ $t('settings.save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Globe, Folder, Languages } from 'lucide-vue-next'
import { useServerStore } from '../store/serverStore'
import { ElMessage } from 'element-plus'
import i18n from '../i18n'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const serverStore = useServerStore()
const visible = ref(props.modelValue)
const saving = ref(false)

const tempBaseUrl = ref(serverStore.baseUrl)
const tempWorkspace = ref(serverStore.workspace)
const tempLanguage = ref(i18n.language)

const envBaseUrl = import.meta.env.VITE_OPENCODE_BASE_URL
const envWorkspace = import.meta.env.VITE_WORKSPACE

// 同步弹窗状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 每次打开同步最新值
    tempBaseUrl.value = serverStore.baseUrl
    tempWorkspace.value = serverStore.workspace
    tempLanguage.value = i18n.language
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleSave = async () => {
  saving.value = true
  try {
    serverStore.setBaseUrl(tempBaseUrl.value)
    // 等待工作区切换完成，因为它是异步调用 API 了
    await serverStore.setWorkspace(tempWorkspace.value)

    // 切换语言
    if (i18n.language !== tempLanguage.value) {
      await i18n.changeLanguage(tempLanguage.value)
    }

    ElMessage.success({
      message: i18n.t('settings.success'),
      duration: 2000
    })
    visible.value = false
  } catch (err) {
    console.error('Save settings failed:', err)
    ElMessage.error(i18n.t('settings.error'))
  } finally {
    saving.value = false
  }
}
</script>

<style>
.g2-settings-dialog {
  border-radius: var(--radius-lg) !important;
}
.g2-settings-dialog .el-dialog__header {
  margin-right: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-100);
}
.g2-settings-dialog .el-form-item__label {
  font-size: 12px !important;
  font-weight: 600 !important;
  color: var(--text-200) !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.g2-settings-dialog .el-input__wrapper,
.g2-settings-dialog .el-select__wrapper {
  background-color: var(--bg-100) !important;
  box-shadow: none !important;
  border: 1px solid var(--border-200) !important;
  border-radius: var(--radius-md) !important;
}
.g2-settings-dialog .el-input__wrapper.is-focus,
.g2-settings-dialog .el-select__wrapper.is-focused {
  border-color: var(--accent-brand) !important;
}
</style>
