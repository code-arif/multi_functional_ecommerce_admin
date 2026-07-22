<template>
    <div>
        <PageHeader title="Customers" :subtitle="`${pagination?.total || 0} registered customers`" />
        <DataTable :items="users" :columns="columns" :loading="loading" searchable
            search-placeholder="Search by name, email..." empty-icon="👥" empty-text="No customers found"
            @search="q => { search = q; load(1) }">
            <template #filters>
                <SelectBox
                    v-model="statusFilter"
                    :options="statusOptions"
                    placeholder="All Status"
                    size="sm"
                    @change="load(1)"
                />
            </template>
            <template #default="{ item }">
                <td class="table-cell">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {{ item.name?.charAt(0)?.toUpperCase() }}
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 text-sm">{{ item.name }}</p>
                            <p class="text-gray-400 text-xs">{{ item.email }}</p>
                        </div>
                    </div>
                </td>
                <td class="table-cell text-sm text-gray-600">{{ item.phone || '—' }}</td>
                <td class="table-cell">
                    <StatusBadge :value="item.status" />
                </td>
                <td class="table-cell text-xs text-gray-400">{{ formatDate(item.created_at) }}</td>
                <td class="table-cell text-right">
                    <div class="flex items-center justify-end gap-1">
                        <router-link :to="`/users/${item.id}`" class="btn-ghost text-xs py-1.5 px-3">View</router-link>
                        <SelectBox
                            :model-value="item.status"
                            :options="statusRowOptions"
                            size="sm"
                            @change="v => changeStatus(item.id, v)"
                        />
                    </div>
                </td>
            </template>
        </DataTable>
        <Pagination :pagination="pagination" @page="load" />
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import { userApi } from '@/api'
const toast = useToast()
const users = ref([]), pagination = ref(null), loading = ref(true), search = ref(''), statusFilter = ref('')

const statusOptions = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'banned', label: 'Banned' },
]

const statusRowOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'banned', label: 'Ban' },
]

const columns = [
    { key: 'name', label: 'Customer', class: '' },
    { key: 'phone', label: 'Phone', class: 'w-32' },
    { key: 'status', label: 'Status', class: 'w-24' },
    { key: 'joined', label: 'Joined', class: 'w-32' },
    { key: 'actions', label: '', class: 'w-44 text-right' },
]
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : '' }
async function load(page = 1) {
    loading.value = true
    try { const r = await userApi.list({ page, search: search.value, status: statusFilter.value }); users.value = r.data.data || []; pagination.value = r.data.pagination } finally { loading.value = false }
}
async function changeStatus(id, status) {
    await userApi.updateStatus(id, status); toast.success('Status updated.'); load()
}
onMounted(() => load())
</script>