<template>
    <div>
    <div class="flex h-[calc(100vh-2rem)] md:h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <transition name="skeleton-fade" mode="out-in">
          <!-- ─── Loading Skeleton ─── -->
          <div v-if="loading" key="skeleton" class="flex w-full h-full">
            <EmailSidebarSkeleton />
            <EmailListSkeleton :items="7" />
            <EmailDetailSkeleton />
          </div>

          <!-- ─── Real Content ─── -->
          <div v-else key="content" class="flex w-full h-full">
            <!-- ─── Folders Sidebar ─── -->
            <aside class="absolute md:relative z-20 w-64 h-full border-r border-slate-200 bg-slate-50 flex flex-col transition-transform duration-300"
                :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
                <div class="p-3">
                    <button @click="showCompose = true"
                        class="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold transition shadow-sm">
                        <PencilSquareIcon class="w-4 h-4" />
                        Compose
                    </button>
                </div>

                <nav class="flex-1 px-2 space-y-0.5 overflow-y-auto">
                    <button v-for="folder in folders" :key="folder.key" @click="activeFolder = folder.key; selectedEmail = null; sidebarOpen = false"
                        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition"
                        :class="activeFolder === folder.key
                            ? 'bg-green-100 text-green-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100'">
                        <component :is="folder.icon" class="w-4 h-4 shrink-0" />
                        <span class="flex-1 text-left truncate">{{ folder.label }}</span>
                        <span v-if="folder.count"
                            class="text-[11px] font-medium bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full"
                            :class="activeFolder === folder.key ? 'bg-green-200 text-green-700' : ''">
                            {{ folder.count }}
                        </span>
                    </button>
                </nav>
            </aside>

            <!-- Overlay for mobile sidebar -->
            <div v-if="sidebarOpen" class="fixed inset-0 z-10 bg-black/20 md:hidden" @click="sidebarOpen = false"></div>

            <!-- ─── Email List ─── -->
            <div class="flex-1 flex flex-col min-w-0" v-show="!isMobile || !selectedEmail">
                <!-- Toolbar -->
                <div class="flex items-center gap-1 px-2 py-2 border-b border-slate-200 shrink-0">
                    <button @click="sidebarOpen = true" class="md:hidden p-2 rounded-lg hover:bg-slate-100">
                        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <button @click="toggleSelectAll" class="p-1 rounded hover:bg-slate-100 transition text-slate-400">
                        <CheckCircleIcon v-if="allSelected" class="w-4 h-4 text-green-600" />
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke-width="2" /></svg>
                    </button>
                    <button @click="refreshEmails" class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400" title="Refresh">
                        <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': refreshing }" />
                    </button>
                    <div class="flex-1" />
                    <input v-model="searchQuery" type="text" placeholder="Search..."
                        class="w-32 sm:w-56 bg-slate-100 border-0 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none" />
                </div>

                <!-- Email List -->
                <div class="flex-1 overflow-y-auto divide-y divide-slate-100">
                    <div v-for="email in filteredEmails" :key="email.id"
                        class="group flex items-center gap-2 px-3 py-3 cursor-pointer transition hover:bg-slate-50"
                        :class="[selectedEmail?.id === email.id ? 'bg-green-50/50' : '']"
                        @click="selectedEmail = email">
                        
                        <button @click.stop="toggleSelect(email.id)" class="shrink-0 p-1 rounded">
                            <CheckCircleIcon v-if="selectedIds.includes(email.id)" class="w-4 h-4 text-green-600" />
                            <svg v-else class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke-width="2" /></svg>
                        </button>
                        
                        <div class="flex-1 min-w-0 flex items-center gap-2">
                            <p class="w-24 sm:w-32 shrink-0 text-sm truncate font-medium text-slate-800">{{ email.from.name }}</p>
                            <p class="text-sm truncate text-slate-600 flex-1">{{ email.subject }}</p>
                        </div>
                        
                        <p class="w-12 shrink-0 text-right text-xs text-slate-400">{{ formatListDate(email.createdAt) }}</p>
                    </div>
                </div>
            </div>

            <!-- ─── Email Detail Panel ─── -->
            <div v-if="selectedEmail" class="absolute inset-0 z-30 md:static md:w-[400px] lg:w-[500px] shrink-0 border-l border-slate-200 flex flex-col bg-white">
                <!-- Detail Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
                    <button @click="selectedEmail = null" class="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div class="flex items-center gap-1">
                        <button @click="selectedEmail.starred = !selectedEmail.starred"
                            class="p-1.5 rounded-lg hover:bg-slate-100 transition"
                            :class="selectedEmail.starred ? 'text-amber-400' : 'text-slate-400'">
                            <StarIcon class="w-4 h-4" />
                        </button>
                        <button @click="deleteEmail(selectedEmail.id)"
                            class="p-1.5 rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-500">
                            <TrashIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Detail Body -->
                <div class="flex-1 overflow-y-auto p-5 space-y-4">
                    <!-- Subject -->
                    <h2 class="text-lg font-bold text-slate-800 leading-tight">{{ selectedEmail.subject }}</h2>

                    <!-- From / To -->
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            :class="getAvatarBg(selectedEmail.from.name)">
                            {{ selectedEmail.from.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="min-w-0">
                            <p class="text-sm font-semibold text-slate-800">{{ selectedEmail.from.name }}</p>
                            <p class="text-xs text-slate-500">{{ selectedEmail.from.email }}</p>
                            <p class="text-xs text-slate-400 mt-1">to {{ selectedEmail.to }}</p>
                        </div>
                        <p class="ml-auto text-xs text-slate-400 shrink-0">{{ formatDetailDate(selectedEmail.createdAt) }}</p>
                    </div>

                    <!-- Attachments -->
                    <div v-if="selectedEmail.attachments?.length" class="flex flex-wrap gap-2">
                        <div v-for="att in selectedEmail.attachments" :key="att.name"
                            class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                            <PaperClipIcon class="w-3.5 h-3.5 text-slate-400" />
                            <span class="text-slate-700 truncate max-w-[120px]">{{ att.name }}</span>
                            <span class="text-slate-400">{{ att.size }}</span>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {{ selectedEmail.body }}
                    </div>
                </div>

                <!-- Reply -->
                <div class="border-t border-slate-200 p-4 shrink-0">
                    <div class="flex items-center gap-2 mb-2">
                        <button @click="replyMode = 'reply'"
                            class="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                            :class="replyMode === 'reply' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-100'">
                            Reply
                        </button>
                        <button @click="replyMode = 'replyAll'"
                            class="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                            :class="replyMode === 'replyAll' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-100'">
                            Reply All
                        </button>
                        <button @click="replyMode = 'forward'"
                            class="text-xs font-medium px-3 py-1.5 rounded-lg transition"
                            :class="replyMode === 'forward' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-100'">
                            Forward
                        </button>
                    </div>
                    <div class="relative">
                        <textarea v-model="replyText" rows="3" placeholder="Write your reply..."
                            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 resize-none transition" />
                        <button @click="sendReply"
                            class="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition shadow-sm">
                            Send
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </transition>
    </div>

    <!-- ─── Compose Modal ─── -->
    <Teleport to="body">
        <transition name="modal-fade">
            <div v-if="showCompose" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
                <div class="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                        <h3 class="text-sm font-bold text-slate-800">New Message</h3>
                        <button @click="showCompose = false"
                            class="p-1 rounded-lg hover:bg-slate-100 transition text-slate-400">
                            <XMarkIcon class="w-5 h-5" />
                        </button>
                    </div>
                    <div class="p-5 space-y-4">
                        <input v-model="composeForm.to" type="text" placeholder="To"
                            class="w-full border-0 border-b border-slate-200 px-0 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-green-500 transition" />
                        <input v-model="composeForm.subject" type="text" placeholder="Subject"
                            class="w-full border-0 border-b border-slate-200 px-0 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-green-500 transition" />
                        <textarea v-model="composeForm.body" rows="8" placeholder="Message"
                            class="w-full border-0 px-0 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none resize-none" />
                    </div>
                    <div class="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50">
                        <div class="flex items-center gap-2 text-slate-400">
                            <PaperClipIcon class="w-4 h-4 cursor-pointer hover:text-slate-600 transition" />
                        </div>
                        <div class="flex items-center gap-2">
                            <button @click="showCompose = false"
                                class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Discard</button>
                            <button @click="sendEmail"
                                class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition shadow-sm">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import EmailSidebarSkeleton from '@/components/skeletons/EmailSidebarSkeleton.vue'
import EmailListSkeleton from '@/components/skeletons/EmailListSkeleton.vue'
import EmailDetailSkeleton from '@/components/skeletons/EmailDetailSkeleton.vue'
import {
    PencilSquareIcon,
    TrashIcon,
    StarIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PaperClipIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    EnvelopeOpenIcon,
    InboxArrowDownIcon,
    PaperAirplaneIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    ArchiveBoxXMarkIcon
} from '@heroicons/vue/24/outline'

/* ---------- Folders ---------- */
const sidebarOpen = ref(false)
const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth < 768 }
window.addEventListener('resize', checkMobile)
checkMobile()

const folders = [
    { key: 'inbox', label: 'Inbox', icon: InboxArrowDownIcon, count: 4 },
    { key: 'sent', label: 'Sent', icon: PaperAirplaneIcon, count: null },
    { key: 'drafts', label: 'Drafts', icon: DocumentTextIcon, count: 1 },
    { key: 'spam', label: 'Spam', icon: ExclamationTriangleIcon, count: 2 },
    { key: 'trash', label: 'Trash', icon: ArchiveBoxXMarkIcon, count: null },
]

const labels = [
    { key: 'support', name: 'Support', color: 'bg-blue-500' },
    { key: 'sales', name: 'Sales', color: 'bg-green-500' },
    { key: 'urgent', name: 'Urgent', color: 'bg-red-500' },
]

const activeFolder = ref('inbox')
const searchQuery = ref('')
const selectedEmail = ref(null)
const selectAll = ref(false)
const selectedIds = ref([])
const refreshing = ref(false)
const showCompose = ref(false)
const replyMode = ref('reply')
const replyText = ref('')

const allSelected = computed(() =>
    filteredEmails.value.length > 0 && selectedIds.value.length === filteredEmails.value.length
)

watch(selectAll, (val) => {
    selectedIds.value = val ? filteredEmails.value.map(e => e.id) : []
})

function toggleSelectAll() {
    selectAll.value = !allSelected.value
}

const composeForm = reactive({ to: '', subject: '', body: '' })

/* ---------- Sample Emails ---------- */
const emails = ref([
    {
        id: 1, folder: 'inbox', isRead: false, starred: true,
        from: { name: 'Sarah Johnson', email: 'sarah@example.com' },
        to: 'support@ecoshop.com',
        subject: 'Order #ORD-5678 — Shipping delay inquiry',
        preview: 'Hi, I placed an order last week and it hasn\'t shipped yet...',
        body: `Hi Support Team,\n\nI placed an order (#ORD-5678) last Tuesday and the status still shows "Processing". My order was supposed to arrive by Friday. Could you please check what's going on?\n\nMy shipping address is:\n123 Main St, Apt 4B\nNew York, NY 10001\n\nThanks,\nSarah Johnson`,
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        attachments: [{ name: 'order_5678.pdf', size: '245 KB' }]
    },
    {
        id: 2, folder: 'inbox', isRead: false, starred: false,
        from: { name: 'Mike Chen', email: 'mike@techcorp.com' },
        to: 'support@ecoshop.com',
        subject: 'Bulk order discount request',
        preview: 'Hello, our company is interested in placing a bulk order...',
        body: `Hello,\n\nOur company TechCorp is looking to purchase 50 units of your "Wireless Headphones Pro" for our employees.\n\nCould you let us know if there's a bulk discount available? We're hoping to place the order within the next two weeks.\n\nBest regards,\nMike Chen\nProcurement Manager\nTechCorp Inc.`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        attachments: []
    },
    {
        id: 3, folder: 'inbox', isRead: true, starred: false,
        from: { name: 'Emily Davis', email: 'emily.d@email.com' },
        to: 'support@ecoshop.com',
        subject: 'Return request — Damaged item received',
        preview: 'I received my package today but the item inside was damaged...',
        body: `Dear Support,\n\nI received my order (#ORD-5721) today but unfortunately the ceramic vase arrived cracked. The packaging seemed fine so it might have been damaged before shipping.\n\nI've attached photos of the damage. Please let me know how to proceed with a return or replacement.\n\nThank you,\nEmily Davis`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        attachments: [{ name: 'damage_photo_1.jpg', size: '1.2 MB' }, { name: 'damage_photo_2.jpg', size: '890 KB' }]
    },
    {
        id: 4, folder: 'inbox', isRead: false, starred: false,
        from: { name: 'Alex Rivera', email: 'alex.r@startup.io' },
        to: 'support@ecoshop.com',
        subject: 'Partnership opportunity — EcoShop x GreenStart',
        preview: 'I came across your store and loved your eco-friendly products...',
        body: `Hi there,\n\nI'm the founder of GreenStart, a sustainability blog with 50K+ monthly readers. We're always looking to partner with eco-conscious brands.\n\nI'd love to discuss a potential collaboration — maybe a sponsored post or an affiliate partnership.\n\nLet me know if you're interested!\n\nCheers,\nAlex Rivera`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        attachments: [{ name: 'media_kit_2026.pdf', size: '3.4 MB' }]
    },
    {
        id: 5, folder: 'sent', isRead: true, starred: false,
        from: { name: 'Support Team', email: 'support@ecoshop.com' },
        to: 'sarah@example.com',
        subject: 'Re: Order #ORD-5678 — Shipping delay inquiry',
        preview: 'Hi Sarah, thank you for reaching out. We\'ve looked into your order...',
        body: `Hi Sarah,\n\nThank you for your patience. We've checked your order and it's scheduled to ship out tomorrow via USPS Priority. You should receive a tracking number within 24 hours.\n\nWe apologize for the delay and have added a 10% discount code to your account for your next purchase.\n\nBest,\nSupport Team`,
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
        attachments: [{ name: 'tracking_info.pdf', size: '156 KB' }]
    },
    {
        id: 6, folder: 'drafts', isRead: true, starred: false,
        from: { name: 'Support Team', email: 'support@ecoshop.com' },
        to: 'vendor@supplier.com',
        subject: 'New inventory order — Q2 2026',
        preview: 'We\'d like to place a new inventory order for the following items...',
        body: `Dear Supplier,\n\nWe're ready to place our Q2 inventory order. Please find the list below:\n\n- Wireless Headphones Pro: 200 units\n- Eco-Friendly Water Bottles: 500 units\n- Bamboo Phone Cases: 300 units\n\nPlease provide an updated quote with estimated delivery times.\n\nThanks,\nSupport Team`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        attachments: [{ name: 'Q2_inventory_request.xlsx', size: '68 KB' }]
    },
    {
        id: 7, folder: 'spam', isRead: true, starred: false,
        from: { name: 'Winner Notification', email: 'prize@scam-mail.com' },
        to: 'support@ecoshop.com',
        subject: 'You won $1,000,000!!!',
        preview: 'Congratulations! You have been selected as the grand prize winner...',
        body: `CONGRATULATIONS!!!\n\nYou have been selected as the grand prize winner of our international lottery! You have won $1,000,000 USD!\n\nTo claim your prize, please send us your bank details and a processing fee of $50.\n\nAct now! This offer expires soon!`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        attachments: []
    },
    {
        id: 8, folder: 'spam', isRead: false, starred: false,
        from: { name: 'SEO Experts', email: 'seo@promotion-mail.com' },
        to: 'support@ecoshop.com',
        subject: 'Boost your store ranking instantly!',
        preview: 'Guaranteed #1 ranking on Google for your online store...',
        body: `Dear Store Owner,\n\nAre you tired of low search rankings? Our team of SEO experts can get your store to the #1 position on Google within 30 days or your money back!\n\nSpecial offer: 50% off for the first 10 customers!\n\nContact us today!`,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        attachments: []
    },
])

/* ---------- Computed ---------- */
const filteredEmails = computed(() => {
    let list = emails.value.filter(e => e.folder === activeFolder.value)
    const q = searchQuery.value.toLowerCase().trim()
    if (q) {
        list = list.filter(e =>
            e.subject.toLowerCase().includes(q) ||
            e.from.name.toLowerCase().includes(q) ||
            e.from.email.toLowerCase().includes(q) ||
            e.preview.toLowerCase().includes(q)
        )
    }
    // Sort: unread first, then by date
    return list.sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
        return new Date(b.createdAt) - new Date(a.createdAt)
    })
})

/* ---------- Actions ---------- */
function toggleSelect(id) {
    const idx = selectedIds.value.indexOf(id)
    if (idx > -1) selectedIds.value.splice(idx, 1)
    else selectedIds.value.push(id)
}

function deleteSelected() {
    emails.value = emails.value.filter(e => !selectedIds.value.includes(e.id))
    selectedIds.value = []
    if (selectedEmail.value && !emails.value.find(e => e.id === selectedEmail.value?.id)) {
        selectedEmail.value = null
    }
}

function markReadSelected() {
    emails.value.forEach(e => {
        if (selectedIds.value.includes(e.id)) e.isRead = true
    })
    selectedIds.value = []
}

function deleteEmail(id) {
    emails.value = emails.value.filter(e => e.id !== id)
    if (selectedEmail.value?.id === id) selectedEmail.value = null
}

function refreshEmails() {
    refreshing.value = true
    setTimeout(() => { refreshing.value = false }, 800)
}

function sendEmail() {
    const newEmail = {
        id: Date.now(),
        folder: 'sent',
        isRead: true,
        starred: false,
        from: { name: 'Support Team', email: 'support@ecoshop.com' },
        to: composeForm.to,
        subject: composeForm.subject,
        preview: composeForm.body.substring(0, 80),
        body: composeForm.body,
        createdAt: new Date(),
        attachments: []
    }
    emails.value.unshift(newEmail)
    composeForm.to = ''
    composeForm.subject = ''
    composeForm.body = ''
    showCompose.value = false
    activeFolder.value = 'sent'
}

function sendReply() {
    if (!replyText.value.trim()) return
    const subject = replyMode.value === 'forward'
        ? `Fwd: ${selectedEmail.value.subject}`
        : `Re: ${selectedEmail.value.subject}`
    const newEmail = {
        id: Date.now(),
        folder: 'sent',
        isRead: true,
        starred: false,
        from: { name: 'Support Team', email: 'support@ecoshop.com' },
        to: selectedEmail.value.from.email,
        subject,
        preview: replyText.value.substring(0, 80),
        body: replyText.value,
        createdAt: new Date(),
        attachments: []
    }
    emails.value.unshift(newEmail)
    replyText.value = ''
    replyMode.value = 'reply'
}

/* ---------- Helpers ---------- */
function getAvatarBg(name) {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
}

function formatListDate(date) {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diff < 172800000) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatDetailDate(date) {
    return new Date(date).toLocaleDateString([], {
        weekday: 'long', month: 'long', day: 'numeric',
        year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* Skeleton → content transition */
.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
    transition: opacity 0.25s ease;
}
.skeleton-fade-enter-from,
.skeleton-fade-leave-to {
    opacity: 0;
}

.animate-fadeIn {
    animation: fadeIn 0.18s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(.97); }
    to { opacity: 1; transform: scale(1); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.animate-spin {
    animation: spin 0.8s linear infinite;
}
</style>
