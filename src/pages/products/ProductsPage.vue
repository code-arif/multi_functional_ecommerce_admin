<template>
  <div>
    <PageHeader title="Products" :subtitle="`${pagination?.total || 0} total products`">
      <router-link to="/products/create" class="btn-primary">
        <PlusIcon class="w-4 h-4" />
        Add Product
      </router-link>
    </PageHeader>

    <DataTable :items="products" :columns="columns" :loading="loading" :pagination="pagination" searchable
      search-placeholder="Search products..." empty-icon="📦" empty-text="No products found"
      @search="q => { search = q; load(1) }" @page="load">
      <template #filters>
        <select v-model="statusFilter" @change="load(1)" class="input py-2 w-36 text-sm">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </template>
      <template #actions>
        <button @click="load()" class="btn-ghost p-2" title="Refresh">
          <ArrowPathIcon class="w-4 h-4" />
        </button>
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                <Package class="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ item.name }}</p>
              <p class="text-gray-400 text-xs">{{ item.sku || 'No SKU' }}</p>
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
            <p class="font-semibold text-gray-900 text-sm">
              <template v-if="item.price_range?.min === item.price_range?.max">
                ৳{{ Number(item.price_range.min).toLocaleString() }}
              </template>
              <template v-else>
                ৳{{ Number(item.price_range?.min).toLocaleString() }} – ৳{{
                  Number(item.price_range?.max).toLocaleString() }}
              </template>
            </p>
            <p class="text-xs text-gray-400">Variable</p>
          </template>

          <!-- Simple / Affiliate product -->
          <template v-else>
            <p class="font-semibold text-gray-900 text-sm">৳{{ Number(item.current_price).toLocaleString() }}</p>
            <p v-if="item.is_on_sale" class="text-xs text-gray-400 line-through">
              ৳{{ Number(item.price).toLocaleString() }}
            </p>
          </template>
        </td>

        <td class="table-cell">
          <span :class="item.stock_quantity <= 5 ? 'text-red-600 font-bold' : 'text-gray-700'" class="text-sm">{{
            item.stock_quantity }}</span>
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
            <!-- View button -->
            <router-link :to="`/products/${item.id}`"
              class="p-1.5 rounded-lg text-gray-500 bg-gray-50 hover:bg-gray-100 transition" title="View">
              <EyeIcon class="w-4 h-4" />
            </router-link>
            <router-link :to="`/products/${item.id}/edit`"
              class="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition" title="Edit">
              <PencilIcon class="w-4 h-4" />
            </router-link>
            <button @click="confirmDelete(item)"
              class="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition" title="Delete">
              <TrashIcon class="w-4 h-4" />
            </button>
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
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { productApi } from '@/api'
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { Package, Tag } from 'lucide-vue-next'

const toast = useToast()
const products = ref([]), pagination = ref(null), loading = ref(true)
const search = ref(''), statusFilter = ref(''), deleteTarget = ref(null), deleting = ref(false)

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