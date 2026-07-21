<template>
  <div>
    <PageHeader title="Notification Reports" subtitle="Push notification delivery and engagement analytics" />
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-4">
      <DatePicker v-model:from="filters.from" v-model:to="filters.to" :presets="presets" range placeholder="Date range" display-format="MMM dd, yyyy" />
      <button @click="loadAll" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="printReport" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5"><Printer class="w-4 h-4" /><span>Print Report</span></button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><div class="nr-stat-icon" style="background:color-mix(in srgb,var(--color-primary)15%,transparent);color:var(--color-primary)"><BellIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Sent</p><p class="nr-stat-value">245,800</p></div></div>
      <div class="stat-card"><div class="nr-stat-icon" style="background:color-mix(in srgb,var(--success)15%,transparent);color:var(--success)"><CheckCircleIcon class="w-5 h-5" /></div><div><p class="label mb-0">Delivered</p><p class="nr-stat-value">234,120</p></div></div>
      <div class="stat-card"><div class="nr-stat-icon" style="background:color-mix(in srgb,var(--danger)15%,transparent);color:var(--danger)"><ExclamationTriangleIcon class="w-5 h-5" /></div><div><p class="label mb-0">Failed</p><p class="nr-stat-value">4,820</p></div></div>
      <div class="stat-card"><div class="nr-stat-icon" style="background:color-mix(in srgb,var(--warning)15%,transparent);color:var(--warning)"><ClockIcon class="w-5 h-5" /></div><div><p class="label mb-0">Pending</p><p class="nr-stat-value">6,860</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-5"><h3 class="nr-chart-title mb-4">Notifications Over Time</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
      <div class="card p-5"><h3 class="nr-chart-title mb-4">Delivery Rate</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
    </div>
    <div class="card overflow-hidden">
      <div class="p-4 border-b" style="border-color:var(--border-light)"><h3 class="nr-section-title">Notification History</h3></div>
      <table class="w-full">
        <thead :style="{backgroundColor:'var(--border-light)'}"><tr><th class="table-header">Type</th><th class="table-header">Sent</th><th class="table-header">Delivered</th><th class="table-header">Status</th><th class="table-header">Date</th></tr></thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="table-row">
            <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ ['Order Update','Promotion','Alert','Reminder','Welcome'][i-1] }}</td>
            <td class="table-cell">{{ (Math.random()*5000+500).toFixed(0) }}</td>
            <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ (Math.random()*4800+480).toFixed(0) }}</td>
            <td class="table-cell"><span class="badge badge-green">Delivered</span></td>
            <td class="table-cell" style="color:var(--text-muted)">2026-07-{{ String(22-i).padStart(2,'0') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { startOfYear } from 'date-fns'
import PageHeader from '@/components/common/PageHeader.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import { Printer } from 'lucide-vue-next'
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/vue/24/outline'
const filters = ref({ from: new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) })
const presets = [{label:'7 Days',days:7},{label:'30 Days',days:30},{label:'90 Days',days:90},{label:'This Year',getRange:()=>({from:startOfYear(new Date()),to:new Date()})}]
function loadAll() {}
function printReport() { window.print() }
</script>
<style scoped>
.nr-stat-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background-color .25s ease,color .25s ease; }
.nr-stat-value { font-size:1.25rem;font-weight:900;color:var(--text-primary);margin:0; }
.nr-chart-title, .nr-section-title { font-weight:700;color:var(--text-primary);margin:0;font-size:.9375rem; }
</style>
