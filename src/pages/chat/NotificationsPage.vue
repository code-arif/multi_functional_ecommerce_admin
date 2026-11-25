<template>
  <div>
    <PageHeader title="Notifications" subtitle="System and user activity alerts">
      <div class="flex items-center gap-2">
        <button v-if="hasUnread" class="btn-ghost text-sm gap-1.5 text-emerald-600 hover:bg-emerald-50" @click="markAllRead">
          <CheckIcon class="w-4 h-4" />Mark All Read
        </button>
      </div>
    </PageHeader>

    <transition name="skeleton-fade" mode="out-in">
      <!-- Skeleton -->
      <div v-if="loading" key="skeleton">
        <NotificationsSkeleton />
      </div>

      <!-- Real Content -->
      <div v-else key="content" class="space-y-2">
        <div v-for="(group, gIdx) in groupedNotifications" :key="gIdx" class="mb-6">
          <p class="text-xs font-bold uppercase tracking-wider mb-3 px-1 text-slate-500">{{ group.date }}</p>
          <div class="space-y-2.5">
            <div v-for="notif in group.items" :key="notif.id"
              class="card p-4 flex items-start gap-4 transition hover:shadow-md cursor-pointer border-l-4"
              :class="isItemRead(notif) ? 'opacity-75 border-l-transparent' : 'border-l-emerald-500 bg-emerald-50/20'"
              @click="handleNotificationClick(notif)">
              
              <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                :style="{ backgroundColor: notifIconBg(notif.type), color: notifIconColor(notif.type) }">
                <component :is="notifIcon(notif.type)" class="w-5 h-5" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ notif.title || 'Notification' }}</p>
                    <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ notif.message }}</p>
                  </div>
                  <span class="text-[11px] shrink-0 text-slate-400 font-medium">{{ formatTime(notif.created_at) }}</span>
                </div>

                <div class="flex items-center gap-3 mt-2.5">
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    :style="{ backgroundColor: notifTypeBg(notif.type), color: notifTypeColor(notif.type) }">
                    {{ notif.type }}
                  </span>
                  <span v-if="!isItemRead(notif)" class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span v-if="notif.action_url" class="text-[11px] font-semibold text-emerald-600 hover:underline inline-flex items-center gap-0.5">
                    Open page &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!notifications.length" class="text-center py-16 card" :style="{ color: 'var(--text-muted)' }">
          <BellIcon class="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p class="font-bold text-lg" :style="{ color: 'var(--text-primary)' }">No notifications yet</p>
          <p class="text-xs text-slate-500 mt-1">When system, order, or vendor events occur, they will appear here.</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@ecom/ui/components/PageHeader.vue'
import NotificationsSkeleton from '@/components/skeletons/NotificationsSkeleton.vue'
import { notificationApi } from '@/api/notification'
import {
  BellIcon,
  CheckIcon,
  ShoppingBagIcon,
  StarIcon,
  TicketIcon,
  UserIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const loading = ref(true)
const notifications = ref([])

const isItemRead = (n) => {
  if (typeof n.is_read === 'boolean') return n.is_read
  if (typeof n.isRead === 'boolean') return n.isRead
  return n.read_at !== null && n.read_at !== undefined
}

const hasUnread = computed(() => notifications.value.some(n => !isItemRead(n)))

async function fetchNotifications() {
  try {
    loading.value = true
    const res = await notificationApi.list({ per_page: 50 })
    if (res.data && res.data.success) {
      notifications.value = res.data.data || []
    }
  } catch (err) {
    console.warn('Failed to fetch notifications list:', err)
  } finally {
    loading.value = false
  }
}

const groupedNotifications = computed(() => {
  const groups = {}
  const now = new Date()
  const todayStr = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  notifications.value.forEach(n => {
    let groupKey = 'Earlier'
    if (n.created_at) {
      const itemDate = new Date(n.created_at).toDateString()
      if (itemDate === todayStr) groupKey = 'Today'
      else if (itemDate === yesterdayStr) groupKey = 'Yesterday'
    }

    if (!groups[groupKey]) {
      groups[groupKey] = { date: groupKey, items: [] }
    }
    groups[groupKey].items.push(n)
  })

  // Preferred order: Today, Yesterday, Earlier
  const ordered = []
  if (groups['Today']) ordered.push(groups['Today'])
  if (groups['Yesterday']) ordered.push(groups['Yesterday'])
  if (groups['Earlier']) ordered.push(groups['Earlier'])
  return ordered
})

async function markAllRead() {
  notifications.value.forEach(n => {
    n.is_read = true
    n.read_at = new Date().toISOString()
  })
  try {
    await notificationApi.markAllAsRead()
  } catch (err) {
    console.warn('Error marking all as read:', err)
  }
}

async function handleNotificationClick(notif) {
  if (!isItemRead(notif)) {
    notif.is_read = true
    notif.read_at = new Date().toISOString()
    try {
      await notificationApi.markAsRead(notif.id)
    } catch (err) {
      console.warn('Error marking as read:', err)
    }
  }

  if (notif.action_url) {
    let target = notif.action_url.trim()
    if (target.startsWith('/admin/')) {
      target = target.replace(/^\/admin/, '')
    }
    router.push(target)
  }
}

function formatTime(date) {
  if (!date) return ''
  const diffMs = Date.now() - new Date(date).getTime()
  const m = Math.floor(diffMs / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d < 7 ? `${d}d ago` : new Date(date).toLocaleDateString('en-BD', { month: 'short', day: 'numeric', year: 'numeric' })
}

function notifIcon(type) {
  const icons = {
    vendor: BuildingStorefrontIcon,
    order: ShoppingBagIcon,
    review: StarIcon,
    coupon: TicketIcon,
    user: UserIcon,
    alert: ExclamationTriangleIcon,
    inventory: ExclamationTriangleIcon,
    promo: MegaphoneIcon,
  }
  return icons[(type || '').toLowerCase()] || BellIcon
}

function notifIconBg(type) {
  const colors = {
    vendor: '#059669',
    order: '#2563EB',
    review: '#7C3AED',
    coupon: '#D97706',
    user: '#0284C7',
    alert: '#DC2626',
    inventory: '#D97706',
    promo: '#0D9488',
  }
  return `color-mix(in srgb, ${colors[(type || '').toLowerCase()] || '#64748B'} 15%, transparent)`
}

function notifIconColor(type) {
  const colors = {
    vendor: '#059669',
    order: '#2563EB',
    review: '#7C3AED',
    coupon: '#D97706',
    user: '#0284C7',
    alert: '#DC2626',
    inventory: '#D97706',
    promo: '#0D9488',
  }
  return colors[(type || '').toLowerCase()] || '#64748B'
}

function notifTypeBg(type) {
  const colors = {
    vendor: '#059669',
    order: '#2563EB',
    review: '#7C3AED',
    coupon: '#D97706',
    user: '#0284C7',
    alert: '#DC2626',
    inventory: '#D97706',
    promo: '#0D9488',
  }
  return `color-mix(in srgb, ${colors[(type || '').toLowerCase()] || '#64748B'} 12%, transparent)`
}

function notifTypeColor(type) {
  const colors = {
    vendor: '#059669',
    order: '#2563EB',
    review: '#7C3AED',
    coupon: '#D97706',
    user: '#0284C7',
    alert: '#DC2626',
    inventory: '#D97706',
    promo: '#0D9488',
  }
  return colors[(type || '').toLowerCase()] || '#64748B'
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
  transition: opacity 0.25s ease;
}
.skeleton-fade-enter-from,
.skeleton-fade-leave-to {
  opacity: 0;
}
</style>
