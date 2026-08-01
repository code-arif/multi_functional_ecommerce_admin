<template>
  <div>
    <div class="flex items-center justify-between">
      <Breadcrumb :items="items" :show-divider="false" />
      <div v-if="$slots.default" class="flex items-center gap-2 shrink-0 mb-3">
        <slot />
      </div>
    </div>
    <hr v-if="showDivider" class="border-t mb-4" :style="{ borderColor: 'var(--border)' }" />
  </div>
</template>

<script setup>
import Breadcrumb from './Breadcrumb.vue'

defineProps({
  items: { type: Array, required: true, validator: (val) => val.length >= 1 },
  showDivider: { type: Boolean, default: true }
})
</script>
