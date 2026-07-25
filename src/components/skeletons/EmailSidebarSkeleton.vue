<template>
  <aside class="w-64 h-full border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
    <!-- Compose button placeholder -->
    <div class="p-3">
      <div class="w-full h-[38px] rounded-xl bg-slate-200 skeleton-pulse"></div>
    </div>

    <!-- Folder items -->
    <nav class="flex-1 px-2 space-y-1 overflow-y-auto">
      <div
        v-for="i in 5"
        :key="i"
        class="flex items-center gap-3 px-3 py-[10px] rounded-lg"
      >
        <!-- Folder icon -->
        <div class="w-4 h-4 rounded skeleton-pulse bg-slate-200 shrink-0"></div>
        <!-- Folder label -->
        <div class="h-3.5 rounded skeleton-pulse bg-slate-200 flex-1 max-w-[100px]"></div>
        <!-- Folder count badge -->
        <div
          v-if="i <= 3"
          class="w-7 h-[18px] rounded-full skeleton-pulse bg-slate-200 ml-auto shrink-0"
        ></div>
      </div>
    </nav>

    <!-- Bottom spacer -->
    <div class="p-3 border-t border-slate-200">
      <div class="flex items-center gap-3">
        <div class="w-4 h-4 rounded skeleton-pulse bg-slate-200"></div>
        <div class="h-3.5 rounded skeleton-pulse bg-slate-200 flex-1 max-w-[80px]"></div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.skeleton-pulse {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 50%,
    #e2e8f0 75%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
