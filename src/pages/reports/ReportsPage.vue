<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Date Range Filter -->
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-4">
      <DatePicker
        v-model:from="filters.from"
        v-model:to="filters.to"
        :presets="presets"
        range
        placeholder="Date"
        display-format="MMM dd, yyyy"
      />
      <div class="flex items-center gap-2">
        <label class="label mb-0">Period</label>
        <SelectBox
          v-model="filters.period"
          :options="periodOptions"
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

    <!-- Summary stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      <!-- Total Revenue -->
      <div class="stat-card">
        <div class="report-stat-icon report-icon-revenue">
          <DollarSign class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Total Revenue</p>
          <p class="report-stat-value">৳{{ totalRevenue.toLocaleString() }}</p>
        </div>
      </div>

      <!-- Total Orders -->
      <div class="stat-card">
        <div class="report-stat-icon report-icon-orders">
          <Package class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Total Orders</p>
          <p class="report-stat-value">{{ totalOrders.toLocaleString() }}</p>
        </div>
      </div>

      <!-- Avg Order Value -->
      <div class="stat-card">
        <div class="report-stat-icon report-icon-avg">
          <CreditCard class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Avg Order Value</p>
          <p class="report-stat-value">৳{{ avgOrderValue.toLocaleString() }}</p>
        </div>
      </div>

      <!-- New Customers -->
      <div class="stat-card">
        <div class="report-stat-icon report-icon-customers">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">New Customers</p>
          <p class="report-stat-value">{{ totalNewCustomers }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Revenue Chart -->
      <div class="card p-5">
        <h3 class="report-chart-title mb-4">Revenue Over Time</h3>
        <div class="h-64"><canvas ref="revenueRef" /></div>
      </div>
      <!-- Customer Growth -->
      <div class="card p-5">
        <h3 class="report-chart-title mb-4">Customer Growth</h3>
        <div class="h-64"><canvas ref="customerRef" /></div>
      </div>
    </div>

    <!-- Top Products Table -->
    <div class="card overflow-hidden">
      <div class="p-4 border-b report-border">
        <h3 class="report-section-title">Top Selling Products</h3>
      </div>
      <table class="w-full">
        <thead class="report-thead">
          <tr>
            <th class="table-header">#</th>
            <th class="table-header">Product</th>
            <th class="table-header">Units Sold</th>
            <th class="table-header">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loadingTop">
            <td colspan="4" class="text-center py-8 report-muted text-sm">Loading...</td>
          </tr>
          <tr v-else v-for="(p, i) in topProducts" :key="p.product_id" class="table-row">
            <td class="table-cell w-12 text-center font-bold report-muted text-sm">{{ i + 1 }}</td>
            <td class="table-cell font-semibold report-primary text-sm">{{ p.product_name }}</td>
            <td class="table-cell text-sm report-secondary">{{ p.total_sold }}</td>
            <td class="table-cell font-bold report-amount">৳{{ Number(p.total_revenue).toLocaleString() }}</td>
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
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { reportApi } from '@/api'
import { useThemeStore } from '@/stores/theme'
import { DollarSign, Package, CreditCard, Users, Printer } from 'lucide-vue-next'
import { ChartBarSquareIcon } from '@heroicons/vue/24/outline'
Chart.register(...registerables)

const themeStore = useThemeStore()
const filters = ref({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10), period: 'daily' })
const salesData = ref([]), customerData = ref([]), topProducts = ref([]), loadingTop = ref(true)
const revenueRef = ref(null), customerRef = ref(null)
let revChart = null, custChart = null

const totalRevenue = computed(() => Math.round(salesData.value.reduce((s, d) => s + parseFloat(d.revenue || 0), 0)))
const totalOrders = computed(() => salesData.value.reduce((s, d) => s + parseInt(d.total_orders || 0), 0))
const avgOrderValue = computed(() => totalOrders.value > 0 ? Math.round(totalRevenue.value / totalOrders.value) : 0)
const totalNewCustomers = computed(() => customerData.value.reduce((s, d) => s + parseInt(d.new_customers || 0), 0))

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
  return isNaN(r) ? `rgba(46, 125, 50, ${alpha})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function printReport() {
  window.print()
}

const periodOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const breadcrumbItems = computed(() => [
    { label: 'Reports & Analytics', icon: ChartBarSquareIcon }
])

const presets = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'This Year', getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

function buildChart(canvasRef, labels, data, label, color, chartRef) {
  if (chartRef) chartRef.destroy()
  if (!canvasRef) return null
  const gridColor = getCSSVar('--border-light') || '#F3F4F6'
  const tickColor = getCSSVar('--text-muted') || '#94A3B8'
  return new Chart(canvasRef, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label, data,
        backgroundColor: hexToRGBA(color, 0.2),
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 10, color: tickColor } },
        y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, color: tickColor } }
      }
    }
  })
}

async function loadAll() {
  const primary = getCSSVar('--color-primary') || '#2E7D32'
  const info = getCSSVar('--info') || '#3B82F6'

  const [salesRes, custRes, topRes] = await Promise.allSettled([
    reportApi.sales(filters.value),
    reportApi.customerGrowth(),
    reportApi.topProducts({ from: filters.value.from, to: filters.value.to, limit: 10 }),
  ])
  if (salesRes.status === 'fulfilled') {
    salesData.value = salesRes.value.data.data || []
    revChart = buildChart(revenueRef.value, salesData.value.map(d => d.date), salesData.value.map(d => d.revenue), 'Revenue', primary, revChart)
  }
  if (custRes.status === 'fulfilled') {
    customerData.value = custRes.value.data.data || []
    custChart = buildChart(customerRef.value, customerData.value.map(d => d.month), customerData.value.map(d => d.new_customers), 'New Customers', info, custChart)
  }
  if (topRes.status === 'fulfilled') { topProducts.value = topRes.value.data.data || []; loadingTop.value = false }
}

/* ─── Rebuild charts on theme change ─── */
watch(() => themeStore.colorTheme, () => {
  loadAll()
})

onMounted(loadAll)

onUnmounted(() => {
  if (revChart) revChart.destroy()
  if (custChart) custChart.destroy()
})
</script>

<style scoped>
/* ─── Stat Card Icons ─── */
.report-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.report-icon-revenue {
  background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.report-icon-orders {
  background-color: color-mix(in srgb, var(--info) 15%, transparent);
  color: var(--info);
}

.report-icon-avg {
  background-color: color-mix(in srgb, #8B5CF6 15%, transparent);
  color: #8B5CF6;
}

.report-icon-customers {
  background-color: color-mix(in srgb, var(--warning) 15%, transparent);
  color: var(--warning);
}

/* ─── Stat Values ─── */
.report-stat-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
}

/* ─── Chart / Section Titles ─── */
.report-chart-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.9375rem;
}

.report-section-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.9375rem;
}

.report-border {
  border-color: var(--border-light);
}

/* ─── Table ─── */
.report-thead {
  background-color: var(--border-light);
}

.report-muted {
  color: var(--text-muted);
}

.report-primary {
  color: var(--text-primary);
}

.report-secondary {
  color: var(--text-secondary);
}

.report-amount {
  color: var(--color-primary);
}
</style>