<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <div v-if="!role" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading role...
    </div>
    <template v-if="role">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">
              <IdentificationIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Role Info
            </h3>
            <div class="space-y-3 text-sm">
              <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">{{ role.display_name || role.name }}</p>
              <p :style="{ color: 'var(--text-secondary)' }">{{ role.description || 'No description provided.' }}</p>
              <div class="flex justify-between pt-3 border-t" :style="{ borderColor: 'var(--border-light)' }">
                <span :style="{ color: 'var(--text-muted)' }">Slug</span>
                <span class="font-mono text-xs" :style="{ color: 'var(--text-primary)' }">{{ role.name }}</span>
              </div>
              <div class="flex justify-between">
                <span :style="{ color: 'var(--text-muted)' }">Users</span>
                <span class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ role.users_count ?? 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span :style="{ color: 'var(--text-muted)' }">Guard</span>
                <span class="badge" :class="role.guard_name === 'web' ? 'badge-green' : 'badge-gray'">{{ role.guard_name }}</span>
              </div>
              <div class="flex justify-between">
                <span :style="{ color: 'var(--text-muted)' }">Created</span>
                <span :style="{ color: 'var(--text-primary)' }">{{ formatDate(role.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-3">
          <div class="card overflow-hidden">
            <div class="p-4 border-b flex items-center justify-between" :style="{ borderColor: 'var(--border)' }">
              <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
                <LockOpenIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Permissions
              </h3>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }">
                {{ role.permissions_list?.length ?? 0 }} assigned
              </span>
            </div>
            <div class="p-5">
              <div v-for="group in permissionGroups" :key="group.group" class="mb-6 last:mb-0">
                <p class="text-xs font-semibold uppercase tracking-wide mb-3" :style="{ color: 'var(--text-muted)' }">{{ group.group }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div v-for="perm in group.permissions" :key="perm.name" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                    :style="{ backgroundColor: 'var(--border-light)' }">
                    <div class="w-4 h-4 rounded flex items-center justify-center shrink-0"
                      :style="{
                        backgroundColor: assignedNames.includes(perm.name) ? 'var(--color-primary)' : 'var(--border)',
                        color: assignedNames.includes(perm.name) ? '#fff' : 'var(--text-muted)'
                      }">
                      <CheckIcon v-if="assignedNames.includes(perm.name)" class="w-3 h-3" />
                      <XMarkIcon v-else class="w-3 h-3" />
                    </div>
                    <span :style="{ color: 'var(--text-primary)' }">{{ perm.display_name || perm.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { IdentificationIcon, LockOpenIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { roleApi } from '@/api/role'
import { permissionApi } from '@/api/permission'

const route = useRoute()
const toast = useToast()

const role = ref(null)
const permissionGroups = ref([])
const assignedNames = computed(() => role.value?.permissions_list || [])

const breadcrumbItems = computed(() => [
  { label: 'Roles', to: '/roles', icon: IdentificationIcon },
  { label: role.value?.display_name || role.value?.name || 'Loading...' },
])

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  try {
    const [roleRes, groupedRes] = await Promise.all([
      roleApi.show(route.params.id),
      permissionApi.grouped(),
    ])
    role.value = roleRes.data.data
    permissionGroups.value = groupedRes.data.data || []
  } catch (e) {
    console.error('Failed to load role detail:', e)
    toast.error(e.response?.data?.message || 'Failed to load role.')
  }
})
</script>
