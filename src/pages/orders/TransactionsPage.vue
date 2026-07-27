<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <DataTable :items="transactions" :columns="columns" :loading="loading" searchable :pagination="pagination"
      search-placeholder="Search by ID, customer..." empty-icon="💳" empty-text="No transactions found"
      @search="q => { search = q; load(1) }" @page="load">
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="md" @change="load(1)" />
        <SelectBox v-model="methodFilter" :options="methodOptions" placeholder="All Methods" size="md" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" style="color:var(--text-primary)">#{{ item.id }}</td>
        <td class="table-cell" style="color:var(--text-secondary)">{{ item.customer || 'Customer ' + item.user_id }}</td>
        <td class="table-cell font-semibold" style="color:var(--color-primary)">৳{{ Number(item.amount || 0).toLocaleString() }}</td>
        <td class="table-cell" style="color:var(--text-secondary)">{{ item.payment_method || '—' }}</td>
        <td class="table-cell"><StatusBadge :value="item.status || 'completed'" /></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ formatDate(item.created_at) }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="'/transactions/' + item.id"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all">
                <EyeIcon class="w-4 h-4" />
              </router-link>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { CurrencyDollarIcon, EyeIcon } from '@heroicons/vue/24/outline'
const transactions = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref(''), methodFilter = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Transactions', icon: CurrencyDollarIcon }
])

const statusOptions = [{value:'',label:'All'},{value:'completed',label:'Completed'},{value:'pending',label:'Pending'},{value:'failed',label:'Failed'},{value:'refunded',label:'Refunded'}]
const methodOptions = [{value:'',label:'All'},{value:'bkash',label:'bKash'},{value:'nagad',label:'Nagad'},{value:'card',label:'Card'},{value:'cod',label:'COD'}]
const columns = [
  {key:'id',label:'ID',class:'w-20'},{key:'customer',label:'Customer'},{key:'amount',label:'Amount',class:'w-28'},
  {key:'method',label:'Method',class:'w-24'},{key:'status',label:'Status',class:'w-24'},{key:'date',label:'Date',class:'w-32'},{key:'actions',label:'Action',class:'w-16 text-right'}
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
    pagination.value = {current_page:page,last_page:Math.ceil(22/10),total:22,per_page:10}
    loading.value = false
  }, 400)
}
onMounted(()=>load())
</script>
