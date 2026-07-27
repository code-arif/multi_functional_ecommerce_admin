<template>
    <div>
        <Breadcrumb :items="breadcrumbItems" />

        <!-- Bulk Action Bar -->
        <transition name="panel-slide">
            <div v-if="selectedOrders.size > 0" class="card p-3 mb-4 flex items-center gap-3"
                style="border-color: var(--color-primary); border-width: 1.5px;">
                <span class="text-sm font-semibold" style="color: var(--text-primary)">
                    {{ selectedOrders.size }} selected
                </span>
                <div class="flex items-center gap-2 ml-auto">
                    <SelectBox
                        v-model="bulkStatus"
                        :options="bulkStatusOptions"
                        placeholder="Change status to..."
                        size="sm"
                    />
                    <button @click="applyBulkStatus"
                        :disabled="!bulkStatus"
                        class="btn-primary text-xs py-1.5 px-3">
                        Apply
                    </button>
                    <button @click="clearSelection"
                        class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                        Clear
                    </button>
                </div>
            </div>
        </transition>

        <!-- Date Range Filter Panel -->
        <transition name="panel-slide">
            <div v-if="showFilters" class="card p-4 mb-4 flex flex-wrap items-end gap-4">
                <div>
                    <label class="label">Order Date</label>
                    <DatePicker
                        v-model:from="dateFrom"
                        v-model:to="dateTo"
                        :presets="datePresets"
                        range
                        placeholder="Order date"
                        display-format="MMM dd, yyyy"
                    />
                </div>
                <button @click="load(1)" class="btn-primary text-sm py-1.5 px-4">Apply</button>
                <button @click="clearDateFilter" class="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors" v-if="dateFrom || dateTo">
                    Clear Dates
                </button>
            </div>
        </transition>

        <!-- Table -->
        <div class="w-full overflow-x-auto">
            <DataTable :items="orders" :columns="columns" :loading="loading" searchable :pagination="pagination"
                search-placeholder="Order number, name, phone..."
                empty-text="No orders found"
                @search="q => { search = q; load(1) }"
                @page="load">

                <template #actions>
                    <button @click="showFilters = !showFilters"
                        class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                        :style="{ color: showFilters ? 'var(--color-primary)' : '', borderColor: showFilters ? 'var(--color-primary)' : '' }">
                        <Funnel class="w-4 h-4" />
                        Filters
                    </button>
                    <button @click="exportOrders"
                        class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5">
                        <Download class="w-4 h-4" />
                        Export
                    </button>
                </template>

                <template #filters>
                    <SelectBox v-model="statusFilter" :options="statusOptions" placeholder="All Status" size="md" @change="load(1)" />
                </template>

                <template #empty-icon>
                    <ClipboardList class="w-10 h-10 mx-auto" style="color:var(--text-muted)" />
                </template>

                <template #default="{ item }">
                    <td class="table-cell w-10">
                        <input type="checkbox"
                            :checked="selectedOrders.has(item.id)"
                            @change="toggleSelect(item.id)"
                            class="w-4 h-4 rounded cursor-pointer"
                            style="accent-color:var(--color-primary)"
                        />
                    </td>
                    <td class="table-cell">
                        <p class="font-bold text-sm" style="color:var(--text-primary)">#{{ item.order_number }}</p>
                        <p class="text-xs" style="color:var(--text-muted)">{{ formatDate(item.created_at) }}</p>
                    </td>

                    <td class="table-cell">
                        <p class="font-semibold text-sm" style="color:var(--text-primary)">
                            {{ item.shipping_address?.name }}
                        </p>
                        <p class="text-xs" style="color:var(--text-muted)">
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
                        <p class="font-bold" style="color:var(--color-primary)">
                            ৳{{ Number(item.total_amount).toLocaleString() }}
                        </p>
                        <p class="text-xs uppercase" style="color:var(--text-muted)">
                            {{ item.payment_method }}
                        </p>
                    </td>

                    <td class="table-cell text-right">
                        <div class="flex items-center justify-end gap-1 whitespace-nowrap">
                            <Tooltip text="View">
                                <router-link :to="`/orders/${item.id}`"
                                    class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all">
                                    <Eye class="w-4 h-4" />
                                </router-link>
                            </Tooltip>
                        </div>
                    </td>
                </template>

            </DataTable>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { startOfYear } from 'date-fns'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import { orderApi } from '@/api'
import { useCsvExport } from '@/composables/useCsvExport'

import {
    Eye,
    ClipboardList,
    Funnel,
    Download
} from 'lucide-vue-next'
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const { exportToCsv } = useCsvExport()

const orders = ref([])
const pagination = ref(null)
const loading = ref(true)

const search = ref('')
const statusFilter = ref('')
const showFilters = ref(false)
const dateFrom = ref('')
const dateTo = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Orders', icon: ClipboardDocumentListIcon }
])

/* ─── Bulk Actions ─── */
const selectedOrders = ref(new Set())
const bulkStatus = ref('')
const bulkStatusOptions = [
    { value: '', label: 'Change status to...' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

function toggleSelect(id) {
    const newSet = new Set(selectedOrders.value)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    selectedOrders.value = newSet
}

function clearSelection() {
    selectedOrders.value = new Set()
    bulkStatus.value = ''
}

async function applyBulkStatus() {
    if (!bulkStatus.value || !selectedOrders.value.size) return
    const ids = Array.from(selectedOrders.value)
    try {
        // Apply status to all selected orders
        await Promise.all(ids.map(id => orderApi.updateStatus(id, { status: bulkStatus.value })))
        toast.success(`Updated ${ids.length} orders to "${bulkStatus.value}"`)
        clearSelection()
        load(pagination.value?.current_page || 1)
    } catch {
        toast.error('Failed to update some orders.')
    }
}

const datePresets = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: 'This Year', getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

function clearDateFilter() {
    dateFrom.value = ''
    dateTo.value = ''
    load(1)
}

const columns = [
    { key: 'select', label: '', class: 'w-10' },
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

function exportOrders() {
    const cols = [
        { key: 'order_number', label: 'Order #' },
        { key: 'customer_name', label: 'Customer', transform: (_, item) => item.shipping_address?.name || '' },
        { key: 'status', label: 'Status' },
        { key: 'payment_status', label: 'Payment' },
        { key: 'total_amount', label: 'Total (৳)', transform: v => `৳${Number(v).toLocaleString()}` },
        { key: 'created_at', label: 'Date', transform: v => v ? new Date(v).toLocaleDateString() : '' },
    ]
    const totalOrders = pagination.value?.total || orders.value.length
    exportToCsv(orders.value, cols, `orders-export-${totalOrders}-orders`)
}

async function load(page = 1) {
    loading.value = true

    try {
        const res = await orderApi.list({
            page,
            search: search.value,
            status: statusFilter.value,
            date_from: dateFrom.value || undefined,
            date_to: dateTo.value || undefined,
            per_page: 20
        })

        orders.value = res.data.data || []
        pagination.value = res.data.pagination
        selectedOrders.value = new Set() // Clear selections on reload

    } finally {
        loading.value = false
    }
}

onMounted(() => load())
</script>