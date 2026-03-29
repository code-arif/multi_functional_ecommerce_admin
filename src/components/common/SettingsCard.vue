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
.s-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
}

.s-card__header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 20px 24px 18px;
    border-bottom: 1px solid #f1f5f9;
}

.s-card__icon {
    width: 22px;
    height: 22px;
    color: #2563eb;
    margin-top: 2px;
    flex-shrink: 0;
}

.s-card__title {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 3px;
    letter-spacing: -0.01em;
}

.s-card__desc {
    font-size: 0.8125rem;
    color: #64748b;
    margin: 0;
}

.s-card__body {
    padding: 22px 24px;
}

.s-card__footer {
    padding: 14px 24px;
    border-top: 1px solid #f1f5f9;
    background: #f8fafc;
    display: flex;
    justify-content: flex-end;
}

/* ─── Shared form globals (used across all panels) ─── */
:global(.field-group) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
}

:global(.field-group--1) {
    grid-template-columns: 1fr;
}

:global(.field-group--3) {
    grid-template-columns: 1fr 1fr 1fr;
}

:global(.col-span-2) {
    grid-column: span 2;
}

:global(.field) {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

:global(.label) {
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
}

:global(.label .required) {
    color: #ef4444;
    margin-left: 2px;
}

:global(.input),
:global(.select),
:global(.textarea) {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #0f172a;
    background: #ffffff;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
    box-sizing: border-box;
}

:global(.input:focus),
:global(.select:focus),
:global(.textarea:focus) {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

:global(.input::placeholder),
:global(.textarea::placeholder) {
    color: #9ca3af;
}

:global(.textarea) {
    resize: vertical;
    min-height: 80px;
}

:global(.select) {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
}

:global(.input-group) {
    position: relative;
    display: flex;
    align-items: center;
}

:global(.input-group .input) {
    padding-left: 36px;
}

:global(.input-group__prefix) {
    position: absolute;
    left: 11px;
    color: #9ca3af;
    font-size: 0.875rem;
    pointer-events: none;
}

:global(.input-group__suffix-btn) {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #9ca3af;
    display: flex;
    align-items: center;
    transition: color 0.15s;
}

:global(.input-group__suffix-btn:hover) {
    color: #374151;
}

:global(.hint) {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 2px;
}

:global(.divider) {
    border: none;
    border-top: 1px solid #f1f5f9;
    margin: 20px 0;
}

:global(.btn-primary) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 20px;
    background: #2563eb;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
}

:global(.btn-primary:hover:not(:disabled)) {
    background: #1d4ed8;
}

:global(.btn-primary:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
}

:global(.btn-secondary) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    background: #f8fafc;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
}

:global(.btn-secondary:hover) {
    background: #f1f5f9;
}

:global(.btn-danger) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
}

:global(.btn-danger:hover) {
    background: #fee2e2;
}

:global(.btn-spinner) {
    width: 14px;
    height: 14px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

:global(.section-label) {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #94a3b8;
    margin-bottom: 14px;
}

:global(.toggle-row) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
}

:global(.toggle-row:last-child) {
    border-bottom: none;
}

:global(.toggle-info) {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

:global(.toggle-info__title) {
    font-size: 0.875rem;
    font-weight: 500;
    color: #0f172a;
}

:global(.toggle-info__desc) {
    font-size: 0.75rem;
    color: #94a3b8;
}

/* Toggle switch */
:global(.toggle) {
    position: relative;
    width: 40px;
    height: 22px;
    flex-shrink: 0;
}

:global(.toggle input) {
    opacity: 0;
    width: 0;
    height: 0;
}

:global(.toggle__slider) {
    position: absolute;
    inset: 0;
    background: #d1d5db;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s;
}

:global(.toggle__slider::before) {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

:global(.toggle input:checked + .toggle__slider) {
    background: #2563eb;
}

:global(.toggle input:checked + .toggle__slider::before) {
    transform: translateX(18px);
}

@media (max-width: 640px) {
    :global(.field-group) {
        grid-template-columns: 1fr;
    }

    :global(.field-group--3) {
        grid-template-columns: 1fr;
    }

    :global(.col-span-2) {
        grid-column: span 1;
    }

    .s-card__body {
        padding: 16px;
    }

    .s-card__header {
        padding: 16px;
    }
}
</style>