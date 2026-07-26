<template>
    <div>
        <Breadcrumb :items="breadcrumbItems" />
        <DataTable :items="banners" :columns="columns" :loading="loading" empty-icon="🖼️" empty-text="No banners yet">
            <template #actions>
                <button @click="openForm()" class="btn-primary">
                    Add Banner
                </button>
            </template>
            <template #default="{ item }">
                <td class="table-cell">
                    <div class="flex items-center gap-3">
                        <img v-if="item.image_url" :src="item.image_url"
                             class="w-16 h-10 object-cover rounded-lg bg-gray-100 shrink-0" />
                        <div v-else
                             class="w-16 h-10 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-300">
                            🖼️
                        </div>
                        <div>
                            <p class="font-semibold text-gray-900 text-sm">{{ item.title }}</p>
                            <p v-if="item.subtitle" class="text-xs text-gray-400 line-clamp-1">{{ item.subtitle }}</p>
                        </div>
                    </div>
                </td>
                <td class="table-cell"><span class="badge badge-blue text-[10px]">{{
                    item.position?.replace('_', ' ')
                }}</span></td>
                <td class="table-cell text-sm text-gray-600">{{ item.sort_order }}</td>
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
            <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto">
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
                <div class="flex min-h-full items-center justify-center p-4 py-10">
                    <div class="relative bg-white rounded-2xl p-6 w-full max-w-lg animate-in"
                         style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
                        <h2 class="font-bold text-gray-900 text-lg mb-5">{{ editing ? 'Edit' : 'Add' }} Banner</h2>
                        <form @submit.prevent="save" class="space-y-4">
                            <div><label class="label">Title *</label><input v-model="form.title" required class="input" />
                            </div>
                            <div><label class="label">Subtitle</label><input v-model="form.subtitle" class="input" /></div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="select-box-wrapper">
                                    <label class="label">Position *</label>
                                    <SelectBox v-model="form.position" :options="positionOptions" placeholder="Select position" fullWidth />
                                </div>
                                <div><label class="label">Sort Order</label><input v-model.number="form.sort_order"
                                                                                   type="number" class="input" /></div>
                            </div>
                            <div class="grid grid-cols-10 gap-3">
                                <div class="col-span-7">
                                    <label class="label">Link URL</label>
                                    <input v-model="form.link" class="input" placeholder="https://..." />
                                </div>
                                <div class="col-span-3">
                                    <label class="label">Button Text</label>
                                    <input v-model="form.button_text" class="input" placeholder="Shop Now" />
                                </div>
                            </div>
                            <ImagePicker v-model="imageFile" label="Banner Image {{ editing ? '(leave empty to keep current)' : '' }} *" :preview-url="editing?.image_url || ''" hint="Recommended: 1920×600 px" />
                            <div class="grid grid-cols-2 gap-3">
                                <div class="date-picker-wrapper">
                                    <label class="label">Starts At</label>
                                    <DatePicker v-model="form.starts_at" placeholder="Start date" />
                                </div>
                                <div class="date-picker-wrapper">
                                    <label class="label">Ends At</label>
                                    <DatePicker v-model="form.ends_at" placeholder="End date" />
                                </div>
                            </div>
                            <ToggleSwitch v-model="form.is_active" :label="form.is_active ? 'Active' : 'Inactive'" />
                            <div class="flex gap-3 pt-2">
                                <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">{{
                                        saving ? 'Saving...' : 'Save Banner'
                                    }}
                                </button>
                                <button type="button" @click="showForm = false"
                                        class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Teleport>
        <ConfirmModal :show="!!deleteTarget" title="Delete Banner" :message="`Delete '${deleteTarget?.title}'?`"
                      :loading="deleting" @confirm="doDelete" @cancel="deleteTarget = null" />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import DataTable from '@/components/common/DataTable.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { bannerApi } from '@/api'
import Tooltip from '@/components/common/Tooltip.vue'
import { PencilIcon, TrashIcon, ChevronDownIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import SelectBox from '@/components/common/SelectBox.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import ImagePicker from '@/components/common/ImagePicker.vue'

const toast = useToast()
const banners = ref([]), loading = ref(true), showForm = ref(false), saving = ref(false)
const editing = ref(null), deleteTarget = ref(null), deleting = ref(false), imageFile = ref(null)
const openDropdownId = ref(null)
const form = reactive({
    title: '',
    subtitle: '',
    position: 'hero_slider',
    link: '',
    button_text: '',
    sort_order: 0,
    starts_at: '',
    ends_at: '',
    is_active: true
})
const breadcrumbItems = computed(() => [
    { label: 'Banners & Sliders', icon: PhotoIcon }
])

const positionOptions = [
    { value: 'hero_slider', label: 'Hero Slider' },
    { value: 'homepage_top', label: 'Homepage Top' },
    { value: 'homepage_middle', label: 'Homepage Middle' },
    { value: 'homepage_bottom', label: 'Homepage Bottom' },
    { value: 'promotional', label: 'Promotional' }
]

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
]

const columns = [
    { key: 'image', label: 'Banner' },
    { key: 'position', label: 'Position', class: 'w-36' },
    { key: 'sort', label: 'Order', class: 'w-16' },
    { key: 'status', label: 'Status', class: 'w-24' },
    { key: 'actions', label: 'Action', class: 'w-24 text-right' }
]

async function load() {
    loading.value = true;
    try {
        const r = await bannerApi.list();
        banners.value = r.data.data || []
    } finally {
        loading.value = false
    }
}

function openForm(item = null) {
    editing.value = item;
    if (item) Object.assign(form, {
        title: item.title,
        subtitle: item.subtitle || '',
        position: item.position,
        link: item.link || '',
        button_text: item.button_text || '',
        sort_order: item.sort_order || 0,
        starts_at: item.starts_at?.slice(0, 16) || '',
        ends_at: item.ends_at?.slice(0, 16) || '',
        is_active: item.is_active
    }); else Object.assign(form, {
        title: '',
        subtitle: '',
        position: 'hero_slider',
        link: '',
        button_text: '',
        sort_order: 0,
        starts_at: '',
        ends_at: '',
        is_active: true
    });
    showForm.value = true;
    imageFile.value = null
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

        if (imageFile.value) fd.append('image', imageFile.value);
        if (editing.value) await bannerApi.update(editing.value.id, fd); else await bannerApi.store(fd);
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
        await bannerApi.destroy(deleteTarget.value.id);
        toast.success('Deleted.');
        deleteTarget.value = null;
        load()
    } finally {
        deleting.value = false
    }
}

function toggleDropdown(id) {
    openDropdownId.value = openDropdownId.value === id ? null : id
}

function updateStatus(item, status) {
    item.is_active = status
    toast.success(status ? 'Banner activated.' : 'Banner deactivated.')
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

onMounted(() => {
    load()
    document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick)
})
</script>

<style scoped>
.select-box-wrapper :deep(.sb-trigger),
.date-picker-wrapper :deep(.dp-input) {
    min-height: 42px;
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
    font-size: 0.875rem;
}

.date-picker-wrapper :deep(.dp-single-text) {
    font-size: 0.875rem;
}

.date-picker-wrapper :deep(.dp-root) {
    width: 100%;
}

</style>