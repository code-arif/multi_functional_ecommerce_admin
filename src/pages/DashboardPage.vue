<template>
  <div class="space-y-6">
    <!--    <PageHeader title="Dashboard" :subtitle="`Welcome back, ${auth.userName}! Here's what's happening.`"/>-->
    <PageHeader title="Dashboard" :subtitle="`Here's what's happening.`" :userName="auth.userName"/>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Today's Revenue" :value="stats.today_sales" :icon="DollarSign" prefix="৳" :variant="0"/>
      <StatCard label="Monthly Revenue" :value="stats.monthly_sales" :icon="ChartBar" prefix="৳" :variant="1"/>
      <StatCard label="Total Orders" :value="stats.total_orders" :icon="ShoppingCart" :variant="2"/>
      <StatCard label="Pending Orders" :value="stats.pending_orders" :icon="Clock" :variant="3"/>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard label="Total Customers" :value="stats.total_customers" :icon="Users" :variant="4"/>
      <StatCard label="Active Products" :value="stats.total_products" :icon="ListIndentIncrease" :variant="5"/>
      <StatCard label="Low Stock Items" :value="stats.low_stock_products" :icon="FileExclamationPoint" :variant="6"/>
      <StatCard label="This Month Sales" :value="stats.revenue_this_month" :icon="Banknote" prefix="৳" :variant="7"/>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Revenue chart -->
      <div class="card p-5 lg:col-span-2">
        <div class="flex items-center justify-between mb-5">
          <h3 class="dash-section-title">Revenue (Last 30 Days)</h3>
          <select v-model="chartPeriod" @change="loadChart" class="input-sm w-28">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div class="h-56">
          <canvas ref="revenueChartRef"/>
        </div>
      </div>

      <!-- Orders by status (doughnut) -->
      <div class="card p-5">
        <h3 class="dash-section-title mb-5">Orders by Status</h3>
        <div class="h-48 flex items-center justify-center">
          <canvas ref="statusChartRef"/>
        </div>
        <div class="mt-4 space-y-2">
          <div v-for="(count, status) in ordersByStatus" :key="status"
               class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full"
                   :style="`background:${statusColors[status] || '#9CA3AF'}`"/>
              <span class="dash-status-label capitalize">{{ status }}</span>
            </div>
            <span class="dash-status-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row: Recent orders + Top products -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Orders -->
      <div class="card overflow-hidden">
        <div class="dash-card-header">
          <h3 class="dash-card-header-title">Recent Orders</h3>
          <router-link to="/orders" class="dash-card-header-link">View All</router-link>
        </div>
        <div v-if="loadingOrders" class="dash-loading">Loading...</div>
        <table v-else class="w-full">
          <tbody>
          <tr v-for="order in recentOrders" :key="order.id" class="table-row cursor-pointer"
              @click="$router.push(`/orders/${order.id}`)">
            <td class="table-cell">
              <p class="dash-order-number">#{{ order.order_number }}</p>
              <p class="dash-order-customer">{{ order.shipping_name }}</p>
            </td>
            <td class="table-cell">
              <StatusBadge :value="order.status"/>
            </td>
            <td class="table-cell text-right font-bold dash-amount">৳{{
                Number(order.total_amount).toLocaleString()
              }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Top Products -->
      <div class="card overflow-hidden">
        <div class="dash-card-header">
          <h3 class="dash-card-header-title">Top Selling Products</h3>
          <router-link to="/reports" class="dash-card-header-link">Full Report</router-link>
        </div>
        <div v-if="loadingTop" class="dash-loading">Loading...</div>
        <table v-else class="w-full">
          <tbody>
          <tr v-for="(p, i) in topProducts" :key="p.product_id" class="table-row">
            <td class="table-cell w-8 text-center">
              <span class="dash-rank" :class="`dash-rank-${i}`">
                {{ ['🥇', '🥈', '🥉'][i] || `#${i + 1}` }}
              </span>
            </td>
            <td class="table-cell flex-1">
              <p class="dash-product-name">{{ p.product_name }}</p>
              <p class="dash-product-meta">{{ p.total_sold }} sold</p>
            </td>
            <td class="table-cell text-right">
              <p class="dash-product-revenue">৳{{
                  Number(p.total_revenue).toLocaleString()
                }}</p>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, watch} from 'vue'
import {Chart, registerables} from 'chart.js'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import {dashboardApi, reportApi, orderApi} from '@/api'
import {useAuthStore} from '@/stores/auth'
import {useThemeStore} from '@/stores/theme'
import { DollarSign, ChartBar, ShoppingCart, Clock, Users, ListIndentIncrease, FileExclamationPoint, Banknote } from 'lucide-vue-next'

Chart.register(...registerables)

const auth = useAuthStore()
const themeStore = useThemeStore()
const stats = ref({})
const ordersByStatus = ref({})
const recentOrders = ref([]), topProducts = ref([])
const loadingOrders = ref(true), loadingTop = ref(true)
const revenueChartRef = ref(null), statusChartRef = ref(null)
const chartPeriod = ref('daily')
let revenueChart = null, statusChart = null

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

/* ─── Theme-aware chart colors ─── */
function revenueChartTheme() {
  const primary = getCSSVar('--color-primary') || '#2E7D32'
  const gridColor = getCSSVar('--border-light') || '#F3F4F6'
  const textMuted = getCSSVar('--text-muted') || '#94A3B8'
  return {
    borderColor: primary,
    backgroundColor: hexToRGBA(primary, 0.1),
    pointBackgroundColor: primary,
    gridColor,
    tickColor: textMuted,
  }
}

function buildStatusColors() {
  return {
    pending: getCSSVar('--warning') || '#F59E0B',
    confirmed: getCSSVar('--info') || '#3B82F6',
    processing: '#8B5CF6',
    shipped: '#6366F1',
    delivered: getCSSVar('--success') || '#10B981',
    cancelled: getCSSVar('--danger') || '#EF4444',
  }
}

const statusColors = buildStatusColors()

async function loadStats() {
  const res = await dashboardApi.stats()
  stats.value = res.data.data
}

async function loadChart() {
  const res = await reportApi.sales({period: chartPeriod.value})
  const data = res.data.data || []
  const labels = data.map(d => d.date)
  const revenue = data.map(d => parseFloat(d.revenue || 0))
  const theme = revenueChartTheme()

  if (revenueChart) revenueChart.destroy()
  if (!revenueChartRef.value) return

  revenueChart = new Chart(revenueChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue (৳)',
        data: revenue,
        borderColor: theme.borderColor,
        backgroundColor: theme.backgroundColor,
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.pointBackgroundColor,
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {legend: {display: false}},
      scales: {
        x: {grid: {display: false}, ticks: {font: {size: 10}, maxTicksLimit: 8, color: theme.tickColor}},
        y: {grid: {color: theme.gridColor}, ticks: {font: {size: 10}, color: theme.tickColor}}
      }
    }
  })
}

async function loadStatusChart() {
  const res = await reportApi.ordersByStatus()
  ordersByStatus.value = res.data.data || {}
  const labels = Object.keys(ordersByStatus.value)
  const data = Object.values(ordersByStatus.value)
  const colors = labels.map(l => statusColors[l] || '#9CA3AF')

  if (statusChart) statusChart.destroy()
  if (!statusChartRef.value) return

  statusChart = new Chart(statusChartRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{data, backgroundColor: colors, borderWidth: 2, borderColor: getCSSVar('--surface') || '#fff'}]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '72%',
      plugins: {legend: {display: false}}
    }
  })
}

async function loadRecentOrders() {
  loadingOrders.value = true
  const res = await orderApi.list({per_page: 6, sort: 'latest'})
  recentOrders.value = res.data.data || []
  loadingOrders.value = false
}

async function loadTopProducts() {
  loadingTop.value = true
  const res = await reportApi.topProducts({limit: 6})
  topProducts.value = res.data.data || []
  loadingTop.value = false
}

/* ─── Rebuild charts on theme change ─── */
function refreshThemeCharts() {
  Object.assign(statusColors, buildStatusColors())
  loadChart()
  loadStatusChart()
}

watch(() => themeStore.colorTheme, refreshThemeCharts)

onMounted(async () => {
  await Promise.allSettled([loadStats(), loadChart(), loadStatusChart(), loadRecentOrders(), loadTopProducts()])
})

onUnmounted(() => {
  if (revenueChart) revenueChart.destroy()
  if (statusChart) statusChart.destroy()
})
</script>

<style scoped>
/* ─── Themed section titles ─── */
.dash-section-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* ─── Card headers ─── */
.dash-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.dash-card-header-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  font-size: 0.9375rem;
}

.dash-card-header-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}
.dash-card-header-link:hover {
  text-decoration: underline;
}

/* ─── Loading ─── */
.dash-loading {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* ─── Status legend ─── */
.dash-status-label {
  color: var(--text-secondary);
}
.dash-status-count {
  font-weight: 600;
  color: var(--text-primary);
}

/* ─── Orders ─── */
.dash-order-number {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.75rem;
  margin: 0;
}
.dash-order-customer {
  color: var(--text-muted);
  font-size: 0.6875rem;
  margin: 0;
}
.dash-amount {
  color: var(--color-primary);
}

/* ─── Products ─── */
.dash-product-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.75rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dash-product-meta {
  color: var(--text-muted);
  font-size: 0.6875rem;
  margin: 0;
}
.dash-product-revenue {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.75rem;
  margin: 0;
}

/* ─── Rank badges ─── */
.dash-rank {
  font-size: 0.75rem;
  font-weight: 700;
}
.dash-rank-0 { color: #EAB308; }
.dash-rank-1 { color: #9CA3AF; }
.dash-rank-2 { color: #FB923C; }
.dash-rank:not(.dash-rank-0):not(.dash-rank-1):not(.dash-rank-2) {
  color: var(--text-muted);
}
</style>