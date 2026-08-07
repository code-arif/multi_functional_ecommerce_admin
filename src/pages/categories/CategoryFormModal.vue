<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative z-10 h-full overflow-y-auto flex items-start justify-center p-4 pt-16">
        <div class="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">
            {{ category ? 'Edit' : 'Add' }} Category
          </h2>
          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <!-- Name -->
              <div class="col-span-2 sm:col-span-1">
                <label class="label">Name *</label>
                <input v-model="form.name" class="input" />
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">
                  {{ errors.name[0] }}
                </p>
              </div>

              <!-- Parent Category -->
              <div class="col-span-2 sm:col-span-1">
                <label class="label">Parent Category</label>
                <SelectBox v-model="form.parent_uuid" :options="parentOptions" placeholder="None (Root Category)" size="lg" full-width />
              </div>

              <!-- Description -->
              <div class="col-span-2">
                <label class="label">Description</label>
                <textarea v-model="form.description" rows="2" class="input" />
              </div>

              <!-- Image -->
              <div class="col-span-2">
                <ImagePicker v-model="imageFile" label="Image" :preview-url="category?.image_url || ''" hint="PNG, JPG, WEBP - Max 5MB" />
              </div>

              <!-- Commission Rate -->
              <div class="col-span-2 sm:col-span-1">
                <label class="label">Commission Rate (%)</label>
                <input v-model.number="form.commission_rate" type="number" step="0.01" class="input" min="0" max="100" />
                <p v-if="errors.commission_rate" class="text-red-500 text-xs mt-1">
                  {{ errors.commission_rate[0] }}
                </p>
              </div>

              <!-- Approval Status -->
              <div class="col-span-2 sm:col-span-1">
                <label class="label">Approval Status</label>
                <SelectBox v-model="form.status" :options="statusOptions" size="lg" full-width />
                <p v-if="errors.status" class="text-red-500 text-xs mt-1">
                  {{ errors.status[0] }}
                </p>
              </div>

              <!-- Sort Order -->
              <div class="col-span-2 sm:col-span-1">
                <label class="label">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" class="input" />
              </div>

              <!-- Toggles -->
              <div class="col-span-2 sm:col-span-1 flex items-center gap-6 pt-6">
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
            
            <div class="flex gap-3 pt-4 border-t border-gray-100">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
                {{ saving ? 'Saving...' : 'Save Category' }}
              </button>
              <button type="button" @click="emit('close')"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
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
const errors = ref({})

const form = reactive({
  name: '',
  parent_uuid: null,
  description: '',
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
    imageFile.value = null
    if (props.category) {
      Object.assign(form, {
        name: props.category.name,
        parent_uuid: props.category.parent?.uuid || null,
        description: props.category.description || '',
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
        description: '',
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

    if (props.category) {
      await categoryApi.update(props.category.uuid, fd)
    } else {
      await categoryApi.store(fd)
    }

    toast.success('Category saved.')
    emit('saved')
  } catch (e) {
    errors.value = e.response?.data?.errors || {}
    toast.error(e.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}
</script>
