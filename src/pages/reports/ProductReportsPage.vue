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
        placeholder="Date range"
        display-format="MMM dd, yyyy"
      />
      <div class="flex items-center gap-2">
        <label class="label mb-0">Product</label>
        <SelectBox
          v-model="filters.product_id"
          :options="productOptions"
          size="sm"
          searchable
          placeholder="All Products"
          @change="loadAll"
          @search="onProductSearch"
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
        <div class="pr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }">
          <ShoppingBag class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Total Products</p>
          <p class="pr-stat-value">{{ totalProducts.toLocaleString() }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="pr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, var(--info) 15%, transparent)', color: 'var(--info)' }">
          <Package class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Units Sold</p>
          <p class="pr-stat-value">{{ totalUnitsSold.toLocaleString() }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="pr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)' }">
          <DollarSign class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Total Revenue</p>
          <p class="pr-stat-value">৳{{ totalRevenue.toLocaleString() }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="pr-stat-icon" :style="{ backgroundColor: 'color-mix(in srgb, #8B5CF6 15%, transparent)', color: '#8B5CF6' }">
          <TrendingUp class="w-5 h-5" />
        </div>
        <div>
          <p class="label mb-0">Avg Price</p>
          <p class="pr-stat-value">৳{{ avgPrice.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-5">
        <h3 class="pr-chart-title mb-4">Sales Over Time</h3>
        <div class="h-64"><canvas ref="salesChartRef" /></div>
      </div>
      <div class="card p-5">
        <h3 class="pr-chart-title mb-4">Top Products by Revenue</h3>
        <div class="h-64"><canvas ref="topChartRef" /></div>
      </div>
    </div>

    <!-- Top Selling Products Table -->
    <div class="card overflow-hidden">
      <div class="p-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
        <h3 class="pr-section-title">Top Selling Products</h3>
      </div>
      <table class="w-full">
        <thead :style="{ backgroundColor: 'var(--border-light)' }">
          <tr>
            <th class="table-header">#</th>
            <th class="table-header">Product</th>
            <th class="table-header">Category</th>
            <th class="table-header">Units Sold</th>
            <th class="table-header">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loadingTop">
            <td colspan="5" class="text-center py-8" :style="{ color: 'var(--text-muted)' }">
              <span class="text-sm">Loading...</span>
            </td>
          </tr>
          <tr v-else v-for="(p, i) in topProducts" :key="p.product_id || i" class="table-row">
            <td class="table-cell w-12 text-center font-bold" :style="{ color: 'var(--text-muted)' }">{{ i + 1 }}</td>
            <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">{{ p.product_name }}</td>
            <td class="table-cell">{{ p.category_name || '—' }}</td>
            <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">{{ p.total_sold || 0 }}</td>
            <td class="table-cell font-bold" :style="{ color: 'var(--color-primary)' }">৳{{ Number(p.total_revenue || 0).toLocaleString() }}</td>
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
import DatePicker from '@/components/common/DatePicker.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { reportApi, productApi } from '@/api'
import { useThemeStore } from '@/stores/theme'
import { ShoppingBag, Package, DollarSign, TrendingUp, Printer } from 'lucide-vue-next'
import { ChartBarSquareIcon } from '@heroicons/vue/24/outline'

Chart.register(...registerables)

const themeStore = useThemeStore()

const filters = ref({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  groupBy: 'daily',
  product_id: '',
})

const products = ref([])
const topProducts = ref([])
const loadingTop = ref(true)
const salesChartRef = ref(null)
const topChartRef = ref(null)
let salesChart = null
let topChart = null

const productOptions = computed(() => [
  { value: '', label: 'All Products' },
  ...products.value.map(p => ({
    value: p.id,
    label: p.name || `Product #${p.id}`,
  })),
])

const groupOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const breadcrumbItems = computed(() => [
    { label: 'Product Reports', icon: ChartBarSquareIcon }
])

const presets = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'This Year', getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

const totalProducts = computed(() => topProducts.value.length)
const totalUnitsSold = computed(() => topProducts.value.reduce((s, p) => s + parseInt(p.total_sold || 0), 0))
const totalRevenue = computed(() => Math.round(topProducts.value.reduce((s, p) => s + parseFloat(p.total_revenue || 0), 0)))
const avgPrice = computed(() => totalUnitsSold.value > 0 ? Math.round(totalRevenue.value / totalUnitsSold.value) : 0)

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

function printReport() {
  window.print()
}

async function loadProducts() {
  try {
    const res = await productApi.list({ per_page: 100 })
    products.value = res.data.data || []
  } catch {
    products.value = []
  }
}

let searchTimeout = null
async function onProductSearch(query) {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    try {
      const params = { per_page: 100 }
      if (query.trim()) params.search = query.trim()
      const res = await productApi.list(params)
      products.value = res.data.data || []
    } catch {
      // silently handle
    }
  }, 300)
}

async function loadAll() {
  const primary = getCSSVar('--color-primary') || '#2E7D32'
  const info = getCSSVar('--info') || '#3B82F6'

  loadingTop.value = true

  const params = { from: filters.value.from, to: filters.value.to, limit: 20 }
  if (filters.value.product_id) params.product_id = filters.value.product_id

  const [topRes] = await Promise.allSettled([
    reportApi.topProducts(params),
  ])

  if (topRes.status === 'fulfilled') {
    topProducts.value = topRes.value.data.data || []
  }
  loadingTop.value = false

  const labels = topProducts.value.map(p => p.product_name?.substring(0, 14) || `#${p.product_id}`)

  topChart = buildChart(
    topChartRef.value,
    labels,
    [{
      label: 'Revenue',
      data: topProducts.value.map(p => parseFloat(p.total_revenue || 0)),
      backgroundColor: hexToRGBA(primary, 0.2),
      borderColor: primary,
      borderWidth: 2,
      borderRadius: 4,
    }],
    topChart,
  )

  salesChart = buildChart(
    salesChartRef.value,
    labels,
    [{
      label: 'Units Sold',
      data: topProducts.value.map(p => parseInt(p.total_sold || 0)),
      backgroundColor: hexToRGBA(info, 0.2),
      borderColor: info,
      borderWidth: 2,
      borderRadius: 4,
    }],
    salesChart,
  )
}

watch(() => themeStore.colorTheme, () => loadAll())

onMounted(() => {
  loadProducts()
  loadAll()
})

onUnmounted(() => {
  if (salesChart) salesChart.destroy()
  if (topChart) topChart.destroy()
})
</script>

<style scoped>
.pr-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.pr-stat-value {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
}

.pr-chart-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.9375rem;
}

.pr-section-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.9375rem;
}
</style>
