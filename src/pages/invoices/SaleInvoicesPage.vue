<template>
  <div>
    <PageHeader title="Sale Invoices" :subtitle="`${pagination?.total || 0} sale invoices`">
      <router-link to="/invoices/sales/create" class="btn-primary"><PlusIcon class="w-4 h-4" />New Invoice</router-link>
    </PageHeader>
    <DataTable :items="invoices" :columns="columns" :loading="loading" :pagination="pagination" searchable
      search-placeholder="Search by invoice #, customer..." empty-icon="📄" empty-text="No sale invoices found"
      @search="q => { search = q; load(1) }" @page="load">
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="sm" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell"><router-link :to="'/invoices/sales/' + item.id" class="font-semibold underline" :style="{ color: 'var(--color-primary)' }">#INV-{{ String(item.id).padStart(5, '0') }}</router-link></td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.customer_name }}</td>
        <td class="table-cell" style="color:var(--text-muted)">{{ formatDate(item.invoice_date) }}</td>
        <td class="table-cell font-bold" style="color:var(--color-primary)">৳{{ Number(item.total).toLocaleString() }}</td>
        <td class="table-cell"><StatusBadge :value="item.status" /></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.due_date ? 'Due: ' + formatDate(item.due_date) : '—' }}</td>
        <td class="table-cell text-right">
          <router-link :to="'/invoices/sales/' + item.id" class="p-1.5 rounded-lg inline-flex items-center transition" :style="{ color: 'var(--navbar-text)' }" title="View" @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'" @mouseleave="e => e.target.style.backgroundColor = 'transparent'"><EyeIcon class="w-4 h-4" /></router-link>
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
import { PlusIcon, EyeIcon } from '@heroicons/vue/24/outline'
const invoices = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('')
const statusOptions = [{value:'',label:'All'},{value:'paid',label:'Paid'},{value:'unpaid',label:'Unpaid'},{value:'overdue',label:'Overdue'},{value:'cancelled',label:'Cancelled'},{value:'refunded',label:'Refunded'}]
const columns = [
  {key:'invoice_no',label:'Invoice #',class:'w-28'},{key:'customer',label:'Customer'},{key:'date',label:'Date',class:'w-24'},
  {key:'total',label:'Amount',class:'w-28'},{key:'status',label:'Status',class:'w-20'},{key:'due',label:'Due Date',class:'w-28'},{key:'actions',label:'',class:'w-16 text-right'}
]
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '' }
async function load(page=1) {
  loading.value = true
  setTimeout(() => {
    invoices.value = Array.from({length:8},(_,i)=>({
      id:1001+i,customer_name:['Sarah Johnson','Mike Chen','Emily Davis','Alex Kumar','Lisa Martinez','Tom Wilson','John Smith','Emma Brown'][i],
      invoice_date:new Date(Date.now()-i*3*86400000).toISOString(),
      total:Math.random()*50000+1500,status:['paid','paid','unpaid','overdue','paid','unpaid','paid','refunded'][i],
      due_date:['','',new Date(Date.now()+7*86400000).toISOString(),new Date(Date.now()-5*86400000).toISOString(),'','',new Date(Date.now()+14*86400000).toISOString(),''][i]
    }))
    pagination.value = {current_page:page,last_page:4,total:29,per_page:8}
    loading.value = false
  }, 400)
}
onMounted(()=>load())
</script>
