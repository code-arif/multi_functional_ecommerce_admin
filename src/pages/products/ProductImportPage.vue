<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <PageHeader title="Import Products" subtitle="Bulk upload products from CSV or Excel spreadsheet">
      <router-link to="/products" class="btn-ghost text-xs gap-1.5 px-3">
        <ArrowLeftIcon class="w-4 h-4" />
        Back to Products
      </router-link>
    </PageHeader>

    <!-- Step Indicator -->
    <div class="flex items-center gap-2 sm:gap-4 px-1 mb-2">
      <div
        v-for="(step, si) in steps"
        :key="si"
        class="flex items-center gap-2"
        :class="currentStep >= si ? 'text-[#2E7D32]' : 'text-gray-400'"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
          :class="[
            currentStep > si
              ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
              : currentStep === si
                ? 'border-[#2E7D32] bg-green-50 text-[#2E7D32]'
                : 'border-gray-300 bg-white text-gray-400'
          ]"
        >
          <CheckIcon v-if="currentStep > si" class="w-4 h-4" />
          <span v-else>{{ si + 1 }}</span>
        </div>
        <span class="text-xs font-semibold hidden sm:inline whitespace-nowrap">{{ step }}</span>
        <ChevronRightIcon v-if="si < steps.length - 1" class="w-3.5 h-3.5 text-gray-300" />
      </div>
    </div>

    <!-- ─── STEP 1: UPLOAD FILE ─── -->
    <div v-if="currentStep === 0" class="card p-8">
      <div
        class="relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300"
        :class="[
          dragOver
            ? 'border-[#2E7D32] bg-green-50 scale-[1.01]'
            : fileSelected
              ? 'border-[#4CAF50] bg-green-50/50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
        ]"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
        @click="$refs.fileInput.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          class="hidden"
          @change="onFileChange"
        />

        <template v-if="!fileSelected">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#2E7D32]/10 flex items-center justify-center">
            <Upload class="w-7 h-7 text-[#2E7D32]" />
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Upload Spreadsheet</h3>
          <p class="text-sm text-gray-500 mb-4">
            Drag & drop your file here, or <span class="text-[#2E7D32] font-semibold underline underline-offset-2 cursor-pointer">browse</span>
          </p>
          <div class="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5" /> CSV
            </span>
            <span class="flex items-center gap-1.5">
              <FileSpreadsheet class="w-3.5 h-3.5" /> XLSX / XLS
            </span>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center justify-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center">
              <FileSpreadsheet class="w-6 h-6 text-[#2E7D32]" />
            </div>
            <div class="text-left">
              <p class="font-semibold text-gray-800 text-sm">{{ fileName }}</p>
              <p class="text-xs text-gray-400">{{ fileSize }} — {{ parsedData.length }} rows detected</p>
            </div>
            <button
              @click.stop="clearFile"
              class="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Remove file"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
      </div>

      <!-- Template Download -->
      <div class="mt-5 flex items-center justify-between">
        <button @click="downloadTemplate" class="text-xs text-[#2E7D32] font-semibold hover:underline flex items-center gap-1.5">
          <ArrowDownTrayIcon class="w-3.5 h-3.5" />
          Download Sample Template
        </button>
        <button
          v-if="fileSelected"
          @click="currentStep = 1"
          class="btn-primary px-6 py-2 text-sm"
        >
          Continue →
        </button>
      </div>
    </div>

    <!-- ─── STEP 2: COLUMN MAPPING ─── -->
    <div v-if="currentStep === 1" class="card p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="font-bold text-gray-900">Map Columns</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Match your spreadsheet columns to product fields. Auto-detected mappings are pre-selected.
          </p>
        </div>
        <button @click="autoMapAll" class="text-xs text-[#2E7D32] font-semibold hover:underline flex items-center gap-1">
          <ArrowPathIcon class="w-3.5 h-3.5" />
          Auto-detect
        </button>
      </div>

      <div class="grid gap-3">
        <div
          v-for="(field, fi) in productFields"
          :key="fi"
          class="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl transition"
          :class="field.mappedTo ? 'bg-green-50/50' : 'bg-gray-50/50'"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-700">{{ field.label }}</span>
              <span v-if="field.required" class="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Required</span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5">{{ field.description }}</p>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select
              v-model="field.mappedTo"
              class="input-sm min-w-[160px] sm:min-w-[180px] text-xs"
            >
              <option value="">— Skip this column —</option>
              <option
                v-for="(header, hi) in sheetHeaders"
                :key="hi"
                :value="header"
              >{{ header }}</option>
            </select>
            <span v-if="field.mappedTo" class="text-green-600 shrink-0">
              <CheckIcon class="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <button @click="currentStep = 0" class="btn-ghost text-sm">← Back</button>
        <button
          @click="currentStep = 2"
          :disabled="!hasRequiredMappings"
          class="btn-primary px-6 py-2 text-sm"
          :class="{ 'opacity-40 cursor-not-allowed': !hasRequiredMappings }"
        >
          Preview {{ filteredData.length }} Rows →
        </button>
      </div>
    </div>

    <!-- ─── STEP 3: PREVIEW ─── -->
    <div v-if="currentStep === 2" class="card overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-gray-900">Preview Import</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Showing first {{ Math.min(filteredData.length, 20) }} of {{ filteredData.length }} rows
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
            {{ validCount }} valid · {{ invalidCount }} issues
          </span>
        </div>
      </div>

      <div class="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50/80 sticky top-0">
            <tr>
              <th class="table-header w-10">#</th>
              <th
                v-for="col in mappedColumns"
                :key="col"
                class="table-header text-xs whitespace-nowrap"
              >{{ col }}</th>
              <th class="table-header w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, ri) in previewRows"
              :key="ri"
              class="table-row"
              :class="{ 'bg-red-50/50': row._errors?.length }"
            >
              <td class="table-cell text-xs text-gray-400">{{ ri + 1 }}</td>
              <td
                v-for="col in mappedColumns"
                :key="col"
                class="table-cell text-xs whitespace-nowrap max-w-[200px] truncate"
                :title="row[col]"
              >{{ row[col] ?? '-' }}</td>
              <td class="table-cell">
                <span
                  v-if="row._errors?.length"
                  class="inline-flex items-center gap-1 text-red-500 text-xs"
                  :title="row._errors.join(', ')"
                >
                  <ExclamationCircleIcon class="w-3.5 h-3.5" />
                  {{ row._errors.length }} error(s)
                </span>
                <span v-else class="inline-flex items-center gap-1 text-green-600 text-xs">
                  <CheckCircleIcon class="w-3.5 h-3.5" />
                  OK
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div class="flex items-center gap-3">
          <button @click="currentStep = 1" class="btn-ghost text-sm">← Back to Mapping</button>
          <button
            v-if="filteredData.length > 20"
            @click="showAllRows = !showAllRows"
            class="text-xs text-[#2E7D32] font-semibold hover:underline"
          >
            {{ showAllRows ? 'Show fewer rows' : `Show all ${filteredData.length} rows` }}
          </button>
        </div>
        <button
          @click="startImport"
          :disabled="importing || validCount === 0"
          class="btn-primary px-6 py-2 text-sm"
          :class="{ 'opacity-40 cursor-not-allowed': importing || validCount === 0 }"
        >
          <ArrowPathIcon v-if="importing" class="w-4 h-4 animate-spin" />
          {{ importing ? `Importing ${importProgress}...` : `Import ${validCount} Products` }}
        </button>
      </div>
    </div>

    <!-- ─── IMPORT PROGRESS ─── -->
    <div v-if="importing" class="card p-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-gray-900">Importing Products...</h3>
        <span class="text-sm font-semibold text-[#2E7D32]">{{ importProgress }}%</span>
      </div>
      <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :class="importProgress < 100 ? 'bg-[#4CAF50]' : 'bg-green-500'"
          :style="{ width: `${importProgress}%` }"
        />
      </div>
      <p class="text-xs text-gray-500 mt-2">
        Imported {{ importCount }} / {{ validCount }} products...
      </p>
    </div>

    <!-- ─── IMPORT RESULTS ─── -->
    <div v-if="showResults" class="space-y-4">
      <!-- Success -->
      <div class="card p-6" :class="importSummary.errors === 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-amber-500'">
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            :class="importSummary.errors === 0 ? 'bg-green-100' : 'bg-amber-100'"
          >
            <CheckCircleIcon v-if="importSummary.errors === 0" class="w-6 h-6 text-green-600" />
            <ExclamationTriangleIcon v-else class="w-6 h-6 text-amber-600" />
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-gray-900 text-lg">
              {{ importSummary.errors === 0 ? 'Import Complete!' : 'Import Completed with Warnings' }}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div class="text-center p-3 bg-green-50 rounded-xl">
                <p class="text-2xl font-black text-green-700">{{ importSummary.created }}</p>
                <p class="text-xs text-green-600 font-medium">Created</p>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-xl">
                <p class="text-2xl font-black text-blue-700">{{ importSummary.updated }}</p>
                <p class="text-xs text-blue-600 font-medium">Updated</p>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-xl">
                <p class="text-2xl font-black text-red-700">{{ importSummary.errors }}</p>
                <p class="text-xs text-red-600 font-medium">Errors</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-xl">
                <p class="text-2xl font-black text-gray-700">{{ importSummary.skipped }}</p>
                <p class="text-xs text-gray-600 font-medium">Skipped</p>
              </div>
            </div>

            <!-- Error details -->
            <div v-if="importSummary.errorDetails?.length" class="mt-4">
              <button
                @click="showErrorDetails = !showErrorDetails"
                class="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
              >
                <ChevronDownIcon v-if="!showErrorDetails" class="w-3.5 h-3.5" />
                <ChevronUpIcon v-else class="w-3.5 h-3.5" />
                View {{ importSummary.errorDetails.length }} error(s)
              </button>
              <div v-if="showErrorDetails" class="mt-2 space-y-1.5">
                <div
                  v-for="(err, ei) in importSummary.errorDetails"
                  :key="ei"
                  class="flex items-start gap-2 text-xs p-2 bg-red-50 rounded-lg"
                >
                  <XCircleIcon class="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span class="font-medium text-red-700">Row {{ err.row }}:</span>
                    <span class="text-red-600"> {{ err.message }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <router-link to="/products" class="btn-primary px-5 py-2 text-sm">
                View All Products
              </router-link>
              <button @click="resetAll" class="btn-ghost text-sm">
                Import Another File
              </button>
              <button
                v-if="importSummary.errors > 0"
                @click="exportErrors"
                class="btn-ghost text-sm gap-1.5"
              >
                <Download class="w-4 h-4" />
                Export Errors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import PageHeader from '@/components/common/PageHeader.vue'
import { productApi } from '@/api'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import {
  Upload,
  FileText,
  FileSpreadsheet,
  CheckIcon,
  Download,
  XCircleIcon,
} from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

// ─── State ────────────────────────────────────────
const steps = ['Upload File', 'Map Columns', 'Preview & Import']
const currentStep = ref(0)

const dragOver = ref(false)
const rawFile = ref(null)
const parsedData = ref([])
const sheetHeaders = ref([])
const showAllRows = ref(false)
const importing = ref(false)
const importProgress = ref(0)
const importCount = ref(0)
const showResults = ref(false)
const showErrorDetails = ref(false)

const importSummary = ref({
  created: 0,
  updated: 0,
  errors: 0,
  skipped: 0,
  errorDetails: [],
})

// ─── Computed ────────────────────────────────────
const fileSelected = computed(() => !!rawFile.value)

const fileName = computed(() => rawFile.value?.name || '')

const fileSize = computed(() => {
  if (!rawFile.value) return ''
  const bytes = rawFile.value.size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

// Product fields for column mapping
const productFields = ref([
  { key: 'name', label: 'Product Name', description: 'Required. Unique product title', required: true, mappedTo: '' },
  { key: 'sku', label: 'SKU', description: 'Unique stock keeping unit code', required: false, mappedTo: '' },
  { key: 'type', label: 'Product Type', description: 'simple, variable, or affiliate', required: false, mappedTo: '' },
  { key: 'price', label: 'Price', description: 'Regular price (number)', required: false, mappedTo: '' },
  { key: 'sale_price', label: 'Sale Price', description: 'Discounted price (number)', required: false, mappedTo: '' },
  { key: 'stock_quantity', label: 'Stock Quantity', description: 'Inventory count (integer)', required: false, mappedTo: '' },
  { key: 'status', label: 'Status', description: 'active, inactive, or draft', required: false, mappedTo: '' },
  { key: 'category', label: 'Category', description: 'Category name (will auto-create)', required: false, mappedTo: '' },
  { key: 'brand', label: 'Brand', description: 'Brand name (will auto-create)', required: false, mappedTo: '' },
  { key: 'short_description', label: 'Short Description', description: 'Brief product summary', required: false, mappedTo: '' },
  { key: 'description', label: 'Full Description', description: 'Detailed product HTML/text', required: false, mappedTo: '' },
  { key: 'tags', label: 'Tags', description: 'Comma-separated or pipe-separated', required: false, mappedTo: '' },
  { key: 'weight', label: 'Weight', description: 'Product weight (number)', required: false, mappedTo: '' },
  { key: 'is_featured', label: 'Featured', description: 'yes/no, true/false, 1/0', required: false, mappedTo: '' },
])

const mappedColumns = computed(() => {
  return productFields.value.filter(f => f.mappedTo).map(f => f.label)
})

const hasRequiredMappings = computed(() => {
  return productFields.value.filter(f => f.required).some(f => f.mappedTo)
})

function getMappedValue(row, fieldKey) {
  const field = productFields.value.find(f => f.key === fieldKey)
  if (!field || !field.mappedTo) return undefined
  return row[field.mappedTo]
}

const filteredData = computed(() => {
  return parsedData.value.map((row, index) => {
    const mapped = {}
    productFields.value.forEach(field => {
      if (field.mappedTo) {
        mapped[field.key] = row[field.mappedTo] ?? ''
      }
    })
    // Validate
    const errors = []
    const name = mapped.name
    if (!name || !String(name).trim()) {
      errors.push('Product name is required')
    }
    if (mapped.price && isNaN(Number(mapped.price))) {
      errors.push('Price must be a number')
    }
    if (mapped.stock_quantity && isNaN(Number(mapped.stock_quantity))) {
      errors.push('Stock must be a number')
    }
    return { ...mapped, _originalIndex: index, _errors: errors }
  })
})

const validCount = computed(() => filteredData.value.filter(r => !r._errors.length).length)
const invalidCount = computed(() => filteredData.value.filter(r => r._errors.length).length)

const previewRows = computed(() => {
  return showAllRows.value ? filteredData.value : filteredData.value.slice(0, 20)
})

// ─── File Handling ───────────────────────────────

function onDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

function processFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (!['csv', 'xlsx', 'xls'].includes(ext)) {
    toast.error('Please upload a CSV or Excel (.xlsx / .xls) file.')
    return
  }
  rawFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array', raw: false })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

      if (!json.length) {
        toast.error('The file appears to be empty.')
        return
      }

      parsedData.value = json
      sheetHeaders.value = Object.keys(json[0])
      toast.success(`Parsed ${json.length} rows from "${file.name}"`)

      // Auto-map columns
      autoMapAll()
    } catch (err) {
      console.error('Parse error:', err)
      toast.error('Failed to parse file. Make sure it\'s a valid spreadsheet.')
    }
  }
  reader.readAsArrayBuffer(file)
}

function clearFile() {
  rawFile.value = null
  parsedData.value = []
  sheetHeaders.value = []
  productFields.value.forEach(f => { f.mappedTo = '' })
  currentStep.value = 0
}

function autoMapAll() {
  const headers = sheetHeaders.value.map(h => h.toLowerCase().trim())

  productFields.value.forEach(field => {
    const normalizedKey = field.key.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ')
    const headerVariants = [
      field.key,
      field.key.toLowerCase(),
      field.key.replace(/_/g, ' '),
      field.key.replace(/_/g, '-'),
      field.label,
      field.label.toLowerCase(),
    ]

    // Common aliases
    const aliases = {
      name: ['product name', 'product', 'title', 'item', 'item name'],
      sku: ['sku', 'sku code', 'product sku', 'code', 'item code'],
      type: ['type', 'product type', 'item type', 'kind'],
      price: ['price', 'regular price', 'unit price', 'amount', 'cost'],
      sale_price: ['sale price', 'sale', 'discount price', 'special price', 'offer price'],
      stock_quantity: ['stock', 'quantity', 'qty', 'inventory', 'stock qty', 'on hand'],
      status: ['status', 'product status', 'state', 'publish status'],
      category: ['category', 'categories', 'product category', 'cat'],
      brand: ['brand', 'brand name', 'manufacturer', 'make'],
      short_description: ['short description', 'summary', 'brief', 'excerpt'],
      description: ['description', 'full description', 'details', 'long description', 'body'],
      tags: ['tags', 'tag', 'keywords', 'labels'],
      weight: ['weight', 'product weight', 'mass'],
      is_featured: ['featured', 'is featured', 'feature', 'featured product', 'is_featured'],
    }

    const possibleMatches = [...headerVariants, ...(aliases[field.key] || [])]

    // Try exact match first (case-insensitive)
    let matched = headers.find(h => possibleMatches.some(p => h === p.toLowerCase()))

    // Try partial match if no exact match
    if (!matched) {
      matched = headers.find(h =>
        possibleMatches.some(p => h.includes(p) || p.includes(h))
      )
    }

    field.mappedTo = matched
      ? sheetHeaders.value[headers.indexOf(matched)]
      : ''
  })
}

// ─── Template ────────────────────────────────────

function downloadTemplate() {
  const templateData = [
    {
      'Product Name': 'Example Product 1',
      SKU: 'EX-001',
      Type: 'simple',
      Price: 99.99,
      'Sale Price': 79.99,
      'Stock Quantity': 100,
      Status: 'active',
      Category: 'Electronics',
      Brand: 'BrandName',
      'Short Description': 'A great product',
      'Full Description': 'Detailed description here',
      Tags: 'new,featured',
      Weight: 0.5,
      Featured: 'yes',
    },
    {
      'Product Name': 'Example Product 2',
      SKU: 'EX-002',
      Type: 'variable',
      Price: 149.99,
      'Sale Price': '',
      'Stock Quantity': 50,
      Status: 'active',
      Category: 'Clothing',
      Brand: 'FashionBrand',
      'Short Description': 'Another product',
      'Full Description': 'Details for product 2',
      Tags: 'sale',
      Weight: 0.3,
      Featured: 'no',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  XLSX.writeFile(wb, 'product-import-template.xlsx')
  toast.success('Template downloaded.')
}

// ─── Import ──────────────────────────────────────

async function startImport() {
  const validRows = filteredData.value.filter(r => !r._errors.length)
  if (!validRows.length) {
    toast.error('No valid rows to import.')
    return
  }

  importing.value = true
  importProgress.value = 0
  importCount.value = 0
  showResults.value = false
  showErrorDetails.value = false

  importSummary.value = {
    created: 0,
    updated: 0,
    errors: 0,
    skipped: 0,
    errorDetails: [],
  }

  const total = validRows.length
  const batchSize = 10

  for (let i = 0; i < total; i += batchSize) {
    const batch = validRows.slice(i, i + batchSize)

    try {
      const payload = {
        products: batch.map(row => ({
          name: String(row.name || '').trim(),
          sku: String(row.sku || '').trim(),
          type: String(row.type || 'simple').trim(),
          price: row.price ? Number(row.price) : null,
          sale_price: row.sale_price ? Number(row.sale_price) : null,
          stock_quantity: row.stock_quantity ? Number(row.stock_quantity) : 0,
          status: String(row.status || 'active').trim(),
          category: String(row.category || '').trim(),
          brand: String(row.brand || '').trim(),
          short_description: String(row.short_description || '').trim(),
          description: String(row.description || '').trim(),
          tags: String(row.tags || ''),
          weight: row.weight ? Number(row.weight) : null,
          is_featured: ['yes', 'true', '1', 'y'].includes(String(row.is_featured).toLowerCase().trim()),
        })),
        batch_index: Math.floor(i / batchSize),
        total_batches: Math.ceil(total / batchSize),
      }

      await productApi.import(payload)
      importSummary.value.created += batch.length
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error'
      importSummary.value.errors += batch.length
      importSummary.value.errorDetails.push(
        ...batch.map((row, bi) => ({
          row: row._originalIndex + 1,
          message: errorMsg,
        }))
      )
    }

    importCount.value += batch.length
    importProgress.value = Math.round((importCount.value / total) * 100)
  }

  importing.value = false
  importProgress.value = 100
  showResults.value = true
  toast.success(`Import complete! ${importSummary.value.created} products imported.`)
}

function exportErrors() {
  if (!importSummary.value.errorDetails.length) {
    toast.error('No errors to export.')
    return
  }
  const csv = ['Row,Error', ...importSummary.value.errorDetails.map(e => `${e.row},"${e.message}"`)].join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `import-errors-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.success('Error report exported.')
}

function resetAll() {
  currentStep.value = 0
  rawFile.value = null
  parsedData.value = []
  sheetHeaders.value = []
  showResults.value = false
  importing.value = false
  importProgress.value = 0
  showErrorDetails.value = false
  productFields.value.forEach(f => { f.mappedTo = '' })
  importSummary.value = { created: 0, updated: 0, errors: 0, skipped: 0, errorDetails: [] }
}
</script>
