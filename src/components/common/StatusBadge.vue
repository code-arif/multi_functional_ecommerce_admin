<template>
    <span class="badge" :class="badgeClass">{{ label || value }}</span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ value: String, label: String, type: String })
const badgeClass = computed(() => {
    const map = {
        pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-blue',
        shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red', refunded: 'badge-gray',
        active: 'badge-green', inactive: 'badge-gray', banned: 'badge-red', draft: 'badge-yellow',
        approved: 'badge-green', rejected: 'badge-red',
        paid: 'badge-green', failed: 'badge-red',
    }
    return map[props.value] || 'badge-gray'
})
</script>