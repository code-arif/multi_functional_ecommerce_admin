<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <DataTable :items="brands" :columns="columns" :loading="loading" searchable @search="q => { search = q; load() }"
      empty-icon="🏭">
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style="background-color:var(--border-light)">
              <img v-if="item.logo_url" :src="item.logo_url" class="w-full h-full object-contain p-1" />
              <span class="w-full h-full flex items-center justify-center">
                <Factory class="w-4 h-4" style="color:var(--text-muted)" />
              </span>
            </div>
            <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.name }}</p>
          </div>
        </td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.products_count || 0 }} products</td>
        <td class="table-cell"><span class="badge" :class="item.is_active ? 'badge-green' : 'badge-gray'">{{
          item.is_active ? 'Active' : 'Inactive'
        }}</span></td>
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
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative z-10 h-full overflow-y-auto flex items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">{{ editing ? 'Edit' : 'Add' }} Brand</h2>
          <form @submit.prevent="save" class="space-y-4">
            <div><label class="label">Brand Name *</label><input v-model="form.name" required class="input" /></div>
            <div><label class="label">Website</label><input v-model="form.website" type="url" class="input"
                placeholder="https://" /></div>
            <div><label class="label">Description</label><textarea v-model="form.description" rows="2" class="input" />
            </div>
            <ImagePicker v-model="logoFile" label="Logo" :preview-url="editing?.logo_url || ''" hint="PNG, JPG, WEBP - Max 5MB" />
            <ToggleSwitch v-model="form.is_active" label="Active" />
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">{{
                saving ? 'Saving...' : 'Save Brand'
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
    <ConfirmModal :show="!!deleteTarget" title="Delete Brand" :message="`Delete '${deleteTarget?.name}'?`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { brandApi } from '@/api'
import { PencilIcon, TrashIcon, BuildingStorefrontIcon } from '@heroicons/vue/24/outline'
import { Factory } from 'lucide-vue-next'
import ImagePicker from '@ecom/ui/components/ImagePicker.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'

const toast = useToast()
const brands = ref([]), loading = ref(true), showForm = ref(false), saving = ref(false), search = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Brands', icon: BuildingStorefrontIcon }
])

const editing = ref(null), deleteTarget = ref(null), deleting = ref(false), logoFile = ref(null)
const form = reactive({ name: '', website: '', description: '', is_active: true })
const columns = [{ key: 'name', label: 'Brand' }, { key: 'products', label: 'Products', class: 'w-32' }, {
  key: 'status',
  label: 'Status',
  class: 'w-24'
}, { key: 'actions', label: 'Action', class: 'w-24 text-right' }]

async function load() {
  loading.value = true;
  try {
    const r = await brandApi.list({ search: search.value });
    brands.value = r.data.data || []
  } finally {
    loading.value = false
  }
}

function openForm(item = null) {
  editing.value = item;
  if (item) Object.assign(form, {
    name: item.name,
    website: item.website || '',
    description: item.description || '',
    is_active: item.is_active
  }); else Object.assign(form, { name: '', website: '', description: '', is_active: true });
  showForm.value = true;
  logoFile.value = null
}

async function save() {
  saving.value = true;
  try {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        if (k === 'is_active') {
          fd.append(k, v ? 1 : 0)
        } else {
          fd.append(k, v)
        }
      }
    })
    if (logoFile.value) fd.append('logo', logoFile.value);
    if (editing.value) await brandApi.update(editing.value.id, fd); else await brandApi.store(fd);
    toast.success('Brand saved successfully!.');
    showForm.value = false;
    load()
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true;
  try {
    await brandApi.destroy(deleteTarget.value.id);
    toast.success('Brand deleted!');
    deleteTarget.value = null;
    load()
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>
