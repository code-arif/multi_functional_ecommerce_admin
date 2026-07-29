<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div v-if="!invoice" class="card p-12 text-center" style="color:var(--text-muted)"><svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{color:'var(--color-primary)'}" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading invoice...</div>
    <template v-if="invoice">
      <div class="card overflow-hidden mb-6" id="invoice-print">
        <div class="p-6 sm:p-8">
          <!-- Header -->
          <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <h1 class="text-2xl font-black" style="color:var(--text-primary)">INVOICE</h1>
              <p class="text-sm mt-1" style="color:var(--text-muted)">#INV-{{ String(invoice.id).padStart(5, '0') }}</p>
            </div>
            <div class="text-right">
              <p class="font-black text-lg" style="color:var(--color-primary)">EcoAdmin</p>
              <p class="text-xs" style="color:var(--text-muted)">123 Business Avenue, Dhaka</p>
              <p class="text-xs" style="color:var(--text-muted)">admin@ecoadmin.com</p>
            </div>
          </div>
          <!-- Status & Actions -->
          <div class="flex items-center justify-between mb-6 pb-6 border-b" style="border-color:var(--border)">
            <div class="flex items-center gap-3">
              <StatusBadge :value="invoice.status" />
              <span class="text-xs" style="color:var(--text-muted)">Issued: {{ formatDate(invoice.invoice_date) }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="printInvoice" class="btn-secondary text-xs py-1.5 px-3"><Printer class="w-3.5 h-3.5" />Print</button>
              <router-link :to="'/invoices/sales/' + invoice.id + '/edit'" class="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"><Pencil class="w-3.5 h-3.5" />Edit</router-link>
              <button @click="markPaid" v-if="invoice.status !== 'paid'" class="btn-primary text-xs py-1.5 px-3"><Check class="w-3.5 h-3.5" />Mark Paid</button>
            </div>
          </div>
          <!-- Bill To -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Bill To</p>
              <p class="font-semibold" style="color:var(--text-primary)">{{ invoice.customer_name }}</p>
              <p class="text-sm" style="color:var(--text-secondary)">{{ invoice.customer_email }}</p>
              <p class="text-sm" style="color:var(--text-secondary)">{{ invoice.customer_phone }}</p>
              <p class="text-sm" style="color:var(--text-secondary)">{{ invoice.customer_address }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold uppercase tracking-wide mb-2" style="color:var(--text-muted)">Payment Details</p>
              <p class="text-sm" style="color:var(--text-secondary)">Due Date: <span class="font-semibold" style="color:var(--text-primary)">{{ formatDate(invoice.due_date) }}</span></p>
              <p class="text-sm" style="color:var(--text-secondary)">Order Ref: <span class="font-semibold" style="color:var(--text-primary)">{{ invoice.order_ref || '—' }}</span></p>
            </div>
          </div>
          <!-- Items Table -->
          <table class="w-full mb-6">
            <thead><tr class="text-xs font-semibold uppercase tracking-wide" style="color:var(--text-muted);background-color:color-mix(in srgb,var(--border-light) 80%,transparent)">
              <th class="text-left py-3 px-3">#</th>
              <th class="text-left py-3 px-3">Description</th>
              <th class="text-right py-3 px-3">Qty</th>
              <th class="text-right py-3 px-3">Unit Price</th>
              <th class="text-right py-3 px-3">Total</th>
            </tr></thead>
            <tbody>
              <tr v-for="(item, i) in invoice.items" :key="i" class="border-b" style="border-color:var(--border-light)">
                <td class="py-3 px-3 text-xs font-bold" style="color:var(--text-muted)">{{ i+1 }}</td>
                <td class="py-3 px-3 font-semibold text-sm" style="color:var(--text-primary)">{{ item.description }}</td>
                <td class="py-3 px-3 text-right text-sm" style="color:var(--text-secondary)">{{ item.qty }}</td>
                <td class="py-3 px-3 text-right text-sm" style="color:var(--text-secondary)">৳{{ Number(item.price).toLocaleString() }}</td>
                <td class="py-3 px-3 text-right font-semibold text-sm" style="color:var(--text-primary)">৳{{ (item.qty * item.price).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Totals -->
          <div class="flex justify-end">
            <div class="w-64 space-y-2 text-sm">
              <div class="flex justify-between"><span style="color:var(--text-muted)">Subtotal</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ invoice.subtotal.toLocaleString() }}</span></div>
              <div v-if="invoice.discount" class="flex justify-between"><span style="color:var(--text-muted)">Discount</span><span class="font-semibold" style="color:var(--success)">−৳{{ Number(invoice.discount).toLocaleString() }}</span></div>
              <div v-if="invoice.tax_rate" class="flex justify-between"><span style="color:var(--text-muted)">Tax ({{ invoice.tax_rate }}%)</span><span class="font-semibold" style="color:var(--text-primary)">+৳{{ taxAmount.toLocaleString() }}</span></div>
              <div class="pt-2 mt-2 border-t flex justify-between font-bold text-lg" style="border-color:var(--border);color:var(--color-primary)">
                <span>Total</span><span>৳{{ Number(invoice.total).toLocaleString() }}</span>
              </div>
            </div>
          </div>
          <!-- Notes -->
          <div v-if="invoice.notes" class="mt-6 pt-6 border-t" style="border-color:var(--border)">
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color:var(--text-muted)">Notes</p>
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
import { useToast } from 'vue-toastification'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { Printer, Check, Pencil } from 'lucide-vue-next'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const toast = useToast()
const invoice = ref(null)

const breadcrumbItems = computed(() => [
  { label: 'Sale Invoices', to: '/invoices/sales', icon: DocumentTextIcon },
  { label: invoice.value ? '#INV-' + String(invoice.value.id).padStart(5, '0') : 'Loading...' }
])
const taxAmount = computed(() => ((invoice.value?.subtotal || 0) - (invoice.value?.discount || 0)) * ((invoice.value?.tax_rate || 0) / 100))
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '—' }
function printInvoice() { window.print() }
function markPaid() { invoice.value.status = 'paid'; toast.success('Invoice marked as paid') }
onMounted(() => {
  setTimeout(() => {
    invoice.value = {
      id: route.params.id, customer_name: 'Sarah Johnson', customer_email: 'sarah@example.com', customer_phone: '+8801712345678',
      customer_address: '42 Gulshan Avenue, Dhaka 1212', status: 'unpaid',
      invoice_date: new Date(Date.now()-5*86400000).toISOString(), due_date: new Date(Date.now()+25*86400000).toISOString(),
      order_ref: '#ORD-1024', discount: 500, tax_rate: 5, notes: 'Thank you for your business!',
      subtotal: 24500, total: 25200,
      items: [
        {description: 'Wireless Bluetooth Headphones', qty: 2, price: 4500},
        {description: 'USB-C Charging Cable (2m)', qty: 5, price: 800},
        {description: 'Laptop Stand - Adjustable', qty: 1, price: 3500},
        {description: 'Screen Protector (15.6")', qty: 3, price: 1200},
      ]
    }
  }, 300)
})
</script>
