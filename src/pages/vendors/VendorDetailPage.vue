<template>
    <div>
        <BreadcrumbHeader :items="breadcrumbItems" />

        <!-- Loading -->
        <div v-if="!vendor" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
            <svg class="w-8 h-8 animate-spin mx-auto mb-3"
                :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading vendor details...
        </div>

        <template v-if="vendor">
            <!-- Shop Header / Banner -->
            <div class="card mb-6">
                <div class="h-24 md:h-28 relative overflow-hidden rounded-t-lg"
                    :style="{
                        background: `url(${vendor.cover_image || DEFAULT_COVER_IMAGE}) center/cover`,
                        backgroundColor: 'var(--border-light)'
                    }">
                    <div class="absolute inset-0"
                        :style="{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }"></div>
                </div>
                <div class="px-6 pb-5 relative">
                    <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 relative z-10">
                        <div class="w-20 h-20 rounded-xl overflow-hidden border-4 shrink-0"
                            :style="{ borderColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }">
                            <img v-if="vendor.shop_logo" :src="vendor.shop_logo" :alt="vendor.shop_name"
                                class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                                :style="{ backgroundColor: 'var(--color-primary)' }">
                                {{ (vendor.shop_name || vendor.name)?.charAt(0)?.toUpperCase() || 'V' }}
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 pt-2 sm:pt-0">
                            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <h2 class="text-xl font-black truncate" :style="{ color: 'var(--text-primary)' }">
                                    {{ vendor.shop_name || vendor.name }}
                                </h2>
                                <StatusBadge :value="vendor.status" />
                            </div>
                            <div class="flex items-center gap-3 mt-1 text-sm" :style="{ color: 'var(--text-muted)' }">
                                <span>{{ vendor.name }}</span>
                                <span class="w-1 h-1 rounded-full" :style="{ backgroundColor: 'var(--border)' }"></span>
                                <span>Joined {{ formatDate(vendor.created_at) }}</span>
                            </div>
                        </div>
                        <div class="shrink-0">
                            <SelectBox v-model="newStatus" :options="statusOptions" size="sm"
                                class="w-32" @change="updateStatus" />
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t"
                        :style="{ borderColor: 'var(--border)' }">
                        <div class="text-center">
                            <p class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">
                                {{ vendor.products_count || 0 }}
                            </p>
                            <p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Products</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">
                                {{ vendor.total_orders || 0 }}
                            </p>
                            <p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Orders</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-black" :style="{ color: 'var(--color-primary)' }">
                                ৳{{ (vendor.total_revenue || 0).toLocaleString() }}
                            </p>
                            <p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Revenue</p>
                        </div>
                        <div class="text-center">
                            <div class="flex items-center justify-center gap-1">
                                <StarIcon class="w-4 h-4" :style="{ color: '#F59E0B' }" />
                                <span class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">
                                    {{ (vendor.rating || 0).toFixed(1) }}
                                </span>
                            </div>
                            <p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">
                                Rating ({{ vendor.reviews_count || 0 }} reviews)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left: Contact & Info -->
                <div class="space-y-6">
                    <!-- Contact Info -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">
                            <EnvelopeIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />
                            Contact Information
                        </h3>
                        <div class="space-y-3 text-sm">
                            <div class="flex items-start gap-3">
                                <EnvelopeIcon class="w-4 h-4 mt-0.5 shrink-0" :style="{ color: 'var(--text-muted)' }" />
                                <div>
                                    <p class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ vendor.email }}</p>
                                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Email</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3">
                                <PhoneIcon class="w-4 h-4 mt-0.5 shrink-0" :style="{ color: 'var(--text-muted)' }" />
                                <div>
                                    <p class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ vendor.phone || '—' }}</p>
                                    <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Phone</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Shop Info -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">
                            <BuildingStorefrontIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />
                            Shop Details
                        </h3>
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between">
                                <span :style="{ color: 'var(--text-muted)' }">Shop Name</span>
                                <span class="font-medium text-right" :style="{ color: 'var(--text-primary)' }">{{ vendor.shop_name || '—' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span :style="{ color: 'var(--text-muted)' }">Owner</span>
                                <span class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ vendor.name || '—' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span :style="{ color: 'var(--text-muted)' }">Verified</span>
                                <span class="font-medium" :style="{ color: vendor.is_verified ? 'var(--success)' : 'var(--text-muted)' }">
                                    {{ vendor.is_verified ? 'Yes ✓' : 'No' }}
                                </span>
                            </div>
                            <div class="pt-3 border-t" :style="{ borderColor: 'var(--border-light)' }">
                                <p class="text-xs font-semibold mb-1.5" :style="{ color: 'var(--text-muted)' }">Address</p>
                                <p class="text-sm" :style="{ color: 'var(--text-primary)' }">
                                    {{ vendor.address || vendor.shop_address || 'No address provided' }}
                                </p>
                            </div>
                            <div v-if="vendor.shop_city || vendor.shop_country" class="flex gap-2 text-xs"
                                :style="{ color: 'var(--text-muted)' }">
                                <span>{{ vendor.shop_city }}</span>
                                <span v-if="vendor.shop_city && vendor.shop_country">•</span>
                                <span>{{ vendor.shop_country }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Performance -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">
                            <ChartBarIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />
                            Performance
                        </h3>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span :style="{ color: 'var(--text-muted)' }">Fulfillment Rate</span>
                                    <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ vendor.fulfillment_rate || 0 }}%</span>
                                </div>
                                <div class="w-full h-1.5 rounded-full" :style="{ backgroundColor: 'var(--border-light)' }">
                                    <div class="h-full rounded-full"
                                        :style="{
                                            width: (vendor.fulfillment_rate || 0) + '%',
                                            backgroundColor: (vendor.fulfillment_rate || 0) >= 80 ? 'var(--success)'
                                                : (vendor.fulfillment_rate || 0) >= 50 ? 'var(--warning)'
                                                : 'var(--danger)'
                                        }"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-xs mb-1">
                                    <span :style="{ color: 'var(--text-muted)' }">Response Rate</span>
                                    <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ vendor.response_rate || 0 }}%</span>
                                </div>
                                <div class="w-full h-1.5 rounded-full" :style="{ backgroundColor: 'var(--border-light)' }">
                                    <div class="h-full rounded-full"
                                        :style="{
                                            width: (vendor.response_rate || 0) + '%',
                                            backgroundColor: (vendor.response_rate || 0) >= 80 ? 'var(--success)'
                                                : (vendor.response_rate || 0) >= 50 ? 'var(--warning)'
                                                : 'var(--danger)'
                                        }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Products & Orders -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Products -->
                    <div class="card overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b"
                            :style="{ borderColor: 'var(--border-light)' }">
                            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
                                <ShoppingBagIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />
                                Products ({{ vendor.products?.length || 0 }})
                            </h3>
                            <span class="text-xs" :style="{ color: 'var(--text-muted)' }">Showing top {{ Math.min(vendor.products?.length || 0, 5) }}</span>
                        </div>
                        <div v-if="vendor.products?.length" class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
                            <div v-for="p in vendor.products.slice(0, 5)" :key="p.id"
                                class="flex items-center gap-3 px-5 py-3 hover:bg-transparent transition cursor-pointer"
                                :style="{ borderBottomColor: 'var(--border-light)' }"
                                @click="$router.push(`/products/${p.id}`)">
                                <div class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border"
                                    :style="{ borderColor: 'var(--border)' }">
                                    <img v-if="p.thumbnail || p.image" :src="p.thumbnail || p.image" :alt="p.name"
                                        class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full flex items-center justify-center text-xs"
                                        :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-muted)' }">
                                        No img
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold truncate" :style="{ color: 'var(--text-primary)' }">{{ p.name }}</p>
                                    <div class="flex items-center gap-2 text-xs" :style="{ color: 'var(--text-muted)' }">
                                        <span>৳{{ Number(p.price || 0).toLocaleString() }}</span>
                                        <span class="w-1 h-1 rounded-full" :style="{ backgroundColor: 'var(--border)' }"></span>
                                        <span>{{ p.total_sold || 0 }} sold</span>
                                    </div>
                                </div>
                                <span class="text-xs font-semibold" :style="{ color: p.stock > 0 ? 'var(--success)' : 'var(--danger)' }">
                                    {{ p.stock > 0 ? `${p.stock} in stock` : 'Out of stock' }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
                            <ShoppingBagIcon class="w-8 h-8 mx-auto mb-2" />
                            No products listed yet
                        </div>
                    </div>

                    <!-- Recent Orders -->
                    <div class="card overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b"
                            :style="{ borderColor: 'var(--border-light)' }">
                            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
                                <ClipboardDocumentListIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />
                                Recent Orders ({{ vendor.orders?.length || 0 }})
                            </h3>
                            <span class="text-xs" :style="{ color: 'var(--text-muted)' }">Latest 5 orders</span>
                        </div>
                        <table v-if="vendor.orders?.length" class="w-full">
                            <thead>
                                <tr>
                                    <th class="table-header">Order</th>
                                    <th class="table-header">Status</th>
                                    <th class="table-header">Items</th>
                                    <th class="table-header text-right">Total</th>
                                    <th class="table-header text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in vendor.orders.slice(0, 5)" :key="order.id"
                                    class="table-row cursor-pointer"
                                    @click="$router.push(`/orders/${order.id}`)">
                                    <td class="table-cell">
                                        <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">#{{ order.order_number }}</p>
                                    </td>
                                    <td class="table-cell">
                                        <StatusBadge :value="order.status" />
                                    </td>
                                    <td class="table-cell text-sm" :style="{ color: 'var(--text-secondary)' }">
                                        {{ order.items_count || order.total_items || '-' }}
                                    </td>
                                    <td class="table-cell text-right font-bold text-sm" :style="{ color: 'var(--color-primary)' }">
                                        ৳{{ Number(order.total_amount || 0).toLocaleString() }}
                                    </td>
                                    <td class="table-cell text-right text-xs" :style="{ color: 'var(--text-muted)' }">
                                        {{ formatDate(order.created_at) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-else class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
                            <ClipboardDocumentListIcon class="w-8 h-8 mx-auto mb-2" />
                            No orders yet
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { vendorApi } from '@/api/vendor'
import {
    BuildingStorefrontIcon,
    EnvelopeIcon,
    PhoneIcon,
    ChartBarIcon,
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    StarIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()
const vendor = ref(null)
const newStatus = ref('')

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'banned', label: 'Banned' },
]

// Default shop cover banner (Unsplash)
const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80'

const breadcrumbItems = computed(() => [
  { label: 'Vendors', to: '/vendors', icon: BuildingStorefrontIcon },
  { label: vendor.value?.shop_name || vendor.value?.name || 'Loading...' }
])



function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function updateStatus() {
    try {
        await vendorApi.updateStatus(route.params.id, newStatus.value)
        toast.success('Status updated')
        vendor.value.status = newStatus.value
    } catch {
        toast.error('Failed to update status')
    }
}

onMounted(async () => {
    try {
        const res = await vendorApi.show(route.params.id)
        vendor.value = res.data.data
        newStatus.value = vendor.value.status
    } catch {
        toast.error('Failed to load vendor details')
    }
})
</script>
