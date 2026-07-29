<template>
    <div>
    <Breadcrumb :items="breadcrumbItems" />
    <DataTable :items="users" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by name, email..." empty-icon="👥" empty-text="No customers found"
      @search="q => { search = q; load(1) }">
      <template #actions>
        <button @click="openForm()" class="btn-primary">
          Add Customer
        </button>
      </template>
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
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="'/users/' + item.id" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all"><EyeIcon class="w-4 h-4" /></router-link>
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
    <Pagination v-model:perPage="perPage" :pagination="pagination" @page="load" />

    <!-- Add / Edit Customer Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'Add' }} Customer</h2>
          <form @submit.prevent="doSave" class="space-y-4">
            <div>
              <label class="label">Full Name *</label>
              <input v-model="form.name" required class="input" placeholder="e.g. John Smith" />
            </div>
            <div>
              <label class="label">Email *</label>
              <input v-model="form.email" type="email" required class="input" placeholder="e.g. john@example.com" />
            </div>
            <div>
              <label class="label">Phone</label>
              <input v-model="form.phone" class="input" placeholder="e.g. +8801711111111" />
            </div>
            <div>
              <label class="label">Status</label>
              <SelectBox v-model="form.status" :options="formStatusOptions" placeholder="Select status" fullWidth />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
                {{ saving ? 'Saving...' : editing ? 'Update Customer' : 'Create Customer' }}
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

    <ConfirmModal :show="!!deleteTarget" title="Delete Customer"
      :message="`Delete customer '${deleteTarget?.name}'? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@ecom/ui/components/DataTable.vue'
import Pagination from '@ecom/ui/components/Pagination.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { EyeIcon, PencilIcon, TrashIcon, ChevronDownIcon, UsersIcon } from '@heroicons/vue/24/outline'
import { userApi } from '@/api'

const toast = useToast()
const users = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('')
const perPage = ref(15)
const openDropdownId = ref(null)
const showForm = ref(false), saving = ref(false), editing = ref(null)
const deleteTarget = ref(null), deleting = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Users', icon: UsersIcon }
])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  status: 'active'
})

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
]

const formStatusOptions = [
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
  { key: 'actions', label: 'Action', class: 'w-28 text-right' },
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

function openForm(item = null) {
  editing.value = item
  if (item) {
    Object.assign(form, {
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      status: item.status
    })
  } else {
    Object.assign(form, { name: '', email: '', phone: '', status: 'active' })
  }
  showForm.value = true
}

async function doSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    if (editing.value) {
      const idx = users.value.findIndex(u => u.id === editing.value.id)
      if (idx !== -1) {
        users.value[idx] = { ...users.value[idx], name: form.name, email: form.email, phone: form.phone, status: form.status }
      }
      toast.success('Customer updated.')
    } else {
      users.value.unshift({
        id: users.value.length + 1,
        name: form.name,
        email: form.email,
        phone: form.phone,
        status: form.status,
        created_at: new Date().toISOString()
      })
      if (pagination.value) pagination.value.total = (pagination.value.total || 0) + 1
      toast.success('Customer created.')
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
    users.value = users.value.filter(u => u.id !== deleteTarget.value.id)
    if (pagination.value) pagination.value.total = Math.max(0, (pagination.value.total || 1) - 1)
    toast.success('Customer deleted.')
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
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