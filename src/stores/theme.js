import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'admin_color_theme'

  const colorTheme = ref(localStorage.getItem(STORAGE_KEY) || 'default')

  // ── Transition state ──
  let transitionTimer = null
  let isFirstApply = true

  function applyTheme() {
    const root = document.documentElement

    // Skip transition on initial page load to prevent color flash
    if (!isFirstApply) {
      root.classList.add('theme-transitioning')
    }
    isFirstApply = false

    // Apply the theme value
    root.setAttribute('data-theme', colorTheme.value)

    // Disable transitions after animation completes
    clearTimeout(transitionTimer)
    transitionTimer = setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 400)
  }

  function setColorTheme(theme) {
    colorTheme.value = theme
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme()
  }

  // Available themes with labels
  const themes = [
    { id: 'default', label: 'Default', icon: '🌿' },
    { id: 'tint', label: 'Tint', icon: '🎨' },
    { id: 'dark-aqua', label: 'Dark Aqua', icon: '🌊' },
  ]

  // Initial apply
  applyTheme()

  return {
    colorTheme,
    themes,
    setColorTheme,
  }
})
