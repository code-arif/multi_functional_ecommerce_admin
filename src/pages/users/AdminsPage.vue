<template>
  <div>
    <DataTable :items="admins" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by name, email..." empty-icon="👤" empty-text="No admins found"
      @search="q => { search = q; load(1) }">
      <template #actions>
        <button @click="openForm()" class="btn-primary">
          <PlusIcon class="w-4 h-4" />
          Add Admin
        </button>
      </template>
      <template #filters>
        <SelectBox v-model="roleFilter" :options="roleOptions" placeholder="All Roles" size="sm" @change="load(1)" />
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
        <td class="table-cell"><span class="badge badge-purple">{{ item.role }}</span></td>
        <td class="table-cell"><StatusBadge :value="item.status" /></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.last_login || '—' }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="'/admins/' + item.id" class="p-1.5 rounded-lg transition hover:bg-gray-100" :style="{ color: 'var(--navbar-text)' }"><EyeIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <button @click="openForm(item)" class="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition"><PencilIcon class="w-4 h-4" /></button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition"><TrashIcon class="w-4 h-4" /></button>
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
            <div v-if="!editing">
              <label class="label">Password *</label>
              <input v-model="form.password" type="password" required class="input" placeholder="Min. 8 characters" />
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
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const admins = ref([]), loading = ref(true), search = ref(''), roleFilter = ref('')
const showForm = ref(false), saving = ref(false), editing = ref(null)
const deleteTarget = ref(null), deleting = ref(false)

const roleOptions = [{value:'',label:'All'},{value:'super_admin',label:'Super Admin'},{value:'admin',label:'Admin'},{value:'moderator',label:'Moderator'}]
const formRoleOptions = [{value:'super_admin',label:'Super Admin'},{value:'admin',label:'Admin'},{value:'moderator',label:'Moderator'}]
const formStatusOptions = [{value:'active',label:'Active'},{value:'inactive',label:'Inactive'}]

const form = reactive({
  name: '',
  email: '',
  role: 'admin',
  status: 'active',
  password: ''
})

const columns = [
  {key:'name',label:'Admin'},{key:'role',label:'Role',class:'w-28'},{key:'status',label:'Status',class:'w-24'},
  {key:'last_login',label:'Last Login',class:'w-32'},{key:'actions',label:'',class:'w-28 text-right'}
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
    Object.assign(form, { name: '', email: '', role: 'admin', status: 'active', password: '' })
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

onMounted(()=>load())
</script>
