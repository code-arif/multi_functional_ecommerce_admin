<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
                <!-- Backdrop -->
                <div class="fixed inset-0 bg-black/50 transition-opacity" @click="closeModal" />

                <!-- Modal Panel -->
                <div class="flex min-h-full items-center justify-center p-4">
                    <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                        <!-- Header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                            <div class="flex items-center gap-3">
                                <BellIcon class="w-5 h-5 text-gray-500" />
                                <h2 class="text-lg font-semibold text-gray-900">Notifications</h2>
                                <span v-if="notifications.length"
                                    class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {{ unreadCount }} unread
                                </span>
                            </div>
                            <button @click="closeModal"
                                class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Action Bar -->
                        <div v-if="notifications.length"
                            class="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                                    class="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]" />
                                <span class="text-xs text-gray-500">{{ selectedIds.length }} selected</span>
                                <button v-if="selectedIds.length" @click="deleteSelected"
                                    class="text-xs text-red-500 hover:text-red-700 font-medium transition">
                                    Delete selected
                                </button>
                            </div>
                            <button v-if="unreadCount > 0" @click="$emit('markAllAsRead')"
                                class="text-xs font-medium text-[#2E7D32] hover:text-[#1B5E20] transition">
                                Mark all as read
                            </button>
                        </div>

                        <!-- Notification List -->
                        <div class="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
                            <div v-for="notification in notifications" :key="notification.id"
                                class="group relative hover:bg-gray-50 transition-colors"
                                :class="{ 'bg-gray-50/50': !notification.isRead }">
                                <div class="flex items-start gap-3 px-6 py-4">
                                    <!-- Checkbox -->
                                    <div class="pt-0.5">
                                        <input type="checkbox" :value="notification.id" v-model="selectedIds"
                                            class="w-4 h-4 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]" />
                                    </div>

                                    <!-- Icon based on type -->
                                    <div class="shrink-0">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center"
                                            :class="getIconBgClass(notification.type)">
                                            <component :is="getIconComponent(notification.type)" class="w-4 h-4"
                                                :class="getIconColorClass(notification.type)" />
                                        </div>
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-start justify-between gap-2">
                                            <div>
                                                <p class="text-sm font-medium text-gray-900"
                                                    :class="{ 'font-semibold': !notification.isRead }">
                                                    {{ notification.title }}
                                                </p>
                                                <p class="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                                    {{ notification.message }}
                                                </p>
                                                <p class="text-xs text-gray-400 mt-1.5">
                                                    {{ formatTime(notification.createdAt) }}
                                                </p>
                                            </div>

                                            <!-- Action buttons (visible on hover) -->
                                            <div
                                                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button v-if="!notification.isRead"
                                                    @click="$emit('markAsRead', notification.id)"
                                                    class="p-1.5 rounded-md text-gray-400 hover:text-[#2E7D32] hover:bg-green-50 transition"
                                                    title="Mark as read">
                                                    <CheckCircleIcon class="w-4 h-4" />
                                                </button>
                                                <button @click="$emit('delete', notification.id)"
                                                    class="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                                    title="Delete">
                                                    <TrashIcon class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-if="!notifications.length" class="py-12 text-center">
                            <BellIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p class="text-gray-400 text-sm">No notifications yet</p>
                        </div>

                        <!-- Footer -->
                        <div class="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button @click="closeModal"
                                class="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
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
    CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    notifications: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits([
    'update:isOpen',
    'markAsRead',
    'markAllAsRead',
    'delete',
    'deleteSelected'
])

const selectedIds = ref([])

const unreadCount = computed(() => props.notifications.filter(n => !n.isRead).length)
const isAllSelected = computed(() => {
    return props.notifications.length > 0 && selectedIds.value.length === props.notifications.length
})

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedIds.value = []
    } else {
        selectedIds.value = props.notifications.map(n => n.id)
    }
}

const deleteSelected = () => {
    if (selectedIds.value.length) {
        emit('deleteSelected', [...selectedIds.value])
        selectedIds.value = []
    }
}

const closeModal = () => {
    emit('update:isOpen', false)
    selectedIds.value = []
}

const formatTime = (date) => {
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
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
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>