<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative z-10 flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          class="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)"
          @click.stop
        >
          <div class="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <h2 class="font-bold text-lg" style="color:var(--text-primary)">
              {{ category ? 'Edit' : 'Add' }} Category
            </h2>
            <button
              type="button"
              @click="emit('close')"
              class="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="save">
            <div class="p-6 space-y-4">
              <div v-if="formError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {{ formError }}
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Name -->
                <div>
                  <label class="label">Name *</label>
                  <input v-model="form.name" required class="input" placeholder="e.g. Electronics" />
                  <p v-if="errors.name" class="text-red-500 text-xs mt-1">
                    {{ errors.name[0] }}
                  </p>
                </div>

                <!-- Parent Category -->
                <div>
                  <label class="label">Parent Category</label>
                  <SelectBox v-model="form.parent_uuid" :options="parentOptions" placeholder="None (Root Category)" size="lg" full-width />
                  <p v-if="errors.parent_uuid" class="text-red-500 text-xs mt-1">
                    {{ errors.parent_uuid[0] }}
                  </p>
                </div>

                <!-- Icon -->
                <div>
                  <label class="label">Icon (optional)</label>
                  <input v-model="form.icon" class="input" placeholder="e.g. cpu-chip or 🏷️" />
                  <p v-if="errors.icon" class="text-red-500 text-xs mt-1">
                    {{ errors.icon[0] }}
                  </p>
                </div>

                <!-- Sort Order -->
                <div>
                  <label class="label">Sort Order</label>
                  <input v-model.number="form.sort_order" type="number" min="0" class="input" />
                  <p v-if="errors.sort_order" class="text-red-500 text-xs mt-1">
                    {{ errors.sort_order[0] }}
                  </p>
                </div>

                <!-- Description -->
                <div class="sm:col-span-2">
                  <label class="label">Description</label>
                  <textarea v-model="form.description" rows="2" class="input" placeholder="Brief category description..." />
                  <p v-if="errors.description" class="text-red-500 text-xs mt-1">
                    {{ errors.description[0] }}
                  </p>
                </div>

                <!-- Image & Banner -->
                <div>
                  <ImagePicker v-model="imageFile" label="Thumbnail Image" :preview-url="category?.image_url || ''" :max-size-m-b="2" />
                  <p v-if="errors.image" class="text-red-500 text-xs mt-1">{{ errors.image[0] }}</p>
                </div>
                <div>
                  <ImagePicker v-model="bannerFile" label="Banner Image" :preview-url="category?.banner_url || ''" :max-size-m-b="2" />
                  <p v-if="errors.banner" class="text-red-500 text-xs mt-1">{{ errors.banner[0] }}</p>
                </div>

                <!-- Commission Rate -->
                <div>
                  <label class="label">Commission Rate (%)</label>
                  <input v-model.number="form.commission_rate" type="number" step="0.01" class="input" min="0" max="100" />
                  <p v-if="errors.commission_rate" class="text-red-500 text-xs mt-1">
                    {{ errors.commission_rate[0] }}
                  </p>
                </div>

                <!-- Approval Status -->
                <div>
                  <label class="label">Approval Status</label>
                  <SelectBox v-model="form.status" :options="statusOptions" size="lg" full-width />
                  <p v-if="errors.status" class="text-red-500 text-xs mt-1">
                    {{ errors.status[0] }}
                  </p>
                </div>

                <!-- SEO Fields -->
                <div>
                  <label class="label">Meta Title</label>
                  <input v-model="form.meta_title" class="input" placeholder="Optional SEO title" />
                  <p v-if="errors.meta_title" class="text-red-500 text-xs mt-1">{{ errors.meta_title[0] }}</p>
                </div>

                <div>
                  <label class="label">Meta Keywords</label>
                  <input v-model="form.meta_keywords" class="input" placeholder="keyword1, keyword2" />
                  <p v-if="errors.meta_keywords" class="text-red-500 text-xs mt-1">{{ errors.meta_keywords[0] }}</p>
                </div>

                <div class="sm:col-span-2">
                  <label class="label">Meta Description</label>
                  <textarea v-model="form.meta_description" rows="2" class="input" placeholder="Optional SEO description..." />
                  <p v-if="errors.meta_description" class="text-red-500 text-xs mt-1">{{ errors.meta_description[0] }}</p>
                </div>

                <!-- Toggles -->
                <div class="sm:col-span-2 flex items-center gap-6 pt-1">
                  <div>
                    <ToggleSwitch v-model="form.is_active" label="Active" />
                    <p v-if="errors.is_active" class="text-red-500 text-xs mt-1">
                      {{ errors.is_active[0] }}
                    </p>
                  </div>
                  <div>
                    <ToggleSwitch v-model="form.is_featured" label="Featured" />
                    <p v-if="errors.is_featured" class="text-red-500 text-xs mt-1">
                      {{ errors.is_featured[0] }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button type="button" @click="emit('close')"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="saving" class="btn-primary px-6 justify-center">
                {{ saving ? 'Saving...' : 'Save Category' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ImagePicker from '@ecom/ui/components/ImagePicker.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'
import { categoryApi } from '@/api/category'

const props = defineProps({
  show: { type: Boolean, required: true },
  category: { type: Object, default: null },
  categories: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'saved'])

const toast = useToast()
const saving = ref(false)
const imageFile = ref(null)
const bannerFile = ref(null)
const errors = ref({})
const formError = ref('')

const form = reactive({
  name: '',
  parent_uuid: null,
  icon: '',
  description: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  sort_order: 0,
  is_active: true,
  is_featured: false,
  status: 'approved',
  commission_rate: 0.00
})

const statusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

// Exclude current editing category from parent options
const flatCategories = computed(() => {
  return props.categories.filter(c => !props.category || c.id !== props.category.id)
})

const parentOptions = computed(() => [
  { value: null, label: 'None (Root Category)' },
  ...flatCategories.value.map(c => ({ value: c.uuid, label: c.name }))
])

watch(() => props.show, (newVal) => {
  if (newVal) {
    errors.value = {}
    formError.value = ''
    imageFile.value = null
    bannerFile.value = null
    if (props.category) {
      Object.assign(form, {
        name: props.category.name,
        parent_uuid: props.category.parent?.uuid || null,
        icon: props.category.icon || '',
        description: props.category.description || '',
        meta_title: props.category.meta_title || '',
        meta_description: props.category.meta_description || '',
        meta_keywords: props.category.meta_keywords || '',
        sort_order: props.category.sort_order || 0,
        is_active: !!props.category.is_active,
        is_featured: !!props.category.is_featured,
        status: props.category.status || 'approved',
        commission_rate: props.category.commission_rate || 0.00
      })
    } else {
      Object.assign(form, {
        name: '',
        parent_uuid: null,
        icon: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        sort_order: 0,
        is_active: true,
        is_featured: false,
        status: 'approved',
        commission_rate: 0.00
      })
    }
  }
}, { immediate: true })

async function save() {
  saving.value = true
  errors.value = {}
  formError.value = ''
  try {
    const fd = new FormData()

    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        if (k === 'is_active' || k === 'is_featured') {
          fd.append(k, v ? 1 : 0)
        } else {
          fd.append(k, v)
        }
      }
    })

    if (imageFile.value) fd.append('image', imageFile.value)
    if (bannerFile.value) fd.append('banner', bannerFile.value)

    if (props.category) {
      await categoryApi.update(props.category.uuid, fd)
    } else {
      await categoryApi.store(fd)
    }

    toast.success('Category saved.')
    emit('saved')
  } catch (e) {
    const status = e.response?.status
    errors.value = e.response?.data?.errors || {}
    const firstError = Object.values(errors.value)[0]?.[0]
    const message = firstError || e.response?.data?.message || 'Save failed.'
    if (!firstError) formError.value = message
    if (status !== 403 && status !== 500) {
      toast.error(message)
    }
  } finally {
    saving.value = false
  }
}
</script>
