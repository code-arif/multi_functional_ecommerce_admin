<template>
    <transition name="panel-slide">
        <div v-if="isOpen"
            class="absolute right-0 mt-2 w-[400px] bg-white rounded-xl shadow-lg border border-slate-200 z-[80] overflow-hidden origin-top-right">
            <div class="absolute -top-2 right-6 w-4 h-4 rotate-45 bg-white border-l border-t border-slate-200" />

            <div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-800">Notifications</h3>
                    <span v-if="notifications.length"
                        class="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {{ unreadCount }} new
                    </span>
                </div>
                <div class="flex items-center gap-1">
                    <button v-if="unreadCount > 0" @click="handleMarkAllRead"
                        class="text-xs font-medium text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition">
                        Mark all read
                    </button>
                    <button @click="close"
                        class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <XMarkIcon class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div class="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                <div v-for="notification in notifications" :key="notification.id"
                    class="relative flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition cursor-pointer group"
                    :class="{ 'bg-green-50/30': !notification.isRead }"
                    @click="!notification.isRead && handleMarkRead(notification.id)">

                    <div class="pt-1.5 shrink-0">
                        <div class="w-2 h-2 rounded-full"
                            :class="notification.isRead ? 'bg-transparent' : 'bg-green-500'" />
                    </div>

                    <div class="shrink-0">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center"
                            :class="getIconBgClass(notification.type)">
                            <component :is="getIconComponent(notification.type)" class="w-4 h-4"
                                :class="getIconColorClass(notification.type)" />
                        </div>
                    </div>

                    <div class="flex-1 min-w-0">
                        <p class="text-sm text-slate-900 font-medium">{{ notification.title }}</p>
                        <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ notification.message }}</p>
                        <p class="text-xs text-slate-400 mt-1">{{ formatTime(notification.createdAt) }}</p>
                    </div>

                    <div class="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button v-if="!notification.isRead" @click.stop="handleMarkRead(notification.id)"
                            class="p-1.5 rounded-md text-slate-400 hover:text-green-600 hover:bg-green-50 transition"
                            title="Mark as read">
                            <CheckCircleIcon class="w-3.5 h-3.5" />
                        </button>
                        <button @click.stop="handleDelete(notification.id)"
                            class="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="Delete">
                            <TrashIcon class="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="!notifications.length" class="py-12 text-center">
                <BellIcon class="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p class="text-sm text-slate-400">No notifications</p>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { computed } from 'vue'
import {
    BellIcon,
    XMarkIcon,
    CheckCircleIcon,
    TrashIcon,
    ShoppingBagIcon,
    ExclamationTriangleIcon,
    UserPlusIcon,
    StarIcon,
    CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
    isOpen: { type: Boolean, default: false },
    notifications: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:isOpen', 'markAsRead', 'markAllAsRead', 'delete'])

const unreadCount = computed(() => props.notifications.filter(n => !n.isRead).length)

const close = () => emit('update:isOpen', false)
const handleMarkRead = (id) => emit('markAsRead', id)
const handleMarkAllRead = () => emit('markAllAsRead')
const handleDelete = (id) => emit('delete', id)

const formatTime = (date) => {
    if (!date) return ''
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(date).toLocaleDateString()
}

const getIconComponent = (type) => {
    const icons = {
        order: ShoppingBagIcon,
        inventory: ExclamationTriangleIcon,
        user: UserPlusIcon,
        review: StarIcon,
        affiliate: CurrencyDollarIcon
    }
    return icons[type] || BellIcon
}

const getIconBgClass = (type) => {
    const classes = {
        order: 'bg-blue-50',
        inventory: 'bg-amber-50',
        user: 'bg-green-50',
        review: 'bg-yellow-50',
        affiliate: 'bg-purple-50'
    }
    return classes[type] || 'bg-gray-50'
}

const getIconColorClass = (type) => {
    const classes = {
        order: 'text-blue-500',
        inventory: 'text-amber-500',
        user: 'text-green-500',
        review: 'text-yellow-500',
        affiliate: 'text-purple-500'
    }
    return classes[type] || 'text-gray-500'
}
</script>

<style scoped>
.panel-slide-enter-active {
    transition: all 0.18s ease-out;
}

.panel-slide-leave-active {
    transition: all 0.12s ease-in;
}

.panel-slide-enter-from {
    opacity: 0;
    transform: translateY(-8px) scale(.97);
}

.panel-slide-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(.97);
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>