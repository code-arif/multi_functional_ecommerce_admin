<template>
    <SettingsCard :icon="Palette" title="Branding" description="Upload your store's logo and favicon" :saving="saving"
        @save="save">
        <div class="field-group">
            <!-- Store Logo -->
            <div class="field col-span-2">
                <label class="label">Store Logo</label>
                <div class="upload-area">
                    <div class="upload-preview" v-if="form.store_logo">
                        <img :src="form.store_logo" alt="Logo preview" class="preview-img preview-img--logo" />
                        <button class="preview-remove" @click="form.store_logo = ''" title="Remove">
                            <X class="w-3 h-3" />
                        </button>
                    </div>
                    <div class="upload-placeholder" v-else>
                        <ImageIcon class="upload-placeholder__icon" />
                        <span class="upload-placeholder__text">No logo uploaded</span>
                    </div>
                    <div class="upload-controls">
                        <label class="btn-secondary upload-btn" :class="{ 'opacity-50': uploading === 'store_logo' }">
                            <Upload class="w-4 h-4" />
                            {{ uploading === 'store_logo' ? 'Uploading…' : 'Upload Logo' }}
                            <input type="file" accept="image/*" class="hidden-input"
                                @change="e => uploadFile('store_logo', e.target.files[0])"
                                :disabled="uploading === 'store_logo'" />
                        </label>
                        <span class="hint">Recommended: 200×60px, PNG/SVG with transparent background</span>
                    </div>
                </div>
            </div>

            <!-- Favicon -->
            <div class="field col-span-2">
                <label class="label">Favicon</label>
                <div class="upload-area">
                    <div class="upload-preview" v-if="form.store_favicon">
                        <img :src="form.store_favicon" alt="Favicon preview" class="preview-img preview-img--favicon" />
                        <button class="preview-remove" @click="form.store_favicon = ''" title="Remove">
                            <X class="w-3 h-3" />
                        </button>
                    </div>
                    <div class="upload-placeholder upload-placeholder--sm" v-else>
                        <ImageIcon class="upload-placeholder__icon" />
                        <span class="upload-placeholder__text">No favicon uploaded</span>
                    </div>
                    <div class="upload-controls">
                        <label class="btn-secondary upload-btn"
                            :class="{ 'opacity-50': uploading === 'store_favicon' }">
                            <Upload class="w-4 h-4" />
                            {{ uploading === 'store_favicon' ? 'Uploading…' : 'Upload Favicon' }}
                            <input type="file" accept="image/x-icon,image/png,image/svg+xml" class="hidden-input"
                                @change="e => uploadFile('store_favicon', e.target.files[0])"
                                :disabled="uploading === 'store_favicon'" />
                        </label>
                        <span class="hint">Recommended: 32×32px or 64×64px .ico / .png</span>
                    </div>
                </div>
            </div>

            <!-- Brand Colors -->
            <hr class="divider col-span-2" />
            <p class="section-label col-span-2">Brand Colors</p>
            <div class="field">
                <label class="label">Primary Color</label>
                <div class="color-field">
                    <input type="color" v-model="form.brand_primary_color" class="color-input" />
                    <input v-model="form.brand_primary_color" class="input" placeholder="#2563eb" />
                </div>
            </div>
            <div class="field">
                <label class="label">Accent Color</label>
                <div class="color-field">
                    <input type="color" v-model="form.brand_accent_color" class="color-input" />
                    <input v-model="form.brand_accent_color" class="input" placeholder="#f59e0b" />
                </div>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Palette, Upload, X, Image as ImageIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { settingsApi } from '@/api'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const toast = useToast()
const uploading = ref(null)

const keys = ['store_logo', 'store_favicon', 'brand_primary_color', 'brand_accent_color']
const { form, saving, save } = useSettings(keys, 'Branding')

async function uploadFile(key, file) {
    if (!file) return
    uploading.value = key
    try {
        const r = await settingsApi.upload(key, file)
        form[key] = r.data.data.url || r.data.data.path
        toast.success('File uploaded successfully.')
    } catch {
        toast.error('Upload failed.')
    } finally {
        uploading.value = null
    }
}
</script>

<style scoped>
.upload-area {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    border: 1.5px dashed #d1d5db;
    border-radius: 10px;
    background: #f8fafc;
}

.upload-preview {
    position: relative;
    flex-shrink: 0;
}

.preview-img {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    object-fit: contain;
}

.preview-img--logo {
    height: 56px;
    width: 140px;
}

.preview-img--favicon {
    height: 48px;
    width: 48px;
}

.preview-remove {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 56px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    gap: 4px;
    flex-shrink: 0;
}

.upload-placeholder--sm {
    width: 48px;
}

.upload-placeholder__icon {
    width: 18px;
    height: 18px;
    color: #d1d5db;
}

.upload-placeholder__text {
    font-size: 0.6rem;
    color: #9ca3af;
    text-align: center;
}

.upload-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.upload-btn {
    cursor: pointer;
    position: relative;
}

.hidden-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
}

.color-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.color-input {
    width: 38px;
    height: 38px;
    padding: 2px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    background: none;
    flex-shrink: 0;
}

.w-3 {
    width: 12px;
    height: 12px;
}

.w-4 {
    width: 16px;
    height: 16px;
}
</style>