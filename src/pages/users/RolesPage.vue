<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />

    <DataTable :items="roles" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by role name..." empty-icon="🔐" empty-text="No roles found"
      @search="q => { search = q; load(1) }">
      <template #actions>
        <button @click="$router.push('/roles/create')" class="btn-primary">
          Add Role
        </button>
      </template>
      <template #filters>
        <SelectBox v-model="guardFilter" :options="guardOptions" placeholder="All Guards" size="md"
          @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">{{ item.display_name || item.name }}</td>
        <td class="table-cell"><span class="badge badge-purple whitespace-nowrap">{{ item.permissions_count ?? 0 }} permissions</span></td>
        <td class="table-cell"><span class="badge badge-blue whitespace-nowrap">{{ item.users_count ?? 0 }} users</span></td>
        <td class="table-cell">
          <span class="badge whitespace-nowrap" :class="item.guard_name === 'web' ? 'badge-green' : 'badge-gray'">{{ item.guard_name }}</span>
        </td>
        <td class="table-cell text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDate(item.created_at) }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="`/roles/${item.id}`" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all inline-flex items-center"><EyeIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <router-link :to="`/roles/${item.id}/edit`" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:text-blue-600 transition-all inline-flex items-center"><PencilIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all"><TrashIcon class="w-4 h-4" /></button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <Pagination v-model:perPage="perPage" :pagination="pagination" @page="load" />

    <ConfirmModal :show="!!deleteTarget" title="Delete Role"
      :message="`Delete role '${deleteTarget?.display_name || deleteTarget?.name}'? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import Pagination from '@ecom/ui/components/Pagination.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { PencilIcon, TrashIcon, EyeIcon, IdentificationIcon } from '@heroicons/vue/24/outline'
import { roleApi } from '@/api/role'

const toast = useToast()

const roles = ref([])
const loading = ref(true)
const search = ref('')
const guardFilter = ref('')
const perPage = ref(10)
const deleteTarget = ref(null)
const deleting = ref(false)

const pagination = ref({
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
})

const breadcrumbItems = computed(() => [
  { label: 'Roles', icon: IdentificationIcon }
])

const guardOptions = [
  { value: '', label: 'All Guards' },
  { value: 'web', label: 'Web' },
  { value: 'api', label: 'API' },
]

const columns = [
  { key: 'name', label: 'Role Name' },
  { key: 'permissions', label: 'Permissions', class: 'w-32' },
  { key: 'users', label: 'Users', class: 'w-24' },
  { key: 'guard', label: 'Guard', class: 'w-24' },
  { key: 'created', label: 'Created', class: 'w-28' },
  { key: 'actions', label: 'Action', class: 'w-28 text-right' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await roleApi.destroy(deleteTarget.value.id)
    toast.success('Role deleted successfully.')
    deleteTarget.value = null
    await load(pagination.value.current_page)
  } catch (e) {
    const msg = e.response?.data?.message || 'Delete failed.'
    toast.error(msg)
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const res = await roleApi.list({
      page,
      per_page: perPage.value,
      search: search.value,
      guard: guardFilter.value,
    })
    roles.value = res.data.data || []
    pagination.value = res.data.pagination || {
      total: 0,
      per_page: perPage.value,
      current_page: page,
      last_page: 1,
    }
  } catch (e) {
    console.error('Failed to load roles:', e)
    toast.error('Failed to load roles.')
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
