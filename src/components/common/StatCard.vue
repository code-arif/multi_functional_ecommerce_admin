<template>
  <div class="stat-card flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="iconBg">
      <component :is="icon" class="w-6 h-6" :class="iconColor"/>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ label }}</p>
      <p class="text-2xl font-black text-gray-900 mt-0.5">
        {{ prefix }}{{ Number(value || 0).toLocaleString() }}{{ suffix }}
      </p>
      <div v-if="change !== undefined" class="flex items-center gap-1 text-xs mt-0.5">
        <component
            :is="change >= 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'"
            class="w-3 h-3"
            :class="change >=0 ? 'text-green-600' : 'text-red-500'"
        />
        <span :class="change >= 0 ? 'text-green-600' : 'text-red-500'">
          {{ Math.abs(change) }}% vs last month
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [Number, String],
  icon: Object,
  iconBg: String,
  iconColor: String,
  prefix: String,
  suffix: String,
  change: Number
})
</script>