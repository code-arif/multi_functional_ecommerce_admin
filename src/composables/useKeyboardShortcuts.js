/**
 * useKeyboardShortcuts — Global keyboard shortcut registration
 *
 * Register shortcuts with:
 *   const shortcuts = useKeyboardShortcuts()
 *   shortcuts.register({
 *     key: 'g+d',     // Go to Dashboard
 *     label: 'Go to Dashboard',
 *     handler: () => router.push('/'),
 *   })
 *
 * Call registerAll() in App.vue or AdminLayout onMounted.
 * Call destroy() on onUnmounted to clean up.
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const shortcuts = ref([])
  const pressedKeys = new Set()
  let showHelp = false

  const defaultShortcuts = [
    {
      key: 'g+d',
      label: 'Dashboard',
      category: 'Navigation',
      handler: () => router.push('/'),
    },
    {
      key: 'g+o',
      label: 'Orders',
      category: 'Navigation',
      handler: () => router.push('/orders'),
    },
    {
      key: 'g+p',
      label: 'Products',
      category: 'Navigation',
      handler: () => router.push('/products'),
    },
    {
      key: 'g+u',
      label: 'Customers / Users',
      category: 'Navigation',
      handler: () => router.push('/users'),
    },
    {
      key: 'g+v',
      label: 'Vendors',
      category: 'Navigation',
      handler: () => router.push('/vendors'),
    },
    {
      key: 'g+s',
      label: 'Settings',
      category: 'Navigation',
      handler: () => router.push('/settings/general'),
    },
    {
      key: 'g+m',
      label: 'Messages / Chat',
      category: 'Navigation',
      handler: () => router.push('/messages'),
    },
    {
      key: 'g+r',
      label: 'Reports',
      category: 'Navigation',
      handler: () => router.push('/reports'),
    },
    {
      key: 'g+l',
      label: 'Activity Log',
      category: 'Navigation',
      handler: () => router.push('/activity-log'),
    },
    {
      key: '?',
      label: 'Toggle keyboard shortcuts help',
      category: 'System',
      handler: () => {
        showHelp = !showHelp
        if (showHelp) {
          showShortcutsHelp()
        } else {
          console.log('Shortcuts help closed.')
        }
      },
    },
    {
      key: 'g+?',
      label: 'Show all shortcuts in console',
      category: 'System',
      handler: () => showShortcutsHelp(),
    },
    {
      key: 'Escape',
      label: 'Close modals / deselect',
      category: 'System',
      handler: () => {
        // Close any open dropdowns by dispatching escape
        document.activeElement?.blur()
      },
    },
  ]

  function register(newShortcuts) {
    shortcuts.value = [...defaultShortcuts, ...newShortcuts]
  }

  function parseKeyCombo(combo) {
    return combo.split('+').map(k => k.trim().toLowerCase())
  }

  function matchCombo(combo, pressed) {
    const keys = parseKeyCombo(combo)
    return keys.every(k => pressed.has(k))
  }

  function handleKeydown(e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      if (e.key === 'Escape') {
        e.target.blur()
      }
      return
    }

    const key = e.key.toLowerCase()
    pressedKeys.add(key)
    if (e.shiftKey) pressedKeys.add('shift')
    if (e.ctrlKey || e.metaKey) pressedKeys.add('ctrl')
    if (e.altKey) pressedKeys.add('alt')

    // Check single-key shortcuts first (like "?" and "Escape")
    for (const s of shortcuts.value) {
      if (!s.key.includes('+') && key === s.key.toLowerCase()) {
        e.preventDefault()
        s.handler()
        return
      }
    }

    // Check combo shortcuts
    for (const s of shortcuts.value) {
      if (s.key.includes('+') && matchCombo(s.key, pressedKeys)) {
        e.preventDefault()
        s.handler()
        pressedKeys.clear()
        return
      }
    }
  }

  function handleKeyup(e) {
    pressedKeys.delete(e.key.toLowerCase())
    pressedKeys.delete('shift')
    pressedKeys.delete('ctrl')
    pressedKeys.delete('alt')
  }

  function handleBlur() {
    pressedKeys.clear()
  }

  function showShortcutsHelp() {
    // Group by category
    const grouped = {}
    for (const s of shortcuts.value) {
      const cat = s.category || 'Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(s)
    }

    const lines = ['\n⌨️  Keyboard Shortcuts', '═'.repeat(40)]
    for (const [cat, items] of Object.entries(grouped)) {
      lines.push(`\n  ${cat}:`)
      for (const item of items) {
        const keyStr = item.key.padEnd(12)
        lines.push(`    ${keyStr}  ${item.label}`)
      }
    }
    lines.push('\n  Press ? again to close this help.')
    console.log(lines.join('\n'))
  }

  function registerAll() {
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('keyup', handleKeyup)
      window.addEventListener('blur', handleBlur)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keyup', handleKeyup)
      window.removeEventListener('blur', handleBlur)
    })
  }

  return {
    shortcuts,
    register,
    registerAll,
    showShortcutsHelp,
  }
}
