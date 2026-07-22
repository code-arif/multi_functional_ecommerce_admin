<template>
    <SettingsCard :icon="Mail" title="Mail Settings" description="Configure SMTP or other mail drivers" :saving="saving"
        @save="save">
        <div class="field-group">
            <div class="field">
                <label class="label">Mail Driver / Mailer</label>
                <SelectBox v-model="form.mail_mailer" :options="mailerOptions" full-width />
            </div>
            <div class="field">
                <label class="label">Encryption</label>
                <SelectBox v-model="form.mail_encryption" :options="encryptionOptions" full-width />
            </div>

            <template v-if="form.mail_mailer === 'smtp'">
                <div class="field">
                    <label class="label">SMTP Host</label>
                    <input v-model="form.mail_host" class="input" placeholder="smtp.mailgun.org" />
                </div>
                <div class="field">
                    <label class="label">SMTP Port</label>
                    <input v-model="form.mail_port" type="number" class="input" placeholder="587" />
                </div>
                <div class="field">
                    <label class="label">SMTP Username</label>
                    <input v-model="form.mail_username" class="input" placeholder="postmaster@yourdomain.com"
                        autocomplete="off" />
                </div>
                <div class="field">
                    <label class="label">SMTP Password</label>
                    <div class="input-group">
                        <Lock class="input-group__prefix" style="width:15px;height:15px" />
                        <input v-model="form.mail_password" :type="showPassword ? 'text' : 'password'" class="input"
                            placeholder="••••••••••••" autocomplete="new-password" style="padding-right:40px" />
                        <button type="button" class="input-group__suffix-btn" @click="showPassword = !showPassword">
                            <Eye v-if="!showPassword" style="width:16px;height:16px" />
                            <EyeOff v-else style="width:16px;height:16px" />
                        </button>
                    </div>
                </div>
            </template>

            <div class="field">
                <label class="label">From Address</label>
                <input v-model="form.mail_from_address" type="email" class="input" placeholder="noreply@ecoshop.com" />
            </div>
            <div class="field">
                <label class="label">From Name</label>
                <input v-model="form.mail_from_name" class="input" placeholder="EcoShop" />
            </div>

            <div class="field col-span-2">
                <hr class="divider" />
                <button type="button" class="btn-secondary" @click="testMail" :disabled="testing">
                    <Send style="width:15px;height:15px" />
                    {{ testing ? 'Sending test email…' : 'Send Test Email' }}
                </button>
                <span class="hint" style="margin-top:6px;display:block">
                    A test email will be sent to <strong>{{ form.mail_from_address || 'the from address' }}</strong>
                </span>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Mail, Lock, Eye, EyeOff, Send } from 'lucide-vue-next'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import SettingsCard from "@/components/common/SettingsCard.vue";
import SelectBox from "@/components/common/SelectBox.vue";
import { useSettings } from "@/composables/useSettings.js";

const toast = useToast()
const showPassword = ref(false)
const testing = ref(false)

const mailerOptions = [
    { value: 'smtp', label: 'SMTP' },
    { value: 'sendmail', label: 'Sendmail' },
    { value: 'mailgun', label: 'Mailgun' },
    { value: 'ses', label: 'Amazon SES' },
    { value: 'postmark', label: 'Postmark' },
    { value: 'log', label: 'Log (Dev)' },
    { value: 'array', label: 'Array (Testing)' },
]

const encryptionOptions = [
    { value: 'tls', label: 'TLS' },
    { value: 'ssl', label: 'SSL' },
    { value: '', label: 'None' },
]

const keys = [
    'mail_mailer', 'mail_host', 'mail_port', 'mail_username',
    'mail_password', 'mail_encryption', 'mail_from_address', 'mail_from_name',
]
const { form, saving, save } = useSettings(keys, 'Mail')

async function testMail() {
    testing.value = true
    try {
        // await settingsApi.testMail()
        await new Promise(r => setTimeout(r, 1500)) // placeholder
        toast.success('Test email sent!')
    } catch {
        toast.error('Failed to send test email.')
    } finally {
        testing.value = false
    }
}
</script>