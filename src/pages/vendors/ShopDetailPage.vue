<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />
    <div v-if="!shop" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      <svg class="w-8 h-8 animate-spin mx-auto mb-3" :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading shop details...
    </div>
    <template v-if="shop">
      <div class="card overflow-hidden mb-6">
        <div class="h-32 md:h-40 relative" :style="{ background: shop.cover_image ? `url(${shop.cover_image}) center/cover` : 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }">
          <div class="absolute inset-0" :style="{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }"></div>
        </div>
        <div class="px-6 pb-5 relative">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 relative z-10">
            <div class="w-20 h-20 rounded-xl overflow-hidden border-4 shrink-0" :style="{ borderColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }">
              <div v-if="shop.logo" class="w-full h-full flex items-center justify-center text-3xl">🏪</div>
              <div v-else class="w-full h-full flex items-center justify-center text-2xl font-black text-white" :style="{ backgroundColor: 'var(--color-primary)' }">{{ shop.name?.charAt(0)?.toUpperCase() || 'S' }}</div>
            </div>
            <div class="flex-1 min-w-0 pt-2 sm:pt-0">
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h2 class="text-xl font-black truncate" :style="{ color: 'var(--text-primary)' }">{{ shop.name }}</h2>
                <StatusBadge :value="shop.status || 'active'" />
              </div>
              <div class="flex items-center gap-3 mt-1 text-sm" :style="{ color: 'var(--text-muted)' }">
                <span>{{ shop.vendor_name }}</span><span class="w-1 h-1 rounded-full" :style="{ backgroundColor: 'var(--border)' }"></span><span>Created {{ formatDate(shop.created_at) }}</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t" :style="{ borderColor: 'var(--border)' }">
            <div class="text-center"><p class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">{{ shop.products_count || 0 }}</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Products</p></div>
            <div class="text-center"><p class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">{{ shop.orders_count || 0 }}</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Orders</p></div>
            <div class="text-center"><p class="text-2xl font-black" :style="{ color: 'var(--color-primary)' }">৳{{ (shop.total_revenue || 0).toLocaleString() }}</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Revenue</p></div>
            <div class="text-center"><p class="text-2xl font-black" :style="{ color: 'var(--text-primary)' }">{{ shop.rating || '—' }}</p><p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Rating</p></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="space-y-6">
          <div class="card p-5">
            <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }"><BuildingStorefrontIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Shop Info</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Vendor</span><span class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ shop.vendor_name || '—' }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Email</span><span class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ shop.email || '—' }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Phone</span><span class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ shop.phone || '—' }}</span></div>
              <div class="flex justify-between"><span :style="{ color: 'var(--text-muted)' }">Verified</span><span class="font-medium" :style="{ color: shop.is_verified ? 'var(--success)' : 'var(--text-muted)' }">{{ shop.is_verified ? 'Yes ✓' : 'No' }}</span></div>
              <div class="pt-3 border-t" :style="{ borderColor: 'var(--border-light)' }"><p class="text-xs font-semibold mb-1.5" :style="{ color: 'var(--text-muted)' }">Address</p><p class="text-sm" :style="{ color: 'var(--text-primary)' }">{{ shop.address || 'No address provided' }}</p></div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2 space-y-6">
          <div class="card overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
              <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }"><ShoppingBagIcon class="w-4 h-4 inline mr-1.5" :style="{ color: 'var(--color-primary)' }" />Products ({{ shop.products?.length || 0 }})</h3>
            </div>
            <div v-if="shop.products?.length" class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
              <div v-for="p in shop.products.slice(0, 5)" :key="p.id" class="flex items-center gap-3 px-5 py-3 cursor-pointer" @click="$router.push(`/products/${p.id}`)">
                <div class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border" :style="{ borderColor: 'var(--border)' }">
                  <div class="w-full h-full flex items-center justify-center text-xs" :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-muted)' }">No img</div>
                </div>
                <div class="flex-1 min-w-0"><p class="text-sm font-semibold truncate" :style="{ color: 'var(--text-primary)' }">{{ p.name }}</p><p class="text-xs" :style="{ color: 'var(--text-muted)' }">৳{{ Number(p.price || 0).toLocaleString() }} • {{ p.total_sold || 0 }} sold</p></div>
              </div>
            </div>
            <div v-else class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }"><ShoppingBagIcon class="w-8 h-8 mx-auto mb-2" />No products listed</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { BuildingStorefrontIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'
const route = useRoute()
const shop = ref(null)

const breadcrumbItems = computed(() => [
  { label: 'Shops', to: '/shops', icon: BuildingStorefrontIcon },
  { label: shop.value?.name || 'Loading...' }
])


function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '—' }
onMounted(() => {
  setTimeout(() => {
    shop.value = {
      id: route.params.id, name: 'ElectroHub', vendor_name: 'John Smith', email: 'john@example.com', phone: '+8801712345678',
      status: 'active', is_verified: true, products_count: 28, orders_count: 156, total_revenue: 458000, rating: 4.5,
      address: '123 Gulshan Avenue, Dhaka', created_at: new Date(Date.now()-90*86400000).toISOString(),
      products: Array.from({length:5},(_,i)=>({id:i+1,name:`Product ${i+1}`,price:Math.random()*5000+200,total_sold:Math.floor(Math.random()*100)}))
    }
  }, 300)
})
</script>
