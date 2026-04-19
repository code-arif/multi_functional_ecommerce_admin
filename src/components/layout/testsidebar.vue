<template>
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col lg:relative',
      sidebarOpen ? 'w-72' : 'w-0 lg:w-20 overflow-hidden'
    ]">
      <!-- Logo -->
      <div class="h-16 border-b border-white/10 flex items-center px-4 gap-3 shrink-0">
        <div class="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center font-black">E</div>
        <div v-if="sidebarOpen" class="min-w-0">
          <p class="font-black text-lg leading-none">EcoAdmin</p>
          <p class="text-[11px] text-slate-400">Super Admin</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        <div v-for="group in navGroups" :key="group.name" class="space-y-1">
          <button
            @click="toggleGroup(group.name)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition"
          >
            <component :is="group.icon" class="w-5 h-5 shrink-0 text-slate-300" />
            <span v-if="sidebarOpen" class="text-sm font-semibold flex-1 text-left">{{ group.name }}</span>
            <ChevronDownIcon
              v-if="sidebarOpen"
              class="w-4 h-4 transition-transform"
              :class="openGroups[group.name] ? 'rotate-180' : ''"
            />
          </button>

          <transition name="slide">
            <div v-show="openGroups[group.name] && sidebarOpen" class="ml-4 space-y-1 border-l border-slate-700 pl-3">
              <router-link
                v-for="item in group.items"
                :key="item.name"
                :to="item.to"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition group"
                :class="isActive(item.to)
                  ? 'bg-green-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
              >
                <component :is="item.icon" class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ item.name }}</span>
                <span
                  v-if="item.pending"
                  class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold"
                >P</span>
              </router-link>
            </div>
          </transition>
        </div>
      </nav>

      <!-- User -->
      <div class="border-t border-white/10 p-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-bold">A</div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate">Admin User</p>
            <p class="text-xs text-slate-400 truncate">admin@email.com</p>
          </div>
          <button class="p-2 rounded-lg hover:bg-slate-800 transition">
            <ArrowRightOnRectangleIcon class="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/40 z-40 lg:hidden"></div>

    <!-- Content -->
    <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg hover:bg-slate-100 transition">
          <Bars3Icon class="w-5 h-5" />
        </button>
        <h1 class="font-bold text-slate-800">Dashboard</h1>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
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
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const sidebarOpen = ref(true)

const openGroups = reactive({
  Dashboard: true,
  Marketplace: true,
  Catalog: true,
  Orders: false,
  Marketing: false,
  Users: false,
  Content: false,
  Reports: false,
  System: false,
})

const navGroups = [
  {
    name: 'Dashboard', icon: Squares2X2Icon,
    items: [{ name: 'Overview', to: '/', icon: Squares2X2Icon }]
  },
  {
    name: 'Marketplace', icon: BuildingStorefrontIcon,
    items: [
      { name: 'All Vendors', to: '/vendors', icon: BuildingStorefrontIcon, pending: true },
      { name: 'Pending Approval', to: '/vendors/pending', icon: ClipboardDocumentListIcon, pending: true },
      { name: 'Shops', to: '/shops', icon: StarIcon, pending: true },
    ]
  },
  {
    name: 'Catalog', icon: ShoppingBagIcon,
    items: [
      { name: 'Products', to: '/products', icon: ShoppingBagIcon },
      { name: 'Categories', to: '/categories', icon: TagIcon },
      { name: 'Brands', to: '/brands', icon: StarIcon },
      { name: 'Coupons', to: '/coupons', icon: TicketIcon },
    ]
  },
  {
    name: 'Orders', icon: ClipboardDocumentListIcon,
    items: [
      { name: 'All Orders', to: '/orders', icon: ClipboardDocumentListIcon },
      { name: 'Refund Requests', to: '/refunds', icon: ClipboardDocumentListIcon, pending: true },
      { name: 'Transactions', to: '/transactions', icon: BanknotesIcon, pending: true },
    ]
  },
  {
    name: 'Marketing', icon: MegaphoneIcon,
    items: [
      { name: 'Campaigns', to: '/campaigns', icon: MegaphoneIcon, pending: true },
      { name: 'Flash Sale', to: '/flash-sale', icon: StarIcon, pending: true },
    ]
  },
  {
    name: 'Users', icon: UsersIcon,
    items: [
      { name: 'Customers', to: '/users', icon: UsersIcon },
      { name: 'Blocked Users', to: '/users/blocked', icon: UsersIcon, pending: true },
    ]
  },
  {
    name: 'Content', icon: DocumentTextIcon,
    items: [
      { name: 'CMS Pages', to: '/cms', icon: DocumentTextIcon },
      { name: 'Blog', to: '/blog', icon: DocumentTextIcon, pending: true },
    ]
  },
  {
    name: 'Reports', icon: ChartBarIcon,
    items: [
      { name: 'Sales Reports', to: '/reports', icon: ChartBarIcon },
      { name: 'Vendor Reports', to: '/reports/vendors', icon: ChartBarIcon, pending: true },
    ]
  },
  {
    name: 'System', icon: Cog6ToothIcon,
    items: [
      { name: 'Roles & Permissions', to: '/roles', icon: Cog6ToothIcon, pending: true },
      { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
    ]
  },
]

function toggleGroup(name) {
  openGroups[name] = !openGroups[name]
}

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all .25s ease;
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
