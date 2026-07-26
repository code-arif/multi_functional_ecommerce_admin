<template>
  <div>
    <nav class="flex items-center gap-1.5 text-sm mb-5">
      <template v-for="(item, idx) in items" :key="idx">
        <!-- Separator (skip for first item) -->
        <ChevronRightIcon v-if="idx > 0" class="w-4 h-4 shrink-0" :style="{ color: 'var(--text-muted)' }" />

        <!-- Last item = active page indicator -->
        <span v-if="idx === items.length - 1"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap"
              :style="{
                color: 'var(--color-primary)',
                backgroundColor: 'color-mix(in srgb, var(--color-primary-pale) 60%, transparent)'
              }">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: 'var(--color-primary)' }"></span>
          {{ item.label }}
        </span>

        <!-- Non-last items = clickable links -->
        <router-link v-else-if="item.to"
                     :to="item.to"
                     class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all whitespace-nowrap">
          <component v-if="item.icon" :is="item.icon" class="w-4 h-4 shrink-0" />
          <span>{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <hr v-if="showDivider" class="border-t mb-6" :style="{ borderColor: 'var(--border)' }" />
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
