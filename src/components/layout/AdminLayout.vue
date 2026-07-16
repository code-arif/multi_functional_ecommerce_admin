<template>
    <div class="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar :sidebarOpen="sidebarOpen" />

        <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/40 z-40 lg:hidden" />

        <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
            <Navbar
                :unreadCount="unreadCount"
                @toggle-sidebar="sidebarOpen = !sidebarOpen"
                @open-notification="isNotificationModalOpen = true"
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

    <NotificationModal
        v-model:isOpen="isNotificationModalOpen"
        :notifications="notifications"
        @mark-as-read="markAsRead"
        @mark-all-as-read="markAllAsRead"
        @delete="deleteNotification"
        @delete-selected="deleteSelectedNotifications"
    />

    <div v-if="isProfileModalOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
        <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                    <h2 class="text-lg font-bold text-slate-800">Update Profile</h2>
                    <p class="text-xs text-slate-500">Manage admin account information</p>
                </div>
                <button @click="isProfileModalOpen = false"
                    class="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 text-xl">&times;</button>
            </div>
            <div class="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div class="flex items-center gap-4">
                    <img src="https://i.pravatar.cc/100?img=12" class="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100" />
                    <div>
                        <button class="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">Change Photo</button>
                        <p class="text-xs text-slate-500 mt-2">JPG, PNG up to 2MB</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                        <input type="text" value="Eco Admin" class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input type="email" value="admin@eco.com" class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                        <input type="text" value="+8801700000000" class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                        <select class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none">
                            <option>active</option>
                            <option>inactive</option>
                            <option>banned</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                        <input type="password" placeholder="••••••••" class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                        <input type="password" placeholder="••••••••" class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                </div>
                <div class="rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700 font-medium">Email Verified &#10003;</div>
            </div>
            <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button @click="isProfileModalOpen = false" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                <button class="px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition">Save Changes</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import NotificationModal from '@/components/common/NotificationModal.vue'

const SIDEBAR_STATE_KEY = 'sidebar_open_state'
const sidebarOpen = ref(localStorage.getItem(SIDEBAR_STATE_KEY) !== 'false')

watch(sidebarOpen, val => {
    localStorage.setItem(SIDEBAR_STATE_KEY, val)
})

/* ---------- Notifications ---------- */
const isNotificationModalOpen = ref(false)
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

const deleteSelectedNotifications = ids => {
    notifications.value = notifications.value.filter(n => !ids.includes(n.id))
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

.animate-fadeIn {
    animation: fadeIn 0.18s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(.96); }
    to { opacity: 1; transform: scale(1); }
}
</style>