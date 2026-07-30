import { useToast } from 'vue-toastification'
export function useCsvExport() {
  const toast = useToast()
  function exportToCsv(data, columns, fileName = 'export') {
    if (!data || !data.length) { toast.error('No data to export.'); return }
    try {
      const headers = columns.map(c => c.label)
      const rows = data.map(item => columns.map(col => {
        const value = item[col.key]; const transformed = col.transform ? col.transform(value, item) : value
        const str = String(transformed ?? '')
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) return `"${str.replace(/"/g, '""')}"`
        return str
      }))
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const bom = '\uFEFF'; const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url
      a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
      toast.success(`Exported ${data.length} records.`)
    } catch { toast.error('Failed to export CSV.') }
  }
  return { exportToCsv }
}
