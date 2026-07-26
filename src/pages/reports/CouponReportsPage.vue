<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div class="card p-4 mb-6 flex flex-wrap items-center gap-4">
      <DatePicker v-model:from="filters.from" v-model:to="filters.to" :presets="presets" range placeholder="Date range" display-format="MMM dd, yyyy" />
      <button @click="loadAll" class="btn-primary text-sm py-1.5 px-4">Apply</button>
      <button @click="printReport" class="btn-secondary text-sm py-1.5 px-4 ml-auto flex items-center gap-1.5"><Printer class="w-4 h-4" /><span>Print Report</span></button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card"><div class="cr-stat-icon" style="background:color-mix(in srgb,var(--color-primary)15%,transparent);color:var(--color-primary)"><TicketIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Coupons</p><p class="cr2-stat-value">64</p></div></div>
      <div class="stat-card"><div class="cr-stat-icon" style="background:color-mix(in srgb,var(--info)15%,transparent);color:var(--info)"><ArrowPathIcon class="w-5 h-5" /></div><div><p class="label mb-0">Times Used</p><p class="cr2-stat-value">12,458</p></div></div>
      <div class="stat-card"><div class="cr-stat-icon" style="background:color-mix(in srgb,var(--success)15%,transparent);color:var(--success)"><BanknotesIcon class="w-5 h-5" /></div><div><p class="label mb-0">Total Discount</p><p class="cr2-stat-value">৳245,600</p></div></div>
      <div class="stat-card"><div class="cr-stat-icon" style="background:color-mix(in srgb,#8B5CF6 15%,transparent);color:#8B5CF6"><PercentBadgeIcon class="w-5 h-5" /></div><div><p class="label mb-0">Avg Discount</p><p class="cr2-stat-value">18.5%</p></div></div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-5"><h3 class="cr2-chart-title mb-4">Coupon Usage Over Time</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
      <div class="card p-5"><h3 class="cr2-chart-title mb-4">Discount Distribution</h3><div class="h-64 flex items-center justify-center" style="color:var(--text-muted)"><span class="text-sm">Chart data will render here</span></div></div>
    </div>
    <div class="card overflow-hidden">
      <div class="p-4 border-b" style="border-color:var(--border-light)"><h3 class="cr2-section-title">Most Used Coupons</h3></div>
      <table class="w-full">
        <thead :style="{backgroundColor:'var(--border-light)'}"><tr><th class="table-header">#</th><th class="table-header">Coupon Code</th><th class="table-header">Discount</th><th class="table-header">Times Used</th><th class="table-header">Total Discount</th></tr></thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="table-row">
            <td class="table-cell w-12 text-center font-bold" style="color:var(--text-muted)">{{ i }}</td>
            <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ ['WELCOME20','SUMMER15','FLASH50','VIP25','NEWUSER10'][i-1] }}</td>
            <td class="table-cell"><span class="badge badge-purple">{{ [20,15,50,25,10][i-1] }}%</span></td>
            <td class="table-cell font-semibold" style="color:var(--text-primary)">{{ Math.floor(Math.random()*2000)+100 }}</td>
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
import { TicketIcon, ArrowPathIcon, BanknotesIcon, PercentBadgeIcon, ChartBarSquareIcon } from '@heroicons/vue/24/outline'
const breadcrumbItems = computed(() => [
    { label: 'Coupon Reports', icon: ChartBarSquareIcon }
])

const filters = ref({ from: new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) })
const presets = [{label:'7 Days',days:7},{label:'30 Days',days:30},{label:'90 Days',days:90},{label:'This Year',getRange:()=>({from:startOfYear(new Date()),to:new Date()})}]
function loadAll() {}
function printReport() { window.print() }
</script>
<style scoped>
.cr2-stat-icon { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background-color .25s ease,color .25s ease; }
.cr2-stat-value { font-size:1.25rem;font-weight:900;color:var(--text-primary);margin:0; }
.cr2-chart-title, .cr2-section-title { font-weight:700;color:var(--text-primary);margin:0;font-size:.9375rem; }
</style>
