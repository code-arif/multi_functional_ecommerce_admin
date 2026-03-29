<template>
    <SettingsCard :icon="FileText" title="Legal Pages" description="Set URLs or content for your policy pages"
        :saving="saving" @save="save">
        <div class="field-group field-group--1">
            <div v-for="page in pages" :key="page.key" class="field">
                <label class="label">{{ page.label }}</label>
                <input v-model="form[page.key]" class="input" :placeholder="page.placeholder" />
                <span class="hint">{{ page.hint }}</span>
            </div>

            <hr class="divider" />
            <p class="section-label">Checkout Agreement</p>
            <div class="toggle-row">
                <div class="toggle-info">
                    <span class="toggle-info__title">Require Terms Acceptance</span>
                    <span class="toggle-info__desc">Force customers to accept terms before checkout</span>
                </div>
                <label class="toggle">
                    <input type="checkbox" v-model="form.require_terms_acceptance" true-value="1" false-value="0" />
                    <span class="toggle__slider"></span>
                </label>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { FileText } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const pages = [
    { key: 'privacy_policy_url', label: 'Privacy Policy URL', placeholder: '/privacy-policy', hint: 'Route or full URL to your privacy policy page' },
    { key: 'terms_url', label: 'Terms & Conditions URL', placeholder: '/terms-and-conditions', hint: 'Route or full URL to terms page' },
    { key: 'refund_policy_url', label: 'Refund Policy URL', placeholder: '/refund-policy', hint: 'Route or full URL to refund page' },
    { key: 'shipping_policy_url', label: 'Shipping Policy URL', placeholder: '/shipping-policy', hint: 'Route or full URL' },
    { key: 'cookie_policy_url', label: 'Cookie Policy URL', placeholder: '/cookie-policy', hint: 'Route or full URL' },
]

const keys = [...pages.map(p => p.key), 'require_terms_acceptance']
const { form, saving, save } = useSettings(keys, 'Legal')
</script>