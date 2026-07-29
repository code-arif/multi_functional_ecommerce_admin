<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-4">
      <DatePicker v-model:from="filters.from" v-model:to="filters.to" :presets="presets" range placeholder="Date range" display-format="MMM dd, yyyy" />
      <button @click="loadAll" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="printReport" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5"><Printer class="w-4 h-4" /><span>Print Report</span></button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><div class="rv-stat-icon" style="background:color-mix(in srgb,var(--color-primary)15%,transparent);color:var(--color-primary)"><StarIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Reviews</p><p class="rv-stat-value">18,432</p></div></div>
      <div class="stat-card"><div class="rv-stat-icon" style="background:color-mix(in srgb,var(--success)15%,transparent);color:var(--success)"><CheckCircleIcon class="w-5 h-5" /></div><div><p class="label mb-0">Approved</p><p class="rv-stat-value">15,820</p></div></div>
      <div class="stat-card"><div class="rv-stat-icon" style="background:color-mix(in srgb,var(--warning)15%,transparent);color:var(--warning)"><ClockIcon class="w-5 h-5" /></div><div><p class="label mb-0">Pending</p><p class="rv-stat-value">1,874</p></div></div>
      <div class="stat-card"><div class="rv-stat-icon" style="background:color-mix(in srgb,var(--danger)15%,transparent);color:var(--danger)"><XCircleIcon class="w-5 h-5" /></div><div><p class="label mb-0">Rejected</p><p class="rv-stat-value">738</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-5"><h3 class="rv-chart-title mb-4">Reviews Over Time</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
      <div class="card p-5"><h3 class="rv-chart-title mb-4">Rating Distribution</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
    </div>
    <div class="card overflow-hidden">
      <div class="p-4 border-b" style="border-color:var(--border-light)"><h3 class="rv-section-title">Recent Reviews</h3></div>
      <table class="w-full">
        <thead :style="{backgroundColor:'var(--border-light)'}"><tr><th class="table-header">Product</th><th class="table-header">Customer</th><th class="table-header">Rating</th><th class="table-header">Status</th><th class="table-header">Date</th></tr></thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="table-row">
            <td class="table-cell font-semibold" style="color:var(--text-primary)">Product {{ i }}</td>
            <td class="table-cell">Customer {{ i }}</td>
            <td class="table-cell"><span class="badge badge-purple">{{ ['★★★★★','★★★★☆','★★★★★','★★★☆☆','★★★★★'][i-1] }}</span></td>
            <td class="table-cell"><span :class="['badge', ['green','green','green','yellow','green'][i-1] === 'green' ? 'badge-green' : 'badge-yellow']">{{ ['Approved','Approved','Approved','Pending','Approved'][i-1] }}</span></td>
            <td class="table-cell" style="color:var(--text-muted)">2026-07-{{ String(22-i).padStart(2,'0') }}</td>
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
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { Printer } from 'lucide-vue-next'
import { StarIcon, CheckCircleIcon, ClockIcon, XCircleIcon, ChartBarSquareIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [
    { label: 'Review Reports', icon: ChartBarSquareIcon }
])

const filters = ref({ from: new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) })
const presets = [{label:'7 Days',days:7},{label:'30 Days',days:30},{label:'90 Days',days:90},{label:'This Year',getRange:()=>({from:startOfYear(new Date()),to:new Date()})}]
function loadAll() {}
function printReport() { window.print() }
</script>
<style scoped>
.rv-stat-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background-color .25s ease,color .25s ease; }
.rv-stat-value { font-size:1.25rem;font-weight:900;color:var(--text-primary);margin:0; }
.rv-chart-title, .rv-section-title { font-weight:700;color:var(--text-primary);margin:0;font-size:.9375rem; }
</style>
