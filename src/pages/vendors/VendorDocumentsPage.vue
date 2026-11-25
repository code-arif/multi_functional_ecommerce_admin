<template>
  <div class="space-y-4">
    <BreadcrumbHeader :items="breadcrumbItems" />

    <!-- Filter Panel -->
    <div class="card p-4">
      <div class="flex flex-wrap items-end gap-3">
        <div class="list-filter-item flex-1 min-w-[200px]">
          <label class="label">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Shop name or document no..."
            class="input input-sm w-full"
            @keyup.enter="load(1)"
          />
        </div>
        <div class="list-filter-item">
          <label class="label">Verification Status</label>
          <SelectBox
            v-model="filters.status"
            :options="statusOptions"
            placeholder="All Status"
            size="sm"
            full-width
            @change="load(1)"
          />
        </div>
        <div class="list-filter-item">
          <label class="label">Document Type</label>
          <SelectBox
            v-model="filters.type"
            :options="typeOptions"
            placeholder="All Types"
            size="sm"
            full-width
            @change="load(1)"
          />
        </div>
        <button @click="load(1)" class="btn-primary text-xs py-2 px-4">Apply</button>
        <button @click="resetFilters" class="btn-ghost text-xs py-2 px-3">Reset</button>
      </div>
    </div>

    <!-- Documents Queue Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead>
            <tr>
              <th class="list-th">Vendor Shop</th>
              <th class="list-th">Document Type</th>
              <th class="list-th">Document Number</th>
              <th class="list-th">File</th>
              <th class="list-th">Status</th>
              <th class="list-th">Submitted</th>
              <th class="list-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-16">
                <div class="flex flex-col items-center gap-3" :style="{ color: 'var(--text-muted)' }">
                  <svg class="w-7 h-7 animate-spin" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span class="text-sm">Loading KYC documents...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="!documents.length">
              <td colspan="7" class="text-center py-16">
                <div class="flex flex-col items-center gap-2" :style="{ color: 'var(--text-muted)' }">
                  <IdentificationIcon class="w-10 h-10" />
                  <p class="text-sm font-medium">No KYC documents found</p>
                  <p class="text-xs">Submitted vendor trade licenses, NID, and tax documents appear here</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="doc in documents" :key="doc.uuid || doc.id" class="list-row">
              <td class="list-td">
                <router-link
                  v-if="doc.vendor?.uuid"
                  :to="`/vendors/${doc.vendor.uuid}`"
                  class="hover:underline"
                >
                  <p class="list-name">{{ doc.vendor.shop_name }}</p>
                  <p class="list-sub">{{ doc.vendor.email }}</p>
                </router-link>
                <span v-else class="text-xs text-gray-400">Unknown Vendor</span>
              </td>
              <td class="list-td">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                  {{ formatDocType(doc.type) }}
                </span>
              </td>
              <td class="list-td">
                <span class="font-mono text-xs font-semibold text-gray-700">
                  {{ doc.document_number || '—' }}
                </span>
                <p v-if="doc.status === 'rejected' && doc.rejection_reason" class="text-[11px] text-rose-600 mt-0.5 max-w-xs truncate">
                  Reason: {{ doc.rejection_reason }}
                </p>
              </td>
              <td class="list-td">
                <a
                  v-if="doc.document_url"
                  :href="doc.document_url"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                  <span>View File</span>
                </a>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
              <td class="list-td">
                <StatusBadge :value="doc.status" />
              </td>
              <td class="list-td">
                <p class="list-name">{{ formatDate(doc.created_at) }}</p>
              </td>
              <td class="list-td text-right">
                <div class="flex items-center justify-end gap-1 whitespace-nowrap">
                  <Tooltip v-if="doc.vendor?.uuid" text="View Vendor">
                    <router-link
                      :to="`/vendors/${doc.vendor.uuid}`"
                      class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all inline-flex items-center"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </router-link>
                  </Tooltip>
                  <Tooltip v-if="doc.status !== 'verified'" text="Verify Document">
                    <button
                      @click="confirmVerify(doc)"
                      class="p-1.5 rounded-lg border border-gray-300 hover:border-green-400 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all inline-flex items-center"
                    >
                      <CheckIcon class="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip v-if="doc.status !== 'rejected'" text="Reject Document">
                    <button
                      @click="openRejectModal(doc)"
                      class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all inline-flex items-center"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.last_page > 1"
        class="flex items-center justify-between px-4 py-3 border-t"
        :style="{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--border-light) 50%, transparent)' }"
      >
        <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
          Showing {{ pagination.from }}–{{ pagination.to }} of {{ pagination.total }}
        </p>
        <div class="flex items-center gap-1">
          <button
            @click="load(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="list-pagination-btn"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          <button
            v-for="page in pagination.last_page"
            :key="page"
            @click="load(page)"
            class="list-pagination-num"
            :class="page === pagination.current_page ? 'list-pagination-active' : ''"
            :style="page === pagination.current_page
              ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' }
              : { color: 'var(--navbar-text)', borderColor: 'var(--border)' }"
          >
            {{ page }}
          </button>
          <button
            @click="load(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="list-pagination-btn"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Verify Confirmation -->
    <ConfirmModal
      :show="!!verifyTarget"
      type="success"
      title="Verify KYC Document"
      :message="`Confirm verification of ${formatDocType(verifyTarget?.type)} for '${verifyTarget?.vendor?.shop_name}'? The vendor will be notified via email.`"
      confirm-text="Yes, Verify"
      :loading="verifyLoading"
      @confirm="doVerify"
      @cancel="verifyTarget = null"
    />

    <!-- Reject Modal -->
    <Teleport to="body">
      <div v-if="rejectModal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeRejectModal" />
        <div class="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
                <XMarkIcon class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">Reject KYC Document</h3>
                <p class="text-xs text-gray-500">Provide feedback so the vendor can re-upload.</p>
              </div>
            </div>
          </div>
          <form @submit.prevent="submitReject" class="p-6 space-y-4">
            <div>
              <label class="label mb-1.5 block text-xs font-bold text-gray-700">Rejection Reason</label>
              <textarea
                v-model="rejectModal.reason"
                rows="3"
                required
                placeholder="e.g. Blurry scan or expired trade license..."
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-xs outline-none focus:border-emerald-600 text-gray-800"
              />
            </div>
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" @click="closeRejectModal" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" :disabled="rejectModal.submitting" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition">
                {{ rejectModal.submitting ? 'Rejecting...' : 'Reject Document' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import { vendorApi } from '@/api/vendor'
import {
  IdentificationIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const documents = ref([])
const pagination = ref(null)
const loading = ref(true)

const breadcrumbItems = computed(() => [
  { label: 'Vendors', to: '/vendors' },
  { label: 'KYC Documents Queue', icon: IdentificationIcon },
])

const filters = reactive({
  search: '',
  status: '',
  type: '',
})

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

const typeOptions = [
  { value: '', label: 'All Document Types' },
  { value: 'trade_license', label: 'Trade License' },
  { value: 'nid', label: 'National ID (NID)' },
  { value: 'tin', label: 'Tax Identification (TIN)' },
  { value: 'bin', label: 'BIN Certificate' },
  { value: 'passport', label: 'Passport' },
]

function formatDocType(type) {
  if (!type) return 'Document'
  const map = {
    trade_license: 'Trade License',
    nid: 'National ID (NID)',
    tin: 'TIN',
    bin: 'BIN',
    passport: 'Passport',
  }
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

function resetFilters() {
  filters.search = ''
  filters.status = ''
  filters.type = ''
  load(1)
}

async function load(page = 1) {
  loading.value = true
  try {
    const params = {
      page,
      search: filters.search || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
    }
    Object.keys(params).forEach(k => { if (params[k] === undefined) delete params[k] })
    const res = await vendorApi.documents(params)
    documents.value = res.data.data || []
    pagination.value = res.data.pagination || null
  } catch {
    toast.error('Failed to load KYC documents')
  } finally {
    loading.value = false
  }
}

const verifyTarget = ref(null)
const verifyLoading = ref(false)

function confirmVerify(doc) {
  verifyTarget.value = doc
}

async function doVerify() {
  if (!verifyTarget.value) return
  verifyLoading.value = true
  try {
    await vendorApi.verifyDocument(verifyTarget.value.uuid || verifyTarget.value.id)
    toast.success('Document verified and vendor notified')
    verifyTarget.value = null
    load(pagination.value?.current_page || 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to verify document')
  } finally {
    verifyLoading.value = false
  }
}

const rejectModal = reactive({
  show: false,
  doc: null,
  reason: '',
  submitting: false,
})

function openRejectModal(doc) {
  rejectModal.doc = doc
  rejectModal.reason = ''
  rejectModal.show = true
}

function closeRejectModal() {
  rejectModal.show = false
  rejectModal.doc = null
  rejectModal.reason = ''
  rejectModal.submitting = false
}

async function submitReject() {
  if (!rejectModal.doc || !rejectModal.reason.trim()) return
  rejectModal.submitting = true
  try {
    await vendorApi.rejectDocument(rejectModal.doc.uuid || rejectModal.doc.id, rejectModal.reason.trim())
    toast.success('Document rejected and vendor notified')
    closeRejectModal()
    load(pagination.value?.current_page || 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to reject document')
  } finally {
    rejectModal.submitting = false
  }
}

onMounted(() => load())
</script>
