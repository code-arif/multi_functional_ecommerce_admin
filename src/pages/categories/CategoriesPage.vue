<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <DataTable :items="categories" :columns="columns" :loading="loading" empty-icon="🏷️"
      empty-text="No categories yet">
      <template #actions>
        <button @click="openForm()" class="btn-primary">Add Category</button>
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style="background-color:var(--border-light)">
              <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
              <Tag class="w-4 h-4" style="color:var(--text-muted)" />
            </div>
            <div>
              <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.name }}</p>
              <p class="text-xs" style="color:var(--text-muted)">/{{ item.slug }}</p>
            </div>
          </div>
        </td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.parent?.name || '—' }}</td>
        <td class="table-cell text-sm" style="color:var(--text-primary)">{{ item.products_count || 0 }}</td>
        <td class="table-cell text-sm" style="color:var(--text-primary)">{{ item.commission_rate || '0.00' }}%</td>
        <td class="table-cell">
          <span class="badge" :class="item.is_featured ? 'badge-blue' : 'badge-gray'">
            {{ item.is_featured ? 'Featured' : 'No' }}
          </span>
        </td>
        <td class="table-cell">
          <StatusBadge :value="item.status" />
        </td>
        <td class="table-cell">
          <StatusBadge :value="item.is_active ? 'active' : 'inactive'" />
        </td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="Edit">
              <button @click="openForm(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all">
                <PencilIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:bg-red-50 transition-all">
                <TrashIcon class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Form Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative z-10 h-full overflow-y-auto flex items-start justify-center p-4 pt-16">
        <div class="bg-white rounded-2xl p-6 w-full max-w-2xl my-8 animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">{{ editing ? 'Edit' : 'Add' }} Category</h2>
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
                <SelectBox v-model="form.parent_id" :options="parentOptions" placeholder="None (Root Category)" size="lg" full-width />
              </div>

              <!-- Description -->
              <div class="col-span-2">
                <label class="label">Description</label>
                <textarea v-model="form.description" rows="2" class="input" />
              </div>

              <!-- Image -->
              <div class="col-span-2">
                <ImagePicker v-model="imageFile" label="Image" :preview-url="editing?.image_url || ''" hint="PNG, JPG, WEBP - Max 5MB" />
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
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">{{
                saving ? 'Saving...' : 'Save Category'
              }}
              </button>
              <button type="button" @click="showForm = false"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </Teleport>
    <ConfirmModal :show="!!deleteTarget" title="Delete Category" :message="`Delete '${deleteTarget?.name}'?`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ImagePicker from '@ecom/ui/components/ImagePicker.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { categoryApi } from '@/api'
import { PencilIcon, TrashIcon, TagIcon } from '@heroicons/vue/24/outline'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'
import { Tag } from 'lucide-vue-next'

const toast = useToast()
const categories = ref([]), loading = ref(true), showForm = ref(false), saving = ref(false)
const editing = ref(null), deleteTarget = ref(null), deleting = ref(false), imageFile = ref(null)
const form = reactive({
  name: '',
  parent_id: null,
  description: '',
  sort_order: 0,
  is_active: true,
  is_featured: false,
  status: 'approved',
  commission_rate: 0.00
})
const errors = ref({})

const breadcrumbItems = computed(() => [
  { label: 'Categories', icon: TagIcon }
])

const columns = [
  { key: 'name', label: 'Category' },
  { key: 'parent', label: 'Parent', class: 'w-32' },
  { key: 'products', label: 'Products', class: 'w-20' },
  { key: 'commission_rate', label: 'Commission', class: 'w-24' },
  { key: 'is_featured', label: 'Featured', class: 'w-24' },
  { key: 'status', label: 'Approval', class: 'w-24' },
  { key: 'is_active', label: 'Status', class: 'w-24' },
  { key: 'actions', label: 'Action', class: 'w-24 text-right' },
]

const statusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const flatCategories = computed(() => categories.value.filter(c => !editing.value || c.id !== editing.value.id))

const parentOptions = computed(() => [
  { value: null, label: 'None (Root Category)' },
  ...flatCategories.value.map(c => ({ value: c.id, label: c.name }))
])


async function load() {
  loading.value = true
  try {
    const r = await categoryApi.list();
    categories.value = r.data.data || []
  } finally {
    loading.value = false
  }
}

function openForm(item = null) {
  editing.value = item
  errors.value = {}
  if (item) Object.assign(form, {
    name: item.name,
    parent_id: item.parent_id,
    description: item.description || '',
    sort_order: item.sort_order || 0,
    is_active: !!item.is_active,
    is_featured: !!item.is_featured,
    status: item.status || 'approved',
    commission_rate: item.commission_rate || 0.00
  })
  else Object.assign(form, {
    name: '',
    parent_id: null,
    description: '',
    sort_order: 0,
    is_active: true,
    is_featured: false,
    status: 'approved',
    commission_rate: 0.00
  })
  showForm.value = true;
  imageFile.value = null
}

// Save category
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

    if (editing.value) {
      await categoryApi.update(editing.value.id, fd)
    } else {
      await categoryApi.store(fd)
    }

    toast.success('Category saved.')
    showForm.value = false
    load()

  } catch (e) {
    // errors show under fields
    errors.value = e.response?.data?.errors || {}

    // toast
    toast.error(e.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await categoryApi.destroy(deleteTarget.value.id);
    toast.success('Deleted.');
    deleteTarget.value = null;
    load()
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>