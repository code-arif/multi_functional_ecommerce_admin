<template>
  <div class="space-y-6">
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      <StatCard label="Total Conversations" :value="stats.total" :icon="statIcons.chat" iconBg="chat-stat-icon-0" iconColor="chat-stat-icon-0" />
      <StatCard label="Active" :value="stats.active" :icon="statIcons.chat" iconBg="chat-stat-icon-1" iconColor="chat-stat-icon-1" />
      <StatCard label="Disabled" :value="stats.disabled" :icon="statIcons.noSymbol" iconBg="chat-stat-icon-2" iconColor="chat-stat-icon-2" />
      <StatCard label="Blocked" :value="stats.blocked" :icon="statIcons.warning" iconBg="chat-stat-icon-3" iconColor="chat-stat-icon-3" />
      <StatCard label="Total Messages" :value="stats.totalMessages" :icon="statIcons.chat" iconBg="chat-stat-icon-4" iconColor="chat-stat-icon-4" />
    </div>

    <!-- ─── Analytics Stat Cards ─── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Avg Response</p>
          <p class="text-xl font-black text-slate-800">{{ analytics.avgResponseTime }}</p>
        </div>
      </div>
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Fastest</p>
          <p class="text-xl font-black text-slate-800">{{ analytics.fastestResponse }}</p>
        </div>
      </div>
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Slowest</p>
          <p class="text-xl font-black text-slate-800">{{ analytics.slowestResponse }}</p>
        </div>
      </div>
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-semibold uppercase tracking-wide">Response Rate</p>
          <p class="text-xl font-black text-slate-800">{{ analytics.responseRate }}</p>
        </div>
      </div>
    </div>

    <!-- ─── Charts Row ─── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Response Time Distribution -->
      <div class="card p-5 lg:col-span-1">
        <h3 class="text-sm font-bold text-slate-800 mb-4">Response Time Distribution</h3>
        <div class="h-56"><canvas ref="responseTimeChartRef" /></div>
      </div>
      <!-- Message Volume -->
      <div class="card p-5 lg:col-span-1">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-slate-800">Message Volume (Last 7 Days)</h3>
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> Admin</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Customer</span>
          </div>
        </div>
        <div class="h-56"><canvas ref="messageVolumeChartRef" /></div>
      </div>
      <!-- Type Breakdown -->
      <div class="card p-5 lg:col-span-1">
        <h3 class="text-sm font-bold text-slate-800 mb-4">Conversations by Type</h3>
        <div class="h-56 flex items-center justify-center"><canvas ref="typeBreakdownChartRef" /></div>
        <!-- Quick legend with counts -->
        <div class="mt-3 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background:#2E7D32"></span>
              <span class="text-slate-600">Customers</span>
            </div>
            <span class="font-semibold text-slate-800">{{ typeDistribution.customers }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background:#E65100"></span>
              <span class="text-slate-600">Vendors</span>
            </div>
            <span class="font-semibold text-slate-800">{{ typeDistribution.vendors }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background:#C62828"></span>
              <span class="text-slate-600">Monitor</span>
            </div>
            <span class="font-semibold text-slate-800">{{ typeDistribution.monitor }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main row: Conversation table + Recent Activity -->
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-6">
      <!-- Conversation Table -->
      <div class="card overflow-hidden xl:col-span-7">
        <div class="px-5 py-3 border-b border-slate-100 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800">All Conversations</h3>
            <button @click="resetAllStates" class="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition">Reset All</button>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color:var(--text-muted)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search conversations..."
                class="search-input"
              />
            </div>
            <SelectBox v-model="typeFilter" :options="typeOptions" size="sm" placeholder="All Types" />
            <SelectBox v-model="statusFilter" :options="statusOptions" size="sm" placeholder="All Status" />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 text-left">User</th>
                <th class="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 text-left">Status</th>
                <th class="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 text-left">Messages</th>
                <th class="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 text-left">Avg Response</th>
                <th class="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 text-left">Last Active</th>
                <th class="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="conv in filteredConvs" :key="conv.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" :style="{ backgroundColor: conv.color }">
                      {{ conv.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-slate-800 truncate">
                        {{ conv.name }}
                        <span v-if="conv.type === 'vendor'" class="text-[9px] text-orange-600 bg-orange-50 px-1 py-0.5 rounded font-medium ml-1 align-middle">Vendor</span>
                        <span v-if="conv.type === 'vendor_customer'" class="text-[9px] text-red-600 bg-red-50 px-1 py-0.5 rounded font-medium ml-1 align-middle">Monitor</span>
                      </p>
                      <p class="text-[10px] text-slate-400 truncate">{{ conv.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span v-if="conv.online" class="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Online</span>
                    <span v-if="conv.pinned" class="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pinned</span>
                    <span v-if="conv.muted" class="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Muted</span>
                    <span v-if="conv.disabled" class="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Disabled</span>
                    <span v-if="conv.blocked" class="text-[10px] font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Blocked</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ conv.messageCount || '—' }}</td>
                <td class="px-4 py-3">
                  <span
                    class="text-sm font-medium"
                    :class="conv.avgResponseTimeMs < 60000 ? 'text-green-600' : conv.avgResponseTimeMs < 300000 ? 'text-amber-600' : 'text-red-600'"
                  >
                    {{ conv.avgResponseTime || '—' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-500">{{ conv.time }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button @click="toggleMute(conv)" class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400" :title="conv.muted ? 'Unmute' : 'Mute'">
                      <BellIcon class="w-4 h-4" :class="conv.muted ? 'text-slate-500' : ''" />
                    </button>
                    <button @click="toggleDisable(conv)" class="p-1.5 rounded-lg hover:bg-red-50 transition" :class="conv.disabled ? 'text-red-500' : 'text-slate-400'" :title="conv.disabled ? 'Enable chat' : 'Disable chat'">
                      <NoSymbolIcon class="w-4 h-4" />
                    </button>
                    <button @click="toggleBlock(conv)" class="p-1.5 rounded-lg hover:bg-red-50 transition" :class="conv.blocked ? 'text-red-600' : 'text-slate-400'" :title="conv.blocked ? 'Unblock' : 'Block'">
                      <ExclamationTriangleIcon class="w-4 h-4" />
                    </button>
                    <button @click="openChat(conv)" class="p-1.5 rounded-lg hover:bg-green-50 transition text-green-600" title="Open chat">
                      <ChatBubbleLeftRightIcon class="w-4 h-4" />
                    </button>
                    <button @click="confirmDeleteConv = conv" class="p-1.5 rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-500" title="Delete">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredConvs.length">
                <td colspan="6" class="text-center py-8 text-sm text-slate-400">No conversations found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card overflow-hidden xl:col-span-3">
        <div class="px-5 py-4 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-800">Recent Activity</h3>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="(activity, i) in recentActivity" :key="i" class="px-5 py-3 flex items-start gap-3">
            <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold" :style="{ backgroundColor: activity.color }">
              {{ activity.initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-slate-700">
                <strong>{{ activity.name }}</strong>
                <span class="text-slate-500"> {{ activity.action }}</span>
              </p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ activity.time }}</p>
            </div>
          </div>
          <div v-if="!recentActivity.length" class="px-5 py-8 text-center text-sm text-slate-400">No recent activity</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="confirmDeleteConv" class="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" @click="confirmDeleteConv = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" @click.stop>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><TrashIcon class="w-5 h-5 text-red-600" /></div>
            <div><p class="text-sm font-bold text-slate-900">Delete conversation</p><p class="text-xs text-slate-500">This action cannot be undone</p></div>
          </div>
          <p class="text-sm text-slate-600 mb-6">Delete conversation with <strong>{{ confirmDeleteConv.name }}</strong>?</p>
          <div class="flex items-center gap-2 justify-end">
            <button @click="confirmDeleteConv = null" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <button @click="doDelete" class="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm">Delete</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import StatCard from '@/components/common/StatCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  ChatBubbleLeftRightIcon,
  BellIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { ChartBarSquareIcon } from '@heroicons/vue/24/outline'
import SelectBox from '@/components/common/SelectBox.vue'

Chart.register(...registerables)

// StatCard icons (passed as component refs)
const breadcrumbItems = computed(() => [
    { label: 'Chat Dashboard', icon: ChartBarSquareIcon }
])

const statIcons = {
  chat: ChatBubbleLeftRightIcon,
  noSymbol: NoSymbolIcon,
  warning: ExclamationTriangleIcon,
}

const router = useRouter()
const auth = useAuthStore()
const themeStore = useThemeStore()

const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all') // 'all', 'customer', 'vendor', 'vendor_customer'
const confirmDeleteConv = ref(null)
const responseTimeChartRef = ref(null)
const messageVolumeChartRef = ref(null)
const typeBreakdownChartRef = ref(null)
let responseTimeChart = null
let messageVolumeChart = null
let typeBreakdownChart = null

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'customer', label: 'Customers' },
  { value: 'vendor', label: 'Vendors' },
  { value: 'vendor_customer', label: 'Monitors' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'muted', label: 'Muted' },
]

// ─── Shared conversation data ───
const conversations = ref([])
const colors = ['#2E7D32','#2563EB','#7C3AED','#DC2626','#D97706','#0D9488']

// ─── Mock message data for analytics ───
const allMessages = ref([])

/* ═══════════════════════════════════════════
   CSS Variable Helpers
   ═══════════════════════════════════════════ */
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

function formatDuration(ms) {
  if (ms < 0) return '—'
  if (ms < 1000) return '<1s'
  if (ms < 60000) {
    const s = Math.round(ms / 1000)
    return `${s}s`
  }
  if (ms < 3600000) {
    const m = Math.floor(ms / 60000)
    const s = Math.round((ms % 60000) / 1000)
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

/* ═══════════════════════════════════════════
   ANALYTICS COMPUTED
   ═══════════════════════════════════════════ */

// Compute response times: pair each customer message with the next admin reply
function computeResponsePairs(convMessages) {
  const pairs = []
  let lastCustomerMsg = null
  for (const msg of convMessages) {
    if (!msg.is_admin && lastCustomerMsg === null) {
      lastCustomerMsg = msg
    } else if (msg.is_admin && lastCustomerMsg !== null) {
      pairs.push({
        customerMsg: lastCustomerMsg,
        adminMsg: msg,
        responseTime: msg.createdAt - lastCustomerMsg.createdAt,
      })
      lastCustomerMsg = null
    }
  }
  return pairs
}

const analytics = computed(() => {
  const msgs = allMessages.value
  const allPairs = []

  // Collect response pairs across all conversations
  conversations.value.forEach(conv => {
    const convMsgs = msgs.filter(m => m.convId === conv.id).sort((a, b) => a.createdAt - b.createdAt)
    const pairs = computeResponsePairs(convMsgs)
    allPairs.push(...pairs)
  })

  if (!allPairs.length) {
    return {
      avgResponseTime: '—',
      fastestResponse: '—',
      slowestResponse: '—',
      responseRate: '—',
      avgResponseTimeMs: 0,
      responseTimeBuckets: [],
    }
  }

  const times = allPairs.map(p => p.responseTime)
  const avg = times.reduce((s, t) => s + t, 0) / times.length
  const fastest = Math.min(...times)
  const slowest = Math.max(...times)

  // Count customer messages vs responded
  const totalCustomerMsgs = msgs.filter(m => !m.is_admin).length
  const respondedCount = allPairs.length
  const rate = totalCustomerMsgs > 0 ? (respondedCount / totalCustomerMsgs) * 100 : 0

  // Response time distribution buckets
  const buckets = [
    { label: '<1m', min: 0, max: 60000, count: 0 },
    { label: '1-5m', min: 60000, max: 300000, count: 0 },
    { label: '5-15m', min: 300000, max: 900000, count: 0 },
    { label: '15-30m', min: 900000, max: 1800000, count: 0 },
    { label: '30m+', min: 1800000, max: Infinity, count: 0 },
  ]
  times.forEach(t => {
    const bucket = buckets.find(b => t >= b.min && t < b.max)
    if (bucket) bucket.count++
  })

  return {
    avgResponseTime: formatDuration(avg),
    fastestResponse: formatDuration(fastest),
    slowestResponse: formatDuration(slowest),
    responseRate: `${rate.toFixed(1)}%`,
    avgResponseTimeMs: avg,
    responseTimeBuckets: buckets,
  }
})

// Compute per-conversation avg response time
function computeConvAvgResponse(convId) {
  const msgs = allMessages.value
    .filter(m => m.convId === convId)
    .sort((a, b) => a.createdAt - b.createdAt)
  const pairs = computeResponsePairs(msgs)
  if (!pairs.length) return { avgResponseTimeMs: -1, avgResponseTime: '—' }
  const avg = pairs.reduce((s, p) => s + p.responseTime, 0) / pairs.length
  return {
    avgResponseTimeMs: avg,
    avgResponseTime: formatDuration(avg),
  }
}

// Conversation type distribution
const typeDistribution = computed(() => {
  const convs = conversations.value
  const customers = convs.filter(c => c.type === 'customer').length
  const vendors = convs.filter(c => c.type === 'vendor').length
  const monitor = convs.filter(c => c.type === 'vendor_customer').length
  return { customers, vendors, monitor }
})

// Message volume by day for the last 7 days
const messageVolumeByDay = computed(() => {
  const days = []
  const now = Date.now()
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now - i * 86400000)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)
    const dayMsgs = allMessages.value.filter(m => m.createdAt >= dayStart.getTime() && m.createdAt <= dayEnd.getTime())
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : dayStart.toLocaleDateString('en-US', { weekday: 'short' })
    days.push({
      label,
      admin: dayMsgs.filter(m => m.is_admin).length,
      customer: dayMsgs.filter(m => !m.is_admin).length,
      total: dayMsgs.length,
    })
  }
  return days
})

/* ═══════════════════════════════════════════
   STATS & FILTERING
   ═══════════════════════════════════════════ */

const stats = computed(() => {
  const convs = conversations.value
  return {
    total: convs.length,
    active: convs.filter(c => !c.disabled && !c.blocked).length,
    disabled: convs.filter(c => c.disabled).length,
    blocked: convs.filter(c => c.blocked).length,
    muted: convs.filter(c => c.muted).length,
    pinned: convs.filter(c => c.pinned).length,
    online: convs.filter(c => c.online).length,
    unread: convs.reduce((sum, c) => sum + (c.unread || 0), 0),
    totalMessages: convs.reduce((sum, c) => sum + (c.messageCount || 0), 0),
  }
})

const filteredConvs = computed(() => {
  let list = [...conversations.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    )
  }
  if (typeFilter.value !== 'all') {
    list = list.filter(c => c.type === typeFilter.value)
  }
  if (statusFilter.value === 'active') list = list.filter(c => !c.disabled && !c.blocked)
  else if (statusFilter.value === 'disabled') list = list.filter(c => c.disabled)
  else if (statusFilter.value === 'blocked') list = list.filter(c => c.blocked)
  else if (statusFilter.value === 'muted') list = list.filter(c => c.muted)
  return list
})

const recentActivity = computed(() => {
  const actions = []
  const convs = conversations.value
  convs.forEach(c => {
    if (c.disabled) actions.push({ name: c.name, initials: c.name.charAt(0), color: c.color, action: 'was disabled', time: 'Recently' })
    if (c.blocked) actions.push({ name: c.name, initials: c.name.charAt(0), color: c.color, action: 'was blocked', time: 'Recently' })
    if (c.muted) actions.push({ name: c.name, initials: c.name.charAt(0), color: c.color, action: 'was muted', time: 'Recently' })
    if (c.pinned) actions.push({ name: c.name, initials: c.name.charAt(0), color: c.color, action: 'was pinned', time: 'Recently' })
  })
  return actions.slice(0, 10)
})

/* ═══════════════════════════════════════════
   LOCALSTORAGE PERSISTENCE
   ═══════════════════════════════════════════ */
const DASH_STORAGE_KEY = 'chat_dashboard_states'

function saveDashboardStates() {
  const states = {}
  conversations.value.forEach(conv => {
    states[conv.id] = {
      pinned: conv.pinned || false,
      muted: conv.muted || false,
      disabled: conv.disabled || false,
      blocked: conv.blocked || false,
    }
  })
  try {
    localStorage.setItem(DASH_STORAGE_KEY, JSON.stringify(states))
  } catch { /* silently ignore */ }
}

function loadDashboardStates() {
  try {
    const raw = localStorage.getItem(DASH_STORAGE_KEY)
    if (!raw) return
    const states = JSON.parse(raw)
    conversations.value.forEach(conv => {
      const s = states[conv.id]
      if (s) {
        conv.pinned = s.pinned ?? conv.pinned
        conv.muted = s.muted ?? conv.muted
        conv.disabled = s.disabled ?? conv.disabled
        conv.blocked = s.blocked ?? conv.blocked
      }
    })
  } catch { /* invalid data, ignore */ }
}

function toggleMute(conv) { conv.muted = !conv.muted; saveDashboardStates() }
function toggleDisable(conv) { conv.disabled = !conv.disabled; saveDashboardStates() }
function toggleBlock(conv) { conv.blocked = !conv.blocked; saveDashboardStates() }

function openChat(conv) {
  router.push('/messages')
}

function doDelete() {
  if (!confirmDeleteConv.value) return
  conversations.value = conversations.value.filter(c => c.id !== confirmDeleteConv.value.id)
  allMessages.value = allMessages.value.filter(m => m.convId !== confirmDeleteConv.value.id)
  confirmDeleteConv.value = null
  saveDashboardStates()
}

function resetAllStates() {
  conversations.value.forEach(c => {
    c.disabled = false
    c.blocked = false
    c.muted = false
  })
  saveDashboardStates()
}

/* ═══════════════════════════════════════════
   CHARTS
   ═══════════════════════════════════════════ */

function buildResponseTimeChart() {
  const primary = getCSSVar('--color-primary') || '#2E7D32'
  const gridColor = getCSSVar('--border-light') || '#F3F4F6'
  const tickColor = getCSSVar('--text-muted') || '#94A3B8'
  const danger = getCSSVar('--danger') || '#EF4444'
  const warning = getCSSVar('--warning') || '#F59E0B'

  if (responseTimeChart) responseTimeChart.destroy()
  if (!responseTimeChartRef.value) return

  const buckets = analytics.value.responseTimeBuckets
  const colors = [
    hexToRGBA('#10B981', 0.7),
    hexToRGBA(primary, 0.7),
    hexToRGBA(warning, 0.7),
    hexToRGBA('#F97316', 0.7),
    hexToRGBA(danger, 0.7),
  ]

  responseTimeChart = new Chart(responseTimeChartRef.value, {
    type: 'bar',
    data: {
      labels: buckets.map(b => b.label),
      datasets: [{
        label: 'Messages',
        data: buckets.map(b => b.count),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} response(s)`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: tickColor },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            font: { size: 10 },
            color: tickColor,
            precision: 0,
          },
        },
      },
    },
  })
}

function buildMessageVolumeChart() {
  const primary = getCSSVar('--color-primary') || '#2E7D32'
  const info = getCSSVar('--info') || '#3B82F6'
  const gridColor = getCSSVar('--border-light') || '#F3F4F6'
  const tickColor = getCSSVar('--text-muted') || '#94A3B8'

  if (messageVolumeChart) messageVolumeChart.destroy()
  if (!messageVolumeChartRef.value) return

  const data = messageVolumeByDay.value

  messageVolumeChart = new Chart(messageVolumeChartRef.value, {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: 'Admin',
          data: data.map(d => d.admin),
          backgroundColor: hexToRGBA(primary, 0.7),
          borderColor: primary,
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Customer',
          data: data.map(d => d.customer),
          backgroundColor: hexToRGBA(info, 0.7),
          borderColor: info,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label,
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} msg(s)`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: tickColor },
          stacked: true,
        },
        y: {
          grid: { color: gridColor },
          ticks: { font: { size: 10 }, color: tickColor, precision: 0 },
          stacked: true,
        },
      },
    },
  })
}

function buildTypeBreakdownChart() {
  const gridColor = getCSSVar('--border-light') || '#F3F4F6'
  const tickColor = getCSSVar('--text-muted') || '#94A3B8'

  if (typeBreakdownChart) typeBreakdownChart.destroy()
  if (!typeBreakdownChartRef.value) return

  const dist = typeDistribution.value
  const hasCounts = dist.customers > 0 || dist.vendors > 0 || dist.monitor > 0
  if (!hasCounts) return

  const typeColors = ['#2E7D32', '#E65100', '#C62828']
  const hoverColors = ['#1B5E20', '#BF360C', '#B71C1C']

  typeBreakdownChart = new Chart(typeBreakdownChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['Customers', 'Vendors', 'Monitor'],
      datasets: [{
        data: [dist.customers, dist.vendors, dist.monitor],
        backgroundColor: typeColors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 2,
        borderColor: getCSSVar('--surface') || '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            padding: 12,
            font: { size: 10 },
            color: tickColor,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
              const val = ctx.parsed
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0
              return `${ctx.label}: ${val} (${pct}%)`
            },
          },
        },
      },
    },
  })
}

function buildAllCharts() {
  buildResponseTimeChart()
  buildMessageVolumeChart()
  buildTypeBreakdownChart()
}

/* ─── Generate mock messages with realistic timestamps ─── */
function generateMockMessages() {
  const now = Date.now()
  const H = 3600000
  const M = 60000
  const S = 1000

  const all = []

  // Sarah Johnson (convId: 1) — quick responses
  const sarahMsgs = [
    { id: 1, convId: 1, text: 'Hi, I need help with my order', time: '9:15 AM', is_admin: false, createdAt: now - H * 2 },
    { id: 2, convId: 1, text: 'Sure! What seems to be the issue?', time: '9:16 AM', is_admin: true, createdAt: now - H * 2 + M * 1 + S * 30 },
    { id: 3, convId: 1, text: 'My package hasn\'t arrived yet', time: '9:17 AM', is_admin: false, createdAt: now - H * 2 + M * 2 },
    { id: 4, convId: 1, text: 'Let me check the tracking for you', time: '9:18 AM', is_admin: true, createdAt: now - H * 2 + M * 2 + S * 45 },
    { id: 5, convId: 1, text: 'It shows delivery by tomorrow', time: '9:19 AM', is_admin: true, createdAt: now - H * 2 + M * 3 + S * 30 },
    { id: 6, convId: 1, text: 'Oh great, thank you!', time: '9:20 AM', is_admin: false, createdAt: now - H * 2 + M * 4 },
    { id: 7, convId: 1, text: 'Is there tracking number?', time: '9:22 AM', is_admin: false, createdAt: now - H * 2 + M * 6 },
    { id: 8, convId: 1, text: 'Yes, it\'s 1Z999AA10123456784', time: '9:23 AM', is_admin: true, createdAt: now - H * 2 + M * 6 + S * 45 },
    { id: 9, convId: 1, text: 'Got it, thanks again!', time: '9:24 AM', is_admin: false, createdAt: now - H * 2 + M * 8 },
  ]
  all.push(...sarahMsgs)

  // Mike Chen (convId: 2) — slow responses
  const mikeMsgs = [
    { id: 10, convId: 2, text: 'I want to return a product', time: 'Yesterday 2:00 PM', is_admin: false, createdAt: now - H * 20 },
    { id: 11, convId: 2, text: 'Sure, which product?', time: 'Yesterday 2:08 PM', is_admin: true, createdAt: now - H * 20 + M * 8 },
    { id: 12, convId: 2, text: 'The blue sweater, size L', time: 'Yesterday 2:10 PM', is_admin: false, createdAt: now - H * 20 + M * 10 },
    { id: 13, convId: 2, text: 'I\'ll start the return process', time: 'Yesterday 2:35 PM', is_admin: true, createdAt: now - H * 20 + M * 35 },
    { id: 14, convId: 2, text: 'You\'ll get a return label via email', time: 'Yesterday 2:36 PM', is_admin: true, createdAt: now - H * 20 + M * 36 },
    { id: 15, convId: 2, text: 'When will I get the refund?', time: 'Yesterday 3:00 PM', is_admin: false, createdAt: now - H * 20 + M * 60 },
    { id: 16, convId: 2, text: 'Within 5-7 business days after we receive the item', time: 'Yesterday 3:45 PM', is_admin: true, createdAt: now - H * 20 + M * 105 },
  ]
  all.push(...mikeMsgs)

  // Emily Davis (convId: 3) — mixed
  const emilyMsgs = [
    { id: 17, convId: 3, text: 'Is this item available in stock?', time: '11:00 AM', is_admin: false, createdAt: now - H * 5 },
    { id: 18, convId: 3, text: 'Let me check for you!', time: '11:02 AM', is_admin: true, createdAt: now - H * 5 + M * 2 },
    { id: 19, convId: 3, text: 'Yes, we have plenty in stock', time: '11:03 AM', is_admin: true, createdAt: now - H * 5 + M * 3 },
    { id: 20, convId: 3, text: 'Can I get a discount code?', time: '11:05 AM', is_admin: false, createdAt: now - H * 5 + M * 5 },
    { id: 21, convId: 3, text: 'Sure! Here\'s WELCOME10 for 10% off', time: '11:07 AM', is_admin: true, createdAt: now - H * 5 + M * 7 },
    { id: 22, convId: 3, text: 'Awesome, thank you!', time: '11:08 AM', is_admin: false, createdAt: now - H * 5 + M * 8 },
  ]
  all.push(...emilyMsgs)

  // Alex Kumar (convId: 4) — one question, one answer
  const alexMsgs = [
    { id: 23, convId: 4, text: 'Do you ship internationally?', time: '3:00 PM', is_admin: false, createdAt: now - H * 8 },
    { id: 24, convId: 4, text: 'Yes, we ship to over 50 countries worldwide!', time: '3:05 PM', is_admin: true, createdAt: now - H * 8 + M * 5 },
    { id: 25, convId: 4, text: 'What\'s the shipping cost?', time: '3:10 PM', is_admin: false, createdAt: now - H * 8 + M * 10 },
    { id: 26, convId: 4, text: 'It depends on the destination, but starts at $15', time: '3:45 PM', is_admin: true, createdAt: now - H * 8 + M * 45 },
  ]
  all.push(...alexMsgs)

  // Lisa Martinez (convId: 5) — multiple exchanges
  const lisaMsgs = [
    { id: 27, convId: 5, text: 'I received the wrong item', time: 'Yesterday 10:00 AM', is_admin: false, createdAt: now - H * 22 },
    { id: 28, convId: 5, text: 'I\'m so sorry about that! Let me fix this', time: 'Yesterday 10:02 AM', is_admin: true, createdAt: now - H * 22 + M * 2 },
    { id: 29, convId: 5, text: 'I\'ll send a replacement right away', time: 'Yesterday 10:03 AM', is_admin: true, createdAt: now - H * 22 + M * 3 },
    { id: 30, convId: 5, text: 'Please keep the wrong item as a gift', time: 'Yesterday 10:04 AM', is_admin: true, createdAt: now - H * 22 + M * 4 },
    { id: 31, convId: 5, text: 'Thank you so much! Great customer service', time: 'Yesterday 10:06 AM', is_admin: false, createdAt: now - H * 22 + M * 6 },
  ]
  all.push(...lisaMsgs)

  // Tom Wilson (convId: 6) — very few messages
  const tomMsgs = [
    { id: 32, convId: 6, text: 'When will you restock?', time: '2 days ago 1:00 PM', is_admin: false, createdAt: now - H * 48 },
    { id: 33, convId: 6, text: 'Next week! I can notify you when it\'s back', time: '2 days ago 1:10 PM', is_admin: true, createdAt: now - H * 48 + M * 10 },
    { id: 34, convId: 6, text: 'Yes please!', time: '2 days ago 1:15 PM', is_admin: false, createdAt: now - H * 48 + M * 15 },
  ]
  all.push(...tomMsgs)

  // Add some messages spanning the last 7 days for volume chart
  for (let d = 1; d <= 5; d++) {
    const dayStart = new Date(now - d * 86400000)
    dayStart.setHours(9, 0, 0, 0)
    // Random exchanges for variety
    const convIdx = (d % 4) + 1
    all.push({
      id: 100 + d * 2,
      convId: convIdx,
      text: 'Following up on this',
      time: `${d}d ago`,
      is_admin: true,
      createdAt: dayStart.getTime() + M * 30,
    })
    all.push({
      id: 101 + d * 2,
      convId: convIdx,
      text: 'Thanks for the update',
      time: `${d}d ago`,
      is_admin: false,
      createdAt: dayStart.getTime() + M * 45,
    })
  }

  // Add some older messages to fill the chart
  for (let d = 2; d <= 6; d++) {
    const dayStart = new Date(now - d * 86400000)
    dayStart.setHours(14, 0, 0, 0)
    all.push({
      id: 200 + d,
      convId: (d % 3) + 1,
      text: 'How is the order going?',
      time: `${d}d ago`,
      is_admin: true,
      createdAt: dayStart.getTime() + M * 15,
    })
    all.push({
      id: 300 + d,
      convId: (d % 3) + 1,
      text: 'All good, thanks!',
      time: `${d}d ago`,
      is_admin: false,
      createdAt: dayStart.getTime() + M * 20,
    })
  }

  return all
}

/* ═══════════════════════════════════════════
   THEME WATCHER
   ═══════════════════════════════════════════ */
watch(() => themeStore.colorTheme, () => {
  buildAllCharts()
})

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
onMounted(() => {
  const vendorDashColors = ['#E65100','#6A1B9A','#C62828','#4E342E']

  const rawConversations = [
    // ── Customers ──
    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', time: '9:38 AM', unread: 2, online: true, color: colors[0], lastSeen: null, pinned: true, muted: false, disabled: false, blocked: false, messageCount: 24, type: 'customer' },
    { id: 2, name: 'Mike Chen', email: 'mike@example.com', time: '15m ago', unread: 0, online: false, color: colors[1], lastSeen: 'yesterday', pinned: false, muted: true, disabled: false, blocked: false, messageCount: 18, type: 'customer' },
    { id: 3, name: 'Emily Davis', email: 'emily@example.com', time: '1h ago', unread: 1, online: true, color: colors[2], lastSeen: null, pinned: false, muted: false, disabled: false, blocked: false, messageCount: 12, type: 'customer' },
    { id: 4, name: 'Alex Kumar', email: 'alex@example.com', time: '3h ago', unread: 0, online: false, color: colors[3], lastSeen: '3 hours ago', pinned: false, muted: false, disabled: false, blocked: false, messageCount: 7, type: 'customer' },
    { id: 5, name: 'Lisa Martinez', email: 'lisa@example.com', time: '1d ago', unread: 0, online: false, color: colors[4], lastSeen: 'yesterday', pinned: false, muted: false, disabled: false, blocked: false, messageCount: 15, type: 'customer' },
    { id: 6, name: 'Tom Wilson', email: 'tom@example.com', time: '2d ago', unread: 0, online: false, color: colors[5], lastSeen: '2 days ago', pinned: false, muted: false, disabled: false, blocked: false, messageCount: 4, type: 'customer' },
    // ── Vendors ──
    { id: 7, name: 'GreenLeaf Supplies', email: 'contact@greenleaf.com', time: '1h ago', unread: 0, online: true, color: vendorDashColors[0], lastSeen: null, pinned: false, muted: false, disabled: false, blocked: false, messageCount: 24, type: 'vendor' },
    { id: 8, name: 'TechMart Wholesale', email: 'sales@techmart.com', time: '3h ago', unread: 1, online: false, color: vendorDashColors[1], lastSeen: '2 hours ago', pinned: false, muted: false, disabled: false, blocked: false, messageCount: 18, type: 'vendor' },
    // ── Monitor ──
    { id: 9, name: 'Sarah ⬄ GreenLeaf', email: '', time: '2h ago', unread: 0, online: false, color: vendorDashColors[2], lastSeen: null, pinned: false, muted: false, disabled: false, blocked: false, messageCount: 4, type: 'vendor_customer' },
    { id: 10, name: 'Mike ⬄ TechMart', email: '', time: '5h ago', unread: 0, online: false, color: vendorDashColors[3], lastSeen: null, pinned: false, muted: false, disabled: false, blocked: false, messageCount: 4, type: 'vendor_customer' },
  ]

  // Attach per-conversation response time analytics
  allMessages.value = generateMockMessages()

  rawConversations.forEach(conv => {
    const { avgResponseTimeMs, avgResponseTime } = computeConvAvgResponse(conv.id)
    conv.avgResponseTimeMs = avgResponseTimeMs
    conv.avgResponseTime = avgResponseTime
  })

  conversations.value = rawConversations

  // Load persisted states
  loadDashboardStates()

  // Build charts after DOM is ready
  setTimeout(() => buildAllCharts(), 100)
})

onUnmounted(() => {
  if (responseTimeChart) responseTimeChart.destroy()
  if (messageVolumeChart) messageVolumeChart.destroy()
  if (typeBreakdownChart) typeBreakdownChart.destroy()
})
</script>

<style scoped>
.chat-stat-icon-0, .chat-stat-icon-1, .chat-stat-icon-2, .chat-stat-icon-3, .chat-stat-icon-4 {
  background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}
.chat-stat-icon-1 {
  background-color: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success);
}
.chat-stat-icon-2 {
  background-color: color-mix(in srgb, var(--danger) 15%, transparent);
  color: var(--danger);
}
.chat-stat-icon-3 {
  background-color: color-mix(in srgb, #7C3AED 15%, transparent);
  color: #7C3AED;
}
.chat-stat-icon-4 {
  background-color: color-mix(in srgb, var(--info) 15%, transparent);
  color: var(--info);
}

.search-input {
  width: 100%;
  padding: 0.375rem 0.75rem 0.375rem 2.25rem;
  font-size: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text-primary);
  background: var(--surface);
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.25s ease;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-light) 25%, transparent);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
