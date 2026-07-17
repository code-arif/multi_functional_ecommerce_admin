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
                    class="navbar-btn p-2 rounded-lg transition"
                    :style="{
                        color: 'var(--navbar-text)',
                        backgroundColor: isThemeOpen ? 'var(--border-light)' : 'transparent'
                    }"
                    @mouseenter="e => { if(!isThemeOpen) e.target.style.backgroundColor = 'var(--border-light)' }"
                    @mouseleave="e => { if(!isThemeOpen) e.target.style.backgroundColor = 'transparent' }"
                    title="Change theme">
                    <SwatchIcon class="w-5 h-5" />
                </button>

                <transition name="dropdown">
                    <div v-if="isThemeOpen"
                        class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[80] overflow-hidden"
                        :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-dropdown)' }">
                        <!-- Color Theme Picker -->
                        <div class="px-3 pb-2 border-b"
                            :style="{ borderColor: 'var(--border)' }">
                            <p class="text-xs font-semibold uppercase tracking-wide mb-2"
                                :style="{ color: 'var(--text-muted)' }">Color Theme</p>
                            <div class="flex gap-2">
                                <button v-for="t in theme.themes" :key="t.id"
                                    @click="theme.setColorTheme(t.id)"
                                    class="flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all"
                                    :class="theme.colorTheme === t.id
                                        ? 'ring-2 shadow-sm'
                                        : 'opacity-70 hover:opacity-100'"
                                    :style="{
                                        backgroundColor: theme.colorTheme === t.id
                                            ? t.id === 'default' ? '#E8F5E9'
                                                : t.id === 'tint' ? '#DBEAFE'
                                                : '#CCFBF1'
                                            : 'transparent',
                                        ringColor: t.id === 'default' ? '#2E7D32'
                                            : t.id === 'tint' ? '#2563EB'
                                            : '#0D9488',
                                        color: theme.colorTheme === t.id
                                            ? t.id === 'default' ? '#1B5E20'
                                                : t.id === 'tint' ? '#1D4ED8'
                                                : '#0F766E'
                                            : 'var(--navbar-text)'
                                    }">
                                    <span class="text-lg">{{ t.icon }}</span>
                                    <span>{{ t.label }}</span>
                                </button>
                            </div>
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
    ArrowRightOnRectangleIcon,
    SwatchIcon
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
