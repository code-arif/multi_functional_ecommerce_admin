<template>
    <SettingsCard :icon="Share2" title="Social Media" description="Link your social profiles" :saving="saving"
        @save="save">
        <div class="field-group">
            <div v-for="s in socials" :key="s.key" class="field">
                <label class="label">{{ s.label }}</label>
                <div class="input-group">
                    <component :is="s.icon" class="input-group__prefix" style="width:15px;height:15px" />
                    <input v-model="form[s.key]" class="input" :placeholder="s.placeholder" />
                </div>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Share2, Facebook, Instagram, Twitter, Youtube, Linkedin, Send, MessageCircle } from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const socials = [
    { key: 'facebook_url', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
    { key: 'instagram_url', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourpage' },
    { key: 'twitter_url', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/yourhandle' },
    { key: 'youtube_url', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel' },
    { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/...' },
    { key: 'tiktok_url', label: 'TikTok', icon: MessageCircle, placeholder: 'https://tiktok.com/@yourhandle' },
    { key: 'telegram_url', label: 'Telegram', icon: Send, placeholder: 'https://t.me/yourchannel' },
    { key: 'whatsapp_number', label: 'WhatsApp', icon: MessageCircle, placeholder: '+8801XXXXXXXXX' },
]

const keys = socials.map(s => s.key)
const { form, saving, save } = useSettings(keys, 'Social Media')
</script>