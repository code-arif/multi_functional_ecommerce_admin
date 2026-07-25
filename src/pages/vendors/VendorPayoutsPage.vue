<template>
  <div class="animate-in">
    <PageHeader title="Vendor Payouts" subtitle="Manage vendor commissions and payment settlements">
      <button @click="showCreateModal = true" class="btn-primary text-sm">
        <PlusIcon class="w-4 h-4" />
        Create Payout
      </button>
    </PageHeader>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div v-for="stat in payoutStats" :key="stat.label" class="card p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          :style="{ backgroundColor: hexToRGBA(stat.color, 0.13) }">
          <component :is="stat.icon" class="w-5 h-5" :style="{ color: stat.color }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" style="color: var(--text-muted)">{{ stat.label }}</p>
          <p class="text-lg font-black" style="color: var(--text-primary)">{{ stat.prefix || '' }}{{ stat.value.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <label class="label mb-0">Status</label>
        <SelectBox v-model="filters.status" :options="statusOptions" placeholder="All Status" size="sm" />
      </div>
      <div class="flex items-center gap-2">
        <label class="label mb-0">Vendor</label>
        <SelectBox v-model="filters.vendor" :options="vendorOptions" placeholder="All Vendors" size="sm" searchable />
      </div>
      <div class="flex-1 min-w-[180px] max-w-[260px]">
        <DatePicker
          v-model:from="filters.dateFrom"
          v-model:to="filters.dateTo"
          :presets="datePresets"
          range
          placeholder="Date range"
          display-format="MMM dd, yyyy"
        />
      </div>
      <button @click="applyFilters" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="resetFilters" class="btn-ghost text-xs">Reset</button>
      <button @click="exportPayouts" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5">
        <DownloadIcon class="w-4 h-4" />
        Export
      </button>
    </div>

    <!-- Payouts Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead>
            <tr>
              <th class="list-th">Vendor</th>
              <th class="list-th">Commission</th>
              <th class="list-th">Earned</th>
              <th class="list-th">Paid</th>
              <th class="list-th">Pending</th>
              <th class="list-th">Last Payout</th>
              <th class="list-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-16">
                <div class="flex flex-col items-center gap-3" style="color: var(--text-muted)">
                  <svg class="w-7 h-7 animate-spin" style="color: var(--color-primary)" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span class="text-sm">Loading payouts...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="!vendors.length">
              <td colspan="7" class="text-center py-16">
                <div class="flex flex-col items-center gap-2" style="color: var(--text-muted)">
                  <BanknotesIcon class="w-10 h-10" />
                  <p class="text-sm font-medium">No payout data found</p>
                  <p class="text-xs">Vendors will appear here once they have earnings</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="v in filteredVendors" :key="v.id" class="list-row"
              @click="$router.push(`/vendors/${v.id}`)">
              <td class="list-td">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    :style="{ backgroundColor: v.avatarColor || 'var(--color-primary)' }">
                    {{ (v.shop_name || v.name)?.charAt(0)?.toUpperCase() || 'V' }}
                  </div>
                  <div class="min-w-0">
                    <p class="list-name">{{ v.shop_name || v.name }}</p>
                    <p class="list-sub">{{ v.email }}</p>
                  </div>
                </div>
              </td>
              <td class="list-td">
                <span class="text-sm font-semibold" :style="{ color: 'var(--color-primary)' }">
                  {{ v.commission_rate || 0 }}%
                </span>
              </td>
              <td class="list-td">
                <p class="list-count">৳{{ (v.total_earned || 0).toLocaleString() }}</p>
              </td>
              <td class="list-td">
                <p class="list-count" style="color: var(--success)">৳{{ (v.total_paid || 0).toLocaleString() }}</p>
              </td>
              <td class="list-td">
                <div class="flex items-center gap-2">
                  <p class="list-count" :style="{ color: (v.pending_payout || 0) > 0 ? 'var(--warning)' : 'var(--text-muted)' }">
                    ৳{{ (v.pending_payout || 0).toLocaleString() }}
                  </p>
                  <span v-if="(v.pending_payout || 0) > 0"
                    class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
              </td>
              <td class="list-td">
                <p class="text-sm" style="color: var(--text-secondary)">
                  {{ v.last_payout_date ? formatDate(v.last_payout_date) : '—' }}
                </p>
                <p v-if="v.last_payout_amount" class="text-xs" style="color: var(--text-muted)">
                  ৳{{ v.last_payout_amount.toLocaleString() }}
                </p>
              </td>
              <td class="list-td text-right">
                <div class="flex items-center justify-end gap-1" @click.stop>
                  <button @click="openPayoutModal(v)"
                    class="list-action-btn" style="color: var(--color-primary)"
                    title="Pay now">
                    <BanknotesIcon class="w-4 h-4" />
                  </button>
                  <router-link :to="`/vendors/${v.id}`"
                    class="list-action-btn" title="View vendor">
                    <EyeIcon class="w-3.5 h-3.5" />
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination v-model:perPage="perPage" :pagination="pagination" @page="loadPage" />
    </div>

    <!-- ── Create Payout Modal ── -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showCreateModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
          @click.self="showCreateModal = false">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div class="relative w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden"
            style="background: var(--surface); border-color: var(--border); box-shadow: var(--shadow-modal);">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: var(--border-light)">
              <div>
                <h3 class="font-bold text-base" style="color: var(--text-primary)">Create Payout</h3>
                <p class="text-xs mt-0.5" style="color: var(--text-muted)">Process vendor payment</p>
              </div>
              <button @click="showCreateModal = false"
                class="p-1.5 rounded-lg transition" style="color: var(--text-muted)"
                @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
                @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
            <!-- Body -->
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="label">Vendor *</label>
                <SelectBox v-model="payoutForm.vendorId" :options="vendorSelectOptions" placeholder="Select vendor..." searchable />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Amount (৳) *</label>
                  <input v-model.number="payoutForm.amount" type="number" min="1" step="0.01" class="input" placeholder="0.00" />
                </div>
                <div>
                  <label class="label">Commission Rate</label>
                  <input :value="selectedVendorRate" disabled class="input bg-slate-50 text-slate-500" />
                </div>
              </div>
              <div>
                <label class="label">Payment Method</label>
                <SelectBox v-model="payoutForm.method" :options="paymentMethodOptions" placeholder="Select method..." />
              </div>
              <div v-if="selectedVendorBalance">
                <div class="flex items-center justify-between text-sm px-3 py-2 rounded-lg"
                  style="background-color: color-mix(in srgb, var(--color-primary) 8%, transparent)">
                  <span style="color: var(--text-secondary)">Available balance</span>
                  <span class="font-bold" style="color: var(--color-primary)">
                    ৳{{ selectedVendorBalance.toLocaleString() }}
                  </span>
                </div>
              </div>
              <div>
                <label class="label">Note (optional)</label>
                <textarea v-model="payoutForm.note" class="input" rows="2" placeholder="Payment note..."></textarea>
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 px-6 py-3 border-t"
              style="border-color: var(--border-light); background: color-mix(in srgb, var(--border-light) 50%, transparent)">
              <button @click="showCreateModal = false" class="btn-ghost text-sm">Cancel</button>
              <button @click="submitPayout" :disabled="submitting || !canSubmit"
                class="btn-primary text-sm">
                {{ submitting ? 'Processing...' : 'Process Payout' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ── Payout History Section ── -->
    <div class="card mt-6 overflow-hidden">
      <div class="px-5 py-4 border-b" style="border-color: var(--border-light)">
        <h3 class="font-bold text-sm" style="color: var(--text-primary)">
          <ClockIcon class="w-4 h-4 inline mr-1.5" style="color: var(--color-primary)" />
          Payout History
        </h3>
      </div>
      <div v-if="payoutHistory.length" class="divide-y" style="border-color: var(--border-light)">
        <div v-for="p in payoutHistory" :key="p.id"
          class="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50/50">
          <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            :style="{ backgroundColor: hexToRGBA(p.status === 'completed' ? '#10B981' : p.status === 'processing' ? '#3B82F6' : '#EF4444', 0.13) }">
            <component :is="p.status === 'completed' ? CheckCircleIcon : p.status === 'processing' ? ClockIcon : XCircleIcon"
              class="w-4 h-4"
              :style="{ color: p.status === 'completed' ? '#10B981' : p.status === 'processing' ? '#3B82F6' : '#EF4444' }" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold" style="color: var(--text-primary)">{{ p.vendor_name }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                :class="p.status === 'completed' ? 'bg-green-50 text-green-600' : p.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'">
                {{ p.status }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs mt-0.5" style="color: var(--text-muted)">
              <span>৳{{ p.amount.toLocaleString() }}</span>
              <span class="w-1 h-1 rounded-full" style="background-color: var(--border)"></span>
              <span>{{ p.payment_method }}</span>
              <span class="w-1 h-1 rounded-full" style="background-color: var(--border)"></span>
              <span>{{ formatDate(p.created_at) }}</span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <button v-if="p.status === 'processing'"
              @click="approvePayout(p.id)"
              class="text-xs font-semibold px-2.5 py-1 rounded-lg transition"
              style="color: var(--success)"
              @mouseenter="e => e.target.style.backgroundColor = 'color-mix(in srgb, var(--success) 10%, transparent)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              Approve
            </button>
            <button v-if="p.status === 'processing'"
              @click="rejectPayout(p.id)"
              class="text-xs font-semibold px-2.5 py-1 rounded-lg transition"
              style="color: var(--danger)"
              @mouseenter="e => e.target.style.backgroundColor = 'color-mix(in srgb, var(--danger) 10%, transparent)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              Reject
            </button>
          </div>
        </div>
      </div>
      <div v-else class="py-12 text-center text-sm" style="color: var(--text-muted)">
        <ClockIcon class="w-8 h-8 mx-auto mb-2" />
        No payout history yet
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import Pagination from '@/components/common/Pagination.vue'
import { vendorApi } from '@/api/vendor'
import { useCsvExport } from '@/composables/useCsvExport'
import { Download as DownloadIcon } from 'lucide-vue-next'
import {
  PlusIcon,
  BanknotesIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  XMarkIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const toast = useToast()
const { exportToCsv } = useCsvExport()

/* ─── State ─── */
const vendors = ref([])
const payoutHistory = ref([])
const loading = ref(true)
const submitting = ref(false)
const pagination = ref(null)
const currentPage = ref(1)
const perPage = ref(20)
const showCreateModal = ref(false)

const filters = ref({ status: '', vendor: '', dateFrom: '', dateTo: '' })
const payoutForm = ref({ vendorId: '', amount: null, method: '', note: '' })

/* ─── Mock Data ─── */
function generateMockData() {
  const vendorNames = [
    { shop: 'GreenLeaf Organics', owner: 'Sarah Johnson', email: 'sarah@greenleaf.com' },
    { shop: 'TechGadgets Inc', owner: 'Mike Chen', email: 'mike@techgadgets.com' },
    { shop: 'FashionHub BD', owner: 'Emily Davis', email: 'emily@fashionhub.com' },
    { shop: 'HomeEssentials', owner: 'David Rahman', email: 'david@homeessentials.com' },
    { shop: 'BookWorm Library', owner: 'Aisha Khan', email: 'aisha@bookworm.com' },
    { shop: 'SportZone', owner: 'Imran Hassan', email: 'imran@sportzone.com' },
    { shop: 'BeautyGlow', owner: 'Nina Patel', email: 'nina@beautyglow.com' },
    { shop: 'AutoParts Pro', owner: 'Carlos Mendez', email: 'carlos@autoparts.com' },
  ]
  const avatarColors = ['#2E7D32','#2563EB','#7C3AED','#D97706','#DC2626','#0891B2','#DB2777','#6366F1']
  const methods = ['bkash', 'nagad', 'bank_transfer', 'rocket']

  const vendorsData = vendorNames.map((v, i) => {
    const totalEarned = Math.floor(Math.random() * 500000) + 50000
    const totalPaid = Math.floor(totalEarned * (0.3 + Math.random() * 0.5))
    return {
      id: i + 1,
      name: v.owner,
      shop_name: v.shop,
      email: v.email,
      avatarColor: avatarColors[i],
      commission_rate: [5, 8, 10, 12, 15][Math.floor(Math.random() * 5)],
      total_earned: totalEarned,
      total_paid: totalPaid,
      pending_payout: totalEarned - totalPaid,
      last_payout_date: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString() : null,
      last_payout_amount: Math.floor(Math.random() * 50000) + 5000,
    }
  })

  const historyData = []
  for (let i = 1; i <= 30; i++) {
    const v = vendorsData[Math.floor(Math.random() * vendorsData.length)]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))
    const statuses = ['completed', 'completed', 'completed', 'processing', 'rejected']
    historyData.push({
      id: i,
      vendor_id: v.id,
      vendor_name: v.shop_name,
      amount: Math.floor(Math.random() * 80000) + 5000,
      payment_method: methods[Math.floor(Math.random() * methods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: date.toISOString(),
      note: '',
    })
  }
  historyData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return { vendorsData, historyData }
}

/* ─── Computed ─── */
const hexToRGBA = (hex, alpha) => {
  if (!hex) return `rgba(46, 125, 50, ${alpha})`
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return isNaN(r) ? `rgba(46, 125, 50, ${alpha})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const payoutStats = computed(() => {
  const totalEarned = vendors.value.reduce((s, v) => s + (v.total_earned || 0), 0)
  const totalPaid = vendors.value.reduce((s, v) => s + (v.total_paid || 0), 0)
  const totalPending = vendors.value.reduce((s, v) => s + (v.pending_payout || 0), 0)
  const vendorsWithBalance = vendors.value.filter(v => (v.pending_payout || 0) > 0).length
  return [
    { label: 'Total Earned', value: totalEarned, icon: CurrencyDollarIcon, color: '#2E7D32', prefix: '৳' },
    { label: 'Total Paid Out', value: totalPaid, icon: BanknotesIcon, color: '#10B981', prefix: '৳' },
    { label: 'Pending Payouts', value: totalPending, icon: ClockIcon, color: '#D97706', prefix: '৳' },
    { label: 'Vendors Due', value: vendorsWithBalance, icon: UsersIcon, color: '#3B82F6' },
  ]
})

const filteredVendors = computed(() => {
  let result = [...vendors.value]
  if (filters.value.status) {
    if (filters.value.status === 'due') result = result.filter(v => (v.pending_payout || 0) > 0)
    if (filters.value.status === 'paid') result = result.filter(v => (v.pending_payout || 0) === 0)
  }
  if (filters.value.vendor) {
    result = result.filter(v => v.id === Number(filters.value.vendor))
  }
  const total = result.length
  const lastPage = Math.ceil(total / perPage.value)
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  pagination.value = {
    current_page: currentPage.value,
    last_page: lastPage || 1,
    per_page: perPage.value,
    total,
    from: total ? start + 1 : 0,
    to: Math.min(end, total),
  }
  return result.slice(start, end)
})

const vendorOptions = computed(() => [
  { value: '', label: 'All Vendors' },
  ...vendors.value.map(v => ({ value: String(v.id), label: v.shop_name || v.name })),
])

const vendorSelectOptions = computed(() =>
  vendors.value.map(v => ({ value: String(v.id), label: `${v.shop_name || v.name} — ৳${(v.pending_payout || 0).toLocaleString()}` }))
)

const selectedVendorRate = computed(() => {
  const v = vendors.value.find(x => x.id === Number(payoutForm.value.vendorId))
  return v ? `${v.commission_rate || 0}%` : '—'
})

const selectedVendorBalance = computed(() => {
  const v = vendors.value.find(x => x.id === Number(payoutForm.value.vendorId))
  return v?.pending_payout || 0
})

const canSubmit = computed(() =>
  payoutForm.value.vendorId && payoutForm.value.amount > 0 && payoutForm.value.method
)

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'due', label: 'Payment Due' },
  { value: 'paid', label: 'Settled' },
]

const paymentMethodOptions = [
  { value: '', label: 'Select method...' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'rocket', label: 'Rocket' },
]

const datePresets = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'This Year', getRange: () => {
    const now = new Date()
    return { from: new Date(now.getFullYear(), 0, 1), to: now }
  }},
]

/* ─── Functions ─── */
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

function applyFilters() { currentPage.value = 1 }
function resetFilters() {
  filters.value = { status: '', vendor: '', dateFrom: '', dateTo: '' }
  currentPage.value = 1
}
function loadPage(page) { currentPage.value = page }

function openPayoutModal(vendor) {
  payoutForm.value = { vendorId: String(vendor.id), amount: vendor.pending_payout || 0, method: '', note: '' }
  showCreateModal.value = true
}

async function submitPayout() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const payload = {
      vendor_id: Number(payoutForm.value.vendorId),
      amount: payoutForm.value.amount,
      payment_method: payoutForm.value.method,
      note: payoutForm.value.note,
    }
    await vendorApi.payoutCreate(payload)
    toast.success('Payout created successfully!')
    showCreateModal.value = false
    // Update the vendor's paid/pending balance
    const v = vendors.value.find(x => x.id === Number(payoutForm.value.vendorId))
    if (v) {
      v.total_paid = (v.total_paid || 0) + payoutForm.value.amount
      v.pending_payout = Math.max(0, (v.pending_payout || 0) - payoutForm.value.amount)
    }
    // Add to history
    payoutHistory.value.unshift({
      id: Date.now(),
      vendor_name: v?.shop_name || 'Vendor',
      amount: payoutForm.value.amount,
      payment_method: payoutForm.value.method,
      status: 'processing',
      created_at: new Date().toISOString(),
    })
  } catch {
    toast.error('Failed to create payout.')
  } finally {
    submitting.value = false
  }
}

async function approvePayout(id) {
  try {
    await vendorApi.payoutApprove(id)
    const p = payoutHistory.value.find(x => x.id === id)
    if (p) p.status = 'completed'
    toast.success('Payout approved')
  } catch {
    toast.error('Failed to approve payout')
  }
}

async function rejectPayout(id) {
  try {
    await vendorApi.payoutReject(id, '')
    const p = payoutHistory.value.find(x => x.id === id)
    if (p) p.status = 'rejected'
    toast.success('Payout rejected')
  } catch {
    toast.error('Failed to reject payout')
  }
}

function exportPayouts() {
  const cols = [
    { key: 'shop_name', label: 'Vendor' },
    { key: 'name', label: 'Owner' },
    { key: 'commission_rate', label: 'Commission %', transform: v => `${v || 0}%` },
    { key: 'total_earned', label: 'Total Earned', transform: v => `৳${(v || 0).toLocaleString()}` },
    { key: 'total_paid', label: 'Total Paid', transform: v => `৳${(v || 0).toLocaleString()}` },
    { key: 'pending_payout', label: 'Pending', transform: v => `৳${(v || 0).toLocaleString()}` },
  ]
  exportToCsv(filteredVendors.value, cols, `vendor-payouts-${vendors.value.length}-vendors`)
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await vendorApi.payouts({ per_page: 100 })
    const data = res.data.data || []
    if (data.length) {
      vendors.value = data
    } else {
      const mock = generateMockData()
      vendors.value = mock.vendorsData
      payoutHistory.value = mock.historyData
    }
  } catch {
    const mock = generateMockData()
    vendors.value = mock.vendorsData
    payoutHistory.value = mock.historyData
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.list-th {
  padding: 10px 12px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: left;
  white-space: nowrap;
  color: var(--text-muted);
  background-color: color-mix(in srgb, var(--border-light) 80%, transparent);
  border-bottom: 1px solid var(--border);
}

.list-td {
  padding: 12px;
  font-size: 0.8125rem;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-light);
}

.list-row {
  transition: background-color 0.12s ease;
  cursor: pointer;
}

.list-row:hover {
  background-color: color-mix(in srgb, var(--border-light) 60%, transparent);
}

.list-row:last-child .list-td {
  border-bottom: none;
}

.list-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.8125rem;
  margin: 0;
  line-height: 1.3;
}

.list-sub {
  color: var(--text-muted);
  font-size: 0.6875rem;
  margin: 0;
  line-height: 1.3;
}

.list-count {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.8125rem;
}

.list-action-btn {
  padding: 6px;
  border-radius: 8px;
  color: var(--navbar-text);
  transition: all 0.12s ease;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.list-action-btn:hover {
  background-color: var(--border-light);
}

.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}

/* Modal transitions */
.modal-fade-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-leave-active {
  transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from > div:last-child {
  transform: scale(0.95) translateY(8px);
}
</style>
