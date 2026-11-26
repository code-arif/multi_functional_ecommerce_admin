<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <DataTable :items="brands" :columns="columns" :loading="loading" searchable :pagination="pagination"
      search-placeholder="Search brands..." empty-icon="🏭" empty-text="No brands yet"
      @search="q => { search = q; load(1) }" @page="load">
      <template #filters>
        <SelectBox
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="All Approval"
          size="md"
          @change="load(1)"
        />
      </template>
      <template #actions>
        <button @click="openForm()" class="btn-primary">Add Brand</button>
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style="background-color:var(--border-light)">
              <img v-if="item.logo_url" :src="item.logo_url" class="w-full h-full object-contain p-1" />
              <span v-else class="w-full h-full flex items-center justify-center">
                <Factory class="w-4 h-4" style="color:var(--text-muted)" />
              </span>
            </div>
            <div>
              <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.name }}</p>
              <a v-if="item.website" :href="item.website" target="_blank" rel="noopener noreferrer"
                class="text-xs text-blue-600 hover:underline">{{ item.website }}</a>
              <p v-else class="text-xs" style="color:var(--text-muted)">/{{ item.slug }}</p>
            </div>
          </div>
        </td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.products_count || 0 }} products</td>
        <td class="table-cell">
          <span class="badge" :class="item.is_featured ? 'badge-blue' : 'badge-gray'">
            {{ item.is_featured ? 'Featured' : 'No' }}
          </span>
        </td>
        <td class="table-cell">
          <StatusBadge :value="item.status" />
        </td>
        <td class="table-cell">
          <StatusBadge :value="item.is_active ? 'active' : 'inactive'" />
        </td>
        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip v-if="item.status !== 'approved'" text="Approve Brand">
              <button @click="confirmStatusAction(item, 'approve')" class="p-1.5 rounded-lg border border-gray-300 hover:border-emerald-400 text-emerald-600 hover:bg-emerald-50 transition-all">
                <CheckCircleIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip v-if="item.status !== 'rejected'" text="Reject Brand">
              <button @click="confirmStatusAction(item, 'reject')" class="p-1.5 rounded-lg border border-gray-300 hover:border-rose-400 text-rose-500 hover:bg-rose-50 transition-all">
                <XCircleIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="View">
              <router-link :to="`/brands/${item.uuid}`" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all">
                <EyeIcon class="w-4 h-4" />
              </router-link>
            </Tooltip>
            <Tooltip text="Edit">
              <button @click="openForm(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:bg-blue-50 transition-all">
                <PencilIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:bg-red-50 transition-all">
                <TrashIcon class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative z-10 flex min-h-full items-center justify-center p-4 sm:p-6">
          <div
            class="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 animate-in"
            style="box-shadow:0 20px 60px rgba(0,0,0,0.15)"
            @click.stop
          >
            <div class="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
              <h2 class="font-bold text-lg" style="color:var(--text-primary)">
                {{ editing ? 'Edit' : 'Add' }} Brand
              </h2>
              <button
                type="button"
                @click="showForm = false"
                class="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="save">
              <div class="p-6 space-y-4">
                <div v-if="formError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {{ formError }}
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="label">Brand Name *</label>
                    <input v-model="form.name" required class="input" placeholder="e.g. Apple" />
                    <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name[0] }}</p>
                  </div>
                  <div>
                    <label class="label">Website</label>
                    <input v-model="form.website" type="url" class="input" placeholder="https://" />
                    <p v-if="errors.website" class="text-xs text-red-500 mt-1">{{ errors.website[0] }}</p>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="label">Description</label>
                    <textarea v-model="form.description" rows="2" class="input" placeholder="Brief brand description..." />
                    <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description[0] }}</p>
                  </div>

                  <div>
                    <ImagePicker v-model="logoFile" label="Logo" :preview-url="editing?.logo_url || ''" :max-size-m-b="2" />
                    <p v-if="errors.logo" class="text-xs text-red-500 mt-1">{{ errors.logo[0] }}</p>
                  </div>
                  <div>
                    <ImagePicker v-model="bannerFile" label="Banner" :preview-url="editing?.banner_url || ''" :max-size-m-b="2" />
                    <p v-if="errors.banner" class="text-xs text-red-500 mt-1">{{ errors.banner[0] }}</p>
                  </div>

                  <div>
                    <label class="label">Approval Status</label>
                    <SelectBox v-model="form.status" :options="formStatusOptions" size="lg" full-width />
                    <p v-if="errors.status" class="text-xs text-red-500 mt-1">{{ errors.status[0] }}</p>
                  </div>
                  <div>
                    <label class="label">Sort Order</label>
                    <input v-model.number="form.sort_order" type="number" min="0" class="input" />
                    <p v-if="errors.sort_order" class="text-xs text-red-500 mt-1">{{ errors.sort_order[0] }}</p>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="label">Meta Title</label>
                    <input v-model="form.meta_title" class="input" placeholder="Optional SEO title" />
                    <p v-if="errors.meta_title" class="text-xs text-red-500 mt-1">{{ errors.meta_title[0] }}</p>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="label">Meta Description</label>
                    <textarea v-model="form.meta_description" rows="2" class="input" placeholder="Optional SEO description..." />
                    <p v-if="errors.meta_description" class="text-xs text-red-500 mt-1">{{ errors.meta_description[0] }}</p>
                  </div>

                  <div class="sm:col-span-2 flex items-center gap-6 pt-1">
                    <div>
                      <ToggleSwitch v-model="form.is_active" label="Active" />
                      <p v-if="errors.is_active" class="text-xs text-red-500 mt-1">{{ errors.is_active[0] }}</p>
                    </div>
                    <div>
                      <ToggleSwitch v-model="form.is_featured" label="Featured" />
                      <p v-if="errors.is_featured" class="text-xs text-red-500 mt-1">{{ errors.is_featured[0] }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button type="button" @click="showForm = false"
                  class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" class="btn-primary px-6 justify-center">
                  {{ saving ? 'Saving...' : 'Save Brand' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
    <ConfirmModal
      :show="!!statusTarget"
      :title="statusAction === 'approve' ? 'Approve Brand' : 'Reject Brand'"
      :message="statusAction === 'approve'
        ? `Approve '${statusTarget?.name}' and notify the vendor?`
        : `Reject '${statusTarget?.name}' and notify the vendor?`"
      :confirm-text="statusAction === 'approve' ? 'Approve' : 'Reject'"
      :type="statusAction === 'approve' ? 'success' : 'danger'"
      :loading="updatingStatus"
      @confirm="doStatusAction"
      @cancel="statusTarget = null"
    />
    <ConfirmModal :show="!!deleteTarget" title="Delete Brand" :message="`Delete '${deleteTarget?.name}'?`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { brandApi } from '@/api'
import { PencilIcon, TrashIcon, BuildingStorefrontIcon, XMarkIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { Factory } from 'lucide-vue-next'
import ImagePicker from '@ecom/ui/components/ImagePicker.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'

const toast = useToast()
const brands = ref([]), pagination = ref(null), loading = ref(true), showForm = ref(false), saving = ref(false)
const search = ref(''), statusFilter = ref(''), errors = ref({}), formError = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Brands', icon: BuildingStorefrontIcon }
])

const statusOptions = [
  { value: '', label: 'All Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const formStatusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const editing = ref(null), deleteTarget = ref(null), deleting = ref(false), logoFile = ref(null), bannerFile = ref(null)
const statusTarget = ref(null), statusAction = ref('approve'), updatingStatus = ref(false)
const form = reactive({
  name: '',
  website: '',
  description: '',
  status: 'approved',
  sort_order: 0,
  meta_title: '',
  meta_description: '',
  is_active: true,
  is_featured: false,
})
const columns = [
  { key: 'name', label: 'Brand' },
  { key: 'products', label: 'Products', class: 'w-28' },
  { key: 'is_featured', label: 'Featured', class: 'w-24' },
  { key: 'status', label: 'Approval', class: 'w-24' },
  { key: 'is_active', label: 'Status', class: 'w-24' },
  { key: 'actions', label: 'Action', class: 'w-36 text-right' },
]

async function load(page = 1) {
  loading.value = true
  try {
    const r = await brandApi.list({
      page,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      per_page: 20,
    })
    brands.value = r.data.data || []
    pagination.value = r.data.pagination || null
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load brands.')
  } finally {
    loading.value = false
  }
}

function openForm(item = null) {
  editing.value = item
  errors.value = {}
  formError.value = ''
  if (item) {
    Object.assign(form, {
      name: item.name || '',
      website: item.website || '',
      description: item.description || '',
      status: item.status || 'approved',
      sort_order: item.sort_order ?? 0,
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || '',
      is_active: Boolean(item.is_active),
      is_featured: Boolean(item.is_featured),
    })
  } else {
    Object.assign(form, {
      name: '',
      website: '',
      description: '',
      status: 'approved',
      sort_order: 0,
      meta_title: '',
      meta_description: '',
      is_active: true,
      is_featured: false,
    })
  }
  showForm.value = true
  logoFile.value = null
  bannerFile.value = null
}

async function save() {
  saving.value = true
  errors.value = {}
  formError.value = ''
  try {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        if (k === 'is_active' || k === 'is_featured') {
          fd.append(k, v ? 1 : 0)
        } else {
          fd.append(k, v)
        }
      }
    })
    if (logoFile.value) fd.append('logo', logoFile.value)
    if (bannerFile.value) fd.append('banner', bannerFile.value)
    if (editing.value) {
      await brandApi.update(editing.value.uuid || editing.value.id, fd)
    } else {
      await brandApi.store(fd)
    }
    toast.success('Brand saved successfully.')
    showForm.value = false
    load()
  } catch (e) {
    const status = e.response?.status
    errors.value = e.response?.data?.errors || {}
    const firstError = Object.values(errors.value)[0]?.[0]
    const message = firstError || e.response?.data?.message || 'Failed to save brand.'
    if (!firstError) formError.value = message
    if (status !== 403 && status !== 500) {
      toast.error(message)
    }
  } finally {
    saving.value = false
  }
}

function confirmStatusAction(item, action) {
  statusTarget.value = item
  statusAction.value = action
}

async function doStatusAction() {
  if (!statusTarget.value) return
  updatingStatus.value = true
  try {
    if (statusAction.value === 'approve') {
      await brandApi.approve(statusTarget.value.uuid)
      toast.success('Brand approved.')
    } else {
      await brandApi.reject(statusTarget.value.uuid)
      toast.success('Brand rejected.')
    }
    statusTarget.value = null
    load()
  } catch (e) {
    toast.error(e.response?.data?.message || `Failed to ${statusAction.value} brand.`)
  } finally {
    updatingStatus.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await brandApi.destroy(deleteTarget.value.uuid || deleteTarget.value.id)
    toast.success('Brand deleted.')
    deleteTarget.value = null
    load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to delete brand.')
  } finally {
    deleting.value = false
  }
}

onMounted(() => load())
</script>
