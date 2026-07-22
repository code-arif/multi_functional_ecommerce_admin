<template>
  <div>
    <PageHeader title="Transactions" subtitle="Financial transaction history" />
    <DataTable :items="transactions" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by ID, customer..." empty-icon="💳" empty-text="No transactions found"
      @search="q => { search = q; load(1) }">
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="sm" @change="load(1)" />
        <SelectBox v-model="methodFilter" :options="methodOptions" placeholder="All Methods" size="sm" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" style="color:var(--text-primary)">#{{ item.id }}</td>
        <td class="table-cell">{{ item.customer || 'Customer ' + item.user_id }}</td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">৳{{ Number(item.amount || 0).toLocaleString() }}</td>
        <td class="table-cell">{{ item.payment_method || '—' }}</td>
        <td class="table-cell"><StatusBadge :value="item.status || 'completed'" /></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ formatDate(item.created_at) }}</td>
        <td class="table-cell text-right">
          <router-link :to="'/transactions/' + item.id" class="p-1.5 rounded-lg inline-flex items-center transition" :style="{ color: 'var(--navbar-text)' }" title="View" @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'" @mouseleave="e => e.target.style.backgroundColor = 'transparent'"><EyeIcon class="w-4 h-4" /></router-link>
        </td>
      </template>
    </DataTable>
    <Pagination v-model:perPage="perPage" :pagination="pagination" @page="load" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { EyeIcon } from '@heroicons/vue/24/outline'
const transactions = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref(''), methodFilter = ref(''), perPage = ref(10)
const statusOptions = [{value:'',label:'All'},{value:'completed',label:'Completed'},{value:'pending',label:'Pending'},{value:'failed',label:'Failed'},{value:'refunded',label:'Refunded'}]
const methodOptions = [{value:'',label:'All'},{value:'bkash',label:'bKash'},{value:'nagad',label:'Nagad'},{value:'card',label:'Card'},{value:'cod',label:'COD'}]
const columns = [
  {key:'id',label:'ID',class:'w-20'},{key:'customer',label:'Customer'},{key:'amount',label:'Amount',class:'w-28'},
  {key:'method',label:'Method',class:'w-24'},{key:'status',label:'Status',class:'w-24'},  {key:'date',label:'Date',class:'w-32'},{key:'actions',label:'',class:'w-16 text-right'}
]
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '' }
async function load(page=1) {
  loading.value = true
  setTimeout(() => {
    transactions.value = Array.from({length:8},(_,i)=>({
      id:1000+i,user_id:i+1,customer:`Customer ${i+1}`,amount:Math.random()*50000+500,
      payment_method:['bKash','Nagad','Card','COD'][i%4],
      status:['completed','completed','pending','completed','completed','refunded','completed','failed'][i],
      created_at:new Date(Date.now()-i*86400000).toISOString()
    }))
    pagination.value = {current_page:page,last_page:Math.ceil(22/perPage.value),total:22,per_page:perPage.value}
    loading.value = false
  }, 400)
}
onMounted(()=>load())
</script>
