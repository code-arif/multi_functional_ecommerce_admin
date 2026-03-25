<template>
  <div class="w-full">
    <!-- Header -->
    <PageHeader :title="product?.name || 'Product Details'" :subtitle="product?.sku ? `SKU: ${product.sku}` : ''">
      <div class="flex items-center gap-2">
        <button @click="$router.push('/products')"
                class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-[#4CAF50] hover:text-[#4CAF50] transition text-sm">
          ← Back
        </button>
        <router-link :to="`/products/${product?.id}/edit`" class="btn-primary text-sm" v-if="product">
          Edit Product
        </router-link>
      </div>
    </PageHeader>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="flex flex-col items-center gap-3 text-gray-400">
        <svg class="w-8 h-8 animate-spin text-[#2E7D32]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span class="text-sm">Loading product...</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="card p-12 text-center">
      <p class="text-4xl mb-3">⚠️</p>
      <p class="text-gray-700 font-semibold">Failed to load product</p>
      <p class="text-gray-400 text-sm mt-1 mb-4">{{ error }}</p>
      <button @click="load" class="btn-primary text-sm px-6">Try Again</button>
    </div>

    <!-- Content -->
    <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ── Left column ──────────────────────────────────────── -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Images gallery -->
        <div class="card p-5">
          <div class="flex gap-4">
            <!-- Main image -->
            <div class="flex-1 aspect-square rounded-xl overflow-hidden bg-gray-100 max-w-sm">
              <img v-if="activeImage"
                   :src="activeImage"
                   class="w-full h-full object-cover"
                   :alt="product.name"/>
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
                📦
              </div>
            </div>
            <!-- Thumbs strip -->
            <div v-if="allImages.length > 1" class="flex flex-col gap-2 w-20">
              <button v-for="(img, i) in allImages" :key="i"
                      @click="activeImage = img.url"
                      :class="[
                                    'w-20 h-20 rounded-lg overflow-hidden border-2 transition shrink-0',
                                    activeImage === img.url
                                        ? 'border-[#4CAF50]'
                                        : 'border-transparent hover:border-gray-300'
                                ]">
                <img :src="img.url" class="w-full h-full object-cover" :alt="`Image ${i+1}`"/>
              </button>
            </div>
          </div>
        </div>

        <!-- Basic info -->
        <div class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Basic Information</h3>
          <div class="space-y-3 text-sm">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-400 text-xs mb-1">Product Name</p>
                <p class="text-gray-900 font-medium">{{ product.name }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-1">Type</p>
                <StatusBadge :value="product.type"/>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-400 text-xs mb-1">SKU</p>
                <p class="text-gray-900 font-mono">{{ product.sku || '—' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs mb-1">Slug</p>
                <p class="text-gray-500 font-mono text-xs break-all">{{ product.slug || '—' }}</p>
              </div>
            </div>
            <div v-if="product.short_description">
              <p class="text-gray-400 text-xs mb-1">Short Description</p>
              <p class="text-gray-700">{{ product.short_description }}</p>
            </div>
            <div v-if="product.description">
              <p class="text-gray-400 text-xs mb-1">Description</p>
              <div class="prose prose-sm max-w-none text-gray-700 border border-gray-100 rounded-lg p-3"
                   v-html="product.description"/>
            </div>
          </div>
        </div>

        <!-- Pricing & Inventory -->
        <div v-if="product.type !== 'affiliate'" class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Pricing & Inventory</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-green-50 rounded-xl p-3">
              <p class="text-xs text-green-600 mb-1">Current Price</p>
              <p class="text-green-800 font-bold text-lg">৳{{ Number(product.current_price).toLocaleString() }}</p>
            </div>
            <div v-if="product.sale_price" class="bg-orange-50 rounded-xl p-3">
              <p class="text-xs text-orange-500 mb-1">Regular Price</p>
              <p class="text-orange-700 font-semibold line-through">৳{{ Number(product.price).toLocaleString() }}</p>
            </div>
            <div v-else class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-1">Regular Price</p>
              <p class="text-gray-700 font-semibold">৳{{ Number(product.price).toLocaleString() }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-1">Stock</p>
              <p :class="product.stock_quantity <= 5 ? 'text-red-600' : 'text-gray-700'"
                 class="font-bold text-lg">
                {{ product.stock_quantity }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-1">Stock Status</p>
              <StatusBadge :value="product.stock_status"/>
            </div>
          </div>
          <div v-if="product.is_on_sale"
               class="mt-3 inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            🔥 On Sale — {{ product.discount_percentage }}% off
          </div>
        </div>

        <!-- Affiliate info -->
        <div v-if="product.type === 'affiliate'" class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Affiliate Details</h3>
          <div class="space-y-3 text-sm">
            <div>
              <p class="text-gray-400 text-xs mb-1">Display Price</p>
              <p class="text-gray-900 font-bold text-lg">৳{{ Number(product.price).toLocaleString() }}</p>
            </div>
            <div v-if="product.affiliate_link">
              <p class="text-gray-400 text-xs mb-1">Affiliate Link</p>
              <a :href="product.affiliate_link" target="_blank"
                 class="text-[#4CAF50] hover:underline break-all text-xs">
                {{ product.affiliate_link }}
              </a>
            </div>
            <div v-if="product.source_platform">
              <p class="text-gray-400 text-xs mb-1">Platform</p>
              <p class="text-gray-700">{{ product.source_platform }}</p>
            </div>
          </div>
        </div>

        <!-- Attributes & Variants (variable) -->
        <div v-if="product.type === 'variable' && product.attributes?.length" class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Attributes</h3>
          <div class="space-y-3">
            <div v-for="attr in product.attributes" :key="attr.id">
              <p class="text-xs text-gray-400 mb-2">{{ attr.name }}</p>
              <div class="flex flex-wrap gap-2">
                                <span v-for="val in attr.values" :key="val.id"
                                      class="inline-flex items-center gap-1.5 bg-green-50 text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full">
                                    <span v-if="val.color_code"
                                          :style="{ background: val.color_code }"
                                          class="w-3 h-3 rounded-full inline-block border border-white"/>
                                    {{ val.value }}
                                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="product.type === 'variable' && product.variants?.length" class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Variants
            <span class="text-gray-400 font-normal text-sm ml-1">({{ product.variants.length }})</span>
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
              <tr class="bg-gray-50">
                <th class="table-header">Combination</th>
                <th class="table-header">Price</th>
                <th class="table-header">Stock</th>
                <th class="table-header">SKU</th>
                <th class="table-header">Status</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="variant in product.variants" :key="variant.id"
                  class="border-b border-gray-100">
                <td class="table-cell text-xs text-gray-600">
                  {{ Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ') }}
                </td>
                <td class="table-cell font-semibold">৳{{ Number(variant.current_price).toLocaleString() }}</td>
                <td class="table-cell">
                                        <span
                                            :class="variant.stock_quantity <= 5 ? 'text-red-600 font-bold' : 'text-gray-700'">
                                            {{ variant.stock_quantity }}
                                        </span>
                </td>
                <td class="table-cell font-mono text-xs text-gray-500">{{ variant.sku || '—' }}</td>
                <td class="table-cell">
                  <StatusBadge :value="variant.is_in_stock ? 'active' : 'inactive'"/>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Reviews -->
        <div v-if="product.reviews?.length" class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">
            Reviews
            <span class="text-gray-400 font-normal text-sm ml-1">({{ product.reviews.length }})</span>
          </h3>
          <div class="space-y-4">
            <div v-for="review in product.reviews" :key="review.id"
                 class="border border-gray-100 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div
                      class="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-xs font-bold">
                    {{ review.user?.name?.[0]?.toUpperCase() || 'U' }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">{{ review.user?.name || 'Anonymous' }}</p>
                    <p class="text-xs text-gray-400">{{ formatDate(review.created_at) }}</p>
                  </div>
                </div>
                <div class="flex gap-0.5">
                                    <span v-for="s in 5" :key="s"
                                          :class="s <= review.rating ? 'text-yellow-400' : 'text-gray-200'"
                                          class="text-sm">★</span>
                </div>
              </div>
              <p class="text-sm text-gray-600">{{ review.comment }}</p>
            </div>
          </div>
        </div>

        <!-- SEO -->
        <div v-if="product.meta_title || product.meta_description || product.meta_keywords" class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">SEO</h3>
          <div class="space-y-3 text-sm">
            <div v-if="product.meta_title">
              <p class="text-gray-400 text-xs mb-1">Meta Title</p>
              <p class="text-gray-700">{{ product.meta_title }}</p>
            </div>
            <div v-if="product.meta_description">
              <p class="text-gray-400 text-xs mb-1">Meta Description</p>
              <p class="text-gray-700">{{ product.meta_description }}</p>
            </div>
            <div v-if="product.meta_keywords">
              <p class="text-gray-400 text-xs mb-1">Meta Keywords</p>
              <p class="text-gray-500 font-mono text-xs">{{ product.meta_keywords }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Right column (sidebar) ───────────────────────────── -->
      <div class="space-y-5">

        <!-- Status card -->
        <div class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Status</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Publish Status</span>
              <StatusBadge :value="product.status"/>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Featured</span>
              <span :class="product.is_featured ? 'text-[#2E7D32]' : 'text-gray-300'" class="text-lg">★</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">New</span>
              <span :class="product.is_new ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full">
                                {{ product.is_new ? 'New' : 'No' }}
                            </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Bestseller</span>
              <span :class="product.is_bestseller ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full">
                                {{ product.is_bestseller ? 'Yes' : 'No' }}
                            </span>
            </div>
          </div>
        </div>

        <!-- Stats card -->
        <div class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Statistics</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Total Sold</span>
              <span class="text-sm font-bold text-gray-900">{{ product.total_sold || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Reviews</span>
              <span class="text-sm font-bold text-gray-900">{{ product.total_reviews || 0 }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Avg. Rating</span>
              <div class="flex items-center gap-1">
                <span class="text-yellow-400 text-sm">★</span>
                <span class="text-sm font-bold text-gray-900">
                                    {{ product.average_rating ? Number(product.average_rating).toFixed(1) : '—' }}
                                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Organization -->
        <div class="card p-5">
          <h3 class="font-bold text-gray-900 mb-4">Organization</h3>
          <div class="space-y-3 text-sm">
            <div>
              <p class="text-gray-400 text-xs mb-1">Category</p>
              <p class="text-gray-700 font-medium">{{ product.category?.name || 'None' }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs mb-1">Brand</p>
              <div class="flex items-center gap-2">
                <img v-if="product.brand?.logo_url" :src="product.brand.logo_url"
                     class="w-5 h-5 object-contain rounded"/>
                <p class="text-gray-700 font-medium">{{ product.brand?.name || 'None' }}</p>
              </div>
            </div>
            <div v-if="product.weight">
              <p class="text-gray-400 text-xs mb-1">Weight</p>
              <p class="text-gray-700">{{ product.weight }} {{ product.weight_unit || 'kg' }}</p>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="product.tags?.length" class="card p-5">
          <h3 class="font-bold text-gray-900 mb-3">Tags</h3>
          <div class="flex flex-wrap gap-2">
                        <span v-for="tag in product.tags" :key="tag"
                              class="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                            {{ tag }}
                        </span>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="card p-5">
          <h3 class="font-bold text-gray-900 mb-3">Timeline</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-400 text-xs">Created</span>
              <span class="text-gray-600 text-xs">{{ formatDate(product.created_at) }}</span>
            </div>
            <div v-if="product.published_at" class="flex items-center justify-between">
              <span class="text-gray-400 text-xs">Published</span>
              <span class="text-gray-600 text-xs">{{ formatDate(product.published_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="card p-5">
          <h3 class="font-bold text-gray-900 mb-3">Actions</h3>
          <div class="space-y-2">
            <router-link :to="`/products/${product.id}/edit`"
                         class="flex items-center gap-2 w-full text-sm text-[#2E7D32] hover:bg-green-50 px-3 py-2 rounded-lg transition">
              <PencilSquareIcon class="w-4 h-4"/>
              Edit Product
            </router-link>
            <button @click="confirmDelete(product)"
                    class="flex items-center gap-2 w-full text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
              <TrashIcon class="w-4 h-4"/>
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <ConfirmModal
        :show="!!deleteTarget"
        title="Delete Product"
        :message="`Delete '${deleteTarget?.name}'? This cannot be undone.`"
        :loading="deleting"
        @confirm="doDelete"
        @cancel="deleteTarget = null"/>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useToast} from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import {productApi} from '@/api'
import {PencilIcon, TrashIcon, PencilSquareIcon} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const activeImage = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)

// Merge thumbnail + gallery into one list for the image strip
const allImages = computed(() => {
  const imgs = []
  if (product.value?.thumbnail_url) {
    imgs.push({url: product.value.thumbnail_url, is_primary: true})
  }
  product.value?.images?.forEach(img => {
    if (img.url !== product.value?.thumbnail_url) {
      imgs.push({url: img.url, is_primary: img.is_primary})
    }
  })
  return imgs
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await productApi.show(route.params.id)
    product.value = res.data.data

    // Set first image as active
    const primary = product.value?.images?.find(i => i.is_primary)
    activeImage.value = primary?.url
        || product.value?.thumbnail_url
        || product.value?.images?.[0]?.url
        || null
  } catch (e) {
    error.value = e.response?.data?.message || 'Something went wrong.'
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
    router.push('/products')
  } catch {
    toast.error('Failed to delete product.')
  } finally {
    deleting.value = false
    deleteTarget.value = null
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(load)
</script>