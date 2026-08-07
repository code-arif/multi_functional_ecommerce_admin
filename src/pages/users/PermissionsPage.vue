<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
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
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.display_name || item.name }}</td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.name }}</td>
        <td class="table-cell"><span class="badge badge-purple">{{ item.group }}</span></td>
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
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import Pagination from '@ecom/ui/components/Pagination.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { PencilIcon, TrashIcon, LockOpenIcon } from '@heroicons/vue/24/outline'
import { permissionApi } from '@/api/permission'

const breadcrumbItems = computed(() => [
  { label: 'Permissions', icon: LockOpenIcon }
])

const permissions = ref([]), loading = ref(true), search = ref(''), groupFilter = ref('')
const showForm = ref(false), saving = ref(false), editing = ref(null), deleteTarget = ref(null), deleting = ref(false)
const confirmDuplicate = ref(false)
const form = reactive({ name: '', slug: '', group: '' })
const selectedGroup = ref('')
const showCustomGroup = ref(false)
const customGroupInput = ref('')
const formGroupSelectOptions = ref([])
const errors = ref({})
const groupOptions = ref([{ value: '', label: 'All Groups' }])
const columns = [
  {key:'name',label:'Permission'},{key:'slug',label:'Slug',class:'w-40'},{key:'group',label:'Group',class:'w-24'},
  {key:'actions',label:'Action',class:'w-24 text-right'}
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
    p => p.name === val && (!editing.value || p.id !== editing.value.id)
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
      name: item.display_name || item.name,
      slug: item.name,
      group: item.group || ''
    })
    const isCustom = !formGroupSelectOptions.value.some(opt => opt.value === item.group && opt.value !== '__custom__')
    if (isCustom && item.group) {
      showCustomGroup.value = true
      selectedGroup.value = '__custom__'
      customGroupInput.value = item.group
    } else {
      selectedGroup.value = item.group || ''
    }
    slugAutoGen = false
  } else {
    Object.assign(form, { name: '', slug: '', group: '' })
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
    p => p.name === form.slug && (!editing.value || p.id !== editing.value.id)
  )
  if (duplicate && !confirmDuplicate.value) {
    confirmDuplicate.value = true
    return
  }
  performSave()
}

async function performSave() {
  if (showCustomGroup.value) {
    form.group = customGroupInput.value || ''
  }

  saving.value = true
  try {
    const payload = {
      name: form.slug,
      display_name: form.name,
      group: form.group,
      guard_name: 'api'
    }

    if (editing.value) {
      await permissionApi.update(editing.value.id, payload)
      toast.success('Permission updated successfully.')
    } else {
      await permissionApi.store(payload)
      toast.success('Permission created successfully.')
    }

    showForm.value = false
    confirmDuplicate.value = false
    await fetchGroups()
    await load(pagination.value.current_page)
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
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await permissionApi.destroy(deleteTarget.value.id)
    toast.success('Permission deleted successfully.')
    deleteTarget.value = null
    await fetchGroups()
    await load(1)
  } catch (e) {
    const msg = e.response?.data?.message || 'Delete failed.'
    toast.error(msg)
  } finally {
    deleting.value = false
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const res = await permissionApi.list({
      page,
      per_page: perPage.value,
      search: search.value,
      group: groupFilter.value
    })
    permissions.value = res.data.data || []
    pagination.value = res.data.pagination || {
      total: 0,
      per_page: perPage.value,
      current_page: page,
      last_page: 1
    }
  } catch (e) {
    console.error('Failed to load permissions:', e)
    toast.error('Failed to load permissions.')
  } finally {
    loading.value = false
  }
}

async function fetchGroups() {
  try {
    const res = await permissionApi.groups()
    const groups = res.data.data || []
    groupOptions.value = [
      { value: '', label: 'All Groups' },
      ...groups.map(g => ({ value: g, label: g }))
    ]
    formGroupSelectOptions.value = [
      ...groups.map(g => ({ value: g, label: g })),
      { value: '__custom__', label: 'Custom…' }
    ]
  } catch (e) {
    console.error('Failed to fetch groups:', e)
  }
}

onMounted(async () => {
  await fetchGroups()
  await load()
})
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
