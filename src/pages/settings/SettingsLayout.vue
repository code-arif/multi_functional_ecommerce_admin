<template>
    <div class="settings-layout">
        <div class="settings-header">
            <h1 class="settings-title">Settings</h1>
            <p class="settings-subtitle">Manage your store configuration</p>
        </div>

        <div class="settings-body">
            <!-- Sidebar -->
            <aside class="settings-sidebar">
                <nav class="sidebar-nav">
                    <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item"
                        active-class="nav-item--active">
                        <component :is="item.icon" class="nav-icon" />
                        <span class="nav-label">{{ item.label }}</span>
                        <ChevronRight class="nav-arrow" />
                    </router-link>
                </nav>
            </aside>

            <!-- Content -->
            <main class="settings-content">
                <router-view v-slot="{ Component }">
                    <transition name="fade-slide" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>

<script setup>
import {
    Store, Truck, Search, Share2, Palette, Mail,
    Radio, Wrench, ShoppingCart, Bell,
    CreditCard, Shield, Globe, ChevronRight,
    Percent, Users, FileText
} from 'lucide-vue-next'

// Map string names to icon components for router-link usage
import { markRaw } from 'vue'

const navItems = [
    { to: '/admin/settings/general', label: 'General', icon: markRaw(Store) },
    { to: '/admin/settings/shipping', label: 'Shipping', icon: markRaw(Truck) },
    { to: '/admin/settings/seo', label: 'SEO', icon: markRaw(Search) },
    { to: '/admin/settings/social', label: 'Social Media', icon: markRaw(Share2) },
    { to: '/admin/settings/branding', label: 'Branding', icon: markRaw(Palette) },
    { to: '/admin/settings/mail', label: 'Mail', icon: markRaw(Mail) },
    { to: '/admin/settings/reverb', label: 'Reverb / WebSocket', icon: markRaw(Radio) },
    { to: '/admin/settings/payment', label: 'Payment Gateways', icon: markRaw(CreditCard) },
    { to: '/admin/settings/tax', label: 'Tax & VAT', icon: markRaw(Percent) },
    { to: '/admin/settings/notifications', label: 'Notifications', icon: markRaw(Bell) },
    { to: '/admin/settings/customers', label: 'Customer', icon: markRaw(Users) },
    { to: '/admin/settings/legal', label: 'Legal Pages', icon: markRaw(FileText) },
    { to: '/admin/settings/localization', label: 'Localization', icon: markRaw(Globe) },
    { to: '/admin/settings/security', label: 'Security', icon: markRaw(Shield) },
    { to: '/admin/settings/maintenance', label: 'Maintenance', icon: markRaw(Wrench) },
]
</script>

