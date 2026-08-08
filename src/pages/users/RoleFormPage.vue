<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />

    <div v-if="loading" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading role data...
    </div>

    <div v-else class="card overflow-hidden">
      <div class="p-5 border-b" :style="{ borderColor: 'var(--border)' }">
        <h2 class="font-bold text-lg" :style="{ color: 'var(--text-primary)' }">{{ isEditing ? 'Edit Role' : 'Create New Role' }}</h2>
        <p class="text-sm mt-1" :style="{ color: 'var(--text-muted)' }">{{ isEditing ? 'Update role details and permissions' : 'Define a new role and assign permissions' }}</p>
      </div>

      <form @submit.prevent="doSave" class="p-5 space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Role Name *</label>
            <input v-model="form.name" required class="input" placeholder="e.g. Moderator" />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
          </div>
          <div>
            <label class="label">Slug *</label>
            <div class="relative">
              <input v-model="form.slug" required class="input pr-8" placeholder="e.g. moderator"
                @focus="slugAutoGen = false" />
              <button v-if="form.name && !isEditing" @click="slugAutoGen = true; form.slug = generateSlug(form.name)"
                type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-green-600 transition"
                title="Auto-generate from name">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">Used as the unique key. Auto-generated from the name.</p>
            <p v-if="errors.slug" class="text-red-500 text-xs mt-1">{{ errors.slug[0] }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Guard</label>
            <SelectBox v-model="form.guard_name" :options="guardOptions" fullWidth />
          </div>
          <div>
            <label class="label">Description</label>
            <textarea v-model="form.description" rows="1" class="input" placeholder="Describe what this role can do..." />
          </div>
        </div>

        <!-- Permissions -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <label class="label !mb-0">Permissions</label>
            <button type="button" @click="toggleSelectAll" class="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
              :style="{ color: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary-pale) 60%, transparent)' }">
              {{ allSelected ? 'Deselect All' : 'Select All' }}
            </button>
          </div>

          <div v-if="!permissionGroups.length" class="text-sm" :style="{ color: 'var(--text-muted)' }">
            No permissions available.
          </div>

          <div v-for="group in permissionGroups" :key="group.group" class="mb-5 last:mb-0">
            <div class="flex items-center gap-2 mb-2">
              <p class="text-xs font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">{{ group.group }}</p>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }">
                {{ selectedCount(group) }}/{{ group.permissions.length }}
              </span>
              <button type="button" @click="toggleGroup(group)"
                class="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all"
                :style="{
                  color: groupAllSelected(group) ? 'var(--color-primary)' : 'var(--text-muted)',
                  backgroundColor: groupAllSelected(group) ? 'color-mix(in srgb, var(--color-primary-pale) 60%, transparent)' : 'transparent'
                }">
                {{ groupAllSelected(group) ? 'Deselect' : 'Select All' }}
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label v-for="perm in group.permissions" :key="perm.name"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all border"
                :style="{
                  backgroundColor: selectedPermissions.includes(perm.name) ? 'color-mix(in srgb, var(--color-primary-pale) 50%, transparent)' : 'var(--border-light)',
                  borderColor: selectedPermissions.includes(perm.name) ? 'var(--color-primary-light)' : 'transparent'
                }">
                <input type="checkbox" :value="perm.name" v-model="selectedPermissions"
                  class="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  :style="{ accentColor: 'var(--color-primary)' }" />
                <span :style="{ color: 'var(--text-primary)' }">{{ perm.display_name || perm.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2 border-t" :style="{ borderColor: 'var(--border)' }">
          <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center sm:flex-none">
            {{ saving ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role' }}
          </button>
          <button type="button" @click="$router.push('/roles')"
            class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { IdentificationIcon } from '@heroicons/vue/24/outline'
import { roleApi } from '@/api/role'
import { permissionApi } from '@/api/permission'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)

const loading = ref(true)
const saving = ref(false)
const errors = ref({})

const form = reactive({
  name: '',
  slug: '',
  description: '',
  guard_name: 'web',
})

const permissionGroups = ref([])
const selectedPermissions = ref([])

let slugAutoGen = true

const guardOptions = [
  { value: 'web', label: 'Web' },
  { value: 'api', label: 'API' },
]

const allSlugs = computed(() => permissionGroups.value.flatMap(g => g.permissions.map(p => p.name)))

const allSelected = computed(() =>
  selectedPermissions.value.length === allSlugs.value.length && allSlugs.value.length > 0
)

const breadcrumbItems = computed(() => [
  { label: 'Roles', to: '/roles', icon: IdentificationIcon },
  { label: isEditing.value ? form.name || 'Edit Role' : 'Create Role' },
])

function generateSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(() => form.name, (val) => {
  if (slugAutoGen && val && !isEditing.value) {
    form.slug = generateSlug(val)
  }
})

function toggleSelectAll() {
  selectedPermissions.value = allSelected.value ? [] : [...allSlugs.value]
}

function selectedCount(group) {
  return group.permissions.filter(p => selectedPermissions.value.includes(p.name)).length
}

function groupAllSelected(group) {
  return group.permissions.every(p => selectedPermissions.value.includes(p.name))
}

function toggleGroup(group) {
  const groupSlugs = group.permissions.map(p => p.name)
  if (groupAllSelected(group)) {
    selectedPermissions.value = selectedPermissions.value.filter(s => !groupSlugs.includes(s))
  } else {
    const existing = new Set(selectedPermissions.value)
    groupSlugs.forEach(s => existing.add(s))
    selectedPermissions.value = [...existing]
  }
}

async function doSave() {
  saving.value = true
  errors.value = {}
  const payload = {
    name: form.slug,
    display_name: form.name,
    description: form.description,
    guard_name: form.guard_name,
    permissions: selectedPermissions.value,
  }
  try {
    if (isEditing.value) {
      await roleApi.update(route.params.id, payload)
      toast.success('Role updated successfully.')
    } else {
      await roleApi.store(payload)
      toast.success('Role created successfully.')
    }
    router.push('/roles')
  } catch (e) {
    errors.value = e.response?.data?.errors || {}
    toast.error(e.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    // Load grouped permissions for the checkbox matrix
    const [groupedRes, roleRes] = await Promise.all([
      permissionApi.grouped(),
      isEditing.value ? roleApi.show(route.params.id) : Promise.resolve(null),
    ])

    permissionGroups.value = groupedRes.data.data || []

    if (isEditing.value && roleRes?.data?.data) {
      const role = roleRes.data.data
      form.name = role.display_name || role.name
      form.slug = role.name
      form.description = role.description || ''
      form.guard_name = role.guard_name || 'web'
      selectedPermissions.value = [...(role.permissions_list || [])]
      slugAutoGen = false
    }
  } catch (e) {
    console.error('Failed to load role form data:', e)
    toast.error('Failed to load role data.')
  } finally {
    loading.value = false
  }
})
</script>
