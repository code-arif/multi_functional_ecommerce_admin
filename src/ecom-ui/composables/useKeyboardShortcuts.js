import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
export function useKeyboardShortcuts() {
  const router = useRouter(); const shortcuts = ref([]); const pressedKeys = new Set()
  const defaultShortcuts = [
    { key: 'g+d', label: 'Dashboard', handler: () => router.push('/') },
    { key: 'g+o', label: 'Orders', handler: () => router.push('/orders') },
    { key: 'g+p', label: 'Products', handler: () => router.push('/products') },
    { key: 'Escape', label: 'Close / deselect', handler: () => document.activeElement?.blur() },
  ]
  function register(newShortcuts) { shortcuts.value = [...defaultShortcuts, ...newShortcuts] }
  function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) { if (e.key === 'Escape') e.target.blur(); return }
    pressedKeys.add(e.key.toLowerCase())
    for (const s of shortcuts.value) { if (!s.key.includes('+') && e.key.toLowerCase() === s.key.toLowerCase()) { e.preventDefault(); s.handler(); return } }
    for (const s of shortcuts.value) { if (s.key.includes('+') && s.key.split('+').map(k => k.trim().toLowerCase()).every(k => pressedKeys.has(k))) { e.preventDefault(); s.handler(); pressedKeys.clear(); return } }
  }
  function handleKeyup(e) { pressedKeys.delete(e.key.toLowerCase()) }
  function registerAll() { onMounted(() => document.addEventListener('keydown', handleKeydown)); onMounted(() => document.addEventListener('keyup', handleKeyup)); onUnmounted(() => document.removeEventListener('keydown', handleKeydown)); onUnmounted(() => document.removeEventListener('keyup', handleKeyup)) }
  return { shortcuts, register, registerAll }
}
