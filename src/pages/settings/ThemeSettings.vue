<template>
    <SettingsCard :icon="Palette" title="Theme Settings" description="Customize the accent color of your admin panel" :saving="saving"
        @save="save">
        <div class="field-group field-group--1">
            <!-- Color Theme Selection -->
            <div class="field">
                <label class="label">Color Theme</label>
                <p class="hint">Choose the accent color palette for the admin panel</p>

                <div class="theme-grid">
                    <button v-for="t in themes" :key="t.id" @click="selectTheme(t.id)"
                        class="theme-card"
                        :class="{ 'theme-card--active': selectedTheme === t.id }"
                        :style="getThemeCardStyle(t.id, selectedTheme === t.id)">
                        <div class="theme-swatches">
                            <div class="theme-swatch theme-swatch--primary" :style="{ background: getThemePrimaryColor(t.id) }" />
                            <div class="theme-swatch theme-swatch--light" :style="{ background: getThemeLightColor(t.id) }" />
                            <div class="theme-swatch theme-swatch--sidebar" :style="{ background: getThemeSidebarColor(t.id) }" />
                        </div>
                        <div class="theme-info">
                            <span class="theme-emoji">{{ t.icon }}</span>
                            <span class="theme-name">{{ t.label }}</span>
                        </div>
                        <div v-if="selectedTheme === t.id" class="theme-check">
                            <Check class="w-3.5 h-3.5" />
                        </div>
                    </button>
                </div>
            </div>

            <!-- Apply Hint -->
            <div class="action-row">
                <span class="hint">Changes are applied immediately to the admin panel</span>
            </div>
        </div>
    </SettingsCard>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Palette, Check } from 'lucide-vue-next'
import SettingsCard from '@/components/common/SettingsCard.vue'
import { useSettings } from '@/composables/useSettings.js'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const keys = ['theme_color']
const { form, saving, save } = useSettings(keys, 'Theme')

const themes = [
    { id: 'default', label: 'Default', icon: '🌿' },
    { id: 'tint', label: 'Tint', icon: '🎨' },
    { id: 'dark-aqua', label: 'Dark Aqua', icon: '🌊' },
]

const selectedTheme = ref(themeStore.colorTheme)

// Keep the form in sync with selection
watch(selectedTheme, (val) => {
    form.theme_color = val
}, { immediate: true })

/* ─── Theme preview helpers ─── */
function getThemePrimaryColor(id) {
    return { default: '#2E7D32', tint: '#2563EB', 'dark-aqua': '#0D9488' }[id]
}

function getThemeLightColor(id) {
    return { default: '#E8F5E9', tint: '#DBEAFE', 'dark-aqua': '#CCFBF1' }[id]
}

function getThemeSidebarColor(id) {
    return '#0F172A'
}

function getThemeCardStyle(id, active) {
    const borderColor = active ? getThemePrimaryColor(id) : '#e2e8f0'
    const bgColor = active
        ? { default: '#f0fdf4', tint: '#eff6ff', 'dark-aqua': '#f0fdfa' }[id]
        : '#ffffff'
    return {
        borderColor,
        backgroundColor: bgColor,
    }
}

/* ─── Actions ─── */
function selectTheme(id) {
    selectedTheme.value = id
    themeStore.setColorTheme(id)
}
</script>

<style scoped>
/* ─── Theme Card Grid ─── */
.theme-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 4px;
}

.theme-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #ffffff;
    text-align: left;
    font-family: inherit;
}

.theme-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.theme-card--active {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

/* Color swatches row */
.theme-swatches {
    display: flex;
    gap: 6px;
    align-items: center;
}

.theme-swatch {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Info row */
.theme-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #1e293b;
}

.theme-emoji {
    font-size: 1rem;
    line-height: 1;
}

.theme-name {
    flex: 1;
}

/* Checkmark badge */
.theme-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-primary, #2E7D32);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ─── Action Row ─── */
.action-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 8px;
}

/* ─── Responsive ─── */
@media (max-width: 640px) {
    .theme-grid {
        grid-template-columns: 1fr;
    }
}
</style>
