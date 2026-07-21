<template>
  <div class="max-w-6xl">
    <PageHeader title="New Sale Invoice" subtitle="Create a professional sale invoice">
      <button @click="$router.push('/invoices/sales')" class="btn-ghost text-sm">← Sale Invoices</button>
    </PageHeader>
    <form @submit.prevent="saveInvoice">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Customer Info -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><User class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Customer Details</h3>
          <div class="space-y-3">
            <div><label class="label">Customer *</label><input v-model="form.customer_name" class="input" placeholder="Customer name" /></div>
            <div><label class="label">Email</label><input v-model="form.customer_email" type="email" class="input" placeholder="customer@example.com" /></div>
            <div><label class="label">Phone</label><input v-model="form.customer_phone" class="input" placeholder="Phone number" /></div>
            <div><label class="label">Address</label><textarea v-model="form.customer_address" rows="2" class="input" placeholder="Billing address"></textarea></div>
          </div>
        </div>
        <!-- Invoice Info -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><FileText class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Invoice Details</h3>
          <div class="space-y-3">
            <div><label class="label">Invoice Date *</label><input v-model="form.invoice_date" type="date" class="input" /></div>
            <div><label class="label">Due Date *</label><input v-model="form.due_date" type="date" class="input" /></div>
            <div><label class="label">Order Reference</label><input v-model="form.order_ref" class="input" placeholder="#ORD-001" /></div>
            <div><label class="label">Status</label><SelectBox v-model="form.status" :options="statusOptions" size="sm" full-width /></div>
          </div>
        </div>
        <!-- Summary -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><Calculator class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Summary</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span style="color:var(--text-muted)">Subtotal</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ subtotal.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Discount</span><span class="font-semibold" style="color:var(--success)">−৳{{ discount.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Tax ({{ form.tax_rate }}%)</span><span class="font-semibold" style="color:var(--text-primary)">+৳{{ taxAmount.toLocaleString() }}</span></div>
            <div class="pt-3 mt-3 border-t flex justify-between font-bold text-lg" style="border-color:var(--border);color:var(--color-primary)">
              <span>Total</span><span>৳{{ grandTotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Line Items -->
      <div class="card overflow-hidden mb-6">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:var(--border)">
          <h3 class="font-bold text-sm" style="color:var(--text-primary)"><ShoppingBag class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Invoice Items</h3>
          <button type="button" @click="addItem" class="btn-secondary text-xs py-1 px-3"><Plus class="w-3 h-3" />Add Item</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px]">
            <thead><tr>
              <th class="table-header w-8">#</th>
              <th class="table-header">Description</th>
              <th class="table-header w-20">Qty</th>
              <th class="table-header w-28">Unit Price</th>
              <th class="table-header w-24">Total</th>
              <th class="table-header w-12"></th>
            </tr></thead>
            <tbody>
              <tr v-for="(item, i) in form.items" :key="i" class="table-row">
                <td class="table-cell text-center font-bold text-xs" style="color:var(--text-muted)">{{ i + 1 }}</td>
                <td class="table-cell"><input v-model="item.description" class="input-sm w-full" placeholder="Product or service description" /></td>
                <td class="table-cell"><input v-model.number="item.qty" type="number" min="1" class="input-sm w-16 text-center" @input="item.qty = Math.max(1, item.qty)" /></td>
                <td class="table-cell"><input v-model.number="item.price" type="number" min="0" step="0.01" class="input-sm w-24 text-right" /></td>
                <td class="table-cell font-semibold text-right" style="color:var(--text-primary)">৳{{ (item.qty * item.price).toLocaleString() }}</td>
                <td class="table-cell"><button type="button" @click="form.items.splice(i, 1)" class="p-1 rounded text-red-400 hover:bg-red-50 transition"><Trash2 class="w-3.5 h-3.5" /></button></td>
              </tr>
              <tr v-if="!form.items.length">
                <td colspan="6" class="text-center py-8 text-sm" style="color:var(--text-muted)">No items added yet. Click "Add Item" to begin.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- Notes & Footer -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)"><Pencil class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Notes</h3>
          <textarea v-model="form.notes" rows="3" class="input" placeholder="Additional notes for the customer..."></textarea>
        </div>
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)"><Percent class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Tax & Discount</h3>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Discount Amount (৳)</label><input v-model.number="form.discount" type="number" min="0" class="input" /></div>
            <div><label class="label">Tax Rate (%)</label><input v-model.number="form.tax_rate" type="number" min="0" max="100" class="input" /></div>
          </div>
        </div>
      </div>
      <!-- Actions -->
      <div class="flex items-center gap-3 justify-end">
        <button type="button" @click="$router.push('/invoices/sales')" class="btn-ghost">Cancel</button>
        <button type="button" @click="saveInvoice" class="btn-secondary"><Printer class="w-4 h-4" />Save & Print</button>
        <button type="submit" class="btn-primary"><Check class="w-4 h-4" />Create Invoice</button>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import { User, FileText, Calculator, ShoppingBag, Plus, Trash2, Pencil, Percent, Printer, Check } from 'lucide-vue-next'
const router = useRouter()
const toast = useToast()
const statusOptions = [{value:'unpaid',label:'Unpaid'},{value:'paid',label:'Paid'},{value:'pending',label:'Pending'}]
const form = ref({
  customer_name: '', customer_email: '', customer_phone: '', customer_address: '',
  invoice_date: new Date().toISOString().slice(0,10), due_date: new Date(Date.now()+30*86400000).toISOString().slice(0,10),
  order_ref: '', status: 'unpaid', notes: '', discount: 0, tax_rate: 0,
  items: [{description: '', qty: 1, price: 0}]
})
const subtotal = computed(() => form.value.items.reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0))
const discount = computed(() => Number(form.value.discount) || 0)
const taxAmount = computed(() => ((subtotal.value - discount.value) * (Number(form.value.tax_rate) || 0)) / 100)
const grandTotal = computed(() => subtotal.value - discount.value + taxAmount)
function addItem() { form.value.items.push({description: '', qty: 1, price: 0}) }
function saveInvoice() {
  if (!form.value.customer_name) return toast.error('Customer name is required')
  if (!form.value.items.some(i => i.description)) return toast.error('At least one item with description is required')
  toast.success('Invoice created successfully!')
  setTimeout(() => router.push('/invoices/sales'), 500)
}
</script>
