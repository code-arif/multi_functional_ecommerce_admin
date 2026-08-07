<template>
  <div class="w-full">
    <BreadcrumbHeader :items="breadcrumbItems">
      <router-link to="/categories" class="px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors mr-2">
        Back to List
      </router-link>
    </BreadcrumbHeader>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="flex flex-col items-center gap-3 text-gray-400">
        <svg class="w-8 h-8 animate-spin text-[#2E7D32]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="text-sm">Loading category details...</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="card p-12 text-center">
      <p class="text-4xl mb-3">⚠️</p>
      <p class="text-gray-700 font-semibold">Failed to load category</p>
      <p class="text-gray-400 text-sm mt-1 mb-4">{{ error }}</p>
      <router-link to="/categories" class="btn-primary text-sm px-6 inline-block">Back to Categories</router-link>
    </div>

    <!-- Content -->
    <div v-else-if="category" class="space-y-6">
      
      <!-- Banner and Header section -->
      <div class="card overflow-hidden">
        <div class="h-48 w-full bg-slate-100 relative">
          <img v-if="category.banner_url" :src="category.banner_url" class="w-full h-full object-cover" alt="Category Banner" />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
            <span class="text-gray-400 text-sm">No banner image uploaded</span>
          </div>
          <!-- Image Icon Overlay -->
          <div class="absolute bottom-4 left-6 flex items-end gap-4">
            <div class="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg border border-gray-100 overflow-hidden flex items-center justify-center">
              <img v-if="category.image_url" :src="category.image_url" class="w-full h-full object-cover rounded-xl" />
              <FolderIcon v-else class="w-10 h-10 text-emerald-600" />
            </div>
            <div class="mb-1 text-white drop-shadow-md">
              <h1 class="text-2xl font-bold font-sans text-white">{{ category.name }}</h1>
              <p class="text-sm opacity-90">/{{ category.slug }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Products</p>
            <p class="text-2xl font-bold text-gray-900">{{ category.products_count || 0 }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Package class="w-5 h-5" />
          </div>
        </div>

        <div class="card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Commission Rate</p>
            <p class="text-2xl font-bold text-gray-900">{{ category.commission_rate || '0.00' }}%</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Percent class="w-5 h-5" />
          </div>
        </div>

        <div class="card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Approval Status</p>
            <div class="mt-1">
              <StatusBadge :value="category.status" />
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <CheckBadgeIcon class="w-5 h-5" />
          </div>
        </div>

        <div class="card p-5 flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Active Status</p>
            <div class="mt-1">
              <StatusBadge :value="category.is_active ? 'active' : 'inactive'" />
            </div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
            <PowerIcon class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- Information and Associated Products -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Category Profile -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FolderIcon class="w-5 h-5 text-emerald-600" />
              Category Profile
            </h3>
            
            <div class="space-y-4 text-sm">
              <div>
                <p class="text-xs text-gray-400 mb-1">Description</p>
                <p class="text-gray-700 whitespace-pre-line leading-relaxed">{{ category.description || 'No description provided.' }}</p>
              </div>

              <div class="pt-2 grid grid-cols-2 gap-4 border-t border-gray-50">
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Parent Category</p>
                  <p class="text-gray-900 font-medium">{{ category.parent?.name || 'Root Category' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Hierarchy Depth</p>
                  <p class="text-gray-900 font-medium">Level {{ category.depth }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Sort Order</p>
                  <p class="text-gray-900 font-mono">{{ category.sort_order }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">Featured Status</p>
                  <p class="text-gray-900 font-medium">{{ category.is_featured ? 'Yes (Featured)' : 'No' }}</p>
                </div>
              </div>

              <div class="pt-3 border-t border-gray-50 space-y-2">
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="flex items-center gap-1"><UserIcon class="w-3.5 h-3.5" /> Created By:</span>
                  <span class="font-semibold">{{ category.creator?.name || 'System' }}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="flex items-center gap-1"><CalendarIcon class="w-3.5 h-3.5" /> Created At:</span>
                  <span>{{ formatDate(category.created_at) }}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500" v-if="category.updater">
                  <span class="flex items-center gap-1"><UserIcon class="w-3.5 h-3.5" /> Updated By:</span>
                  <span class="font-semibold">{{ category.updater?.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SEO Metadata Card -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <SparklesIcon class="w-5 h-5 text-indigo-500" />
              SEO Meta Information
            </h3>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Meta Title</p>
                <p class="text-gray-900 font-medium">{{ category.meta_title || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Meta Keywords</p>
                <p class="text-gray-900">{{ category.meta_keywords || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">Meta Description</p>
                <p class="text-gray-600 text-xs leading-relaxed">{{ category.meta_description || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Associated Products list -->
        <div class="lg:col-span-2">
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <PackageIcon class="w-5 h-5 text-emerald-600" />
              Associated Products
            </h3>
            
            <div v-if="!category.products || category.products.length === 0" class="py-12 text-center text-gray-400">
              <p class="text-3xl mb-2">📦</p>
              <p class="text-sm">No products listed under this category yet.</p>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th class="py-3 px-2">Product</th>
                    <th class="py-3 px-2">SKU</th>
                    <th class="py-3 px-2">Price</th>
                    <th class="py-3 px-2">Status</th>
                    <th class="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="prod in category.products" :key="prod.id" class="hover:bg-gray-50/50 transition">
                    <td class="py-3 px-2">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                          <img v-if="prod.thumbnail_url" :src="prod.thumbnail_url" class="w-full h-full object-cover" />
                          <PackageIcon v-else class="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p class="font-semibold text-sm text-gray-900">{{ prod.name }}</p>
                          <p class="text-xs text-gray-400">/{{ prod.slug }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-2 text-sm text-gray-600 font-mono">{{ prod.sku || '—' }}</td>
                    <td class="py-3 px-2 text-sm text-gray-900 font-semibold">
                      <span v-if="prod.sale_price" class="text-red-500">{{ formatPrice(prod.sale_price) }}</span>
                      <span v-else>{{ formatPrice(prod.price) }}</span>
                    </td>
                    <td class="py-3 px-2">
                      <StatusBadge :value="prod.status === 'active' ? 'active' : 'inactive'" />
                    </td>
                    <td class="py-3 px-2 text-right">
                      <router-link :to="`/products/${prod.id}`" class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition">
                        View
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
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
import { format } from 'date-fns'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { categoryApi } from '@/api'
import { 
  PencilIcon, 
  TagIcon, 
  FolderIcon, 
  CheckBadgeIcon, 
  PowerIcon, 
  UserIcon, 
  CalendarIcon, 
  SparklesIcon
} from '@heroicons/vue/24/outline'
import { Tag, Package, Folder, PackageIcon, Percent } from 'lucide-vue-next'

const route = useRoute()
const loading = ref(true)
const category = ref(null)
const error = ref(null)

const breadcrumbItems = computed(() => [
  { label: 'Categories', to: '/categories', icon: TagIcon },
  { label: category.value ? category.value.name : 'Detail', icon: FolderIcon }
])

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await categoryApi.show(route.params.id)
    category.value = res.data.data
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to fetch category details.'
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '—'
  return format(new Date(dateString), 'dd MMM yyyy, hh:mm a')
}

function formatPrice(val) {
  if (!val) return '—'
  return '৳' + parseFloat(val).toFixed(2)
}

onMounted(load)
</script>
