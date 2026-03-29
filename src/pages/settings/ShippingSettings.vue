<template>
    <SettingsCard :icon="Truck" title="Shipping Settings" description="Configure delivery charges and zones"
        :saving="saving" @save="save">
        <div class="field-group">
            <div class="field">
                <label class="label">Default Shipping Charge</label>
                <div class="input-group">
                    <span class="input-group__prefix">৳</span>
                    <input v-model="form.shipping_charge" type="number" class="input" placeholder="60" min="0" />
                </div>
            </div>
            <div class="field">
                <label class="label">Free Shipping Over</label>
                <div class="input-group">
                    <span class="input-group__prefix">৳</span>
                    <input v-model="form.free_shipping_over" type="number" class="input" placeholder="1000" min="0" />
                </div>
                <span class="hint">Set 0 to disable free shipping threshold</span>
            </div>
            <div class="field">
                <label class="label">Inside Dhaka Charge</label>
                <div class="input-group">
                    <span class="input-group__prefix">৳</span>
                    <input v-model="form.shipping_charge_inside_dhaka" type="number" class="input" placeholder="60" />
                </div>
            </div>
            <div class="field">
                <label class="label">Outside Dhaka Charge</label>
                <div class="input-group">
                    <span class="input-group__prefix">৳</span>
                    <input v-model="form.shipping_charge_outside_dhaka" type="number" class="input" placeholder="120" />
                </div>
            </div>
            <div class="field">
                <label class="label">Estimated Delivery (days)</label>
                <input v-model="form.shipping_estimated_days" class="input" placeholder="3-5" />
            </div>
            <div class="field">
                <label class="label">Shipping Method</label>
                <select v-model="form.shipping_method" class="select">
                    <option value="flat">Flat Rate</option>
                    <option value="free">Free Shipping</option>
                    <option value="zone">Zone Based</option>
                    <option value="weight">Weight Based</option>
                </select>
            </div>

            <div class="field col-span-2">
                <hr class="divider" />
                <p class="section-label">Cash On Delivery</p>
                <div class="toggle-row">
                    <div class="toggle-info">
                        <span class="toggle-info__title">Enable COD</span>
                        <span class="toggle-info__desc">Allow customers to pay on delivery</span>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" v-model="form.cod_enabled" true-value="1" false-value="0" />
                        <span class="toggle__slider"></span>
                    </label>
                </div>
                <div class="toggle-row">
                    <div class="toggle-info">
                        <span class="toggle-info__title">COD Extra Charge</span>
                        <span class="toggle-info__desc">Apply extra charge for COD orders</span>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" v-model="form.cod_charge_enabled" true-value="1" false-value="0" />
                        <span class="toggle__slider"></span>
                    </label>
                </div>
                <div class="field" style="margin-top:14px" v-if="form.cod_charge_enabled == '1'">
                    <label class="label">COD Extra Charge</label>
                    <div class="input-group">
                        <span class="input-group__prefix">৳</span>
                        <input v-model="form.cod_extra_charge" type="number" class="input" placeholder="20" />
                    </div>
                </div>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Truck } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const keys = [
    'shipping_charge', 'free_shipping_over',
    'shipping_charge_inside_dhaka', 'shipping_charge_outside_dhaka',
    'shipping_estimated_days', 'shipping_method',
    'cod_enabled', 'cod_charge_enabled', 'cod_extra_charge',
]
const { form, saving, save } = useSettings(keys, 'Shipping')
</script>