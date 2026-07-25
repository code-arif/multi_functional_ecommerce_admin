<template>
  <div class="space-y-6">
    <!-- Date group -->
    <div v-for="g in 3" :key="g">
      <!-- Date header -->
      <div class="h-3 rounded skeleton-pulse bg-slate-200 w-16 mb-3 px-1"></div>

      <!-- Notification cards -->
      <div class="space-y-2">
        <div
          v-for="n in (g === 2 ? 2 : 3)"
          :key="`${g}-${n}`"
          class="card p-4 flex items-start gap-4"
        >
          <!-- Icon box -->
          <div class="w-10 h-10 rounded-xl skeleton-pulse bg-slate-200 shrink-0"></div>

          <div class="flex-1 min-w-0 space-y-2.5">
            <!-- Title + Time row -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 rounded skeleton-pulse bg-slate-200 w-2/3"></div>
                <div class="h-3 rounded skeleton-pulse bg-slate-200 w-full max-w-[320px]"></div>
              </div>
              <div class="h-2.5 rounded skeleton-pulse bg-slate-200 w-9 shrink-0"></div>
            </div>

            <!-- Type badge + unread dot -->
            <div class="flex items-center gap-3">
              <div class="h-[18px] w-14 rounded-full skeleton-pulse bg-slate-200"></div>
              <div v-if="n <= 2" class="w-2 h-2 rounded-full skeleton-pulse bg-slate-200"></div>
            </div>
          </div>
        </div>
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
