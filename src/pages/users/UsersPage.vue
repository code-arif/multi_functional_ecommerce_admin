<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems">
      <button @click="openForm()" class="btn-primary text-sm">
        Add Customer
      </button>
    </BreadcrumbHeader>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div class="card p-3 flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }"
        >
          <UsersIcon class="w-4 h-4" :style="{ color: 'var(--color-primary)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Total Accounts</p>
          <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.total || 0 }}</p>
        </div>
      </div>

      <div class="card p-3 flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)' }"
        >
          <CheckBadgeIcon class="w-4 h-4" :style="{ color: 'var(--success)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Verified Customers</p>
          <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.verified_customers || 0 }}</p>
        </div>
      </div>

      <div class="card p-3 flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--warning) 15%, transparent)' }"
        >
          <UserIcon class="w-4 h-4" :style="{ color: 'var(--warning)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Free / Unverified Users</p>
          <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.free_users || 0 }}</p>
        </div>
      </div>

      <div class="card p-3 flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--danger) 15%, transparent)' }"
        >
          <NoSymbolIcon class="w-4 h-4" :style="{ color: 'var(--danger)' }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Banned</p>
          <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.banned || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Customer Segmentation Tabs -->
    <div class="card p-2 mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="tab in customerTabs"
          :key="tab.value"
          @click="switchTab(tab.value)"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
          :class="customerType === tab.value
            ? 'text-white shadow-sm'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
          :style="customerType === tab.value
            ? { backgroundColor: 'var(--color-primary)' }
            : { color: 'var(--text-secondary)' }"
        >
          <span>{{ tab.label }}</span>
          <span
            class="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
            :class="customerType === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
      <p class="text-xs px-2" :style="{ color: 'var(--text-muted)' }">
        <span v-if="customerType === 'verified'">Customers with at least 1 completed or active purchase.</span>
        <span v-else-if="customerType === 'unverified'">Registered users who have not purchased any product yet.</span>
        <span v-else>All registered marketplace users and verified buyers.</span>
      </p>
    </div>

    <DataTable
      :items="users"
      :columns="columns"
      :loading="loading"
      searchable
      search-placeholder="Search by name, email, phone..."
      empty-icon="👥"
      :empty-text="emptyText"
      @search="q => { search = q; load(1) }"
    >
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="md" @change="load(1)" />
      </template>

      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              :style="{ backgroundColor: 'var(--color-primary)' }"
            >
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
          <span
            v-if="item.is_verified_customer"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap"
          >
            <CheckBadgeIcon class="w-3.5 h-3.5" />
            Verified Customer
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap"
          >
            <UserIcon class="w-3.5 h-3.5" />
            Free User
          </span>
        </td>

        <td class="table-cell text-xs">
          <p class="font-semibold" :style="{ color: 'var(--text-primary)' }">
            {{ item.orders_count || 0 }} {{ (item.orders_count || 0) === 1 ? 'order' : 'orders' }}
          </p>
          <p :style="{ color: 'var(--text-muted)' }">
            ৳{{ Number(item.total_spent || 0).toLocaleString() }}
          </p>
        </td>

        <td class="table-cell">
          <div class="relative">
            <button
              @click="toggleDropdown(item.uuid || item.id)"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              :class="statusBtnClass(item.status)"
            >
              {{ item.status }}
              <ChevronDownIcon class="w-3.5 h-3.5" />
            </button>
            <div
              v-if="openDropdownId === (item.uuid || item.id)"
              class="absolute left-0 top-full mt-1 z-50 w-36 bg-white rounded-xl border border-gray-200 shadow-lg py-1 animate-in"
            >
              <button
                v-for="opt in statusRowOptions"
                :key="opt.value"
                @click="changeStatus(item, opt.value)"
                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                :class="item.status === opt.value ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'"
              >
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
              <router-link
                :to="'/users/' + (item.uuid || item.id)"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all"
              >
                <EyeIcon class="w-4 h-4" />
              </router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <button
                @click="openForm(item)"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:text-blue-600 transition-all"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Delete">
              <button
                @click="confirmDelete(item)"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
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
        <div
          class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)"
        >
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
            <div v-if="!editing">
              <label class="label">Password (optional)</label>
              <input v-model="form.password" type="password" minlength="8" class="input" placeholder="Min. 8 chars (auto-generated if blank)" />
            </div>
            <div>
              <label class="label">Status</label>
              <SelectBox v-model="form.status" :options="formStatusOptions" placeholder="Select status" fullWidth />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
                {{ saving ? 'Saving...' : editing ? 'Update Customer' : 'Create Customer' }}
              </button>
              <button
                type="button"
                @click="showForm = false"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal
      :show="!!deleteTarget"
      title="Delete Customer"
      :message="`Delete customer '${deleteTarget?.name}'? This action will revoke their active sessions.`"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import DataTable from '@ecom/ui/components/DataTable.vue'
import Pagination from '@ecom/ui/components/Pagination.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  UsersIcon,
  CheckBadgeIcon,
  UserIcon,
  NoSymbolIcon,
} from '@heroicons/vue/24/outline'
import { customerApi } from '@/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const VALID_TABS = ['all', 'verified', 'unverified']

function resolveTab(raw) {
  return VALID_TABS.includes(raw) ? raw : 'all'
}

const users = ref([])
const pagination = ref(null)
const stats = ref({
  total: 0,
  verified_customers: 0,
  free_users: 0,
  active: 0,
  inactive: 0,
  banned: 0,
})
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const customerType = ref(resolveTab(route.query.tab))
const perPage = ref(15)
const openDropdownId = ref(null)
const showForm = ref(false)
const saving = ref(false)
const editing = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Customers', icon: UsersIcon }
])

const customerTabs = computed(() => [
  { value: 'all', label: 'All Customers', count: stats.value.total || 0 },
  { value: 'verified', label: 'Verified Customers', count: stats.value.verified_customers || 0 },
  { value: 'unverified', label: 'Free / Unverified Users', count: stats.value.free_users || 0 },
])

const emptyText = computed(() => {
  if (customerType.value === 'verified') return 'No verified customers found'
  if (customerType.value === 'unverified') return 'No free / unverified users found'
  return 'No customers found'
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  status: 'active',
})

const statusOptions = [
  { value: '', label: 'All Status' },
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
  { key: 'customer_type', label: 'Verification', class: 'w-40' },
  { key: 'orders_count', label: 'Orders / Spent', class: 'w-32' },
  { key: 'status', label: 'Status', class: 'w-28' },
  { key: 'joined', label: 'Joined', class: 'w-28' },
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
    banned: 'text-red-700 bg-red-50 hover:bg-red-100',
  }
  return map[status] || 'text-gray-600 bg-gray-100'
}

function statusDotClass(status) {
  const map = { active: 'bg-green-500', inactive: 'bg-gray-400', banned: 'bg-red-500' }
  return map[status] || 'bg-gray-400'
}

function switchTab(type) {
  const nextTab = resolveTab(type)
  if (customerType.value === nextTab && resolveTab(route.query.tab) === nextTab) return

  customerType.value = nextTab
  const nextQuery = { ...route.query }
  if (nextTab === 'all') {
    delete nextQuery.tab
  } else {
    nextQuery.tab = nextTab
  }
  router.replace({ query: nextQuery })
  load(1)
}

watch(
  () => route.query.tab,
  (newTab) => {
    const resolved = resolveTab(newTab)
    if (resolved !== customerType.value) {
      customerType.value = resolved
      load(1)
    }
  }
)

function openForm(item = null) {
  editing.value = item
  if (item) {
    Object.assign(form, {
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      password: '',
      status: item.status,
    })
  } else {
    Object.assign(form, { name: '', email: '', phone: '', password: '', status: 'active' })
  }
  showForm.value = true
}

async function loadStats() {
  try {
    const r = await customerApi.stats()
    if (r.data?.data) {
      stats.value = r.data.data
    }
  } catch {
    // non-blocking stats refresh
  }
}

async function doSave() {
  saving.value = true
  try {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      status: form.status,
    }

    if (editing.value) {
      await customerApi.update(editing.value.uuid || editing.value.id, payload)
      toast.success('Customer updated.')
    } else {
      if (form.password) payload.password = form.password
      await customerApi.store(payload)
      toast.success('Customer created.')
    }

    showForm.value = false
    await Promise.all([load(pagination.value?.current_page || 1), loadStats()])
  } catch (e) {
    const errs = e.response?.data?.errors
    const firstMsg = errs ? Object.values(errs)[0]?.[0] : null
    toast.error(firstMsg || e.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await customerApi.destroy(deleteTarget.value.uuid || deleteTarget.value.id)
    toast.success('Customer deleted.')
    deleteTarget.value = null
    await Promise.all([load(pagination.value?.current_page || 1), loadStats()])
  } catch (e) {
    toast.error(e.response?.data?.message || 'Delete failed.')
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
    const params = {
      page,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      customer_type: customerType.value !== 'all' ? customerType.value : undefined,
      per_page: perPage.value,
    }
    const r = await customerApi.list(params)
    users.value = r.data.data || []
    pagination.value = r.data.pagination
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load customers.')
  } finally {
    loading.value = false
  }
}

async function changeStatus(item, status) {
  const key = item.uuid || item.id
  const idx = users.value.findIndex(u => (u.uuid || u.id) === key)
  if (idx !== -1) users.value[idx] = { ...users.value[idx], status }
  openDropdownId.value = null
  try {
    await customerApi.updateStatus(key, status)
    toast.success('Status changed to ' + (statusRowOptions.find(o => o.value === status)?.label || status))
    loadStats()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Status update failed.')
    load(pagination.value?.current_page || 1)
  }
}

onMounted(() => {
  load()
  loadStats()
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
