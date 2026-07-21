<template>
  <div>
    <PageHeader title="Shops" :subtitle="`${pagination?.total || 0} shops on the marketplace`">
      <button @click="showFilters = !showFilters" class="btn-ghost text-sm gap-1.5" :style="{ color: showFilters ? 'var(--color-primary)' : '' }">
        <FunnelIcon class="w-4 h-4" /> Filters
      </button>
    </PageHeader>
    <transition name="panel-slide">
      <div v-if="showFilters" class="card p-4 mb-4">
        <div class="flex flex-wrap items-end gap-3">
          <div class="list-filter-item"><label class="label">Status</label><SelectBox v-model="filters.status" :options="statusOptions" placeholder="All Status" size="sm" full-width @change="load(1)" /></div>
          <div class="list-filter-item"><label class="label">Verified</label><SelectBox v-model="filters.verified" :options="verifiedOptions" placeholder="All" size="sm" full-width @change="load(1)" /></div>
          <div class="list-filter-item"><label class="label">Products</label><SelectBox v-model="filters.products" :options="productsOptions" placeholder="Any" size="sm" full-width @change="load(1)" /></div>
          <div class="list-filter-item list-filter-item--wide"><label class="label">Created</label><DatePicker v-model:from="filters.dateFrom" v-model:to="filters.dateTo" range placeholder="Date" display-format="MMM dd, yyyy" /></div>
          <div class="list-filter-item"><label class="label">Sort</label><SelectBox v-model="filters.sort" :options="sortOptions" size="sm" full-width @change="load(1)" /></div>
        </div>
        <div class="flex items-center gap-2 mt-3 pt-3 border-t" :style="{ borderColor: 'var(--border)' }">
          <button @click="resetFilters" class="btn-ghost text-xs">Reset Filters</button>
          <span class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ pagination?.from || 0 }}–{{ pagination?.to || 0 }} of {{ pagination?.total || 0 }}</span>
        </div>
      </div>
    </transition>
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead>
            <tr>
              <th class="list-th">Shop</th>
              <th class="list-th">Vendor</th>
              <th class="list-th">Products</th>
              <th class="list-th">Orders</th>
              <th class="list-th">Revenue</th>
              <th class="list-th">Status</th>
              <th class="list-th">Created</th>
              <th class="list-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-16">
                <div class="flex flex-col items-center gap-3" :style="{ color: 'var(--text-muted)' }">
                  <svg class="w-7 h-7 animate-spin" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  <span class="text-sm">Loading shops...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="!shops.length">
              <td colspan="8" class="text-center py-16">
                <div class="flex flex-col items-center gap-2" :style="{ color: 'var(--text-muted)' }">
                  <HomeModernIcon class="w-10 h-10" :style="{ color: 'var(--text-muted)' }" />
                  <p class="text-sm font-medium">No shops found</p>
                  <p class="text-xs">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="s in shops" :key="s.id" class="list-row">
              <td class="list-td">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border" :style="{ borderColor: 'var(--border)' }">
                    <div v-if="s.logo" class="w-full h-full flex items-center justify-center text-lg" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }">🏪</div>
                    <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--color-primary)' }">{{ s.name?.charAt(0)?.toUpperCase() || 'S' }}</div>
                  </div>
                  <div class="min-w-0">
                    <p class="list-name">{{ s.name }}</p>
                    <p class="list-sub">{{ s.slug || s.name?.toLowerCase().replace(/\s+/g, '-') }}</p>
                  </div>
                </div>
              </td>
              <td class="list-td">
                <p class="list-name">{{ s.vendor_name || '—' }}</p>
                <p class="list-sub">{{ s.email || '' }}</p>
              </td>
              <td class="list-td"><span class="list-count">{{ s.products_count || 0 }}</span></td>
              <td class="list-td"><span class="list-count">{{ s.orders_count || 0 }}</span></td>
              <td class="list-td"><span class="list-count">৳{{ (s.total_revenue || 0).toLocaleString() }}</span></td>
              <td class="list-td"><StatusBadge :value="s.status || 'active'" /></td>
              <td class="list-td"><p class="list-name">{{ formatDate(s.created_at) }}</p><p class="list-sub">{{ formatRelative(s.created_at) }}</p></td>
              <td class="list-td text-right">
                <button class="list-action-btn" title="View"><EyeIcon class="w-3.5 h-3.5" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="pagination && pagination.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t" :style="{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--border-light) 50%, transparent)' }">
        <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Showing {{ pagination.from }}–{{ pagination.to }} of {{ pagination.total }}</p>
        <div class="flex items-center gap-1">
          <button @click="load(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="list-pagination-btn" :style="{ color: 'var(--navbar-text)' }"><ChevronLeftIcon class="w-4 h-4" /></button>
          <button v-for="page in pagination.last_page" :key="page" @click="load(page)" class="list-pagination-num" :class="page === pagination.current_page ? 'list-pagination-active' : ''" :style="page === pagination.current_page ? { backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' } : { color: 'var(--navbar-text)', borderColor: 'var(--border)' }">{{ page }}</button>
          <button @click="load(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="list-pagination-btn" :style="{ color: 'var(--navbar-text)' }"><ChevronRightIcon class="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import SelectBox from '@/components/common/SelectBox.vue'
import { FunnelIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, HomeModernIcon } from '@heroicons/vue/24/outline'
const shops = ref([]), pagination = ref(null), loading = ref(true), showFilters = ref(false)
const filters = reactive({ status: '', verified: '', products: '', dateFrom: '', dateTo: '', sort: 'latest' })
const statusOptions = [{value:'',label:'All Status'},{value:'active',label:'Active'},{value:'pending',label:'Pending'},{value:'suspended',label:'Suspended'}]
const verifiedOptions = [{value:'',label:'All'},{value:'1',label:'Verified'},{value:'0',label:'Unverified'}]
const productsOptions = [{value:'',label:'Any'},{value:'low',label:'Low (< 10)'},{value:'medium',label:'Medium (10-50)'},{value:'high',label:'High (> 50)'}]
const sortOptions = [{value:'latest',label:'Latest'},{value:'oldest',label:'Oldest'},{value:'name',label:'Name A-Z'},{value:'products',label:'Most Products'},{value:'revenue',label:'Highest Revenue'}]
function resetFilters() { Object.assign(filters, { status:'',verified:'',products:'',dateFrom:'',dateTo:'',sort:'latest' }); load(1) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '—' }
function formatRelative(d) { if(!d)return''; const diff=Date.now()-new Date(d).getTime(),days=Math.floor(diff/86400000); return days===0?'Today':days===1?'Yesterday':days<7?`${days}d ago`:days<30?`${Math.floor(days/7)}w ago`:`${Math.floor(days/30)}mo ago` }
async function load(page=1) {
  loading.value = true
  setTimeout(() => {
    shops.value = Array.from({length:6},(_,i)=>({
      id:i+1,name:['ElectroHub','FashionFusion','GadgetZone','HomeDecor','BookNook','Sportify'][i],
      vendor_name:['John S.','Sarah J.','Mike C.','Emily D.','Alex K.','Lisa M.'][i],
      email:['john@ex.com','sarah@ex.com','mike@ex.com','emily@ex.com','alex@ex.com','lisa@ex.com'][i],
      products_count:Math.floor(Math.random()*80+5),orders_count:Math.floor(Math.random()*500+10),
      total_revenue:Math.random()*500000+10000,status:['active','active','pending','active','suspended','active'][i],
      created_at:new Date(Date.now()-i*15*86400000).toISOString()
    }))
    pagination.value = {current_page:page,last_page:3,total:16,per_page:6,from:(page-1)*6+1,to:page*6}
    loading.value = false
  }, 400)
}
onMounted(()=>load())
</script>
<style scoped>
/* All shared list styles moved to @layer components in main.css */
</style>
