<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="close" />
      <div class="relative z-10 h-full overflow-y-auto flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-lg my-8 animate-in" style="box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          <h2 class="font-bold text-gray-900 text-lg mb-4">Add Product</h2>

          <!-- Product Info -->
          <div class="flex items-start gap-4 mb-5 p-4 rounded-xl" :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary-pale) 60%, transparent)' }">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :style="{ backgroundColor: 'var(--color-primary)' }">
              <component :is="iconComponent" class="w-6 h-6 text-white" />
            </div>
            <div class="min-w-0">
              <p class="font-bold" style="color:var(--text-primary)">{{ product?.name }}</p>
              <p class="text-xs mt-0.5" style="color:var(--text-muted)">SKU: {{ product?.sku }} &middot; In Stock: {{ product?.stock }}</p>
              <p class="font-semibold text-sm mt-1" style="color:var(--color-primary)">Base {{ priceLabel }}: ৳{{ product?.[priceKey]?.toLocaleString() }}</p>
            </div>
          </div>

          <!-- Quantity & Price -->
          <div class="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label class="label">Quantity *</label>
              <input v-model.number="qty" type="number" min="1" class="input" @input="qty = Math.max(1, qty || 1)" />
            </div>
            <div>
              <label class="label">{{ priceLabel }} (৳) *</label>
              <input v-model.number="unitPrice" type="number" min="0" step="0.01" class="input" />
            </div>
          </div>

          <!-- Line Total -->
          <div class="p-3 rounded-xl mb-5 flex items-center justify-between text-sm" style="background-color:var(--border-light)">
            <span style="color:var(--text-muted)">Line Total</span>
            <span class="font-bold text-lg" style="color:var(--color-primary)">৳{{ ((qty || 0) * (unitPrice || 0)).toLocaleString() }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button type="button" @click="confirm"
              :disabled="!qty || !unitPrice"
              class="btn-primary flex-1 justify-center">
              <PlusIcon class="w-4 h-4" />{{ buttonText }}
            </button>
            <button type="button" @click="close"
              class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Package, Plus as PlusIcon } from 'lucide-vue-next'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
  icon: { type: String, default: 'package' }, // 'package' or 'shopping-bag'
  priceLabel: { type: String, default: 'Sale Price' },
  priceKey: { type: String, default: 'price' },
  buttonText: { type: String, default: 'Add to Invoice' }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const qty = ref(1)
const unitPrice = ref(0)

const iconComponent = computed(() => {
  return props.icon === 'shopping-bag' ? ShoppingBagIcon : Package
})

watch(() => props.modelValue, (val) => {
  if (val && props.product) {
    qty.value = 1
    unitPrice.value = props.product[props.priceKey] || 0
  }
})

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  if (!qty.value || !unitPrice.value) return
  emit('confirm', {
    name: props.product?.name,
    qty: qty.value,
    [props.priceKey]: unitPrice.value
  })
  close()
}
</script>
