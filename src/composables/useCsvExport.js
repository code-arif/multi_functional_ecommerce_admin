/**
 * useCsvExport — Reusable composable for exporting data to CSV
 *
 * Usage:
 *   const { exportToCsv } = useCsvExport()
 *   exportToCsv(
 *     [{ name: 'Widget', price: 10 }, { name: 'Gadget', price: 20 }],
 *     [
 *       { key: 'name', label: 'Product Name' },
 *       { key: 'price', label: 'Price (৳)', transform: v => `৳${v}` },
 *     ],
 *     'products-export'
 *   )
 */

import { useToast } from 'vue-toastification'

export function useCsvExport() {
  const toast = useToast()

  /**
   * @param {Array<Object>} data       - Array of objects to export
   * @param {Array<{key: string, label: string, transform?: Function}>} columns
   *        - Column definitions with optional transform function
   * @param {string} fileName           - Output file name (without extension)
   */
  function exportToCsv(data, columns, fileName = 'export') {
    if (!data || !data.length) {
      toast.error('No data to export.')
      return
    }

    try {
      const headers = columns.map(c => c.label)
      const rows = data.map(item =>
        columns.map(col => {
          const value = item[col.key]
          const transformed = col.transform ? col.transform(value, item) : value
          // Escape CSV: wrap in quotes if contains comma, quote, or newline
          const str = String(transformed ?? '')
          if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
      )

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const bom = '\uFEFF' // UTF-8 BOM for Excel compatibility
      const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const timestamp = new Date().toISOString().slice(0, 10)
      a.download = `${fileName}-${timestamp}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Exported ${data.length} records.`)
    } catch {
      toast.error('Failed to export CSV.')
    }
  }

  return { exportToCsv }
}
