<template>
    <aside :class="[
        'fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col lg:relative',
        sidebarOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden'
    ]">
        <!-- Logo -->
        <div class="h-16 border-b border-white/10 flex items-center px-4 gap-3 shrink-0">
            <div class="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center font-black shrink-0">
                E
            </div>

            <div v-if="sidebarOpen" class="min-w-0 flex-1">
                <p class="font-black text-lg leading-none">EcoAdmin</p>
                <p class="text-[11px] text-slate-400">Super Admin</p>
            </div>

            <!-- Expand/Collapse All -->
            <button v-if="sidebarOpen" @click="toggleAllGroups"
                class="p-1.5 rounded-lg hover:bg-slate-800 transition group relative"
                :title="allGroupsExpanded ? 'Collapse all' : 'Expand all'">
                <component :is="allGroupsExpanded ? ChevronDoubleUpIcon : ChevronDoubleDownIcon"
                    class="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />

                <div
                    class="absolute -bottom-8 right-0 px-2 py-1 bg-slate-800 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
                    {{ allGroupsExpanded ? 'Collapse all' : 'Expand all' }}
                </div>
            </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            <template v-for="group in navGroups" :key="group.name">
                <!-- Direct Link (e.g. Dashboard) -->
                <router-link v-if="group.direct" :to="group.to"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition relative group"
                    :class="isActive(group.to) ? 'bg-green-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'">
                    <component :is="group.icon" class="w-5 h-5 shrink-0" />
                    <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">{{ group.name }}</span>
                    <div v-if="!sidebarOpen"
                        class="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
                        {{ group.name }}
                    </div>
                </router-link>

                <!-- Dropdown Group -->
                <div v-else class="space-y-1">
                    <button @click="toggleGroup(group.name)"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition relative group">
                        <component :is="group.icon" class="w-5 h-5 shrink-0 text-slate-300" />

                        <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">
                            {{ group.name }}
                        </span>

                        <ChevronDownIcon v-if="sidebarOpen" class="w-4 h-4 transition-transform"
                            :class="openGroups[group.name] ? 'rotate-180' : ''" />

                        <div v-if="!sidebarOpen"
                            class="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
                            {{ group.name }}
                        </div>
                    </button>

                    <transition name="slide">
                        <div v-if="openGroups[group.name] && sidebarOpen"
                            class="ml-4 pl-3 border-l border-slate-700 space-y-1 overflow-hidden">
                            <router-link v-for="item in group.items" :key="item.name" :to="item.to"
                                class="router-link-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition"
                                :class="isActive(item.to)
                                    ? 'bg-green-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'">
                                <component :is="item.icon" class="w-4 h-4 shrink-0" />
                                <span class="truncate">{{ item.name }}</span>
                                <span v-if="item.pending"
                                    class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                                    P
                                </span>
                            </router-link>
                        </div>
                    </transition>
                </div>
            </template>
        </nav>

        <!-- User -->
        <div class="border-t border-white/10 p-3 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-bold shrink-0">
                    {{ auth.userName.charAt(0).toUpperCase() }}
                </div>

                <div v-if="sidebarOpen" class="flex-1 min-w-0">
                    <p class="text-sm font-semibold truncate">{{ auth.userName }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ auth.userEmail }}</p>
                </div>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import {
    ChevronDoubleUpIcon,
    ChevronDoubleDownIcon,
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
    LinkIcon,
    PhotoIcon,
    HomeModernIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
    UserGroupIcon,
    IdentificationIcon,
    LockOpenIcon,
    BellIcon
} from '@heroicons/vue/24/outline'

defineProps({
    sidebarOpen: { type: Boolean, required: true }
})

const route = useRoute()
const auth = useAuthStore()

const STORAGE_KEY = 'sidebar_groups_state'
const openGroups = reactive({})

const navGroups = [
    {
        name: 'Dashboard', icon: Squares2X2Icon,
        direct: true, to: '/'
    },
    {
        name: 'Marketplace', icon: BuildingStorefrontIcon,
        items: [
            { name: 'All Vendors', to: '/vendors', icon: BuildingStorefrontIcon, pending: true },
            { name: 'Pending Approval Vendors', to: '/vendors/pending', icon: ClipboardDocumentListIcon, pending: true },
            { name: 'All Shops', to: '/shops', icon: HomeModernIcon, pending: true },
            { name: 'Pending Approval Shops', to: '/shops/pending', icon: ClipboardDocumentListIcon, pending: true }
        ]
    },
    {
        name: 'Catalog', icon: ShoppingBagIcon,
        items: [
            { name: 'Products', to: '/products', icon: ShoppingBagIcon },
            { name: 'Categories', to: '/categories', icon: TagIcon },
            { name: 'Brands', to: '/brands', icon: StarIcon },
            { name: 'Coupons', to: '/coupons', icon: TicketIcon },
            { name: 'Affiliate', to: '/affiliate', icon: LinkIcon },
        ]
    },
    {
        name: 'Orders', icon: ClipboardDocumentListIcon,
        items: [
            { name: 'All Orders', to: '/orders', icon: ClipboardDocumentListIcon },
            { name: 'Transactions', to: '/transactions', icon: BanknotesIcon, pending: true },
        ]
    },
    {
        name: 'Marketing', icon: MegaphoneIcon,
        items: [
            { name: 'Campaigns', to: '/campaigns', icon: MegaphoneIcon, pending: true },
            { name: 'Reviews', to: '/reviews', icon: StarIcon }
        ]
    },
    {
        name: 'Users', icon: UsersIcon,
        items: [
            { name: 'Customers', to: '/users', icon: UsersIcon },
            { name: 'Admins', to: '/admins', icon: UserGroupIcon, pending: true },
            { name: 'Roles', to: '/roles', icon: IdentificationIcon, pending: true },
            { name: 'Permissions', to: '/permissions', icon: LockOpenIcon, pending: true },
        ]
    },
    {
        name: 'Content', icon: DocumentTextIcon,
        items: [
            { name: 'CMS Pages', to: '/cms', icon: DocumentTextIcon },
            { name: 'Banners', to: '/banners', icon: PhotoIcon },
        ]
    },
    {
        name: 'Reports', icon: ChartBarIcon,
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
        name: 'Messages', icon: ChatBubbleLeftRightIcon,
        items: [
            { name: 'Chat', to: '/messages', icon: ChatBubbleLeftRightIcon, pending: true },
            { name: 'Notifications', to: '/notifications', icon: BellIcon, pending: true },
            { name: 'Emails', to: '/emails', icon: EnvelopeIcon, pending: true },
        ]
    },
    {
        name: 'System', icon: Cog6ToothIcon,
        items: [{ name: 'Settings', to: '/settings', icon: Cog6ToothIcon }]
    }
]

const allGroupsExpanded = computed(() =>
    navGroups.filter(g => !g.direct).every(group => openGroups[group.name])
)

function saveGroupsState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups))
}

function loadGroupsState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const parsed = JSON.parse(saved)
            const groupNames = navGroups.filter(g => !g.direct).map(g => g.name)
            for (const name of groupNames) {
                if (typeof parsed[name] === 'boolean') {
                    openGroups[name] = parsed[name]
                }
            }
            return true
        }
    } catch { }
    return false
}

function initializeGroups() {
    if (loadGroupsState()) return
    navGroups.filter(g => !g.direct).forEach(group => {
        if (group.items.some(item => item.to === '/')) {
            openGroups[group.name] = route.path === '/'
        } else {
            openGroups[group.name] = group.items.some(item =>
                route.path.startsWith(item.to)
            )
        }
    })
    saveGroupsState()
}

initializeGroups()

function toggleGroup(name) {
    openGroups[name] = !openGroups[name]
    saveGroupsState()
}

function toggleAllGroups() {
    const expand = !allGroupsExpanded.value
    navGroups.filter(g => !g.direct).forEach(group => { openGroups[group.name] = expand })
    saveGroupsState()
}

function isActive(path) {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
}
</script>

<style scoped>
.slide-enter-active {
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
    overflow: hidden;
}

.slide-leave-active {
    transition: max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
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

.slide-enter-active .router-link-item {
    animation: slideInChild 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.slide-leave-active .router-link-item {
    animation: slideOutChild 0.15s ease both;
}

.router-link-item:nth-child(1) { animation-delay: 0ms; }
.router-link-item:nth-child(2) { animation-delay: 20ms; }
.router-link-item:nth-child(3) { animation-delay: 40ms; }
.router-link-item:nth-child(4) { animation-delay: 60ms; }
.router-link-item:nth-child(5) { animation-delay: 80ms; }
.router-link-item:nth-child(6) { animation-delay: 100ms; }
.router-link-item:nth-child(7) { animation-delay: 120ms; }
.router-link-item:nth-child(8) { animation-delay: 140ms; }
.router-link-item:nth-child(9) { animation-delay: 160ms; }
.router-link-item:nth-child(10) { animation-delay: 180ms; }
.router-link-item:nth-child(11) { animation-delay: 200ms; }
.router-link-item:nth-child(12) { animation-delay: 220ms; }

@keyframes slideInChild {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOutChild {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-8px); }
}
</style>
