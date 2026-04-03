<template>
  <el-dialog
    v-model="visible"
    :title="$t('components:addProvider.title')"
    width="500px"
    :close-on-click-modal="false"
    append-to-body
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <div class="flex gap-2">
        <el-form-item
          :label="$t('components:addProvider.providerId')"
          prop="providerId"
          class="flex-1"
        >
          <el-select
            v-model="form.providerId"
            :placeholder="$t('components:addProvider.providerIdPlaceholder')"
            filterable
            allow-create
            default-first-option
            class="w-full"
            @change="handleProviderChange"
            popper-class="provider-select-dropdown"
          >
            <el-option
              v-for="provider in providers"
              :key="provider.id"
              :label="provider.id"
              :value="provider.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('components:addProvider.providerName')"
          prop="providerName"
          class="flex-1"
        >
          <el-input
            v-model="form.providerName"
            disabled
            :placeholder="$t('components:addProvider.providerNamePlaceholder')"
          />
        </el-form-item>
      </div>

      <el-form-item
        :label="$t('components:addProvider.baseUrl')"
      >
        <el-input
          v-model="form.baseUrl"
          :disabled="isExistingProvider"
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
          :disabled="isExistingProvider"
          :placeholder="$t('components:addProvider.apiKeyPlaceholder')"
        />
      </el-form-item>

      <el-divider />

      <div class="flex justify-between items-center mb-3">
        <span class="text-sm font-medium text-text-200">{{ $t('components:addProvider.options') }}</span>
        <el-button size="small" :icon="Plus" @click="addOption" :disabled="isExistingProvider">
          {{ $t('components:addProvider.addOption') }}
        </el-button>
      </div>

      <div
        v-for="(option, index) in form.options"
        :key="index"
        class="flex items-center gap-2 mb-2"
      >
        <el-input
          v-model="option.key"
          :disabled="isExistingProvider"
          :placeholder="$t('components:addProvider.optionKeyPlaceholder')"
          class="flex-1"
        />
        <el-input
          v-model="option.value"
          :disabled="isExistingProvider"
          :placeholder="$t('components:addProvider.optionValuePlaceholder')"
          class="flex-1"
        />
        <el-button
          :icon="Trash2"
          size="small"
          @click="removeOption(index)"
          :disabled="form.options.length === 1 || isExistingProvider"
          class="!px-2"
        />
      </div>

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
        <el-select
          v-model="model.id"
          :placeholder="$t('components:addProvider.modelIdPlaceholder')"
          filterable
          allow-create
          default-first-option
          class="flex-1"
          @change="(val: string) => handleModelChange(index, val)"
          popper-class="model-select-dropdown"
        >
          <el-option
            v-for="m in availableModels"
            :key="m.id"
            :label="m.id"
            :value="m.id"
            disabled
          />
        </el-select>
        <el-input
          v-model="model.name"
          disabled
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
import { ref, reactive, watch, computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useModelStore } from '../store/modelStore'
import { getGlobalConfig, updateGlobalConfig } from '../api/config'
import { setCredential } from '../api/credential'
import { get } from '../api/http'
import i18n from '../i18n'

interface Provider {
  id: string
  name: string
  options?: Record<string, unknown>
  models?: Record<string, { id: string; name: string }>
}

interface ProvidersResponse {
  providers: Provider[]
}

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
const providers = ref<Provider[]>([])
const currentProviderModels = ref<{ id: string; name: string }[]>([])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
    loadProviders()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const loadProviders = async () => {
  try {
    const data = await get<ProvidersResponse>('/config/providers', { directory: '/root/.config/opencode' })
    providers.value = data.providers || []
  } catch (error) {
    console.error('Failed to load providers:', error)
  }
}

const loadProviderModels = async (providerId: string) => {
  try {
    const data = await get<ProvidersResponse>('/config/providers', { directory: '/root/.config/opencode' })
    const provider = data.providers?.find((p: Provider) => p.id === providerId)
    if (provider && provider.models) {
      currentProviderModels.value = Object.values(provider.models).map((m: { id: string; name: string }) => ({
        id: m.id,
        name: m.name || m.id
      }))
    } else {
      currentProviderModels.value = []
    }
  } catch (error) {
    console.error('Failed to load provider models:', error)
    currentProviderModels.value = []
  }
}

const availableModels = computed(() => currentProviderModels.value)

const isExistingProvider = computed(() => {
  return providers.value.some(p => p.id === form.providerId)
})

interface ModelForm {
  id: string
  name: string
}

interface OptionForm {
  key: string
  value: string
}

interface Form {
  providerId: string
  providerName: string
  baseUrl: string
  apiKey: string
  options: OptionForm[]
  models: ModelForm[]
}

const form = reactive<Form>({
  providerId: '',
  providerName: '',
  baseUrl: '',
  apiKey: '',
  options: [{ key: '', value: '' }],
  models: [{ id: '', name: '' }]
})

const rules: FormRules = {
  providerId: [
    { required: true, message: i18n.t('components:addProvider.providerIdRequired'), trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: i18n.t('components:addProvider.providerIdFormat'), trigger: 'blur' }
  ],
  providerName: [
    { required: true, message: i18n.t('components:addProvider.providerNameRequired'), trigger: 'blur' }
  ]
}

const handleProviderChange = async (providerId: string) => {
  form.providerName = providerId
  form.baseUrl = ''
  form.apiKey = ''
  form.options = [{ key: '', value: '' }]
  form.models = [{ id: '', name: '' }]
  currentProviderModels.value = []

  const provider = providers.value.find(p => p.id === providerId)
  if (provider) {
    form.providerName = provider.name || providerId
    if (provider.options && 'baseURL' in provider.options) {
      form.baseUrl = String(provider.options.baseURL)
    }
    await loadProviderModels(providerId)
  }
}

const handleModelChange = (index: number, modelId: string) => {
  const model = currentProviderModels.value.find(m => m.id === modelId)
  if (model) {
    form.models[index].name = model.name
  } else {
    form.models[index].name = modelId
  }
}

const addOption = () => {
  form.options.push({ key: '', value: '' })
}

const removeOption = (index: number) => {
  if (form.options.length > 1) {
    form.options.splice(index, 1)
  }
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
  form.options = [{ key: '', value: '' }]
  form.models = [{ id: '', name: '' }]
  currentProviderModels.value = []
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

    const modelsConfig: Record<string, { id: string; name: string }> = {}
    for (const model of validModels) {
      modelsConfig[model.id] = { id: model.id, name: model.name }
    }

    const currentConfig = await getGlobalConfig()

    const options: Record<string, string> = {}
    if (form.baseUrl) {
      options.baseURL = form.baseUrl
    }
    const validOptions = form.options.filter(o => o.key && o.value)
    for (const option of validOptions) {
      options[option.key] = option.value
    }

    const providerConfig: Record<string, unknown> = {
      npm: '@ai-sdk/openai-compatible',
      name: form.providerName,
      models: modelsConfig
    }

    if (Object.keys(options).length > 0) {
      providerConfig.options = options
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
