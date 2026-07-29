<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <DataTable :items="invoices" :columns="columns" :loading="loading" searchable
      search-placeholder="Search by invoice #, vendor..." empty-icon="📋" empty-text="No purchase invoices found"
      :pagination="pagination" @search="q => { search = q; load(1) }" @page="load">
      <template #actions>
        <router-link to="/invoices/purchases/create" class="btn-primary">New Purchase</router-link>
      </template>
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="md" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell"><router-link :to="'/invoices/purchases/' + item.id" class="font-semibold underline" :style="{ color: 'var(--color-primary)' }">#PUR-{{ String(item.id).padStart(5, '0') }}</router-link></td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.vendor_name }}</td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ formatDate(item.invoice_date) }}</td>
        <td class="table-cell font-bold" style="color:var(--color-primary)">৳{{ Number(item.total).toLocaleString() }}</td>
        <td class="table-cell"><StatusBadge :value="item.status" /></td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.payment_method || '—' }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="'/invoices/purchases/' + item.id" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all"><EyeIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <router-link :to="'/invoices/purchases/' + item.id + '/edit'" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:text-blue-600 transition-all"><PencilIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all"><TrashIcon class="w-4 h-4" /></button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <ConfirmModal :show="!!deleteTarget" title="Delete Purchase Invoice"
      :message="`Delete purchase #PUR-${String(deleteTarget?.id).padStart(5, '0')}? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import { DocumentTextIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const invoices = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('')
const deleteTarget = ref(null), deleting = ref(false)

const statusOptions = [{value:'',label:'All'},{value:'paid',label:'Paid'},{value:'unpaid',label:'Unpaid'},{value:'pending',label:'Pending'},{value:'cancelled',label:'Cancelled'}]

const breadcrumbItems = computed(() => [
  { label: 'Purchase Invoices', icon: DocumentTextIcon }
])

const columns = [
  {key:'invoice_no',label:'Purchase #',class:'w-28'},{key:'vendor',label:'Vendor'},{key:'date',label:'Date',class:'w-24'},
  {key:'total',label:'Amount',class:'w-28'},{key:'status',label:'Status',class:'w-20'},{key:'payment',label:'Payment',class:'w-24'},{key:'actions',label:'Action',class:'w-36 text-right'}
]

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '' }

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    invoices.value = invoices.value.filter(inv => inv.id !== deleteTarget.value.id)
    toast.success('Purchase invoice deleted.')
    deleteTarget.value = null
    load()
  } finally {
    deleting.value = false
  }
}

async function load(page=1) {
  loading.value = true
  setTimeout(() => {
    invoices.value = Array.from({length:6},(_,i)=>({
      id:5001+i,vendor_name:['TechMart Supplies','Global Traders','Quality Imports','Direct Source','Prime Distributors','Wholesale Hub'][i],
      invoice_date:new Date(Date.now()-i*5*86400000).toISOString(),
      total:Math.random()*120000+10000,status:['paid','unpaid','pending','paid','cancelled','paid'][i],
      payment_method:['Bank Transfer','','','Cash','','Check'][i]
    }))
    pagination.value = {current_page:page,last_page:Math.ceil(15/10),total:15,per_page:10}
    loading.value = false
  }, 400)
}
onMounted(()=>load())
</script>
