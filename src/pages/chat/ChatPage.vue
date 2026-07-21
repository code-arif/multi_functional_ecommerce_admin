<template>
  <div>
    <PageHeader title="Chat" subtitle="Customer support conversations" />
    <div class="card overflow-hidden" style="min-height: calc(100vh - 220px);">
      <div class="flex h-full" style="min-height: 600px;">
        <!-- Conversation List -->
        <div class="w-80 shrink-0 border-r" :style="{ borderColor: 'var(--border)' }">
          <div class="p-3 border-b" :style="{ borderColor: 'var(--border)' }">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
              <input v-model="searchQuery" type="text" placeholder="Search conversations..." class="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none" :style="{ backgroundColor: 'var(--border-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }" />
            </div>
          </div>
          <div class="overflow-y-auto" style="height: calc(100% - 60px);">
            <button v-for="conv in conversations" :key="conv.id" @click="activeConv = conv" class="w-full text-left p-3 flex items-start gap-3 transition border-b" :class="activeConv?.id === conv.id ? 'bg-opacity-100' : ''" :style="{ borderColor: 'var(--border-light)', backgroundColor: activeConv?.id === conv.id ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent' }" @mouseenter="e => { if(activeConv?.id !== conv.id) e.currentTarget.style.backgroundColor = 'var(--border-light)' }" @mouseleave="e => { if(activeConv?.id !== conv.id) e.currentTarget.style.backgroundColor = 'transparent' }">
              <div class="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" :style="{ backgroundColor: conv.color || 'var(--color-primary)' }">{{ conv.name?.charAt(0)?.toUpperCase() }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold truncate" :style="{ color: 'var(--text-primary)' }">{{ conv.name }}</p>
                  <span class="text-[10px] shrink-0" :style="{ color: 'var(--text-muted)' }">{{ conv.time }}</span>
                </div>
                <p class="text-xs truncate mt-0.5" :style="{ color: 'var(--text-secondary)' }">{{ conv.last_message }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span v-if="conv.unread" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" :style="{ backgroundColor: 'var(--color-primary)' }">{{ conv.unread }}</span>
                  <span class="text-[10px]" :style="{ color: 'var(--text-muted)' }">{{ conv.status }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Message View -->
        <div class="flex-1 flex flex-col">
          <div v-if="activeConv" class="flex flex-col h-full">
            <div class="p-3 border-b flex items-center gap-3" :style="{ borderColor: 'var(--border)' }">
              <div class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" :style="{ backgroundColor: activeConv.color || 'var(--color-primary)' }">{{ activeConv.name?.charAt(0)?.toUpperCase() }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">{{ activeConv.name }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ activeConv.email }}</p>
              </div>
              <button @click="activeConv = null" class="p-1.5 rounded-lg transition" :style="{ color: 'var(--navbar-text)' }" title="Close conversation" @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'" @mouseleave="e => e.target.style.backgroundColor = 'transparent'"><XMarkIcon class="w-4 h-4" /></button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesRef">
              <div v-for="(msg, i) in messages" :key="i" class="flex" :class="msg.is_admin ? 'justify-end' : 'justify-start'">
                <div class="max-w-md rounded-2xl px-4 py-2.5 text-sm" :class="msg.is_admin ? 'rounded-br-md' : 'rounded-bl-md'" :style="msg.is_admin ? { backgroundColor: 'var(--color-primary)', color: '#fff' } : { backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }">
                  <p>{{ msg.text }}</p>
                  <p class="text-[10px] mt-1 text-right" :style="{ opacity: 0.7 }">{{ msg.time }}</p>
                </div>
              </div>
            </div>
            <div class="p-3 border-t" :style="{ borderColor: 'var(--border)' }">
              <div class="flex gap-2">
                <input v-model="newMessage" type="text" placeholder="Type a message..." class="flex-1 rounded-lg px-4 py-2.5 text-sm focus:outline-none" :style="{ backgroundColor: 'var(--border-light)', border: '1px solid var(--border)', color: 'var(--text-primary)' }" @keydown.enter="sendMessage" />
                <button @click="sendMessage" class="btn-primary px-4"><PaperAirplaneIcon class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <div v-else class="flex-1 flex items-center justify-center" :style="{ color: 'var(--text-muted)' }">
            <div class="text-center">
              <ChatBubbleLeftRightIcon class="w-16 h-16 mx-auto mb-4" :style="{ color: 'var(--text-muted)' }" />
              <p class="font-semibold text-lg" :style="{ color: 'var(--text-primary)' }">No conversation selected</p>
              <p class="text-sm mt-1">Choose a conversation from the left panel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { MagnifyingGlassIcon, PaperAirplaneIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
const searchQuery = ref('')
const activeConv = ref(null)
const messagesRef = ref(null)
const newMessage = ref('')
const conversations = ref([])
const messages = ref([])
const colors = ['#2E7D32','#2563EB','#7C3AED','#DC2626','#D97706','#0D9488']

function sendMessage() {
  if (!newMessage.value.trim()) return
  messages.value.push({
    text: newMessage.value,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    is_admin: true
  })
  newMessage.value = ''
}

onMounted(() => {
  conversations.value = [
    {id:1,name:'Sarah Johnson',email:'sarah@example.com',last_message:'Thank you for your help!',time:'2m ago',unread:2,status:'Online',color:colors[0]},
    {id:2,name:'Mike Chen',email:'mike@example.com',last_message:'When will my order arrive?',time:'15m ago',unread:0,status:'Offline',color:colors[1]},
    {id:3,name:'Emily Davis',email:'emily@example.com',last_message:'I want to return this product',time:'1h ago',unread:1,status:'Online',color:colors[2]},
    {id:4,name:'Alex Kumar',email:'alex@example.com',last_message:'Payment issue with my last order',time:'3h ago',unread:0,status:'Away',color:colors[3]},
    {id:5,name:'Lisa Martinez',email:'lisa@example.com',last_message:'Shipping address change',time:'1d ago',unread:0,status:'Offline',color:colors[4]},
    {id:6,name:'Tom Wilson',email:'tom@example.com',last_message:'Discount code not working',time:'2d ago',unread:0,status:'Offline',color:colors[5]},
  ]
})
</script>
