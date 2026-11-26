<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />

    <div v-if="loading" class="card p-10 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
      Loading customer details...
    </div>

    <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-5">
        <div class="flex flex-col items-center text-center mb-5">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black mb-3"
            :style="{ backgroundColor: 'var(--color-primary)' }"
          >
            {{ user.name?.charAt(0)?.toUpperCase() }}
          </div>
          <h2 class="font-bold text-lg" :style="{ color: 'var(--text-primary)' }">{{ user.name }}</h2>
          <p class="text-sm" :style="{ color: 'var(--text-muted)' }">{{ user.email }}</p>
          <div class="flex flex-wrap items-center justify-center gap-2 mt-2.5">
            <StatusBadge :value="user.status" />
            <span
              v-if="user.is_verified_customer"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <CheckBadgeIcon class="w-3.5 h-3.5" />
              Verified Customer
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
            >
              <UserIcon class="w-3.5 h-3.5" />
              Free / Unverified User
            </span>
          </div>
        </div>

        <div class="space-y-2.5 text-sm border-t pt-4" :style="{ borderColor: 'var(--border)' }">
          <div class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Phone</span>
            <span :style="{ color: 'var(--text-primary)' }">{{ user.phone || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Joined</span>
            <span :style="{ color: 'var(--text-primary)' }">{{ formatDate(user.created_at) }}</span>
          </div>
          <div class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Verified Orders</span>
            <span class="font-bold" :style="{ color: 'var(--text-primary)' }">{{ user.orders_count || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Total Spent</span>
            <span class="font-bold" :style="{ color: 'var(--color-primary)' }">৳{{ Number(user.total_spent || 0).toLocaleString() }}</span>
          </div>
          <div v-if="user.last_order_at" class="flex justify-between">
            <span :style="{ color: 'var(--text-muted)' }">Last Order</span>
            <span :style="{ color: 'var(--text-primary)' }">{{ formatDate(user.last_order_at) }}</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t" :style="{ borderColor: 'var(--border)' }">
          <label class="label">Change Status</label>
          <SelectBox v-model="newStatus" :options="statusOptions" placeholder="Select status" fullWidth @change="updateStatus" />
        </div>
      </div>

      <div class="lg:col-span-2 card overflow-hidden">
        <div class="p-4 border-b flex items-center justify-between" :style="{ borderColor: 'var(--border)' }">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Order History</h3>
          <span class="text-xs" :style="{ color: 'var(--text-muted)' }">
            {{ user.orders?.length || 0 }} total records
          </span>
        </div>
        <table class="w-full" v-if="user.orders?.length">
          <tbody>
            <tr
              v-for="order in user.orders"
              :key="order.uuid || order.id"
              class="table-row cursor-pointer"
              @click="$router.push(`/orders/${order.uuid || order.id}`)"
            >
              <td class="table-cell">
                <p class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">#{{ order.order_number }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDate(order.created_at) }}</p>
              </td>
              <td class="table-cell text-xs" :style="{ color: 'var(--text-secondary)' }">
                {{ order.vendor?.shop_name || 'Platform' }}
              </td>
              <td class="table-cell">
                <StatusBadge :value="order.status" />
              </td>
              <td class="table-cell text-right font-bold" :style="{ color: 'var(--color-primary)' }">
                ৳{{ Number(order.total_amount).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
          No orders yet — this account is a Free / Unverified User.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { UsersIcon, CheckBadgeIcon, UserIcon } from '@heroicons/vue/24/outline'
import { customerApi } from '@/api'

const route = useRoute()
const toast = useToast()
const user = ref(null)
const loading = ref(true)
const newStatus = ref('')

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'banned', label: 'Banned' },
]

const breadcrumbItems = computed(() => [
  { label: 'Customers', to: '/users', icon: UsersIcon },
  { label: user.value?.name || 'Loading...' },
])

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
}

async function loadUser() {
  loading.value = true
  try {
    const r = await customerApi.show(route.params.id)
    user.value = r.data.data
    newStatus.value = user.value?.status || 'active'
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load customer.')
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  if (!user.value || !newStatus.value) return
  try {
    const r = await customerApi.updateStatus(user.value.uuid || user.value.id, newStatus.value)
    user.value = r.data.data
    toast.success('Status changed to ' + (statusOptions.find(o => o.value === newStatus.value)?.label || newStatus.value))
  } catch (e) {
    toast.error(e.response?.data?.message || 'Status update failed.')
    newStatus.value = user.value.status
  }
}

onMounted(loadUser)
</script>
