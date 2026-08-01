<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />
            <div class="relative bg-white rounded-2xl w-full max-w-md animate-in overflow-hidden"
                :style="{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }">
                <!-- Header -->
                <div class="flex items-center justify-between px-6 py-4 border-b" :style="{ borderColor: 'var(--border)' }">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                            :style="{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }">
                            <UserPlusIcon class="w-5 h-5" :style="{ color: 'var(--color-primary)' }" />
                        </div>
                        <div>
                            <h3 class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">Add Vendor</h3>
                            <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Create a new vendor account</p>
                        </div>
                    </div>
                    <button @click="$emit('close')"
                        class="p-1.5 rounded-lg border transition-all inline-flex items-center"
                        :style="{ borderColor: 'var(--border)', color: 'var(--text-muted)' }"
                        @mouseenter="e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }"
                        @mouseleave="e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }">
                        <XMarkIcon class="w-4 h-4" />
                    </button>
                </div>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label" :style="{ color: 'var(--text-muted)' }">First Name</label>
                            <input
                                v-model="form.first_name"
                                type="text"
                                placeholder="John"
                                class="input"
                                :class="{ 'input-error': errors.first_name }"
                                @input="errors.first_name = ''"
                            />
                            <p v-if="errors.first_name" class="text-xs mt-1" :style="{ color: 'var(--danger)' }">{{ errors.first_name }}</p>
                        </div>
                        <div>
                            <label class="label" :style="{ color: 'var(--text-muted)' }">Last Name</label>
                            <input
                                v-model="form.last_name"
                                type="text"
                                placeholder="Doe"
                                class="input"
                                :class="{ 'input-error': errors.last_name }"
                                @input="errors.last_name = ''"
                            />
                            <p v-if="errors.last_name" class="text-xs mt-1" :style="{ color: 'var(--danger)' }">{{ errors.last_name }}</p>
                        </div>
                    </div>

                    <div>
                        <label class="label" :style="{ color: 'var(--text-muted)' }">Email</label>
                        <input
                            v-model="form.email"
                            type="email"
                            placeholder="vendor@example.com"
                            class="input"
                            :class="{ 'input-error': errors.email }"
                            @input="errors.email = ''"
                        />
                        <p v-if="errors.email" class="text-xs mt-1" :style="{ color: 'var(--danger)' }">{{ errors.email }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label" :style="{ color: 'var(--text-muted)' }">Password</label>
                            <input
                                v-model="form.password"
                                type="password"
                                placeholder="••••••••"
                                class="input"
                                :class="{ 'input-error': errors.password }"
                                @input="errors.password = ''"
                            />
                            <p v-if="errors.password" class="text-xs mt-1" :style="{ color: 'var(--danger)' }">{{ errors.password }}</p>
                        </div>
                        <div>
                            <label class="label" :style="{ color: 'var(--text-muted)' }">Confirm Password</label>
                            <input
                                v-model="form.password_confirmation"
                                type="password"
                                placeholder="••••••••"
                                class="input"
                                :class="{ 'input-error': errors.password_confirmation }"
                                @input="errors.password_confirmation = ''"
                            />
                            <p v-if="errors.password_confirmation" class="text-xs mt-1" :style="{ color: 'var(--danger)' }">{{ errors.password_confirmation }}</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-end gap-3 pt-4 border-t" :style="{ borderColor: 'var(--border)' }">
                        <button type="button" @click="$emit('close')" class="px-4 py-[7px] rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" :disabled="saving" class="btn-primary text-sm">
                            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {{ saving ? 'Creating...' : 'Create Vendor' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { UserPlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
    show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

const saving = ref(false)

const form = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
})

const errors = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
})

watch(() => props.show, (val) => {
    if (val) {
        // Reset form when opening
        form.first_name = ''
        form.last_name = ''
        form.email = ''
        form.password = ''
        form.password_confirmation = ''
        errors.first_name = ''
        errors.last_name = ''
        errors.email = ''
        errors.password = ''
        errors.password_confirmation = ''
        saving.value = false
    }
})

function validate() {
    let valid = true
    if (!form.first_name.trim()) {
        errors.first_name = 'First name is required'
        valid = false
    }
    if (!form.last_name.trim()) {
        errors.last_name = 'Last name is required'
        valid = false
    }
    if (!form.email.trim()) {
        errors.email = 'Email is required'
        valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Invalid email format'
        valid = false
    }
    if (!form.password) {
        errors.password = 'Password is required'
        valid = false
    } else if (form.password.length < 6) {
        errors.password = 'Min 6 characters'
        valid = false
    }
    if (form.password !== form.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match'
        valid = false
    }
    return valid
}

async function handleSubmit() {
    if (!validate()) return
    saving.value = true
    emit('save', { ...form })
}
</script>

<style scoped>
.input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text-primary);
    font-size: 0.8125rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-light) 20%, transparent);
}
.input::placeholder {
    color: var(--text-muted);
}
.input-error {
    border-color: var(--danger) !important;
}
.input-error:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 20%, transparent) !important;
}
.label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 5px;
}
</style>
