<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />

    <!-- Date Range Filter -->
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-4">
      <DatePicker
        v-model:from="filters.from"
        v-model:to="filters.to"
        :presets="presets"
        range
        placeholder="Date range"
        display-format="MMM dd, yyyy"
      />
      <div class="flex items-center gap-2">
        <label class="label mb-0">Customer</label>
        <SelectBox
          v-model="filters.customer_id"
          :options="customerOptions"
          size="sm"
          searchable
          placeholder="All Customers"
          @change="loadAll"
          @search="onCustomerSearch"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="label mb-0">Group By</label>
        <SelectBox
          v-model="filters.groupBy"
          :options="groupOptions"
          size="sm"
          @change="loadAll"
        />
      </div>
      <button @click="loadAll" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="printReport" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5">
        <Printer class="w-4 h-4" />
        <span>Print Report</span>
      </button>
    </div>

    <!-- Summary Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="cr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Total Customers</p>
          <p class="cr-stat-value">{{ totalCustomers.toLocaleString() }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="cr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, var(--info) 15%, transparent)', color: 'var(--info)' }">
          <UserPlus class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">New Customers</p>
          <p class="cr-stat-value">{{ newCustomers.toLocaleString() }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="cr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)' }">
          <ShoppingBag class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Total Orders</p>
          <p class="cr-stat-value">{{ totalOrders.toLocaleString() }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="cr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, #8B5CF6 15%, transparent)', color: '#8B5CF6' }">
          <TrendingUp class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Avg Orders/Customer</p>
          <p class="cr-stat-value">{{ avgOrdersPerCustomer }}</p>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-5">
        <h3 class="cr-chart-title mb-4">New Customers Over Time</h3>
        <div class="h-64"><canvas ref="growthChartRef" /></div>
      </div>
      <div class="card p-5">
        <h3 class="cr-chart-title mb-4">Customer Growth Trend</h3>
        <div class="h-64"><canvas ref="totalChartRef" /></div>
      </div>
    </div>

    <!-- Growth Data Table -->
    <div class="card overflow-hidden">
      <div class="p-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
        <h3 class="cr-section-title">Customer Growth Breakdown</h3>
      </div>
      <table class="w-full">
        <thead :style="{ backgroundColor: 'var(--border-light)' }">
          <tr>
            <th class="table-header">Period</th>
            <th class="table-header">New Customers</th>
            <th class="table-header">Total Customers</th>
            <th class="table-header">Total Orders</th>
            <th class="table-header">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!growthData.length">
            <td colspan="5" class="text-center py-8" :style="{ color: 'var(--text-muted)' }">
              <span class="text-sm">No data available</span>
            </td>
          </tr>
          <tr v-else v-for="(d, i) in growthData" :key="i" class="table-row">
            <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">{{ d.month || d.date }}</td>
            <td class="table-cell">
              <span class="badge badge-green">{{ d.new_customers || 0 }}</span>
            </td>
            <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">{{ d.total_customers || 0 }}</td>
            <td class="table-cell" :style="{ color: 'var(--text-secondary)' }">{{ d.total_orders || 0 }}</td>
            <td class="table-cell font-bold" :style="{ color: 'var(--color-primary)' }">৳{{ Number(d.total_revenue || 0).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { startOfYear } from 'date-fns'
import { Chart, registerables } from 'chart.js'
import DatePicker from '@ecom/ui/components/DatePicker.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { reportApi, userApi } from '@/api'
import { useThemeStore } from '@/stores/theme'
import { Users, UserPlus, ShoppingBag, TrendingUp, Printer } from 'lucide-vue-next'
import { ChartBarSquareIcon } from '@heroicons/vue/24/outline'

Chart.register(...registerables)

const themeStore = useThemeStore()

const filters = ref({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  groupBy: 'monthly',
  customer_id: '',
})

const customers = ref([])
const growthData = ref([])
const growthChartRef = ref(null)
const totalChartRef = ref(null)
let growthChart = null
let totalChart = null

const customerOptions = computed(() => [
  { value: '', label: 'All Customers' },
  ...customers.value.map(c => ({
    value: c.id,
    label: c.name || c.email || `Customer #${c.id}`,
  })),
])

const groupOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const breadcrumbItems = computed(() => [
    { label: 'Customer Reports', icon: ChartBarSquareIcon }
])

const presets = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'This Year', getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

const totalCustomers = computed(() => growthData.value.reduce((s, d) => s + parseInt(d.total_customers || 0), 0))
const newCustomers = computed(() => growthData.value.reduce((s, d) => s + parseInt(d.new_customers || 0), 0))
const totalOrders = computed(() => growthData.value.reduce((s, d) => s + parseInt(d.total_orders || 0), 0))
const avgOrdersPerCustomer = computed(() => {
  const total = totalCustomers.value
  return total > 0 ? (totalOrders.value / total).toFixed(2) : '0.00'
})

/* ─── CSS variable helpers ─── */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function hexToRGBA(hex, alpha) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return isNaN(r) ? `rgba(99, 102, 241, ${alpha})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function buildChart(canvasRef, labels, datasets, chartRef) {
  if (chartRef) chartRef.destroy()
  if (!canvasRef) return null
  const gridColor = getCSSVar('--border-light') || '#F3F4F6'
  const tickColor = getCSSVar('--text-muted') || '#94A3B8'
  return new Chart(canvasRef, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { boxWidth: 10, padding: 12, font: { size: 10 }, color: tickColor },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 10, color: tickColor } },
        y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, color: tickColor } },
      },
    },
  })
}

async function loadCustomers() {
  try {
    const res = await userApi.list({ per_page: 100 })
    customers.value = res.data.data || []
  } catch {
    customers.value = []
  }
}

let searchTimeout = null
async function onCustomerSearch(query) {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const params = { per_page: 100 }
      if (query.trim()) params.search = query.trim()
      const res = await userApi.list(params)
      customers.value = res.data.data || []
    } catch {
      // silently handle
    }
  }, 300)
}

function printReport() {
  window.print()
}

async function loadAll() {
  const primary = getCSSVar('--color-primary') || '#2E7D32'
  const info = getCSSVar('--info') || '#3B82F6'

  const params = { ...filters.value }
  if (!params.customer_id) delete params.customer_id
  const res = await reportApi.customerGrowth(params)
  growthData.value = res.data.data || []

  const labels = growthData.value.map(d => d.month || d.date)

  growthChart = buildChart(
    growthChartRef.value,
    labels,
    [
      {
        label: 'New Customers',
        data: growthData.value.map(d => d.new_customers || 0),
        backgroundColor: hexToRGBA(primary, 0.2),
        borderColor: primary,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
    growthChart,
  )

  totalChart = buildChart(
    totalChartRef.value,
    labels,
    [
      {
        label: 'Total Customers',
        data: growthData.value.map(d => d.total_customers || 0),
        backgroundColor: hexToRGBA(info, 0.2),
        borderColor: info,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
    totalChart,
  )
}

watch(() => themeStore.colorTheme, () => loadAll())

onMounted(() => {
  loadCustomers()
  loadAll()
})
onUnmounted(() => {
  if (growthChart) growthChart.destroy()
  if (totalChart) totalChart.destroy()
})
</script>

<style scoped>
.cr-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.cr-stat-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
}

.cr-chart-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.9375rem;
}

.cr-section-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.9375rem;
}
</style>
