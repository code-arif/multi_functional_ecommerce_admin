<template>
    <SettingsCard :icon="Search" title="SEO Settings" description="Optimize your store for search engines"
        :saving="saving" @save="save">
        <div class="field-group field-group--1">
            <div class="field">
                <label class="label">Default Meta Title</label>
                <input v-model="form.meta_title" class="input"
                    placeholder="EcoShop – Best Online Store in Bangladesh" />
                <span class="hint">{{ (form.meta_title || '').length }}/60 characters recommended</span>
            </div>
            <div class="field">
                <label class="label">Default Meta Description</label>
                <textarea v-model="form.meta_description" class="textarea" rows="3"
                    placeholder="Shop the best products at EcoShop..." />
                <span class="hint">{{ (form.meta_description || '').length }}/160 characters recommended</span>
            </div>
            <div class="field">
                <label class="label">Meta Keywords</label>
                <input v-model="form.meta_keywords" class="input" placeholder="online shop, ecommerce, bangladesh" />
                <span class="hint">Comma separated keywords</span>
            </div>
            <hr class="divider" />
            <p class="section-label">Open Graph / Social Sharing</p>
            <div class="field">
                <label class="label">OG Title</label>
                <input v-model="form.og_title" class="input" placeholder="EcoShop" />
            </div>
            <div class="field">
                <label class="label">OG Description</label>
                <textarea v-model="form.og_description" class="textarea" rows="2" placeholder="Your one-stop shop..." />
            </div>
            <hr class="divider" />
            <p class="section-label">Analytics & Tracking</p>
            <div class="field">
                <label class="label">Google Analytics ID</label>
                <input v-model="form.google_analytics_id" class="input" placeholder="G-XXXXXXXXXX" />
            </div>
            <div class="field">
                <label class="label">Google Tag Manager ID</label>
                <input v-model="form.google_tag_manager_id" class="input" placeholder="GTM-XXXXXXX" />
            </div>
            <div class="field">
                <label class="label">Facebook Pixel ID</label>
                <input v-model="form.facebook_pixel_id" class="input" placeholder="XXXXXXXXXXXXXXXXXX" />
            </div>
            <div class="field">
                <label class="label">Google Site Verification</label>
                <input v-model="form.google_site_verification" class="input" placeholder="Verification meta content" />
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Search } from 'lucide-vue-next'
import SettingsCard from '../components/SettingsCard.vue'
import { useSettings } from '../useSettings'

const keys = [
    'meta_title', 'meta_description', 'meta_keywords',
    'og_title', 'og_description',
    'google_analytics_id', 'google_tag_manager_id',
    'facebook_pixel_id', 'google_site_verification',
]
const { form, saving, save } = useSettings(keys, 'SEO')
</script>