<template>
  <div class="pag-root" v-if="pagination && pagination.last_page > 1">
    <div class="pag-info">
      Showing <strong>{{ from }}</strong>–<strong>{{ to }}</strong> of <strong>{{ pagination.total }}</strong>
    </div>

    <div class="pag-nav">
      <!-- Prev -->
      <button
        class="pag-btn pag-btn--nav"
        :disabled="pagination.current_page <= 1"
        @click="go(pagination.current_page - 1)"
        :title="'Previous page'"
      >
        <ChevronLeftIcon class="pag-icon" />
      </button>

      <!-- Pages -->
      <template v-for="(p, i) in pages" :key="i">
        <span v-if="p === '...'" class="pag-ellipsis">…</span>
        <button
          v-else
          class="pag-btn pag-btn--num"
          :class="{ 'pag-btn--active': p === pagination.current_page }"
          @click="go(p)"
        >
          {{ p }}
        </button>
      </template>

      <!-- Next -->
      <button
        class="pag-btn pag-btn--nav"
        :disabled="pagination.current_page >= pagination.last_page"
        @click="go(pagination.current_page + 1)"
        :title="'Next page'"
      >
        <ChevronRightIcon class="pag-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  pagination: { type: Object, required: true },
})
const emit = defineEmits(['page'])

const from = computed(() => (props.pagination.current_page - 1) * props.pagination.per_page + 1)
const to = computed(() => Math.min(props.pagination.current_page * props.pagination.per_page, props.pagination.total))

const pages = computed(() => {
  const { current_page, last_page } = props.pagination
  if (last_page <= 7) {
    return Array.from({ length: last_page }, (_, i) => i + 1)
  }

  const result = []
  if (current_page <= 4) {
    for (let i = 1; i <= 5; i++) result.push(i)
    result.push('...', last_page)
  } else if (current_page >= last_page - 3) {
    result.push(1, '...')
    for (let i = last_page - 4; i <= last_page; i++) result.push(i)
  } else {
    result.push(1, '...')
    for (let i = current_page - 1; i <= current_page + 1; i++) result.push(i)
    result.push('...', last_page)
  }
  return result
})

function go(page) {
  if (page < 1 || page > props.pagination.last_page || page === props.pagination.current_page) return
  emit('page', page)
}
</script>

<style scoped>
.pag-root {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
  background: color-mix(in srgb, var(--border-light) 60%, transparent);
  flex-wrap: wrap;
}

.pag-info {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.pag-info strong {
  color: var(--text-primary);
  font-weight: 600;
}

.pag-nav {
  display: flex;
  align-items: center;
  gap: 3px;
}

.pag-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.12s ease;
  font-family: inherit;
  line-height: 1;
}

.pag-btn:hover:not(:disabled):not(.pag-btn--active) {
  background: var(--border-light);
  border-color: var(--color-primary-light);
  color: var(--text-primary);
}

.pag-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ─── Nav buttons (prev/next) ─── */
.pag-btn--nav {
  width: 30px;
  height: 30px;
  border-radius: 8px;
}

.pag-icon {
  width: 14px;
  height: 14px;
}

/* ─── Number buttons ─── */
.pag-btn--num {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pag-btn--active {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: #fff !important;
  cursor: default;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

/* ─── Ellipsis ─── */
.pag-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 30px;
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 2px;
  user-select: none;
}

/* ─── Responsive ─── */
@media (max-width: 640px) {
  .pag-root {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 12px;
  }

  .pag-btn--num {
    min-width: 28px;
    height: 28px;
    font-size: 0.6875rem;
  }

  .pag-btn--nav {
    width: 28px;
    height: 28px;
  }
}
</style>
