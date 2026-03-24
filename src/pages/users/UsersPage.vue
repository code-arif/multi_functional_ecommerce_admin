<template>
  <div>
    <PageHeader title="Customers" :subtitle="`${pagination?.total||0} registered customers`" />
    <DataTable :items="users" :columns="columns" :loading="loading" :pagination="pagination"
      searchable search-placeholder="Search by name, email..." empty-icon="👥" empty-text="No customers found"
      @search="q=>{search=q;load(1)}" @page="load">
      <template #filters>
        <select v-model="statusFilter" @change="load(1)" class="input-sm w-28">
          <option value="">All</option><option value="active">Active</option>
          <option value="inactive">Inactive</option><option value="banned">Banned</option>
        </select>
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {{ item.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ item.name }}</p>
              <p class="text-gray-400 text-xs">{{ item.email }}</p>
            </div>
          </div>
        </td>
        <td class="table-cell text-sm text-gray-600">{{ item.phone || '—' }}</td>
        <td class="table-cell"><StatusBadge :value="item.status" /></td>
        <td class="table-cell text-xs text-gray-400">{{ formatDate(item.created_at) }}</td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1">
            <router-link :to="`/users/${item.id}`" class="btn-ghost text-xs py-1.5 px-3">View</router-link>
            <select @change="e=>changeStatus(item.id, e.target.value)" :value="item.status"
              class="input-sm w-24 text-xs">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Ban</option>
            </select>
          </div>
        </td>
      </template>
    </DataTable>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable  from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { userApi } from '@/api'
const toast = useToast()
const users = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('')
const columns = [
  { key:'name', label:'Customer', class:'' },
  { key:'phone', label:'Phone', class:'w-32' },
  { key:'status', label:'Status', class:'w-24' },
  { key:'joined', label:'Joined', class:'w-32' },
  { key:'actions', label:'', class:'w-44 text-right' },
]
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' }) : '' }
async function load(page=1) {
  loading.value=true
  try { const r=await userApi.list({page, search:search.value, status:statusFilter.value}); users.value=r.data.data||[]; pagination.value=r.data.pagination } finally { loading.value=false }
}
async function changeStatus(id, status) {
  await userApi.updateStatus(id, status); toast.success('Status updated.'); load()
}
onMounted(()=>load())
</script>
VUEEOF

cat > /home/claude/ecommerce-admin/src/pages/users/UserDetailPage.vue << 'VUEEOF'
<template>
  <div class="max-w-4xl">
    <PageHeader :title="user?.name||'Customer'" subtitle="Customer details and order history">
      <button @click="$router.push('/users')" class="btn-ghost">← Users</button>
    </PageHeader>
    <div v-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card p-5">
        <div class="flex flex-col items-center text-center mb-5">
          <div class="w-16 h-16 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-2xl font-black mb-3">
            {{ user.name?.charAt(0)?.toUpperCase() }}
          </div>
          <h2 class="font-bold text-gray-900">{{ user.name }}</h2>
          <p class="text-sm text-gray-500">{{ user.email }}</p>
          <StatusBadge :value="user.status" class="mt-2" />
        </div>
        <div class="space-y-2.5 text-sm border-t border-gray-100 pt-4">
          <div class="flex justify-between"><span class="text-gray-500">Phone</span><span>{{ user.phone||'—' }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Joined</span><span>{{ formatDate(user.created_at) }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Orders</span><span class="font-bold">{{ user.orders?.length||0 }}</span></div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100">
          <label class="label">Change Status</label>
          <select v-model="newStatus" @change="updateStatus" class="input text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>
      <div class="lg:col-span-2 card overflow-hidden">
        <div class="p-4 border-b border-gray-100"><h3 class="font-bold text-gray-900">Recent Orders</h3></div>
        <table class="w-full">
          <tbody>
            <tr v-for="order in user.orders||[]" :key="order.id" class="table-row cursor-pointer" @click="$router.push(`/orders/${order.id}`)">
              <td class="table-cell"><p class="font-bold text-sm">#{{ order.order_number }}</p><p class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</p></td>
              <td class="table-cell"><StatusBadge :value="order.status" /></td>
              <td class="table-cell text-right font-bold text-[#2E7D32]">৳{{ Number(order.total_amount).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!user.orders?.length" class="p-8 text-center text-gray-400 text-sm">No orders yet</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { userApi } from '@/api'
const route=useRoute(), toast=useToast()
const user=ref(null), newStatus=ref('')
function formatDate(d){ return d?new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}):'' }
async function updateStatus() { await userApi.updateStatus(route.params.id, newStatus.value); toast.success('Status updated.') }
onMounted(async()=>{ const r=await userApi.show(route.params.id); user.value=r.data.data; newStatus.value=user.value.status })
</script>