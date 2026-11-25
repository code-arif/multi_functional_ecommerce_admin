<template>
    <div class="flex h-screen overflow-hidden" :style="{ backgroundColor: 'var(--app-bg)' }">
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
                @navigate="handleNotificationNavigate"
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import ProfileModal from '@ecom/ui/components/ProfileModal.vue'
import { notificationApi } from '@/api/notification'

const router = useRouter()

const SIDEBAR_STATE_KEY = 'sidebar_open_state'
const sidebarOpen = ref(localStorage.getItem(SIDEBAR_STATE_KEY) !== 'false')

watch(sidebarOpen, val => {
    localStorage.setItem(SIDEBAR_STATE_KEY, val)
})

/* ---------- Notifications State & Sync ---------- */
const isProfileModalOpen = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loadingNotifications = ref(false)
let pollInterval = null

async function fetchNotifications() {
    try {
        loadingNotifications.value = true
        const res = await notificationApi.list({ per_page: 30 })
        if (res.data && res.data.success) {
            notifications.value = res.data.data || []
            unreadCount.value = typeof res.data.unread === 'number'
                ? res.data.unread
                : notifications.value.filter(n => !n.is_read).length
        }
    } catch (err) {
        console.warn('Could not fetch notifications:', err)
    } finally {
        loadingNotifications.value = false
    }
}

async function markAsRead(id) {
    const item = notifications.value.find(n => n.id === id)
    if (item && !item.is_read) {
        item.is_read = true
        if (unreadCount.value > 0) unreadCount.value--
    }

    try {
        await notificationApi.markAsRead(id)
    } catch (err) {
        console.warn('Failed to mark notification as read:', err)
    }
}

async function markAllAsRead() {
    notifications.value.forEach(n => (n.is_read = true))
    unreadCount.value = 0

    try {
        await notificationApi.markAllAsRead()
    } catch (err) {
        console.warn('Failed to mark all notifications as read:', err)
    }
}

async function deleteNotification(id) {
    const item = notifications.value.find(n => n.id === id)
    if (item && !item.is_read && unreadCount.value > 0) {
        unreadCount.value--
    }
    notifications.value = notifications.value.filter(n => n.id !== id)

    try {
        await notificationApi.destroy(id)
    } catch (err) {
        console.warn('Failed to delete notification:', err)
    }
}

function handleNotificationNavigate(notif) {
    if (!notif) return

    if (!notif.is_read) {
        markAsRead(notif.id)
    }

    if (notif.action_url) {
        // Normalize admin route paths (e.g. /admin/vendors/7 -> /vendors/7)
        let target = notif.action_url.trim()
        if (target.startsWith('/admin/')) {
            target = target.replace(/^\/admin/, '')
        }
        router.push(target)
    }
}

function handleWindowFocus() {
    fetchNotifications()
}

onMounted(() => {
    fetchNotifications()
    // Poll every 45 seconds for new background notifications
    pollInterval = setInterval(fetchNotifications, 45000)
    window.addEventListener('focus', handleWindowFocus)
})

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval)
    window.removeEventListener('focus', handleWindowFocus)
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
</style>
