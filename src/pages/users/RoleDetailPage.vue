<template>
  <div class="max-w-5xl">
    <PageHeader :title="role?.name || 'Role'" subtitle="Role details and assigned permissions">
      <button @click="$router.push('/roles')" class="btn-ghost">← Roles</button>
    </PageHeader>
    <div v-if="!role" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading role...
    </div>
    <template v-if="role">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }"><IdentificationIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Role Info</h3>
            <div class="space-y-3 text-sm">
              <p class="text-lg font-black" :style="{ color: 'var(--text-primary)' }">{{ role.name }}</p>
              <p :style="{ color: 'var(--text-secondary)' }">{{ role.description }}</p>
              <div class="flex justify-between pt-3 border-t" :style="{ borderColor: 'var(--border-light)' }">
                <span :style="{ color: 'var(--text-muted)' }">Users</span><span class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ role.users_count }}</span>
              </div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Created</span><span :style="{ color: 'var(--text-primary)' }">{{ role.created_at }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Type</span><StatusBadge :value="role.is_default ? 'Default' : 'Custom'" /></div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-3">
          <div class="card overflow-hidden">
            <div class="p-4 border-b" :style="{ borderColor: 'var(--border)' }">
              <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }"><LockOpenIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Permissions</h3>
            </div>
            <div class="p-5">
              <div v-for="(perms, group) in allPermissions" :key="group" class="mb-6 last:mb-0">
                <p class="text-xs font-semibold uppercase tracking-wide mb-3" :style="{ color: 'var(--text-muted)' }">{{ group }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div v-for="perm in perms" :key="perm.slug" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" :style="{ backgroundColor: 'var(--border-light)' }">
                    <div class="w-4 h-4 rounded flex items-center justify-center" :style="{ backgroundColor: role.permissions?.includes(perm.slug) ? 'var(--color-primary)' : 'var(--border)', color: role.permissions?.includes(perm.slug) ? '#fff' : 'var(--text-muted)' }">
                      <CheckIcon v-if="role.permissions?.includes(perm.slug)" class="w-3 h-3" />
                      <XMarkIcon v-else class="w-3 h-3" />
                    </div>
                    <span :style="{ color: 'var(--text-primary)' }">{{ perm.name }}</span>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { IdentificationIcon, LockOpenIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const role = ref(null)
const allPermissions = {
  'Products': [{slug:'products.create',name:'Create'},{slug:'products.read',name:'Read'},{slug:'products.update',name:'Update'},{slug:'products.delete',name:'Delete'}],
  'Orders': [{slug:'orders.create',name:'Create'},{slug:'orders.read',name:'Read'},{slug:'orders.update',name:'Update'},{slug:'orders.delete',name:'Delete'}],
  'Users': [{slug:'users.create',name:'Create'},{slug:'users.read',name:'Read'},{slug:'users.update',name:'Update'},{slug:'users.delete',name:'Delete'}],
  'Settings': [{slug:'settings.read',name:'Read'},{slug:'settings.update',name:'Update'}],
}
onMounted(() => {
  setTimeout(() => {
    const roles = [
      {id:1,name:'Super Admin',description:'Full system access with all permissions',users_count:3,is_default:true,created_at:'Jan 15, 2026',
        permissions:['products.create','products.read','products.update','products.delete','orders.create','orders.read','orders.update','orders.delete','users.create','users.read','users.update','users.delete','settings.read','settings.update']},
      {id:2,name:'Admin',description:'Administrative access to manage store',users_count:8,is_default:true,created_at:'Jan 15, 2026',
        permissions:['products.create','products.read','products.update','orders.read','orders.update','users.read','settings.read','settings.update']},
      {id:3,name:'Moderator',description:'Can manage products, reviews and orders',users_count:5,is_default:false,created_at:'Feb 20, 2026',
        permissions:['products.read','products.update','orders.read','orders.update','users.read']},
    ]
    role.value = roles[Number(route.params.id)-1] || roles[0]
  }, 300)
})
</script>
