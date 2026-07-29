<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="card overflow-hidden">
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
            </div>
            <div>
              <label class="label">Type</label>
              <div class="flex items-center gap-2 h-10 px-3 rounded-lg text-sm" :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-muted)' }">
                {{ isEditing ? (role?.is_default ? 'Default' : 'Custom') : 'Custom' }}
              </div>
            </div>
          </div>

          <div>
            <label class="label">Description *</label>
            <textarea v-model="form.description" required rows="2" class="input" placeholder="Describe what this role can do..." />
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

            <div v-for="(perms, group) in allPermissions" :key="group" class="mb-5 last:mb-0">
              <div class="flex items-center gap-2 mb-2">
                <p class="text-xs font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">{{ group }}</p>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }">
                  {{ selectedCount(group) }}/{{ perms.length }}
                </span>
                <button type="button" @click="toggleGroup(group)"
                  class="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all"
                  :style="{ color: groupAllSelected(group) ? 'var(--color-primary)' : 'var(--text-muted)', backgroundColor: groupAllSelected(group) ? 'color-mix(in srgb, var(--color-primary-pale) 60%, transparent)' : 'transparent' }">
                  {{ groupAllSelected(group) ? 'Deselect' : 'Select All' }}
                </button>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label v-for="perm in perms" :key="perm.slug"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all border"
                  :class="selectedPermissions.includes(perm.slug) ? 'border-green-200' : 'border-transparent'"
                  :style="{
                    backgroundColor: selectedPermissions.includes(perm.slug) ? 'color-mix(in srgb, var(--color-primary-pale) 50%, transparent)' : 'var(--border-light)',
                    borderColor: selectedPermissions.includes(perm.slug) ? 'var(--color-primary-light)' : 'transparent'
                  }">
                  <input type="checkbox" :value="perm.slug" v-model="selectedPermissions"
                    class="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    :style="{ accentColor: 'var(--color-primary)' }" />
                  <span :style="{ color: 'var(--text-primary)' }">{{ perm.name }}</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { IdentificationIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const role = ref(null)
const saving = ref(false)

const form = reactive({
  name: '',
  description: ''
})

const allPermissions = {
  'Products': [
    { slug: 'products.create', name: 'Create' },
    { slug: 'products.read', name: 'Read' },
    { slug: 'products.update', name: 'Update' },
    { slug: 'products.delete', name: 'Delete' }
  ],
  'Orders': [
    { slug: 'orders.create', name: 'Create' },
    { slug: 'orders.read', name: 'Read' },
    { slug: 'orders.update', name: 'Update' },
    { slug: 'orders.delete', name: 'Delete' }
  ],
  'Users': [
    { slug: 'users.create', name: 'Create' },
    { slug: 'users.read', name: 'Read' },
    { slug: 'users.update', name: 'Update' },
    { slug: 'users.delete', name: 'Delete' }
  ],
  'Settings': [
    { slug: 'settings.read', name: 'Read' },
    { slug: 'settings.update', name: 'Update' }
  ]
}

const allSlugs = computed(() => Object.values(allPermissions).flat().map(p => p.slug))

const selectedPermissions = ref([])

const allSelected = computed(() =>
  selectedPermissions.value.length === allSlugs.value.length
)

function toggleSelectAll() {
  if (allSelected.value) {
    selectedPermissions.value = []
  } else {
    selectedPermissions.value = [...allSlugs.value]
  }
}

function selectedCount(group) {
  return allPermissions[group].filter(p => selectedPermissions.value.includes(p.slug)).length
}

function groupAllSelected(group) {
  return allPermissions[group].every(p => selectedPermissions.value.includes(p.slug))
}

function toggleGroup(group) {
  const groupSlugs = allPermissions[group].map(p => p.slug)
  if (groupAllSelected(group)) {
    selectedPermissions.value = selectedPermissions.value.filter(s => !groupSlugs.includes(s))
  } else {
    const existing = new Set(selectedPermissions.value)
    groupSlugs.forEach(s => existing.add(s))
    selectedPermissions.value = [...existing]
  }
}

const breadcrumbItems = computed(() => [
  { label: 'Roles', to: '/roles', icon: IdentificationIcon },
  { label: isEditing.value ? role.value?.name || 'Edit Role' : 'Create Role' }
])

async function doSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    const permCount = selectedPermissions.value.length
    toast.success(isEditing.value ? 'Role updated.' : `Role created with ${permCount} permissions.`)
    router.push('/roles')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isEditing.value) {
    setTimeout(() => {
      const roles = [
        {
          id: 1, name: 'Super Admin', description: 'Full system access with all permissions', is_default: true,
          permissions: ['products.create', 'products.read', 'products.update', 'products.delete', 'orders.create', 'orders.read', 'orders.update', 'orders.delete', 'users.create', 'users.read', 'users.update', 'users.delete', 'settings.read', 'settings.update']
        },
        {
          id: 2, name: 'Admin', description: 'Administrative access to manage store', is_default: true,
          permissions: ['products.create', 'products.read', 'products.update', 'orders.read', 'orders.update', 'users.read', 'settings.read', 'settings.update']
        },
        {
          id: 3, name: 'Moderator', description: 'Can manage products, reviews and orders', is_default: false,
          permissions: ['products.read', 'products.update', 'orders.read', 'orders.update', 'users.read']
        },
      ]
      const found = roles[Number(route.params.id) - 1] || roles[0]
      role.value = found
      form.name = found.name
      form.description = found.description
      selectedPermissions.value = [...found.permissions]
    }, 300)
  }
})
</script>
