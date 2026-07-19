<template>
    <div>
        <PageHeader title="Vendors" :subtitle="`${pagination?.total || 0} vendors on the marketplace`">
            <button @click="showFilters = !showFilters"
                class="btn-ghost text-sm gap-1.5"
                :style="{ color: showFilters ? 'var(--color-primary)' : '' }">
                <FunnelIcon class="w-4 h-4" />
                Filters
            </button>
        </PageHeader>

        <!-- Filter Panel -->
        <transition name="panel-slide">
            <div v-if="showFilters" class="card p-4 mb-4">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div>
                        <label class="label">Status</label>
                        <select v-model="filters.status" @change="load(1)" class="input-sm">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>
                    <div>
                        <label class="label">Verified</label>
                        <select v-model="filters.verified" @change="load(1)" class="input-sm">
                            <option value="">All</option>
                            <option value="1">Verified</option>
                            <option value="0">Unverified</option>
                        </select>
                    </div>
                    <div>
                        <label class="label">Products</label>
                        <select v-model="filters.products" @change="load(1)" class="input-sm">
                            <option value="">Any</option>
                            <option value="low">Low (&lt; 10)</option>
                            <option value="medium">Medium (10-50)</option>
                            <option value="high">High (&gt; 50)</option>
                        </select>
                    </div>
                    <div>
                        <label class="label">Rating</label>
                        <select v-model="filters.rating" @change="load(1)" class="input-sm">
                            <option value="">Any</option>
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★☆ (4+)</option>
                            <option value="3">★★★☆☆ (3+)</option>
                        </select>
                    </div>
                    <div>
                        <label class="label">Join Date</label>
                        <DatePicker
                            v-model:from="filters.joinFrom"
                            v-model:to="filters.joinTo"
                            :presets="joinPresets"
                            range
                            placeholder="Join date"
                            display-format="MMM dd, yyyy"
                        />
                    </div>
                    <div>
                        <label class="label">Sort By</label>
                        <select v-model="filters.sort" @change="load(1)" class="input-sm">
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name">Name A-Z</option>
                            <option value="rating">Highest Rated</option>
                            <option value="products">Most Products</option>
                            <option value="sales">Most Sales</option>
                        </select>
                    </div>
                </div>
                <div class="flex items-center gap-2 mt-3 pt-3 border-t"
                    :style="{ borderColor: 'var(--border)' }">
                    <button @click="resetFilters" class="btn-ghost text-xs">Reset Filters</button>
                    <span class="text-xs" :style="{ color: 'var(--text-muted)' }">
                        {{ pagination?.from || 0 }}–{{ pagination?.to || 0 }} of {{ pagination?.total || 0 }}
                    </span>
                </div>
            </div>
        </transition>

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

        <!-- Main Table -->
        <div class="card overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[1000px]">
                    <thead>
                        <tr>
                            <th class="vendor-th">Shop &amp; Vendor</th>
                            <th class="vendor-th">Contact</th>
                            <th class="vendor-th">Products</th>
                            <th class="vendor-th">Sales</th>
                            <th class="vendor-th">Rating</th>
                            <th class="vendor-th">Status</th>
                            <th class="vendor-th">Joined</th>
                            <th class="vendor-th text-right">Actions</th>
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
                            class="vendor-row cursor-pointer"
                            @click="$router.push(`/vendors/${v.id}`)">
                            <!-- Shop & Vendor -->
                            <td class="vendor-td">
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
                                        <p class="vendor-name">{{ v.shop_name || v.name }}</p>
                                        <p class="vendor-sub">{{ v.name || v.shop_name }}</p>
                                    </div>
                                </div>
                            </td>
                            <!-- Contact -->
                            <td class="vendor-td">
                                <p class="vendor-name">{{ v.email }}</p>
                                <p class="vendor-sub">{{ v.phone || '—' }}</p>
                            </td>
                            <!-- Products -->
                            <td class="vendor-td">
                                <div class="flex items-center gap-2">
                                    <span class="vendor-count">{{ v.products_count || 0 }}</span>
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
                            <td class="vendor-td">
                                <p class="vendor-count">৳{{ (v.total_sales || 0).toLocaleString() }}</p>
                                <p class="vendor-sub">{{ v.total_orders || 0 }} orders</p>
                            </td>
                            <!-- Rating -->
                            <td class="vendor-td">
                                <div class="flex items-center gap-1.5">
                                    <StarIcon class="w-3.5 h-3.5" :style="{ color: '#F59E0B' }" />
                                    <span class="vendor-count">{{ (v.rating || 0).toFixed(1) }}</span>
                                    <span class="vendor-sub">({{ v.reviews_count || 0 }})</span>
                                </div>
                            </td>
                            <!-- Status -->
                            <td class="vendor-td">
                                <StatusBadge :value="v.status" />
                            </td>
                            <!-- Joined -->
                            <td class="vendor-td">
                                <p class="vendor-name">{{ formatDate(v.created_at) }}</p>
                                <p class="vendor-sub">{{ formatRelative(v.created_at) }}</p>
                            </td>
                            <!-- Actions -->
                            <td class="vendor-td text-right">
                                <div class="flex items-center justify-end gap-1" @click.stop>
                                    <router-link :to="`/vendors/${v.id}`"
                                        class="vendor-action-btn"
                                        title="View details">
                                        <EyeIcon class="w-3.5 h-3.5" />
                                    </router-link>
                                    <button v-if="v.status === 'pending'" @click="approveVendor(v.id)"
                                        class="vendor-action-btn" :style="{ color: 'var(--success)' }"
                                        title="Approve">
                                        <CheckIcon class="w-3.5 h-3.5" />
                                    </button>
                                    <button v-if="v.status === 'pending' || v.status === 'active'"
                                        @click="rejectVendor(v.id)"
                                        class="vendor-action-btn" :style="{ color: 'var(--danger)' }"
                                        title="Reject / Suspend">
                                        <XMarkIcon class="w-3.5 h-3.5" />
                                    </button>
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
                        class="vendor-pagination-btn" :style="{ color: 'var(--navbar-text)' }">
                        <ChevronLeftIcon class="w-4 h-4" />
                    </button>
                    <button v-for="page in pagination.last_page" :key="page"
                        @click="load(page)"
                        class="vendor-pagination-num"
                        :class="page === pagination.current_page ? 'vendor-pagination-active' : ''"
                        :style="page === pagination.current_page
                            ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' }
                            : { color: 'var(--navbar-text)', borderColor: 'var(--border)' }">
                        {{ page }}
                    </button>
                    <button @click="load(pagination.current_page + 1)"
                        :disabled="pagination.current_page === pagination.last_page"
                        class="vendor-pagination-btn" :style="{ color: 'var(--navbar-text)' }">
                        <ChevronRightIcon class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import { vendorApi } from '@/api/vendor'
import {
    BuildingStorefrontIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckBadgeIcon,
    ClockIcon,
    NoSymbolIcon,
    StarIcon,
    EyeIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()

const vendors = ref([])
const pagination = ref(null)
const loading = ref(true)
const showFilters = ref(false)


const filters = reactive({
    status: '',
    verified: '',
    products: '',
    rating: '',
    joinFrom: '',
    joinTo: '',
    sort: 'latest',
})

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

async function rejectVendor(id) {
    try {
        await vendorApi.reject(id)
        toast.success('Vendor rejected')
        load(pagination.value?.current_page || 1)
    } catch { toast.error('Failed to reject vendor') }
}

onMounted(() => load())
</script>

<style scoped>
.vendor-th {
    padding: 10px 12px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    text-align: left;
    white-space: nowrap;
    color: var(--text-muted);
    background-color: color-mix(in srgb, var(--border-light) 80%, transparent);
    border-bottom: 1px solid var(--border);
}

.vendor-td {
    padding: 12px;
    font-size: 0.8125rem;
    vertical-align: middle;
    border-bottom: 1px solid var(--border-light);
}

.vendor-row {
    transition: background-color 0.12s ease;
}
.vendor-row:hover {
    background-color: color-mix(in srgb, var(--border-light) 60%, transparent);
}
.vendor-row:last-child .vendor-td {
    border-bottom: none;
}

.vendor-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.8125rem;
    margin: 0;
    line-height: 1.3;
}

.vendor-sub {
    color: var(--text-muted);
    font-size: 0.6875rem;
    margin: 0;
    line-height: 1.3;
}

.vendor-count {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 0.8125rem;
}

.vendor-action-btn {
    padding: 6px;
    border-radius: 8px;
    color: var(--navbar-text);
    transition: all 0.12s ease;
    background: transparent;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.vendor-action-btn:hover {
    background-color: var(--border-light);
}

.vendor-pagination-btn {
    padding: 6px 10px;
    border-radius: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.12s ease;
    display: inline-flex;
    align-items: center;
}
.vendor-pagination-btn:hover:not(:disabled) {
    background-color: var(--border-light);
}
.vendor-pagination-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.vendor-pagination-num {
    padding: 5px 11px;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 8px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.12s ease;
    background: transparent;
}
.vendor-pagination-num:hover:not(.vendor-pagination-active) {
    background-color: var(--border-light);
}
.vendor-pagination-active {
    cursor: default;
}

/* Filter panel transition */
.panel-slide-enter-active {
    transition: all 0.18s ease-out;
}
.panel-slide-leave-active {
    transition: all 0.12s ease-in;
}
.panel-slide-enter-from {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
    max-height: 0;
}
.panel-slide-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
    max-height: 300px;
}
.panel-slide-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
    max-height: 0;
}
</style>
