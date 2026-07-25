<template>
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Toolbar skeleton -->
    <div class="flex items-center gap-2 px-2 py-2 border-b border-slate-200 shrink-0">
      <!-- Hamburger (mobile) -->
      <div class="w-9 h-9 rounded-lg skeleton-pulse bg-slate-200 md:hidden"></div>
      <!-- Select all checkbox -->
      <div class="w-[26px] h-[26px] rounded skeleton-pulse bg-slate-200"></div>
      <!-- Refresh button -->
      <div class="w-[30px] h-[30px] rounded-lg skeleton-pulse bg-slate-200"></div>
      <!-- Spacer -->
      <div class="flex-1"></div>
      <!-- Search input -->
      <div class="w-32 sm:w-56 h-[34px] rounded-lg skeleton-pulse bg-slate-200"></div>
    </div>

    <!-- Email list items -->
    <div class="flex-1 overflow-y-auto divide-y divide-slate-100">
      <div
        v-for="i in items"
        :key="i"
        class="flex items-center gap-2 px-3 py-[14px]"
      >
        <!-- Checkbox -->
        <div class="w-[18px] h-[18px] rounded skeleton-pulse bg-slate-200 shrink-0"></div>

        <!-- Sender name -->
        <div class="h-3.5 rounded skeleton-pulse bg-slate-200 w-24 sm:w-32 shrink-0"></div>

        <!-- Subject line -->
        <div class="flex-1 flex gap-2">
          <div class="h-3.5 rounded skeleton-pulse bg-slate-200 flex-1 max-w-[300px]"></div>
        </div>

        <!-- Date -->
        <div class="w-12 h-3 rounded skeleton-pulse bg-slate-200 shrink-0"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Number,
    default: 6
  }
})
</script>

<style scoped>
.skeleton-pulse {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f5f5f4 50%,
    #e2e8f0 75%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
