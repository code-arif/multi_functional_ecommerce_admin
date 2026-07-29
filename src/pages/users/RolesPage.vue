<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <DataTable :items="roles" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by role name..." empty-icon="🔐" empty-text="No roles defined"
      @search="q => { search = q; load(1) }">
      <template #actions>
        <button @click="$router.push('/roles/create')" class="btn-primary">
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
              <router-link :to="'/roles/' + item.id + '/edit'" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:text-blue-600 transition-all inline-flex items-center"><PencilIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all"><TrashIcon class="w-4 h-4" /></button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <ConfirmModal :show="!!deleteTarget" title="Delete Role"
      :message="`Delete role '${deleteTarget?.name}'? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { PencilIcon, TrashIcon, EyeIcon, IdentificationIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const roles = ref([]), loading = ref(true), search = ref(''), typeFilter = ref('')
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
