<template>
  <div>
    <!-- Smart Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-sm mb-5">
      <router-link to="/admins" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
        <UsersIcon class="w-4 h-4" />
        <span>Admins</span>
      </router-link>
      <ChevronRightIcon class="w-4 h-4 text-gray-300" />
      <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold"
            :style="{ 
              color: 'var(--color-primary)', 
              backgroundColor: 'color-mix(in srgb, var(--color-primary-pale) 60%, transparent)'
            }">
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: 'var(--color-primary)' }"></span>
        {{ admin?.name || 'Loading...' }}
      </span>
    </nav>
    <div v-if="admin" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-5">
        <div class="flex flex-col items-center text-center mb-5">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black mb-3" :style="{ backgroundColor: 'var(--color-primary)' }">{{ admin.name?.charAt(0)?.toUpperCase() }}</div>
          <h2 class="font-bold text-lg" :style="{ color: 'var(--text-primary)' }">{{ admin.name }}</h2>
          <p class="text-sm" :style="{ color: 'var(--text-muted)' }">{{ admin.email }}</p>
          <span class="mt-2 badge badge-purple">{{ admin.role }}</span>
          <StatusBadge :value="admin.status" class="mt-2" />
        </div>
        <div class="space-y-2.5 text-sm border-t pt-4" :style="{ borderColor: 'var(--border)' }">
          <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Phone</span><span :style="{ color: 'var(--text-primary)' }">{{ admin.phone || '—' }}</span></div>
          <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Joined</span><span :style="{ color: 'var(--text-primary)' }">{{ formatDate(admin.created_at) }}</span></div>
          <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Last Login</span><span :style="{ color: 'var(--text-primary)' }">{{ admin.last_login || '—' }}</span></div>
        </div>
        <div class="mt-4 pt-4 border-t" :style="{ borderColor: 'var(--border)' }">
          <label class="label">Role</label>
          <select v-model="newRole" @change="updateRole" class="input text-sm">
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-6">
        <div class="card overflow-hidden">
          <div class="p-4 border-b" :style="{ borderColor: 'var(--border)' }"><h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Assigned Permissions</h3></div>
          <div class="p-4">
            <div v-for="(perms, group) in groupedPermissions" :key="group" class="mb-4 last:mb-0">
              <p class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--text-muted)' }">{{ group }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="p in perms" :key="p" class="text-xs px-2.5 py-1 rounded-full font-medium" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }">{{ p }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" :style="{ color: 'var(--text-primary)' }">Activity Log</h3>
          <div class="space-y-3">
            <div v-for="log in activityLog" :key="log.id" class="flex items-start gap-3 text-sm pb-3 border-b last:border-0" :style="{ borderColor: 'var(--border-light)' }">
              <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }">
                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: 'var(--color-primary)' }"></div>
              </div>
              <div class="flex-1">
                <p :style="{ color: 'var(--text-primary)' }">{{ log.action }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ log.time }}</p>
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
import StatusBadge from '@/components/common/StatusBadge.vue'
import { UsersIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
const route = useRoute(), toast = useToast()
const admin = ref(null), newRole = ref('')

const allPermissions = {
  'Products': ['Create Products','Edit Products','Delete Products','View Products'],
  'Orders': ['View Orders','Update Order Status','Cancel Orders','Process Refunds'],
  'Users': ['View Users','Edit Users','Delete Users','Manage Roles'],
  'Settings': ['View Settings','Edit Settings','Manage Payment Gateways','Manage Shipping'],
}

const groupedPermissions = computed(() => {
  if (!admin.value) return {}
  // Simulate assigned permissions based on role
  const rolePerms = {
    super_admin: Object.values(allPermissions).flat(),
    admin: ['View Products','Edit Products','View Orders','Update Order Status','View Users','View Settings','Edit Settings'],
    moderator: ['View Products','View Orders','Update Order Status','View Users'],
  }
  const assigned = rolePerms[admin.value.role?.toLowerCase().replace(' ','_')] || rolePerms.admin
  const groups = {}
  Object.entries(allPermissions).forEach(([group, perms]) => {
    const matched = perms.filter(p => assigned.includes(p))
    if (matched.length) groups[group] = matched
  })
  return groups
})

const activityLog = [
  {id:1,action:'Logged in to the admin panel',time:'2026-07-22 09:45 AM'},
  {id:2,action:'Approved vendor "TechGadgets"',time:'2026-07-22 09:30 AM'},
  {id:3,action:'Updated order #1024 status to "Shipped"',time:'2026-07-21 04:15 PM'},
  {id:4,action:'Changed payment gateway settings',time:'2026-07-21 02:00 PM'},
  {id:5,action:'Exported customer report',time:'2026-07-20 11:30 AM'},
]

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '' }
function updateRole() { toast.success('Role updated to ' + newRole.value); if(admin.value) admin.value.role = newRole.value }

onMounted(() => {
  setTimeout(() => {
    admin.value = {
      id: route.params.id, name: ['John Smith','Sarah Johnson','Mike Chen'][Number(route.params.id)-1] || 'Admin',
      email: ['john@example.com','sarah@example.com','mike@example.com'][Number(route.params.id)-1] || 'admin@example.com',
      phone: '+8801711111111', role: ['Super Admin','Admin','Moderator'][Number(route.params.id)-1] || 'Admin',
      status: ['active','active','active'][Number(route.params.id)-1] || 'active',
      last_login: ['2026-07-22 09:45','2026-07-21 14:30','2026-07-20 11:15'][Number(route.params.id)-1] || '—',
      created_at: new Date(Date.now()-365*86400000).toISOString(),
    }
    newRole.value = admin.value.role?.toLowerCase().replace(' ','_')
  }, 300)
})
</script>
