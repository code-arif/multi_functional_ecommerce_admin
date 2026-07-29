<template>
    <SettingsCard :icon="Globe" title="Localization" description="Language, locale and regional preferences"
        :saving="saving" @save="save">
        <div class="field-group">
            <div class="field">
                <label class="label">Default Language</label>
                <SelectBox v-model="form.default_language" :options="languageOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Admin Panel Language</label>
                <SelectBox v-model="form.admin_language" :options="adminLanguageOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Weight Unit</label>
                <SelectBox v-model="form.weight_unit" :options="weightUnitOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Dimension Unit</label>
                <SelectBox v-model="form.dimension_unit" :options="dimensionUnitOptions" full-width />
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
import SettingsCard from "@ecom/ui/components/SettingsCard.vue";
import SelectBox from "@ecom/ui/components/SelectBox.vue";
import { useSettings } from "@ecom/ui/composables/useSettings.js";

const keys = ['default_language', 'admin_language', 'weight_unit', 'dimension_unit', 'rtl_mode']
const { form, saving, save } = useSettings(keys, 'Localization')

const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'bn', label: 'বাংলা (Bangla)' },
    { value: 'ar', label: 'Arabic' },
]

const adminLanguageOptions = [
    { value: 'en', label: 'English' },
    { value: 'bn', label: 'বাংলা (Bangla)' },
]

const weightUnitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'oz', label: 'Ounce (oz)' },
]

const dimensionUnitOptions = [
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'mm', label: 'Millimeter (mm)' },
    { value: 'in', label: 'Inch (in)' },
    { value: 'ft', label: 'Feet (ft)' },
]
</script>