<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="page-title">{{ greeting }}, {{ userName }}!</h1>
      <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <p class="text-sm text-gray-500">{{ todayDate }}</p>
      <slot/>
    </div>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'

defineProps({
  title: String,
  subtitle: String,
  userName: String
})

// Current date
const todayDate = new Date().toLocaleDateString('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric'
})

// Time-based greeting
const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})
</script>