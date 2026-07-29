<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div v-if="!campaign" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading campaign...
    </div>
    <template v-if="campaign">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 text-center"><p class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">{{ campaign.reach?.toLocaleString() }}</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Total Reach</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">{{ campaign.clicks?.toLocaleString() }}</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Total Clicks</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-black" :style="{ color: 'var(--color-primary)' }">{{ campaign.conversions || 0 }}</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Conversions</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-black" :style="{ color: 'var(--success)' }">{{ ((campaign.conversions||0) / (campaign.clicks||1) * 100).toFixed(1) }}%</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Conv. Rate</p></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }"><MegaphoneIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Campaign Info</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Type</span><span class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ campaign.type }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Status</span><StatusBadge :value="campaign.status" /></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Start</span><span :style="{ color: 'var(--text-primary)' }">{{ campaign.start_date }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">End</span><span :style="{ color: 'var(--text-primary)' }">{{ campaign.end_date || 'Ongoing' }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Budget</span><span class="font-bold" :style="{ color: 'var(--text-primary)' }">৳{{ (campaign.budget || 0).toLocaleString() }}</span></div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }"><ChartBarIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Daily Performance</h3>
            <table class="w-full text-sm">
              <thead><tr><th class="table-header">Date</th><th class="table-header">Impressions</th><th class="table-header">Clicks</th><th class="table-header">Conversions</th><th class="table-header">Spend</th></tr></thead>
              <tbody>
                <tr v-for="(d,i) in campaign.dailyData" :key="i" class="table-row">
                  <td class="table-cell">{{ d.date }}</td>
                  <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">{{ d.impressions }}</td>
                  <td class="table-cell">{{ d.clicks }}</td>
                  <td class="table-cell">{{ d.conversions }}</td>
                  <td class="table-cell font-semibold" :style="{ color: 'var(--color-primary)' }">৳{{ d.spend }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { MegaphoneIcon, ChartBarIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const campaign = ref(null)

const breadcrumbItems = computed(() => [
  { label: 'Campaigns', to: '/campaigns', icon: MegaphoneIcon },
  { label: campaign.value?.name || 'Loading...' }
])
onMounted(() => {
  setTimeout(() => {
    campaign.value = {
      id: route.params.id, name: ['Summer Sale','Flash Deal','New Arrivals'][Number(route.params.id)-1] || 'Campaign',
      type: ['Seasonal','Promo','Product'][Number(route.params.id)-1] || 'Promo',
      status: 'active', reach: 45600, clicks: 3240, conversions: 486, budget: 50000,
      start_date: 'Jul 1, 2026', end_date: 'Jul 31, 2026',
      dailyData: Array.from({length:7},(_,i)=>({
        date: `Jul ${22-i}`, impressions: Math.floor(Math.random()*5000+1000),
        clicks: Math.floor(Math.random()*400+50), conversions: Math.floor(Math.random()*60+5),
        spend: Math.floor(Math.random()*2000+200)
      }))
    }
  }, 300)
})
</script>
