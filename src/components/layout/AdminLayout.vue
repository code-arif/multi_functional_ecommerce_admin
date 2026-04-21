<template>
    <div class="flex h-screen overflow-hidden bg-slate-50">
        <!-- Sidebar -->
        <aside :class="[
            'fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col lg:relative',
            sidebarOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden'
        ]">
            <!-- Logo -->
            <div class="h-16 border-b border-white/10 flex items-center px-4 gap-3 shrink-0">
                <div class="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center font-black shrink-0">
                    E
                </div>

                <div v-if="sidebarOpen" class="min-w-0">
                    <p class="font-black text-lg leading-none">EcoAdmin</p>
                    <p class="text-[11px] text-slate-400">Super Admin</p>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-2">
                <div v-for="group in navGroups" :key="group.name" class="space-y-1">
                    <!-- Group Button -->
                    <button @click="toggleGroup(group.name)"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition relative group">
                        <component :is="group.icon" class="w-5 h-5 shrink-0 text-slate-300" />

                        <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">
                            {{ group.name }}
                        </span>

                        <ChevronDownIcon v-if="sidebarOpen" class="w-4 h-4 transition-transform"
                            :class="openGroups[group.name] ? 'rotate-180' : ''" />

                        <!-- Tooltip -->
                        <div v-if="!sidebarOpen"
                            class="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
                            {{ group.name }}
                        </div>
                    </button>

                    <!-- Children -->
                    <transition name="slide">
                        <div v-show="openGroups[group.name] && sidebarOpen"
                            class="ml-4 pl-3 border-l border-slate-700 space-y-1">
                            <router-link v-for="item in group.items" :key="item.name" :to="item.to"
                                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition" :class="isActive(item.to)
                                    ? 'bg-green-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    ">
                                <component :is="item.icon" class="w-4 h-4 shrink-0" />

                                <span class="truncate">
                                    {{ item.name }}
                                </span>

                                <span v-if="item.pending"
                                    class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                                    P
                                </span>
                            </router-link>
                        </div>
                    </transition>
                </div>
            </nav>

            <!-- User -->
            <div class="border-t border-white/10 p-3 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-bold shrink-0">
                        {{ auth.userName.charAt(0).toUpperCase() }}
                    </div>

                    <div v-if="sidebarOpen" class="flex-1 min-w-0">
                        <p class="text-sm font-semibold truncate">
                            {{ auth.userName }}
                        </p>
                        <p class="text-xs text-slate-400 truncate">
                            {{ auth.userEmail }}
                        </p>
                    </div>

                    <button v-if="sidebarOpen" @click="auth.logout()"
                        class="p-2 rounded-lg hover:bg-slate-800 transition">
                        <ArrowRightOnRectangleIcon class="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>
        </aside>

        <!-- Mobile Overlay -->
        <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/40 z-40 lg:hidden" />

        <!-- Content -->
        <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
            <!-- Header -->
            <header class="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-4 shrink-0">
                <!-- Toggle -->
                <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg hover:bg-slate-100 transition">
                    <Bars3Icon class="w-5 h-5 text-slate-700" />
                </button>

                <!-- Page Title -->
                <div>
                    <h1 class="font-bold text-slate-800">
                        {{ currentPageTitle }}
                    </h1>
                </div>

                <!-- Right -->
                <div class="ml-auto flex items-center gap-2">
                    <!-- Notification -->
                    <button @click="openNotificationModal"
                        class="relative p-2 rounded-lg hover:bg-slate-100 transition">
                        <BellIcon class="w-5 h-5 text-slate-700" />

                        <span v-if="unreadCount > 0"
                            class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                    </button>

                    <!-- View Store -->
                    <a :href="storeUrl" target="_blank"
                        class="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 border border-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition">
                        <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                        View Store
                    </a>
                </div>
            </header>

            <!-- Main -->
            <main class="flex-1 overflow-y-auto p-4 lg:p-6">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>

    <!-- Notification Modal -->
    <NotificationModal v-model:isOpen="isNotificationModalOpen" :notifications="notifications"
        @mark-as-read="markAsRead" @mark-all-as-read="markAllAsRead" @delete="deleteNotification"
        @delete-selected="deleteSelectedNotifications" />
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationModal from '@/components/common/NotificationModal.vue'

import {
    Bars3Icon,
    ChevronDownIcon,
    Squares2X2Icon,
    BuildingStorefrontIcon,
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    MegaphoneIcon,
    UsersIcon,
    DocumentTextIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    TicketIcon,
    TagIcon,
    StarIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    ArrowTopRightOnSquareIcon,
    LinkIcon,
    PhotoIcon,
    HomeModernIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const auth = useAuthStore()

const sidebarOpen = ref(true)
const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:3000'

/* -----------------------------
   Notification Old Features Keep
------------------------------*/
const isNotificationModalOpen = ref(false)

const notifications = ref([
    {
        id: 1,
        title: 'New order received',
        message: 'Order #ORD-1234 has been placed.',
        isRead: false
    },
    {
        id: 2,
        title: 'Low stock alert',
        message: 'Only 5 products left.',
        isRead: false
    },
])

const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
)

const openNotificationModal = () => {
    isNotificationModalOpen.value = true
}

const markAsRead = id => {
    const item = notifications.value.find(n => n.id === id)
    if (item) item.isRead = true
}

const markAllAsRead = () => {
    notifications.value.forEach(n => (n.isRead = true))
}

const deleteNotification = id => {
    notifications.value = notifications.value.filter(n => n.id !== id)
}

const deleteSelectedNotifications = ids => {
    notifications.value = notifications.value.filter(
        n => !ids.includes(n.id)
    )
}

/* -----------------------------
   Sidebar New Navigation
------------------------------*/
const openGroups = reactive({})

const navGroups = [
    {
        name: 'Dashboard',
        icon: Squares2X2Icon,
        items: [{ name: 'Overview', to: '/', icon: Squares2X2Icon }]
    },
    {
        name: 'Marketplace',
        icon: BuildingStorefrontIcon,
        items: [
            { name: 'All Vendors', to: '/vendors', icon: BuildingStorefrontIcon, pending: true },
            { name: 'Pending Approval Vendors', to: '/vendors/pending', icon: ClipboardDocumentListIcon, pending: true },
            { name: 'All Shops', to: '/shops', icon: HomeModernIcon, pending: true },
            { name: 'Pending Approval Shops', to: '/shops/pending', icon: ClipboardDocumentListIcon, pending: true }
        ]
    },
    {
        name: 'Catalog',
        icon: ShoppingBagIcon,
        items: [
            { name: 'Products', to: '/products', icon: ShoppingBagIcon },
            { name: 'Categories', to: '/categories', icon: TagIcon },
            { name: 'Brands', to: '/brands', icon: StarIcon },
            { name: 'Coupons', to: '/coupons', icon: TicketIcon },
            { name: 'Affiliate', to: '/affiliate', icon: LinkIcon },
        ]
    },
    {
        name: 'Orders',
        icon: ClipboardDocumentListIcon,
        items: [
            { name: 'All Orders', to: '/orders', icon: ClipboardDocumentListIcon },
            { name: 'Transactions', to: '/transactions', icon: BanknotesIcon, pending: true }
        ]
    },
    {
        name: 'Marketing',
        icon: MegaphoneIcon,
        items: [
            { name: 'Campaigns', to: '/campaigns', icon: MegaphoneIcon, pending: true },
            { name: 'Reviews', to: '/reviews', icon: StarIcon }
        ]
    },
    {
        name: 'Users',
        icon: UsersIcon,
        items: [{ name: 'Customers', to: '/users', icon: UsersIcon }]
    },
    {
        name: 'Content',
        icon: DocumentTextIcon,
        items: [
            { name: 'CMS Pages', to: '/cms', icon: DocumentTextIcon },
            { name: 'Banners', to: '/banners', icon: PhotoIcon },
        ]
    },
    {
        name: 'Reports',
        icon: ChartBarIcon,
        items: [
            { name: 'Sales Reports', to: '/reports', icon: ChartBarIcon },
            { name: 'Customer Reports', to: '/reports/customer', icon: UsersIcon, pending: true },
            { name: 'Product Reports', to: '/reports/product', icon: ShoppingBagIcon, pending: true },
            { name: 'Vendor Reports', to: '/reports/vendor', icon: BuildingStorefrontIcon, pending: true },
            { name: 'Shop Reports', to: '/reports/shop', icon: HomeModernIcon, pending: true },
            { name: 'Affiliate Reports', to: '/reports/affiliate', icon: LinkIcon, pending: true },
            { name: 'Coupon Reports', to: '/reports/coupon', icon: TicketIcon, pending: true },
            { name: 'Campaign Reports', to: '/reports/campaign', icon: MegaphoneIcon, pending: true },
            { name: 'Review Reports', to: '/reports/review', icon: StarIcon, pending: true },
            { name: 'Notification Reports', to: '/reports/notification', icon: BellIcon, pending: true },
            { name: 'Email Reports', to: '/reports/email', icon: EnvelopeIcon, pending: true },
            { name: 'System Reports', to: '/reports/system', icon: Cog6ToothIcon, pending: true },
        ]
    },
    {
        name: 'Messages',
        icon: ChatBubbleLeftRightIcon,
        items: [
            { name: 'Chat', to: '/messages', icon: ChatBubbleLeftRightIcon, pending: true },
            { name: 'Notifications', to: '/notifications', icon: BellIcon, pending: true },
            { name: 'Emails', to: '/emails', icon: EnvelopeIcon, pending: true },
        ]
    },
    {
        name: 'System',
        icon: Cog6ToothIcon,
        items: [{ name: 'Settings', to: '/settings', icon: Cog6ToothIcon }]
    }
]

function initializeGroups() {
    navGroups.forEach(group => {
        if (group.items.some(item => item.to === '/')) {
            openGroups[group.name] = route.path === '/'
        } else {
            openGroups[group.name] = group.items.some(item =>
                route.path.startsWith(item.to)
            )
        }
    })
}

initializeGroups()

function toggleGroup(name) {
    openGroups[name] = !openGroups[name]
}

function isActive(path) {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
}

const currentPageTitle = computed(() => {
    const path = route.path

    for (const group of navGroups) {
        for (const item of group.items) {
            if (path.startsWith(item.to)) return item.name
        }
    }

    return 'Dashboard'
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.25s ease;
    overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
    opacity: 1;
    max-height: 500px;
}
</style>