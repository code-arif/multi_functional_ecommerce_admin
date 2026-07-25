<template>
  <div ref="wrapperEl" class="tooltip-wrapper inline-flex" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
    <Teleport to="body">
      <transition name="tooltip-fade">
        <div v-if="show" ref="tooltipEl" class="tooltip-box" :class="[`tooltip--${position}`]">
          {{ text }}
          <div class="tooltip-arrow" />
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  position: { type: String, default: 'top', validator: v => ['top', 'bottom', 'left', 'right'].includes(v) },
  delay: { type: Number, default: 200 },
  disabled: Boolean,
})

const show = ref(false)
const wrapperEl = ref(null)
const tooltipEl = ref(null)
let timer = null
let cancelled = false

async function onEnter() {
  if (props.disabled) return
  cancelled = false
  clearTimeout(timer)

  // Wait for hover-intent delay, then render tooltip
  await new Promise(resolve => { timer = setTimeout(resolve, props.delay) })
  if (cancelled || props.disabled) return

  show.value = true

  // Wait for DOM to render, then position before paint
  await nextTick()
  if (tooltipEl.value && wrapperEl.value) {
    positionTooltip()
  }
}

function onLeave() {
  cancelled = true
  clearTimeout(timer)
  show.value = false
}

function positionTooltip() {
  if (!tooltipEl.value || !wrapperEl.value) return

  const wrapperRect = wrapperEl.value.getBoundingClientRect()
  const tipRect = tooltipEl.value.getBoundingClientRect()
  const gap = 8

  let top, left

  switch (props.position) {
    case 'top':
      top = wrapperRect.top - tipRect.height - gap
      left = wrapperRect.left + (wrapperRect.width / 2) - (tipRect.width / 2)
      break
    case 'bottom':
      top = wrapperRect.bottom + gap
      left = wrapperRect.left + (wrapperRect.width / 2) - (tipRect.width / 2)
      break
    case 'left':
      top = wrapperRect.top + (wrapperRect.height / 2) - (tipRect.height / 2)
      left = wrapperRect.left - tipRect.width - gap
      break
    case 'right':
      top = wrapperRect.top + (wrapperRect.height / 2) - (tipRect.height / 2)
      left = wrapperRect.right + gap
      break
  }

  // Keep tooltip within viewport bounds
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (left < 8) left = 8
  if (left + tipRect.width > vw - 8) left = vw - tipRect.width - 8
  if (top < 8) top = 8
  if (top + tipRect.height > vh - 8) top = vh - tipRect.height - 8

  tooltipEl.value.style.top = `${top}px`
  tooltipEl.value.style.left = `${left}px`
}

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
}

.tooltip-box {
  position: fixed;
  z-index: 9999;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  pointer-events: none;
  background: #1e1e2e;
  color: #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Arrow */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 5px solid transparent;
}

/* Position: Top */
.tooltip--top .tooltip-arrow {
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-top-color: #1e1e2e;
  border-bottom: none;
}

/* Position: Bottom */
.tooltip--bottom .tooltip-arrow {
  bottom: 100%;
  left: 50%;
  margin-left: -5px;
  border-bottom-color: #1e1e2e;
  border-top: none;
}

/* Position: Left */
.tooltip--left .tooltip-arrow {
  left: 100%;
  top: 50%;
  margin-top: -5px;
  border-left-color: #1e1e2e;
  border-right: none;
}

/* Position: Right */
.tooltip--right .tooltip-arrow {
  right: 100%;
  top: 50%;
  margin-top: -5px;
  border-right-color: #1e1e2e;
  border-left: none;
}

/* Animation */
.tooltip-fade-enter-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}
.tooltip-fade-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}

.tooltip--top.tooltip-fade-enter-from,
.tooltip--top.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
.tooltip--bottom.tooltip-fade-enter-from,
.tooltip--bottom.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.tooltip--left.tooltip-fade-enter-from,
.tooltip--left.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(4px);
}
.tooltip--right.tooltip-fade-enter-from,
.tooltip--right.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
