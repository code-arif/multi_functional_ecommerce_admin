<template>
    <div class="stat-card">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="iconBg">
            <component :is="icon" class="w-6 h-6" :class="iconColor" />
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ label }}</p>
            <p class="text-2xl font-black text-gray-900 mt-0.5">{{ formattedValue }}</p>
            <p v-if="change !== undefined" class="text-xs mt-0.5 flex items-center gap-1"
                :class="change >= 0 ? 'text-green-600' : 'text-red-500'">
                <span>{{ change >= 0 ? '↑' : '↓' }}</span>
                <span>{{ Math.abs(change) }}% from last month</span>
            </p>
        </div>
    </div>
</template>


<script setup>
import { computed } from 'vue'
const props = defineProps({
    label: String, value: [Number, String],
    icon: Object, iconBg: String, iconColor: String,
    prefix: String, suffix: String, change: Number,
})
const formattedValue = computed(() => {
    if (typeof props.value === 'number' && props.value > 999)
        return (props.prefix || '') + props.value.toLocaleString() + (props.suffix || '')
    return (props.prefix || '') + (props.value ?? '—') + (props.suffix || '')
})
</script>
