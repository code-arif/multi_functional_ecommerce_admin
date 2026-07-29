<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <DataTable :items="products" :columns="columns" :loading="loading" searchable :pagination="pagination"
      search-placeholder="Search products..." empty-icon="📦" empty-text="No products found"
      @search="q => { search = q; load(1) }" @page="load">
      <template #filters>
        <SelectBox
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="All Status"
          size="md"
          @change="load(1)"
        />
      </template>
      <template #actions>
        <button @click="exportProducts" class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5" title="Export CSV">
          <Download class="w-4 h-4" />
          Export
        </button>
        <button @click="load()" class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5" title="Refresh">
          <ArrowPathIcon class="w-4 h-4" />
        </button>
        <router-link to="/products/import" class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5">
          <ArrowUpTrayIcon class="w-4 h-4" />
          Import
        </router-link>
        <router-link to="/products/create" class="btn-primary">
          Add Product
        </router-link>
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0" style="background-color:var(--border-light)">
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-lg">
                <Package class="w-4 h-4" style="color:var(--text-muted)" />
              </div>
            </div>
            <div>
              <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.name }}</p>
              <p class="text-xs" style="color:var(--text-muted)">{{ item.sku || 'No SKU' }}</p>
            </div>
          </div>
        </td>

        <td class="table-cell">
          <StatusBadge :value="item.type" />
        </td>

        <!-- <td class="table-cell">
          <p class="font-semibold text-gray-900 text-sm">৳{{ Number(item.current_price).toLocaleString() }}</p>
          <p v-if="item.is_on_sale" class="text-xs text-gray-400 line-through">৳{{
            Number(item.price).toLocaleString()
          }}</p>
        </td> -->

        <td class="table-cell">
          <!-- Variable product: price range -->
          <template v-if="item.type === 'variable'">
            <p class="font-semibold text-sm" style="color:var(--text-primary)">
              <template v-if="item.price_range?.min === item.price_range?.max">
                ৳{{ Number(item.price_range.min).toLocaleString() }}
              </template>
              <template v-else>
                ৳{{ Number(item.price_range?.min).toLocaleString() }} – ৳{{
                  Number(item.price_range?.max).toLocaleString() }}
              </template>
            </p>
            <p class="text-xs" style="color:var(--text-muted)">Variable</p>
          </template>

          <!-- Simple / Affiliate product -->
          <template v-else>
            <p class="font-semibold text-sm" style="color:var(--text-primary)">৳{{ Number(item.current_price).toLocaleString() }}</p>
            <p v-if="item.is_on_sale" class="text-xs line-through" style="color:var(--text-muted)">
              ৳{{ Number(item.price).toLocaleString() }}
            </p>
          </template>
        </td>

        <td class="table-cell">
          <span :class="item.stock_quantity <= 5 ? 'text-red-600 font-bold' : ''" class="text-sm" :style="{ color: item.stock_quantity <= 5 ? '' : 'var(--text-primary)' }">{{ item.stock_quantity }}</span>
        </td>

        <td class="table-cell">
          <StatusBadge :value="item.status" />
        </td>

        <td class="table-cell">
          <StatusBadge :value="item.category?.name" />
        </td>

        <td class="table-cell">
          <StatusBadge :value="item.brand?.name" />
        </td>

        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1">
            <Tooltip text="View">
              <router-link :to="`/products/${item.id}`"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all">
                <EyeIcon class="w-4 h-4" />
              </router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <router-link :to="`/products/${item.id}/edit`"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all">
                <PencilIcon class="w-4 h-4" />
              </router-link>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)"
                class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:bg-red-50 transition-all">
                <TrashIcon class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </td>

      </template>
    </DataTable>

    <ConfirmModal :show="!!deleteTarget" title="Delete Product"
      :message="`Delete '${deleteTarget?.name}'? This cannot be undone.`" :loading="deleting" @confirm="doDelete"
      @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { productApi } from '@/api'
import { PencilIcon, TrashIcon, EyeIcon, CubeIcon, ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { useCsvExport } from '@ecom/ui/composables/useCsvExport'
import { Package, Download } from 'lucide-vue-next'

const toast = useToast()
const { exportToCsv } = useCsvExport()
const products = ref([]), pagination = ref(null), loading = ref(true)
const search = ref(''), statusFilter = ref(''), deleteTarget = ref(null), deleting = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Products', icon: CubeIcon }
])



const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
]

const columns = [
  { key: 'name', label: 'Product', class: 'w-64' },
  { key: 'type', label: 'Type', class: 'w-24' },
  { key: 'price', label: 'Price', class: 'w-28' },
  { key: 'stock', label: 'Stock', class: 'w-20' },
  { key: 'status', label: 'Status', class: 'w-24' },
  { key: 'category', label: 'Category', class: 'w-24' },
  { key: 'brand', label: 'Brand', class: 'w-24' },
  { key: 'actions', label: 'Action', class: 'w-28 text-right' },
]

async function load(page = 1) {
  loading.value = true
  try {
    const res = await productApi.list({ page, search: search.value, status: statusFilter.value, per_page: 20 })
    products.value = res.data.data || []
    pagination.value = res.data.pagination || null
  } catch {
    toast.error('Failed to load products.')
  } finally {
    loading.value = false
  }
}

function exportProducts() {
  const cols = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'type', label: 'Type' },
    { key: 'current_price', label: 'Price (৳)', transform: v => `৳${Number(v).toLocaleString()}` },
    { key: 'stock_quantity', label: 'Stock' },
    { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category', transform: (_, item) => item.category?.name || '' },
    { key: 'brand', label: 'Brand', transform: (_, item) => item.brand?.name || '' },
  ]
  exportToCsv(products.value, cols, `products-export-${products.value.length}-items`)
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await productApi.destroy(deleteTarget.value.id)
    toast.success('Product deleted.')
    deleteTarget.value = null
    load()
  } catch {
    toast.error('Failed to delete product.')
  } finally {
    deleting.value = false
  }
}

onMounted(() => load())
</script>