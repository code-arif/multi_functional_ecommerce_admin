<template>
    <header class="navbar h-16 flex items-center px-4 lg:px-6 gap-2 shrink-0"
        :style="{
            backgroundColor: 'var(--navbar-bg)',
            borderBottom: '1px solid var(--navbar-border)'
        }">
        <!-- Toggle -->
        <button @click="$emit('toggle-sidebar')"
            class="navbar-btn p-2 rounded-lg transition"
            :style="{ color: 'var(--navbar-text)' }">
            <Bars3Icon class="w-5 h-5" />
        </button>

        <!-- Page Title -->
        <div>
            <h1 class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ pageTitle }}</h1>
        </div>

        <!-- Right -->
        <div class="ml-auto flex items-center gap-1">
            <!-- Theme Switcher -->
            <div class="relative" ref="themeSwitcherRef">
                <button @click="isThemeOpen = !isThemeOpen"
                    class="navbar-btn p-2 rounded-lg transition flex items-center justify-center"
                    :style="{
                        backgroundColor: isThemeOpen ? 'var(--border-light)' : 'transparent'
                    }"
                    @mouseenter="e => { if(!isThemeOpen) e.target.style.backgroundColor = 'var(--border-light)' }"
                    @mouseleave="e => { if(!isThemeOpen) e.target.style.backgroundColor = 'transparent' }"
                    :title="'Theme: ' + (theme.themes.find(t => t.id === theme.colorTheme)?.label || theme.colorTheme)">
                    <span class="w-[18px] h-[18px] rounded-full ring-2 ring-offset-1 transition-all"
                        :style="{
                            backgroundColor: currentThemeColor,
                            '--tw-ring-color': currentThemeColor
                        }"></span>
                </button>

                <transition name="dropdown">
                    <div v-if="isThemeOpen"
                        class="absolute right-0 mt-2 w-[280px] rounded-xl shadow-lg border py-3 px-3 z-[80] overflow-hidden"
                        :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-dropdown)' }">
                        <p class="text-xs font-semibold uppercase tracking-wide mb-3"
                            :style="{ color: 'var(--text-muted)' }">Color Theme</p>
                        <div class="grid grid-cols-4 gap-2">
                            <button v-for="t in theme.themes" :key="t.id"
                                @click="theme.setColorTheme(t.id)"
                                class="flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-all"
                                :class="theme.colorTheme === t.id ? 'ring-2 shadow-sm' : 'opacity-75 hover:opacity-100'"
                                :style="{
                                    backgroundColor: theme.colorTheme === t.id ? t.light : 'transparent',
                                    '--tw-ring-color': t.color,
                                    color: theme.colorTheme === t.id ? t.color : 'var(--navbar-text)'
                                }"
                                :title="t.label">
                                <span class="w-6 h-6 rounded-full"
                                    :style="{ backgroundColor: t.color }"></span>
                                <span class="text-[10px] font-medium truncate w-full text-center">{{ t.label }}</span>
                            </button>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- Notification -->
            <div class="relative" ref="notificationRef">
                <button @click="toggleNotification"
                    class="navbar-btn p-2 rounded-lg transition"
                    :style="{
                        color: 'var(--navbar-text)',
                        backgroundColor: isNotificationOpen ? 'var(--border-light)' : 'transparent'
                    }"
                    @mouseenter="e => { if(!isNotificationOpen) e.target.style.backgroundColor = 'var(--border-light)' }"
                    @mouseleave="e => { if(!isNotificationOpen) e.target.style.backgroundColor = 'transparent' }">
                    <BellIcon class="w-5 h-5" />
                    <span v-if="unreadCount > 0"
                        class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        :style="{ backgroundColor: 'var(--danger)' }" />
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
                    class="relative rounded-full overflow-hidden transition shrink-0 navbar-profile-ring"
                    :style="{
                        boxShadow: isProfileDropdownOpen
                            ? '0 0 0 2px var(--color-primary)'
                            : '0 0 0 2px var(--border)'
                    }">
                    <img src="https://i.pravatar.cc/100?img=12" alt="Admin" class="w-10 h-10 object-cover" />
                </button>

                <transition name="dropdown">
                    <div v-if="isProfileDropdownOpen"
                        class="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-1 z-[80] overflow-hidden"
                        :style="{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                            boxShadow: 'var(--shadow-dropdown)'
                        }">
                        <div class="px-4 py-3 border-b"
                            :style="{ borderColor: 'var(--border)' }">
                            <p class="text-sm font-semibold truncate"
                                :style="{ color: 'var(--text-primary)' }">{{ auth.userName }}</p>
                            <p class="text-xs truncate"
                                :style="{ color: 'var(--text-muted)' }">{{ auth.userEmail }}</p>
                        </div>

                        <button @click="openProfile"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
                            :style="{ color: 'var(--navbar-text)' }"
                            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
                            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
                            <UserIcon class="w-4 h-4" />
                            Profile
                        </button>

                        <a :href="storeUrl" target="_blank" @click="isProfileDropdownOpen = false"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition border-t"
                            :style="{
                                color: 'var(--navbar-text)',
                                borderTopColor: 'var(--border)'
                            }"
                            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
                            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
                            <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                            View Store
                        </a>

                        <button @click="auth.logout()"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition border-t"
                            :style="{
                                color: 'var(--danger)',
                                borderTopColor: 'var(--border)'
                            }"
                            @mouseenter="e => e.target.style.backgroundColor = 'color-mix(in srgb, var(--danger) 8%, transparent)'"
                            @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
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
import { useThemeStore } from '@/stores/theme'

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
const theme = useThemeStore()

const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:3000'

/* ---------- Current theme color for trigger button ---------- */
const currentThemeColor = computed(() => {
    const found = theme.themes.find(t => t.id === theme.colorTheme)
    return found?.color || '#2E7D32'
})

/* ---------- Theme Switcher ---------- */
const isThemeOpen = ref(false)
const themeSwitcherRef = ref(null)

/* ---------- Notification Panel ---------- */
const isNotificationOpen = ref(false)
const notificationRef = ref(null)

function toggleNotification() {
    isNotificationOpen.value = !isNotificationOpen.value
    if (isNotificationOpen.value) { isProfileDropdownOpen.value = false; isThemeOpen.value = false }
}

/* ---------- Profile Dropdown ---------- */
const isProfileDropdownOpen = ref(false)
const profileDropdownRef = ref(null)

function toggleProfileDropdown() {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value
    if (isProfileDropdownOpen.value) { isNotificationOpen.value = false; isThemeOpen.value = false }
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
    if (themeSwitcherRef.value && !themeSwitcherRef.value.contains(event.target)) {
        isThemeOpen.value = false
    }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

/* ---------- Page Title ---------- */
const pageRoutes = [
    { path: '/', title: 'Dashboard' },
    { path: '/vendors', title: 'All Vendors' },
    { path: '/vendors/pending', title: 'Pending Approval Vendors' },
    { path: '/shops', title: 'All Shops' },
    { path: '/shops/pending', title: 'Pending Approval Shops' },
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
    { path: '/reports', title: 'Sales Reports' },
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
    { path: '/messages', title: 'Chat' },
    { path: '/notifications', title: 'Notifications' },
    { path: '/emails', title: 'Emails' },
    { path: '/settings', title: 'Settings' },
]

const pageTitle = computed(() => {
    const path = route.path
    const match = [...pageRoutes].reverse().find(r => path.startsWith(r.path))
    return match?.title || 'Dashboard'
})
</script>

<style scoped>
/* Navbar theme-aware button hover states */
.navbar-btn {
    transition: background-color 0.15s ease, color 0.15s ease;
}
.navbar-btn:hover {
    background-color: var(--border-light);
}

/* Profile ring */
.navbar-profile-ring {
    transition: box-shadow 0.2s ease;
}
.navbar-profile-ring:hover {
    box-shadow: 0 0 0 2px var(--color-primary) !important;
}

/* Dropdown transitions */
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
