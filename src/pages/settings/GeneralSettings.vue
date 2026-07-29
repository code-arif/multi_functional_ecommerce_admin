<template>
    <SettingsCard :icon="Store" title="General Settings" description="Basic information about your store"
        :saving="saving" @save="save">
        <div class="field-group">
            <div class="field">
                <label class="label">Store Name <span class="required">*</span></label>
                <input v-model="form.store_name" class="input" placeholder="EcoShop" />
            </div>
            <div class="field">
                <label class="label">Store Email <span class="required">*</span></label>
                <input v-model="form.store_email" type="email" class="input" placeholder="info@ecoshop.com" />
            </div>
            <div class="field">
                <label class="label">Phone Number</label>
                <input v-model="form.store_phone" class="input" placeholder="+8801XXXXXXXXX" />
            </div>
            <div class="field">
                <label class="label">Support Email</label>
                <input v-model="form.store_support_email" type="email" class="input"
                    placeholder="support@ecoshop.com" />
            </div>
            <div class="field col-span-2">
                <label class="label">Store Address</label>
                <textarea v-model="form.store_address" class="textarea" rows="2" placeholder="Full address..." />
            </div>
            <div class="field">
                <label class="label">City</label>
                <input v-model="form.store_city" class="input" placeholder="Dhaka" />
            </div>
            <div class="field">
                <label class="label">Country</label>
                <input v-model="form.store_country" class="input" placeholder="Bangladesh" />
            </div>
            <div class="field">
                <label class="label">Currency Code</label>
                <input v-model="form.currency" class="input" placeholder="BDT" />
            </div>
            <div class="field">
                <label class="label">Currency Symbol</label>
                <input v-model="form.currency_symbol" class="input" placeholder="৳" />
            </div>
            <div class="field">
                <label class="label">Currency Position</label>
                <SelectBox v-model="form.currency_position" :options="currencyPositionOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Thousand Separator</label>
                <SelectBox v-model="form.thousand_separator" :options="thousandSeparatorOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Decimal Separator</label>
                <SelectBox v-model="form.decimal_separator" :options="decimalSeparatorOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Decimal Places</label>
                <SelectBox v-model="form.decimal_places" :options="decimalPlacesOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Timezone</label>
                <SelectBox v-model="form.timezone" :options="timezoneOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Date Format</label>
                <SelectBox v-model="form.date_format" :options="dateFormatOptions" full-width />
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Store } from 'lucide-vue-next'
import SettingsCard from "@ecom/ui/components/SettingsCard.vue";
import SelectBox from "@ecom/ui/components/SelectBox.vue";
import { useSettings } from "@ecom/ui/composables/useSettings.js";

const keys = [
    'store_name', 'store_email', 'store_phone', 'store_support_email',
    'store_address', 'store_city', 'store_country',
    'currency', 'currency_symbol', 'currency_position',
    'thousand_separator', 'decimal_separator', 'decimal_places',
    'timezone', 'date_format',
]
const { form, saving, save } = useSettings(keys, 'General')

const currencyPositionOptions = [
    { value: 'before', label: 'Before (৳100)' },
    { value: 'after', label: 'After (100৳)' },
]

const thousandSeparatorOptions = [
    { value: ',', label: ', (1,000)' },
    { value: '.', label: '. (1.000)' },
    { value: ' ', label: 'Space (1 000)' },
]

const decimalSeparatorOptions = [
    { value: '.', label: '. (10.00)' },
    { value: ',', label: ', (10,00)' },
]

const decimalPlacesOptions = [
    { value: '0', label: '0' },
    { value: '2', label: '2' },
]

const timezoneOptions = [
    { value: 'Asia/Dhaka', label: 'Asia/Dhaka (GMT+6)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York' },
    { value: 'Europe/London', label: 'Europe/London' },
]

const dateFormatOptions = [
    { value: 'd/m/Y', label: 'DD/MM/YYYY' },
    { value: 'm/d/Y', label: 'MM/DD/YYYY' },
    { value: 'Y-m-d', label: 'YYYY-MM-DD' },
]
</script>