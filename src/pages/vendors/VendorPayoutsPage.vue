<template>
  <div class="animate-in space-y-6">
    <BreadcrumbHeader :items="breadcrumbItems">
      <button @click="exportPayouts" class="btn-secondary text-sm py-1.5 px-4 flex items-center gap-1.5">
        <DownloadIcon class="w-4 h-4" />
        Export CSV
      </button>
    </BreadcrumbHeader>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in payoutStats" :key="stat.label" class="card p-4 flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          :style="{ backgroundColor: hexToRGBA(stat.color, 0.13) }"
        >
          <component :is="stat.icon" class="w-5 h-5" :style="{ color: stat.color }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" style="color: var(--text-muted)">
            {{ stat.label }}
          </p>
          <p class="text-lg font-black" style="color: var(--text-primary)">
            {{ stat.prefix || '' }}{{ Number(stat.value || 0).toLocaleString() }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 flex flex-wrap items-end gap-3">
      <div class="list-filter-item">
        <label class="label">Status</label>
        <SelectBox
          v-model="filters.status"
          :options="statusOptions"
          placeholder="All Status"
          size="sm"
          @change="load(1)"
        />
      </div>
      <div class="list-filter-item">
        <label class="label">Vendor</label>
        <SelectBox
          v-model="filters.vendor_uuid"
          :options="vendorOptions"
          placeholder="All Vendors"
          size="sm"
          searchable
          @change="load(1)"
        />
      </div>
      <div class="list-filter-item list-filter-item--wide">
        <label class="label">Request Date</label>
        <DatePicker
          v-model:from="filters.dateFrom"
          v-model:to="filters.dateTo"
          :presets="datePresets"
          range
          placeholder="Date range"
          display-format="MMM dd, yyyy"
        />
      </div>
      <button @click="load(1)" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="resetFilters" class="btn-ghost text-xs py-2 px-3">Reset</button>
    </div>

    <!-- Payout Requests Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead>
            <tr>
              <th class="list-th">Vendor Shop</th>
              <th class="list-th">Requested Amount</th>
              <th class="list-th">Balance (Before → After)</th>
              <th class="list-th">Method &amp; Notes</th>
              <th class="list-th">Status</th>
              <th class="list-th">Requested At</th>
              <th class="list-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-16">
                <div class="flex flex-col items-center gap-3" style="color: var(--text-muted)">
                  <svg class="w-7 h-7 animate-spin" style="color: var(--color-primary)" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span class="text-sm">Loading payout requests...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="!payouts.length">
              <td colspan="7" class="text-center py-16">
                <div class="flex flex-col items-center gap-2" style="color: var(--text-muted)">
                  <BanknotesIcon class="w-10 h-10" />
                  <p class="text-sm font-medium">No payout requests found</p>
                  <p class="text-xs">Vendor withdrawal requests will appear here for approval and disbursement</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="p in payouts" :key="p.uuid" class="list-row">
              <td class="list-td">
                <router-link
                  v-if="p.vendor?.uuid"
                  :to="`/vendors/${p.vendor.uuid}`"
                  class="hover:underline"
                >
                  <p class="list-name">{{ p.vendor.shop_name }}</p>
                  <p class="list-sub">{{ p.vendor.email }}</p>
                </router-link>
                <span v-else class="text-xs text-gray-500">Vendor #{{ p.vendor_id }}</span>
              </td>
              <td class="list-td">
                <p class="list-count text-emerald-700">৳{{ Number(p.amount || 0).toLocaleString() }}</p>
              </td>
              <td class="list-td text-xs">
                <span class="text-gray-600">৳{{ Number(p.balance_before || 0).toLocaleString() }}</span>
                <span class="mx-1 text-gray-400">→</span>
                <span class="font-semibold text-gray-800">৳{{ Number(p.balance_after || 0).toLocaleString() }}</span>
              </td>
              <td class="list-td">
                <p class="text-xs font-semibold uppercase text-gray-700">
                  {{ formatMethod(p.payment_method) }}
                </p>
                <p v-if="p.notes || p.admin_notes" class="text-[11px] text-gray-500 max-w-xs truncate">
                  {{ p.admin_notes || p.notes }}
                </p>
              </td>
              <td class="list-td">
                <StatusBadge :value="p.status" />
              </td>
              <td class="list-td">
                <p class="list-name">{{ formatDate(p.created_at) }}</p>
                <p v-if="p.completed_at" class="list-sub">Paid {{ formatDate(p.completed_at) }}</p>
              </td>
              <td class="list-td text-right">
                <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
                  <button
                    v-if="p.status === 'pending'"
                    @click="confirmAction('approve', p)"
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                  >
                    Approve
                  </button>
                  <button
                    v-if="p.status === 'pending'"
                    @click="openRejectModal(p)"
                    class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition"
                  >
                    Reject
                  </button>
                  <button
                    v-if="p.status === 'approved'"
                    @click="confirmAction('complete', p)"
                    class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                  >
                    Mark Paid
                  </button>
                  <router-link
                    v-if="p.vendor?.uuid"
                    :to="`/vendors/${p.vendor.uuid}`"
                    class="list-action-btn border border-gray-200"
                    title="View Vendor"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination v-if="pagination" v-model:perPage="perPage" :pagination="pagination" @page="load" />
    </div>

    <!-- Confirm Approve / Complete Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      type="success"
      :title="confirmModal.action === 'complete' ? 'Mark Payout Disbursed' : 'Approve Payout Request'"
      :message="confirmModal.action === 'complete'
        ? `Confirm that ৳${Number(confirmModal.item?.amount || 0).toLocaleString()} has been transferred to '${confirmModal.item?.vendor?.shop_name}'?`
        : `Approve payout request of ৳${Number(confirmModal.item?.amount || 0).toLocaleString()} for '${confirmModal.item?.vendor?.shop_name}'?`"
      :confirm-text="confirmModal.action === 'complete' ? 'Yes, Mark Paid' : 'Yes, Approve'"
      :loading="confirmModal.loading"
      @confirm="executeConfirmAction"
      @cancel="confirmModal.show = false"
    />

    <!-- Reject Reason Modal -->
    <Teleport to="body">
      <div v-if="rejectModal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="rejectModal.show = false" />
        <div class="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-gray-900">Reject Payout Request</h3>
              <p class="text-xs text-gray-500">The requested balance will be refunded back to the vendor wallet.</p>
            </div>
            <button @click="rejectModal.show = false" class="p-1 text-gray-400 hover:text-gray-600">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          <form @submit.prevent="submitReject" class="p-6 space-y-4">
            <div>
              <label class="label mb-1.5 block text-xs font-bold text-gray-700">Rejection Reason *</label>
              <textarea
                v-model="rejectModal.reason"
                rows="3"
                required
                placeholder="e.g. Invalid bank account details or minimum threshold not met..."
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-xs outline-none focus:border-emerald-600 text-gray-800"
              />
            </div>
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" @click="rejectModal.show = false" class="btn-ghost text-xs">Cancel</button>
              <button type="submit" :disabled="rejectModal.submitting" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                {{ rejectModal.submitting ? 'Rejecting...' : 'Reject & Refund Wallet' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import DatePicker from '@ecom/ui/components/DatePicker.vue'
import Pagination from '@ecom/ui/components/Pagination.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import { vendorApi } from '@/api/vendor'
import { useCsvExport } from '@ecom/ui/composables/useCsvExport'
import { Download as DownloadIcon } from 'lucide-vue-next'
import {
  BanknotesIcon,
  EyeIcon,
  ClockIcon,
  XMarkIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { exportToCsv } = useCsvExport()

const payouts = ref([])
const vendorList = ref([])
const summary = reactive({
  total_earned: 0,
  total_withdrawn: 0,
  pending_balance: 0,
  vendors_due: 0,
  pending_requests: 0,
})
const loading = ref(true)
const pagination = ref(null)
const perPage = ref(20)

const breadcrumbItems = computed(() => [
  { label: 'Vendors', to: '/vendors' },
  { label: 'Vendor Payouts', icon: CurrencyDollarIcon },
])

const filters = reactive({
  status: '',
  vendor_uuid: '',
  dateFrom: '',
  dateTo: '',
})

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved (Ready to Pay)' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
]

const vendorOptions = computed(() => [
  { value: '', label: 'All Vendors' },
  ...vendorList.value.map(v => ({ value: v.uuid, label: v.shop_name })),
])

const datePresets = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
]

const hexToRGBA = (hex, alpha) => {
  if (!hex) return `rgba(46, 125, 50, ${alpha})`
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return isNaN(r) ? `rgba(46, 125, 50, ${alpha})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const payoutStats = computed(() => [
  { label: 'Total Vendor Earned', value: summary.total_earned, icon: CurrencyDollarIcon, color: '#2E7D32', prefix: '৳' },
  { label: 'Total Paid Out', value: summary.total_withdrawn, icon: BanknotesIcon, color: '#10B981', prefix: '৳' },
  { label: 'Unpaid Wallet Balance', value: summary.pending_balance, icon: ClockIcon, color: '#D97706', prefix: '৳' },
  { label: 'Pending Requests', value: summary.pending_requests, icon: UsersIcon, color: '#3B82F6' },
])

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMethod(m) {
  if (!m) return 'Bank Transfer'
  return m.replace(/_/g, ' ')
}

function resetFilters() {
  filters.status = ''
  filters.vendor_uuid = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  load(1)
}

async function loadSummaryAndVendors() {
  try {
    const [sumRes, vendRes] = await Promise.all([
      vendorApi.payoutSummary(),
      vendorApi.list({ per_page: 100 }),
    ])
    if (sumRes.data?.data) {
      Object.assign(summary, sumRes.data.data)
    }
    vendorList.value = vendRes.data?.data || []
  } catch {
    // non-fatal
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      per_page: perPage.value,
      status: filters.status || undefined,
      vendor_uuid: filters.vendor_uuid || undefined,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
    }
    Object.keys(params).forEach(k => { if (params[k] === undefined) delete params[k] })

    const res = await vendorApi.payouts(params)
    payouts.value = res.data.data || []
    pagination.value = res.data.pagination || null
  } catch {
    toast.error('Failed to load payout requests')
  } finally {
    loading.value = false
  }
}

const confirmModal = reactive({
  show: false,
  action: 'approve',
  item: null,
  loading: false,
})

function confirmAction(action, item) {
  confirmModal.action = action
  confirmModal.item = item
  confirmModal.show = true
}

async function executeConfirmAction() {
  if (!confirmModal.item) return
  confirmModal.loading = true
  try {
    if (confirmModal.action === 'complete') {
      await vendorApi.payoutComplete(confirmModal.item.uuid)
      toast.success('Payout marked as completed')
    } else {
      await vendorApi.payoutApprove(confirmModal.item.uuid)
      toast.success('Payout request approved')
    }
    confirmModal.show = false
    await Promise.all([load(pagination.value?.current_page || 1), loadSummaryAndVendors()])
  } catch (e) {
    toast.error(e.response?.data?.message || 'Payout action failed')
  } finally {
    confirmModal.loading = false
  }
}

const rejectModal = reactive({
  show: false,
  item: null,
  reason: '',
  submitting: false,
})

function openRejectModal(item) {
  rejectModal.item = item
  rejectModal.reason = ''
  rejectModal.show = true
}

async function submitReject() {
  if (!rejectModal.item || !rejectModal.reason.trim()) return
  rejectModal.submitting = true
  try {
    await vendorApi.payoutReject(rejectModal.item.uuid, rejectModal.reason.trim())
    toast.success('Payout rejected and balance refunded to vendor wallet')
    rejectModal.show = false
    await Promise.all([load(pagination.value?.current_page || 1), loadSummaryAndVendors()])
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to reject payout')
  } finally {
    rejectModal.submitting = false
  }
}

function exportPayouts() {
  const cols = [
    { key: 'vendor', label: 'Vendor Shop', transform: v => v?.shop_name || '—' },
    { key: 'amount', label: 'Amount', transform: v => `৳${Number(v || 0).toLocaleString()}` },
    { key: 'payment_method', label: 'Method' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Requested Date', transform: v => formatDate(v) },
  ]
  exportToCsv(payouts.value, cols, `vendor-payout-requests-${payouts.value.length}`)
}

onMounted(async () => {
  await Promise.all([load(1), loadSummaryAndVendors()])
})
</script>
