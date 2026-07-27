<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div v-if="loading" class="card p-12 text-center" style="color:var(--text-muted)">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{color:'var(--color-primary)'}" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading invoice data...
    </div>
    <form v-else @submit.prevent="saveInvoice">
      <!-- Row 1: Customer Details | Customer List | Invoice Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Customer Details -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><User class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Customer Details</h3>
          <div class="space-y-3">
            <div><label class="label">Customer *</label><input v-model="form.customer_name" class="input" placeholder="Customer name" /></div>
            <div><label class="label">Email</label><input v-model="form.customer_email" type="email" class="input" placeholder="customer@example.com" /></div>
            <div><label class="label">Phone</label><input v-model="form.customer_phone" class="input" placeholder="Phone number" /></div>
            <div><label class="label">Address</label><textarea v-model="form.customer_address" rows="2" class="input" placeholder="Billing address"></textarea></div>
          </div>
        </div>

        <!-- Customer List -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><Users class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Select Customer</h3>
          <div class="relative mb-3">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style="color:var(--text-muted)" />
            <input v-model="customerSearch" class="input pl-8 py-1.5 text-xs w-full" placeholder="Search customers..." />
          </div>
          <div class="max-h-48 overflow-y-auto space-y-0.5 -mx-1">
            <div v-for="c in filteredCustomers" :key="c.id"
              @click="selectCustomer(c)"
              class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition text-xs"
              :class="form.customer_name === c.name ? 'bg-green-50 text-green-700 font-semibold' : 'hover:bg-gray-50'"
              style="color:var(--text-primary)">
              <div class="min-w-0 flex-1">
                <p class="font-medium truncate">{{ c.name }}</p>
                <p class="truncate" style="color:var(--text-muted)">{{ c.email }}</p>
              </div>
              <button type="button" @click.stop="selectCustomer(c)"
                class="shrink-0 ml-2 p-1 rounded-lg border border-gray-200 hover:border-green-400 text-green-500 hover:bg-green-50 transition-all"
                title="Select customer">
                <UserPlus class="w-3.5 h-3.5" />
              </button>
            </div>
            <div v-if="!filteredCustomers.length" class="text-center py-4 text-xs" style="color:var(--text-muted)">No customers found</div>
          </div>
        </div>

        <!-- Invoice Details -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><FileText class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Invoice Details</h3>
          <div class="space-y-3">
            <div><label class="label">Invoice Date *</label><input v-model="form.invoice_date" type="date" class="input" /></div>
            <div><label class="label">Due Date *</label><input v-model="form.due_date" type="date" class="input" /></div>
            <div><label class="label">Order Reference</label><input v-model="form.order_ref" class="input" placeholder="#ORD-001" /></div>
            <div><label class="label">Status</label><SelectBox v-model="form.status" :options="statusOptions" size="md" full-width /></div>
          </div>
        </div>
      </div>

      <!-- Product List -->
      <div class="card overflow-hidden mb-6">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:var(--border)">
          <h3 class="font-bold text-sm" style="color:var(--text-primary)"><Package class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Products</h3>
          <div class="relative w-56">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style="color:var(--text-muted)" />
            <input v-model="productSearch" class="input pl-8 py-1.5 text-xs w-full" placeholder="Search products..." />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/80">
                <th class="table-header">Product</th>
                <th class="table-header w-20">SKU</th>
                <th class="table-header w-24 text-right">Price</th>
                <th class="table-header w-16 text-center">Stock</th>
                <th class="table-header w-16 text-center"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredProducts" :key="p.id" class="table-row">
                <td class="table-cell">
                  <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ p.name }}</p>
                </td>
                <td class="table-cell text-xs" style="color:var(--text-muted)">{{ p.sku }}</td>
                <td class="table-cell text-right font-semibold" style="color:var(--color-primary)">৳{{ p.price.toLocaleString() }}</td>
                <td class="table-cell text-center">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="p.stock > 10 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-500'">
                    {{ p.stock }}
                  </span>
                </td>
                <td class="table-cell text-center">
                  <button type="button" @click="openProductModal(p)"
                    class="p-1.5 rounded-lg border border-gray-200 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all"
                    title="Add to invoice">
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredProducts.length">
                <td colspan="5" class="text-center py-8 text-sm" style="color:var(--text-muted)">No products found</td>
              </tr>
            </tbody>
          </table>
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
                <td class="table-cell"><input v-model.number="item.qty" type="number" min="1" class="input-sm w-16 text-center" @input="item.qty = Math.max(1, item.qty || 1)" /></td>
                <td class="table-cell"><input v-model.number="item.price" type="number" min="0" step="0.01" class="input-sm w-24 text-right" /></td>
                <td class="table-cell font-semibold text-right" style="color:var(--text-primary)">৳{{ (item.qty * item.price).toLocaleString() }}</td>
                <td class="table-cell"><button type="button" @click="form.items.splice(i, 1)" class="p-1 rounded text-red-400 hover:bg-red-50 transition"><Trash2 class="w-3.5 h-3.5" /></button></td>
              </tr>
              <tr v-if="!form.items.length">
                <td colspan="6" class="text-center py-8 text-sm" style="color:var(--text-muted)">No items added yet. Select products above or click "Add Item".</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notes & Footer -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)"><Pencil class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Notes</h3>
          <textarea v-model="form.notes" rows="3" class="input" placeholder="Additional notes for the customer..."></textarea>
        </div>
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" style="color:var(--text-primary)"><Percent class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Tax & Discount</h3>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Discount (৳)</label><input v-model.number="form.discount" type="number" min="0" class="input" /></div>
            <div><label class="label">Tax Rate (%)</label><input v-model.number="form.tax_rate" type="number" min="0" max="100" class="input" /></div>
          </div>
        </div>
        <!-- Summary -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><Calculator class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span style="color:var(--text-muted)">Items</span><span class="font-semibold" style="color:var(--text-primary)">{{ form.items.length }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Subtotal</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ subtotal.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Discount</span><span class="font-semibold" style="color:var(--success)">−৳{{ discount.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Tax ({{ form.tax_rate }}%)</span><span class="font-semibold" style="color:var(--text-primary)">+৳{{ taxAmount.toLocaleString() }}</span></div>
            <div class="pt-3 mt-3 border-t flex justify-between font-bold text-lg" style="border-color:var(--border);color:var(--color-primary)">
              <span>Total</span><span>৳{{ grandTotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 justify-end">
        <button type="button" @click="$router.push('/invoices/sales')"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="button" @click="saveInvoice" v-if="!isEdit" class="btn-secondary"><Printer class="w-4 h-4" />Save & Print</button>
        <button type="submit" class="btn-primary"><Check class="w-4 h-4" />{{ isEdit ? 'Update Invoice' : 'Create Invoice' }}</button>
      </div>
    </form>

    <ProductSelectionModal v-model="showProductModal" :product="selectedProduct"
      icon="package" price-label="Sale Price" price-key="price" button-text="Add to Invoice"
      @confirm="onProductConfirm" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import SelectBox from '@/components/common/SelectBox.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ProductSelectionModal from '@/components/invoices/ProductSelectionModal.vue'
import { invoiceApi } from '@/api'
import { User, Users, UserPlus, FileText, Calculator, ShoppingBag, Package, Plus, Trash2, Pencil, Percent, Printer, Check, Search } from 'lucide-vue-next'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const isEdit = computed(() => !!route.params.id)

const breadcrumbItems = computed(() => [
  { label: 'Sale Invoices', to: '/invoices/sales', icon: DocumentTextIcon },
  { label: isEdit.value ? 'Edit #INV-' + String(route.params.id).padStart(5, '0') : 'New Invoice' }
])

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

// ─── Customers ───
const customerSearch = ref('')
const mockCustomers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+8801712345678', address: '42 Gulshan Avenue, Dhaka 1212' },
  { id: 2, name: 'Mike Chen', email: 'mike@example.com', phone: '+8801712345679', address: '15 Banani Road, Dhaka 1213' },
  { id: 3, name: 'Emily Davis', email: 'emily@example.com', phone: '+8801712345680', address: '8 Dhanmondi 27, Dhaka 1209' },
  { id: 4, name: 'Alex Kumar', email: 'alex@example.com', phone: '+8801712345681', address: '21 Uttara Sector 3, Dhaka 1230' },
  { id: 5, name: 'Lisa Martinez', email: 'lisa@example.com', phone: '+8801712345682', address: '55 Mirpur Road, Dhaka 1207' },
  { id: 6, name: 'Tom Wilson', email: 'tom@example.com', phone: '+8801712345683', address: '12 Motijheel C/A, Dhaka 1000' },
  { id: 7, name: 'Emma Brown', email: 'emma@example.com', phone: '+8801712345684', address: '33 Baridhara DOHS, Dhaka 1212' },
  { id: 8, name: 'John Smith', email: 'john@example.com', phone: '+8801712345685', address: '9 Banani DOHS, Dhaka 1213' },
]

const filteredCustomers = computed(() => {
  const q = customerSearch.value.toLowerCase().trim()
  if (!q) return mockCustomers
  return mockCustomers.filter(c =>
    c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
  )
})

function selectCustomer(c) {
  form.value.customer_name = c.name
  form.value.customer_email = c.email
  form.value.customer_phone = c.phone
  form.value.customer_address = c.address
  toast.success(`Customer "${c.name}" selected`)
}

// ─── Products ───
const productSearch = ref('')
const showProductModal = ref(false)
const selectedProduct = ref(null)

const mockProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', sku: 'WH-001', price: 4500, stock: 25 },
  { id: 2, name: 'USB-C Charging Cable (2m)', sku: 'CB-002', price: 800, stock: 100 },
  { id: 3, name: 'Laptop Stand - Adjustable', sku: 'LS-003', price: 3500, stock: 15 },
  { id: 4, name: 'Screen Protector (15.6")', sku: 'SP-004', price: 1200, stock: 42 },
  { id: 5, name: 'Mechanical Keyboard RGB', sku: 'KB-005', price: 6500, stock: 8 },
  { id: 6, name: 'Wireless Mouse Ergonomic', sku: 'MS-006', price: 2800, stock: 30 },
  { id: 7, name: '27" 4K IPS Monitor', sku: 'MN-007', price: 45000, stock: 3 },
  { id: 8, name: 'USB Hub 7-Port', sku: 'UH-008', price: 1500, stock: 55 },
  { id: 9, name: 'Webcam 1080p HD', sku: 'WC-009', price: 3200, stock: 18 },
  { id: 10, name: 'External SSD 1TB', sku: 'SS-010', price: 12000, stock: 6 },
]

const filteredProducts = computed(() => {
  const q = productSearch.value.toLowerCase().trim()
  if (!q) return mockProducts
  return mockProducts.filter(p =>
    p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
  )
})

function openProductModal(p) {
  selectedProduct.value = p
  modalQty.value = 1
  modalPrice.value = p.price
  showProductModal.value = true
}

function onProductConfirm(data) {
  if (form.value.items.length === 1 && !form.value.items[0].description) {
    form.value.items[0] = { description: data.name, qty: data.qty, price: data.price }
  } else {
    form.value.items.push({ description: data.name, qty: data.qty, price: data.price })
  }
  toast.success(`"${data.name}" added to invoice`)
}

// ─── General ───
function addItem() { form.value.items.push({description: '', qty: 1, price: 0}) }

function loadInvoice() {
  loading.value = true
  setTimeout(() => {
    form.value = {
      customer_name: 'Sarah Johnson', customer_email: 'sarah@example.com', customer_phone: '+8801712345678',
      customer_address: '42 Gulshan Avenue, Dhaka 1212',
      invoice_date: new Date(Date.now()-5*86400000).toISOString().slice(0,10),
      due_date: new Date(Date.now()+25*86400000).toISOString().slice(0,10),
      order_ref: '#ORD-1024', status: 'unpaid', notes: 'Thank you for your business!',
      discount: 500, tax_rate: 5,
      items: [
        {description: 'Wireless Bluetooth Headphones', qty: 2, price: 4500},
        {description: 'USB-C Charging Cable (2m)', qty: 5, price: 800},
        {description: 'Laptop Stand - Adjustable', qty: 1, price: 3500},
        {description: 'Screen Protector (15.6")', qty: 3, price: 1200},
      ]
    }
    loading.value = false
  }, 400)
}

function saveInvoice() {
  if (!form.value.customer_name) return toast.error('Customer name is required')
  if (!form.value.items.some(i => i.description)) return toast.error('At least one item with description is required')
  if (isEdit.value) {
    toast.success('Invoice updated successfully!')
    setTimeout(() => router.push('/invoices/sales/' + route.params.id), 500)
  } else {
    toast.success('Invoice created successfully!')
    setTimeout(() => router.push('/invoices/sales'), 500)
  }
}

onMounted(() => {
  if (isEdit.value) loadInvoice()
})
</script>
