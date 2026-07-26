VUEEOF
<template>
    <div>
        <Breadcrumb :items="breadcrumbItems" />
        <DataTable :items="pages" :columns="columns" :loading="loading" empty-icon="📄">
            <template #actions>
                <button @click="openForm()" class="btn-primary">
                    New Page
                </button>
            </template>
            <template #default="{ item }">
                <td class="table-cell">
                    <p class="font-semibold text-gray-900 text-sm">{{ item.title }}</p>
                    <p class="text-xs text-gray-400">/{{ item.slug }}</p>
                </td>
                <td class="table-cell">
                    <div class="relative">
                        <button @click="toggleDropdown(item.id)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors" :class="statusBtnClass(item.is_active)">
                            {{ item.is_active ? 'Active' : 'Inactive' }}
                            <ChevronDownIcon class="w-3.5 h-3.5" />
                        </button>
                        <div v-if="openDropdownId === item.id" class="absolute left-0 top-full mt-1 z-50 w-36 bg-white rounded-xl border border-gray-200 shadow-lg py-1 animate-in">
                            <button v-for="opt in statusOptions" :key="opt.value" @click="updateStatus(item, opt.value)"
                                class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
                                :class="item.is_active === opt.value ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'">
                                <span class="w-2 h-2 rounded-full" :class="statusDotClass(opt.value)"></span>
                                {{ opt.label }}
                            </button>
                        </div>
                    </div>
                </td>
                <td class="table-cell text-right">
                    <div class="flex items-center justify-end gap-1 whitespace-nowrap">
                        <Tooltip text="Edit">
                            <button @click="openForm(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-blue-400 text-blue-500 hover:text-blue-600 transition-all">
                                <PencilIcon class="w-4 h-4" />
                            </button>
                        </Tooltip>
                        <Tooltip text="Delete">
                            <button @click="confirmDelete(item)" class="p-1.5 rounded-lg border border-gray-300 hover:border-red-400 text-red-400 hover:text-red-500 transition-all">
                                <TrashIcon class="w-4 h-4" />
                            </button>
                        </Tooltip>
                    </div>
                </td>
            </template>
        </DataTable>
        <Teleport to="body">
            <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
                <div class="relative bg-white rounded-2xl p-6 w-full max-w-2xl animate-in max-h-[90vh] overflow-y-auto"
                    style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
                    <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'New' }} Page</h2>
                    <form @submit.prevent="save" class="space-y-4">
                        <div><label class="label">Page Title *</label><input v-model="form.title" required
                                class="input" />
                        </div>
                        <div><label class="label">Content</label><textarea v-model="form.content" rows="10"
                                class="input font-mono text-sm" placeholder="HTML or plain text content..." /></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div><label class="label">Meta Title</label><input v-model="form.meta_title"
                                    class="input" /></div>
                            <div><label class="label">Sort Order</label><input v-model.number="form.sort_order"
                                    type="number" class="input" /></div>
                        </div>
                        <div><label class="label">Meta Description</label><textarea v-model="form.meta_description"
                                rows="2" class="input" /></div>
                        <div>
                            <label class="label">Status</label>
                            <SelectBox v-model="form.status" :options="formStatusOptions" placeholder="Select status" fullWidth />
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">{{
                                saving ? 'Saving...' : 'Save Page' }}</button>
                            <button type="button" @click="showForm = false" class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
        <ConfirmModal :show="!!deleteTarget" title="Delete Page" :message="`Delete '${deleteTarget?.title}'?`"
            :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/common/DataTable.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { cmsApi } from '@/api'
import Tooltip from '@/components/common/Tooltip.vue'
import { PencilIcon, TrashIcon, DocumentTextIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const pages = ref([]), loading = ref(true), showForm = ref(false), saving = ref(false)
const editing = ref(null), deleteTarget = ref(null), deleting = ref(false)
const openDropdownId = ref(null)

const form = reactive({ title: '', content: '', meta_title: '', meta_description: '', sort_order: 0, status: 'active' })
const breadcrumbItems = computed(() => [
    { label: 'CMS Pages', icon: DocumentTextIcon }
])

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
]

const formStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
]
const columns = [
    { key: 'title', label: 'Page' },
    { key: 'status', label: 'Status', class: 'w-24' },
    { key: 'actions', label: 'Action', class: 'w-24 text-right' }
]

async function load() {
    loading.value = true;
    try {
        const r = await cmsApi.list();
        pages.value = r.data.data || []
    } finally {
        loading.value = false
    }
}

function openForm(item = null) {
    editing.value = item;
    if (item) Object.assign(form, { title: item.title, content: item.content || '', meta_title: item.meta_title || '',          meta_description: item.meta_description || '', sort_order: item.sort_order || 0, status: item.is_active ? 'active' : 'inactive' });
    else Object.assign(form, { title: '', content: '', meta_title: '', meta_description: '', sort_order: 0, status: 'active' });
    showForm.value = true
}

async function save() {
    saving.value = true;
    try {
        const { status, ...rest } = form
        const payload = { ...rest, is_active: status === 'active' }
        if (editing.value) await cmsApi.update(editing.value.id, payload);
        else await cmsApi.store(payload);
        toast.success('Saved.');
        showForm.value = false;
        load()
    } finally {
        saving.value = false
    }
}

function toggleDropdown(id) {
    openDropdownId.value = openDropdownId.value === id ? null : id
}

function updateStatus(item, status) {
    item.is_active = status
    toast.success(status ? 'Page activated.' : 'Page deactivated.')
    openDropdownId.value = null
}

function statusBtnClass(isActive) {
    return isActive
        ? 'text-green-700 bg-green-50 hover:bg-green-100'
        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
}

function statusDotClass(isActive) {
    return isActive ? 'bg-green-500' : 'bg-gray-400'
}

function onDocumentClick(e) {
    if (openDropdownId.value !== null) {
        const dropdown = e.target.closest('.relative')
        if (!dropdown) openDropdownId.value = null
    }
}

function confirmDelete(item) { deleteTarget.value = item }

async function doDelete() {
    deleting.value = true;
    try {
        await cmsApi.destroy(deleteTarget.value.id);
        toast.success('Deleted.');
        deleteTarget.value = null;
        load()
    } finally {
        deleting.value = false
    }
}

onMounted(() => {
    load()
    document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
})
</script>