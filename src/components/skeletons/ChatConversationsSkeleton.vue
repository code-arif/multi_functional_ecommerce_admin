<template>
  <div class="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col">
    <!-- Search bar placeholder -->
    <div class="p-3 border-b border-slate-200">
      <div class="relative">
        <div class="w-full h-[38px] rounded-lg skeleton-pulse bg-slate-200"></div>
      </div>
    </div>

    <!-- Conversation items -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="i in items"
        :key="i"
        class="flex items-start gap-3 p-3 border-b border-slate-100"
      >
        <!-- Avatar circle -->
        <div class="w-9 h-9 rounded-full skeleton-pulse bg-slate-200 shrink-0"></div>
        <div class="flex-1 min-w-0 space-y-2">
          <!-- Name + Time row -->
          <div class="flex items-center justify-between gap-2">
            <div class="h-3.5 rounded skeleton-pulse bg-slate-200 w-28"></div>
            <div class="h-2.5 rounded skeleton-pulse bg-slate-200 w-10 shrink-0"></div>
          </div>
          <!-- Last message -->
          <div class="h-3 rounded skeleton-pulse bg-slate-200 w-3/4"></div>
          <!-- Badge + Status row -->
          <div class="flex items-center gap-2">
            <div v-if="i <= 2" class="w-[18px] h-[15px] rounded-full skeleton-pulse bg-slate-200"></div>
            <div class="h-2.5 rounded skeleton-pulse bg-slate-200 w-12"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Number, default: 6 }
})
</script>

<style scoped>
.skeleton-pulse {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
