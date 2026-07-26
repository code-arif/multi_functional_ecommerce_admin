<template>
    <div>
    <DataTable :items="users" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by name, email..." empty-icon="👥" empty-text="No customers found"
      @search="q => { search = q; load(1) }">
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="md" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" :style="{ backgroundColor: 'var(--color-primary)' }">
              {{ item.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">{{ item.name }}</p>
              <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ item.email }}</p>
            </div>
          </div>
        </td>
        <td class="table-cell text-sm" :style="{ color: 'var(--text-secondary)' }">{{ item.phone || '—' }}</td>
        <td class="table-cell">
          <div class="relative">
            <button @click="toggleDropdown(item.id)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors" :class="statusBtnClass(item.status)">
              {{ item.status }}
              <ChevronDownIcon class="w-3.5 h-3.5" />
            </button>
            <div v-if="openDropdownId === item.id" class="absolute left-0 top-full mt-1 z-50 w-36 bg-white rounded-xl border border-gray-200 shadow-lg py-1 animate-in">
              <button v-for="opt in statusRowOptions" :key="opt.value" @click="changeStatus(item.id, opt.value)"
                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                :class="item.status === opt.value ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'">
                <span class="w-2 h-2 rounded-full" :class="statusDotClass(opt.value)"></span>
                {{ opt.label }}
              </button>
            </div>
          </div>
        </td>
        <td class="table-cell text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDate(item.created_at) }}</td>
        <td class="table-cell text-right">
          <Tooltip text="View">
            <router-link :to="'/users/' + item.id" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all"><EyeIcon class="w-4 h-4" /></router-link>
          </Tooltip>
        </td>
      </template>
    </DataTable>
    <Pagination v-model:perPage="perPage" :pagination="pagination" @page="load" />
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/common/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { EyeIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { userApi } from '@/api'

const toast = useToast()
const users = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('')
const perPage = ref(15)
const openDropdownId = ref(null)

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
]

const statusRowOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
]

const columns = [
  { key: 'name', label: 'Customer' },
  { key: 'phone', label: 'Phone', class: 'w-32' },
  { key: 'status', label: 'Status', class: 'w-24' },
  { key: 'joined', label: 'Joined', class: 'w-32' },
  { key: 'actions', label: 'Action', class: 'w-16 text-right' },
]

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
}

function toggleDropdown(id) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function statusBtnClass(status) {
  const map = {
    active: 'text-green-700 bg-green-50 hover:bg-green-100',
    inactive: 'text-gray-600 bg-gray-100 hover:bg-gray-200',
    banned: 'text-red-700 bg-red-50 hover:bg-red-100'
  }
  return map[status] || 'text-gray-600 bg-gray-100'
}

function statusDotClass(status) {
  const map = { active: 'bg-green-500', inactive: 'bg-gray-400', banned: 'bg-red-500' }
  return map[status] || 'bg-gray-400'
}

function onDocumentClick(e) {
  if (openDropdownId.value !== null) {
    const dropdown = e.target.closest('.relative')
    if (!dropdown) openDropdownId.value = null
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const r = await userApi.list({ page, search: search.value, status: statusFilter.value, per_page: perPage.value })
    users.value = r.data.data || []
    pagination.value = r.data.pagination
  } finally {
    loading.value = false
  }
}

async function changeStatus(id, status) {
  const idx = users.value.findIndex(u => u.id === id)
  if (idx !== -1) users.value[idx] = { ...users.value[idx], status }
  toast.success('Status changed to ' + (statusRowOptions.find(o => o.value === status)?.label || status))
  openDropdownId.value = null
  try {
    await userApi.updateStatus(id, status)
  } catch {
    load()
  }
}

onMounted(() => {
  load()
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>