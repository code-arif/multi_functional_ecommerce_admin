<template>
    <label class="toggle-label" :class="toggleClass">
        <span class="toggle-track">
            <input
                type="checkbox"
                :checked="modelValue"
                :disabled="disabled"
                class="toggle-input"
                @change="onToggle"
            />
            <span class="toggle-thumb"></span>
        </span>
        <span v-if="label || $slots.default" class="toggle-text" :class="{ 'toggle-text--active': modelValue }">
            <slot>{{ label }}</slot>
        </span>
    </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v)
    }
})

const emit = defineEmits(['update:modelValue'])

const toggleClass = computed(() => [
    `toggle--${props.size}`,
    { 'toggle--disabled': props.disabled }
])

function onToggle(e) {
    if (props.disabled) return
    emit('update:modelValue', e.target.checked)
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   TOGGLE SWITCH — Theme-Aware
   ═══════════════════════════════════════════ */

.toggle-label {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    cursor: pointer;
    user-select: none;
}

.toggle--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.toggle--disabled .toggle-input {
    cursor: not-allowed;
}

/* ─── Track ─── */
.toggle-track {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: var(--text-muted, #94A3B8);
    transition: background-color 0.25s ease;
    flex-shrink: 0;
}

.toggle-track:has(.toggle-input:checked) {
    background: var(--color-primary, #2E7D32);
}

/* ─── Hidden Input ─── */
.toggle-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    z-index: 1;
    margin: 0;
}

/* ─── Thumb ─── */
.toggle-thumb {
    display: block;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;
}

/* ─── Text ─── */
.toggle-text {
    font-weight: 500;
    color: var(--text-muted, #94A3B8);
    transition: color 0.2s ease;
}

.toggle-text--active {
    color: var(--color-primary, #2E7D32);
    font-weight: 600;
}

/* ═══ Sizes ═══ */

/* Small */
.toggle--sm .toggle-track {
    width: 32px;
    height: 18px;
}
.toggle--sm .toggle-thumb {
    width: 14px;
    height: 14px;
    margin-left: 2px;
}
.toggle--sm .toggle-input:checked + .toggle-thumb {
    transform: translateX(14px);
}
.toggle--sm .toggle-text {
    font-size: 0.75rem;
}

/* Medium (default) */
.toggle--md .toggle-track {
    width: 44px;
    height: 24px;
}
.toggle--md .toggle-thumb {
    width: 18px;
    height: 18px;
    margin-left: 3px;
}
.toggle--md .toggle-input:checked + .toggle-thumb {
    transform: translateX(20px);
}
.toggle--md .toggle-text {
    font-size: 0.875rem;
}

/* Large */
.toggle--lg .toggle-track {
    width: 56px;
    height: 30px;
}
.toggle--lg .toggle-thumb {
    width: 24px;
    height: 24px;
    margin-left: 3px;
}
.toggle--lg .toggle-input:checked + .toggle-thumb {
    transform: translateX(26px);
}
.toggle--lg .toggle-text {
    font-size: 1rem;
}
</style>
