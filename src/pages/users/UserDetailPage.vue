<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div v-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-5">
        <div class="flex flex-col items-center text-center mb-5">
          <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black mb-3" :style="{ backgroundColor: 'var(--color-primary)' }">
            {{ user.name?.charAt(0)?.toUpperCase() }}
          </div>
          <h2 class="font-bold text-lg" :style="{ color: 'var(--text-primary)' }">{{ user.name }}</h2>
          <p class="text-sm" :style="{ color: 'var(--text-muted)' }">{{ user.email }}</p>
          <div class="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 mt-2">
            <StatusBadge :value="user.status" />
          </div>
        </div>
        <div class="space-y-2.5 text-sm border-t pt-4" :style="{ borderColor: 'var(--border)' }">
          <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Phone</span><span :style="{ color: 'var(--text-primary)' }">{{ user.phone || '—' }}</span></div>
          <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Joined</span><span :style="{ color: 'var(--text-primary)' }">{{ formatDate(user.created_at) }}</span></div>
          <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Orders</span><span class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ user.orders?.length || 0 }}</span></div>
        </div>
        <div class="mt-4 pt-4 border-t" :style="{ borderColor: 'var(--border)' }">
          <label class="label">Change Status</label>
          <SelectBox v-model="newStatus" :options="statusOptions" placeholder="Select status" fullWidth @change="updateStatus" />
        </div>
      </div>
      <div class="lg:col-span-2 card overflow-hidden">
        <div class="p-4 border-b" :style="{ borderColor: 'var(--border)' }">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Recent Orders</h3>
        </div>
        <table class="w-full">
          <tbody>
            <tr v-for="order in user.orders || []" :key="order.id" class="table-row cursor-pointer"
              @click="$router.push(`/orders/${order.id}`)">
              <td class="table-cell">
                <p class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">#{{ order.order_number }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDate(order.created_at) }}</p>
              </td>
              <td class="table-cell">
                <StatusBadge :value="order.status" />
              </td>
              <td class="table-cell text-right font-bold" :style="{ color: 'var(--color-primary)' }">৳{{ Number(order.total_amount).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!user.orders?.length" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">No orders yet</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { UsersIcon } from '@heroicons/vue/24/outline'

const route = useRoute(), toast = useToast()
const user = ref(null), newStatus = ref('')

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' }
]

const breadcrumbItems = computed(() => [
  { label: 'Users', to: '/users', icon: UsersIcon },
  { label: user.value?.name || 'Loading...' }
])

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '' }

function updateStatus() {
  toast.success('Status changed to ' + (statusOptions.find(o => o.value === newStatus.value)?.label || newStatus.value))
  if (user.value) user.value.status = newStatus.value
}

onMounted(() => {
  setTimeout(() => {
    user.value = {
      id: route.params.id,
      name: ['Sarah Johnson', 'Mike Chen', 'Emily Davis'][Number(route.params.id) - 1] || 'Customer',
      email: ['sarah@example.com', 'mike@example.com', 'emily@example.com'][Number(route.params.id) - 1] || 'user@example.com',
      phone: '+8801711111111',
      status: ['active', 'active', 'inactive'][Number(route.params.id) - 1] || 'active',
      created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
      orders: [
        { id: 1, order_number: 'ORD-1024', status: 'delivered', total_amount: 4500, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
        { id: 2, order_number: 'ORD-1025', status: 'shipped', total_amount: 2800, created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
        { id: 3, order_number: 'ORD-1026', status: 'processing', total_amount: 12000, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      ]
    }
    newStatus.value = user.value.status
  }, 300)
})
</script>