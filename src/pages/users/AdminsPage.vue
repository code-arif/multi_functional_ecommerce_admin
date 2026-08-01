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

    <DataTable :items="admins" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by name, email..." empty-icon="👤" empty-text="No admins found"
      @search="q => { search = q; load(1) }">
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
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" :style="{backgroundColor:'var(--color-primary)'}">
              {{ item.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.name }}</p>
              <p class="text-xs" style="color:var(--text-muted)">{{ item.email }}</p>
            </div>
          </div>
        </td>
        <td class="table-cell"><span class="badge badge-purple whitespace-nowrap">{{ item.role }}</span></td>
        <td class="table-cell">
          <div class="relative">
            <button @click="toggleDropdown(item.id)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors" :class="statusBtnClass(item.status)">
              {{ item.status }}
              <ChevronDownIcon class="w-3.5 h-3.5" />
            </button>
            <div v-if="openDropdownId === item.id" class="absolute left-0 top-full mt-1 z-50 w-36 bg-white rounded-xl border border-gray-200 shadow-lg py-1 animate-in">
              <button v-for="opt in statusOptions" :key="opt.value" @click="updateStatus(item, opt.value)"
                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                :class="item.status === opt.value ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'">
                <span class="w-2 h-2 rounded-full" :class="statusDotClass(opt.value)"></span>
                {{ opt.label }}
              </button>
            </div>
          </div>
        </td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.last_login || '—' }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="'/admins/' + item.id" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all"><EyeIcon class="w-4 h-4" /></router-link>
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

    <!-- Add / Edit Admin Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'Add' }} Admin</h2>
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
              <label class="label">Role *</label>
              <SelectBox v-model="form.role" :options="formRoleOptions" placeholder="Select role" fullWidth />
            </div>
            <div>
              <label class="label">Status</label>
              <SelectBox v-model="form.status" :options="formStatusOptions" placeholder="Select status" fullWidth />
            </div>
            <div v-if="!editing" class="space-y-4">
              <div>
                <label class="label">Password *</label>
                <div class="relative">
                  <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required class="input pr-10 w-full" placeholder="Min. 8 characters" />
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                    <EyeSlashIcon v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label class="label">Confirm Password *</label>
                <div class="relative">
                  <input v-model="form.password_confirmation" :type="showConfirmPassword ? 'text' : 'password'" required class="input pr-10 w-full" placeholder="Re-enter password" />
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
              <button type="button" @click="showForm = false"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal :show="!!deleteTarget" title="Delete Admin"
      :message="`Delete admin '${deleteTarget?.name}'? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { computed } from 'vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import StatCard from '@ecom/ui/components/StatCard.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon, UserGroupIcon, ShieldCheckIcon, UserCircleIcon, UserIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const admins = ref([]), loading = ref(true), search = ref(''), roleFilter = ref('')
const showForm = ref(false), saving = ref(false), editing = ref(null)
const showPassword = ref(false), showConfirmPassword = ref(false)
const deleteTarget = ref(null), deleting = ref(false)
const openDropdownId = ref(null)

const roleOptions = [{value:'',label:'All'},{value:'super_admin',label:'Super Admin'},{value:'admin',label:'Admin'},{value:'moderator',label:'Moderator'}]
const formRoleOptions = [{value:'super_admin',label:'Super Admin'},{value:'admin',label:'Admin'},{value:'moderator',label:'Moderator'}]
const formStatusOptions = [{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'suspend',label:'Suspend'}]
const statusOptions = [{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'suspend',label:'Suspend'}]

const form = reactive({
  name: '',
  email: '',
  role: 'admin',
  status: 'active',
  password: '',
  password_confirmation: ''
})

const breadcrumbItems = computed(() => [
  { label: 'Admins', icon: UserGroupIcon }
])

const roleStats = computed(() => {
  const counts = { super_admin: 0, admin: 0, moderator: 0, total: 0 }
  counts.total = admins.value.length
  admins.value.forEach(a => {
    const key = a.role.toLowerCase().replace(/\s+/g, '_')
    if (key in counts) counts[key]++
  })
  return counts
})

const columns = [
  {key:'name',label:'Admin'},{key:'role',label:'Role',class:'w-28'},{key:'status',label:'Status',class:'w-24'},
  {key:'last_login',label:'Last Login',class:'w-32'},{key:'actions',label:'Action',class:'w-28 text-right'}
]

function openForm(item = null) {
  editing.value = item
  if (item) {
    Object.assign(form, {
      name: item.name,
      email: item.email,
      role: item.role.toLowerCase().replace(/\s+/g, '_'),
      status: item.status,
      password: ''
    })
  } else {
    Object.assign(form, { name: '', email: '', role: 'admin', status: 'active', password: '', password_confirmation: '' })
    showPassword.value = false
    showConfirmPassword.value = false
  }
  showForm.value = true
}

async function doSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    if (editing.value) {
      const idx = admins.value.findIndex(a => a.id === editing.value.id)
      if (idx !== -1) {
        admins.value[idx] = {
          ...admins.value[idx],
          name: form.name,
          email: form.email,
          role: formRoleOptions.find(o => o.value === form.role)?.label || form.role,
          status: form.status
        }
      }
      toast.success('Admin updated.')
    } else {
      admins.value.unshift({
        id: admins.value.length + 1,
        name: form.name,
        email: form.email,
        role: formRoleOptions.find(o => o.value === form.role)?.label || form.role,
        status: form.status,
        last_login: '—'
      })
      toast.success('Admin created.')
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
    admins.value = admins.value.filter(a => a.id !== deleteTarget.value.id)
    toast.success('Admin deleted.')
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

async function load(page=1) {
  loading.value = true
  setTimeout(() => {
    admins.value = Array.from({length:5},(_,i)=>({
      id:i+1,name:['John Smith','Sarah Johnson','Mike Chen','Emily Davis','Alex Kumar'][i],
      email:['john@example.com','sarah@example.com','mike@example.com','emily@example.com','alex@example.com'][i],
      role:['Super Admin','Admin','Admin','Moderator','Moderator'][i],
      status:['active','active','active','active','inactive'][i],
      last_login:['2026-07-22 09:45','2026-07-21 14:30','2026-07-20 11:15','2026-07-19 16:00','2026-07-10 08:20'][i]
    }))
    loading.value = false
  }, 400)
}

function toggleDropdown(id) {
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function updateStatus(item, status) {
  const idx = admins.value.findIndex(a => a.id === item.id)
  if (idx !== -1) {
    admins.value[idx] = { ...admins.value[idx], status }
  }
  toast.success(`Status changed to ${statusOptions.find(o => o.value === status)?.label || status}`)
  openDropdownId.value = null
}

function statusBtnClass(status) {
  const map = {
    active: 'text-green-700 bg-green-50 hover:bg-green-100',
    inactive: 'text-gray-600 bg-gray-100 hover:bg-gray-200',
    suspend: 'text-orange-700 bg-orange-50 hover:bg-orange-100'
  }
  return map[status] || 'text-gray-600 bg-gray-100'
}

function statusDotClass(status) {
  const map = { active: 'bg-green-500', inactive: 'bg-gray-400', suspend: 'bg-orange-500' }
  return map[status] || 'bg-gray-400'
}

function onDocumentClick(e) {
  if (openDropdownId.value !== null) {
    const dropdown = e.target.closest('.relative')
    if (!dropdown) openDropdownId.value = null
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
