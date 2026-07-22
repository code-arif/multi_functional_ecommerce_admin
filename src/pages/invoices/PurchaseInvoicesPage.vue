<template>
  <div>
    <PageHeader title="Purchase Invoices" :subtitle="`${pagination?.total || 0} purchase invoices`">
      <router-link to="/invoices/purchases/create" class="btn-primary"><PlusIcon class="w-4 h-4" />New Purchase</router-link>
    </PageHeader>
    <DataTable :items="invoices" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by invoice #, vendor..." empty-icon="📋" empty-text="No purchase invoices found"
      @search="q => { search = q; load(1) }">
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="sm" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell"><router-link :to="'/invoices/purchases/' + item.id" class="font-semibold underline" :style="{ color: 'var(--color-primary)' }">#PUR-{{ String(item.id).padStart(5, '0') }}</router-link></td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.vendor_name }}</td>
        <td class="table-cell" style="color:var(--text-muted)">{{ formatDate(item.invoice_date) }}</td>
        <td class="table-cell font-bold" style="color:var(--color-primary)">৳{{ Number(item.total).toLocaleString() }}</td>
        <td class="table-cell"><StatusBadge :value="item.status" /></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.payment_method || '—' }}</td>
        <td class="table-cell text-right">
          <router-link :to="'/invoices/purchases/' + item.id" class="p-1.5 rounded-lg inline-flex items-center transition" :style="{ color: 'var(--navbar-text)' }" title="View" @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'" @mouseleave="e => e.target.style.backgroundColor = 'transparent'"><EyeIcon class="w-4 h-4" /></router-link>
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
import Pagination from '@/components/common/Pagination.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { PlusIcon, EyeIcon } from '@heroicons/vue/24/outline'
const invoices = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('')
const statusOptions = [{value:'',label:'All'},{value:'paid',label:'Paid'},{value:'unpaid',label:'Unpaid'},{value:'pending',label:'Pending'},{value:'cancelled',label:'Cancelled'}]
const columns = [
  {key:'invoice_no',label:'Purchase #',class:'w-28'},{key:'vendor',label:'Vendor'},{key:'date',label:'Date',class:'w-24'},
  {key:'total',label:'Amount',class:'w-28'},{key:'status',label:'Status',class:'w-20'},{key:'payment',label:'Payment',class:'w-24'},{key:'actions',label:'',class:'w-16 text-right'}
]
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '' }
async function load(page=1) {
  loading.value = true
  setTimeout(() => {
    invoices.value = Array.from({length:6},(_,i)=>({
      id:5001+i,vendor_name:['TechMart Supplies','Global Traders','Quality Imports','Direct Source','Prime Distributors','Wholesale Hub'][i],
      invoice_date:new Date(Date.now()-i*5*86400000).toISOString(),
      total:Math.random()*120000+10000,status:['paid','unpaid','pending','paid','cancelled','paid'][i],
      payment_method:['Bank Transfer','','','Cash','','Check'][i]
    }))
    pagination.value = {current_page:page,last_page:3,total:15,per_page:6}
    loading.value = false
  }, 400)
}
onMounted(()=>load())
</script>
