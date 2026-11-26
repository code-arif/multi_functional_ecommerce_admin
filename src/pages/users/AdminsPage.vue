<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />

    <!-- Role Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Admins" :value="roleStats.total" :icon="UserGroupIcon" icon-bg="bg-indigo-50" icon-color="text-indigo-600" />
      <StatCard label="Super Admins" :value="roleStats.super_admin" :icon="ShieldCheckIcon" icon-bg="bg-purple-50" icon-color="text-purple-600" />
      <StatCard label="Admins" :value="roleStats.admin" :icon="UserCircleIcon" icon-bg="bg-blue-50" icon-color="text-blue-600" />
      <StatCard label="Moderators" :value="roleStats.moderator" :icon="UserIcon" icon-bg="bg-teal-50" icon-color="text-teal-600" />
    </div>

    <DataTable
      :items="admins"
      :columns="columns"
      :loading="loading"
      searchable
      search-placeholder="Search by name, email..."
      empty-icon="👤"
      empty-text="No admins found"
      @search="q => { search = q; load(1) }"
    >
      <template #actions>
        <button @click="openForm()" class="btn-primary">
          Add Admin
        </button>
      </template>
      <template #filters>
        <SelectBox v-model="roleFilter" :options="roleOptions" placeholder="All Roles" size="md" @change="load(1)" />
      </template>

      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" :style="{ backgroundColor: 'var(--color-primary)' }">
              {{ item.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.name }}</p>
              <p class="text-xs" style="color:var(--text-muted)">{{ item.email }}</p>
            </div>
          </div>
        </td>

        <td class="table-cell">
          <span class="badge badge-purple whitespace-nowrap">{{ item.role_display_name || item.role || '—' }}</span>
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
                v-for="opt in statusOptions"
                :key="opt.value"
                @click="updateStatus(item, opt.value)"
                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                :class="item.status === opt.value ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'"
              >
                <span class="w-2 h-2 rounded-full" :class="statusDotClass(opt.value)"></span>
                {{ opt.label }}
              </button>
            </div>
          </div>
        </td>

        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ formatDate(item.created_at) }}</td>

        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link
                :to="'/admins/' + (item.uuid || item.id)"
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

    <!-- Add / Edit Admin Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in" style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'Add' }} Admin</h2>
          <form @submit.prevent="doSave" class="space-y-4">
            <div>
              <label class="label">Full Name *</label>
              <input v-model="form.name" required class="input" placeholder="e.g. John Smith" />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
            </div>
            <div>
              <label class="label">Email *</label>
              <input v-model="form.email" type="email" required class="input" placeholder="e.g. john@example.com" />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email[0] }}</p>
            </div>
            <div>
              <label class="label">Phone</label>
              <input v-model="form.phone" class="input" placeholder="e.g. +8801711111111" />
              <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone[0] }}</p>
            </div>
            <div>
              <label class="label">Role *</label>
              <SelectBox v-model="form.role" :options="formRoleOptions" placeholder="Select role" fullWidth />
              <p v-if="errors.role" class="text-red-500 text-xs mt-1">{{ errors.role[0] }}</p>
            </div>
            <div>
              <label class="label">Status</label>
              <SelectBox v-model="form.status" :options="statusOptions" placeholder="Select status" fullWidth />
            </div>
            <div class="space-y-4">
              <div>
                <label class="label">{{ editing ? 'New Password (optional)' : 'Password *' }}</label>
                <div class="relative">
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    :required="!editing"
                    minlength="8"
                    class="input pr-10 w-full"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                    <EyeSlashIcon v-else class="w-4 h-4" />
                  </button>
                </div>
                <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password[0] }}</p>
              </div>
              <div v-if="!editing || form.password">
                <label class="label">Confirm Password {{ editing ? '' : '*' }}</label>
                <div class="relative">
                  <input
                    v-model="form.password_confirmation"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    :required="!editing || !!form.password"
                    class="input pr-10 w-full"
                    placeholder="Re-enter password"
                  />
                  <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon v-if="!showConfirmPassword" class="w-4 h-4" />
                    <EyeSlashIcon v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
                {{ saving ? 'Saving...' : editing ? 'Update Admin' : 'Create Admin' }}
              </button>
              <button type="button" @click="showForm = false" class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal
      :show="!!deleteTarget"
      title="Delete Admin"
      :message="`Delete admin '${deleteTarget?.name}'? This cannot be undone.`"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
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
import StatCard from '@ecom/ui/components/StatCard.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { adminStaffApi, roleApi } from '@/api'

const toast = useToast()
const admins = ref([])
const pagination = ref(null)
const roleStats = ref({ total: 0, super_admin: 0, admin: 0, moderator: 0 })
const loading = ref(true)
const search = ref('')
const roleFilter = ref('')
const perPage = ref(15)
const showForm = ref(false)
const saving = ref(false)
const editing = ref(null)
const errors = ref({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const openDropdownId = ref(null)

const availableRoles = ref([
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
])

const roleOptions = computed(() => [{ value: '', label: 'All Roles' }, ...availableRoles.value])
const formRoleOptions = computed(() => availableRoles.value)
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'admin',
  status: 'active',
  password: '',
  password_confirmation: '',
})

const breadcrumbItems = computed(() => [
  { label: 'Admins', icon: UserGroupIcon },
])

const columns = [
  { key: 'name', label: 'Admin' },
  { key: 'role', label: 'Role', class: 'w-32' },
  { key: 'status', label: 'Status', class: 'w-28' },
  { key: 'created_at', label: 'Joined', class: 'w-32' },
  { key: 'actions', label: 'Action', class: 'w-28 text-right' },
]

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

async function loadRoles() {
  try {
    const res = await roleApi.list({ per_page: 50 })
    const excluded = ['customer', 'vendor', 'vendor-staff']
    const list = (res.data.data || []).filter(r => !excluded.includes(r.name))
    if (list.length) {
      availableRoles.value = list.map(r => ({
        value: r.name,
        label: r.display_name || r.name,
      }))
    }
  } catch {
    // Keep fallback system role options if user lacks roles.view
  }
}

async function loadStats() {
  try {
    const res = await adminStaffApi.stats()
    if (res.data?.data) {
      roleStats.value = res.data.data
    }
  } catch {
    // non-blocking
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const res = await adminStaffApi.list({
      page,
      per_page: perPage.value,
      search: search.value || undefined,
      role: roleFilter.value || undefined,
    })
    admins.value = res.data.data || []
    pagination.value = res.data.pagination
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load admins.')
  } finally {
    loading.value = false
  }
}

function openForm(item = null) {
  editing.value = item
  errors.value = {}
  showPassword.value = false
  showConfirmPassword.value = false

  if (item) {
    Object.assign(form, {
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      role: item.role || 'admin',
      status: item.status || 'active',
      password: '',
      password_confirmation: '',
    })
  } else {
    Object.assign(form, {
      name: '',
      email: '',
      phone: '',
      role: 'admin',
      status: 'active',
      password: '',
      password_confirmation: '',
    })
  }
  showForm.value = true
}

async function doSave() {
  saving.value = true
  errors.value = {}
  try {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      role: form.role,
      status: form.status,
    }

    if (!editing.value || form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    if (editing.value) {
      await adminStaffApi.update(editing.value.uuid || editing.value.id, payload)
      toast.success('Admin updated successfully.')
    } else {
      await adminStaffApi.store(payload)
      toast.success('Admin created successfully.')
    }

    showForm.value = false
    await Promise.all([load(pagination.value?.current_page || 1), loadStats()])
  } catch (e) {
    errors.value = e.response?.data?.errors || {}
    const firstMsg = Object.values(errors.value)[0]?.[0]
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
    await adminStaffApi.destroy(deleteTarget.value.uuid || deleteTarget.value.id)
    toast.success('Admin deleted successfully.')
    deleteTarget.value = null
    await Promise.all([load(pagination.value?.current_page || 1), loadStats()])
  } catch (e) {
    toast.error(e.response?.data?.message || 'Delete failed.')
  } finally {
    deleting.value = false
  }
}

function toggleDropdown(id) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

async function updateStatus(item, status) {
  const key = item.uuid || item.id
  const idx = admins.value.findIndex(a => (a.uuid || a.id) === key)
  if (idx !== -1) admins.value[idx] = { ...admins.value[idx], status }
  openDropdownId.value = null

  try {
    await adminStaffApi.updateStatus(key, status)
    toast.success(`Status changed to ${statusOptions.find(o => o.value === status)?.label || status}`)
    loadStats()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Status update failed.')
    load(pagination.value?.current_page || 1)
  }
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

function onDocumentClick(e) {
  if (openDropdownId.value !== null && !e.target.closest('.relative')) {
    openDropdownId.value = null
  }
}

onMounted(() => {
  loadRoles()
  loadStats()
  load()
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
