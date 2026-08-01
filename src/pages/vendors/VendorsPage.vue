<template>
    <div>
        <BreadcrumbHeader :items="breadcrumbItems">
            <button @click="showAddModal = true" class="btn-primary text-sm">
                Add Vendor
            </button>
        </BreadcrumbHeader>

        <!-- Stats Bar -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div class="card p-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }">
                    <BuildingStorefrontIcon class="w-4 h-4" :style="{ color: 'var(--color-primary)' }" />
                </div>
                <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Total</p>
                    <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.total || 0 }}</p>
                </div>
            </div>
            <div class="card p-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)' }">
                    <CheckBadgeIcon class="w-4 h-4" :style="{ color: 'var(--success)' }" />
                </div>
                <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Active</p>
                    <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.active || 0 }}</p>
                </div>
            </div>
            <div class="card p-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--warning) 15%, transparent)' }">
                    <ClockIcon class="w-4 h-4" :style="{ color: 'var(--warning)' }" />
                </div>
                <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Pending</p>
                    <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.pending || 0 }}</p>
                </div>
            </div>
            <div class="card p-3 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--danger) 15%, transparent)' }">
                    <NoSymbolIcon class="w-4 h-4" :style="{ color: 'var(--danger)' }" />
                </div>
                <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Suspended</p>
                    <p class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.suspended || 0 }}</p>
                </div>
            </div>
        </div>

        <!-- Filter Panel -->
        <div class="card p-4 mb-4 relative">
            <!-- Single row: All filters in one responsive line -->
            <div class="flex flex-wrap items-end gap-3">
                <div class="list-filter-item">
                    <label class="label">Status</label>
                    <SelectBox
                        v-model="filters.status"
                        :options="statusOptions"
                        placeholder="All Status"
                        size="sm"
                        full-width
                        @change="load(1)"
                    />
                </div>
                <div class="list-filter-item">
                    <label class="label">Verified</label>
                    <SelectBox
                        v-model="filters.verified"
                        :options="verifiedOptions"
                        placeholder="All"
                        size="sm"
                        full-width
                        @change="load(1)"
                    />
                </div>
                <div class="list-filter-item">
                    <label class="label">Products</label>
                    <SelectBox
                        v-model="filters.products"
                        :options="productsOptions"
                        placeholder="Any"
                        size="sm"
                        full-width
                        @change="load(1)"
                    />
                </div>
                <div class="list-filter-item">
                    <label class="label">Rating</label>
                    <SelectBox
                        v-model="filters.rating"
                        :options="ratingOptions"
                        placeholder="Any"
                        size="sm"
                        full-width
                        @change="load(1)"
                    />
                </div>
                <div class="list-filter-item list-filter-item--wide">
                    <label class="label">Join Date</label>
                    <DatePicker
                        v-model:from="filters.joinFrom"
                        v-model:to="filters.joinTo"
                        :presets="joinPresets"
                        range
                        display-format="MMM dd, yyyy"
                    />
                </div>
                <div class="list-filter-item">
                    <label class="label">Sort By</label>
                    <SelectBox
                        v-model="filters.sort"
                        :options="sortOptions"
                        size="sm"
                        full-width
                        @change="load(1)"
                    />
                </div>
            </div>
            <div class="flex items-center gap-2 mt-3 pt-3 border-t"
                :style="{ borderColor: 'var(--border)' }">
                <button @click="resetFilters" class="reset-btn">
                    <XMarkIcon class="w-3.5 h-3.5" />
                    Reset Filters
                </button>
                <span class="text-xs" :style="{ color: 'var(--text-muted)' }">
                    {{ pagination?.from || 0 }}–{{ pagination?.to || 0 }} of {{ pagination?.total || 0 }}
                </span>
            </div>
        </div>

        <!-- Main Table -->
        <div class="card overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[1000px]">
                    <thead>
                        <tr>
                            <th class="list-th">Shop &amp; Vendor</th>
                            <th class="list-th">Contact</th>
                            <th class="list-th">Products</th>
                            <th class="list-th">Sales</th>
                            <th class="list-th">Rating</th>
                            <th class="list-th">Status</th>
                            <th class="list-th">Joined</th>
                            <th class="list-th text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td :colspan="8" class="text-center py-16">
                                <div class="flex flex-col items-center gap-3" :style="{ color: 'var(--text-muted)' }">
                                    <svg class="w-7 h-7 animate-spin" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    <span class="text-sm">Loading vendors...</span>
                                </div>
                            </td>
                        </tr>
                        <tr v-else-if="!vendors.length">
                            <td :colspan="8" class="text-center py-16">
                                <div class="flex flex-col items-center gap-2" :style="{ color: 'var(--text-muted)' }">
                                    <BuildingStorefrontIcon class="w-10 h-10" :style="{ color: 'var(--text-muted)' }" />
                                    <p class="text-sm font-medium">No vendors found</p>
                                    <p class="text-xs">Try adjusting your filters or search terms</p>
                                </div>
                            </td>
                        </tr>
                        <tr v-else v-for="v in vendors" :key="v.id"
                            class="list-row cursor-pointer"
                            @click="$router.push(`/vendors/${v.id}`)">
                            <!-- Shop & Vendor -->
                            <td class="list-td">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border"
                                        :style="{ borderColor: 'var(--border)' }">
                                        <img v-if="v.shop_logo" :src="v.shop_logo" :alt="v.shop_name"
                                            class="w-full h-full object-cover" />
                                        <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold"
                                            :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }">
                                            {{ v.shop_name?.charAt(0)?.toUpperCase() || v.name?.charAt(0)?.toUpperCase() || 'V' }}
                                        </div>
                                    </div>
                                    <div class="min-w-0">
                                        <p class="list-name">{{ v.shop_name || v.name }}</p>
                                        <p class="list-sub">{{ v.name || v.shop_name }}</p>
                                    </div>
                                </div>
                            </td>
                            <!-- Contact -->
                            <td class="list-td">
                                <p class="list-name">{{ v.email }}</p>
                                <p class="list-sub">{{ v.phone || '—' }}</p>
                            </td>
                            <!-- Products -->
                            <td class="list-td">
                                <div class="flex items-center gap-2">
                                    <span class="list-count">{{ v.products_count || 0 }}</span>
                                    <div class="w-16 h-1.5 rounded-full" :style="{ backgroundColor: 'var(--border-light)' }">
                                        <div class="h-full rounded-full transition-all"
                                            :style="{
                                                width: Math.min((v.products_count || 0) / 50 * 100, 100) + '%',
                                                backgroundColor: 'var(--color-primary)'
                                            }"></div>
                                    </div>
                                </div>
                            </td>
                            <!-- Sales -->
                            <td class="list-td">
                                <p class="list-count">৳{{ (v.total_sales || 0).toLocaleString() }}</p>
                                <p class="list-sub">{{ v.total_orders || 0 }} orders</p>
                            </td>
                            <!-- Rating -->
                            <td class="list-td">
                                <div class="flex items-center gap-1.5">
                                    <StarIcon class="w-3.5 h-3.5" :style="{ color: '#F59E0B' }" />
                                    <span class="list-count">{{ (v.rating || 0).toFixed(1) }}</span>
                                    <span class="list-sub">({{ v.reviews_count || 0 }})</span>
                                </div>
                            </td>
                            <!-- Status -->
                            <td class="list-td">
                                <StatusBadge :value="v.status" />
                            </td>
                            <!-- Joined -->
                            <td class="list-td">
                                <p class="list-name">{{ formatDate(v.created_at) }}</p>
                                <p class="list-sub">{{ formatRelative(v.created_at) }}</p>
                            </td>
                            <!-- Actions -->
                            <td class="list-td text-right">
                                <div class="flex items-center justify-end gap-1 whitespace-nowrap" @click.stop>
                                    <Tooltip text="View">
                                        <router-link :to="`/vendors/${v.id}`"
                                            class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all inline-flex items-center">
                                            <EyeIcon class="w-4 h-4" />
                                        </router-link>
                                    </Tooltip>
                                    <Tooltip v-if="v.status === 'pending'" text="Approve">
                                        <button @click="approveVendor(v.id)"
                                            class="p-1.5 rounded-lg border border-gray-300 hover:border-green-400 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all inline-flex items-center">
                                            <CheckIcon class="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip text="Delete">
                                        <button @click="confirmDelete(v)"
                                            class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 hover:bg-red-50 transition-all inline-flex items-center">
                                            <TrashIcon class="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="pagination && pagination.last_page > 1"
                class="flex items-center justify-between px-4 py-3 border-t"
                :style="{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--border-light) 50%, transparent)' }">
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                    Showing {{ pagination.from }}–{{ pagination.to }} of {{ pagination.total }}
                </p>
                <div class="flex items-center gap-1">
                    <button @click="load(pagination.current_page - 1)"
                        :disabled="pagination.current_page === 1"
                        class="list-pagination-btn">
                        <ChevronLeftIcon class="w-4 h-4" />
                    </button>
                    <button v-for="page in pagination.last_page" :key="page"
                        @click="load(page)"
                        class="list-pagination-num"
                        :class="page === pagination.current_page ? 'list-pagination-active' : ''"
                        :style="page === pagination.current_page
                            ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' }
                            : { color: 'var(--navbar-text)', borderColor: 'var(--border)' }">
                        {{ page }}
                    </button>
                    <button @click="load(pagination.current_page + 1)"
                        :disabled="pagination.current_page === pagination.last_page"
                        class="list-pagination-btn">
                        <ChevronRightIcon class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
        <AddVendorModal
            :show="showAddModal"
            @close="showAddModal = false"
            @save="handleAddVendor"
        />

        <ConfirmModal
            :show="!!deleteTarget"
            title="Delete Vendor"
            :message="`Delete vendor '${deleteTarget?.shop_name || deleteTarget?.name}'? This will permanently remove the vendor and all associated data.`"
            confirm-text="Delete"
            :loading="deleteLoading"
            @confirm="doDelete"
            @cancel="deleteTarget = null"
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import DatePicker from '@ecom/ui/components/DatePicker.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import AddVendorModal from '@/components/vendors/AddVendorModal.vue'
import { vendorApi } from '@/api/vendor'
import {
    BuildingStorefrontIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckBadgeIcon,
    ClockIcon,
    NoSymbolIcon,
    StarIcon,
    EyeIcon,
    CheckIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()

const vendors = ref([])
const pagination = ref(null)
const loading = ref(true)
const showAddModal = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Vendors', icon: BuildingStorefrontIcon }
])

const filters = reactive({
    status: '',
    verified: '',
    products: '',
    rating: '',
    joinFrom: '',
    joinTo: '',
    sort: 'latest',
})

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'banned', label: 'Banned' },
]

const verifiedOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'Verified' },
    { value: '0', label: 'Unverified' },
]

const productsOptions = [
    { value: '', label: 'Any' },
    { value: 'low', label: 'Low (< 10)' },
    { value: 'medium', label: 'Medium (10-50)' },
    { value: 'high', label: 'High (> 50)' },
]

const ratingOptions = [
    { value: '', label: 'Any' },
    { value: '5', label: '★★★★★ (5)' },
    { value: '4', label: '★★★★☆ (4+)' },
    { value: '3', label: '★★★☆☆ (3+)' },
]

const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'products', label: 'Most Products' },
    { value: 'sales', label: 'Most Sales' },
]

const joinPresets = [
    { label: 'Today', getRange: () => {
        const today = new Date()
        return { from: today, to: today }
    }},
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: 'This Year', getRange: () => {
        const now = new Date()
        return { from: new Date(now.getFullYear(), 0, 1), to: now }
    }},
]

const stats = reactive({ total: 0, active: 0, pending: 0, suspended: 0 })

function resetFilters() {
    filters.status = ''
    filters.verified = ''
    filters.products = ''
    filters.rating = ''
    filters.joinFrom = ''
    filters.joinTo = ''
    filters.sort = 'latest'
    load(1)
}

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRelative(d) {
    if (!d) return ''
    const now = new Date()
    const date = new Date(d)
    const diff = now - date
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
}

async function load(page = 1) {
    loading.value = true
    try {
        const params = {
            page,

            status: filters.status || undefined,
            verified: filters.verified || undefined,
            products: filters.products || undefined,
            rating: filters.rating || undefined,
            date_from: filters.joinFrom || undefined,
            date_to: filters.joinTo || undefined,
            sort: filters.sort,
        }
        // Clean undefined params
        Object.keys(params).forEach(k => { if (params[k] === undefined) delete params[k] })

        // Determine which endpoint based on route
        let res
        if (route.path.includes('/pending')) {
            res = await vendorApi.pending(params)
        } else {
            res = await vendorApi.list(params)
        }

        vendors.value = res.data.data || []
        pagination.value = res.data.pagination || null
        stats.total = pagination.value?.total || 0
        // Extract stats from response if available
        if (res.data.stats) {
            Object.assign(stats, res.data.stats)
        }
    } catch (e) {
        toast.error('Failed to load vendors')
    } finally {
        loading.value = false
    }
}

async function approveVendor(id) {
    try {
        await vendorApi.approve(id)
        toast.success('Vendor approved successfully')
        load(pagination.value?.current_page || 1)
    } catch { toast.error('Failed to approve vendor') }
}

const deleteTarget = ref(null)
const deleteLoading = ref(false)

function confirmDelete(vendor) {
    deleteTarget.value = vendor
}

async function doDelete() {
    if (!deleteTarget.value) return
    deleteLoading.value = true
    try {
        await vendorApi.delete(deleteTarget.value.id)
        toast.success('Vendor deleted successfully')
        deleteTarget.value = null
        load(pagination.value?.current_page || 1)
    } catch {
        toast.error('Failed to delete vendor')
    } finally {
        deleteLoading.value = false
    }
}

async function handleAddVendor(data) {
    try {
        await vendorApi.create(data)
        toast.success('Vendor created successfully')
        showAddModal.value = false
        load(1)
    } catch (e) {
        const msg = e.response?.data?.message || 'Failed to create vendor'
        toast.error(msg)
    }
}

onMounted(() => load())
</script>

<style scoped>
/* Reset Filters Button */
.reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
}
.reset-btn:hover {
    border-color: var(--danger);
    color: var(--danger);
    background-color: color-mix(in srgb, var(--danger) 8%, transparent);
}
.reset-btn:active {
    transform: scale(0.96);
}
</style>
