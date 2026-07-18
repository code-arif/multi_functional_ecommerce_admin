<script setup>
import {ref, reactive, computed} from 'vue'
import {useAuthStore} from '@/stores/auth'
import {Eye, EyeOff} from 'lucide-vue-next'

const auth = useAuthStore()
const loginMethod = ref('password') // 'password' or 'magic'
const magicState = ref('email') // 'email' or 'otp'
const form = reactive({email: '', password: '', otp: ''})
const errors = ref({}), loading = ref(false), showPass = ref(false)

async function handleLogin() {
  loading.value = true;
  errors.value = {}
  try {
    if (loginMethod.value === 'password') {
        await auth.login(form)
    } else {
        if (magicState.value === 'email') {
            magicState.value = 'otp'
        } else {
            // Verify OTP
            alert('Verifying OTP: ' + form.otp)
        }
    }
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
      <div class="bg-[var(--surface)] p-6 sm:p-8 rounded-lg shadow-[var(--shadow-card)] border border-[var(--border)]">
        
        <!-- Tab Buttons -->
        <div class="flex gap-1 mb-8 bg-[var(--border-light)] p-1 rounded-lg">
            <button @click="loginMethod = 'password'" :class="{'bg-[var(--surface)] shadow-sm': loginMethod === 'password'}" class="flex-1 py-2 text-sm font-medium rounded-md transition-all text-[var(--text-primary)]">Password</button>
            <button @click="loginMethod = 'magic'" :class="{'bg-[var(--surface)] shadow-sm': loginMethod === 'magic'}" class="flex-1 py-2 text-sm font-medium rounded-md transition-all text-[var(--text-primary)]">Magic Link</button>
        </div>

        <!-- Consolidated Header -->
        <div class="mb-8 text-center flex flex-col items-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white text-lg font-bold mb-4">
            E
          </div>
          <h1 class="text-2xl font-semibold text-[var(--text-primary)]">{{ loginMethod === 'password' ? 'Sign in' : 'Magic Login' }}</h1>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <transition name="fade-slide" mode="out-in">
            <div :key="loginMethod" class="w-full">
              <!-- Password Form -->
              <template v-if="loginMethod === 'password'">
                  <div class="space-y-5 w-full">
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email address</label>
                      <input v-model="form.email" type="email" required class="input-field" placeholder="admin@ecoshop.com" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
                      <div class="relative">
                        <input v-model="form.password" :type="showPass ? 'text' : 'password'" required class="input-field pr-10" placeholder="••••••••" />
                        <button type="button" class="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--color-primary)]" @click="showPass = !showPass">
                          <Eye v-if="!showPass" class="w-4 h-4" />
                          <EyeOff v-else class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
              </template>

              <!-- Magic Link Form -->
              <template v-else>
                  <div class="space-y-5 w-full">
                    <div v-if="magicState === 'email'">
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email address</label>
                      <input v-model="form.email" type="email" required class="input-field" placeholder="admin@ecoshop.com" />
                    </div>
                    <div v-else>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 text-center">Enter 6-digit OTP</label>
                      <div class="flex gap-2 justify-center">
                          <input v-for="i in 6" :key="i" type="text" maxlength="1" class="w-10 h-12 text-center text-xl font-bold bg-[var(--surface)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]" />
                      </div>
                    </div>
                  </div>
              </template>
            </div>
          </transition>

          <!-- Submit -->
          <button type="submit" :disabled="loading" class="w-full flex items-center justify-center px-4 py-2.5 bg-[var(--color-primary)] text-white rounded font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-70 mt-2">
            {{ loading ? 'Processing...' : (loginMethod === 'password' ? 'Sign In' : (magicState === 'email' ? 'Send OTP' : 'Verify OTP')) }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
    @apply w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-300 ease-in-out;
    box-sizing: border-box;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateX(10px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}
</style>
