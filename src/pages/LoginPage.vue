<script setup>
import {ref, reactive} from 'vue'
import {useAuthStore} from '@/stores/auth'
import {Eye, EyeOff} from 'lucide-vue-next'

const auth = useAuthStore()
const form = reactive({email: '', password: ''})
const errors = ref({}), loading = ref(false), showPass = ref(false)

async function handleLogin() {
  loading.value = true;
  errors.value = {}
  try {
    await auth.login(form)
  } catch (e) {
    errors.value = e.response?.data?.errors || {email: [e.response?.data?.message || 'Login failed.']}
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
    <div class="w-full max-w-[400px]">
      <!-- Unified Card -->
      <div class="bg-white p-8 rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)]">
        
        <!-- Consolidated Header -->
        <div class="mb-8 text-center flex flex-col items-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white text-lg font-bold mb-4">
            E
          </div>
          <h1 class="text-2xl font-semibold text-[#0A2540]">Sign in</h1>
          <p class="text-[#425466] mt-1">to continue to EcoShop Admin</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-[#425466] mb-1.5">Email address</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2.5 bg-white border border-[#E6E8EB] rounded text-sm text-[#0A2540] placeholder-[#A3ACB9] focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
              placeholder="admin@ecoshop.com"
            />
            <p v-if="errors.email" class="text-xs text-[#DF1B41] mt-1.5">{{ errors.email[0] }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-[#425466] mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                required
                class="w-full px-3 py-2.5 bg-white border border-[#E6E8EB] rounded text-sm text-[#0A2540] placeholder-[#A3ACB9] focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute right-3 top-2.5 text-[#425466] hover:text-[#635BFF]"
                @click="showPass = !showPass"
              >
                <Eye v-if="!showPass" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-2.5 bg-[#635BFF] text-white rounded font-semibold text-sm hover:bg-[#544DDF] transition-colors disabled:opacity-70 mt-2"
          >
            {{ loading ? 'Signing in...' : 'Continue' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
