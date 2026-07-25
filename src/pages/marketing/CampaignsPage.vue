<template>
  <div>
    <PageHeader title="Campaigns" subtitle="Marketing campaign management">
      <button class="btn-primary"><PlusIcon class="w-4 h-4" />Add Campaign</button>
    </PageHeader>
    <DataTable :items="campaigns" :columns="columns" :loading="loading" searchable
      search-placeholder="Search campaigns..." empty-icon="📢" empty-text="No campaigns yet"
      @search="q => { search = q; load(1) }">
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="sm" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.name }}</td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.type }}</td>
        <td class="table-cell"><span class="badge" :class="item.status === 'active' ? 'badge-green' : item.status === 'scheduled' ? 'badge-blue' : 'badge-gray'">{{ item.status }}</span></td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.reach?.toLocaleString() }}</td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.clicks?.toLocaleString() }}</td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.start_date }}</td>
        <td class="table-cell text-right">
          <Tooltip text="View">
            <router-link :to="'/campaigns/' + item.id" class="p-1.5 rounded-lg inline-flex items-center transition mr-1 hover:bg-gray-100" :style="{ color: 'var(--navbar-text)' }"><EyeIcon class="w-4 h-4" /></router-link>
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
import SelectBox from '@/components/common/SelectBox.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/outline'
const campaigns = ref([]), loading = ref(true), search = ref(''), statusFilter = ref('')
const statusOptions = [{value:'',label:'All'},{value:'active',label:'Active'},{value:'scheduled',label:'Scheduled'},{value:'ended',label:'Ended'}]
const columns = [
  {key:'name',label:'Campaign'},{key:'type',label:'Type',class:'w-28'},{key:'status',label:'Status',class:'w-24'},
  {key:'reach',label:'Reach',class:'w-24'},{key:'clicks',label:'Clicks',class:'w-24'},{key:'start',label:'Start Date',class:'w-28'},{key:'actions',label:'',class:'w-24 text-right'}
]
async function load(page=1) {
  loading.value = true
  setTimeout(() => {
    campaigns.value = Array.from({length:6},(_,i)=>({
      id:i+1,name:['Summer Sale','Flash Deal','New Arrivals','Clearance','Festival Offer','Weekend Special'][i],
      type:['Seasonal','Promo','Product','Clearance','Event','Promo'][i],
      status:['active','active','scheduled','ended','active','scheduled'][i],
      reach:Math.floor(Math.random()*50000+5000),clicks:Math.floor(Math.random()*5000+200),
      start_date:new Date(Date.now()-i*7*86400000).toLocaleDateString('en-BD')
    }))
    loading.value = false
  }, 400)
}
onMounted(()=>load())
</script>
