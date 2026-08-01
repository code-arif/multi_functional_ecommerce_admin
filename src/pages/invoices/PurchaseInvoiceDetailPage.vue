<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <div v-if="!invoice" class="card p-12 text-center" style="color:var(--text-muted)"><svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{color:'var(--color-primary)'}" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading purchase...</div>
    <template v-if="invoice">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><BuildingStorefrontIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Vendor</h3>
            <div class="space-y-2 text-sm">
              <p class="font-semibold text-base" style="color:var(--text-primary)">{{ invoice.vendor_name }}</p>
              <p style="color:var(--text-secondary)">{{ invoice.contact_person }}</p>
              <p style="color:var(--text-muted)">{{ invoice.vendor_email }}</p>
              <p style="color:var(--text-muted)">{{ invoice.vendor_phone }}</p>
              <p class="text-xs" style="color:var(--text-muted)">{{ invoice.vendor_address }}</p>
            </div>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-sm" style="color:var(--text-primary)">Status</h3>
              <StatusBadge :value="invoice.status" />
              <router-link :to="'/invoices/purchases/' + invoice.id + '/edit'" class="p-1.5 rounded-lg border border-gray-200 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all" title="Edit purchase"><Pencil class="w-3.5 h-3.5" /></router-link>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span style="color:var(--text-muted)">Date</span><span style="color:var(--text-primary)">{{ formatDate(invoice.purchase_date) }}</span></div>
              <div class="flex justify-between"><span style="color:var(--text-muted)">Payment</span><span style="color:var(--text-primary)">{{ invoice.payment_method || '—' }}</span></div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2 space-y-6">
          <div class="card overflow-hidden">
            <div class="p-4 border-b" style="border-color:var(--border)"><h3 class="font-bold text-sm" style="color:var(--text-primary)"><ShoppingBagIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Items Purchased</h3></div>
            <table class="w-full">
              <thead><tr style="color:var(--text-muted);background-color:color-mix(in srgb,var(--border-light) 80%,transparent)">
                <th class="table-header">#</th><th class="table-header">Product</th><th class="table-header text-right">Qty</th>
                <th class="table-header text-right">Unit Cost</th><th class="table-header text-right">Total</th>
              </tr></thead>
              <tbody>
                <tr v-for="(item, i) in invoice.items" :key="i" class="table-row">
                  <td class="table-cell text-xs font-bold" style="color:var(--text-muted)">{{ i+1 }}</td>
                  <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ item.name }}</td>
                  <td class="table-cell text-right" style="color:var(--text-secondary)">{{ item.qty }}</td>
                  <td class="table-cell text-right" style="color:var(--text-secondary)">৳{{ Number(item.cost).toLocaleString() }}</td>
                  <td class="table-cell text-right font-semibold" style="color:var(--text-primary)">৳{{ (item.qty * item.cost).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
            <div class="p-4 border-t" style="border-color:var(--border)">
              <div class="ml-auto w-64 space-y-1.5 text-sm">
                <div class="flex justify-between"><span style="color:var(--text-muted)">Subtotal</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ invoice.subtotal.toLocaleString() }}</span></div>
                <div class="flex justify-between"><span style="color:var(--text-muted)">Shipping</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ Number(invoice.shipping||0).toLocaleString() }}</span></div>
                <div v-if="invoice.tax_rate" class="flex justify-between"><span style="color:var(--text-muted)">Tax ({{ invoice.tax_rate }}%)</span><span class="font-semibold" style="color:var(--text-primary)">+৳{{ taxAmount.toLocaleString() }}</span></div>
                <div class="pt-2 mt-2 border-t flex justify-between font-bold text-lg" style="border-color:var(--border);color:var(--color-primary)">
                  <span>Total</span><span>৳{{ Number(invoice.total).toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="invoice.notes" class="card p-5">
            <h3 class="font-bold text-sm mb-2" style="color:var(--text-primary)">Notes</h3>
            <p class="text-sm" style="color:var(--text-secondary)">{{ invoice.notes }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { BuildingStorefrontIcon, ShoppingBagIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import { Pencil } from 'lucide-vue-next'
const route = useRoute()
const invoice = ref(null)

const breadcrumbItems = computed(() => [
  { label: 'Purchase Invoices', to: '/invoices/purchases', icon: DocumentTextIcon },
  { label: invoice.value ? '#PUR-' + String(invoice.value.id).padStart(5, '0') : 'Loading...' }
])

const taxAmount = computed(() => ((invoice.value?.subtotal || 0) * ((invoice.value?.tax_rate || 0) / 100)))
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '—' }
onMounted(() => {
  setTimeout(() => {
    invoice.value = {
      id: route.params.id, vendor_name: 'TechMart Supplies', contact_person: 'Mr. Rahman', vendor_email: 'info@techmart.com',
      vendor_phone: '+8801712345678', vendor_address: '56 Kawran Bazar, Dhaka 1215',
      purchase_date: new Date(Date.now()-10*86400000).toISOString(), status: 'paid',
      payment_method: 'Bank Transfer', shipping: 1200, tax_rate: 5, notes: 'Payment via bank transfer completed.',
      subtotal: 85000, total: 90450,
      items: [
        {name: 'Wireless Headphones (Wholesale)', qty: 50, cost: 850},
        {name: 'USB-C Cables (Box of 100)', qty: 3, cost: 4500},
        {name: 'Phone Cases (Assorted)', qty: 200, cost: 120},
        {name: 'Screen Protectors (Bulk)', qty: 500, cost: 45},
      ]
    }
  }, 300)
})
</script>
