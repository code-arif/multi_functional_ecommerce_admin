<template>
  <div class="flex-1 flex flex-col bg-white">
    <!-- Header skeleton -->
    <div class="p-3 border-b border-slate-200 flex items-center gap-3">
      <div class="w-8 h-8 rounded-full skeleton-pulse bg-slate-200 shrink-0"></div>
      <div class="flex-1 min-w-0 space-y-1.5">
        <div class="h-3.5 rounded skeleton-pulse bg-slate-200 w-28"></div>
        <div class="h-3 rounded skeleton-pulse bg-slate-200 w-20"></div>
      </div>
      <div class="w-[30px] h-[30px] rounded-lg skeleton-pulse bg-slate-200"></div>
    </div>

    <!-- Messages area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Incoming message -->
      <div class="flex justify-start">
        <div class="max-w-md w-3/5">
          <div class="rounded-2xl rounded-bl-md px-4 py-3 bg-slate-100 space-y-2">
            <div class="h-3 rounded skeleton-pulse bg-slate-200 w-full"></div>
            <div class="h-3 rounded skeleton-pulse bg-slate-200 w-4/5"></div>
            <div class="h-2.5 rounded skeleton-pulse bg-slate-200 w-14 ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- Outgoing message -->
      <div class="flex justify-end">
        <div class="max-w-md w-2/5">
          <div class="rounded-2xl rounded-br-md px-4 py-3 space-y-2"
            :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #2E7D32) 85%, white)' }">
            <div class="h-3 rounded skeleton-pulse bg-white/40 w-full"></div>
            <div class="h-3 rounded skeleton-pulse bg-white/40 w-3/5"></div>
            <div class="h-2.5 rounded skeleton-pulse bg-white/40 w-12 ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- Incoming message -->
      <div class="flex justify-start">
        <div class="max-w-md w-1/2">
          <div class="rounded-2xl rounded-bl-md px-4 py-3 bg-slate-100 space-y-2">
            <div class="h-3 rounded skeleton-pulse bg-slate-200 w-full"></div>
            <div class="h-2.5 rounded skeleton-pulse bg-slate-200 w-10 ml-auto"></div>
          </div>
        </div>
      </div>

      <!-- Outgoing message -->
      <div class="flex justify-end">
        <div class="max-w-md w-3/5">
          <div class="rounded-2xl rounded-br-md px-4 py-3 space-y-2"
            :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #2E7D32) 85%, white)' }">
            <div class="h-3 rounded skeleton-pulse bg-white/40 w-full"></div>
            <div class="h-3 rounded skeleton-pulse bg-white/40 w-full"></div>
            <div class="h-3 rounded skeleton-pulse bg-white/40 w-2/3"></div>
            <div class="h-2.5 rounded skeleton-pulse bg-white/40 w-12 ml-auto"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area skeleton -->
    <div class="p-3 border-t border-slate-200">
      <div class="flex gap-2">
        <div class="flex-1 h-[42px] rounded-lg skeleton-pulse bg-slate-200"></div>
        <div class="w-[42px] h-[42px] rounded-lg skeleton-pulse bg-slate-200"></div>
      </div>
    </div>
  </div>
</template>

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
