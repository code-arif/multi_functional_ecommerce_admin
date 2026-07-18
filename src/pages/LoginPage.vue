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
  <div class="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
    <div class="w-full max-w-[400px]">
      <!-- Unified Card -->
      <div class="bg-[var(--surface)] p-8 rounded-lg shadow-[var(--shadow-card)] border border-[var(--border)]">
        
        <!-- Consolidated Header -->
        <div class="mb-8 text-center flex flex-col items-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white text-lg font-bold mb-4">
            E
          </div>
          <h1 class="text-2xl font-semibold text-[var(--text-primary)]">Sign in</h1>
          <p class="text-[var(--text-secondary)] mt-1">to continue to EcoShop Admin</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email address</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300 ease-in-out"
              placeholder="admin@ecoshop.com"
            />
            <p v-if="errors.email" class="text-xs text-[var(--danger)] mt-1.5">{{ errors.email[0] }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                required
                class="w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300 ease-in-out"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--color-primary)]"
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
            class="w-full flex items-center justify-center px-4 py-2.5 bg-[var(--color-primary)] text-white rounded font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 mt-2"
          >
            {{ loading ? 'Signing in...' : 'Continue' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
