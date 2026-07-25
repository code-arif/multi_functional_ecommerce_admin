<template>
    <aside :class="[
        'sidebar fixed inset-y-0 left-0 z-50 transition-all duration-300 flex flex-col lg:relative',
        sidebarOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden'
    ]">
        <!-- Logo -->
        <div class="sidebar-logo h-16 flex items-center px-4 gap-3 shrink-0">
            <div class="logo-icon w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 text-white">
                E
            </div>

            <div v-if="sidebarOpen" class="min-w-0 flex-1">
                <p class="sidebar-brand font-black text-lg leading-none">EcoAdmin</p>
                <p class="sidebar-subtitle text-[11px]">Super Admin</p>
            </div>

            <!-- Expand/Collapse All -->
            <button v-if="sidebarOpen" @click="toggleAllGroups"
                class="p-1.5 rounded-lg sidebar-btn-icon transition group relative"
                :title="allGroupsExpanded ? 'Collapse all' : 'Expand all'">
                <component :is="allGroupsExpanded ? ChevronDoubleUpIcon : ChevronDoubleDownIcon"
                    class="w-4 h-4 transition" />

                <div
                    class="sidebar-tooltip absolute -bottom-8 right-0 px-2 py-1 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
                    {{ allGroupsExpanded ? 'Collapse all' : 'Expand all' }}
                </div>
            </button>
        </div>

        <!-- Search -->
        <div v-if="sidebarOpen" class="px-3 pt-3 pb-1 shrink-0">
            <div class="relative">
                <MagnifyingGlassIcon class="sidebar-search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                <input v-model="searchQuery" type="text" placeholder="Search pages..."
                    class="sidebar-search-input w-full rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none transition"
                    @keydown.escape="searchQuery = ''" />
                <button v-if="searchQuery" @click="searchQuery = ''"
                    class="sidebar-btn-icon absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition">
                    <XMarkIcon class="w-3.5 h-3.5" />
                </button>
            </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            <!-- Search Results (flat list) -->
            <template v-if="searchQuery && sidebarOpen">
                <div v-for="item in searchResults" :key="item.to" class="space-y-1">
                    <router-link :to="item.to" @click="searchQuery = ''"
                        class="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition"
                        :class="isActive(item.to) ? 'sidebar-nav-active' : ''">
                        <component :is="item.icon" class="w-4 h-4 shrink-0" />
                        <span class="truncate flex-1">{{ item.name }}</span>
                        <span class="sidebar-nav-group-label text-[10px] shrink-0">{{ item.group }}</span>
                    </router-link>
                </div>
                <div v-if="!searchResults.length" class="sidebar-empty text-center py-8 text-xs">
                    No results for "{{ searchQuery }}"
                </div>
            </template>

            <!-- Normal Navigation (hidden when searching) -->
            <template v-else>
                <template v-for="group in navGroups" :key="group.name">
                    <!-- Direct Link (e.g. Dashboard) -->
                    <router-link v-if="group.direct" :to="group.to"
                        class="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition relative group"
                        :class="isActive(group.to) ? 'sidebar-nav-active' : ''">
                        <component :is="group.icon" class="w-5 h-5 shrink-0" />
                        <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">{{ group.name }}</span>
                        <div v-if="!sidebarOpen"
                            class="sidebar-tooltip absolute left-full ml-3 px-2 py-1 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
                            {{ group.name }}
                        </div>
                    </router-link>

                    <!-- Dropdown Group -->
                    <div v-else class="space-y-1">
                        <button @click="toggleGroup(group.name)"
                            class="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition relative group">
                            <component :is="group.icon" class="w-5 h-5 shrink-0 sidebar-nav-icon" />

                            <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">
                                {{ group.name }}
                            </span>

                            <ChevronDownIcon v-if="sidebarOpen" class="w-4 h-4 sidebar-chevron transition-transform"
                                :class="openGroups[group.name] ? 'rotate-180' : ''" />

                            <div v-if="!sidebarOpen"
                                class="sidebar-tooltip absolute left-full ml-3 px-2 py-1 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition z-50">
                                {{ group.name }}
                            </div>
                        </button>

                        <transition name="slide">
                            <div v-if="openGroups[group.name] && sidebarOpen"
                                class="sidebar-subnav ml-4 pl-3 space-y-1 overflow-hidden">
                                <router-link v-for="item in group.items" :key="item.name" :to="item.to"
                                    class="sidebar-nav-item router-link-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition"
                                    :class="isActive(item.to) ? 'sidebar-nav-active' : ''">
                                    <component :is="item.icon" class="w-4 h-4 shrink-0" />
                                    <span class="truncate">{{ item.name }}</span>
                                    <span v-if="item.pending"
                                        class="sidebar-pending ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold">
                                        P
                                    </span>
                                </router-link>
                            </div>
                        </transition>
                    </div>
                </template>
            </template>
        </nav>

        <!-- User -->
        <div class="sidebar-user-section p-3 shrink-0">
            <div class="flex items-center gap-3">
                <div class="sidebar-user-avatar w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 text-white">
                    {{ auth.userName.charAt(0).toUpperCase() }}
                </div>

                <div v-if="sidebarOpen" class="flex-1 min-w-0">
                    <p class="sidebar-user-name text-sm font-semibold truncate">{{ auth.userName }}</p>
                    <p class="sidebar-user-email text-xs truncate">{{ auth.userEmail }}</p>
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
    XMarkIcon,
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
    BellIcon,
    TruckIcon,
    ShareIcon,
    SwatchIcon,
    MagnifyingGlassIcon,
    CreditCardIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    WrenchScrewdriverIcon,
    RadioIcon,
    DocumentTextIcon as InvoiceIcon
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
            { name: 'All Vendors', to: '/vendors', icon: BuildingStorefrontIcon },
            { name: 'Pending Approval Vendors', to: '/vendors/pending', icon: ClipboardDocumentListIcon },
            { name: 'Vendor Payouts', to: '/vendor-payouts', icon: BanknotesIcon },
            { name: 'All Shops', to: '/shops', icon: HomeModernIcon },
            { name: 'Pending Approval Shops', to: '/shops/pending', icon: ClipboardDocumentListIcon }
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
            { name: 'Transactions', to: '/transactions', icon: BanknotesIcon },
        ]
    },
    {
        name: 'Invoices', icon: InvoiceIcon,
        items: [
            { name: 'Sale Invoices', to: '/invoices/sales', icon: BanknotesIcon },
            { name: 'Purchase Invoices', to: '/invoices/purchases', icon: ShoppingBagIcon },
        ]
    },
    {
        name: 'Marketing', icon: MegaphoneIcon,
        items: [
            { name: 'Campaigns', to: '/campaigns', icon: MegaphoneIcon },
            { name: 'Reviews', to: '/reviews', icon: StarIcon }
        ]
    },
    {
        name: 'Users', icon: UsersIcon,
        items: [
            { name: 'Customers', to: '/users', icon: UsersIcon },
            { name: 'Admins', to: '/admins', icon: UserGroupIcon },
            { name: 'Roles', to: '/roles', icon: IdentificationIcon },
            { name: 'Permissions', to: '/permissions', icon: LockOpenIcon },
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
            { name: 'Customer Reports', to: '/reports/customer', icon: UsersIcon },
            { name: 'Product Reports', to: '/reports/product', icon: ShoppingBagIcon },
            { name: 'Vendor Reports', to: '/reports/vendor', icon: BuildingStorefrontIcon },
            { name: 'Shop Reports', to: '/reports/shop', icon: HomeModernIcon },
            { name: 'Affiliate Reports', to: '/reports/affiliate', icon: LinkIcon },
            { name: 'Coupon Reports', to: '/reports/coupon', icon: TicketIcon },
            { name: 'Campaign Reports', to: '/reports/campaign', icon: MegaphoneIcon },
            { name: 'Review Reports', to: '/reports/review', icon: StarIcon },
            { name: 'Notification Reports', to: '/reports/notification', icon: BellIcon },
            { name: 'Email Reports', to: '/reports/email', icon: EnvelopeIcon },
            { name: 'System Reports', to: '/reports/system', icon: Cog6ToothIcon },
        ]
    },
    {
        name: 'Messages', icon: ChatBubbleLeftRightIcon,
        items: [
            { name: 'Chat Dashboard', to: '/chat-dashboard', icon: ChartBarIcon },
            { name: 'Chat', to: '/messages', icon: ChatBubbleLeftRightIcon },
            { name: 'Notifications', to: '/notifications', icon: BellIcon },
            { name: 'Emails', to: '/emails', icon: EnvelopeIcon },
        ]
    },
    {
        name: 'System', icon: Cog6ToothIcon,
        items: [
            { name: 'Activity Log', to: '/activity-log', icon: ClipboardDocumentListIcon },
            { name: 'General', to: '/settings/general', icon: Cog6ToothIcon },
            { name: 'Shipping', to: '/settings/shipping', icon: TruckIcon },
            { name: 'SEO', to: '/settings/seo', icon: MagnifyingGlassIcon },
            { name: 'Social Media', to: '/settings/social', icon: ShareIcon },
            { name: 'Branding', to: '/settings/branding', icon: SwatchIcon },
            { name: 'Mail', to: '/settings/mail', icon: EnvelopeIcon },
            { name: 'Reverb / WebSocket', to: '/settings/reverb', icon: RadioIcon },
            { name: 'Payment Gateways', to: '/settings/payment', icon: CreditCardIcon },
            { name: 'Tax & VAT', to: '/settings/tax', icon: TagIcon },
            { name: 'Notifications', to: '/settings/notifications', icon: BellIcon },
            { name: 'Customer', to: '/settings/customers', icon: UsersIcon },
            { name: 'Legal Pages', to: '/settings/legal', icon: DocumentTextIcon },
            { name: 'Localization', to: '/settings/localization', icon: GlobeAltIcon },
            { name: 'Security', to: '/settings/security', icon: ShieldCheckIcon },
            { name: 'Maintenance', to: '/settings/maintenance', icon: WrenchScrewdriverIcon },
            { name: 'Theme', to: '/settings/theme', icon: SwatchIcon },
        ]
    }
]

/* ---------- Search ---------- */
const searchQuery = ref('')

const searchResults = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return []
    const results = []
    for (const group of navGroups) {
        if (group.direct) {
            if (group.name.toLowerCase().includes(q)) {
                results.push({ ...group, group: '' })
            }
        } else {
            for (const item of group.items) {
                if (item.name.toLowerCase().includes(q)) {
                    results.push({ ...item, group: group.name })
                }
            }
        }
    }
    return results
})

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
    return route.path === path
}
</script>

<style scoped>
/* ========================================================================
   SIDEBAR — THEME-AWARE STYLES
   Uses CSS custom properties defined in main.css
   Sidebar gets the contrast color scheme automatically.
   ======================================================================== */

/* Sidebar container */
.sidebar {
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
    border-right: 1px solid var(--sidebar-border);
    transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

/* Logo section */
.sidebar-logo {
    border-bottom: 1px solid var(--sidebar-border);
}

.logo-icon {
    background-color: var(--sidebar-logo-bg);
}

.sidebar-brand {
    color: var(--sidebar-text);
}

.sidebar-subtitle {
    color: var(--sidebar-text-muted);
}

/* Search */
.sidebar-search-input {
    background-color: var(--sidebar-search-bg);
    border: 1px solid var(--sidebar-search-border);
    color: var(--sidebar-text);
}
.sidebar-search-input::placeholder {
    color: var(--sidebar-search-placeholder);
}
.sidebar-search-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 30%, transparent);
}
.sidebar-search-icon {
    color: var(--sidebar-text-muted);
}

/* Navigation items */
.sidebar-nav-item {
    color: var(--sidebar-text);
}
.sidebar-nav-item:hover {
    background-color: var(--sidebar-hover);
    color: var(--sidebar-text);
}
.sidebar-nav-active {
    background-color: var(--sidebar-active-bg) !important;
    color: var(--sidebar-active-text) !important;
}
.sidebar-nav-icon {
    color: var(--sidebar-text);
}
.sidebar-chevron {
    color: var(--sidebar-text-muted);
}

/* Sub navigation */
.sidebar-subnav {
    border-left-color: var(--sidebar-border);
    border-left-width: 1px;
    border-left-style: solid;
}

/* Badges */
.sidebar-pending {
    background-color: var(--warning);
    color: #fff;
}

/* Tooltips */
.sidebar-tooltip {
    background-color: var(--sidebar-hover);
    color: var(--sidebar-text);
}

/* Button icons */
.sidebar-btn-icon {
    color: var(--sidebar-text-muted);
}
.sidebar-btn-icon:hover {
    color: var(--sidebar-text);
    background-color: var(--sidebar-hover);
}

/* Group label in search */
.sidebar-nav-group-label {
    color: var(--sidebar-text-muted);
}

/* Empty state */
.sidebar-empty {
    color: var(--sidebar-text-muted);
}

/* User section */
.sidebar-user-section {
    border-top: 1px solid var(--sidebar-border);
}
.sidebar-user-avatar {
    background-color: var(--sidebar-logo-bg);
}
.sidebar-user-name {
    color: var(--sidebar-text);
}
.sidebar-user-email {
    color: var(--sidebar-text-muted);
}

/* ========================================================================
   TRANSITION ANIMATIONS
   ======================================================================== */
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
