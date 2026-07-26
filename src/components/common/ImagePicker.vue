<template>
    <div>
        <label v-if="label" class="label">{{ label }}</label>

        <!-- Preview when file is selected -->
        <div v-if="previewUrl || localPreview" class="relative group mb-3">
            <img :src="localPreview || previewUrl"
                 class="w-full h-44 object-cover rounded-xl border border-gray-200 bg-gray-50" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl transition-all flex items-center justify-center">
                <button type="button" @click="removeFile"
                        class="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg transform scale-75 group-hover:scale-100">
                    <TrashIcon class="w-5 h-5" />
                </button>
            </div>
            <div class="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                {{ fileSize }}
            </div>
        </div>

        <!-- Drop zone / Upload area -->
        <div v-else
             class="relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
             :class="[isDragging ? 'border-[#4CAF50] bg-green-50 scale-[1.02]' : 'border-gray-200 hover:border-[#4CAF50] hover:bg-green-50/30']"
             @click="triggerInput"
             @dragover.prevent="isDragging = true"
             @dragleave.prevent="isDragging = false"
             @drop.prevent="onDrop"
             @keydown.enter="triggerInput"
             @keydown.space.prevent="triggerInput"
             role="button"
             tabindex="0"
             :aria-label="label || 'Upload image'">

            <input ref="fileInput" type="file" :accept="accept" class="hidden" @change="onFileChange" />

            <!-- Upload icon -->
            <div class="mb-3 transition-transform" :class="isDragging ? 'scale-110' : ''">
                <template v-if="isDragging">
                    <CloudArrowUpIcon class="w-10 h-10 text-[#4CAF50] mx-auto" />
                </template>
                <template v-else>
                    <PhotoIcon class="w-10 h-10 text-gray-300 mx-auto" />
                </template>
            </div>

            <p class="text-sm font-semibold text-gray-700">
                <span class="text-[#4CAF50]">Click to upload</span> or drag and drop
            </p>
            <p class="text-xs text-gray-400 mt-1">{{ acceptDescription }} — Max {{ maxSizeMB }}MB</p>
        </div>

        <!-- Error message -->
        <p v-if="error" class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            <ExclamationCircleIcon class="w-3.5 h-3.5 shrink-0" />
            {{ error }}
        </p>

        <!-- Hint -->
        <p v-else-if="hint" class="text-gray-400 text-xs mt-1.5">{{ hint }}</p>
    </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { PhotoIcon, CloudArrowUpIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
    modelValue: {
        type: File,
        default: null
    },
    label: {
        type: String,
        default: ''
    },
    accept: {
        type: String,
        default: 'image/*'
    },
    previewUrl: {
        type: String,
        default: ''
    },
    maxSizeMB: {
        type: Number,
        default: 5
    },
    required: {
        type: Boolean,
        default: false
    },
    hint: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragging = ref(false)
const localPreview = ref(null)
const error = ref('')

const acceptDescription = computed(() => {
    if (props.accept === 'image/*') return 'PNG, JPG, WEBP'
    if (props.accept === 'image/x-icon,image/png,image/svg+xml') return 'ICO, PNG, SVG'
    return props.accept.replace(/image\//g, '').replace(/,/g, ', ').toUpperCase()
})

const fileSize = computed(() => {
    if (props.modelValue) {
        const size = props.modelValue.size
        if (size < 1024) return `${size} B`
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
        return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
    return ''
})

function triggerInput() {
    fileInput.value?.click()
}

function validateFile(file) {
    error.value = ''

    if (!file) return false

    // Validate type
    if (props.accept === 'image/*' && !file.type.startsWith('image/')) {
        error.value = 'Please select an image file.'
        return false
    }

    // Validate size
    if (file.size > props.maxSizeMB * 1024 * 1024) {
        error.value = `File size must be under ${props.maxSizeMB}MB.`
        return false
    }

    return true
}

function onFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    handleFile(file)
}

function onDrop(e) {
    isDragging.value = false
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    handleFile(file)
}

function handleFile(file) {
    if (!validateFile(file)) return

    // Create local preview
    if (localPreview.value) {
        URL.revokeObjectURL(localPreview.value)
    }
    localPreview.value = URL.createObjectURL(file)

    emit('update:modelValue', file)
}

function removeFile() {
    if (localPreview.value) {
        URL.revokeObjectURL(localPreview.value)
        localPreview.value = null
    }
    error.value = ''
    if (fileInput.value) fileInput.value.value = ''
    emit('update:modelValue', null)
}

// Cleanup preview on unmount
onUnmounted(() => {
    if (localPreview.value) {
        URL.revokeObjectURL(localPreview.value)
    }
})

// Sync when v-model changes externally
watch(() => props.modelValue, (newFile) => {
    if (!newFile) {
        if (localPreview.value) {
            URL.revokeObjectURL(localPreview.value)
            localPreview.value = null
        }
        if (fileInput.value) fileInput.value.value = ''
    }
})
</script>
