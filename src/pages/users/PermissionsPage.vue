<template>
  <div>
    <PageHeader title="Permissions" subtitle="System permission management" />
    <DataTable :items="permissions" :columns="columns" :loading="loading" searchable
      search-placeholder="Search permissions..." empty-icon="🔑" empty-text="No permissions found"
      @search="q => { search = q; load(1) }">
      <template #filters>
        <SelectBox v-model="groupFilter" :options="groupOptions" placeholder="All Groups" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.name }}</td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.slug }}</td>
        <td class="table-cell"><span class="badge badge-purple">{{ item.group }}</span></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.description }}</td>
        <td class="table-cell text-right">
          <button class="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition mr-1"><PencilIcon class="w-4 h-4" /></button>
          <button class="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition"><TrashIcon class="w-4 h-4" /></button>
        </td>
      </template>
    </DataTable>
    <Pagination :pagination="pagination" @page="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Pagination from '@/components/common/Pagination.vue'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
const permissions = ref([]), loading = ref(true), search = ref(''), groupFilter = ref('')
const groupOptions = [{value:'',label:'All'},{value:'Products',label:'Products'},{value:'Orders',label:'Orders'},{value:'Users',label:'Users'},{value:'Settings',label:'Settings'}]
const columns = [
  {key:'name',label:'Permission'},{key:'slug',label:'Slug',class:'w-40'},{key:'group',label:'Group',class:'w-24'},
  {key:'description',label:'Description'},{key:'actions',label:'',class:'w-24 text-right'}
]

const pagination = ref({
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
})

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
    pagination.value.total = all.length
    pagination.value.last_page = Math.ceil(all.length / pagination.value.per_page)
    loading.value = false
  }, 300)
}
onMounted(()=>load())
</script>
