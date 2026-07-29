<template>
    <div>
        <Breadcrumb :items="breadcrumbItems" />

        <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div v-for="i in 4" :key="i" class="skeleton h-40 rounded-xl" />
        </div>

        <div v-else-if="order" class="space-y-6">
            <!-- Status Bar -->
            <div class="card p-5 flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-3 flex-1">
                    <StatusBadge :value="order.status" class="text-sm px-3 py-1.5" />
                    <span style="color:var(--text-muted)">→</span>
                    <div class="flex items-center gap-2">
                        <SelectBox v-model="newStatus" :options="statusSelectOptions" size="sm" class="w-36" />
                        <input v-model="statusComment" class="input-sm w-48" placeholder="Optional note..." />
                        <button @click="updateStatus" :disabled="updatingStatus || newStatus === order.status"
                            class="btn-primary text-xs py-1.5 px-3">
                            {{ updatingStatus ? 'Updating...' : 'Update' }}
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-3 ml-auto">
                    <div class="text-right">
                        <p class="text-xs" style="color:var(--text-muted)">Payment</p>
                        <StatusBadge :value="order.payment_status" />
                    </div>
                    <div class="text-right">
                        <p class="text-xs" style="color:var(--text-muted)">Total</p>
                        <p class="font-black text-lg" style="color:var(--color-primary)">৳{{ Number(order.total_amount).toLocaleString() }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Order Items (left 2/3) -->
                <div class="lg:col-span-2 space-y-5">
                    <div class="card overflow-hidden">
                        <div class="p-4 border-b" style="border-color:var(--border)">
                            <h3 class="font-bold text-sm" style="color:var(--text-primary)">Items Ordered</h3>
                        </div>
                        <table class="w-full">
                            <tbody>
                                <tr v-for="item in order.items" :key="item.id" class="table-row">
                                    <td class="table-cell">
                                        <div class="flex items-center gap-3">
                                            <img v-if="item.product_image" :src="`/storage/${item.product_image}`"
                                                class="w-12 h-12 rounded-lg object-cover shrink-0" style="background-color:var(--border-light)" />
                                            <div v-else
                                                class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style="background-color:var(--border-light)">
                                                <Package class="w-5 h-5" style="color:var(--text-muted)" />
                                            </div>
                                            <div>
                                                <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.product_name }}
                                                </p>
                                                <p v-if="item.product_sku" class="text-xs" style="color:var(--text-muted)">SKU: {{
                                                    item.product_sku }}</p>
                                                <p v-if="item.variant_attributes" class="text-xs" style="color:var(--text-secondary)">
                                                    {{Object.entries(item.variant_attributes || {}).map(([k, v]) =>
                                                        `${k}:
                                                    ${v}`).join(', ')}}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="table-cell text-center text-sm" style="color:var(--text-secondary)">× {{ item.quantity }}</td>
                                    <td class="table-cell text-right font-semibold" style="color:var(--text-primary)">৳{{
                                        Number(item.subtotal).toLocaleString() }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- Totals -->
                        <div class="p-4 border-t space-y-2" style="border-color:var(--border);color:var(--text-secondary)">
                            <div class="flex justify-between text-sm"><span>Subtotal</span><span style="color:var(--text-primary)">৳{{
                                Number(order.subtotal).toLocaleString() }}</span></div>
                            <div v-if="order.discount_amount > 0" class="flex justify-between text-sm" style="color:var(--success)">
                                <span>Discount{{ order.coupon_code ? ` (${order.coupon_code})` : '' }}</span><span>−৳{{
                                    Number(order.discount_amount).toLocaleString() }}</span>
                            </div>
                            <div class="flex justify-between text-sm"><span>Shipping</span><span>{{
                                order.shipping_charge > 0 ? `৳${Number(order.shipping_charge).toLocaleString()}` :
                                    'FREE' }}</span></div>
                            <div class="flex justify-between font-black pt-2 border-t" style="border-color:var(--border);color:var(--text-primary)">
                                <span>Total</span><span style="color:var(--color-primary)">৳{{
                                    Number(order.total_amount).toLocaleString() }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tracking -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)">Shipping & Tracking</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="label">Tracking Number</label>
                                <input v-model="trackingNumber" class="input" placeholder="e.g. BD123456789" />
                            </div>
                            <div>
                                <label class="label">Shipping Carrier</label>
                                <input v-model="shippingCarrier" class="input" placeholder="e.g. Sundarban Courier" />
                            </div>
                        </div>
                        <div class="mt-3"><label class="label">Admin Note</label>
                            <textarea v-model="adminNote" rows="2" class="input" placeholder="Internal note..." />
                        </div>
                        <button @click="saveTracking" :disabled="savingTracking" class="btn-primary mt-3 text-sm">
                            {{ savingTracking ? 'Saving...' : 'Save Tracking Info' }}
                        </button>
                    </div>

                    <!-- Status History -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)">Status History</h3>
                        <div class="space-y-3">
                            <div v-for="h in order.status_history || []" :key="h.created_at"
                                class="flex items-start gap-3">
                                <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" style="background-color:var(--color-primary)" />
                                <div>
                                    <p class="text-sm font-semibold" style="color:var(--text-primary)">
                                        <span v-if="h.old_status">{{ h.old_status }} → </span>{{ h.new_status }}
                                    </p>
                                    <p v-if="h.comment" class="text-xs" style="color:var(--text-secondary)">{{ h.comment }}</p>
                                    <p class="text-[11px]" style="color:var(--text-muted)">{{ formatDate(h.created_at) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right sidebar: customer + shipping -->
                <div class="space-y-5">
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)">Customer</h3>

                        <div class="text-sm space-y-2" style="color:var(--text-secondary)">
                            <p class="font-semibold" style="color:var(--text-primary)">{{ order.shipping_name }}</p>

                            <p v-if="order.shipping_email" class="flex items-center gap-2">
                                <Mail class="w-4 h-4" style="color:var(--text-muted)" />
                                {{ order.shipping_email }}
                            </p>

                            <p class="flex items-center gap-2">
                                <Phone class="w-4 h-4" style="color:var(--text-muted)" />
                                {{ order.shipping_phone }}
                            </p>

                            <div v-if="order.user" class="pt-2 border-t mt-2" style="border-color:var(--border)">
                                <p class="text-xs mb-2" style="color:var(--text-muted)">Account</p>

                                <router-link :to="`/users/${order.user.id}`"
                                    class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all duration-200">
                                    View Customer
                                    <ArrowRight class="w-4 h-4" />
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)">Shipping Address</h3>
                        <address class="not-italic text-sm space-y-1" style="color:var(--text-secondary)">
                            <p>{{ order.shipping_address?.address_line1 }}</p>
                            <p v-if="order.shipping_address?.address_line2">{{ order.shipping_address.address_line2 }}
                            </p>
                            <p>{{ order.shipping_address?.city }}<span v-if="order.shipping_address?.state">, {{
                                order.shipping_address.state }}</span></p>
                            <p>{{ order.shipping_address?.country }}</p>
                        </address>
                    </div>
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)">Payment</h3>
                        <div class="text-sm space-y-1.5">
                            <div class="flex justify-between"><span style="color:var(--text-muted)">Method</span><span
                                    class="font-semibold uppercase" style="color:var(--text-primary)">{{ order.payment_method }}</span></div>
                            <div class="flex justify-between"><span style="color:var(--text-muted)">Status</span>
                                <StatusBadge :value="order.payment_status" />
                            </div>
                            <div v-if="order.payment?.transaction_id" class="flex justify-between"><span
                                    style="color:var(--text-muted)">TXN ID</span><span class="text-xs font-mono" style="color:var(--text-primary)">{{
                                        order.payment.transaction_id }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { orderApi } from '@/api'

import {
    ArrowRight,
    Mail,
    Phone,
    Package
} from 'lucide-vue-next'
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'

const route = useRoute(), toast = useToast()
const order = ref(null), loading = ref(true)

const breadcrumbItems = computed(() => [
  { label: 'Orders', to: '/orders', icon: ClipboardDocumentListIcon },
  { label: order.value ? '#ORD-' + String(order.value.order_number) : 'Loading...' }
])

const statusSelectOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]


const newStatus = ref(''), statusComment = ref(''), updatingStatus = ref(false)
const trackingNumber = ref(''), shippingCarrier = ref(''), adminNote = ref(''), savingTracking = ref(false)
const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

function formatDate(d) { return d ? new Date(d).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '' }

async function loadOrder() {
    loading.value = true
    try {
        const res = await orderApi.show(route.params.id)
        order.value = res.data.data
        newStatus.value = order.value.status
        trackingNumber.value = order.value.tracking_number || ''
        shippingCarrier.value = order.value.shipping_carrier || ''
        adminNote.value = order.value.admin_note || ''
    } finally { loading.value = false }
}

async function updateStatus() {
    updatingStatus.value = true
    try {
        await orderApi.updateStatus(route.params.id, { status: newStatus.value, comment: statusComment.value, notify_customer: true })
        toast.success('Order status updated.')
        statusComment.value = ''
        loadOrder()
    } finally { updatingStatus.value = false }
}

async function saveTracking() {
    savingTracking.value = true
    try {
        await orderApi.updateStatus(route.params.id, { status: order.value.status, tracking_number: trackingNumber.value, shipping_carrier: shippingCarrier.value, notify_customer: false })
        await orderApi.updateNote(route.params.id, { admin_note: adminNote.value })
        toast.success('Tracking info saved.')
    } finally { savingTracking.value = false }
}

onMounted(loadOrder)
</script>