<template>
    <SettingsCard :icon="Radio" title="Reverb / WebSocket Settings" description="Configure Laravel Reverb broadcasting"
        :saving="saving" @save="save">
        <div class="field-group">
            <div class="field col-span-2">
                <div class="toggle-row">
                    <div class="toggle-info">
                        <span class="toggle-info__title">Enable Broadcasting</span>
                        <span class="toggle-info__desc">Enable real-time events via Laravel Reverb</span>
                    </div>
                    <label class="toggle">
                        <input type="checkbox" v-model="form.reverb_enabled" true-value="1" false-value="0" />
                        <span class="toggle__slider"></span>
                    </label>
                </div>
            </div>

            <div class="field">
                <label class="label">App ID</label>
                <input v-model="form.reverb_app_id" class="input" placeholder="my-app-id" />
            </div>
            <div class="field">
                <label class="label">App Key</label>
                <input v-model="form.reverb_app_key" class="input" placeholder="my-app-key" />
            </div>
            <div class="field">
                <label class="label">App Secret</label>
                <div class="input-group">
                    <input v-model="form.reverb_app_secret" :type="showSecret ? 'text' : 'password'" class="input"
                        placeholder="••••••••••••" style="padding-right:40px" />
                    <button type="button" class="input-group__suffix-btn" @click="showSecret = !showSecret">
                        <Eye v-if="!showSecret" style="width:16px;height:16px" />
                        <EyeOff v-else style="width:16px;height:16px" />
                    </button>
                </div>
            </div>
            <div class="field">
                <label class="label">Host</label>
                <input v-model="form.reverb_host" class="input" placeholder="0.0.0.0" />
            </div>
            <div class="field">
                <label class="label">Port</label>
                <input v-model="form.reverb_port" type="number" class="input" placeholder="8080" />
            </div>
            <div class="field">
                <label class="label">Scheme</label>
                <select v-model="form.reverb_scheme" class="select">
                    <option value="http">http</option>
                    <option value="https">https</option>
                </select>
            </div>
            <div class="field">
                <label class="label">Pusher Host (Client)</label>
                <input v-model="form.reverb_pusher_host" class="input" placeholder="yourdomain.com" />
                <span class="hint">Used by the frontend JS client (window.Echo)</span>
            </div>
            <div class="field">
                <label class="label">Pusher Port (Client)</label>
                <input v-model="form.reverb_pusher_port" type="number" class="input" placeholder="8080" />
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Radio, Eye, EyeOff } from 'lucide-vue-next'
import { ref } from 'vue'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const showSecret = ref(false)

const keys = [
    'reverb_enabled', 'reverb_app_id', 'reverb_app_key', 'reverb_app_secret',
    'reverb_host', 'reverb_port', 'reverb_scheme',
    'reverb_pusher_host', 'reverb_pusher_port',
]
const { form, saving, save } = useSettings(keys, 'Reverb')
</script>