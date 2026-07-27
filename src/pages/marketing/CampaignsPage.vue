<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <DataTable :items="campaigns" :columns="columns" :loading="loading" searchable
      search-placeholder="Search campaigns..." empty-icon="📢" empty-text="No campaigns yet"
      @search="q => { search = q; load(1) }">
      <template #actions>
        <button @click="openForm()" class="btn-primary">Add Campaign</button>
      </template>
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="md" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.name }}</td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.type }}</td>
        <td class="table-cell"><span class="badge" :class="item.status === 'active' ? 'badge-green' : item.status === 'scheduled' ? 'badge-blue' : 'badge-gray'">{{ item.status }}</span></td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.reach?.toLocaleString() }}</td>
        <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.clicks?.toLocaleString() }}</td>
        <td class="table-cell text-xs" style="color:var(--text-muted)">{{ item.start_date }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="View">
              <router-link :to="'/campaigns/' + item.id" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all"><EyeIcon class="w-4 h-4" /></router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <button @click="openForm(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:text-blue-600 transition-all"><PencilIcon class="w-4 h-4" /></button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all"><TrashIcon class="w-4 h-4" /></button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Add / Edit Campaign Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative bg-white rounded-2xl p-6 w-full max-w-md animate-in"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'Add' }} Campaign</h2>
          <form @submit.prevent="doSave" class="space-y-4">
            <div>
              <label class="label">Campaign Name *</label>
              <input v-model="form.name" required class="input" placeholder="e.g. Summer Sale" />
            </div>
            <div>
              <label class="label">Type *</label>
              <SelectBox v-model="form.type" :options="formTypeOptions" placeholder="Select type" fullWidth />
            </div>
            <div>
              <label class="label">Status *</label>
              <SelectBox v-model="form.status" :options="formStatusOptions" placeholder="Select status" fullWidth />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Start Date</label>
                <input v-model="form.start_date" type="date" class="input" />
              </div>
              <div>
                <label class="label">End Date</label>
                <input v-model="form.end_date" type="date" class="input" />
              </div>
            </div>
            <div>
              <label class="label">Budget (৳)</label>
              <input v-model="form.budget" type="number" class="input" placeholder="e.g. 50000" min="0" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
                {{ saving ? 'Saving...' : editing ? 'Update Campaign' : 'Create Campaign' }}
              </button>
              <button type="button" @click="showForm = false"
                class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal :show="!!deleteTarget" title="Delete Campaign"
      :message="`Delete campaign '${deleteTarget?.name}'? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { MegaphoneIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const campaigns = ref([]), loading = ref(true), search = ref(''), statusFilter = ref('')
const showForm = ref(false), saving = ref(false), editing = ref(null)
const deleteTarget = ref(null), deleting = ref(false)

const statusOptions = [{value:'',label:'All'},{value:'active',label:'Active'},{value:'scheduled',label:'Scheduled'},{value:'ended',label:'Ended'}]
const formTypeOptions = [{value:'Seasonal',label:'Seasonal'},{value:'Promo',label:'Promo'},{value:'Product',label:'Product'},{value:'Clearance',label:'Clearance'},{value:'Event',label:'Event'}]
const formStatusOptions = [{value:'active',label:'Active'},{value:'scheduled',label:'Scheduled'},{value:'ended',label:'Ended'}]

const form = reactive({
  name: '',
  type: 'Seasonal',
  status: 'active',
  start_date: '',
  end_date: '',
  budget: ''
})
const breadcrumbItems = computed(() => [
  { label: 'Campaigns', icon: MegaphoneIcon }
])

const columns = [
  {key:'name',label:'Campaign'},{key:'type',label:'Type',class:'w-28'},{key:'status',label:'Status',class:'w-24'},
  {key:'reach',label:'Reach',class:'w-24'},{key:'clicks',label:'Clicks',class:'w-24'},{key:'start',label:'Start Date',class:'w-28'},{key:'actions',label:'Action',class:'w-28 text-right'}
]
function openForm(item = null) {
  editing.value = item
  if (item) {
    Object.assign(form, {
      name: item.name,
      type: item.type,
      status: item.status,
      start_date: item.start_date_raw || '',
      end_date: item.end_date_raw || '',
      budget: item.budget || ''
    })
  } else {
    Object.assign(form, { name: '', type: 'Seasonal', status: 'active', start_date: '', end_date: '', budget: '' })
  }
  showForm.value = true
}

async function doSave() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    if (editing.value) {
      const idx = campaigns.value.findIndex(c => c.id === editing.value.id)
      if (idx !== -1) {
        campaigns.value[idx] = {
          ...campaigns.value[idx],
          name: form.name,
          type: form.type,
          status: form.status,
          start_date: form.start_date ? new Date(form.start_date).toLocaleDateString('en-BD') : '—',
          budget: form.budget ? Number(form.budget) : 0
        }
      }
      toast.success('Campaign updated.')
    } else {
      campaigns.value.unshift({
        id: campaigns.value.length + 1,
        name: form.name,
        type: form.type,
        status: form.status,
        reach: 0,
        clicks: 0,
        start_date: form.start_date ? new Date(form.start_date).toLocaleDateString('en-BD') : '—',
        budget: form.budget ? Number(form.budget) : 0
      })
      toast.success('Campaign created.')
    }
    showForm.value = false
  } catch (e) {
    toast.error('Save failed.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    campaigns.value = campaigns.value.filter(c => c.id !== deleteTarget.value.id)
    toast.success('Campaign deleted.')
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

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
