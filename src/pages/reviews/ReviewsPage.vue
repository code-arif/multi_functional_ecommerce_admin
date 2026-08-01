<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <DataTable :items="reviews" :columns="columns" :loading="loading" searchable
      search-placeholder="Search reviews..." empty-icon="⭐" empty-text="No reviews found"
      :pagination="pagination" @search="q => { search = q; load(1) }" @page="load">
      <template #filters>
        <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="md" @change="load(1)" />
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-1">
            <span v-for="i in 5" :key="i" class="text-sm"
              :class="i <= item.rating ? 'text-yellow-400' : 'text-gray-200'">★</span>
            <span class="text-xs" style="color:var(--text-muted)">({{ item.rating }}/5)</span>
          </div>
        </td>
        <td class="table-cell">
          <p class="text-sm font-semibold line-clamp-1" style="color:var(--text-primary)">{{ item.title || '—' }}</p>
          <p class="text-xs line-clamp-2" style="color:var(--text-muted)">{{ item.body || 'No comment' }}</p>
        </td>
        <td class="table-cell text-sm" style="color:var(--text-primary)">{{ item.product?.name }}</td>
        <td class="table-cell text-sm" style="color:var(--text-primary)">{{ item.user?.name }}</td>
        <td class="table-cell">
          <StatusBadge :value="item.status" />
        </td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="Approve">
              <button v-if="item.status !== 'approved'" @click="approve(item.id)"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-green-400 text-green-500 hover:text-green-600 transition-all">
                <CheckIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Reject">
              <button v-if="item.status !== 'rejected'" @click="reject(item.id)"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all">
                <TrashIcon class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <ConfirmModal :show="!!deleteTarget" title="Delete Review" :message="`Delete review by ${deleteTarget?.user?.name}? This cannot be undone.`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { reviewApi } from '@/api'
import { StarIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const reviews = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('pending')
const deleteTarget = ref(null), deleting = ref(false)

const statusOptions = [{value:'',label:'All'},{value:'pending',label:'Pending'},{value:'approved',label:'Approved'},{value:'rejected',label:'Rejected'}]

const breadcrumbItems = computed(() => [
  { label: 'Reviews', icon: StarIcon }
])

const columns = [
  {key:'rating',label:'Rating',class:'w-32'},
  {key:'review',label:'Review'},
  {key:'product',label:'Product',class:'w-36'},
  {key:'user',label:'Customer',class:'w-32'},
  {key:'status',label:'Status',class:'w-24'},
  {key:'actions',label:'Action',class:'w-36 text-right'}
]

async function load(page = 1) {
  loading.value = true
  try {
    const r = await reviewApi.list({ page, status: statusFilter.value, search: search.value })
    reviews.value = r.data.data || []
    pagination.value = r.data.pagination
  } finally {
    loading.value = false
  }
}

async function approve(id) {
  await reviewApi.approve(id)
  toast.success('Review approved.')
  load()
}

async function reject(id) {
  await reviewApi.reject(id)
  toast.info('Review rejected.')
  load()
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await reviewApi.destroy(deleteTarget.value.id)
    toast.success('Review deleted.')
    deleteTarget.value = null
    load()
  } finally {
    deleting.value = false
  }
}

onMounted(() => load())
</script>
