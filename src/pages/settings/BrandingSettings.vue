<template>
    <SettingsCard :icon="Palette" title="Branding" description="Upload your store's logos, favicon, and set brand colors"
        :saving="saving" @save="save">
        <div class="field-group">
            <!-- ════════════════════════════════════════
                 LOGOS SECTION
                 ════════════════════════════════════════ -->
            <div class="col-span-2">
                <p class="section-label" style="margin-bottom:12px">Store Logos</p>
            </div>

            <!-- ─── Logo Grid ─── -->
            <div class="col-span-2 logo-grid">
                <div v-for="logo in logos" :key="logo.key" class="logo-card"
                    :class="{ 'logo-card--empty': !form[logo.key] }">
                    <!-- Card header with label + color badge -->
                    <div class="logo-card__header">
                        <div class="logo-card__info">
                            <span class="logo-card__label">{{ logo.label }}</span>
                            <span class="logo-card__badge" :style="{ background: logo.swatch, color: logo.swatchText }">
                                {{ logo.badge }}
                            </span>
                        </div>
                        <div class="logo-card__color-dot" :style="{ background: logo.swatch }" />
                    </div>

                    <!-- Preview area -->
                    <div class="logo-card__preview" :style="{ background: logo.previewBg }">
                        <div v-if="form[logo.key]" class="logo-card__image-wrap">
                            <img :src="form[logo.key]" :alt="logo.label"
                                class="logo-card__img"
                                :class="logo.imgClass"
                                @error="$event.target.style.display = 'none'" />
                        </div>
                        <div v-else class="logo-card__placeholder">
                            <ImageIcon class="logo-card__placeholder-icon" />
                            <span class="logo-card__placeholder-text">No logo uploaded</span>
                        </div>
                    </div>

                    <!-- Upload controls -->
                    <div class="logo-card__actions">
                        <label class="btn-secondary logo-card__btn upload-btn"
                            :class="{ 'opacity-50': uploading === logo.key }">
                            <Upload class="w-3.5 h-3.5" />
                            {{ uploading === logo.key ? 'Uploading…' : 'Upload' }}
                            <input type="file" accept="image/*" class="hidden-input"
                                @change="e => uploadFile(logo.key, e.target.files[0])"
                                :disabled="uploading === logo.key" />
                        </label>
                        <button v-if="form[logo.key]" class="logo-card__remove"
                            @click="form[logo.key] = ''" title="Remove">
                            <Trash2 class="w-3.5 h-3.5" />
                        </button>
                        <span class="logo-card__hint">{{ logo.sizeHint }}</span>
                    </div>
                </div>
            </div>

            <!-- ════════════════════════════════════════
                 FAVICON
                 ════════════════════════════════════════ -->
            <hr class="divider col-span-2" />
            <p class="section-label col-span-2" style="margin-bottom:6px">Favicon</p>

            <div class="col-span-2 favicon-row">
                <div class="favicon-preview-wrap">
                    <div class="favicon-preview" v-if="form.store_favicon">
                        <img :src="form.store_favicon" alt="Favicon" class="favicon-img" />
                        <button class="preview-remove" @click="form.store_favicon = ''" title="Remove">
                            <X class="w-3 h-3" />
                        </button>
                    </div>
                    <div class="favicon-placeholder" v-else>
                        <ImageIcon class="upload-placeholder__icon" />
                    </div>
                </div>
                <div class="favicon-controls">
                    <label class="btn-secondary upload-btn" :class="{ 'opacity-50': uploading === 'store_favicon' }">
                        <Upload class="w-4 h-4" />
                        {{ uploading === 'store_favicon' ? 'Uploading…' : 'Upload Favicon' }}
                        <input type="file" accept="image/x-icon,image/png,image/svg+xml" class="hidden-input"
                            @change="e => uploadFile('store_favicon', e.target.files[0])"
                            :disabled="uploading === 'store_favicon'" />
                    </label>
                    <span class="hint">Recommended: 32×32px or 64×64px .ico / .png</span>
                </div>
            </div>

            <!-- ════════════════════════════════════════
                 BRAND COLORS
                 ════════════════════════════════════════ -->
            <hr class="divider col-span-2" />
            <p class="section-label col-span-2" style="margin-bottom:6px">Brand Colors</p>

            <div class="field">
                <label class="label">Primary Color</label>
                <div class="color-field">
                    <input type="color" v-model="form.brand_primary_color" class="color-input" />
                    <input v-model="form.brand_primary_color" class="input" placeholder="#2E7D32" />
                </div>
            </div>
            <div class="field">
                <label class="label">Accent Color</label>
                <div class="color-field">
                    <input type="color" v-model="form.brand_accent_color" class="color-input" />
                    <input v-model="form.brand_accent_color" class="input" placeholder="#4CAF50" />
                </div>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Palette, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { settingsApi } from '@/api'
import SettingsCard from "@/components/common/SettingsCard.vue";
import { useSettings } from "@/composables/useSettings.js";

const toast = useToast()
const uploading = ref(null)

const keys = [
    'store_logo_default', 'store_logo_light', 'store_logo_dark',
    'store_logo_icon', 'store_logo_small',
    'store_favicon',
    'brand_primary_color', 'brand_accent_color',
]
const { form, saving, save } = useSettings(keys, 'Branding')

const logos = [
    {
        key: 'store_logo_default', label: 'Default Logo',
        badge: 'Light bg', swatch: '#2E7D32', swatchText: '#fff',
        previewBg: '#ffffff', sizeHint: '200×60px · PNG/SVG',
        imgClass: 'logo-img--landscape',
    },
    {
        key: 'store_logo_light', label: 'Light Logo',
        badge: 'Dark bg', swatch: '#ffffff', swatchText: '#1E293B',
        previewBg: '#1E293B', sizeHint: '200×60px · Light colored',
        imgClass: 'logo-img--landscape',
    },
    {
        key: 'store_logo_dark', label: 'Dark Logo',
        badge: 'Light bg', swatch: '#1E293B', swatchText: '#fff',
        previewBg: '#F8FAFC', sizeHint: '200×60px · Dark colored',
        imgClass: 'logo-img--landscape',
    },
    {
        key: 'store_logo_icon', label: 'Icon / Emblem',
        badge: 'Square', swatch: '#4CAF50', swatchText: '#fff',
        previewBg: '#F1F5F9', sizeHint: '48×48px · Square icon',
        imgClass: 'logo-img--square',
    },
    {
        key: 'store_logo_small', label: 'Small Logo',
        badge: 'Compact', swatch: '#2E7D32', swatchText: '#fff',
        previewBg: '#ffffff', sizeHint: '140×40px · Compact',
        imgClass: 'logo-img--compact',
    },
]

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
/* ════════════════════════════════════════
   LOGO GRID
   ════════════════════════════════════════ */
.logo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

@media (max-width: 640px) {
    .logo-grid {
        grid-template-columns: 1fr;
    }
}

/* ─── Logo Card ─── */
.logo-card {
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.logo-card:hover {
    border-color: var(--color-primary-light);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.logo-card--empty {
    border-style: dashed;
}

/* ─── Card Header ─── */
.logo-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    background: var(--border-light);
}

.logo-card__info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.logo-card__label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-primary);
}

.logo-card__badge {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 7px;
    border-radius: 5px;
    line-height: 1.3;
}

.logo-card__color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.08);
    flex-shrink: 0;
}

/* ─── Preview Area ─── */
.logo-card__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    padding: 14px;
    transition: background-color 0.25s ease;
}

.logo-card__image-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-card__img {
    object-fit: contain;
    border-radius: 6px;
    max-width: 100%;
}

.logo-img--landscape {
    height: 42px;
    width: auto;
    max-width: 180px;
}

.logo-img--square {
    width: 44px;
    height: 44px;
}

.logo-img--compact {
    height: 32px;
    width: auto;
    max-width: 130px;
}

/* ─── Placeholder ─── */
.logo-card__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.logo-card__placeholder-icon {
    width: 22px;
    height: 22px;
    color: var(--text-muted);
}

.logo-card__placeholder-text {
    font-size: 0.6875rem;
    color: var(--text-muted);
}

/* ─── Actions ─── */
.logo-card__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid var(--border-light);
    flex-wrap: wrap;
}

.logo-card__btn {
    flex-shrink: 0;
    font-size: 0.75rem !important;
    padding: 6px 12px !important;
}

.logo-card__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: color-mix(in srgb, var(--danger) 12%, transparent);
    color: var(--danger);
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
}

.logo-card__remove:hover {
    background: color-mix(in srgb, var(--danger) 25%, transparent);
}

.logo-card__hint {
    font-size: 0.65rem;
    color: var(--text-muted);
    margin-left: auto;
    white-space: nowrap;
}

/* ════════════════════════════════════════
   FAVICON
   ════════════════════════════════════════ */
.favicon-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    border: 1.5px dashed var(--border);
    border-radius: 10px;
    background: var(--border-light);
    transition: background-color 0.25s ease, border-color 0.25s ease;
}

.favicon-preview-wrap {
    flex-shrink: 0;
}

.favicon-preview {
    position: relative;
    display: inline-block;
}

.favicon-img {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    object-fit: contain;
}

.favicon-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
}

.favicon-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* ─── Shared utils ─── */
.preview-remove {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    background: var(--danger);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.hidden-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
}

.upload-btn {
    cursor: pointer;
    position: relative;
}

.upload-placeholder__icon {
    width: 18px;
    height: 18px;
    color: var(--text-muted);
}

/* ════════════════════════════════════════
   BRAND COLORS
   ════════════════════════════════════════ */
.color-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.color-input {
    width: 38px;
    height: 38px;
    padding: 2px;
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    background: none;
    flex-shrink: 0;
    transition: border-color 0.25s ease;
}
</style>