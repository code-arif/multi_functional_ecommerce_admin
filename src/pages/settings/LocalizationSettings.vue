<template>
    <SettingsCard :icon="Globe" title="Localization" description="Language, locale and regional preferences"
        :saving="saving" @save="save">
        <div class="field-group">
            <div class="field">
                <label class="label">Default Language</label>
                <select v-model="form.default_language" class="select">
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bangla)</option>
                    <option value="ar">Arabic</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Admin Panel Language</label>
                <select v-model="form.admin_language" class="select">
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bangla)</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Weight Unit</label>
                <select v-model="form.weight_unit" class="select">
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="lb">Pound (lb)</option>
                    <option value="oz">Ounce (oz)</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Dimension Unit</label>
                <select v-model="form.dimension_unit" class="select">
                    <option value="cm">Centimeter (cm)</option>
                    <option value="mm">Millimeter (mm)</option>
                    <option value="in">Inch (in)</option>
                    <option value="ft">Feet (ft)</option>
                </select>
            </div>
            <div class="field col-span-2">
                <div class="toggle-row">
                    <div class="toggle-info">
                        <span class="toggle-info__title">RTL Mode</span>
                        <span class="toggle-info__desc">Enable right-to-left layout for Arabic / Urdu</span>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" v-model="form.rtl_mode" true-value="1" false-value="0" />
                        <span class="toggle__slider"></span>
                    </label>
                </div>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Globe } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import {useSettings} from "@/composables/useSettings.js";

const keys = ['default_language', 'admin_language', 'weight_unit', 'dimension_unit', 'rtl_mode']
const { form, saving, save } = useSettings(keys, 'Localization')
</script>