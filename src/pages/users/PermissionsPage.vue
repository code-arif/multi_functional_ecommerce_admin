<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <DataTable :items="permissions" :columns="columns" :loading="loading" searchable
      search-placeholder="Search permissions..." empty-icon="🔑" empty-text="No permissions found"
      @search="q => { search = q; load(1) }">
      <template #actions>
        <button @click="openForm()" class="btn-primary">
          Add Permission
        </button>
      </template>
      <template #filters>
        <SelectBox v-model="groupFilter" :options="groupOptions" placeholder="All Groups" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.name }}</td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.slug }}</td>
        <td class="table-cell"><span class="badge badge-purple">{{ item.group }}</span></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.description }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
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

    <!-- Form Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'Add' }} Permission</h2>
          <form @submit.prevent="doSave" class="space-y-4">
            <div>
              <label class="label">Permission Name *</label>
              <input v-model="form.name" required class="input" placeholder="e.g. Create Products" />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
            </div>

            <div>
              <label class="label">Slug *</label>
              <div class="relative">
                <input v-model="form.slug" required class="input pr-8" placeholder="e.g. products.create" @focus="slugAutoGen = false" />
                <button v-if="form.name && !editing" @click="slugAutoGen = true; form.slug = generateSlug(form.name)" type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-green-600 transition"
                  title="Auto-generate from name">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1">Auto-generated from name. You can edit it manually.</p>
              <p v-if="slugWarning" class="text-amber-600 text-xs mt-1 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                Slug "{{ form.slug }}" already exists
              </p>
              <p v-if="errors.slug" class="text-red-500 text-xs mt-1">{{ errors.slug[0] }}</p>
            </div>

            <div>
              <label class="label">Group {{ !showCustomGroup ? '*' : '' }}</label>
              <SelectBox v-model="selectedGroup" :options="formGroupSelectOptions" placeholder="Select a group" fullWidth @change="onGroupChange" />
              <transition name="fade-slide">
                <div v-if="showCustomGroup" class="mt-2">
                  <input v-model="customGroupInput" class="input" placeholder="Type custom group name..." />
                </div>
              </transition>
            </div>

            <div>
              <label class="label">Description</label>
              <textarea v-model="form.description" rows="2" class="input" placeholder="What can this permission do?" />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">{{
                saving ? 'Saving...' : editing ? 'Update Permission' : 'Create Permission'
              }}</button>
              <button type="button" @click="showForm = false"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal :show="!!deleteTarget" title="Delete Permission" :message="`Delete permission '${deleteTarget?.name}'?`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />

    <ConfirmModal :show="confirmDuplicate"
      title="Duplicate Slug"
      :message="`A permission with slug '${form.slug}' already exists. Do you want to create it anyway?`"
      confirm-text="Save Anyway"
      type="warning"
      @confirm="confirmDuplicate = false; performSave()"
      @cancel="cancelDuplicateConfirm" />
  </div>
</template>
<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Pagination from '@/components/common/Pagination.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { PencilIcon, TrashIcon, LockOpenIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [
  { label: 'Permissions', icon: LockOpenIcon }
])

const permissions = ref([]), loading = ref(true), search = ref(''), groupFilter = ref('')
const showForm = ref(false), saving = ref(false), editing = ref(null), deleteTarget = ref(null), deleting = ref(false)
const confirmDuplicate = ref(false)
const form = reactive({ name: '', slug: '', group: '', description: '' })
const selectedGroup = ref('')
const showCustomGroup = ref(false)
const customGroupInput = ref('')
const formGroupSelectOptions = [
  { value: 'Products', label: 'Products' },
  { value: 'Orders', label: 'Orders' },
  { value: 'Users', label: 'Users' },
  { value: 'Settings', label: 'Settings' },
  { value: '__custom__', label: 'Custom…' },
]
const errors = ref({})
const groupOptions = [{value:'',label:'All'},{value:'Products',label:'Products'},{value:'Orders',label:'Orders'},{value:'Users',label:'Users'},{value:'Settings',label:'Settings'}]
const columns = [
  {key:'name',label:'Permission'},{key:'slug',label:'Slug',class:'w-40'},{key:'group',label:'Group',class:'w-24'},
  {key:'description',label:'Description'},{key:'actions',label:'Action',class:'w-24 text-right'}
]

const perPage = ref(10)

const pagination = ref({
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
})

const toast = useToast()

function generateSlug(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name.toLowerCase().replace(/\s+/g, '.')
  const action = parts[0].toLowerCase()
  const group = parts.slice(1).join(' ').toLowerCase().replace(/\s+/g, '-')
  return `${group}.${action}`
}

let slugAutoGen = true

watch(() => form.name, (val) => {
  if (slugAutoGen && val && !editing.value) {
    form.slug = generateSlug(val)
  }
})

const slugWarning = ref('')

watch(() => form.slug, (val) => {
  if (!val || !permissions.value.length) { slugWarning.value = ''; return }
  const duplicate = permissions.value.find(
    p => p.slug === val && (!editing.value || p.id !== editing.value.id)
  )
  slugWarning.value = duplicate ? `Slug "${val}" already exists in ${duplicate.group}` : ''
})

function onGroupChange(val) {
  if (val === '__custom__') {
    showCustomGroup.value = true
    form.group = customGroupInput.value || ''
  } else {
    showCustomGroup.value = false
    form.group = val
  }
}

function openForm(item = null) {
  editing.value = item
  showCustomGroup.value = false
  if (item) {
    Object.assign(form, {
      name: item.name,
      slug: item.slug,
      group: item.group,
      description: item.description || ''
    })
    const isCustom = !['Products', 'Orders', 'Users', 'Settings'].includes(item.group)
    if (isCustom) {
      showCustomGroup.value = true
      selectedGroup.value = '__custom__'
      customGroupInput.value = item.group
    } else {
      selectedGroup.value = item.group
    }
    slugAutoGen = false
  } else {
    Object.assign(form, { name: '', slug: '', group: '', description: '' })
    selectedGroup.value = ''
    customGroupInput.value = ''
    slugAutoGen = true
  }
  errors.value = {}
  slugWarning.value = ''
  confirmDuplicate.value = false
  showForm.value = true
}

function doSave() {
  const duplicate = permissions.value.find(
    p => p.slug === form.slug && (!editing.value || p.id !== editing.value.id)
  )
  if (duplicate && !confirmDuplicate.value) {
    confirmDuplicate.value = true
    return
  }
  performSave()
}

async function performSave() {
  // Sync custom group value before save
  if (showCustomGroup.value) {
    form.group = customGroupInput.value || ''
  }

  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 400))

    if (editing.value) {
      const idx = permissions.value.findIndex(p => p.id === editing.value.id)
      if (idx !== -1) {
        permissions.value[idx] = { ...permissions.value[idx], ...form }
      }
      toast.success('Permission updated.')
    } else {
      const newPerm = {
        id: permissions.value.length + 1,
        ...form
      }
      permissions.value.unshift(newPerm)
      pagination.value.total = permissions.value.length
      pagination.value.last_page = Math.ceil(permissions.value.length / perPage.value)
      toast.success('Permission created.')
    }

    showForm.value = false
    confirmDuplicate.value = false
  } catch (e) {
    errors.value = e.response?.data?.errors || {}
    toast.error(e.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

function cancelDuplicateConfirm() {
  confirmDuplicate.value = false
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    permissions.value = permissions.value.filter(p => p.id !== deleteTarget.value.id)
    pagination.value.total = permissions.value.length
    pagination.value.last_page = Math.ceil(permissions.value.length / perPage.value)
    toast.success('Permission deleted.')
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

async function load(page = 1) {
  loading.value = true
  pagination.value.current_page = page
  setTimeout(() => {
    const groups = ['Products','Orders','Users','Settings']
    const actions = ['create','read','update','delete']
    const all = groups.flatMap((g,i) => actions.map((a,j)=>({
      id:i*4+j+1,name:`${g} ${a.charAt(0).toUpperCase()+a.slice(1)}`,slug:`${g.toLowerCase()}.${a}`,
      group:g,description:`Can ${a} ${g.toLowerCase()}`
    })))
    permissions.value = all
    pagination.value.per_page = perPage.value
    pagination.value.total = all.length
    pagination.value.last_page = Math.ceil(all.length / perPage.value)
    loading.value = false
  }, 300)
}
onMounted(()=>load())
</script>

<style scoped>
.fade-slide-enter-active {
  transition: all 0.15s ease-out;
}
.fade-slide-leave-active {
  transition: all 0.1s ease-in;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
