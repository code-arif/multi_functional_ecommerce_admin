<template>
    <SettingsCard :icon="Shield" title="Security Settings" description="Protect your admin and customer accounts"
        :saving="saving" @save="save">
        <p class="section-label">Authentication</p>
        <div class="toggle-row" v-for="t in authToggles" :key="t.key">
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
        <p class="section-label">Session & Login</p>
        <div class="field-group">
            <div class="field">
                <label class="label">Max Login Attempts</label>
                <input v-model="form.max_login_attempts" type="number" class="input" placeholder="5" min="1" max="20" />
                <span class="hint">Block after N failed attempts</span>
            </div>
            <div class="field">
                <label class="label">Lockout Duration (minutes)</label>
                <input v-model="form.lockout_duration" type="number" class="input" placeholder="15" min="1" />
            </div>
            <div class="field">
                <label class="label">Admin Session Lifetime (minutes)</label>
                <input v-model="form.admin_session_lifetime" type="number" class="input" placeholder="120" />
            </div>
            <div class="field">
                <label class="label">Password Min Length</label>
                <input v-model="form.password_min_length" type="number" class="input" placeholder="8" min="6" />
            </div>
        </div>

        <hr class="divider" />
        <p class="section-label">CAPTCHA</p>
        <div class="toggle-row">
            <div class="toggle-info">
                <span class="toggle-info__title">Enable reCAPTCHA</span>
                <span class="toggle-info__desc">Protect login and registration forms</span>
            </div>
            <label class="toggle">
                <input type="checkbox" v-model="form.recaptcha_enabled" true-value="1" false-value="0" />
                <span class="toggle__slider"></span>
            </label>
        </div>
        <div class="field-group" v-if="form.recaptcha_enabled == '1'" style="margin-top:14px">
            <div class="field">
                <label class="label">reCAPTCHA Site Key</label>
                <input v-model="form.recaptcha_site_key" class="input" placeholder="6Le..." />
            </div>
            <div class="field">
                <label class="label">reCAPTCHA Secret Key</label>
                <input v-model="form.recaptcha_secret_key" class="input" placeholder="6Le..." type="password" />
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Shield } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const authToggles = [
    { key: 'two_factor_enabled', label: 'Two-Factor Authentication', desc: 'Require 2FA for admin login' },
    { key: 'force_https', label: 'Force HTTPS', desc: 'Redirect all traffic to HTTPS' },
    { key: 'ip_whitelist_enabled', label: 'IP Whitelist (Admin)', desc: 'Restrict admin access by IP' },
]

const keys = [
    ...authToggles.map(t => t.key),
    'max_login_attempts', 'lockout_duration',
    'admin_session_lifetime', 'password_min_length',
    'recaptcha_enabled', 'recaptcha_site_key', 'recaptcha_secret_key',
]
const { form, saving, save } = useSettings(keys, 'Security')
</script>