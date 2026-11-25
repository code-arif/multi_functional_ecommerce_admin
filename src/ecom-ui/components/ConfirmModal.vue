<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/55 backdrop-blur-sm" @click="!loading && $emit('cancel')" />
            <div
                class="relative bg-white rounded-2xl w-full animate-in overflow-hidden"
                :class="confirmMatch ? 'max-w-md border border-red-200' : 'max-w-sm p-6'"
                style="box-shadow:0 20px 60px rgba(0,0,0,0.2)"
            >
                <!-- Dangerous Header Strip (when GitHub-style confirmMatch is enabled) -->
                <div v-if="confirmMatch" class="px-6 py-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                            <ShieldExclamationIcon class="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 class="font-bold text-red-900 text-sm">{{ title }}</h3>
                            <p class="text-[11px] font-semibold text-red-600 uppercase tracking-wider">Danger Zone Confirmation</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        @click="$emit('cancel')"
                        :disabled="loading"
                        class="text-red-400 hover:text-red-700 p-1 rounded-lg transition-colors"
                    >
                        <XMarkIcon class="w-5 h-5" />
                    </button>
                </div>

                <div :class="confirmMatch ? 'p-6 space-y-4' : ''">
                    <!-- Standard Header (non-GitHub-style) -->
                    <div v-if="!confirmMatch" class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="iconBg">
                            <CheckCircleIcon v-if="type === 'success'" class="w-5 h-5" :class="iconColor" />
                            <ExclamationTriangleIcon v-else class="w-5 h-5" :class="iconColor" />
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-900">{{ title }}</h3>
                            <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ message }}</p>
                        </div>
                    </div>

                    <!-- GitHub-Style Danger Zone Body -->
                    <template v-else>
                        <div v-if="dangerWarning" class="p-3 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-800 leading-relaxed flex items-start gap-2.5">
                            <ExclamationTriangleIcon class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{{ dangerWarning }}</span>
                        </div>

                        <p class="text-sm text-gray-600 leading-relaxed">{{ message }}</p>

                        <div class="space-y-2 pt-1">
                            <label class="block text-xs text-gray-700">
                                Please type
                                <code class="px-1.5 py-0.5 mx-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-bold select-all">
                                    {{ confirmMatch }}
                                </code>
                                to confirm.
                            </label>
                            <input
                                ref="matchInputRef"
                                v-model="typedValue"
                                type="text"
                                autocomplete="off"
                                spellcheck="false"
                                :placeholder="confirmMatch"
                                @keydown.enter.prevent="handleEnterConfirm"
                                class="w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors font-medium"
                                :class="isMatchValid
                                    ? 'border-red-500 bg-red-50/20 text-gray-900 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-300 bg-white text-gray-800 focus:border-red-400 focus:ring-2 focus:ring-red-100'"
                            />
                        </div>
                    </template>

                    <div class="flex gap-3 justify-end" :class="confirmMatch ? 'pt-2 border-t border-gray-100' : 'mt-6'">
                        <button type="button" @click="$emit('cancel')" :disabled="loading" class="btn-ghost">Cancel</button>
                        <button
                            type="button"
                            @click="$emit('confirm')"
                            :disabled="loading || !isMatchValid"
                            :class="[
                                confirmBtnClass,
                                !isMatchValid && 'opacity-40 cursor-not-allowed pointer-events-none'
                            ]"
                        >
                            {{ loading ? 'Processing...' : confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ExclamationTriangleIcon, CheckCircleIcon, ShieldExclamationIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: Boolean,
  loading: Boolean,
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  type: { type: String, default: 'danger' },
  confirmMatch: { type: String, default: '' },
  dangerWarning: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'cancel'])

const typedValue = ref('')
const matchInputRef = ref(null)

watch(() => props.show, async (val) => {
  typedValue.value = ''
  if (val && props.confirmMatch) {
    await nextTick()
    matchInputRef.value?.focus()
  }
})

const isMatchValid = computed(() => {
  if (!props.confirmMatch) return true
  return typedValue.value.trim() === props.confirmMatch.trim()
})

function handleEnterConfirm() {
  if (isMatchValid.value && !props.loading) {
    emit('confirm')
  }
}

const iconBg = computed(() => ({
  danger: 'bg-red-100',
  warning: 'bg-yellow-100',
  success: 'bg-emerald-100',
  primary: 'bg-blue-100',
}[props.type] || 'bg-red-100'))

const iconColor = computed(() => ({
  danger: 'text-red-600',
  warning: 'text-yellow-600',
  success: 'text-emerald-600',
  primary: 'text-blue-600',
}[props.type] || 'text-red-600'))

const confirmBtnClass = computed(() => {
  if (props.type === 'success') {
    return 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50'
  }
  if (props.type === 'primary') {
    return 'btn-primary'
  }
  return 'px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50'
})
</script>
