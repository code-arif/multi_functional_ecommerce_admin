<template>
  <div class="dp-root" ref="rootRef">
    <div class="dp-trigger" @click="toggleOpen">
      <div class="dp-input" :class="{ 'dp-input--focused': isOpen, 'dp-input--range': range }">
        <CalendarIcon class="dp-input-icon" />
        <template v-if="range">
          <span class="dp-range-part" :class="{ 'dp-range-part--active': rangeSelectionPhase === 'from' }">{{ displayFrom || (placeholder ? placeholder + ' (From)' : 'From date') }}</span>
          <span class="dp-range-sep">→</span>
          <span class="dp-range-part" :class="{ 'dp-range-part--active': rangeSelectionPhase === 'to' }">{{ displayTo || (placeholder ? placeholder + ' (To)' : 'To date') }}</span>
        </template>
        <span v-else class="dp-single-text" :class="{ 'dp-placeholder': !displayText }">{{ displayText || placeholder || 'Select date' }}</span>
        <ChevronDownIcon class="dp-chevron" :class="{ 'dp-chevron--open': isOpen }" />
      </div>
    </div>
    <transition name="dp-drop">
      <div v-if="isOpen" class="dp-dropdown" @click.stop>
        <div class="dp-cal-header">
          <button class="dp-nav-btn" @click="goMonth(-1)" :disabled="!canGoMonth(-1)"><ChevronLeftIcon class="w-4 h-4" /></button>
          <button class="dp-header-title" @click="toggleYearPicker">{{ monthYearLabel }}<ChevronDownIcon class="w-3 h-3 dp-header-chevron" :class="{ 'dp-header-chevron--up': showYearPicker }" /></button>
          <button class="dp-nav-btn" @click="goMonth(1)" :disabled="!canGoMonth(1)"><ChevronRightIcon class="w-4 h-4" /></button>
        </div>
        <transition name="dp-year-fade"><div v-if="showYearPicker" class="dp-year-grid"><button v-for="y in yearRange" :key="y" class="dp-year-btn" :class="{ 'dp-year-active': y === viewYear }" @click="pickYear(y)">{{ y }}</button></div></transition>
        <div class="dp-weekdays"><span v-for="d in dayLabels" :key="d" class="dp-weekday">{{ d }}</span></div>
        <div class="dp-day-grid" role="grid">
          <button v-for="(day, idx) in calendarDays" :key="idx" role="gridcell" class="dp-day" :class="dayClasses(day)" :disabled="!day.isCurrentMonth || day.isDisabled" @click="pickDay(day)" @mouseenter="onDayMouseEnter(day)">{{ day.dayNum }}</button>
        </div>
        <div v-if="range && presets.length" class="dp-footer">
          <div class="dp-footer-label">Quick Select</div>
          <div class="dp-preset-row"><button v-for="p in presets" :key="p.label" class="dp-preset-btn" @click="applyPreset(p)">{{ p.label }}</button></div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, isBefore, isAfter, isWithinInterval, isSameMonth, parseISO, subDays, getYear, setYear } from 'date-fns'
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
const props = defineProps({
  modelValue: { type: String, default: '' }, from: { type: String, default: '' }, to: { type: String, default: '' },
  range: { type: Boolean, default: false }, presets: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' }, displayFormat: { type: String, default: 'MMM dd, yyyy' },
  minDate: { type: [String, Date], default: null }, maxDate: { type: [String, Date], default: null },
  weekStartsOn: { type: Number, default: 1 },
})
const emit = defineEmits(['update:modelValue', 'update:from', 'update:to', 'change'])
const isOpen = ref(false); const showYearPicker = ref(false); const rootRef = ref(null); const viewDate = ref(new Date())
const hoveredDate = ref(null); const rangeSelectionPhase = ref('from')
const viewYear = computed(() => viewDate.value.getFullYear())
const monthYearLabel = computed(() => format(viewDate.value, 'MMMM yyyy'))
const fromDate = computed(() => props.from ? parseISO(props.from) : null); const toDate = computed(() => props.to ? parseISO(props.to) : null)
const displayText = computed(() => props.modelValue ? format(parseISO(props.modelValue), props.displayFormat) : '')
const displayFrom = computed(() => props.from ? format(parseISO(props.from), props.displayFormat) : '')
const displayTo = computed(() => props.to ? format(parseISO(props.to), props.displayFormat) : '')
const dayLabels = computed(() => props.weekStartsOn === 0 ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])
const yearRange = computed(() => { const start = viewYear.value - 6; return Array.from({ length: 12 }, (_, i) => start + i) })
const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(viewDate.value), { weekStartsOn: props.weekStartsOn })
  const end = endOfWeek(endOfMonth(viewDate.value), { weekStartsOn: props.weekStartsOn })
  return eachDayOfInterval({ start, end }).map(d => ({
    date: d, dateStr: format(d, 'yyyy-MM-dd'), dayNum: d.getDate(),
    isCurrentMonth: isSameMonth(d, viewDate.value), isToday: isSameDay(d, new Date()),
    isDisabled: !!((props.minDate && isBefore(d, parseISO(props.minDate))) || (props.maxDate && isAfter(d, parseISO(props.maxDate)))),
    isSelected: props.range ? !!((fromDate.value && isSameDay(d, fromDate.value)) || (toDate.value && isSameDay(d, toDate.value))) : !!(props.modelValue && isSameDay(d, parseISO(props.modelValue)))
  }))
})
function dayClasses(day) { const d = day.date; const c = []; if (day.isToday && !day.isDisabled) c.push('dp-day--today'); if (!day.isCurrentMonth) c.push('dp-day--other');
  if (props.range) { const f = fromDate.value; const t = toDate.value; const h = hoveredDate.value;
    if (f && t && isWithinInterval(d, { start: f, end: t })) { if (isSameDay(d, f)) c.push('dp-day--range-start','dp-day--in-range'); else if (isSameDay(d, t)) c.push('dp-day--range-end','dp-day--in-range'); else c.push('dp-day--in-range') }
    if (f && !t && h && !isSameDay(h, f)) { const start = isBefore(h, f) ? h : f; const end = isBefore(h, f) ? f : h; if (isWithinInterval(d, { start, end })) { c.push('dp-day--range-preview'); if (isSameDay(d, start)) c.push('dp-day--range-start'); if (isSameDay(d, end)) c.push('dp-day--range-end') } }
    if (f && isSameDay(d, f) && !t) c.push('dp-day--selected'); if (f && t && isSameDay(d, f)) c.push('dp-day--selected'); if (t && isSameDay(d, t) && !isSameDay(d, f)) c.push('dp-day--selected')
  } else { if (props.modelValue && isSameDay(d, parseISO(props.modelValue))) c.push('dp-day--selected') }
  return c }
function toggleOpen() { isOpen.value = !isOpen.value; if (isOpen.value) { showYearPicker.value = false; viewDate.value = new Date() } }
function toggleYearPicker() { showYearPicker.value = !showYearPicker.value }
function pickYear(y) { viewDate.value = setYear(viewDate.value, y); showYearPicker.value = false }
function goMonth(dir) { viewDate.value = dir === 1 ? addMonths(viewDate.value, 1) : subMonths(viewDate.value, 1) }
function canGoMonth(dir) { return true }
function pickDay(day) { if (day.isDisabled) return; if (props.range) { if (rangeSelectionPhase.value === 'from') { emit('update:from', day.dateStr); if (props.to) emit('update:to', ''); rangeSelectionPhase.value = 'to' } else { if (props.from && isBefore(day.date, parseISO(props.from))) { emit('update:to', props.from); emit('update:from', day.dateStr) } else { emit('update:to', day.dateStr) }; rangeSelectionPhase.value = 'from'; emit('change', { from: props.from, to: props.to }); isOpen.value = false } } else { emit('update:modelValue', day.dateStr); emit('change', day.dateStr); isOpen.value = false } }
function applyPreset(preset) { if (!props.range) return; let from, to; if (preset.getRange) { const r = preset.getRange(); from = r.from; to = r.to } else if (preset.days) { from = subDays(new Date(), preset.days - 1); to = new Date() } else return; emit('update:from', format(from, 'yyyy-MM-dd')); emit('update:to', format(to, 'yyyy-MM-dd')); rangeSelectionPhase.value = 'from'; emit('change', { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') }); isOpen.value = false }
function handleClickOutside(e) { if (rootRef.value && !rootRef.value.contains(e.target)) { isOpen.value = false; showYearPicker.value = false; rangeSelectionPhase.value = 'from' } }
onMounted(() => document.addEventListener('click', handleClickOutside)); onUnmounted(() => document.removeEventListener('click', handleClickOutside))
function onDayMouseEnter(day) { if (props.range && fromDate.value && !toDate.value) hoveredDate.value = day.date }
</script>
<style scoped>
.dp-root { position: relative; display: block; min-width: 120px; width: 100%; font-family: inherit; user-select: none; }
.dp-trigger { cursor: pointer; }
.dp-input { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid var(--border, #E2E8F0); border-radius: 8px; background: var(--surface, #fff); color: var(--text-primary, #1E293B); font-family: inherit; font-weight: 500; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; min-height: 36px; white-space: nowrap; }
.dp-input:hover { border-color: var(--color-primary-light, #4CAF50); }
.dp-input--focused { border-color: var(--color-primary, #2E7D32); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-light, #4CAF50) 20%, transparent); }
.dp-input-icon { width: 14px; height: 14px; color: var(--text-muted, #94A3B8); flex-shrink: 0; }
.dp-chevron { width: 14px; height: 14px; color: var(--text-muted, #94A3B8); margin-left: auto; flex-shrink: 0; transition: transform 0.2s ease; }
.dp-chevron--open { transform: rotate(180deg); }
.dp-single-text { font-size: 0.8125rem; color: var(--text-primary, #1E293B); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dp-range-part { font-size: 0.8125rem; color: var(--text-primary, #1E293B); white-space: nowrap; }
.dp-range-sep { font-size: 0.75rem; color: var(--text-muted, #94A3B8); margin: 0 2px; }
.dp-placeholder { color: var(--text-muted, #94A3B8) !important; }
.dp-dropdown { position: absolute; top: calc(100% + 6px); left: 0; z-index: 1000; width: 300px; background: var(--surface, #fff); border: 1px solid var(--border, #E2E8F0); border-radius: 12px; box-shadow: var(--shadow-modal, 0 20px 60px rgba(0,0,0,0.15)); padding: 16px; animation: dpFadeIn 0.15s ease-out; }
@keyframes dpFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
.dp-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.dp-nav-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 8px; background: transparent; color: var(--text-secondary, #64748B); cursor: pointer; }
.dp-nav-btn:hover:not(:disabled) { background: var(--border-light, #F1F5F9); }
.dp-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.dp-header-title { display: inline-flex; align-items: center; gap: 4px; font-size: 0.9375rem; font-weight: 700; color: var(--text-primary, #1E293B); background: none; border: none; cursor: pointer; padding: 4px 10px; border-radius: 6px; }
.dp-header-title:hover { background: var(--border-light, #F1F5F9); }
.dp-header-chevron { transition: transform 0.2s ease; }
.dp-header-chevron--up { transform: rotate(180deg); }
.dp-year-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 12px; max-height: 200px; overflow-y: auto; padding: 4px 0; }
.dp-year-btn { padding: 6px 4px; font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary, #64748B); background: transparent; border: none; border-radius: 6px; cursor: pointer; }
.dp-year-btn:hover { background: var(--border-light, #F1F5F9); color: var(--text-primary, #1E293B); }
.dp-year-active { background: var(--color-primary, #2E7D32) !important; color: #fff !important; font-weight: 700; }
.dp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; }
.dp-weekday { text-align: center; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted, #94A3B8); padding: 6px 0; }
.dp-day-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.dp-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 500; color: var(--text-primary, #1E293B); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.1s ease; position: relative; }
.dp-day:hover:not(:disabled) { background: var(--border-light, #F1F5F9); }
.dp-day:disabled { cursor: default; }
.dp-day--other { color: var(--text-muted, #94A3B8); opacity: 0.45; }
.dp-day--today { font-weight: 700; color: var(--color-primary, #2E7D32); }
.dp-day--today::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: var(--color-primary, #2E7D32); }
.dp-day--selected { background: var(--color-primary, #2E7D32) !important; color: #fff !important; font-weight: 700; }
.dp-day--in-range { background: color-mix(in srgb, var(--color-primary, #2E7D32) 12%, transparent); border-radius: 0; }
.dp-day--range-start { background: var(--color-primary, #2E7D32) !important; color: #fff !important; border-radius: 8px 0 0 8px; }
.dp-day--range-end { background: var(--color-primary, #2E7D32) !important; color: #fff !important; border-radius: 0 8px 8px 0; }
.dp-day--range-preview { background: color-mix(in srgb, var(--color-primary-light, #4CAF50) 10%, transparent); border-radius: 0; }
.dp-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light, #F1F5F9); }
.dp-footer-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted, #94A3B8); margin-bottom: 8px; }
.dp-preset-row { display: flex; flex-wrap: wrap; gap: 6px; }
.dp-preset-btn { padding: 5px 12px; font-size: 0.75rem; font-weight: 600; color: var(--color-primary, #2E7D32); background: color-mix(in srgb, var(--color-primary, #2E7D32) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-primary, #2E7D32) 20%, transparent); border-radius: 6px; cursor: pointer; }
.dp-preset-btn:hover { background: var(--color-primary, #2E7D32); color: #fff; }
.dp-drop-enter-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.dp-drop-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dp-drop-enter-from, .dp-drop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
