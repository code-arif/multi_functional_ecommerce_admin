<template>
  <div>
    <PageHeader title="Affiliate Products" subtitle="Manage external affiliate products">
      <button @click="openForm()" class="btn-primary">
        <PlusIcon class="w-4 h-4" />
        Add Affiliate Product
      </button>
    </PageHeader>
    <DataTable :items="products" :columns="columns" :loading="loading" :pagination="pagination" searchable
      @search="q => { search = q; load(1) }" @page="load" empty-icon="🔗">
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
              <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
            </div>
            <p class="font-semibold text-gray-900 text-sm line-clamp-1">{{ item.title }}</p>
          </div>
        </td>
        <td class="table-cell text-sm text-gray-600">{{ item.source_platform }}</td>
        <td class="table-cell text-sm font-semibold text-gray-900">{{
          item.display_price ?
            `৳${Number(item.display_price).toLocaleString()}` : '—'
        }}
        </td>
        <td class="table-cell text-sm text-gray-600">{{ item.click_count }}</td>
        <td class="table-cell"><span class="badge" :class="item.is_active ? 'badge-green' : 'badge-gray'">{{
          item.is_active ? 'Active' : 'Inactive'
        }}</span></td>

        <td class="table-cell text-right">
          <div class="flex justify-end gap-1">
            <button @click="openForm(item)" class="p-1.5 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100">
              <PencilIcon class="w-4 h-4" />
            </button>
            <button @click="confirmDelete(item)" class="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </td>

      </template>
    </DataTable>


    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />

        <!-- Modal -->
        <div
          class="relative bg-white rounded-2xl w-full max-w-2xl animate-in overflow-hidden flex flex-col max-h-[90vh]"
          style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 shrink-0">
            <h2 class="font-bold text-gray-900 text-lg">
              {{ editing ? 'Edit' : 'Add' }} Affiliate Product
            </h2>
          </div>

          <!-- Scrollable Body -->
          <div class="px-6 py-5 overflow-y-auto flex-1">
            <form @submit.prevent="save" class="space-y-4">

              <div>
                <label class="label">Product Title *</label>
                <input v-model="form.title" required class="input" />
              </div>

              <div>
                <label class="label">Affiliate Link *</label>
                <input v-model="form.affiliate_link" required type="url" class="input" placeholder="https://..." />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Source Platform *</label>
                  <input v-model="form.source_platform" required class="input" placeholder="Amazon, Daraz..." />
                </div>
                <div>
                  <label class="label">Display Price</label>
                  <input v-model.number="form.display_price" type="number" min="0" class="input" />
                </div>
              </div>

              <!-- Replace Description Field -->

              <div>
                <label class="label">Description</label>

                <div class="quill-wrapper">
                  <QuillEditor v-model:content="form.description" content-type="html" :options="quillOptions"
                    theme="snow" placeholder="Write affiliate product description..." />
                </div>
              </div>

              <!-- Thumbnail -->
              <div>
                <label class="label">Thumbnail</label>

                <!-- Preview -->
                <div v-if="thumbPreview || editing?.thumbnail_url" class="mb-3">
                  <img :src="thumbPreview || editing?.thumbnail_url"
                    class="w-full h-40 object-cover rounded-xl border border-gray-200" />
                </div>

                <!-- Upload Box -->
                <div
                  class="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#4CAF50] hover:bg-green-50 transition"
                  @click="$refs.thumbInput.click()">
                  <PhotoIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />

                  <p class="text-sm font-semibold text-gray-700">
                    Click to upload thumbnail
                  </p>

                  <p class="text-xs text-gray-400 mt-1">
                    JPG, PNG, WEBP
                  </p>
                </div>

                <!-- Hidden Input -->
                <input ref="thumbInput" type="file" accept="image/*" class="hidden" @change="onThumbChange" />
              </div>

              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="form.is_active" class="accent-[#2E7D32]" />
                Active
              </label>

              <!-- <div class="flex gap-3 pt-2">
                <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">{{
                  saving ? 'Saving...' : 'Save Product'
                }}
                </button>

                <button type="button" @click="showForm = false"
                  class="px-5 py-1 rounded-lg border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500 transition">
                  Cancel
                </button>
              </div> -->
            </form>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 bg-white shrink-0">
            <div class="flex gap-3">
              <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center" @click="save">
                {{ saving ? 'Saving...' : 'Save Product' }}
              </button>

              <button type="button" @click="showForm = false"
                class="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500 transition">
                Cancel
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>
    <ConfirmModal :show="!!deleteTarget" title="Delete Affiliate Product" :message="`Delete '${deleteTarget?.title}'?`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { affiliateApi } from '@/api'
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const toast = useToast()
const products = ref([]), pagination = ref(null), loading = ref(true), showForm = ref(false), saving = ref(false),
  search = ref('')
const editing = ref(null), deleteTarget = ref(null), deleting = ref(false), thumbFile = ref(null)
const form = reactive({
  title: '',
  affiliate_link: '',
  source_platform: '',
  display_price: null,
  description: '',
  is_active: true
})
const thumbPreview = ref(null)
const thumbInput = ref(null)

const quillOptions = {
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  }
}

function onThumbChange(e) {
  const file = e.target.files[0]
  if (!file) return

  thumbFile.value = file
  thumbPreview.value = URL.createObjectURL(file)
}

const columns = [{ key: 'title', label: 'Product' }, { key: 'platform', label: 'Platform', class: 'w-28' }, {
  key: 'price',
  label: 'Price',
  class: 'w-28'
}, { key: 'clicks', label: 'Clicks', class: 'w-20' }, { key: 'status', label: 'Status', class: 'w-20' }, {
  key: 'actions',
  label: 'Action',
  class: 'w-20 text-right'
}]

async function load(page = 1) {
  loading.value = true;
  try {
    const r = await affiliateApi.list({ page, search: search.value });
    products.value = r.data.data || [];
    pagination.value = r.data.pagination
  } finally {
    loading.value = false
  }
}

function openForm(item = null) {
  editing.value = item;
  if (item) Object.assign(form, {
    title: item.title,
    affiliate_link: item.affiliate_link,
    source_platform: item.source_platform,
    display_price: item.display_price,
    description: item.description || '',
    is_active: item.is_active
  }); else Object.assign(form, {
    title: '',
    affiliate_link: '',
    source_platform: '',
    display_price: null,
    description: '',
    is_active: true
  });
  showForm.value = true;
  thumbFile.value = null
}

async function save() {
  saving.value = true;
  try {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        if (k === 'is_active') {
          fd.append(k, v ? 1 : 0)
        } else {
          fd.append(k, v)
        }
      }
    })
    if (thumbFile.value) fd.append('thumbnail', thumbFile.value);
    if (editing.value) await affiliateApi.update(editing.value.id, fd); else await affiliateApi.store(fd);
    toast.success('Saved.');
    showForm.value = false;
    load()
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true;
  try {
    await affiliateApi.destroy(deleteTarget.value.id);
    toast.success('Product Deleted!');
    deleteTarget.value = null;
    load()
  } finally {
    deleting.value = false
  }
}

onMounted(() => load())
</script>


<style scoped>
.quill-wrapper .ql-toolbar {
  border-radius: 0.75rem 0.75rem 0 0;
  border-color: #e5e7eb;
  background: #f9fafb;
}

.quill-wrapper .ql-container {
  border-radius: 0 0 0.75rem 0.75rem;
  border-color: #e5e7eb;
  min-height: 160px;
}

.quill-wrapper .ql-editor {
  min-height: 160px;
  font-size: 14px;
  color: #111827;
}

.quill-wrapper .ql-editor.ql-blank::before {
  color: #9ca3af;
  font-style: normal;
}

.quill-wrapper .ql-container:focus-within {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.12);
}
</style>