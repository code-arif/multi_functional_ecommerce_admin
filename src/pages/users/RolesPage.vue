<template>
  <div>
    <PageHeader title="Roles" subtitle="User role and permission management">
      <button class="btn-primary"><PlusIcon class="w-4 h-4" />Add Role</button>
    </PageHeader>
    <DataTable :items="roles" :columns="columns" :loading="loading" empty-icon="🔐" empty-text="No roles defined">
      <template #default="{ item }">
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.name }}</td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.description }}</td>
        <td class="table-cell"><span class="badge badge-blue">{{ item.users_count }} users</span></td>
        <td class="table-cell"><span class="badge" :class="item.is_default ? 'badge-green' : 'badge-gray'">{{ item.is_default ? 'Default' : 'Custom' }}</span></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.created_at }}</td>
        <td class="table-cell text-right">
          <Tooltip text="View">
            <router-link :to="'/roles/' + item.id" class="p-1.5 rounded-lg inline-flex items-center transition mr-1 hover:bg-gray-100" :style="{ color: 'var(--navbar-text)' }"><EyeIcon class="w-4 h-4" /></router-link>
          </Tooltip>
          <Tooltip text="Edit">
            <button class="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition mr-1"><PencilIcon class="w-4 h-4" /></button>
          </Tooltip>
          <Tooltip text="Delete">
            <button class="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition"><TrashIcon class="w-4 h-4" /></button>
          </Tooltip>
        </td>
      </template>
    </DataTable>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/outline'
const roles = ref([]), loading = ref(true)
const columns = [
  {key:'name',label:'Role Name'},{key:'description',label:'Description'},{key:'users',label:'Users',class:'w-24'},
  {key:'type',label:'Type',class:'w-20'},{key:'created',label:'Created',class:'w-28'},{key:'actions',label:'',class:'w-24 text-right'}
]
async function load() {
  loading.value = true
  setTimeout(() => {
    roles.value = [
      {id:1,name:'Super Admin',description:'Full system access with all permissions',users_count:3,is_default:true,created_at:'2026-01-15'},
      {id:2,name:'Admin',description:'Administrative access to manage store',users_count:8,is_default:true,created_at:'2026-01-15'},
      {id:3,name:'Moderator',description:'Can manage products, reviews and orders',users_count:5,is_default:false,created_at:'2026-02-20'},
      {id:4,name:'Vendor Manager',description:'Manage vendor accounts and products',users_count:2,is_default:false,created_at:'2026-03-10'},
      {id:5,name:'Support Agent',description:'Handle customer support tickets',users_count:6,is_default:false,created_at:'2026-04-05'},
    ]
    loading.value = false
  }, 300)
}
onMounted(()=>load())
</script>
