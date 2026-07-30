import { reactive, ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

/**
 * Shared settings composable
 * @param {string[]} keys - Setting keys this panel manages
 * @param {string} label - Human-readable label for toasts
 * @param {Object} [api] - Optional API object with list() and update() methods.
 *                         If omitted, the admin_panel's own settingsApi is not assumed
 *                         (the admin caller must pass it explicitly).
 */
export function useSettings(keys, label, api = null) {
  const toast = useToast()
  const form = reactive({})
  const saving = ref(false)
  const loading = ref(true)

  keys.forEach(k => form[k] = '')

  onMounted(async () => {
    loading.value = true
    try {
      if (api) {
        const r = await api.list()
        const allSettings = Array.isArray(r.data.data)
          ? r.data.data
          : Object.values(r.data.data).flat()
        allSettings.forEach(s => {
          if (keys.includes(s.key)) form[s.key] = s.value ?? ''
        })
      }
    } catch { toast.error('Failed to load settings.') }
    finally { loading.value = false }
  })

  async function save() {
    if (!api) { toast.warning('Settings API not configured.'); return }
    saving.value = true
    try {
      const payload = { settings: Object.fromEntries(keys.map(k => [k, form[k] ?? ''])) }
      await api.update(payload)
      toast.success(`${label} settings saved.`)
    } catch { toast.error(`Failed to save ${label} settings.`) }
    finally { saving.value = false }
  }

  return { form, saving, loading, save }
}
