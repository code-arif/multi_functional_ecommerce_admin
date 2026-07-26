<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <DataTable :items="roles" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by role name..." empty-icon="🔐" empty-text="No roles defined"
      @search="q => { search = q; load(1) }">
      <template #actions>
        <button @click="openForm()" class="btn-primary">
Add Role
        </button>
      </template>
      <template #filters>
        <SelectBox v-model="typeFilter" :options="typeOptions" placeholder="All Types" size="md" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">{{ item.name }}</td>
        <td class="table-cell text-sm" :style="{ color: 'var(--text-secondary)' }">{{ item.description }}</td>
        <td class="table-cell"><span class="badge badge-blue whitespace-nowrap">{{ item.users_count }} users</span></td>
        <td class="table-cell"><span class="badge whitespace-nowrap" :class="item.is_default ? 'badge-green' : 'badge-gray'">{{ item.is_default ? 'Default' : 'Custom' }}</span></td>
        <td class="table-cell text-xs" :style="{ color: 'var(--text-muted)' }">{{ item.created_at }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="'/roles/' + item.id" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all"><EyeIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <button @click="openForm(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:text-blue-600 transition-all"><PencilIcon class="w-4 h-4" /></button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all"><TrashIcon class="w-4 h-4" /></button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Add / Edit Role Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'Add' }} Role</h2>
          <form @submit.prevent="doSave" class="space-y-4">
            <div>
              <label class="label">Role Name *</label>
              <input v-model="form.name" required class="input" placeholder="e.g. Moderator" />
            </div>
            <div>
              <label class="label">Description *</label>
              <textarea v-model="form.description" required rows="3" class="input" placeholder="Describe this role..." />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
                {{ saving ? 'Saving...' : editing ? 'Update Role' : 'Create Role' }}
              </button>
              <button type="button" @click="showForm = false"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal :show="!!deleteTarget" title="Delete Role"
      :message="`Delete role '${deleteTarget?.name}'? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { PencilIcon, TrashIcon, EyeIcon, IdentificationIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const roles = ref([]), loading = ref(true), search = ref(''), typeFilter = ref('')
const showForm = ref(false), saving = ref(false), editing = ref(null)
const deleteTarget = ref(null), deleting = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Roles', icon: IdentificationIcon }
])

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'default', label: 'Default' },
  { value: 'custom', label: 'Custom' }
]

const columns = [
  { key: 'name', label: 'Role Name' },
  { key: 'description', label: 'Description' },
  { key: 'users', label: 'Users', class: 'w-24' },
  { key: 'type', label: 'Type', class: 'w-20' },
  { key: 'created', label: 'Created', class: 'w-28' },
  { key: 'actions', label: 'Action', class: 'w-28 text-right' }
]

const form = reactive({
  name: '',
  description: ''
})

function openForm(item = null) {
  editing.value = item
  if (item) {
    Object.assign(form, { name: item.name, description: item.description })
  } else {
    Object.assign(form, { name: '', description: '' })
  }
  showForm.value = true
}

async function doSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    if (editing.value) {
      const idx = roles.value.findIndex(r => r.id === editing.value.id)
      if (idx !== -1) {
        roles.value[idx] = { ...roles.value[idx], name: form.name, description: form.description }
      }
      toast.success('Role updated.')
    } else {
      roles.value.unshift({
        id: roles.value.length + 1,
        name: form.name,
        description: form.description,
        users_count: 0,
        is_default: false,
        created_at: new Date().toISOString().split('T')[0]
      })
      toast.success('Role created.')
    }
    showForm.value = false
  } catch (e) {
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
    await new Promise(r => setTimeout(r, 300))
    roles.value = roles.value.filter(r => r.id !== deleteTarget.value.id)
    toast.success('Role deleted.')
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

async function load(page = 1) {
  loading.value = true
  setTimeout(() => {
    roles.value = [
      { id: 1, name: 'Super Admin', description: 'Full system access with all permissions', users_count: 3, is_default: true, created_at: '2026-01-15' },
      { id: 2, name: 'Admin', description: 'Administrative access to manage store', users_count: 8, is_default: true, created_at: '2026-01-15' },
      { id: 3, name: 'Moderator', description: 'Can manage products, reviews and orders', users_count: 5, is_default: false, created_at: '2026-02-20' },
      { id: 4, name: 'Vendor Manager', description: 'Manage vendor accounts and products', users_count: 2, is_default: false, created_at: '2026-03-10' },
      { id: 5, name: 'Support Agent', description: 'Handle customer support tickets', users_count: 6, is_default: false, created_at: '2026-04-05' },
    ]
    loading.value = false
  }, 300)
}
onMounted(() => load())
</script>
