<template>
    <SettingsCard :icon="CreditCard" title="Payment Gateways" description="Configure online payment methods"
        :saving="saving" @save="save">
        <div v-for="gw in gateways" :key="gw.key" class="gateway-block">
            <div class="gateway-header">
                <div class="gateway-info">
                    <component :is="gw.icon" class="gateway-icon" />
                    <div>
                        <p class="gateway-name">{{ gw.label }}</p>
                        <p class="gateway-desc">{{ gw.desc }}</p>
                    </div>
                </div>
                <label class="toggle">
                    <input type="checkbox" v-model="form[gw.key + '_enabled']" true-value="1" false-value="0" />
                    <span class="toggle__slider"></span>
                </label>
            </div>

            <div class="gateway-fields" v-if="form[gw.key + '_enabled'] == '1'">
                <div v-for="field in gw.fields" :key="field.key" class="field">
                    <label class="label">{{ field.label }}</label>
                    <div v-if="field.secret" class="input-group">
                        <Lock class="input-group__prefix" style="width:15px;height:15px" />
                        <input v-model="form[field.key]" :type="visibleSecrets[field.key] ? 'text' : 'password'"
                            class="input" :placeholder="field.placeholder" style="padding-right:40px" />
                        <button type="button" class="input-group__suffix-btn" @click="toggleSecret(field.key)">
                            <Eye v-if="!visibleSecrets[field.key]" style="width:16px;height:16px" />
                            <EyeOff v-else style="width:16px;height:16px" />
                        </button>
                    </div>
                    <SelectBox v-else-if="field.type === 'select'" v-model="form[field.key]" :options="field.options" full-width />
                    <input v-else v-model="form[field.key]" class="input" :placeholder="field.placeholder" />
                </div>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { CreditCard, Lock, Eye, EyeOff, Zap, Banknote, Wallet } from 'lucide-vue-next'
import { reactive } from 'vue'
import SettingsCard from "@/components/common/SettingsCard.vue";
import SelectBox from "@/components/common/SelectBox.vue";
import { useSettings } from "@/composables/useSettings.js";

const visibleSecrets = reactive({})
function toggleSecret(key) { visibleSecrets[key] = !visibleSecrets[key] }

const gateways = [
    {
        key: 'stripe', label: 'Stripe', desc: 'Credit/debit card payments', icon: CreditCard,
        fields: [
            { key: 'stripe_key', label: 'Publishable Key', placeholder: 'pk_live_...' },
            { key: 'stripe_secret', label: 'Secret Key', placeholder: 'sk_live_...', secret: true },
            { key: 'stripe_mode', label: 'Mode', type: 'select', options: [{ value: 'live', label: 'Live' }, { value: 'test', label: 'Test' }] },
        ]
    },
    {
        key: 'sslcommerz', label: 'SSLCommerz', desc: 'Popular payment gateway in Bangladesh', icon: Banknote,
        fields: [
            { key: 'sslcommerz_store_id', label: 'Store ID', placeholder: 'yourstore123' },
            { key: 'sslcommerz_store_password', label: 'Store Password', placeholder: '••••••••', secret: true },
            { key: 'sslcommerz_mode', label: 'Mode', type: 'select', options: [{ value: 'live', label: 'Live' }, { value: 'sandbox', label: 'Sandbox' }] },
        ]
    },
    {
        key: 'bkash', label: 'bKash', desc: 'Mobile banking payment', icon: Wallet,
        fields: [
            { key: 'bkash_app_key', label: 'App Key', placeholder: 'App Key' },
            { key: 'bkash_app_secret', label: 'App Secret', placeholder: '••••••••', secret: true },
            { key: 'bkash_username', label: 'Username', placeholder: 'merchant username' },
            { key: 'bkash_password', label: 'Password', placeholder: '••••••••', secret: true },
            { key: 'bkash_mode', label: 'Mode', type: 'select', options: [{ value: 'live', label: 'Live' }, { value: 'sandbox', label: 'Sandbox' }] },
        ]
    },
    {
        key: 'nagad', label: 'Nagad', desc: 'Digital financial service', icon: Zap,
        fields: [
            { key: 'nagad_merchant_id', label: 'Merchant ID', placeholder: 'Merchant ID' },
            { key: 'nagad_merchant_key', label: 'Merchant Key', placeholder: '••••••••', secret: true },
            { key: 'nagad_mode', label: 'Mode', type: 'select', options: [{ value: 'live', label: 'Live' }, { value: 'sandbox', label: 'Sandbox' }] },
        ]
    },
]

// Collect all keys
const allKeys = [
    ...gateways.map(g => g.key + '_enabled'),
    ...gateways.flatMap(g => g.fields.map(f => f.key)),
]
const { form, saving, save } = useSettings(allKeys, 'Payment')
</script>

<style scoped>
.gateway-block {
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 12px;
    transition: border-color 0.25s ease;
}

.gateway-block:last-child {
    margin-bottom: 0;
}

.gateway-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: var(--border-light);
    border-radius: 10px;
    transition: background-color 0.25s ease, border-radius 0.2s ease;
}

.gateway-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.gateway-icon {
    width: 22px;
    height: 22px;
    color: var(--info);
}

.gateway-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 2px;
}

.gateway-desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin: 0;
}

.gateway-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    padding: 16px;
    border-top: 1px solid var(--border);
    border-radius: 0 0 10px 10px;
}

/* ─── Enabled state ─── */
.gateway-block--enabled {
    border-color: var(--color-primary-light);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-primary-light) 25%, transparent);
}

.gateway-block--enabled .gateway-header {
    background: var(--color-primary-pale);
    border-radius: 10px 10px 0 0;
}

.gateway-icon--enabled {
    color: var(--color-primary) !important;
}

/* ─── Fields transition ─── */
.gateway-slide-enter-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.gateway-slide-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}
.gateway-slide-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}
.gateway-slide-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

@media (max-width: 640px) {
    .gateway-fields {
        grid-template-columns: 1fr;
    }
}
</style>