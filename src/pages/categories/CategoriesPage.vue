<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <DataTable :items="categories" :columns="columns" :loading="loading" empty-icon="🏷️"
      empty-text="No categories yet">
      <template #actions>
        <button @click="openForm()" class="btn-primary">Add Category</button>
      </template>
      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style="background-color:var(--border-light)">
              <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
              <Tag class="w-4 h-4" style="color:var(--text-muted)" />
            </div>
            <div>
              <p class="font-semibold text-sm" style="color:var(--text-primary)">{{ item.name }}</p>
              <p class="text-xs" style="color:var(--text-muted)">/{{ item.slug }}</p>
            </div>
          </div>
        </td>
        <td class="table-cell text-sm" style="color:var(--text-secondary)">{{ item.parent?.name || '—' }}</td>
        <td class="table-cell text-sm" style="color:var(--text-primary)">{{ item.products_count || 0 }}</td>
        <td class="table-cell text-sm" style="color:var(--text-primary)">{{ item.commission_rate || '0.00' }}%</td>
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
            <Tooltip text="View">
              <router-link :to="`/categories/${item.id}`" class="p-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all">
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

    <!-- Form Modal -->
    <CategoryFormModal :show="showForm" :category="editing" :categories="categories" @close="showForm = false" @saved="onCategorySaved" />
    <ConfirmModal :show="!!deleteTarget" title="Delete Category" :message="`Delete '${deleteTarget?.name}'?`"
      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { categoryApi } from '@/api'
import { PencilIcon, TrashIcon, TagIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { Tag } from 'lucide-vue-next'
import CategoryFormModal from './CategoryFormModal.vue'

const toast = useToast()
const categories = ref([]), loading = ref(true), showForm = ref(false)
const editing = ref(null), deleteTarget = ref(null), deleting = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Categories', icon: TagIcon }
])

const columns = [
  { key: 'name', label: 'Category' },
  { key: 'parent', label: 'Parent', class: 'w-32' },
  { key: 'products', label: 'Products', class: 'w-20' },
  { key: 'commission_rate', label: 'Commission', class: 'w-24' },
  { key: 'is_featured', label: 'Featured', class: 'w-24' },
  { key: 'status', label: 'Approval', class: 'w-24' },
  { key: 'is_active', label: 'Status', class: 'w-24' },
  { key: 'actions', label: 'Action', class: 'w-24 text-right' },
]

async function load() {
  loading.value = true
  try {
    const r = await categoryApi.list();
    categories.value = r.data.data || []
  } finally {
    loading.value = false
  }
}

function openForm(item = null) {
  editing.value = item
  showForm.value = true
}

function onCategorySaved() {
  showForm.value = false
  load()
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await categoryApi.destroy(deleteTarget.value.id);
    toast.success('Deleted.');
    deleteTarget.value = null;
    load()
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>