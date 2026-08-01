<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <DataTable :items="coupons" :columns="columns" :loading="loading" searchable :pagination="pagination" @search="q=>{search=q;load(1)}" @page="load" empty-icon="🎟️">
      <template #actions>
        <button @click="openForm()" class="btn-primary">Create Coupon</button>
      </template>
      <template #default="{ item }">
        <td class="table-cell"><p class="font-mono font-bold text-sm" style="color:var(--text-primary)">{{ item.code }}</p></td>
        <td class="table-cell"><span class="badge" :class="item.type==='percentage'?'badge-blue':'badge-green'">{{ item.type==='percentage'?`${item.value}%`:`৳${item.value}` }}</span></td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">৳{{ Number(item.minimum_order_amount).toLocaleString() }}</td>
        <td class="table-cell text-sm" style="color:var(--text-primary)">{{ item.used_count }}{{ item.usage_limit?` / ${item.usage_limit}`:' / ∞' }}</td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'Never' }}</td>
        <td class="table-cell"><span class="badge" :class="item.is_active?'badge-green':'badge-gray'">{{ item.is_active?'Active':'Inactive' }}</span></td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="Edit">
              <button @click="openForm(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all"><PencilIcon class="w-4 h-4" /></button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:bg-red-50 transition-all"><TrashIcon class="w-4 h-4" /></button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>
    <Teleport to="body">        <div v-if="showForm" class="fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showForm=false" />
        <div class="relative z-10 h-full overflow-y-auto flex items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-lg animate-in" style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-lg mb-5" style="color:var(--text-primary)">{{ editing?'Edit':'Create' }} Coupon</h2>
          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Coupon Code *</label><input v-model="form.code" required class="input uppercase" placeholder="SAVE20" /></div>
              <div><label class="label">Type</label>
                <SelectBox v-model="form.type" :options="typeOptions" full-width />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Value *</label><input v-model.number="form.value" required type="number" min="0" step="0.01" class="input" /></div>
              <div><label class="label">Min Order Amount</label><input v-model.number="form.minimum_order_amount" type="number" min="0" class="input" /></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Usage Limit</label><input v-model.number="form.usage_limit" type="number" min="1" class="input" placeholder="Unlimited" /></div>
              <div><label class="label">Per User Limit</label><input v-model.number="form.usage_limit_per_user" type="number" min="1" class="input" /></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="label">Starts At</label><DatePicker v-model="form.starts_at" placeholder="Start date" /></div>
              <div><label class="label">Expires At</label><DatePicker v-model="form.expires_at" placeholder="Expiry date" /></div>
            </div>
            <ToggleSwitch v-model="form.is_active" label="Active" />
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">{{ saving?'Saving...':'Save Coupon' }}</button>
              <button type="button" @click="showForm=false" class="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </Teleport>
    <ConfirmModal :show="!!deleteTarget" title="Delete Coupon" :message="`Delete coupon '${deleteTarget?.code}'?`" :loading="deleting" @confirm="doDelete" @cancel="deleteTarget=null" />
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { couponApi } from '@/api'
import { PencilIcon, TrashIcon, TagIcon } from '@heroicons/vue/24/outline'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import DatePicker from '@ecom/ui/components/DatePicker.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'
const toast=useToast()
const coupons=ref([]), pagination=ref(null), loading=ref(true), showForm=ref(false), saving=ref(false), search=ref('')

const breadcrumbItems = computed(() => [
  { label: 'Coupons', icon: TagIcon }
])

const editing=ref(null), deleteTarget=ref(null), deleting=ref(false)
const form=reactive({ code:'', type:'percentage', value:0, minimum_order_amount:0, usage_limit:null, usage_limit_per_user:1, starts_at:'', expires_at:'', is_active:true })

const typeOptions = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed (৳)' },
]


const columns=[{key:'code',label:'Code'},{key:'discount',label:'Discount',class:'w-28'},{key:'min',label:'Min Order',class:'w-28'},{key:'usage',label:'Usage',class:'w-24'},{key:'expires',label:'Expires',class:'w-28'},{key:'status',label:'Status',class:'w-20'},{key:'actions',label:'Action',class:'w-20 text-right'}]
async function load(page=1){loading.value=true;try{    const r = await couponApi.list({page,search:search.value,per_page:15});coupons.value=r.data.data||[];pagination.value=r.data.pagination}finally{loading.value=false}}
function openForm(item=null){editing.value=item;if(item)Object.assign(form,{code:item.code,type:item.type,value:item.value,minimum_order_amount:item.minimum_order_amount,usage_limit:item.usage_limit,usage_limit_per_user:item.usage_limit_per_user,starts_at:item.starts_at?.slice(0,10)||'',expires_at:item.expires_at?.slice(0,10)||'',is_active:item.is_active});else Object.assign(form,{code:'',type:'percentage',value:0,minimum_order_amount:0,usage_limit:null,usage_limit_per_user:1,starts_at:'',expires_at:'',is_active:true});showForm.value=true}
async function save(){saving.value=true;try{const d={...form,code:form.code.toUpperCase()};if(editing.value)await couponApi.update(editing.value.id,d);else await couponApi.store(d);toast.success('Saved.');showForm.value=false;load()}finally{saving.value=false}}
function confirmDelete(item){deleteTarget.value=item}
async function doDelete(){deleting.value=true;try{await couponApi.destroy(deleteTarget.value.id);toast.success('Deleted.');deleteTarget.value=null;load()}finally{deleting.value=false}}
onMounted(()=>load())
</script>