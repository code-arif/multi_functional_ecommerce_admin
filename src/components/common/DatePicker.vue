<template>
  <div class="dp-root" ref="rootRef">
    <!-- ─── Trigger / Display ─── -->
    <div class="dp-trigger" @click="toggleOpen">
      <div class="dp-input" :class="{ 'dp-input--focused': isOpen, 'dp-input--range': range }">
        <CalendarIcon class="dp-input-icon" />

        <!-- Range mode display -->
        <template v-if="range">
          <span class="dp-range-part" :class="{ 'dp-range-part--active': rangeSelectionPhase === 'from' }">
            {{ displayFrom || (placeholder ? placeholder + ' (From)' : 'From') }}
          </span>
          <span class="dp-range-sep">→</span>
          <span class="dp-range-part" :class="{ 'dp-range-part--active': rangeSelectionPhase === 'to' }">
            {{ displayTo || (placeholder ? placeholder + ' (To)' : 'To') }}
          </span>
        </template>

        <!-- Single mode display -->
        <span v-else class="dp-single-text" :class="{ 'dp-placeholder': !displayText }">
          {{ displayText || placeholder || 'Select date' }}
        </span>

        <ChevronDownIcon class="dp-chevron" :class="{ 'dp-chevron--open': isOpen }" />
      </div>
    </div>

    <!-- ─── Dropdown Calendar ─── -->
    <transition name="dp-drop">
      <div v-if="isOpen" class="dp-dropdown" @click.stop>
        <!-- Month/Year Header -->
        <div class="dp-cal-header">
          <button class="dp-nav-btn" @click="goMonth(-1)" :disabled="!canGoMonth(-1)"
            :aria-label="'Previous month'">
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          <button class="dp-header-title" @click="toggleYearPicker">
            {{ monthYearLabel }}
            <ChevronDownIcon class="w-3 h-3 dp-header-chevron"
              :class="{ 'dp-header-chevron--up': showYearPicker }" />
          </button>
          <button class="dp-nav-btn" @click="goMonth(1)" :disabled="!canGoMonth(1)"
            :aria-label="'Next month'">
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Year Grid -->
        <transition name="dp-year-fade">
          <div v-if="showYearPicker" class="dp-year-grid">
            <button v-for="y in yearRange" :key="y"
              class="dp-year-btn"
              :class="{ 'dp-year-active': y === viewYear }"
              @click="pickYear(y)">
              {{ y }}
            </button>
          </div>
        </transition>

        <!-- Weekday Headers -->
        <div class="dp-weekdays">
          <span v-for="d in dayLabels" :key="d" class="dp-weekday">{{ d }}</span>
        </div>

        <!-- Day Grid -->
        <div class="dp-day-grid" role="grid" :aria-label="monthYearLabel">
          <button v-for="(day, idx) in calendarDays" :key="idx"
            role="gridcell"
            class="dp-day"
            :class="dayClasses(day)"
            :disabled="!day.isCurrentMonth || day.isDisabled"
            @click="pickDay(day)"
            @mouseenter="onDayMouseEnter(day)"
            :aria-label="day.dateStr"
            :aria-selected="day.isSelected"
            :title="day.dateStr">
            {{ day.dayNum }}
          </button>
        </div>

        <!-- Footer: Range Presets -->
        <div v-if="range && presets.length" class="dp-footer">
          <div class="dp-footer-label">Quick Select</div>
          <div class="dp-preset-row">
            <button v-for="p in presets" :key="p.label"
              class="dp-preset-btn"
              @click="applyPreset(p)">
              {{ p.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  format,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval,
  addMonths, subMonths,
  isSameDay, isBefore, isAfter, isWithinInterval,
  isSameMonth,
  parseISO,
  subDays,
  getYear, setYear,
} from 'date-fns'
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

/* ─── Props ─── */
const props = defineProps({
  /** Single date mode: the v-model value (YYYY-MM-DD string) */
  modelValue: { type: String, default: '' },
  /** Range mode: start date */
  from: { type: String, default: '' },
  /** Range mode: end date */
  to: { type: String, default: '' },
  /** Enable date range mode (uses from / to props) */
  range: { type: Boolean, default: false },
  /** Array of preset objects: { label: string, days?: number, getRange?: () => { from: Date, to: Date } } */
  presets: { type: Array, default: () => [] },
  /** Placeholder text */
  placeholder: { type: String, default: '' },
  /** Date display format (date-fns format string) */
  displayFormat: { type: String, default: 'MMM dd, yyyy' },
  /** Minimum selectable date (YYYY-MM-DD or Date) */
  minDate: { type: [String, Date], default: null },
  /** Maximum selectable date (YYYY-MM-DD or Date) */
  maxDate: { type: [String, Date], default: null },
  /** Day week starts on: 0=Sunday, 1=Monday (default Monday) */
  weekStartsOn: { type: Number, default: 1 },
})

const emit = defineEmits(['update:modelValue', 'update:from', 'update:to', 'change'])

/* ─── State ─── */
const isOpen = ref(false)
const showYearPicker = ref(false)
const rootRef = ref(null)
const viewDate = ref(new Date()) // Current month/year being viewed
const hoveredDate = ref(null)    // For range preview on hover
const rangeSelectionPhase = ref('from') // 'from' | 'to' - which part of range is being selected

/* ─── Computed ─── */
const viewYear = computed(() => viewDate.value.getFullYear())

const monthYearLabel = computed(() => format(viewDate.value, 'MMMM yyyy'))

const fromDate = computed(() => props.from ? parseISO(props.from) : null)
const toDate = computed(() => props.to ? parseISO(props.to) : null)

const displayText = computed(() =>
  props.modelValue ? format(parseISO(props.modelValue), props.displayFormat) : ''
)
const displayFrom = computed(() =>
  props.from ? format(parseISO(props.from), props.displayFormat) : ''
)
const displayTo = computed(() =>
  props.to ? format(parseISO(props.to), props.displayFormat) : ''
)

const minDateObj = computed(() => {
  if (!props.minDate) return null
  return typeof props.minDate === 'string' ? parseISO(props.minDate) : props.minDate
})
const maxDateObj = computed(() => {
  if (!props.maxDate) return null
  return typeof props.maxDate === 'string' ? parseISO(props.maxDate) : props.maxDate
})

const dayLabels = computed(() => {
  const base = props.weekStartsOn === 0
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return base
})

// Year picker: show 12 years around current view year
const yearRange = computed(() => {
  const start = viewYear.value - 6
  return Array.from({ length: 12 }, (_, i) => start + i)
})

/* ─── Calendar Day Grid ─── */
const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(viewDate.value), { weekStartsOn: props.weekStartsOn })
  const end = endOfWeek(endOfMonth(viewDate.value), { weekStartsOn: props.weekStartsOn })
  const days = eachDayOfInterval({ start, end })

  return days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    const isCurrentMonth = isSameMonth(d, viewDate.value)
    const isDisabled = !!(
      (minDateObj.value && isBefore(d, minDateObj.value) && !isSameDay(d, minDateObj.value)) ||
      (maxDateObj.value && isAfter(d, maxDateObj.value) && !isSameDay(d, maxDateObj.value))
    )
    return {
      date: d,
      dateStr,
      dayNum: d.getDate(),
      isCurrentMonth,
      isDisabled,
      isToday: isSameDay(d, new Date()),
      isSelected: props.range
        ? !!((fromDate.value && isSameDay(d, fromDate.value)) || (toDate.value && isSameDay(d, toDate.value)))
        : !!(props.modelValue && isSameDay(d, parseISO(props.modelValue))),
    }
  })
})

/* ─── Day CSS classes ─── */
function dayClasses(day) {
  const d = day.date
  const classes = []

  if (day.isToday && !day.isDisabled) classes.push('dp-day--today')
  if (!day.isCurrentMonth) classes.push('dp-day--other')

  if (props.range) {
    const f = fromDate.value
    const t = toDate.value
    const h = hoveredDate.value

    // Selected range
    if (f && t && isWithinInterval(d, { start: f, end: t })) {
      if (isSameDay(d, f)) classes.push('dp-day--range-start', 'dp-day--in-range')
      else if (isSameDay(d, t)) classes.push('dp-day--range-end', 'dp-day--in-range')
      else classes.push('dp-day--in-range')
    }

    // Hover preview range
    if (f && !t && h && !isSameDay(h, f)) {
      const start = isBefore(h, f) ? h : f
      const end = isBefore(h, f) ? f : h
      if (isWithinInterval(d, { start, end })) {
        classes.push('dp-day--range-preview')
        if (isSameDay(d, start)) classes.push('dp-day--range-start')
        if (isSameDay(d, end)) classes.push('dp-day--range-end')
      }
    }

    // "From" selected date
    if (f && isSameDay(d, f) && !t) classes.push('dp-day--selected')
    if (f && t && isSameDay(d, f)) classes.push('dp-day--selected')
    if (t && isSameDay(d, t) && !isSameDay(d, f)) classes.push('dp-day--selected')
  } else {
    // Single mode
    if (props.modelValue && isSameDay(d, parseISO(props.modelValue))) {
      classes.push('dp-day--selected')
    }
  }

  return classes
}

/* ─── Actions ─── */
function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    showYearPicker.value = false
    // Reset view date to currently selected date if available
    if (props.range && props.from) {
      viewDate.value = parseISO(props.from)
    } else if (!props.range && props.modelValue) {
      viewDate.value = parseISO(props.modelValue)
    } else {
      viewDate.value = new Date()
    }
  }
}

function toggleYearPicker() {
  showYearPicker.value = !showYearPicker.value
}

function pickYear(y) {
  viewDate.value = setYear(viewDate.value, y)
  showYearPicker.value = false
}

function goMonth(dir) {
  viewDate.value = dir === 1 ? addMonths(viewDate.value, 1) : subMonths(viewDate.value, 1)
}

function canGoMonth(dir) {
  const next = dir === 1 ? addMonths(viewDate.value, 1) : subMonths(viewDate.value, 1)
  if (minDateObj.value && isBefore(endOfMonth(next), minDateObj.value)) return false
  if (maxDateObj.value && isAfter(startOfMonth(next), maxDateObj.value)) return false
  return true
}

function pickDay(day) {
  if (day.isDisabled) return

  if (props.range) {
    if (rangeSelectionPhase.value === 'from') {
      // Clear previous "to" when selecting a new "from"
      emit('update:from', day.dateStr)
      if (props.to) emit('update:to', '')
      rangeSelectionPhase.value = 'to'
    } else {
      // If "to" is before "from", swap
      if (props.from && isBefore(day.date, parseISO(props.from))) {
        emit('update:to', props.from)
        emit('update:from', day.dateStr)
      } else {
        emit('update:to', day.dateStr)
      }
      rangeSelectionPhase.value = 'from'
      emit('change', { from: props.from, to: props.to })
      isOpen.value = false
    }
  } else {
    emit('update:modelValue', day.dateStr)
    emit('change', day.dateStr)
    isOpen.value = false
  }
}

function applyPreset(preset) {
  if (!props.range) return

  let from, to
  if (preset.getRange) {
    const range = preset.getRange()
    from = range.from
    to = range.to
  } else if (preset.days) {
    from = subDays(new Date(), preset.days - 1)
    to = new Date()
  } else if (preset.month) {
    // e.g. { label: 'This Month', month: 'current' }
    from = startOfMonth(new Date())
    to = new Date()
  } else {
    return
  }

  emit('update:from', format(from, 'yyyy-MM-dd'))
  emit('update:to', format(to, 'yyyy-MM-dd'))
  rangeSelectionPhase.value = 'from'
  emit('change', { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') })
  isOpen.value = false
}

/* ─── Click Outside ─── */
function handleClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    isOpen.value = false
    showYearPicker.value = false
    rangeSelectionPhase.value = 'from'
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

/* ─── Mouse hover for range preview ─── */
function onDayMouseEnter(day) {
  if (props.range && fromDate.value && !toDate.value) {
    hoveredDate.value = day.date
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   DATE PICKER — Theme-Aware Styles
   ═══════════════════════════════════════════════════ */

.dp-root {
  position: relative;
  display: inline-block;
  min-width: 150px;
  width: 100%;
  font-family: inherit;
  user-select: none;
}

/* ─── Trigger Input ─── */
.dp-trigger {
  cursor: pointer;
}

.dp-input {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid var(--border, #E2E8F0);
  border-radius: 8px;
  background: var(--surface, #fff);
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.25s ease;
  min-height: 30px;
}

.dp-input:hover {
  border-color: var(--color-primary-light, #4CAF50);
}

.dp-input--focused {
  border-color: var(--color-primary, #2E7D32);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-light, #4CAF50) 20%, transparent);
}

.dp-input-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted, #94A3B8);
  flex-shrink: 0;
}

.dp-chevron {
  width: 14px;
  height: 14px;
  color: var(--text-muted, #94A3B8);
  margin-left: auto;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.dp-chevron--open {
  transform: rotate(180deg);
}

.dp-single-text {
  font-size: 0.8125rem;
  color: var(--text-primary, #1E293B);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dp-placeholder {
  color: var(--text-muted, #94A3B8) !important;
}

/* Range mode */
.dp-input--range {
  gap: 2px;
}

.dp-range-part {
  font-size: 0.8125rem;
  color: var(--text-primary, #1E293B);
  padding: 1px 4px;
  border-radius: 4px;
  transition: background-color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.dp-range-part--active {
  background: color-mix(in srgb, var(--color-primary, #2E7D32) 12%, transparent);
  color: var(--color-primary, #2E7D32);
  font-weight: 600;
}

.dp-range-sep {
  color: var(--text-muted, #94A3B8);
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* ─── Dropdown ─── */
.dp-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1000;
  width: 300px;
  background: var(--surface, #fff);
  border: 1px solid var(--border, #E2E8F0);
  border-radius: 12px;
  box-shadow: var(--shadow-modal, 0 20px 60px rgba(0,0,0,0.15));
  padding: 16px;
  animation: dpFadeIn 0.15s ease-out;
}

@keyframes dpFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Calendar Header ─── */
.dp-cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dp-nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #64748B);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.dp-nav-btn:hover:not(:disabled) {
  background: var(--border-light, #F1F5F9);
  color: var(--text-primary, #1E293B);
}

.dp-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dp-header-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary, #1E293B);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background-color 0.15s;
}

.dp-header-title:hover {
  background: var(--border-light, #F1F5F9);
}

.dp-header-chevron {
  transition: transform 0.2s ease;
}

.dp-header-chevron--up {
  transform: rotate(180deg);
}

/* ─── Year Grid ─── */
.dp-year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px 0;
}

.dp-year-btn {
  padding: 6px 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary, #64748B);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s;
}

.dp-year-btn:hover {
  background: var(--border-light, #F1F5F9);
  color: var(--text-primary, #1E293B);
}

.dp-year-active {
  background: var(--color-primary, #2E7D32) !important;
  color: #fff !important;
  font-weight: 700;
}

/* ─── Weekday Labels ─── */
.dp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.dp-weekday {
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted, #94A3B8);
  padding: 6px 0;
}

/* ─── Day Grid ─── */
.dp-day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.dp-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary, #1E293B);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
  position: relative;
}

.dp-day:hover:not(:disabled) {
  background: var(--border-light, #F1F5F9);
}

.dp-day:disabled {
  cursor: default;
}

/* Other month */
.dp-day--other {
  color: var(--text-muted, #94A3B8);
  opacity: 0.45;
}

/* Today */
.dp-day--today {
  font-weight: 700;
  color: var(--color-primary, #2E7D32);
}

.dp-day--today::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-primary, #2E7D32);
}

/* Selected (single mode) */
.dp-day--selected {
  background: var(--color-primary, #2E7D32) !important;
  color: #fff !important;
  font-weight: 700;
}

.dp-day--selected::after {
  display: none;
}

/* Range selection */
.dp-day--in-range {
  background: color-mix(in srgb, var(--color-primary, #2E7D32) 12%, transparent);
  border-radius: 0;
}

.dp-day--range-start {
  background: var(--color-primary, #2E7D32) !important;
  color: #fff !important;
  font-weight: 700;
  border-radius: 8px 0 0 8px;
}

.dp-day--range-end {
  background: var(--color-primary, #2E7D32) !important;
  color: #fff !important;
  font-weight: 700;
  border-radius: 0 8px 8px 0;
}

.dp-day--range-start.dp-day--range-end {
  border-radius: 8px;
}

.dp-day--range-preview {
  background: color-mix(in srgb, var(--color-primary-light, #4CAF50) 10%, transparent);
  border-radius: 0;
}

/* ─── Footer / Presets ─── */
.dp-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light, #F1F5F9);
}

.dp-footer-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted, #94A3B8);
  margin-bottom: 8px;
}

.dp-preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dp-preset-btn {
  padding: 5px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary, #2E7D32);
  background: color-mix(in srgb, var(--color-primary, #2E7D32) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary, #2E7D32) 20%, transparent);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.dp-preset-btn:hover {
  background: var(--color-primary, #2E7D32);
  color: #fff;
  border-color: var(--color-primary, #2E7D32);
}

.dp-preset-btn:active {
  transform: scale(0.96);
}

/* ─── Transition ─── */
.dp-drop-enter-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dp-drop-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dp-drop-enter-from,
.dp-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.dp-year-fade-enter-active,
.dp-year-fade-leave-active {
  transition: opacity 0.12s ease;
}
.dp-year-fade-enter-from,
.dp-year-fade-leave-to {
  opacity: 0;
}

/* ─── Responsive ─── */
@media (max-width: 400px) {
  .dp-dropdown {
    width: 280px;
    padding: 12px;
    left: -40px;
  }
}
</style>
