<template>
  <div class="space-y-6 animate-in">
    <!-- ── Hero Welcome Section ── -->
    <div
      class="relative overflow-hidden rounded-2xl p-6 sm:p-8"
      :style="{ background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))` }"
    >
      <!-- Decorative elements -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="150" r="80" fill="white" opacity="0.15"/>
          <circle cx="350" cy="50" r="100" fill="white" opacity="0.1"/>
          <circle cx="200" cy="180" r="60" fill="white" opacity="0.08"/>
          <rect x="300" y="0" width="40" height="40" rx="8" fill="white" opacity="0.08"/>
          <rect x="20" y="20" width="20" height="20" rx="4" fill="white" opacity="0.06"/>
        </svg>
      </div>
      <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
            {{ greeting }}, {{ auth.userName }}! 👋
          </h1>
          <p class="text-sm text-white/80 mt-1 max-w-lg">
            Here's your business overview for {{ todayDate }}. Everything is running smoothly.
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            {{ stats.total_orders || 0 }} orders today
          </span>
          <!-- Customize dashboard button -->
          <button
            @click="showCustomizeModal = true"
            class="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm"
            title="Customize Dashboard"
          >
            <Settings class="w-4 h-4" />
          </button>
        </div>
      </div>
      <!-- Mini stat row -->
      <div class="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div v-for="(item, i) in heroStats" :key="i"
          class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10 hover:bg-white/15 transition-all duration-300 cursor-pointer"
        >
          <p class="text-2xl font-black text-white">{{ item.value }}</p>
          <p class="text-[11px] text-white/70 font-semibold uppercase tracking-wider mt-0.5">{{ item.label }}</p>
        </div>
      </div>
    </div>

    <!-- ── Premium Stat Cards ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="(card, i) in visibleStatCards" :key="card.key"
        class="group stat-premium rounded-xl p-4 sm:p-5 transition-all duration-300 cursor-pointer"
        :style="{
          background: card.gradient,
          boxShadow: `0 4px 20px ${card.shadowColor}20, 0 1px 3px ${card.shadowColor}10`,
          animationDelay: `${i * 0.05}s`
        }"
        @mouseenter="card.hovered = true"
        @mouseleave="card.hovered = false"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/25 backdrop-blur-sm">
            <component :is="card.icon" class="w-5 h-5 text-white" />
          </div>
          <span
            v-if="card.change !== undefined"
            class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            :class="card.change >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'"
          >
            <TrendingUp v-if="card.change >= 0" class="w-3 h-3" />
            <TrendingDown v-else class="w-3 h-3" />
            {{ Math.abs(card.change) }}%
          </span>
        </div>
        <p class="text-xs font-semibold text-white/70 uppercase tracking-wider">{{ card.label }}</p>
        <p class="text-2xl font-black text-white mt-1 tracking-tight">
          {{ card.prefix || '' }}{{ Number(card.value || 0).toLocaleString() }}{{ card.suffix || '' }}
        </p>
        <!-- Mini progress bar -->
        <div class="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :style="{ width: card.hovered ? '100%' : (card.progress || 70) + '%', background: 'rgba(255,255,255,0.5)' }"
          />
        </div>
      </div>
    </div>

    <!-- ── Charts Row ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Revenue Chart -->
      <div class="card p-5 lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary)">Revenue Overview</h3>
            <p class="text-xs mt-0.5" style="color: var(--text-muted)">Last 30 days performance</p>
          </div>
          <SelectBox
            v-model="chartPeriod"
            :options="chartPeriodOptions"
            size="sm"
            @change="loadChart"
          />
        </div>
        <div class="h-56">
          <canvas ref="revenueChartRef" />
        </div>
      </div>

      <!-- Orders by Status Doughnut -->
      <div class="card p-5 hover:shadow-lg transition-shadow duration-300">
        <div>
          <h3 class="font-bold text-sm" style="color: var(--text-primary)">Orders by Status</h3>
          <p class="text-xs mt-0.5" style="color: var(--text-muted)">Current distribution</p>
        </div>
        <div class="h-44 flex items-center justify-center mt-4">
          <div class="relative">
            <canvas ref="statusChartRef" />
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="text-2xl font-black" style="color: var(--color-primary)">
                {{ totalStatusCount }}
              </span>
            </div>
          </div>
        </div>
        <!-- Colorful legend -->
        <div class="mt-4 grid grid-cols-2 gap-2">
          <div v-for="(count, status) in ordersByStatus" :key="status"
            class="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs"
            :style="{ backgroundColor: hexToRGBA(statusColors[status] || '#9CA3AF', 0.08) }"
          >
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: statusColors[status] || '#9CA3AF' }" />
              <span class="capitalize font-medium" style="color: var(--text-secondary)">{{ status }}</span>
            </div>
            <span class="font-bold" style="color: var(--text-primary)">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tables Row ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Orders (enhanced) -->
      <div class="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color: var(--border-light)">
          <div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary)">Recent Orders</h3>
            <p class="text-xs mt-0.5" style="color: var(--text-muted)">Latest 6 transactions</p>
          </div>
          <router-link to="/orders" class="text-xs font-semibold" style="color: var(--color-primary)">
            View All →
          </router-link>
        </div>
        <div v-if="loadingOrders" class="py-12 text-center text-sm" style="color: var(--text-muted)">Loading...</div>
        <div v-else class="divide-y" style="border-color: var(--border-light)">
          <div v-for="order in recentOrders" :key="order.id"
            class="flex items-center gap-3 px-5 py-3.5 transition-all duration-200 cursor-pointer hover:pl-6"
            style="border-color: var(--border-light)"
            @click="$router.push(`/orders/${order.id}`)"
          >
            <!-- Order avatar -->
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
              :style="{ backgroundColor: orderColor(order.shipping_name) }">
              {{ order.shipping_name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate" style="color: var(--text-primary)">
                #{{ order.order_number }}
              </p>
              <p class="text-xs truncate" style="color: var(--text-muted)">{{ order.shipping_name }}</p>
            </div>
            <StatusBadge :value="order.status" />
            <p class="text-sm font-bold shrink-0 ml-2" style="color: var(--color-primary)">
              ৳{{ Number(order.total_amount).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Top Products (enhanced) -->
      <div class="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color: var(--border-light)">
          <div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary)">Top Selling Products</h3>
            <p class="text-xs mt-0.5" style="color: var(--text-muted)">Best performers this month</p>
          </div>
          <router-link to="/reports" class="text-xs font-semibold" style="color: var(--color-primary)">
            Full Report →
          </router-link>
        </div>
        <div v-if="loadingTop" class="py-12 text-center text-sm" style="color: var(--text-muted)">Loading...</div>
        <div v-else class="divide-y" style="border-color: var(--border-light)">
          <div v-for="(p, i) in topProducts" :key="p.product_id"
            class="flex items-center gap-3 px-5 py-3.5 transition-all duration-200 hover:pl-6"
            style="border-color: var(--border-light)"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              :style="{ backgroundColor: rankBg(i), color: rankColor(i) }">
              {{ ['🥇', '🥈', '🥉'][i] || `#${i + 1}` }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate" style="color: var(--text-primary)">
                {{ p.product_name }}
              </p>
              <p class="text-xs" style="color: var(--text-muted)">{{ p.total_sold }} units sold</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold" style="color: var(--text-primary)">
                ৳{{ Number(p.total_revenue).toLocaleString() }}
              </p>
              <p class="text-[11px] font-medium" :style="{ color: trendColor(p.total_sold) }">
                {{ i === 0 ? '🏆 Top seller' : '▲ Trending' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Quick Actions + Recent Activity ── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <div class="card p-5 hover:shadow-lg transition-shadow duration-300">
        <h3 class="font-bold text-sm mb-4" style="color: var(--text-primary)">Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <router-link v-for="action in quickActions" :key="action.label"
            :to="action.to"
            class="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-95"
            :style="{
              backgroundColor: hexToRGBA(action.color, 0.08),
              color: action.color
            }"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: hexToRGBA(action.color, 0.15) }">
              <component :is="action.icon" class="w-5 h-5" />
            </div>
            <span class="text-xs font-semibold text-center" style="color: var(--text-secondary)">{{ action.label }}</span>
          </router-link>
        </div>
      </div>

      <!-- Recent Activity Feed -->
      <div class="card p-5 hover:shadow-lg transition-shadow duration-300">
        <h3 class="font-bold text-sm mb-4" style="color: var(--text-primary)">Recent Activity</h3>
        <div class="space-y-0">
          <div v-for="(activity, i) in recentActivities" :key="i"
            class="flex items-start gap-3 py-3 transition-all duration-200 cursor-default hover:pl-1"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              :style="{ backgroundColor: hexToRGBA(activity.color, 0.15) }">
              <component :is="activity.icon" class="w-4 h-4" :style="{ color: activity.color }" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm" style="color: var(--text-primary)">
                <span class="font-semibold">{{ activity.title }}</span>
                <span v-if="activity.description" class="ml-1" style="color: var(--text-secondary)">{{ activity.description }}</span>
              </p>
              <p class="text-xs mt-0.5" style="color: var(--text-muted)">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Widget Customization Modal ── -->
    <teleport to="body">
      <transition name="widget-modal">
        <div v-if="showCustomizeModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4"
          @click.self="showCustomizeModal = false"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <!-- Modal -->
          <div class="relative w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden"
            style="background: var(--surface); border-color: var(--border); box-shadow: var(--shadow-modal);"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: var(--border-light)">
              <div>
                <h3 class="font-bold text-base" style="color: var(--text-primary)">Customize Dashboard</h3>
                <p class="text-xs mt-0.5" style="color: var(--text-muted)">Choose which stat cards to show and their order</p>
              </div>
              <button @click="showCustomizeModal = false"
                class="p-1.5 rounded-lg transition"
                style="color: var(--text-muted)"
                @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
                @mouseleave="e => e.target.style.backgroundColor = 'transparent'"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <div class="space-y-1">
                <div v-for="(card, i) in allWidgetCards" :key="card.key"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                  :class="card.visible ? 'opacity-100' : 'opacity-40'"
                  :style="{ backgroundColor: card.visible ? 'transparent' : 'var(--border-light)' }"
                >
                  <!-- Drag handle (visual only) -->
                  <GripVertical class="w-4 h-4 shrink-0" style="color: var(--text-muted)" />

                  <!-- Color dot -->
                  <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: card.dotColor }" />

                  <!-- Label & subtitle -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold" style="color: var(--text-primary)">{{ card.label }}</p>
                    <p class="text-xs" style="color: var(--text-muted)">{{ card.subtitle }}</p>
                  </div>

                  <!-- Toggle -->
                  <label class="toggle shrink-0" @click.stop>
                    <input type="checkbox" :checked="card.visible" @change="toggleWidgetCard(card.key)" />
                    <span class="toggle__slider" />
                  </label>

                  <!-- Move up -->
                  <button
                    @click="moveWidgetCard(card.key, -1)"
                    :disabled="i === 0"
                    class="p-1 rounded-lg transition disabled:opacity-20"
                    style="color: var(--text-muted)"
                    :title="'Move up'"
                    @mouseenter="e => { if(i > 0) e.target.style.backgroundColor = 'var(--border-light)' }"
                    @mouseleave="e => e.target.style.backgroundColor = 'transparent'"
                  >
                    <ChevronUp class="w-4 h-4" />
                  </button>

                  <!-- Move down -->
                  <button
                    @click="moveWidgetCard(card.key, 1)"
                    :disabled="i === allWidgetCards.length - 1"
                    class="p-1 rounded-lg transition disabled:opacity-20"
                    style="color: var(--text-muted)"
                    :title="'Move down'"
                    @mouseenter="e => { if(i < allWidgetCards.length - 1) e.target.style.backgroundColor = 'var(--border-light)' }"
                    @mouseleave="e => e.target.style.backgroundColor = 'transparent'"
                  >
                    <ChevronDown class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between px-6 py-3 border-t" style="border-color: var(--border-light); background: var(--border-light)">
              <button @click="resetWidgetConfig"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                style="color: var(--text-muted)"
                @mouseenter="e => e.target.style.color = 'var(--text-primary)'"
                @mouseleave="e => e.target.style.color = 'var(--text-muted)'"
              >
                Reset to Defaults
              </button>
              <button @click="showCustomizeModal = false" class="btn-primary text-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { dashboardApi, reportApi, orderApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  DollarSign, ChartBar, ShoppingCart, Clock, Users,
  ListIndentIncrease, FileExclamationPoint, Banknote,
  Package, UserPlus, Percent, MessageSquareText,
  TrendingUp, TrendingDown, PlusCircle, Truck,
  BadgePercent, Gift, Settings, ShieldCheck,
  GripVertical, ChevronUp, ChevronDown, X
} from 'lucide-vue-next'

Chart.register(...registerables)

const auth = useAuthStore()
const themeStore = useThemeStore()
const stats = ref({})
const ordersByStatus = ref({})
const recentOrders = ref([])
const topProducts = ref([])
const loadingOrders = ref(true)
const loadingTop = ref(true)
const revenueChartRef = ref(null)
const statusChartRef = ref(null)
const chartPeriod = ref('daily')
const chartPeriodOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' },
]
let revenueChart = null
let statusChart = null

/* ─── Date & Greeting ─── */
const todayDate = new Date().toLocaleDateString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
})
const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

/* ─── CSS Variable Helpers ─── */
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
function hexToRGBA(hex, alpha) {
  if (!hex) return `rgba(46, 125, 50, ${alpha})`
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return isNaN(r) ? `rgba(46, 125, 50, ${alpha})` : `rgba(${r}, ${g}, ${b}, ${alpha})`
}
function orderColor(name) {
  const colors = ['#2E7D32', '#2563EB', '#7C3AED', '#DC2626', '#D97706', '#0891B2', '#DB2777', '#EA580C']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
function rankBg(i) {
  return ['#FEF3C7', '#F1F5F9', '#FFEDD5'][i] || '#F8FAFC'
}
function rankColor(i) {
  return ['#D97706', '#64748B', '#EA580C'][i] || '#94A3B8'
}
function trendColor(sold) {
  return sold > 50 ? 'var(--success)' : 'var(--text-muted)'
}

/* ─── Hero Mini Stats ─── */
const heroStats = computed(() => [
  { label: 'Today Revenue', value: `৳${Number(stats.value.today_sales || 0).toLocaleString()}` },
  { label: 'Orders', value: stats.value.total_orders || 0 },
  { label: 'Customers', value: stats.value.total_customers || 0 },
  { label: 'Products', value: stats.value.total_products || 0 },
])

/* ═══════════════════════════════════════════
   WIDGET CONFIGURATION SYSTEM
   ═══════════════════════════════════════════ */
const WIDGET_STORAGE_KEY = 'dashboard_widget_config'
const showCustomizeModal = ref(false)

/* ─── All available card definitions ─── */
const CARD_DEFS = [
  { key: 'today_revenue', label: "Today's Revenue", subtitle: 'Daily earnings', prefix: '৳', icon: DollarSign, gradient: 'linear-gradient(135deg, #2E7D32, #1B5E20)', shadowColor: '#2E7D32', progress: 75, change: 12, dotColor: '#2E7D32', valueKey: 'today_sales' },
  { key: 'monthly_revenue', label: 'Monthly Revenue', subtitle: '30-day revenue', prefix: '৳', icon: ChartBar, gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)', shadowColor: '#2563EB', progress: 60, change: 8, dotColor: '#2563EB', valueKey: 'monthly_sales' },
  { key: 'total_orders', label: 'Total Orders', subtitle: 'All time orders', prefix: '', icon: ShoppingCart, gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)', shadowColor: '#7C3AED', progress: 80, change: 15, dotColor: '#7C3AED', valueKey: 'total_orders' },
  { key: 'pending_orders', label: 'Pending Orders', subtitle: 'Awaiting processing', prefix: '', icon: Clock, gradient: 'linear-gradient(135deg, #D97706, #B45309)', shadowColor: '#D97706', progress: 30, change: -5, dotColor: '#D97706', valueKey: 'pending_orders' },
  { key: 'total_customers', label: 'Total Customers', subtitle: 'Registered users', prefix: '', icon: Users, gradient: 'linear-gradient(135deg, #0891B2, #065666)', shadowColor: '#0891B2', progress: 65, change: 22, dotColor: '#0891B2', valueKey: 'total_customers' },
  { key: 'active_products', label: 'Active Products', subtitle: 'Listed inventory', prefix: '', icon: ListIndentIncrease, gradient: 'linear-gradient(135deg, #4CAF50, #2E7D32)', shadowColor: '#4CAF50', progress: 85, change: 6, dotColor: '#4CAF50', valueKey: 'total_products' },
  { key: 'low_stock', label: 'Low Stock Items', subtitle: 'Needs replenishment', prefix: '', icon: FileExclamationPoint, gradient: 'linear-gradient(135deg, #DC2626, #991B1B)', shadowColor: '#DC2626', progress: 15, change: -18, dotColor: '#DC2626', valueKey: 'low_stock_products' },
  { key: 'month_sales', label: 'This Month Sales', subtitle: 'Current period', prefix: '৳', icon: Banknote, gradient: 'linear-gradient(135deg, #DB2777, #9D174D)', shadowColor: '#DB2777', progress: 55, change: 10, dotColor: '#DB2777', valueKey: 'revenue_this_month' },
]

const DEFAULT_ORDER = CARD_DEFS.map(c => c.key)
const DEFAULT_VISIBLE = Object.fromEntries(CARD_DEFS.map(c => [c.key, true]))

/* ─── Load/save widget config from localStorage ─── */
function loadWidgetConfig() {
  try {
    const raw = localStorage.getItem(WIDGET_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { order: [...DEFAULT_ORDER], visible: { ...DEFAULT_VISIBLE } }
}

const widgetConfig = ref(loadWidgetConfig())

function saveWidgetConfig() {
  try {
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(widgetConfig.value))
  } catch { /* storage full or disabled */ }
}

function toggleWidgetCard(key) {
  widgetConfig.value.visible[key] = !widgetConfig.value.visible[key]
  saveWidgetConfig()
}

function moveWidgetCard(key, direction) {
  const order = widgetConfig.value.order
  const idx = order.indexOf(key)
  if (idx === -1) return
  const newIdx = idx + direction
  if (newIdx < 0 || newIdx >= order.length) return
  order.splice(idx, 1)
  order.splice(newIdx, 0, key)
  widgetConfig.value.order = [...order]
  saveWidgetConfig()
}

function resetWidgetConfig() {
  widgetConfig.value = { order: [...DEFAULT_ORDER], visible: { ...DEFAULT_VISIBLE } }
  saveWidgetConfig()
}

/* ─── Computed: all cards with visibility for modal ─── */
const allWidgetCards = computed(() => {
  const cfg = widgetConfig.value
  return cfg.order.map(key => {
    const def = CARD_DEFS.find(d => d.key === key)
    if (!def) return null
    const value = stats.value[def.valueKey] || 0
    return {
      ...def,
      value,
      hovered: false,
      visible: cfg.visible[key] !== false,
    }
  }).filter(Boolean)
})

/* ─── Computed: only visible cards for the dashboard display ─── */
const visibleStatCards = computed(() => {
  return allWidgetCards.value.filter(c => c.visible)
})



/* ─── Quick Actions ─── */
const quickActions = [
  { label: 'Add Product', to: '/products/create', icon: PlusCircle, color: '#2E7D32' },
  { label: 'New Order', to: '/orders', icon: Package, color: '#2563EB' },
  { label: 'Create Coupon', to: '/coupons', icon: BadgePercent, color: '#7C3AED' },
  { label: 'Upgrade', to: '/settings/general', icon: Settings, color: '#D97706' },
  { label: 'Add Vendor', to: '/vendors', icon: Truck, color: '#0891B2' },
  { label: 'New User', to: '/users', icon: UserPlus, color: '#DB2777' },
  { label: 'Promotions', to: '/campaigns', icon: Gift, color: '#DC2626' },
  { label: 'Security', to: '/settings/security', icon: ShieldCheck, color: '#6366F1' },
]

/* ─── Recent Activity (mock) ─── */
const recentActivities = [
  { icon: ShoppingCart, title: 'New order #ORD-1248', description: 'placed by Sarah Johnson', time: '2 minutes ago', color: '#2E7D32' },
  { icon: UserPlus, title: 'New vendor registered', description: 'GreenLeaf Organics', time: '15 minutes ago', color: '#2563EB' },
  { icon: MessageSquareText, title: 'Customer inquiry', description: 'from Mike Chen about order status', time: '32 minutes ago', color: '#7C3AED' },
  { icon: Percent, title: 'Coupon code used', description: 'SUMMER25 applied to 3 orders', time: '1 hour ago', color: '#D97706' },
  { icon: DollarSign, title: 'Revenue milestone', description: 'Crossed ৳50,000 today!', time: '2 hours ago', color: '#0891B2' },
]

/* ─── Chart Theme Helpers ─── */
function revenueChartTheme() {
  const p = getCSSVar('--color-primary') || '#2E7D32'
  return {
    borderColor: p,
    backgroundColor: hexToRGBA(p, 0.12),
    gradientFrom: hexToRGBA(p, 0.35),
    gradientTo: hexToRGBA(p, 0.02),
    pointBg: p,
    gridColor: getCSSVar('--border-light') || '#F1F5F9',
    tickColor: getCSSVar('--text-muted') || '#94A3B8',
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

const totalStatusCount = computed(() => {
  return Object.values(ordersByStatus.value).reduce((a, b) => a + b, 0)
})

/* ─── API Calls ─── */
function buildRevenueChart(data) {
  const labels = data.length ? data.map(d => d.date) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const revenue = data.length ? data.map(d => parseFloat(d.revenue || 0)) : [4200, 5800, 3900, 7200, 6100, 8400, 9600]
  const theme = revenueChartTheme()

  if (revenueChart) revenueChart.destroy()
  if (!revenueChartRef.value) return

  const ctx = revenueChartRef.value.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 220)
  gradient.addColorStop(0, theme.gradientFrom)
  gradient.addColorStop(1, theme.gradientTo)

  revenueChart = new Chart(revenueChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue (৳)',
        data: revenue,
        borderColor: theme.borderColor,
        backgroundColor: gradient,
        borderWidth: 3,
        tension: 0.45,
        fill: true,
        pointBackgroundColor: theme.pointBg,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: getCSSVar('--surface') || '#fff',
          titleColor: getCSSVar('--text-primary') || '#1E293B',
          bodyColor: getCSSVar('--text-secondary') || '#64748B',
          borderColor: getCSSVar('--border') || '#E2E8F0',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 10,
          displayColors: false,
          callbacks: { label: (ctx) => `৳${Number(ctx.raw).toLocaleString()}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Roboto, sans-serif' }, maxTicksLimit: 8, color: theme.tickColor } },
        y: { grid: { color: theme.gridColor }, ticks: { font: { size: 10 }, color: theme.tickColor, callback: (v) => `৳${v.toLocaleString()}` } }
      }
    }
  })
}

async function loadStats() {
  try {
    const res = await dashboardApi.stats()
    stats.value = res.data.data || {}
  } catch { /* will use defaults */ }
}

async function loadChart() {
  try {
    const res = await reportApi.sales({ period: chartPeriod.value })
    buildRevenueChart(res.data.data || [])
  } catch { buildRevenueChart([]) }
}

async function loadStatusChart() {
  try {
    const res = await reportApi.ordersByStatus()
    ordersByStatus.value = res.data.data || {}
  } catch {
    ordersByStatus.value = { pending: 24, confirmed: 18, processing: 12, shipped: 30, delivered: 85, cancelled: 6 }
  }
  const labels = Object.keys(ordersByStatus.value)
  const data = Object.values(ordersByStatus.value)
  const colors = labels.map(l => statusColors[l] || '#9CA3AF')

  if (statusChart) statusChart.destroy()
  if (!statusChartRef.value) return

  statusChart = new Chart(statusChartRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 3, borderColor: getCSSVar('--surface') || '#fff', hoverOffset: 8 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: getCSSVar('--surface') || '#fff',
          titleColor: getCSSVar('--text-primary') || '#1E293B',
          bodyColor: getCSSVar('--text-secondary') || '#64748B',
          borderColor: getCSSVar('--border') || '#E2E8F0',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 10,
          callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} (${Math.round(ctx.parsed / totalStatusCount.value * 100)}%)` }
        }
      }
    }
  })
}

async function loadRecentOrders() {
  loadingOrders.value = true
  try {
    const res = await orderApi.list({ per_page: 6, sort: 'latest' })
    recentOrders.value = res.data.data || []
  } catch { recentOrders.value = [] }
  loadingOrders.value = false
}

async function loadTopProducts() {
  loadingTop.value = true
  try {
    const res = await reportApi.topProducts({ limit: 6 })
    topProducts.value = res.data.data || []
  } catch { topProducts.value = [] }
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
  await Promise.allSettled([
    loadStats(),
    loadChart(),
    loadStatusChart(),
    loadRecentOrders(),
    loadTopProducts(),
  ])
})

onUnmounted(() => {
  if (revenueChart) revenueChart.destroy()
  if (statusChart) statusChart.destroy()
})
</script>

<style scoped>
/* ─── Stat Card Premium Hover ─── */
.stat-premium {
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-premium:hover {
  transform: translateY(-4px) scale(1.01);
}

/* ─── Staggered card entrance (delay set via inline style) ─── */
.stat-premium {
  animation: cardIn 0.4s ease both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Smooth table row divider ─── */
.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}

/* ─── Widget Modal Transitions ─── */
.widget-modal-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.widget-modal-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.widget-modal-enter-from {
  opacity: 0;
}
.widget-modal-enter-from > div:last-child {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}
.widget-modal-leave-to {
  opacity: 0;
}
.widget-modal-leave-to > div:last-child {
  transform: scale(0.96) translateY(6px);
  opacity: 0;
}
</style>