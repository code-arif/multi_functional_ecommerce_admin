<template>
  <div class="max-w-6xl">
    <PageHeader :title="isEdit ? 'Edit Purchase Invoice' : 'New Purchase Invoice'" :subtitle="isEdit ? 'Update purchase #PUR-' + String(route.params.id).padStart(5, '0') : 'Record a purchase from a vendor'">
      <button @click="$router.push('/invoices/purchases')" class="btn-ghost text-sm">← Purchase Invoices</button>
    </PageHeader>
    <div v-if="loading" class="card p-12 text-center" style="color:var(--text-muted)">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{color:'var(--color-primary)'}" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading purchase data...
    </div>
    <form v-else @submit.prevent="saveInvoice">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><BuildingStorefrontIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Vendor Details</h3>
          <div class="space-y-3">
            <div><label class="label">Vendor *</label><input v-model="form.vendor_name" class="input" placeholder="Vendor/supplier name" /></div>
            <div><label class="label">Contact Person</label><input v-model="form.contact_person" class="input" placeholder="Contact person" /></div>
            <div><label class="label">Email</label><input v-model="form.vendor_email" type="email" class="input" placeholder="vendor@example.com" /></div>
            <div><label class="label">Phone</label><input v-model="form.vendor_phone" class="input" placeholder="Phone number" /></div>
            <div><label class="label">Address</label><textarea v-model="form.vendor_address" rows="2" class="input" placeholder="Vendor address"></textarea></div>
          </div>
        </div>
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><DocumentTextIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Purchase Details</h3>
          <div class="space-y-3">
            <div><label class="label">Purchase Date *</label><input v-model="form.purchase_date" type="date" class="input" /></div>
            <div><label class="label">Payment Method</label><SelectBox v-model="form.payment_method" :options="paymentOptions" size="sm" full-width /></div>
            <div><label class="label">Status</label><SelectBox v-model="form.status" :options="statusOptions" size="sm" full-width /></div>
          </div>
        </div>
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><CalculatorIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Summary</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span style="color:var(--text-muted)">Subtotal</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ subtotal.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Tax ({{ form.tax_rate }}%)</span><span class="font-semibold" style="color:var(--text-primary)">+৳{{ taxAmount.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Shipping</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ Number(form.shipping).toLocaleString() }}</span></div>
            <div class="pt-3 mt-3 border-t flex justify-between font-bold text-lg" style="border-color:var(--border);color:var(--color-primary)">
              <span>Total</span><span>৳{{ grandTotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card overflow-hidden mb-6">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:var(--border)">
          <h3 class="font-bold text-sm" style="color:var(--text-primary)"><ShoppingBagIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Items Purchased</h3>
          <button type="button" @click="addItem" class="btn-secondary text-xs py-1 px-3"><PlusIcon class="w-3 h-3" />Add Item</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px]">
            <thead><tr>
              <th class="table-header w-8">#</th><th class="table-header">Product</th><th class="table-header w-20">Qty</th>
              <th class="table-header w-28">Unit Cost</th><th class="table-header w-24">Total</th><th class="table-header w-12"></th>
            </tr></thead>
            <tbody>
              <tr v-for="(item, i) in form.items" :key="i" class="table-row">
                <td class="table-cell text-center font-bold text-xs" style="color:var(--text-muted)">{{ i+1 }}</td>
                <td class="table-cell"><input v-model="item.name" class="input-sm w-full" placeholder="Product name" /></td>
                <td class="table-cell"><input v-model.number="item.qty" type="number" min="1" class="input-sm w-16 text-center" /></td>
                <td class="table-cell"><input v-model.number="item.cost" type="number" min="0" step="0.01" class="input-sm w-24 text-right" /></td>
                <td class="table-cell font-semibold text-right" style="color:var(--text-primary)">৳{{ (item.qty * item.cost).toLocaleString() }}</td>
                <td class="table-cell"><button type="button" @click="form.items.splice(i, 1)" class="p-1 rounded text-red-400 hover:bg-red-50 transition"><TrashIcon class="w-3.5 h-3.5" /></button></td>
              </tr>
              <tr v-if="!form.items.length"><td colspan="6" class="text-center py-8 text-sm" style="color:var(--text-muted)">No items added yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)"><PencilIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Notes</h3>
          <textarea v-model="form.notes" rows="3" class="input" placeholder="Additional notes..."></textarea>
        </div>
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)"><TruckIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Shipping & Tax</h3>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Shipping Cost (৳)</label><input v-model.number="form.shipping" type="number" min="0" class="input" /></div>
            <div><label class="label">Tax Rate (%)</label><input v-model.number="form.tax_rate" type="number" min="0" max="100" class="input" /></div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 justify-end">
        <button type="button" @click="$router.push('/invoices/purchases')" class="btn-ghost">Cancel</button>
        <button type="submit" class="btn-primary"><Check class="w-4 h-4" />{{ isEdit ? 'Update Purchase' : 'Record Purchase' }}</button>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import { BuildingStorefrontIcon, DocumentTextIcon, CalculatorIcon, ShoppingBagIcon, PlusIcon, TrashIcon, PencilIcon, TruckIcon } from '@heroicons/vue/24/outline'
import { Check } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const isEdit = computed(() => !!route.params.id)

const paymentOptions = [{value:'',label:'Select'},{value:'bank_transfer',label:'Bank Transfer'},{value:'cash',label:'Cash'},{value:'check',label:'Check'},{value:'credit',label:'Credit'}]
const statusOptions = [{value:'unpaid',label:'Unpaid'},{value:'paid',label:'Paid'},{value:'pending',label:'Pending'}]

const form = ref({
  vendor_name: '', contact_person: '', vendor_email: '', vendor_phone: '', vendor_address: '',
  purchase_date: new Date().toISOString().slice(0,10), payment_method: '', status: 'unpaid',
  notes: '', shipping: 0, tax_rate: 0,
  items: [{name: '', qty: 1, cost: 0}]
})

const subtotal = computed(() => form.value.items.reduce((s, i) => s + (i.qty || 0) * (i.cost || 0), 0))
const taxAmount = computed(() => (subtotal.value * (Number(form.value.tax_rate) || 0)) / 100)
const grandTotal = computed(() => subtotal.value + taxAmount + (Number(form.value.shipping) || 0))

function addItem() { form.value.items.push({name: '', qty: 1, cost: 0}) }

function loadPurchase() {
  loading.value = true
  setTimeout(() => {
    form.value = {
      vendor_name: 'TechMart Supplies', contact_person: 'Mr. Rahman', vendor_email: 'info@techmart.com',
      vendor_phone: '+8801712345678', vendor_address: '56 Kawran Bazar, Dhaka 1215',
      purchase_date: new Date(Date.now()-10*86400000).toISOString().slice(0,10),
      payment_method: 'bank_transfer', status: 'paid', notes: 'Payment via bank transfer completed.',
      shipping: 1200, tax_rate: 5,
      items: [
        {name: 'Wireless Headphones (Wholesale)', qty: 50, cost: 850},
        {name: 'USB-C Cables (Box of 100)', qty: 3, cost: 4500},
        {name: 'Phone Cases (Assorted)', qty: 200, cost: 120},
        {name: 'Screen Protectors (Bulk)', qty: 500, cost: 45},
      ]
    }
    loading.value = false
  }, 400)
}

function saveInvoice() {
  if (!form.value.vendor_name) return toast.error('Vendor name is required')
  if (!form.value.items.some(i => i.name)) return toast.error('At least one item is required')
  if (isEdit.value) {
    toast.success('Purchase updated successfully!')
    setTimeout(() => router.push('/invoices/purchases/' + route.params.id), 500)
  } else {
    toast.success('Purchase recorded successfully!')
    setTimeout(() => router.push('/invoices/purchases'), 500)
  }
}

onMounted(() => {
  if (isEdit.value) loadPurchase()
})
</script>
