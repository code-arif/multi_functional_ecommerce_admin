<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('cancel')" />
            <div class="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-in"
                style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="iconBg">
                        <component :is="icon" class="w-5 h-5" :class="iconColor" />
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-900 text-base">{{ title }}</h3>
                        <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ message }}</p>
                    </div>
                </div>
                <div class="flex gap-3 mt-6 justify-end">
                    <button @click="$emit('cancel')" class="btn-ghost text-sm px-5">Cancel</button>
                    <button @click="$emit('confirm')" :disabled="loading"
                        class="text-sm px-5 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                        :class="confirmClass">
                        {{ loading ? 'Processing...' : confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
<script setup>
import { computed } from 'vue'
import { ExclamationTriangleIcon, TrashIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
const props = defineProps({
    show: Boolean, loading: Boolean,
    title: { type: String, default: 'Confirm Action' },
    message: { type: String, default: 'Are you sure?' },
    type: { type: String, default: 'danger' },
    confirmText: { type: String, default: 'Confirm' },
})
defineEmits(['confirm', 'cancel'])
const iconBg = computed(() => ({ danger: 'bg-red-100', warning: 'bg-yellow-100', success: 'bg-green-100' }[props.type] || 'bg-red-100'))
const iconColor = computed(() => ({ danger: 'text-red-600', warning: 'text-yellow-600', success: 'text-green-600' }[props.type] || 'text-red-600'))
const confirmClass = computed(() => ({ danger: 'bg-red-500 hover:bg-red-600', warning: 'bg-yellow-500 hover:bg-yellow-600', success: 'bg-green-600 hover:bg-green-700' }[props.type] || 'bg-red-500 hover:bg-red-600'))
const icon = computed(() => ({ danger: TrashIcon, warning: ExclamationTriangleIcon, success: CheckCircleIcon }[props.type] || TrashIcon))
</script>
