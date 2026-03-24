<template>
  <div class="w-full">
    <PageHeader :title="isEdit ? 'Edit Product' : 'Add Product'"
                :subtitle="isEdit ? `Editing: ${form.name}` : 'Create a new product'">
      <button
          @click="$router.push('/products')"
          class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-[#4CAF50] hover:text-[#4CAF50] transition"
      >
        ← Back
      </button>
    </PageHeader>

    <form @submit.prevent="save" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <!-- Left column: Main info -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Basic Info -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div class="space-y-4">
              <div>
                <label class="label">Product Name *</label>
                <input v-model="form.name" class="input" placeholder="Enter product name"/>
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Product Type *</label>
                  <select v-model="form.type" class="input">
                    <option value="simple">Simple</option>
                    <option value="variable">Variable</option>
                    <option value="affiliate">Affiliate</option>
                  </select>
                  <p v-if="errors.type" class="text-red-500 text-xs mt-1">{{ errors.type[0] }}</p>
                </div>
                <div>
                  <label class="label">SKU</label>
                  <input v-model="form.sku" class="input" placeholder="e.g. PROD-001"/>
                  <p v-if="errors.sku" class="text-red-500 text-xs mt-1">{{ errors.sku[0] }}</p>
                </div>
              </div>
              <div>
                <label class="label">Short Description</label>
                <textarea v-model="form.short_description" rows="2" class="input"
                          placeholder="Brief product summary..."/>
                <p v-if="errors.short_description" class="text-red-500 text-xs mt-1">{{
                    errors.short_description[0]
                  }}</p>
              </div>

              <!-- Full Description — Quill Rich Text Editor -->
              <div>
                <label class="label">Full Description</label>
                <div class="quill-wrapper" :class="{ 'quill-error': errors.description }">
                  <QuillEditor
                      v-model:content="form.description"
                      content-type="html"
                      :options="quillOptions"
                      theme="snow"
                      placeholder="Detailed product description..."
                  />
                </div>
                <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description[0] }}</p>
              </div>
            </div>
          </div>

          <!-- Pricing (simple/affiliate) -->
          <div v-if="form.type !== 'variable'" class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">{{ form.type === 'affiliate' ? 'Display Price' : 'Pricing' }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="label">{{ form.type === 'affiliate' ? 'Display Price' : 'Regular Price *' }}</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                  <input v-model.number="form.price" type="number" min="0" step="0.01" class="input pl-7"
                         placeholder="0.00"/>
                </div>
                <p v-if="errors.price" class="text-red-500 text-xs mt-1">{{ errors.price[0] }}</p>
              </div>
              <div v-if="form.type === 'simple'">
                <label class="label">Sale Price</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                  <input v-model.number="form.sale_price" type="number" min="0" step="0.01" class="input pl-7"
                         placeholder="0.00"/>
                </div>
                <p v-if="errors.sale_price" class="text-red-500 text-xs mt-1">{{ errors.sale_price[0] }}</p>
              </div>
              <div v-if="form.type === 'simple'">
                <label class="label">Cost Price</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                  <input v-model.number="form.cost_price" type="number" min="0" step="0.01" class="input pl-7"
                         placeholder="0.00"/>
                </div>
                <p v-if="errors.cost_price" class="text-red-500 text-xs mt-1">{{ errors.cost_price[0] }}</p>
              </div>
            </div>
            <!-- Affiliate link -->
            <div v-if="form.type === 'affiliate'" class="mt-4">
              <label class="label">Affiliate Link *</label>
              <input v-model="form.affiliate_link" class="input" placeholder="https://amazon.com/..."/>
              <p v-if="errors.affiliate_link" class="text-red-500 text-xs mt-1">{{ errors.affiliate_link[0] }}</p>
              <div class="mt-3">
                <label class="label">Source Platform</label>
                <input v-model="form.source_platform" class="input" placeholder="Amazon, Daraz, etc."/>
                <p v-if="errors.source_platform" class="text-red-500 text-xs mt-1">{{ errors.source_platform[0] }}</p>
              </div>
            </div>
          </div>

          <!-- Inventory (simple) -->
          <div v-if="form.type === 'simple'" class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Inventory</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Stock Quantity</label>
                <input v-model.number="form.stock_quantity" type="number" min="0" class="input"/>
                <p v-if="errors.stock_quantity" class="text-red-500 text-xs mt-1">{{ errors.stock_quantity[0] }}</p>
              </div>
              <div>
                <label class="label">Low Stock Alert At</label>
                <input v-model.number="form.low_stock_threshold" type="number" min="0" class="input"/>
                <p v-if="errors.low_stock_threshold" class="text-red-500 text-xs mt-1">{{
                    errors.low_stock_threshold[0]
                  }}</p>
              </div>
            </div>
            <label class="flex items-center gap-2 mt-3 text-sm cursor-pointer">
              <input type="checkbox" v-model="form.manage_stock" class="accent-[#2E7D32]"/>
              <span>Manage stock quantity</span>
            </label>
            <p v-if="errors.manage_stock" class="text-red-500 text-xs mt-1">{{ errors.manage_stock[0] }}</p>
          </div>

          <!-- Variable: Attributes & Variants -->
          <div v-if="form.type === 'variable'" class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-gray-900">Attributes & Variants</h3>
              <button type="button" @click="addAttribute" class="btn-secondary text-xs py-1.5 px-3">+ Add Attribute
              </button>
            </div>
            <p v-if="errors.attributes" class="text-red-500 text-xs mb-3">{{ errors.attributes[0] }}</p>
            <div v-for="(attr, ai) in form.attributes" :key="ai" class="border border-gray-200 rounded-xl p-4 mb-3">
              <div class="flex items-center gap-3 mb-3">
                <input v-model="attr.name" class="input flex-1" placeholder="Attribute name (e.g. Size, Color)"/>
                <button type="button" @click="form.attributes.splice(ai,1)" class="text-red-400 hover:text-red-600 p-1">
                  <TrashIcon class="w-4 h-4"/>
                </button>
              </div>
              <div class="flex flex-wrap gap-2 mb-2">
                <span v-for="(val, vi) in attr.values" :key="vi"
                      class="inline-flex items-center gap-1.5 bg-green-pale text-[#2E7D32] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {{ val.value }}
                  <button type="button" @click="attr.values.splice(vi,1)" class="hover:text-red-500 ml-0.5">×</button>
                </span>
              </div>
              <div class="flex gap-2">
                <input v-model="newAttrValues[ai]" @keyup.enter="addAttrValue(ai)" class="input-sm flex-1"
                       placeholder="Add value (press Enter)"/>
                <button type="button" @click="addAttrValue(ai)" class="btn-primary text-xs py-1.5 px-3">Add</button>
              </div>
            </div>
            <!-- Variants table -->
            <div v-if="form.variants && form.variants.length" class="mt-4">
              <h4 class="text-sm font-bold text-gray-700 mb-3">Variants</h4>
              <p v-if="errors.variants" class="text-red-500 text-xs mb-2">{{ errors.variants[0] }}</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                  <tr class="bg-gray-50">
                    <th class="table-header">Combination</th>
                    <th class="table-header">Price</th>
                    <th class="table-header">Stock</th>
                    <th class="table-header">SKU</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(variant, vi) in form.variants" :key="vi" class="border-b border-gray-100">
                    <td class="table-cell text-xs text-gray-600">
                      {{ Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(', ') }}
                    </td>
                    <td class="table-cell">
                      <input v-model.number="variant.price" type="number" class="input-sm w-24"/>
                    </td>
                    <td class="table-cell">
                      <input v-model.number="variant.stock_quantity" type="number" class="input-sm w-20"/>
                    </td>
                    <td class="table-cell">
                      <input v-model="variant.sku" class="input-sm w-28" placeholder="SKU"/>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <button type="button" @click="generateVariants" class="mt-3 btn-secondary text-xs py-1.5">↺ Regenerate
                Variants
              </button>
            </div>
            <button v-else type="button" @click="generateVariants" class="mt-4 btn-primary text-sm">Generate Variants
            </button>
          </div>

          <!-- SEO -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">SEO</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Meta Title</label>
                <input v-model="form.meta_title" class="input"/>
                <p v-if="errors.meta_title" class="text-red-500 text-xs mt-1">{{ errors.meta_title[0] }}</p>
              </div>
              <div>
                <label class="label">Meta Description</label>
                <textarea v-model="form.meta_description" rows="2" class="input"/>
                <p v-if="errors.meta_description" class="text-red-500 text-xs mt-1">{{ errors.meta_description[0] }}</p>
              </div>
              <div>
                <label class="label">Meta Keywords</label>
                <input v-model="form.meta_keywords" class="input"/>
                <p v-if="errors.meta_keywords" class="text-red-500 text-xs mt-1">{{ errors.meta_keywords[0] }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: Sidebar -->
        <div class="space-y-5">
          <!-- Status & Visibility -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Status</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Publish Status</label>
                <select v-model="form.status" class="input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
                <p v-if="errors.status" class="text-red-500 text-xs mt-1">{{ errors.status[0] }}</p>
              </div>
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" v-model="form.is_featured" class="accent-[#2E7D32]"/> Featured Product
                </label>
                <p v-if="errors.is_featured" class="text-red-500 text-xs">{{ errors.is_featured[0] }}</p>
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" v-model="form.is_new" class="accent-[#2E7D32]"/> Mark as New
                </label>
                <p v-if="errors.is_new" class="text-red-500 text-xs">{{ errors.is_new[0] }}</p>
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" v-model="form.is_bestseller" class="accent-[#2E7D32]"/> Bestseller
                </label>
                <p v-if="errors.is_bestseller" class="text-red-500 text-xs">{{ errors.is_bestseller[0] }}</p>
              </div>
            </div>
          </div>

          <!-- Thumbnail -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Thumbnail</h3>
            <div v-if="thumbnailPreview || form.thumbnail_url" class="mb-3">
              <img :src="thumbnailPreview || form.thumbnail_url"
                   class="w-full aspect-square object-cover rounded-xl border border-gray-200"/>
            </div>
            <div
                class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-[#4CAF50] transition cursor-pointer"
                @click="$refs.thumbInput.click()">
              <PhotoIcon class="w-8 h-8 text-gray-300 mx-auto mb-2"/>
              <p class="text-xs text-gray-400 font-medium">Click to upload thumbnail</p>
              <p class="text-[11px] text-gray-300 mt-0.5">JPG, PNG, WebP (max 2MB)</p>
            </div>
            <input ref="thumbInput" type="file" accept="image/*" class="hidden" @change="onThumbChange"/>
            <p v-if="errors.thumbnail" class="text-red-500 text-xs mt-1">{{ errors.thumbnail[0] }}</p>
          </div>

          <!-- Category & Brand -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Organization</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Category</label>
                <select v-model.number="form.category_id" class="input">
                  <option :value="null">No Category</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
                <p v-if="errors.category_id" class="text-red-500 text-xs mt-1">{{ errors.category_id[0] }}</p>
              </div>
              <div>
                <label class="label">Brand</label>
                <select v-model.number="form.brand_id" class="input">
                  <option :value="null">No Brand</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                </select>
                <p v-if="errors.brand_id" class="text-red-500 text-xs mt-1">{{ errors.brand_id[0] }}</p>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="card p-5">
            <h3 class="font-bold text-gray-900 mb-4">Tags</h3>
            <div class="flex flex-wrap gap-2 mb-2">
              <span v-for="(tag, ti) in form.tags" :key="ti"
                    class="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                {{ tag }} <button type="button" @click="form.tags.splice(ti,1)" class="hover:text-red-500">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input v-model="newTag" @keyup.enter="addTag" class="input-sm flex-1" placeholder="Add tag, press Enter"/>
              <button type="button" @click="addTag" class="btn-primary text-xs py-1.5 px-3">+</button>
            </div>
            <p v-if="errors.tags" class="text-red-500 text-xs mt-1">{{ errors.tags[0] }}</p>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="btn-primary px-8 py-2.5">
          {{ saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
        </button>
        <button
            type="button"
            @click="$router.push('/products')"
            class="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:border-red-400 hover:text-red-500 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useToast} from 'vue-toastification'
import {QuillEditor} from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import PageHeader from '@/components/common/PageHeader.vue'
import {productApi, categoryApi, brandApi} from '@/api'
import {TrashIcon, PhotoIcon} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const isEdit = computed(() => !!route.params.id)

const saving = ref(false), errors = ref({})
const thumbnailPreview = ref(null), thumbnailFile = ref(null)
const categories = ref([]), brands = ref([])
const newTag = ref(''), newAttrValues = ref([])
const thumbInput = ref(null)

// Quill toolbar configuration
const quillOptions = {
  modules: {
    toolbar: [
      [{header: [1, 2, 3, false]}],
      ['bold', 'italic', 'underline', 'strike'],
      [{color: []}, {background: []}],
      [{list: 'ordered'}, {list: 'bullet'}],
      [{indent: '-1'}, {indent: '+1'}],
      [{align: []}],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  },
}

const form = reactive({
  name: '', type: 'simple', sku: '', status: 'active',
  price: null, sale_price: null, cost_price: null,
  stock_quantity: 0, low_stock_threshold: 5, manage_stock: true,
  short_description: '', description: '',
  category_id: null, brand_id: null,
  is_featured: false, is_new: false, is_bestseller: false,
  meta_title: '', meta_description: '', meta_keywords: '',
  thumbnail_url: '', tags: [], attributes: [], variants: [],
  affiliate_link: '', source_platform: '',
})

function onThumbChange(e) {
  const f = e.target.files[0]
  if (!f) return
  thumbnailFile.value = f
  thumbnailPreview.value = URL.createObjectURL(f)
}

function addTag() {
  if (newTag.value.trim()) {
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

function addAttribute() {
  form.attributes.push({name: '', values: []})
  newAttrValues.value.push('')
}

function addAttrValue(ai) {
  const v = newAttrValues.value[ai]?.trim()
  if (v) {
    form.attributes[ai].values.push({value: v})
    newAttrValues.value[ai] = ''
  }
}

function generateVariants() {
  const attrs = form.attributes.filter(a => a.values.length)
  if (!attrs.length) return
  const combos = attrs.reduce((acc, attr) =>
      acc.flatMap(combo => attr.values.map(val => ({...combo, [attr.name]: val.value}))), [{}])
  form.variants = combos.map(attrs => ({
    attributes: attrs,
    price: form.price || 0,
    stock_quantity: 0,
    sku: '',
    sale_price: null,
  }))
}

async function save() {
  saving.value = true
  errors.value = {}
  try {
    // Step 1: Upload thumbnail separately if changed
    let thumbnailUrl = form.thumbnail_url
    if (thumbnailFile.value) {
      const fd = new FormData()
      fd.append('thumbnail', thumbnailFile.value)
      const uploadRes = await productApi.uploadThumbnail(fd)
      thumbnailUrl = uploadRes.data.url
    }

    // Step 2: Send JSON — booleans, arrays, objects all preserved
    const payload = {...form, thumbnail_url: thumbnailUrl}

    if (isEdit.value) {
      await productApi.update(route.params.id, payload)
      toast.success('Product updated.')
    } else {
      await productApi.store(payload)
      toast.success('Product created.')
    }
    router.push('/products')
  } catch (e) {
    errors.value = e.response?.data?.errors || {}
    toast.error(e.response?.data?.message || 'Save failed.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [catRes, brandRes] = await Promise.allSettled([categoryApi.list(), brandApi.list()])
  if (catRes.status === 'fulfilled') categories.value = catRes.value.data.data || []
  if (brandRes.status === 'fulfilled') brands.value = brandRes.value.data.data || []

  if (isEdit.value) {
    const res = await productApi.show(route.params.id)
    const p = res.data.data
    Object.keys(form).forEach(k => {
      if (p[k] !== undefined) form[k] = p[k]
    })
    form.tags = p.tags || []
    form.attributes = p.attributes?.map(a => ({name: a.name, values: a.values || []})) || []
    form.variants = p.variants || []
  }
})
</script>

<style>
/* Quill editor custom styling to match your design system */
.quill-wrapper .ql-toolbar {
  border-radius: 0.5rem 0.5rem 0 0;
  border-color: #e5e7eb;
  background-color: #f9fafb;
  padding: 8px 10px;
  flex-wrap: wrap;
  gap: 2px;
}

.quill-wrapper .ql-container {
  border-radius: 0 0 0.5rem 0.5rem;
  border-color: #e5e7eb;
  font-size: 0.9rem;
  font-family: inherit;
  min-height: 200px;
}

.quill-wrapper .ql-editor {
  min-height: 200px;
  padding: 12px 14px;
  line-height: 1.7;
  color: #111827;
}

.quill-wrapper .ql-editor.ql-blank::before {
  color: #9ca3af;
  font-style: normal;
}

/* Focus ring — match your input focus style */
.quill-wrapper .ql-container.ql-snow:focus-within {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.12);
}

/* Error state */
.quill-wrapper.quill-error .ql-toolbar,
.quill-wrapper.quill-error .ql-container {
  border-color: #ef4444;
}

/* Toolbar button hover */
.quill-wrapper .ql-toolbar button:hover,
.quill-wrapper .ql-toolbar button.ql-active {
  color: #2E7D32;
}

.quill-wrapper .ql-toolbar button:hover .ql-stroke,
.quill-wrapper .ql-toolbar button.ql-active .ql-stroke {
  stroke: #2E7D32;
}

.quill-wrapper .ql-toolbar button:hover .ql-fill,
.quill-wrapper .ql-toolbar button.ql-active .ql-fill {
  fill: #2E7D32;
}

.quill-wrapper .ql-toolbar .ql-picker-label:hover,
.quill-wrapper .ql-toolbar .ql-picker-item:hover {
  color: #2E7D32;
}
</style>