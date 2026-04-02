<template>
  <el-dialog
    v-model="visible"
    :title="$t('components:addProvider.title')"
    width="500px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item
        :label="$t('components:addProvider.providerId')"
        prop="providerId"
      >
        <el-input
          v-model="form.providerId"
          :placeholder="$t('components:addProvider.providerIdPlaceholder')"
        />
      </el-form-item>

      <el-form-item
        :label="$t('components:addProvider.providerName')"
        prop="providerName"
      >
        <el-input
          v-model="form.providerName"
          :placeholder="$t('components:addProvider.providerNamePlaceholder')"
        />
      </el-form-item>

      <el-form-item
        :label="$t('components:addProvider.baseUrl')"
        prop="baseUrl"
      >
        <el-input
          v-model="form.baseUrl"
          :placeholder="$t('components:addProvider.baseUrlPlaceholder')"
        />
      </el-form-item>

      <el-form-item
        :label="$t('components:addProvider.apiKey')"
        prop="apiKey"
      >
        <el-input
          v-model="form.apiKey"
          type="password"
          show-password
          :placeholder="$t('components:addProvider.apiKeyPlaceholder')"
        />
      </el-form-item>

      <el-divider />

      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-medium text-text-200">{{ $t('components:addProvider.models') }}</span>
        <el-button size="small" :icon="Plus" @click="addModel">
          {{ $t('components:addProvider.addModel') }}
        </el-button>
      </div>

      <div
        v-for="(model, index) in form.models"
        :key="index"
        class="flex items-center gap-2 mb-2"
      >
        <el-input
          v-model="model.id"
          :placeholder="$t('components:addProvider.modelIdPlaceholder')"
          class="flex-1"
        />
        <el-input
          v-model="model.name"
          :placeholder="$t('components:addProvider.modelNamePlaceholder')"
          class="flex-1"
        />
        <el-button
          :icon="Trash2"
          size="small"
          @click="removeModel(index)"
          :disabled="form.models.length === 1"
          class="!px-2"
        />
      </div>
    </el-form>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <el-button @click="visible = false">
          {{ $t('cancel') }}
        </el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('components:addProvider.add') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useModelStore } from '../store/modelStore'
import { getGlobalConfig, updateGlobalConfig } from '../api/config'
import { setCredential } from '../api/credential'
import i18n from '../i18n'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const modelStore = useModelStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (!val) resetForm()
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

interface ModelForm {
  id: string
  name: string
}

interface Form {
  providerId: string
  providerName: string
  baseUrl: string
  apiKey: string
  models: ModelForm[]
}

const form = reactive<Form>({
  providerId: '',
  providerName: '',
  baseUrl: '',
  apiKey: '',
  models: [{ id: '', name: '' }]
})

const rules: FormRules = {
  providerId: [
    { required: true, message: i18n.t('components:addProvider.providerIdRequired'), trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: i18n.t('components:addProvider.providerIdFormat'), trigger: 'blur' }
  ],
  providerName: [
    { required: true, message: i18n.t('components:addProvider.providerNameRequired'), trigger: 'blur' }
  ],
  baseUrl: [
    { required: true, message: i18n.t('components:addProvider.baseUrlRequired'), trigger: 'blur' },
    { type: 'url', message: i18n.t('components:addProvider.baseUrlFormat'), trigger: 'blur' }
  ]
}

const addModel = () => {
  form.models.push({ id: '', name: '' })
}

const removeModel = (index: number) => {
  if (form.models.length > 1) {
    form.models.splice(index, 1)
  }
}

const resetForm = () => {
  form.providerId = ''
  form.providerName = ''
  form.baseUrl = ''
  form.apiKey = ''
  form.models = [{ id: '', name: '' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const validModels = form.models.filter(m => m.id && m.name)
    if (validModels.length === 0) {
      ElMessage.warning(i18n.t('components:addProvider.atLeastOneModel'))
      submitting.value = false
      return
    }

    const modelsConfig: Record<string, { name: string }> = {}
    for (const model of validModels) {
      modelsConfig[model.id] = { name: model.name }
    }

    const currentConfig = await getGlobalConfig()

    const providerConfig = {
      npm: '@ai-sdk/openai-compatible',
      name: form.providerName,
      options: {
        baseURL: form.baseUrl
      },
      models: modelsConfig
    }

    const newConfig = {
      ...currentConfig,
      provider: {
        ...currentConfig.provider,
        [form.providerId]: providerConfig
      }
    }

    await updateGlobalConfig(newConfig)

    if (form.apiKey) {
      await setCredential(form.providerId, form.apiKey)
    }

    ElMessage.success(i18n.t('components:addProvider.success'))
    visible.value = false
    emit('success')
    modelStore.fetchModels()
  } catch (error) {
    console.error('Failed to add provider:', error)
    ElMessage.error(i18n.t('components:addProvider.failed'))
  } finally {
    submitting.value = false
  }
}
</script>
