<template>
  <div class="animate-in">
    <PageHeader title="Activity Log" subtitle="Track all admin actions across the platform" />

    <!-- Filters -->
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <label class="label mb-0">Action</label>
        <SelectBox v-model="filters.action" :options="actionOptions" placeholder="All Actions" size="sm" />
      </div>
      <div class="flex items-center gap-2">
        <label class="label mb-0">Admin</label>
        <SelectBox v-model="filters.admin" :options="adminOptions" placeholder="All Admins" size="sm" />
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
      <button @click="exportCSV" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5">
        <DownloadIcon class="w-4 h-4" />
        Export CSV
      </button>
    </div>

    <!-- Activity Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div v-for="stat in activityStats" :key="stat.label" class="card p-3 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
          :style="{ backgroundColor: hexToRGBA(stat.color, 0.15) }">
          <component :is="stat.icon" class="w-4 h-4" :style="{ color: stat.color }" />
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-wide" style="color: var(--text-muted)">{{ stat.label }}</p>
          <p class="text-sm font-bold" style="color: var(--text-primary)">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="card overflow-hidden">
      <div class="divide-y" style="border-color: var(--border-light)">
        <div v-for="(entry, i) in filteredLogs" :key="entry.id"
          class="flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50/50"
        >
          <!-- Icon -->
          <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :style="{ backgroundColor: hexToRGBA(actionColor(entry.action), 0.15) }"
          >
            <component :is="actionIcon(entry.action)" class="w-4 h-4" :style="{ color: actionColor(entry.action) }" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold uppercase tracking-wider" :style="{ color: actionColor(entry.action) }">
                {{ entry.action }}
              </span>
              <span class="text-xs" style="color: var(--text-muted)">•</span>
              <span class="text-sm font-semibold" style="color: var(--text-primary)">{{ entry.admin }}</span>
            </div>
            <p class="text-sm mt-0.5" style="color: var(--text-secondary)">
              {{ entry.description }}
            </p>
            <div class="flex items-center gap-3 mt-1.5">
              <span class="text-xs" style="color: var(--text-muted)">{{ formatTime(entry.created_at) }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                :class="entry.important ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'"
              >
                {{ entry.important ? 'Important' : 'Normal' }}
              </span>
            </div>
          </div>

          <!-- IP & Meta -->
          <div class="hidden sm:block text-right shrink-0">
            <p class="text-[11px] font-mono" style="color: var(--text-muted)">{{ entry.ip }}</p>
            <p class="text-[10px]" style="color: var(--text-muted)">{{ entry.browser }}</p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!filteredLogs.length" class="py-16 text-center">
        <div class="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style="background-color: color-mix(in srgb, var(--text-muted) 10%, transparent)">
          <ClipboardDocumentListIcon class="w-7 h-7" style="color: var(--text-muted)" />
        </div>
        <p class="text-sm font-medium" style="color: var(--text-primary)">No activity found</p>
        <p class="text-xs mt-1" style="color: var(--text-muted)">Try adjusting your filters</p>
      </div>

      <!-- Pagination -->
      <Pagination v-model:perPage="perPage" :pagination="pagination" @page="loadPage" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@ecom/ui/components/PageHeader.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import DatePicker from '@ecom/ui/components/DatePicker.vue'
import Pagination from '@ecom/ui/components/Pagination.vue'
import {
  ClipboardDocumentListIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  KeyIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { Download as DownloadIcon } from 'lucide-vue-next'
import { useToast } from 'vue-toastification'

const toast = useToast()

/* ─── Filters ─── */
const filters = ref({ action: '', admin: '', dateFrom: '', dateTo: '' })
const perPage = ref(25)
const currentPage = ref(1)

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login / Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'approve', label: 'Approve / Reject' },
  { value: 'payment', label: 'Payment' },
  { value: 'settings', label: 'Settings Change' },
  { value: 'security', label: 'Security' },
]

const adminOptions = [
  { value: '', label: 'All Admins' },
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Sarah Chen', label: 'Sarah Chen' },
  { value: 'Mike Johnson', label: 'Mike Johnson' },
  { value: 'Emily Davis', label: 'Emily Davis' },
]

const datePresets = [
  { label: 'Today', days: 1 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
]

/* ─── Mock Activity Data ─── */
const allLogs = ref([])
const pagination = ref(null)

function hexToRGBA(hex, alpha) {
  if (!hex) return `rgba(46, 125, 50, ${alpha})`
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return isNaN(r) ? `rgba(46, 125, 50, ${alpha})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function actionIcon(action) {
  const icons = {
    login: ArrowPathIcon,
    create: UserPlusIcon,
    update: PencilIcon,
    delete: TrashIcon,
    approve: CheckCircleIcon,
    reject: XCircleIcon,
    payment: BanknotesIcon,
    settings: DocumentTextIcon,
    security: ShieldCheckIcon,
    export: ArrowPathIcon,
  }
  return icons[action] || ClipboardDocumentListIcon
}

function actionColor(action) {
  const colors = {
    login: '#3B82F6',
    create: '#2E7D32',
    update: '#D97706',
    delete: '#DC2626',
    approve: '#10B981',
    reject: '#EF4444',
    payment: '#7C3AED',
    settings: '#64748B',
    security: '#6366F1',
    export: '#0891B2',
  }
  return colors[action] || '#94A3B8'
}

function generateMockData() {
  const admins = ['Super Admin', 'Sarah Chen', 'Mike Johnson', 'Emily Davis']
  const actions = ['login', 'create', 'update', 'delete', 'approve', 'reject', 'payment', 'settings', 'security', 'export']
  const descriptions = {
    login: ['Logged in from admin panel', 'Logged out', 'Failed login attempt detected', 'Session expired, re-authenticated'],
    create: ['Created new product "Wireless Headphones Pro"', 'Added new vendor "GreenLeaf Organics"', 'Created coupon code "SUMMER25"', 'Registered new admin user', 'Created new category "Smart Home"'],
    update: ['Updated product price for item #1284', 'Modified vendor commission rate', 'Changed order status to shipped', 'Updated site logo and branding', 'Modified shipping zone rates'],
    delete: ['Deleted review #4521', 'Removed inactive vendor account', 'Deleted expired coupon "OLD20"', 'Removed outdated banner image'],
    approve: ['Approved vendor application "TechGadgets Inc"', 'Approved product #3821 for listing', 'Rejected product "Dubious Supplement" for policy violation', 'Approved shop design update'],
    payment: ['Processed vendor payout ৳125,000', 'Payment gateway configured', 'Refund processed for order #ORD-4521', 'Commission payout batch completed'],
    settings: ['Updated general store settings', 'Changed tax configuration', 'Modified email SMTP settings', 'Updated SEO meta data', 'Changed theme from Default to Indigo'],
    security: ['Two-factor authentication enabled', 'Password changed', 'API key regenerated', 'IP whitelist updated', 'Permissions modified for role "Manager"'],
    export: ['Exported product catalog (45 items)', 'Exported order report for March 2026', 'Downloaded customer list CSV'],
  }
  const ips = ['192.168.1.100', '10.0.0.45', '172.16.0.88', '203.0.113.42', '198.51.100.17']
  const browsers = ['Chrome 126 / Win', 'Firefox 128 / macOS', 'Safari 17 / iOS', 'Edge 126 / Win', 'Chrome 125 / Linux']

  const logs = []
  for (let i = 1; i <= 200; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const descs = descriptions[action]
    const date = new Date()
    date.setHours(date.getHours() - Math.floor(Math.random() * 720))
    date.setMinutes(Math.floor(Math.random() * 60))

    logs.push({
      id: i,
      action,
      admin: admins[Math.floor(Math.random() * admins.length)],
      description: descs[Math.floor(Math.random() * descs.length)],
      created_at: date.toISOString(),
      ip: ips[Math.floor(Math.random() * ips.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      important: Math.random() < 0.15,
    })
  }
  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return logs
}

/* ─── Activity Stats ─── */
const activityStats = computed(() => [
  { label: 'Total Actions', value: allLogs.value.length, icon: ClipboardDocumentListIcon, color: '#2E7D32' },
  { label: 'Today', value: allLogs.value.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, icon: ArrowPathIcon, color: '#3B82F6' },
  { label: 'Important', value: allLogs.value.filter(l => l.important).length, icon: ShieldCheckIcon, color: '#DC2626' },
  { label: 'Modifications', value: allLogs.value.filter(l => ['create', 'update', 'delete'].includes(l.action)).length, icon: PencilIcon, color: '#D97706' },
])

/* ─── Filtering & Pagination ─── */
const filteredLogs = computed(() => {
  let result = [...allLogs.value]

  if (filters.value.action) {
    result = result.filter(l => l.action === filters.value.action)
  }
  if (filters.value.admin) {
    result = result.filter(l => l.admin === filters.value.admin)
  }
  if (filters.value.dateFrom) {
    const from = new Date(filters.value.dateFrom)
    result = result.filter(l => new Date(l.created_at) >= from)
  }
  if (filters.value.dateTo) {
    const to = new Date(filters.value.dateTo)
    to.setHours(23, 59, 59, 999)
    result = result.filter(l => new Date(l.created_at) <= to)
  }

  // Update pagination
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

function applyFilters() {
  currentPage.value = 1
}

function resetFilters() {
  filters.value = { action: '', admin: '', dateFrom: '', dateTo: '' }
  currentPage.value = 1
}

function loadPage(page) {
  currentPage.value = page
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStrFormatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (diffMins < 1) return `${dateStrFormatted}, ${timeStr} (just now)`
  if (diffMins < 60) return `${dateStrFormatted}, ${timeStr} (${diffMins}m ago)`
  if (diffHours < 24) return `${dateStrFormatted}, ${timeStr} (${diffHours}h ago)`
  if (diffDays < 7) return `${dateStrFormatted}, ${timeStr} (${diffDays}d ago)`
  return `${dateStrFormatted}, ${timeStr}`
}

function exportCSV() {
  const headers = ['Action', 'Admin', 'Description', 'Date', 'IP Address', 'Browser', 'Important']
  const rows = allLogs.value.map(l => [
    l.action,
    l.admin,
    `"${l.description.replace(/"/g, '""')}"`,
    new Date(l.created_at).toLocaleString(),
    l.ip,
    l.browser,
    l.important ? 'Yes' : 'No',
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Activity log exported!')
}

onMounted(() => {
  allLogs.value = generateMockData()
})
</script>

<style scoped>
.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}
</style>
