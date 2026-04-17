<template>
    <div class="w-full max-w-full overflow-hidden">
        <PageHeader title="Orders" :subtitle="`${pagination?.total || 0} total orders`">

            <!-- Top Right Button -->
            <template #actions>
                <router-link to="/orders"
                    class="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#2E7D32] border border-[#2E7D32] rounded-lg hover:bg-[#2E7D32] hover:text-white transition-all duration-200">
                    View All
                </router-link>
            </template>

        </PageHeader>

        <!-- Status filter tabs -->
        <div class="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide w-full">
            <button v-for="tab in statusTabs" :key="tab.value" @click="statusFilter = tab.value; load(1)"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0"
                :class="statusFilter === tab.value
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'">

                {{ tab.label }}

                <span v-if="tab.count"
                    class="text-[10px] px-1.5 py-0.5 rounded-full"
                    :class="statusFilter === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'">
                    {{ tab.count }}
                </span>
            </button>
        </div>

        <!-- Table -->
        <div class="w-full overflow-x-auto">
            <DataTable :items="orders" :columns="columns" :loading="loading" :pagination="pagination" searchable
                search-placeholder="Order number, name, phone..."
                empty-text="No orders found"
                @search="q => { search = q; load(1) }"
                @page="load">

                <template #empty-icon>
                    <ClipboardList class="w-10 h-10 text-gray-300 mx-auto" />
                </template>

                <template #default="{ item }">
                    <td class="table-cell">
                        <p class="font-bold text-gray-900 text-sm">#{{ item.order_number }}</p>
                        <p class="text-gray-400 text-xs">{{ formatDate(item.created_at) }}</p>
                    </td>

                    <td class="table-cell">
                        <p class="font-semibold text-gray-800 text-sm">
                            {{ item.shipping_address?.name }}
                        </p>
                        <p class="text-gray-400 text-xs">
                            {{ item.shipping_address?.phone }}
                        </p>
                    </td>

                    <td class="table-cell">
                        <StatusBadge :value="item.status" />
                    </td>

                    <td class="table-cell">
                        <StatusBadge :value="item.payment_status" />
                    </td>

                    <td class="table-cell">
                        <p class="font-bold text-[#2E7D32]">
                            ৳{{ Number(item.total_amount).toLocaleString() }}
                        </p>
                        <p class="text-xs text-gray-400 uppercase">
                            {{ item.payment_method }}
                        </p>
                    </td>

                    <td class="table-cell text-right">
                        <router-link :to="`/orders/${item.id}`"
                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:border-[#2E7D32] hover:bg-green-50 transition">
                            <Eye class="w-4 h-4 text-gray-700" />
                        </router-link>
                    </td>
                </template>

            </DataTable>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { orderApi } from '@/api'

import {
    Eye,
    ClipboardList
} from 'lucide-vue-next'

const orders = ref([])
const pagination = ref(null)
const loading = ref(true)

const search = ref('')
const statusFilter = ref('')

const statusTabs = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

const columns = [
    { key: 'order', label: 'Order', class: 'min-w-[150px]' },
    { key: 'customer', label: 'Customer', class: 'min-w-[180px]' },
    { key: 'status', label: 'Status', class: 'min-w-[130px]' },
    { key: 'payment', label: 'Payment', class: 'min-w-[130px]' },
    { key: 'total', label: 'Total', class: 'min-w-[130px]' },
    { key: 'actions', label: 'Action', class: 'w-20 text-right' },
]

function formatDate(d) {
    return d
        ? new Date(d).toLocaleDateString('en-BD', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
        : ''
}

async function load(page = 1) {
    loading.value = true

    try {
        const res = await orderApi.list({
            page,
            search: search.value,
            status: statusFilter.value,
            per_page: 20
        })

        orders.value = res.data.data || []
        pagination.value = res.data.pagination

    } finally {
        loading.value = false
    }
}

onMounted(() => load())
</script>