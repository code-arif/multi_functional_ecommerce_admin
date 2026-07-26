<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-4">
      <DatePicker v-model:from="filters.from" v-model:to="filters.to" :presets="presets" range placeholder="Date range" display-format="MMM dd, yyyy" />
      <button @click="loadAll" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="printReport" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5"><Printer class="w-4 h-4" /><span>Print Report</span></button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><div class="af-stat-icon" style="background:color-mix(in srgb,var(--color-primary)15%,transparent);color:var(--color-primary)"><LinkIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Affiliates</p><p class="af-stat-value">89</p></div></div>
      <div class="stat-card"><div class="af-stat-icon" style="background:color-mix(in srgb,var(--info)15%,transparent);color:var(--info)"><CursorArrowRaysIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Clicks</p><p class="af-stat-value">45,230</p></div></div>
      <div class="stat-card"><div class="af-stat-icon" style="background:color-mix(in srgb,var(--success)15%,transparent);color:var(--success)"><ShoppingBagIcon class="w-5 h-5" /></div><div><p class="label mb-0">Conversions</p><p class="af-stat-value">3,847</p></div></div>
      <div class="stat-card"><div class="af-stat-icon" style="background:color-mix(in srgb,#8B5CF6 15%,transparent);color:#8B5CF6"><BanknotesIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Commission</p><p class="af-stat-value">৳185,400</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-5"><h3 class="af-chart-title mb-4">Clicks &amp; Conversions</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
      <div class="card p-5"><h3 class="af-chart-title mb-4">Commission Overview</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
    </div>
    <div class="card overflow-hidden">
      <div class="p-4 border-b" style="border-color:var(--border-light)"><h3 class="af-section-title">Top Affiliates</h3></div>
      <table class="w-full">
        <thead :style="{backgroundColor:'var(--border-light)'}"><tr><th class="table-header">#</th><th class="table-header">Affiliate</th><th class="table-header">Clicks</th><th class="table-header">Conversions</th><th class="table-header">Commission</th></tr></thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="table-row">
            <td class="table-cell w-12 text-center font-bold" style="color:var(--text-muted)">{{ i }}</td>
            <td class="table-cell font-semibold" style="color:var(--text-primary)">Affiliate {{ i }}</td>
            <td class="table-cell">{{ Math.floor(Math.random()*2000)+100 }}</td>
            <td class="table-cell"><span class="badge badge-green">{{ Math.floor(Math.random()*150)+10 }}</span></td>
            <td class="table-cell font-bold" style="color:var(--color-primary)">৳{{ (Math.random()*80000+5000).toLocaleString(undefined,{maximumFractionDigits:0}) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { startOfYear } from 'date-fns'
import DatePicker from '@/components/common/DatePicker.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { Printer } from 'lucide-vue-next'
import { LinkIcon, CursorArrowRaysIcon, ShoppingBagIcon, BanknotesIcon, ChartBarSquareIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [
    { label: 'Affiliate Reports', icon: ChartBarSquareIcon }
])

const filters = ref({ from: new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) })
const presets = [{label:'7 Days',days:7},{label:'30 Days',days:30},{label:'90 Days',days:90},{label:'This Year',getRange:()=>({from:startOfYear(new Date()),to:new Date()})}]
function loadAll() {}
function printReport() { window.print() }
</script>
<style scoped>
.af-stat-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background-color .25s ease,color .25s ease; }
.af-stat-value { font-size:1.25rem;font-weight:900;color:var(--text-primary);margin:0; }
.af-chart-title, .af-section-title { font-weight:700;color:var(--text-primary);margin:0;font-size:.9375rem; }
</style>
