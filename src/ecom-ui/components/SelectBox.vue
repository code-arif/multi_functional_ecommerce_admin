<template>
  <div class="sb-root" :class="[sizeClass, { 'sb-root--full': fullWidth }]" ref="rootRef">
    <label v-if="label" class="sb-label" @click="toggleOpen">{{ label }}</label>
    <button type="button" class="sb-trigger" :class="{ 'sb-trigger--open': isOpen, 'sb-trigger--placeholder': !selectedLabel, 'sb-trigger--disabled': disabled }"
      :disabled="disabled" :aria-haspopup="'listbox'" :aria-expanded="isOpen" @click="toggleOpen">
      <span class="sb-trigger-text">{{ selectedLabel || placeholder || 'Select...' }}</span>
      <ChevronDownIcon class="sb-chevron" :class="{ 'sb-chevron--open': isOpen }" />
    </button>
    <transition name="sb-drop">
      <div v-if="isOpen" class="sb-dropdown" role="listbox" :aria-label="label || 'Select option'" @click.stop>
        <div v-if="searchable" class="sb-search">
          <Search class="sb-search-icon" />
          <input ref="searchInputRef" v-model="searchQuery" type="text" placeholder="Type to search..." class="sb-search-input" @keydown.stop />
          <button v-if="searchQuery" @click="searchQuery = ''" class="sb-search-clear">&times;</button>
        </div>
        <button v-for="(opt, idx) in filteredOptions" :key="opt.value" type="button" role="option"
          :aria-selected="modelValue === opt.value" class="sb-option" :class="{ 'sb-option--selected': modelValue === opt.value, 'sb-option--focused': focusedIndex === idx, 'sb-option--disabled': opt.disabled }"
          :disabled="opt.disabled" @click="selectOption(opt)" @mouseenter="focusedIndex = idx">
          <span class="sb-option-label">{{ opt.label }}</span>
          <Check v-if="modelValue === opt.value" class="sb-option-check" />
        </button>
        <div v-if="filteredOptions.length === 0" class="sb-empty">{{ searchQuery ? 'No matching options' : 'No options' }}</div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ChevronDownIcon, Check, Search } from 'lucide-vue-next'
const props = defineProps({
  modelValue: { type: [String, Number], default: '' }, options: { type: Array, default: () => [] },
  label: { type: String, default: '' }, placeholder: { type: String, default: '' },
  size: { type: String, default: 'md' }, fullWidth: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }, searchable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change', 'search'])
const rootRef = ref(null); const searchInputRef = ref(null); const isOpen = ref(false); const focusedIndex = ref(-1); const searchQuery = ref('')
const sizeClass = computed(() => `sb--${props.size}`)
const selectedLabel = computed(() => { const match = props.options.find(o => o.value === props.modelValue); return match ? match.label : '' })
const filteredOptions = computed(() => { if (!props.searchable || !searchQuery.value) return props.options; const q = searchQuery.value.toLowerCase().trim(); return props.options.filter(o => String(o.label).toLowerCase().includes(q)) })
function toggleOpen() { if (props.disabled) return; isOpen.value = !isOpen.value; if (isOpen.value) { if (props.searchable) { searchQuery.value = ''; nextTick(() => searchInputRef.value?.focus()) } else { const idx = props.options.findIndex(o => o.value === props.modelValue); focusedIndex.value = idx >= 0 ? idx : 0 } } }
function selectOption(opt) { if (opt.disabled) return; emit('update:modelValue', opt.value); emit('change', opt.value); searchQuery.value = ''; isOpen.value = false }
watch(searchQuery, (val) => { if (props.searchable) emit('search', val) })
function handleClickOutside(e) { if (rootRef.value && !rootRef.value.contains(e.target)) isOpen.value = false }
function handleKeydown(e) { if (!isOpen.value) { if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') && e.target.closest('.sb-root')) { e.preventDefault(); toggleOpen() } return }; switch (e.key) { case 'ArrowDown': e.preventDefault(); focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1); break; case 'ArrowUp': e.preventDefault(); focusedIndex.value = Math.max(focusedIndex.value - 1, 0); break; case 'Enter': case ' ': e.preventDefault(); const opt = filteredOptions.value[focusedIndex.value]; if (opt && !opt.disabled) selectOption(opt); break; case 'Escape': e.preventDefault(); isOpen.value = false; break; case 'Tab': isOpen.value = false; break } }
onMounted(() => { document.addEventListener('click', handleClickOutside); document.addEventListener('keydown', handleKeydown) })
onUnmounted(() => { document.removeEventListener('click', handleClickOutside); document.removeEventListener('keydown', handleKeydown) })
</script>
<style scoped>
.sb-root { position: relative; display: inline-flex; flex-direction: column; gap: 4px; min-width: 80px; }
.sb-root--full { width: 100%; }
.sb-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted, #94A3B8); cursor: pointer; }
.sb-trigger { display: flex; align-items: center; gap: 8px; width: 100%; border: 1px solid var(--border, #E2E8F0); border-radius: 8px; background: var(--surface, #fff); color: var(--text-primary, #1E293B); font-family: inherit; font-weight: 500; cursor: pointer; text-align: left; transition: border-color 0.15s, box-shadow 0.15s; white-space: nowrap; padding: 7px 8px 7px 10px; min-height: 36px; font-size: 0.8125rem; }
.sb--lg .sb-trigger { padding: 9px 10px 9px 12px; min-height: 42px; font-size: 0.875rem; }
.sb-trigger:hover:not(:disabled) { border-color: var(--color-primary-light, #4CAF50); }
.sb-trigger--open { border-color: var(--color-primary, #2E7D32); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-light, #4CAF50) 20%, transparent); }
.sb-trigger--placeholder { color: var(--text-muted, #94A3B8); font-weight: 400; }
.sb-trigger--disabled { opacity: 0.5; cursor: not-allowed; background: var(--border-light, #F1F5F9); }
.sb-trigger-text { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.sb-chevron { flex-shrink: 0; color: var(--text-muted, #94A3B8); transition: transform 0.2s ease; width: 14px; height: 14px; }
.sb-chevron--open { transform: rotate(180deg); color: var(--color-primary, #2E7D32); }
.sb-dropdown { position: absolute; top: calc(100% + 4px); left: 0; z-index: 1000; background: var(--surface, #fff); border: 1px solid var(--border, #E2E8F0); border-radius: 10px; box-shadow: var(--shadow-dropdown, 0 10px 40px rgba(0,0,0,0.12)); padding: 4px; min-width: 100%; width: max-content; max-width: 320px; max-height: 240px; overflow-y: auto; animation: sbFadeIn 0.12s ease-out; }
@keyframes sbFadeIn { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
.sb-option { display: flex; align-items: center; gap: 6px; width: 100%; padding: 5px 8px; border: none; border-radius: 5px; background: transparent; color: var(--text-primary, #1E293B); font-family: inherit; font-size: 0.75rem; font-weight: 500; text-align: left; cursor: pointer; transition: background-color 0.1s; white-space: nowrap; }
.sb-option:hover, .sb-option--focused { background: var(--border-light, #F1F5F9); }
.sb-option--selected { color: var(--color-primary, #2E7D32); font-weight: 600; }
.sb-option--disabled { opacity: 0.4; cursor: not-allowed; }
.sb-option-check { width: 14px; height: 14px; flex-shrink: 0; color: var(--color-primary, #2E7D32); }
.sb-empty { padding: 12px 10px; text-align: center; font-size: 0.75rem; color: var(--text-muted, #94A3B8); }
.sb-drop-enter-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.sb-drop-leave-active { transition: opacity 0.08s ease, transform 0.08s ease; }
.sb-drop-enter-from, .sb-drop-leave-to { opacity: 0; transform: translateY(-4px) scale(0.97); }
@media (max-width: 640px) { .sb-root { min-width: 60px; } }
</style>
