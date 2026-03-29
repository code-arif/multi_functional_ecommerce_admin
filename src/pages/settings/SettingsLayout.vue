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
    { to: '/settings/general', label: 'General', icon: markRaw(Store) },
    { to: '/settings/shipping', label: 'Shipping', icon: markRaw(Truck) },
    { to: '/settings/seo', label: 'SEO', icon: markRaw(Search) },
    { to: '/settings/social', label: 'Social Media', icon: markRaw(Share2) },
    { to: '/settings/branding', label: 'Branding', icon: markRaw(Palette) },
    { to: '/settings/mail', label: 'Mail', icon: markRaw(Mail) },
    { to: '/settings/reverb', label: 'Reverb / WebSocket', icon: markRaw(Radio) },
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

<style scoped>
.settings-layout {
    min-height: 100vh;
    background: #f8fafc;
    padding: 28px 24px;
}

.settings-header {
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
}

.settings-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin: 0 0 4px;
}

.settings-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
}

.settings-body {
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

/* ─── Sidebar ─── */
.settings-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 8px;
    position: sticky;
    top: 24px;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    text-decoration: none;
    color: #475569;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    cursor: pointer;
}

.nav-item:hover {
    background: #f1f5f9;
    color: #0f172a;
}

.nav-item--active {
    background: #eff6ff;
    color: #2E7D32;
}

.nav-item--active .nav-icon,
.nav-item--active .nav-arrow {
    color: #2E7D32;
}

.nav-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: #94a3b8;
    transition: color 0.15s;
}

.nav-label {
    flex: 1;
}

.nav-arrow {
    width: 14px;
    height: 14px;
    color: #cbd5e1;
    transition: color 0.15s;
}

.nav-item:hover .nav-arrow {
    color: #94a3b8;
}

/* ─── Content ─── */
.settings-content {
    flex: 1;
    min-width: 0;
}

/* ─── Transition ─── */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
    .settings-body {
        flex-direction: column;
    }

    .settings-sidebar {
        width: 100%;
        position: static;
        display: flex;
        overflow-x: auto;
        padding: 6px;
    }

    .sidebar-nav {
        flex-direction: row;
        gap: 4px;
        min-width: max-content;
    }

    .nav-item {
        flex-direction: column;
        gap: 4px;
        padding: 8px 12px;
        font-size: 0.6875rem;
        text-align: center;
        white-space: nowrap;
    }

    .nav-arrow {
        display: none;
    }
}
</style>