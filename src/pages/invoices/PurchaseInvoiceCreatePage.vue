<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div v-if="loading" class="card p-12 text-center" style="color:var(--text-muted)">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{color:'var(--color-primary)'}" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading purchase data...
    </div>
    <form v-else @submit.prevent="saveInvoice">
      <!-- Row 1: Vendor Details | Vendor List | Purchase Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Vendor Details -->
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

        <!-- Vendor List -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><BuildingStorefrontIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Select Vendor</h3>
          <div class="relative mb-3">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style="color:var(--text-muted)" />
            <input v-model="vendorSearch" class="input pl-8 py-1.5 text-xs w-full" placeholder="Search vendors..." />
          </div>
          <div class="max-h-48 overflow-y-auto space-y-0.5 -mx-1">
            <div v-for="v in filteredVendors" :key="v.id"
              @click="selectVendor(v)"
              class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition text-xs"
              :class="form.vendor_name === v.name ? 'bg-green-50 text-green-700 font-semibold' : 'hover:bg-gray-50'"
              style="color:var(--text-primary)">
              <div class="min-w-0 flex-1">
                <p class="font-medium truncate">{{ v.name }}</p>
                <p class="truncate" style="color:var(--text-muted)">{{ v.contact }} &middot; {{ v.email }}</p>
              </div>
              <button type="button" @click.stop="selectVendor(v)"
                class="shrink-0 ml-2 p-1 rounded-lg border border-gray-200 hover:border-green-400 text-green-500 hover:bg-green-50 transition-all"
                title="Select vendor">
                <UserPlus class="w-3.5 h-3.5" />
              </button>
            </div>
            <div v-if="!filteredVendors.length" class="text-center py-4 text-xs" style="color:var(--text-muted)">No vendors found</div>
          </div>
        </div>

        <!-- Purchase Details -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><DocumentTextIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Purchase Details</h3>
          <div class="space-y-3">
            <div><label class="label">Purchase Date *</label><DatePicker v-model="form.purchase_date" placeholder="Purchase date" /></div>
            <div><label class="label">Payment Method</label><SelectBox v-model="form.payment_method" :options="paymentOptions" size="md" full-width /></div>
            <div><label class="label">Status</label><SelectBox v-model="form.status" :options="statusOptions" size="md" full-width /></div>
          </div>
        </div>
      </div>

      <!-- Product List -->
      <div class="card overflow-hidden mb-6">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:var(--border)">
          <h3 class="font-bold text-sm" style="color:var(--text-primary)"><ShoppingBagIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Products</h3>
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
                <th class="table-header w-24 text-right">Unit Cost</th>
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
                <td class="table-cell text-right font-semibold" style="color:var(--color-primary)">৳{{ p.cost.toLocaleString() }}</td>
                <td class="table-cell text-center">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="p.stock > 10 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-500'">
                    {{ p.stock }}
                  </span>
                </td>
                <td class="table-cell text-center">
                  <button type="button" @click="openProductModal(p)"
                    class="p-1.5 rounded-lg border border-gray-200 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all"
                    title="Add to purchase">
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

      <!-- Items Purchased -->
      <div class="card overflow-hidden mb-6">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:var(--border)">
          <h3 class="font-bold text-sm" style="color:var(--text-primary)"><ShoppingBagIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Items Purchased</h3>
          <button type="button" @click="addItem" class="btn-secondary text-xs py-1 px-3"><Plus class="w-3 h-3" />Add Item</button>
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
                <td class="table-cell"><input v-model.number="item.qty" type="number" min="1" class="input-sm w-16 text-center" @input="item.qty = Math.max(1, item.qty || 1)" /></td>
                <td class="table-cell"><input v-model.number="item.cost" type="number" min="0" step="0.01" class="input-sm w-24 text-right" /></td>
                <td class="table-cell font-semibold text-right" style="color:var(--text-primary)">৳{{ (item.qty * item.cost).toLocaleString() }}</td>
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
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-4" style="color:var(--text-primary)"><CalculatorIcon class="w-4 h-4 inline mr-1.5" style="color:var(--color-primary)" />Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span style="color:var(--text-muted)">Items</span><span class="font-semibold" style="color:var(--text-primary)">{{ form.items.length }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Subtotal</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ subtotal.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Tax ({{ form.tax_rate }}%)</span><span class="font-semibold" style="color:var(--text-primary)">+৳{{ taxAmount.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span style="color:var(--text-muted)">Shipping</span><span class="font-semibold" style="color:var(--text-primary)">৳{{ Number(form.shipping).toLocaleString() }}</span></div>
            <div class="pt-3 mt-3 border-t flex justify-between font-bold text-lg" style="border-color:var(--border);color:var(--color-primary)">
              <span>Total</span><span>৳{{ grandTotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 justify-end">
        <button type="button" @click="$router.push('/invoices/purchases')"
          class="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" class="btn-primary"><Check class="w-4 h-4" />{{ isEdit ? 'Update Purchase' : 'Record Purchase' }}</button>
      </div>
    </form>

    <ProductSelectionModal v-model="showProductModal" :product="selectedProduct"
      icon="shopping-bag" price-label="Unit Cost" price-key="cost" button-text="Add to Purchase"
      @confirm="onProductConfirm" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import DatePicker from '@ecom/ui/components/DatePicker.vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import ProductSelectionModal from '@/components/invoices/ProductSelectionModal.vue'
import { BuildingStorefrontIcon, DocumentTextIcon, CalculatorIcon, ShoppingBagIcon, PencilIcon, TruckIcon } from '@heroicons/vue/24/outline'
import { Check, Plus, Trash2, Search, UserPlus } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(false)
const isEdit = computed(() => !!route.params.id)

const breadcrumbItems = computed(() => [
  { label: 'Purchase Invoices', to: '/invoices/purchases', icon: DocumentTextIcon },
  { label: isEdit.value ? 'Edit #PUR-' + String(route.params.id).padStart(5, '0') : 'New Purchase' }
])

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

// ─── Vendors ───
const vendorSearch = ref('')
const mockVendors = [
  { id: 1, name: 'TechMart Supplies', contact: 'Mr. Rahman', email: 'info@techmart.com', phone: '+8801712345678', address: '56 Kawran Bazar, Dhaka 1215' },
  { id: 2, name: 'Global Traders Ltd', contact: 'Mrs. Hasan', email: 'orders@globaltraders.com', phone: '+8801712345679', address: '120 Motijheel C/A, Dhaka 1000' },
  { id: 3, name: 'Quality Imports BD', contact: 'Mr. Islam', email: 'info@qualityimports.com', phone: '+8801712345680', address: '45 Gulshan Avenue, Dhaka 1212' },
  { id: 4, name: 'Direct Source Co.', contact: 'Ms. Akter', email: 'sales@directsource.com', phone: '+8801712345681', address: '78 Banani Road, Dhaka 1213' },
  { id: 5, name: 'Prime Distributors', contact: 'Mr. Hossain', email: 'info@primedist.com', phone: '+8801712345682', address: '23 Dhanmondi 15, Dhaka 1209' },
  { id: 6, name: 'Wholesale Hub BD', contact: 'Mrs. Sultana', email: 'contact@wholesalehub.com', phone: '+8801712345683', address: '90 Uttara Sector 7, Dhaka 1230' },
]

const filteredVendors = computed(() => {
  const q = vendorSearch.value.toLowerCase().trim()
  if (!q) return mockVendors
  return mockVendors.filter(v =>
    v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.contact.toLowerCase().includes(q)
  )
})

function selectVendor(v) {
  form.value.vendor_name = v.name
  form.value.contact_person = v.contact
  form.value.vendor_email = v.email
  form.value.vendor_phone = v.phone
  form.value.vendor_address = v.address
  toast.success(`Vendor "${v.name}" selected`)
}

// ─── Products ───
const productSearch = ref('')
const showProductModal = ref(false)
const selectedProduct = ref(null)

const mockProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', sku: 'WH-001', cost: 850, stock: 50 },
  { id: 2, name: 'USB-C Charging Cable (2m)', sku: 'CB-002', cost: 45, stock: 500 },
  { id: 3, name: 'Phone Case - Silicone', sku: 'PC-003', cost: 120, stock: 200 },
  { id: 4, name: 'Screen Protector Tempered Glass', sku: 'SP-004', cost: 35, stock: 800 },
  { id: 5, name: 'Mechanical Keyboard Switch Set', sku: 'KB-005', cost: 1200, stock: 30 },
  { id: 6, name: 'Wireless Mouse Optical', sku: 'MS-006', cost: 550, stock: 75 },
  { id: 7, name: 'USB Hub 4-Port', sku: 'UH-007', cost: 280, stock: 120 },
  { id: 8, name: 'Webcam 720p HD', sku: 'WC-008', cost: 650, stock: 40 },
  { id: 9, name: 'External HDD 500GB', sku: 'HD-009', cost: 2800, stock: 15 },
  { id: 10, name: 'Laptop Sleeve 15.6"', sku: 'LS-010', cost: 350, stock: 60 },
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
  modalCost.value = p.cost
  showProductModal.value = true
}

function onProductConfirm(data) {
  if (form.value.items.length === 1 && !form.value.items[0].name) {
    form.value.items[0] = { name: data.name, qty: data.qty, cost: data.cost }
  } else {
    form.value.items.push({ name: data.name, qty: data.qty, cost: data.cost })
  }
  toast.success(`"${data.name}" added to purchase`)
}

// ─── General ───
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
