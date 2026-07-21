<template>
  <div>
    <PageHeader title="Admins" subtitle="Administrator user management">
      <button class="btn-primary"><PlusIcon class="w-4 h-4" />Add Admin</button>
    </PageHeader>
    <DataTable :items="admins" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by name, email..." empty-icon="👤" empty-text="No admins found"
      @search="q => { search = q; load(1) }" @page="load">
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
          <router-link :to="'/admins/' + item.id" class="p-1.5 rounded-lg inline-flex items-center transition mr-1" :style="{ color: 'var(--navbar-text)' }" title="View" @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'" @mouseleave="e => e.target.style.backgroundColor = 'transparent'"><EyeIcon class="w-4 h-4" /></router-link>
          <button class="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition mr-1"><PencilIcon class="w-4 h-4" /></button>
          <button class="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition"><TrashIcon class="w-4 h-4" /></button>
        </td>
      </template>
    </DataTable>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/outline'
const admins = ref([]), loading = ref(true), search = ref(''), roleFilter = ref('')
const roleOptions = [{value:'',label:'All'},{value:'super_admin',label:'Super Admin'},{value:'admin',label:'Admin'},{value:'moderator',label:'Moderator'}]
const columns = [
  {key:'name',label:'Admin'},{key:'role',label:'Role',class:'w-28'},{key:'status',label:'Status',class:'w-24'},
  {key:'last_login',label:'Last Login',class:'w-32'},{key:'actions',label:'',class:'w-24 text-right'}
]
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
