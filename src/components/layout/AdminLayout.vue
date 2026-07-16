<template>
    <div class="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar :sidebarOpen="sidebarOpen" />

        <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/40 z-40 lg:hidden" />

        <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
            <Navbar
                :unreadCount="unreadCount"
                :notifications="notifications"
                @toggle-sidebar="sidebarOpen = !sidebarOpen"
                @open-profile="isProfileModalOpen = true"
                @mark-as-read="markAsRead"
                @mark-all-as-read="markAllAsRead"
                @delete-notification="deleteNotification"
            />

            <main class="flex-1 overflow-y-auto p-4 lg:p-6">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </main>
        </div>
    </div>

    <ProfileModal v-model="isProfileModalOpen" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import ProfileModal from '@/components/common/ProfileModal.vue'

const SIDEBAR_STATE_KEY = 'sidebar_open_state'
const sidebarOpen = ref(localStorage.getItem(SIDEBAR_STATE_KEY) !== 'false')

watch(sidebarOpen, val => {
    localStorage.setItem(SIDEBAR_STATE_KEY, val)
})

/* ---------- Notifications ---------- */
const isProfileModalOpen = ref(false)

const notifications = ref([
    { id: 1, title: 'New order received', message: 'Order #ORD-1234 has been placed.', isRead: false },
    { id: 2, title: 'Low stock alert', message: 'Only 5 products left.', isRead: false },
])

const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
)

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
</style>