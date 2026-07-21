<template>
  <div class="max-w-4xl">
    <PageHeader :title="'Transaction #' + (transaction?.id || route.params.id)" subtitle="Transaction details and payment information">
      <button @click="$router.push('/transactions')" class="btn-ghost">← Transactions</button>
    </PageHeader>
    <div v-if="!transaction" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading transaction...
    </div>
    <template v-if="transaction">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }"><CreditCardIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Payment Info</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Amount</span><span class="font-bold text-lg" :style="{ color: 'var(--color-primary)' }">৳{{ Number(transaction.amount).toLocaleString() }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Method</span><StatusBadge :value="transaction.payment_method" /></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Status</span><StatusBadge :value="transaction.status" /></div>
              <div class="pt-3 border-t" :style="{ borderColor: 'var(--border-light)' }">
                <div class="flex justify-between text-xs"><span :style="{ color: 'var(--text-muted)' }">Transaction ID</span><span class="font-mono" :style="{ color: 'var(--text-primary)' }">TXN-{{ transaction.id }}</span></div>
                <div class="flex justify-between text-xs mt-1"><span :style="{ color: 'var(--text-muted)' }">Date</span><span :style="{ color: 'var(--text-primary)' }">{{ formatDate(transaction.created_at) }}</span></div>
              </div>
            </div>
          </div>
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }"><UserIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Customer</h3>
            <div class="space-y-2 text-sm">
              <p class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ transaction.customer_name }}</p>
              <p :style="{ color: 'var(--text-muted)' }">{{ transaction.customer_email }}</p>
              <p :style="{ color: 'var(--text-muted)' }">{{ transaction.customer_phone || '—' }}</p>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }"><ClockIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Status Timeline</h3>
            <div class="space-y-0">
              <div v-for="(event, i) in timeline" :key="i" class="flex items-start gap-4 pb-6 relative">
                <div class="flex flex-col items-center">
                  <div class="w-3 h-3 rounded-full shrink-0" :class="event.completed ? '' : 'ring-2'" :style="{ backgroundColor: event.completed ? 'var(--color-primary)' : 'transparent', '--tw-ring-color': 'var(--color-primary)' }"></div>
                  <div v-if="i < timeline.length - 1" class="w-0.5 flex-1 mt-1" :style="{ backgroundColor: 'var(--border-light)' }"></div>
                </div>
                <div class="flex-1 -mt-0.5">
                  <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">{{ event.title }}</p>
                  <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ event.time }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card overflow-hidden">
            <div class="p-4 border-b" :style="{ borderColor: 'var(--border)' }"><h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Order Details</h3></div>
            <div class="p-5 text-sm" :style="{ color: 'var(--text-secondary)' }">
              <p>Order <router-link :to="`/orders/${transaction.order_id}`" class="font-semibold underline">#{{ transaction.order_id }}</router-link></p>
              <div class="mt-3 space-y-2">
                <div v-for="item in transaction.items || []" :key="item.id" class="flex justify-between">
                  <span>{{ item.name }} × {{ item.qty }}</span>
                  <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">৳{{ Number(item.total).toLocaleString() }}</span>
                </div>
                <div class="pt-2 border-t font-bold flex justify-between" :style="{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }">
                  <span>Total</span><span>৳{{ Number(transaction.amount).toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { CreditCardIcon, UserIcon, ClockIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const transaction = ref(null)
const timeline = [
  {title:'Transaction Initiated',time:'2026-07-22 10:30 AM',completed:true},
  {title:'Payment Processed',time:'2026-07-22 10:31 AM',completed:true},
  {title:'Order Confirmed',time:'2026-07-22 10:32 AM',completed:true},
  {title:'Funds Settled',time:'2026-07-22 11:00 AM',completed:false},
]
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '' }
onMounted(() => {
  setTimeout(() => {
    transaction.value = {
      id: route.params.id, amount: 2450, payment_method: 'bkash', status: 'completed',
      customer_name: 'Sarah Johnson', customer_email: 'sarah@example.com', customer_phone: '+8801712345678',
      order_id: 1024, created_at: new Date(Date.now()-2*86400000).toISOString(),
      items: [{id:1,name:'Wireless Headphones',qty:1,total:1800},{id:2,name:'USB-C Cable',qty:2,total:650}],
    }
  }, 300)
})
</script>
