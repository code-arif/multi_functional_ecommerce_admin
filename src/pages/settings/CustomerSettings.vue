<template>
    <SettingsCard :icon="Users" title="Customer Settings"
        description="Control customer account and registration behaviour" :saving="saving" @save="save">
        <div class="toggle-row" v-for="t in toggles" :key="t.key">
            <div class="toggle-info">
                <span class="toggle-info__title">{{ t.label }}</span>
                <span class="toggle-info__desc">{{ t.desc }}</span>
            </div>
            <label class="toggle">
                <input type="checkbox" v-model="form[t.key]" true-value="1" false-value="0" />
                <span class="toggle__slider"></span>
            </label>
        </div>

        <hr class="divider" />
        <p class="section-label">Loyalty & Points</p>
        <div class="field-group">
            <div class="field">
                <label class="label">Points Per 1 BDT Spent</label>
                <input v-model="form.loyalty_points_per_taka" type="number" class="input" placeholder="1" step="0.1" />
            </div>
            <div class="field">
                <label class="label">Min Points to Redeem</label>
                <input v-model="form.loyalty_min_redeem" type="number" class="input" placeholder="100" />
            </div>
            <div class="field">
                <label class="label">Points Value (1 pt = ৳)</label>
                <input v-model="form.loyalty_point_value" type="number" class="input" placeholder="0.10" step="0.01" />
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Users } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import {useSettings} from "@/composables/useSettings.js";

const toggles = [
    { key: 'customer_registration', label: 'Allow Registration', desc: 'Let customers create accounts' },
    { key: 'customer_email_verification', label: 'Email Verification', desc: 'Require email verification on signup' },
    { key: 'guest_checkout', label: 'Guest Checkout', desc: 'Allow orders without account' },
    { key: 'customer_review_enabled', label: 'Product Reviews', desc: 'Allow customers to leave reviews' },
    { key: 'customer_review_verified_only', label: 'Verified Purchase Reviews', desc: 'Only allow reviews from buyers' },
    { key: 'loyalty_enabled', label: 'Loyalty Points', desc: 'Enable earn & redeem points system' },
    { key: 'referral_enabled', label: 'Referral Program', desc: 'Allow customers to refer friends' },
]

const keys = [
    ...toggles.map(t => t.key),
    'loyalty_points_per_taka', 'loyalty_min_redeem', 'loyalty_point_value',
]
const { form, saving, save } = useSettings(keys, 'Customer')
</script>