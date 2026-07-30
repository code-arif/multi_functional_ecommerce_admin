<template>
    <div class="s-card">
        <div class="s-card__header">
            <component :is="icon" class="s-card__icon" />
            <div>
                <h2 class="s-card__title">{{ title }}</h2>
                <p v-if="description" class="s-card__desc">{{ description }}</p>
            </div>
        </div>
        <div class="s-card__body">
            <slot />
        </div>
        <div class="s-card__footer" v-if="!noFooter">
            <slot name="footer">
                <button class="btn-primary" :disabled="saving" @click="$emit('save')">
                    <Loader2 v-if="saving" class="btn-spinner" />
                    <span>{{ saving ? 'Saving…' : 'Save Changes' }}</span>
                </button>
            </slot>
        </div>
    </div>
</template>
<script setup>
import { Loader2 } from 'lucide-vue-next'
defineProps({
    icon: { type: Object, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    saving: { type: Boolean, default: false },
    noFooter: { type: Boolean, default: false },
})
defineEmits(['save'])
</script>
<style scoped>
.s-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; transition: background-color 0.25s ease, border-color 0.25s ease; }
.s-card__header { display: flex; align-items: flex-start; gap: 14px; padding: 20px 24px 18px; border-bottom: 1px solid var(--border-light); border-radius: 12px 12px 0 0; }
.s-card__icon { width: 22px; height: 22px; color: var(--color-primary); margin-top: 2px; flex-shrink: 0; }
.s-card__title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 3px; letter-spacing: -0.01em; }
.s-card__desc { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }
.s-card__body { padding: 22px 24px; }
.s-card__footer { padding: 14px 24px; border-top: 1px solid var(--border-light); background: var(--border-light); display: flex; justify-content: flex-end; border-radius: 0 0 12px 12px; }
:global(.field-group) { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
:global(.field-group--1) { grid-template-columns: 1fr; }
:global(.field-group--3) { grid-template-columns: 1fr 1fr 1fr; }
:global(.col-span-2) { grid-column: span 2; }
:global(.field) { display: flex; flex-direction: column; gap: 6px; }
:global(.label) { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); letter-spacing: 0.01em; }
:global(.input), :global(.select), :global(.textarea) { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.875rem; color: var(--text-primary); background: var(--surface); transition: border-color 0.15s; outline: none; box-sizing: border-box; }
:global(.input:focus), :global(.select:focus), :global(.textarea:focus) { border-color: var(--color-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-light) 15%, transparent); }
:global(.hint) { font-size: 0.75rem; color: var(--text-muted); }
@media (max-width: 640px) { :global(.field-group) { grid-template-columns: 1fr; } :global(.col-span-2) { grid-column: span 1; } .s-card__body { padding: 16px; } .s-card__header { padding: 16px; } }
</style>
