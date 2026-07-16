<template>
    <header class="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-4 shrink-0">
        <!-- Toggle -->
        <button @click="$emit('toggle-sidebar')" class="p-2 rounded-lg hover:bg-slate-100 transition">
            <Bars3Icon class="w-5 h-5 text-slate-700" />
        </button>

        <!-- Page Title -->
        <div>
            <h1 class="font-bold text-slate-800">{{ pageTitle }}</h1>
        </div>

        <!-- Right -->
        <div class="ml-auto flex items-center gap-2">
            <!-- Notification -->
            <div class="relative" ref="notificationRef">
                <button @click="toggleNotification"
                    class="relative p-2 rounded-lg hover:bg-slate-100 transition">
                    <BellIcon class="w-5 h-5 text-slate-700" />
                    <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>

                <NotificationModal
                    v-model:isOpen="isNotificationOpen"
                    :notifications="notifications"
                    @mark-as-read="id => emit('markAsRead', id)"
                    @mark-all-as-read="emit('markAllAsRead')"
                    @delete="id => emit('deleteNotification', id)"
                />
            </div>

            <!-- Admin Profile Dropdown -->
            <div class="relative" ref="profileDropdownRef">
                <button @click="toggleProfileDropdown"
                    class="relative rounded-full overflow-hidden ring-2 transition shrink-0"
                    :class="isProfileDropdownOpen ? 'ring-green-500' : 'ring-slate-200 hover:ring-green-500'">
                    <img src="https://i.pravatar.cc/100?img=12" alt="Admin" class="w-10 h-10 object-cover" />
                </button>

                <transition name="dropdown">
                    <div v-if="isProfileDropdownOpen"
                        class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-[80] overflow-hidden">
                        <div class="px-4 py-3 border-b border-slate-100">
                            <p class="text-sm font-semibold text-slate-800 truncate">{{ auth.userName }}</p>
                            <p class="text-xs text-slate-500 truncate">{{ auth.userEmail }}</p>
                        </div>

                        <button @click="openProfile"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
                            <UserIcon class="w-4 h-4" />
                            Profile
                        </button>

                        <a :href="storeUrl" target="_blank" @click="isProfileDropdownOpen = false"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition border-t border-slate-100">
                            <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                            View Store
                        </a>

                        <button @click="auth.logout()"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition border-t border-slate-100">
                            <ArrowRightOnRectangleIcon class="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </transition>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import {
    Bars3Icon,
    BellIcon,
    ArrowTopRightOnSquareIcon,
    UserIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import NotificationModal from '@/components/common/NotificationModal.vue'

defineProps({
    unreadCount: { type: Number, default: 0 },
    notifications: { type: Array, default: () => [] }
})

const emit = defineEmits(['toggle-sidebar', 'open-notification', 'open-profile', 'markAsRead', 'markAllAsRead', 'deleteNotification'])

const route = useRoute()
const auth = useAuthStore()

const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:3000'

/* ---------- Notification Panel ---------- */
const isNotificationOpen = ref(false)
const notificationRef = ref(null)

function toggleNotification() {
    isNotificationOpen.value = !isNotificationOpen.value
    if (isNotificationOpen.value) isProfileDropdownOpen.value = false
}

/* ---------- Profile Dropdown ---------- */
const isProfileDropdownOpen = ref(false)
const profileDropdownRef = ref(null)

function toggleProfileDropdown() {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value
    if (isProfileDropdownOpen.value) isNotificationOpen.value = false
}

function openProfile() {
    isProfileDropdownOpen.value = false
    emit('open-profile')
}

function handleClickOutside(event) {
    if (profileDropdownRef.value && !profileDropdownRef.value.contains(event.target)) {
        isProfileDropdownOpen.value = false
    }
    if (notificationRef.value && !notificationRef.value.contains(event.target)) {
        isNotificationOpen.value = false
    }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

/* ---------- Page Title ---------- */
const pageRoutes = [
    { path: '/', title: 'Dashboard' },
    { path: '/vendors/pending', title: 'Pending Approval Vendors' },
    { path: '/vendors', title: 'All Vendors' },
    { path: '/shops/pending', title: 'Pending Approval Shops' },
    { path: '/shops', title: 'All Shops' },
    { path: '/products', title: 'Products' },
    { path: '/categories', title: 'Categories' },
    { path: '/brands', title: 'Brands' },
    { path: '/coupons', title: 'Coupons' },
    { path: '/affiliate', title: 'Affiliate' },
    { path: '/orders', title: 'All Orders' },
    { path: '/transactions', title: 'Transactions' },
    { path: '/campaigns', title: 'Campaigns' },
    { path: '/reviews', title: 'Reviews' },
    { path: '/users', title: 'Customers' },
    { path: '/admins', title: 'Admins' },
    { path: '/roles', title: 'Roles' },
    { path: '/permissions', title: 'Permissions' },
    { path: '/cms', title: 'CMS Pages' },
    { path: '/banners', title: 'Banners' },
    { path: '/reports/customer', title: 'Customer Reports' },
    { path: '/reports/product', title: 'Product Reports' },
    { path: '/reports/vendor', title: 'Vendor Reports' },
    { path: '/reports/shop', title: 'Shop Reports' },
    { path: '/reports/affiliate', title: 'Affiliate Reports' },
    { path: '/reports/coupon', title: 'Coupon Reports' },
    { path: '/reports/campaign', title: 'Campaign Reports' },
    { path: '/reports/review', title: 'Review Reports' },
    { path: '/reports/notification', title: 'Notification Reports' },
    { path: '/reports/email', title: 'Email Reports' },
    { path: '/reports/system', title: 'System Reports' },
    { path: '/reports', title: 'Sales Reports' },
    { path: '/messages', title: 'Chat' },
    { path: '/notifications', title: 'Notifications' },
    { path: '/emails', title: 'Emails' },
    { path: '/settings', title: 'Settings' },
]

const pageTitle = computed(() => {
    const path = route.path
    // Match most specific path first (longer matches take priority)
    const match = [...pageRoutes].reverse().find(r => path.startsWith(r.path))
    return match?.title || 'Dashboard'
})
</script>

<style scoped>
.dropdown-enter-active {
    transition: all 0.18s ease-out;
}

.dropdown-leave-active {
    transition: all 0.12s ease-in;
}

.dropdown-enter-from {
    opacity: 0;
    transform: translateY(-6px) scale(.96);
}

.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(.96);
}
</style>
