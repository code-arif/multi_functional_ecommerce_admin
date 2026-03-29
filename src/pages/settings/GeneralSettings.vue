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
                <select v-model="form.currency_position" class="select">
                    <option value="before">Before (৳100)</option>
                    <option value="after">After (100৳)</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Thousand Separator</label>
                <select v-model="form.thousand_separator" class="select">
                    <option value=",">, (1,000)</option>
                    <option value=".">. (1.000)</option>
                    <option value=" ">Space (1 000)</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Decimal Separator</label>
                <select v-model="form.decimal_separator" class="select">
                    <option value=".">. (10.00)</option>
                    <option value=",">, (10,00)</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Decimal Places</label>
                <select v-model="form.decimal_places" class="select">
                    <option value="0">0</option>
                    <option value="2">2</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Timezone</label>
                <select v-model="form.timezone" class="select">
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Date Format</label>
                <select v-model="form.date_format" class="select">
                    <option value="d/m/Y">DD/MM/YYYY</option>
                    <option value="m/d/Y">MM/DD/YYYY</option>
                    <option value="Y-m-d">YYYY-MM-DD</option>
                </select>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Store } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const keys = [
    'store_name', 'store_email', 'store_phone', 'store_support_email',
    'store_address', 'store_city', 'store_country',
    'currency', 'currency_symbol', 'currency_position',
    'thousand_separator', 'decimal_separator', 'decimal_places',
    'timezone', 'date_format',
]
const { form, saving, save } = useSettings(keys, 'General')
</script>