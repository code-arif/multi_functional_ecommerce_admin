<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />

    <div v-if="loading" class="card p-10 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
      Loading admin profile...
    </div>

    <div v-else-if="admin" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-5">
        <div class="flex flex-col items-center text-center mb-5">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black mb-3" :style="{ backgroundColor: 'var(--color-primary)' }">
            {{ admin.name?.charAt(0)?.toUpperCase() }}
          </div>
          <h2 class="font-bold text-lg" :style="{ color: 'var(--text-primary)' }">{{ admin.name }}</h2>
          <p class="text-sm" :style="{ color: 'var(--text-muted)' }">{{ admin.email }}</p>
          <div class="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 mt-2">
            <span class="badge badge-purple">{{ admin.role_display_name || admin.role }}</span>
            <StatusBadge :value="admin.status" />
          </div>
        </div>

        <div class="space-y-2.5 text-sm border-t pt-4" :style="{ borderColor: 'var(--border)' }">
          <div class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Phone</span>
            <span :style="{ color: 'var(--text-primary)' }">{{ admin.phone || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Joined</span>
            <span :style="{ color: 'var(--text-primary)' }">{{ formatDate(admin.created_at) }}</span>
          </div>
          <div class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Permissions</span>
            <span class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ admin.permissions?.length || 0 }}</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t space-y-3" :style="{ borderColor: 'var(--border)' }">
          <div>
            <label class="label">Role</label>
            <SelectBox v-model="newRole" :options="roleOptions" placeholder="Select role" fullWidth @change="updateRole" />
          </div>
          <div>
            <label class="label">Status</label>
            <SelectBox v-model="newStatus" :options="statusOptions" placeholder="Select status" fullWidth @change="updateStatus" />
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <div class="card overflow-hidden">
          <div class="p-4 border-b flex items-center justify-between" :style="{ borderColor: 'var(--border)' }">
            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Assigned Permissions</h3>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }">
              {{ admin.permissions?.length || 0 }} active
            </span>
          </div>
          <div class="p-4">
            <div v-if="!Object.keys(groupedPermissions).length" class="text-sm text-center py-4" :style="{ color: 'var(--text-muted)' }">
              No permissions assigned to this account.
            </div>
            <div v-for="(perms, group) in groupedPermissions" :key="group" class="mb-4 last:mb-0">
              <p class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">{{ group }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="p in perms"
                  :key="p.name"
                  class="text-xs px-2.5 py-1 rounded-full font-medium"
                  :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }"
                >
                  {{ p.display_name || p.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" :style="{ color: 'var(--text-primary)' }">Activity Log</h3>
          <div v-if="!admin.activity_logs?.length" class="text-sm py-4 text-center" :style="{ color: 'var(--text-muted)' }">
            No recent activity recorded for this admin.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="log in admin.activity_logs"
              :key="log.id"
              class="flex items-start gap-3 text-sm pb-3 border-b last:border-0"
              :style="{ borderColor: 'var(--border-light)' }"
            >
              <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }">
                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: 'var(--color-primary)' }"></div>
              </div>
              <div class="flex-1">
                <p :style="{ color: 'var(--text-primary)' }">{{ log.module ? `[${log.module}] ` : '' }}{{ log.action }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDateTime(log.created_at) }}{{ log.ip ? ` · ${log.ip}` : '' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { UsersIcon } from '@heroicons/vue/24/outline'
import { adminStaffApi, permissionApi, roleApi } from '@/api'

const route = useRoute()
const toast = useToast()

const admin = ref(null)
const loading = ref(true)
const newRole = ref('')
const newStatus = ref('')
const permissionGroups = ref([])

const roleOptions = ref([
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
])

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
]

const breadcrumbItems = computed(() => [
  { label: 'Admins', to: '/admins', icon: UsersIcon },
  { label: admin.value?.name || 'Loading...' },
])

const groupedPermissions = computed(() => {
  const assigned = new Set(admin.value?.permissions || [])
  if (!assigned.size) return {}

  const groups = {}
  if (permissionGroups.value.length) {
    for (const group of permissionGroups.value) {
      const matched = (group.permissions || []).filter(p => assigned.has(p.name))
      if (matched.length) {
        groups[group.group] = matched
      }
    }
    return groups
  }

  for (const name of assigned) {
    const groupKey = name.includes('.') ? name.split('.')[0] : 'General'
    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push({ name, display_name: name })
  }
  return groups
})

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
}

function formatDateTime(d) {
  return d ? new Date(d).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
}

async function loadData() {
  loading.value = true
  try {
    const [adminRes, groupedRes, rolesRes] = await Promise.all([
      adminStaffApi.show(route.params.id),
      permissionApi.grouped().catch(() => null),
      roleApi.list({ per_page: 50 }).catch(() => null),
    ])

    admin.value = adminRes.data.data
    newRole.value = admin.value?.role || ''
    newStatus.value = admin.value?.status || 'active'

    if (groupedRes?.data?.data) {
      permissionGroups.value = groupedRes.data.data
    }

    if (rolesRes?.data?.data) {
      const excluded = ['customer', 'vendor', 'vendor-staff']
      const list = rolesRes.data.data.filter(r => !excluded.includes(r.name))
      if (list.length) {
        roleOptions.value = list.map(r => ({ value: r.name, label: r.display_name || r.name }))
      }
    }
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load admin profile.')
  } finally {
    loading.value = false
  }
}

async function updateRole() {
  if (!admin.value || !newRole.value) return
  try {
    await adminStaffApi.assignRoles({
      user_uuid: admin.value.uuid,
      roles: [newRole.value],
    })
    toast.success('Role updated.')
    await loadData()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update role.')
    newRole.value = admin.value.role
  }
}

async function updateStatus() {
  if (!admin.value || !newStatus.value) return
  try {
    const res = await adminStaffApi.updateStatus(admin.value.uuid || admin.value.id, newStatus.value)
    admin.value = { ...admin.value, ...res.data.data }
    toast.success(`Status updated to ${newStatus.value}.`)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update status.')
    newStatus.value = admin.value.status
  }
}

onMounted(loadData)
</script>
