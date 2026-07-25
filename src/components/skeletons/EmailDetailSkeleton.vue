<template>
  <div class="w-[400px] lg:w-[500px] shrink-0 border-l border-slate-200 flex flex-col bg-white">
    <!-- Detail Header skeleton -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
      <div class="w-9 h-9 rounded-lg skeleton-pulse bg-slate-200"></div>
      <div class="flex items-center gap-1">
        <div class="w-[30px] h-[30px] rounded-lg skeleton-pulse bg-slate-200"></div>
        <div class="w-[30px] h-[30px] rounded-lg skeleton-pulse bg-slate-200"></div>
      </div>
    </div>

    <!-- Detail Body skeleton -->
    <div class="flex-1 overflow-y-auto p-5 space-y-5">
      <!-- Subject -->
      <div class="space-y-2">
        <div class="h-5 rounded skeleton-pulse bg-slate-200 w-3/4"></div>
        <div class="h-5 rounded skeleton-pulse bg-slate-200 w-1/2"></div>
      </div>

      <!-- From / To row -->
      <div class="flex items-start gap-3">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full skeleton-pulse bg-slate-200 shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3.5 rounded skeleton-pulse bg-slate-200 w-32"></div>
          <div class="h-3 rounded skeleton-pulse bg-slate-200 w-48"></div>
          <div class="h-3 rounded skeleton-pulse bg-slate-200 w-28"></div>
        </div>
        <!-- Date -->
        <div class="w-20 h-3 rounded skeleton-pulse bg-slate-200 shrink-0"></div>
      </div>

      <!-- Attachments -->
      <div class="flex gap-2">
        <div v-for="i in 2" :key="i" class="h-8 w-28 rounded-lg skeleton-pulse bg-slate-200"></div>
      </div>

      <!-- Email body lines -->
      <div class="space-y-2.5 pt-2">
        <div v-for="i in 5" :key="i" class="h-3.5 rounded skeleton-pulse bg-slate-200" :class="bodyWidths[i % bodyWidths.length]"></div>
        <div class="h-3.5 rounded skeleton-pulse bg-slate-200 w-2/3"></div>
      </div>
    </div>

    <!-- Reply area skeleton -->
    <div class="border-t border-slate-200 p-4 shrink-0">
      <!-- Reply mode buttons -->
      <div class="flex items-center gap-2 mb-3">
        <div class="h-7 w-16 rounded-lg skeleton-pulse bg-slate-200"></div>
        <div class="h-7 w-20 rounded-lg skeleton-pulse bg-slate-200"></div>
        <div class="h-7 w-20 rounded-lg skeleton-pulse bg-slate-200"></div>
      </div>
      <!-- Textarea -->
      <div class="relative">
        <div class="w-full h-20 rounded-lg skeleton-pulse bg-slate-200"></div>
        <!-- Send button -->
        <div class="absolute bottom-2.5 right-2.5 w-14 h-7 rounded-lg skeleton-pulse bg-slate-200"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const bodyWidths = ['w-full', 'w-[92%]', 'w-[85%]', 'w-[88%]', 'w-[78%]']
</script>

<style scoped>
.skeleton-pulse {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f8fafc 50%,
    #e2e8f0 75%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
