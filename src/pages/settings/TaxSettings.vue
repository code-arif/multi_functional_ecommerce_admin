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
                    <Percent class="input-group__prefix" style="width:15px;height:15px" />
                    <input v-model="form.tax_rate" type="number" class="input" placeholder="15" step="0.01" style="padding-right:40px" />
                    <span class="input-group__suffix-btn" style="cursor:default;pointer-events:none;font-size:0.8rem;color:var(--text-muted)">%</span>
                </div>
            </div>
            <div class="field">
                <label class="label">Tax Name / Label</label>
                <input v-model="form.tax_name" class="input" placeholder="VAT" />
            </div>
            <div class="field">
                <label class="label">Tax Calculation</label>
                <SelectBox v-model="form.tax_type" :options="taxTypeOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Tax Based On</label>
                <SelectBox v-model="form.tax_based_on" :options="taxBasedOnOptions" full-width />
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
import SettingsCard from "@ecom/ui/components/SettingsCard.vue";
import SelectBox from "@ecom/ui/components/SelectBox.vue";
import { useSettings } from "@ecom/ui/composables/useSettings.js";

const keys = ['tax_enabled', 'tax_rate', 'tax_name', 'tax_type', 'tax_based_on', 'tax_display_in_cart']
const { form, saving, save } = useSettings(keys, 'Tax')

const taxTypeOptions = [
    { value: 'inclusive', label: 'Inclusive (included in price)' },
    { value: 'exclusive', label: 'Exclusive (added on top)' },
]

const taxBasedOnOptions = [
    { value: 'billing_address', label: 'Billing Address' },
    { value: 'shipping_address', label: 'Shipping Address' },
    { value: 'store_address', label: 'Store Address' },
]
</script>