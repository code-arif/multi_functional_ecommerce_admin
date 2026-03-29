<template>
    <SettingsCard :icon="Percent" title="Tax & VAT" description="Configure tax rates for your store" :saving="saving"
        @save="save">
        <div class="field-group">
            <div class="field col-span-2">
                <div class="toggle-row">
                    <div class="toggle-info">
                        <span class="toggle-info__title">Enable Tax</span>
                        <span class="toggle-info__desc">Apply tax to orders</span>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" v-model="form.tax_enabled" true-value="1" false-value="0" />
                        <span class="toggle__slider"></span>
                    </label>
                </div>
            </div>

            <div class="field">
                <label class="label">Tax Rate (%)</label>
                <div class="input-group">
                    <input v-model="form.tax_rate" type="number" class="input" placeholder="15" step="0.01" />
                    <span class="input-group__prefix" style="right:11px;left:auto;font-size:0.8rem">%</span>
                </div>
            </div>
            <div class="field">
                <label class="label">Tax Name / Label</label>
                <input v-model="form.tax_name" class="input" placeholder="VAT" />
            </div>
            <div class="field">
                <label class="label">Tax Calculation</label>
                <select v-model="form.tax_type" class="select">
                    <option value="inclusive">Inclusive (included in price)</option>
                    <option value="exclusive">Exclusive (added on top)</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Tax Based On</label>
                <select v-model="form.tax_based_on" class="select">
                    <option value="billing_address">Billing Address</option>
                    <option value="shipping_address">Shipping Address</option>
                    <option value="store_address">Store Address</option>
                </select>
            </div>
            <div class="field col-span-2">
                <div class="toggle-row">
                    <div class="toggle-info">
                        <span class="toggle-info__title">Display Tax in Cart</span>
                        <span class="toggle-info__desc">Show tax breakdown to customers</span>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" v-model="form.tax_display_in_cart" true-value="1" false-value="0" />
                        <span class="toggle__slider"></span>
                    </label>
                </div>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Percent } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import {useSettings} from "@/composables/useSettings.js";

const keys = ['tax_enabled', 'tax_rate', 'tax_name', 'tax_type', 'tax_based_on', 'tax_display_in_cart']
const { form, saving, save } = useSettings(keys, 'Tax')
</script>