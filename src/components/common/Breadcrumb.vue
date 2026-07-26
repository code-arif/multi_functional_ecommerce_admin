<template>
  <div>
    <nav class="flex items-center gap-1 text-xs mb-3">
      <template v-for="(item, idx) in items" :key="idx">
        <!-- Separator (skip for first item) -->
        <ChevronRightIcon v-if="idx > 0" class="w-3.5 h-3.5 shrink-0" :style="{ color: 'var(--text-muted)' }" />

        <!-- Last item = active page indicator -->
        <span v-if="idx === items.length - 1"
              class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold whitespace-nowrap"
              :style="{
                color: 'var(--color-primary)',
                backgroundColor: 'color-mix(in srgb, var(--color-primary-pale) 60%, transparent)'
              }">
          <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: 'var(--color-primary)' }"></span>
          {{ item.label }}
        </span>

        <!-- Non-last items = clickable links -->
        <router-link v-else-if="item.to"
                     :to="item.to"
                     class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap">
          <component v-if="item.icon" :is="item.icon" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <hr v-if="showDivider" class="border-t mb-4" :style="{ borderColor: 'var(--border)' }" />
  </div>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

defineProps({
  items: {
    type: Array,
    required: true,
    validator: (val) => val.length >= 1
  },
  showDivider: {
    type: Boolean,
    default: true
  }
})
</script>
