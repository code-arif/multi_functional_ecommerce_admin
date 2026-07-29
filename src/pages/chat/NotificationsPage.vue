<template>
  <div>
    <PageHeader title="Notifications" subtitle="System and user notifications">
      <button class="btn-ghost text-sm gap-1.5" @click="markAllRead"><CheckIcon class="w-4 h-4" />Mark All Read</button>
    </PageHeader>
    <transition name="skeleton-fade" mode="out-in">
      <!-- Skeleton -->
      <div v-if="loading" key="skeleton">
        <NotificationsSkeleton />
      </div>

      <!-- Real Content -->
      <div v-else key="content" class="space-y-2">
        <div v-for="(group, gIdx) in groupedNotifications" :key="gIdx" class="mb-6">
          <p class="text-xs font-semibold uppercase tracking-wide mb-3 px-1" :style="{ color: 'var(--text-muted)' }">{{ group.date }}</p>
          <div v-for="(notif, i) in group.items" :key="i" class="card p-4 flex items-start gap-4 transition hover:shadow-md cursor-pointer" :class="notif.read ? 'opacity-70' : ''" :style="{ borderLeft: notif.read ? '' : '3px solid var(--color-primary)' }" @click="notif.read = true">
            <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" :style="{ backgroundColor: notifIconBg(notif.type), color: notifIconColor(notif.type) }">
              <component :is="notifIcon(notif.type)" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">{{ notif.title }}</p>
                  <p class="text-sm mt-0.5" :style="{ color: 'var(--text-secondary)' }">{{ notif.message }}</p>
                </div>
                <span class="text-[10px] shrink-0" :style="{ color: 'var(--text-muted)' }">{{ notif.time }}</span>
              </div>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full" :style="{ backgroundColor: notifTypeBg(notif.type), color: notifTypeColor(notif.type) }">{{ notif.type }}</span>
                <span v-if="!notif.read" class="w-2 h-2 rounded-full" :style="{ backgroundColor: 'var(--color-primary)' }"></span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!notifications.length" class="text-center py-16" :style="{ color: 'var(--text-muted)' }">
          <BellIcon class="w-12 h-12 mx-auto mb-3" />
          <p class="font-semibold text-lg" :style="{ color: 'var(--text-primary)' }">No notifications</p>
          <p class="text-sm mt-1">You're all caught up!</p>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@ecom/ui/components/PageHeader.vue'
import NotificationsSkeleton from '@/components/skeletons/NotificationsSkeleton.vue'
import { BellIcon, CheckIcon, ShoppingBagIcon, StarIcon, TicketIcon, UserIcon, ExclamationTriangleIcon, MegaphoneIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)

const notifications = ref([
  {id:1,type:'order',title:'New Order Received',message:'Order #1024 has been placed by Sarah Johnson - ৳2,450',time:'5m ago',read:false,date:'Today'},
  {id:2,type:'review',title:'New Product Review',message:'Mike Chen left a 5-star review on Wireless Headphones',time:'12m ago',read:false,date:'Today'},
  {id:3,type:'coupon',title:'Coupon Expiring Soon',message:'Coupon code SUMMER20 expires in 2 days',time:'1h ago',read:false,date:'Today'},
  {id:4,type:'user',title:'New User Registered',message:'Emily Davis has created a new account',time:'2h ago',read:true,date:'Today'},
  {id:5,type:'alert',title:'Low Stock Alert',message:'Product "Ergonomic Mouse" has only 3 units left',time:'3h ago',read:false,date:'Today'},
  {id:6,type:'order',title:'Order Shipped',message:'Order #1018 has been shipped successfully',time:'5h ago',read:true,date:'Yesterday'},
  {id:7,type:'promo',title:'Campaign Ended',message:'Flash Sale campaign has ended - 156 orders placed',time:'1d ago',read:true,date:'Yesterday'},
  {id:8,type:'review',title:'Low Rating Alert',message:'Product "Tablet Stand" received a 2-star review',time:'1d ago',read:false,date:'Yesterday'},
  {id:9,type:'alert',title:'Payment Failed',message:'Transaction #T-8921 failed due to insufficient balance',time:'2d ago',read:true,date:'Earlier'},
  {id:10,type:'user',title:'Vendor Approved',message:'Vendor "TechGadgets" has been approved successfully',time:'3d ago',read:true,date:'Earlier'},
])

const groupedNotifications = computed(() => {
  const groups = {}
  notifications.value.forEach(n => {
    if (!groups[n.date]) groups[n.date] = { date: n.date, items: [] }
    groups[n.date].items.push(n)
  })
  return Object.values(groups)
})

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}

function notifIcon(type) {
  const icons = { order: ShoppingBagIcon, review: StarIcon, coupon: TicketIcon, user: UserIcon, alert: ExclamationTriangleIcon, promo: MegaphoneIcon }
  return icons[type] || BellIcon
}

function notifIconBg(type) {
  const colors = { order: '#2E7D32', review: '#7C3AED', coupon: '#D97706', user: '#2563EB', alert: '#DC2626', promo: '#0D9488' }
  return `color-mix(in srgb, ${colors[type] || '#64748B'} 15%, transparent)`
}

function notifIconColor(type) {
  const colors = { order: '#2E7D32', review: '#7C3AED', coupon: '#D97706', user: '#2563EB', alert: '#DC2626', promo: '#0D9488' }
  return colors[type] || '#64748B'
}

function notifTypeBg(type) {
  const colors = { order: '#2E7D32', review: '#7C3AED', coupon: '#D97706', user: '#2563EB', alert: '#DC2626', promo: '#0D9488' }
  return `color-mix(in srgb, ${colors[type] || '#64748B'} 12%, transparent)`
}

function notifTypeColor(type) {
  const colors = { order: '#2E7D32', review: '#7C3AED', coupon: '#D97706', user: '#2563EB', alert: '#DC2626', promo: '#0D9488' }
  return colors[type] || '#64748B'
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 1200)
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
