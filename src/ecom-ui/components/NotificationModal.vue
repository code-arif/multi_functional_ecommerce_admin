<template>
    <transition name="panel-slide">
        <div v-if="isOpen"
            class="absolute right-0 mt-2 w-[410px] bg-white rounded-xl shadow-xl border border-slate-200 z-[80] overflow-hidden origin-top-right">
            <div class="absolute -top-2 right-6 w-4 h-4 rotate-45 bg-white border-l border-t border-slate-200" />
            <div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-800">Notifications</h3>
                    <span v-if="computedUnreadCount > 0" class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {{ computedUnreadCount }} new
                    </span>
                    <span v-else-if="notifications.length" class="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {{ notifications.length }}
                    </span>
                </div>
                <div class="flex items-center gap-1">
                    <button v-if="computedUnreadCount > 0" @click="handleMarkAllRead" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition">
                        Mark all read
                    </button>
                    <button @click="close" class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <XMarkIcon class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <!-- Category Tabs -->
            <div class="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
                <button v-for="tab in filterTabs" :key="tab.key" @click="activeTab = tab.key"
                    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                    :class="activeTab === tab.key ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'">
                    <component :is="tab.icon" class="w-3.5 h-3.5" /> {{ tab.label }}
                    <span v-if="tabUnreadCount(tab.key) > 0"
                        class="text-[10px] font-bold px-1.5 py-0.2 rounded-full"
                        :class="activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'">
                        {{ tabUnreadCount(tab.key) }}
                    </span>
                </button>
            </div>

            <!-- List -->
            <div class="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
                <div v-for="notification in filteredNotifications" :key="notification.id"
                    class="relative flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition cursor-pointer group"
                    :class="{ 'bg-emerald-50/25': !isItemRead(notification) }"
                    @click="handleItemClick(notification)">
                    
                    <div class="pt-2 shrink-0">
                        <div class="w-2 h-2 rounded-full" :class="isItemRead(notification) ? 'bg-transparent' : 'bg-emerald-500'" />
                    </div>

                    <div class="shrink-0 mt-0.5">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="getIconBgClass(notification.type)">
                            <component :is="getIconComponent(notification.type)" class="w-4 h-4" :class="getIconColorClass(notification.type)" />
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-baseline justify-between gap-2">
                            <p class="text-xs font-bold text-slate-900 truncate">{{ notification.title || 'Notification' }}</p>
                            <span class="text-[10px] text-slate-400 shrink-0">{{ formatTime(notification.created_at || notification.createdAt) }}</span>
                        </div>
                        <p class="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{{ notification.message }}</p>
                        
                        <span v-if="notification.action_url" class="inline-block mt-1 text-[10px] font-semibold text-emerald-600 hover:underline">
                            View details &rarr;
                        </span>
                    </div>

                    <div class="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button v-if="!isItemRead(notification)" @click.stop="handleMarkRead(notification.id)"
                            class="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition" title="Mark as read">
                            <CheckCircleIcon class="w-3.5 h-3.5" />
                        </button>
                        <button @click.stop="handleDelete(notification.id)"
                            class="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition" title="Dismiss">
                            <TrashIcon class="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="!filteredNotifications.length" class="py-12 text-center">
                <BellIcon class="w-9 h-9 text-slate-300 mx-auto mb-2" />
                <p class="text-xs font-semibold text-slate-600">No {{ activeTab === 'all' ? '' : activeTab }} notifications</p>
                <p class="text-[11px] text-slate-400 mt-0.5">You're all caught up!</p>
            </div>

            <!-- Footer View All -->
            <div class="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 text-center">
                <router-link to="/notifications" @click="close" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1">
                    View All Notifications
                    <ArrowTopRightOnSquareIcon class="w-3 h-3" />
                </router-link>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
    BellIcon,
    XMarkIcon,
    CheckCircleIcon,
    TrashIcon,
    ShoppingBagIcon,
    ExclamationTriangleIcon,
    UserPlusIcon,
    StarIcon,
    CurrencyDollarIcon,
    BuildingStorefrontIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    notifications: { type: Array, default: () => [] },
    unreadCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:isOpen', 'markAsRead', 'markAllAsRead', 'delete', 'navigate'])

const filterTabs = [
    { key: 'all', label: 'All', icon: BellIcon },
    { key: 'vendor', label: 'Vendors', icon: BuildingStorefrontIcon },
    { key: 'order', label: 'Orders', icon: ShoppingBagIcon },
    { key: 'inventory', label: 'Inventory', icon: ExclamationTriangleIcon },
    { key: 'user', label: 'Users', icon: UserPlusIcon },
    { key: 'review', label: 'Reviews', icon: StarIcon },
    { key: 'affiliate', label: 'Affiliate', icon: CurrencyDollarIcon },
]

const activeTab = ref('all')

const isItemRead = (n) => {
    if (typeof n.is_read === 'boolean') return n.is_read
    if (typeof n.isRead === 'boolean') return n.isRead
    return n.read_at !== null && n.read_at !== undefined
}

const filteredNotifications = computed(() => {
    if (activeTab.value === 'all') return props.notifications
    return props.notifications.filter(n => (n.type || '').toLowerCase() === activeTab.value)
})

const computedUnreadCount = computed(() => {
    if (typeof props.unreadCount === 'number' && props.unreadCount >= 0) {
        return props.unreadCount
    }
    return props.notifications.filter(n => !isItemRead(n)).length
})

const tabUnreadCount = (key) => {
    if (key === 'all') {
        return props.notifications.filter(n => !isItemRead(n)).length
    }
    return props.notifications.filter(n => (n.type || '').toLowerCase() === key && !isItemRead(n)).length
}

const close = () => {
    activeTab.value = 'all'
    emit('update:isOpen', false)
}

const handleMarkRead = (id) => emit('markAsRead', id)
const handleMarkAllRead = () => emit('markAllAsRead')
const handleDelete = (id) => emit('delete', id)

const handleItemClick = (notification) => {
    if (!isItemRead(notification)) {
        emit('markAsRead', notification.id)
    }
    emit('navigate', notification)
    close()
}

const formatTime = (date) => {
    if (!date) return ''
    const diffMs = Date.now() - new Date(date).getTime()
    const m = Math.floor(diffMs / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d < 7 ? `${d}d ago` : new Date(date).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })
}

const getIconComponent = (type) => ({
    vendor: BuildingStorefrontIcon,
    order: ShoppingBagIcon,
    inventory: ExclamationTriangleIcon,
    user: UserPlusIcon,
    review: StarIcon,
    affiliate: CurrencyDollarIcon,
}[(type || '').toLowerCase()] || BellIcon)

const getIconBgClass = (type) => ({
    vendor: 'bg-emerald-50',
    order: 'bg-blue-50',
    inventory: 'bg-amber-50',
    user: 'bg-green-50',
    review: 'bg-yellow-50',
    affiliate: 'bg-purple-50',
}[(type || '').toLowerCase()] || 'bg-gray-100')

const getIconColorClass = (type) => ({
    vendor: 'text-emerald-600',
    order: 'text-blue-600',
    inventory: 'text-amber-600',
    user: 'text-green-600',
    review: 'text-yellow-600',
    affiliate: 'text-purple-600',
}[(type || '').toLowerCase()] || 'text-gray-500')
</script>

<style scoped>
.panel-slide-enter-active { transition: all 0.18s ease-out; }
.panel-slide-leave-active { transition: all 0.12s ease-in; }
.panel-slide-enter-from { opacity: 0; transform: translateY(-8px) scale(.97); }
.panel-slide-leave-to { opacity: 0; transform: translateY(-4px) scale(.97); }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
