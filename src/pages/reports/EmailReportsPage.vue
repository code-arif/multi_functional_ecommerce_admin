<template>
  <div>
    <BreadcrumbHeader :items="breadcrumbItems" />
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-4">
      <DatePicker v-model:from="filters.from" v-model:to="filters.to" :presets="presets" range placeholder="Date range" display-format="MMM dd, yyyy" />
      <button @click="loadAll" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="printReport" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5"><Printer class="w-4 h-4" /><span>Print Report</span></button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><div class="er-stat-icon" style="background:color-mix(in srgb,var(--color-primary)15%,transparent);color:var(--color-primary)"><EnvelopeIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Sent</p><p class="er-stat-value">89,240</p></div></div>
      <div class="stat-card"><div class="er-stat-icon" style="background:color-mix(in srgb,var(--info)15%,transparent);color:var(--info)"><EyeIcon class="w-5 h-5" /></div><div><p class="label mb-0">Opened</p><p class="er-stat-value">42,350</p></div></div>
      <div class="stat-card"><div class="er-stat-icon" style="background:color-mix(in srgb,var(--success)15%,transparent);color:var(--success)"><CursorArrowRaysIcon class="w-5 h-5" /></div><div><p class="label mb-0">Clicked</p><p class="er-stat-value">18,640</p></div></div>
      <div class="stat-card"><div class="er-stat-icon" style="background:color-mix(in srgb,var(--danger)15%,transparent);color:var(--danger)"><ExclamationTriangleIcon class="w-5 h-5" /></div><div><p class="label mb-0">Bounced</p><p class="er-stat-value">2,380</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-5"><h3 class="er-chart-title mb-4">Open &amp; Click Rate</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
      <div class="card p-5"><h3 class="er-chart-title mb-4">Email Performance</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
    </div>
    <div class="card overflow-hidden">
      <div class="p-4 border-b" style="border-color:var(--border-light)"><h3 class="er-section-title">Email Campaigns</h3></div>
      <table class="w-full">
        <thead :style="{backgroundColor:'var(--border-light)'}"><tr><th class="table-header">Campaign</th><th class="table-header">Sent</th><th class="table-header">Opens</th><th class="table-header">Clicks</th><th class="table-header">Bounce</th></tr></thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="table-row">
            <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ ['Weekly Newsletter','Sale Alert','New Products','Abandoned Cart','Welcome Series'][i-1] }}</td>
            <td class="table-cell">{{ (Math.random()*8000+2000).toFixed(0) }}</td>
            <td class="table-cell">{{ (Math.random()*4000+800).toFixed(0) }} <span class="badge badge-blue" style="font-size:10px">{{ (Math.random()*30+25).toFixed(0) }}%</span></td>
            <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ (Math.random()*1500+200).toFixed(0) }}</td>
            <td class="table-cell"><span class="badge badge-gray">{{ (Math.random()*3+0.5).toFixed(1) }}%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { startOfYear } from 'date-fns'
import DatePicker from '@ecom/ui/components/DatePicker.vue'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import { Printer } from 'lucide-vue-next'
import { EnvelopeIcon, EyeIcon, CursorArrowRaysIcon, ExclamationTriangleIcon, ChartBarSquareIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [
    { label: 'Email Reports', icon: ChartBarSquareIcon }
])

const filters = ref({ from: new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) })
const presets = [{label:'7 Days',days:7},{label:'30 Days',days:30},{label:'90 Days',days:90},{label:'This Year',getRange:()=>({from:startOfYear(new Date()),to:new Date()})}]
function loadAll() {}
function printReport() { window.print() }
</script>
<style scoped>
.er-stat-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background-color .25s ease,color .25s ease; }
.er-stat-value { font-size:1.25rem;font-weight:900;color:var(--text-primary);margin:0; }
.er-chart-title, .er-section-title { font-weight:700;color:var(--text-primary);margin:0;font-size:.9375rem; }
</style>
