<template>
  <div class="space-y-4">
    <BreadcrumbHeader :items="breadcrumbItems">
      <router-link
        to="/vendors"
        class="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
      >
        <ArrowLeftIcon class="w-3.5 h-3.5" />
        Back to Active Vendors
      </router-link>
    </BreadcrumbHeader>

    <!-- Search Bar -->
    <div class="card p-4 flex flex-wrap items-end gap-3">
      <div class="list-filter-item flex-1 min-w-[220px]">
        <label class="label">Search Deleted Vendors</label>
        <input
          v-model="search"
          type="text"
          placeholder="Search by shop name or email..."
          class="input input-sm w-full"
          @keyup.enter="load(1)"
        />
      </div>
      <button @click="load(1)" class="btn-primary text-xs py-2 px-4">Search</button>
      <button v-if="search" @click="resetSearch" class="btn-ghost text-xs py-2 px-3">Reset</button>
    </div>

    <!-- Deleted Vendors Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead>
            <tr>
              <th class="list-th">Shop &amp; Vendor</th>
              <th class="list-th">Contact</th>
              <th class="list-th">Products &amp; Orders</th>
              <th class="list-th">Last Status</th>
              <th class="list-th">Deleted At</th>
              <th class="list-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-16">
                <div class="flex flex-col items-center gap-3" :style="{ color: 'var(--text-muted)' }">
                  <svg class="w-7 h-7 animate-spin" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span class="text-sm">Loading deleted vendors...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="!vendors.length">
              <td colspan="6" class="text-center py-16">
                <div class="flex flex-col items-center gap-2" :style="{ color: 'var(--text-muted)' }">
                  <TrashIcon class="w-10 h-10" />
                  <p class="text-sm font-medium">Trash is empty</p>
                  <p class="text-xs">Soft-deleted vendors will appear here for recovery or permanent removal</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="v in vendors" :key="v.uuid" class="list-row">
              <td class="list-td">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border" :style="{ borderColor: 'var(--border)' }">
                    <img v-if="v.logo_url" :src="v.logo_url" :alt="v.shop_name" class="w-full h-full object-cover" />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-xs font-bold bg-red-50 text-red-600"
                    >
                      {{ v.shop_name?.charAt(0)?.toUpperCase() || 'V' }}
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="list-name">{{ v.shop_name }}</p>
                    <p class="list-sub">{{ v.owner_name || v.shop_name }}</p>
                  </div>
                </div>
              </td>
              <td class="list-td">
                <p class="list-name">{{ v.email }}</p>
                <p class="list-sub">{{ v.phone || '—' }}</p>
              </td>
              <td class="list-td text-xs">
                <span class="font-semibold text-gray-700">{{ v.products_count || 0 }}</span> products
                <span class="mx-1 text-gray-300">|</span>
                <span class="font-semibold text-gray-700">{{ v.total_orders || 0 }}</span> orders
              </td>
              <td class="list-td">
                <StatusBadge :value="v.status" />
              </td>
              <td class="list-td">
                <p class="list-name">{{ formatDate(v.deleted_at) }}</p>
                <p class="list-sub">{{ formatRelative(v.deleted_at) }}</p>
              </td>
              <td class="list-td text-right">
                <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
                  <Tooltip text="Restore Vendor">
                    <button
                      @click="confirmRestore(v)"
                      class="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition inline-flex items-center gap-1"
                    >
                      <ArrowUturnLeftIcon class="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  </Tooltip>
                  <Tooltip text="Delete Permanently">
                    <button
                      @click="confirmForceDelete(v)"
                      class="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition inline-flex items-center gap-1"
                    >
                      <TrashIcon class="w-3.5 h-3.5" />
                      <span>Delete Forever</span>
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
          <button @click="load(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="list-pagination-btn">
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
          <button @click="load(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="list-pagination-btn">
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Restore Confirmation -->
    <ConfirmModal
      :show="!!restoreTarget"
      type="success"
      title="Restore Vendor"
      :message="`Restore '${restoreTarget?.shop_name}' back to active vendors list?`"
      confirm-text="Yes, Restore Vendor"
      :loading="restoreLoading"
      @confirm="doRestore"
      @cancel="restoreTarget = null"
    />

    <!-- GitHub-Style Dangerous Permanent Delete Modal -->
    <ConfirmModal
      :show="!!forceTarget"
      type="danger"
      title="Permanently Delete Vendor"
      :danger-warning="`Warning: This action is irreversible. Permanently deleting '${forceTarget?.shop_name}' will erase the shop record and its linked references from the database.`"
      :message="`You are about to permanently delete '${forceTarget?.shop_name}'.`"
      :confirm-match="forceTarget?.shop_name || ''"
      confirm-text="I understand, delete permanently"
      :loading="forceLoading"
      @confirm="doForceDelete"
      @cancel="forceTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import { vendorApi } from '@/api/vendor'
import {
  TrashIcon,
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const vendors = ref([])
const pagination = ref(null)
const loading = ref(true)
const search = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Vendors', to: '/vendors' },
  { label: 'Deleted Vendors', icon: TrashIcon },
])

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatRelative(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function resetSearch() {
  search.value = ''
  load(1)
}

async function load(page = 1) {
  loading.value = true
  try {
    const params = { page, search: search.value.trim() || undefined }
    const res = await vendorApi.trashed(params)
    vendors.value = res.data.data || []
    pagination.value = res.data.pagination || null
  } catch {
    toast.error('Failed to load deleted vendors')
  } finally {
    loading.value = false
  }
}

const restoreTarget = ref(null)
const restoreLoading = ref(false)

function confirmRestore(vendor) {
  restoreTarget.value = vendor
}

async function doRestore() {
  if (!restoreTarget.value) return
  restoreLoading.value = true
  try {
    await vendorApi.restore(restoreTarget.value.uuid)
    toast.success(`'${restoreTarget.value.shop_name}' restored successfully`)
    restoreTarget.value = null
    load(pagination.value?.current_page || 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to restore vendor')
  } finally {
    restoreLoading.value = false
  }
}

const forceTarget = ref(null)
const forceLoading = ref(false)

function confirmForceDelete(vendor) {
  forceTarget.value = vendor
}

async function doForceDelete() {
  if (!forceTarget.value) return
  forceLoading.value = true
  try {
    await vendorApi.forceDelete(forceTarget.value.uuid)
    toast.success('Vendor permanently deleted')
    forceTarget.value = null
    load(pagination.value?.current_page || 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to permanently delete vendor')
  } finally {
    forceLoading.value = false
  }
}

onMounted(() => load(1))
</script>
