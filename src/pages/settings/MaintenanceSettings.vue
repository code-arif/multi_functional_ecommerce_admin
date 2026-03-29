<template>
    <div class="space-y-5">
        <!-- Site Status -->
        <SettingsCard :icon="Wrench" title="Maintenance Mode"
            description="Toggle site availability and run system commands" :no-footer="true">
            <div class="toggle-row">
                <div class="toggle-info">
                    <span class="toggle-info__title">Site Status</span>
                    <span class="toggle-info__desc">
                        <span :class="siteUp ? 'badge--green' : 'badge--red'" class="badge">
                            {{ siteUp ? 'Online' : 'Under Maintenance' }}
                        </span>
                    </span>
                </div>
                <button class="btn-primary" :class="siteUp ? 'btn-danger' : ''" @click="toggleSite"
                    :disabled="togglingStatus">
                    <Loader2 v-if="togglingStatus" class="btn-spinner" />
                    <PowerOff v-else style="width:15px;height:15px" />
                    {{ togglingStatus ? 'Updating…' : (siteUp ? 'Put Down (Maintenance)' : 'Bring Up (Go Live)') }}
                </button>
            </div>

            <div v-if="!siteUp" class="maintenance-msg-field" style="margin-top:16px">
                <label class="label">Maintenance Message</label>
                <textarea v-model="maintenanceMsg" class="textarea" rows="2"
                    placeholder="We'll be back soon. Thank you for your patience." />
                <button class="btn-secondary" style="margin-top:8px" @click="saveMsg" :disabled="savingMsg">
                    <Loader2 v-if="savingMsg" class="btn-spinner" />
                    Save Message
                </button>
            </div>
        </SettingsCard>

        <!-- Artisan Commands -->
        <SettingsCard :icon="Terminal" title="System Commands"
            description="Run artisan commands directly from the dashboard" :no-footer="true">
            <div class="commands-grid">
                <div v-for="cmd in commands" :key="cmd.key" class="command-card">
                    <div class="command-card__info">
                        <component :is="cmd.icon" class="command-card__icon" />
                        <div>
                            <p class="command-card__title">{{ cmd.label }}</p>
                            <p class="command-card__cmd">{{ cmd.artisan }}</p>
                        </div>
                    </div>
                    <button class="btn-secondary command-btn" @click="runCommand(cmd)" :disabled="running === cmd.key">
                        <Loader2 v-if="running === cmd.key" class="btn-spinner" />
                        <Play v-else style="width:13px;height:13px" />
                        {{ running === cmd.key ? 'Running…' : 'Run' }}
                    </button>
                </div>
            </div>

            <!-- Output log -->
            <div v-if="output" class="command-output">
                <div class="command-output__header">
                    <span>Output</span>
                    <button @click="output = ''" class="output-clear">
                        <X style="width:13px;height:13px" /> Clear
                    </button>
                </div>
                <pre class="command-output__body">{{ output }}</pre>
            </div>
        </SettingsCard>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import {
    Wrench, Terminal, Loader2, Play, X,
    PowerOff, Trash2, Link, RefreshCw, Database, ShieldCheck
} from 'lucide-vue-next'
import SettingsCard from "@/components/common/SettingsCard.vue";
// import { maintenanceApi } from '@/api'

const toast = useToast()
const siteUp = ref(true)
const togglingStatus = ref(false)
const maintenanceMsg = ref('')
const savingMsg = ref(false)
const running = ref(null)
const output = ref('')

const commands = [
    { key: 'storage_link', label: 'Storage Link', artisan: 'php artisan storage:link', icon: Link },
    { key: 'cache_clear', label: 'Clear Cache', artisan: 'php artisan cache:clear', icon: Trash2 },
    { key: 'config_clear', label: 'Clear Config', artisan: 'php artisan config:clear', icon: RefreshCw },
    { key: 'view_clear', label: 'Clear Views', artisan: 'php artisan view:clear', icon: RefreshCw },
    { key: 'route_clear', label: 'Clear Routes', artisan: 'php artisan route:clear', icon: RefreshCw },
    { key: 'optimize', label: 'Optimize', artisan: 'php artisan optimize', icon: ShieldCheck },
    { key: 'migrate', label: 'Run Migrations', artisan: 'php artisan migrate', icon: Database },
    { key: 'queue_restart', label: 'Restart Queue', artisan: 'php artisan queue:restart', icon: RefreshCw },
]

async function toggleSite() {
    togglingStatus.value = true
    try {
        // await maintenanceApi.toggle(!siteUp.value)
        await new Promise(r => setTimeout(r, 1000))
        siteUp.value = !siteUp.value
        toast.success(siteUp.value ? 'Site is now live.' : 'Site is now in maintenance mode.')
    } catch {
        toast.error('Failed to update site status.')
    } finally {
        togglingStatus.value = false
    }
}

async function saveMsg() {
    savingMsg.value = true
    await new Promise(r => setTimeout(r, 800))
    savingMsg.value = false
    toast.success('Maintenance message saved.')
}

async function runCommand(cmd) {
    running.value = cmd.key
    output.value = ''
    try {
        // const r = await maintenanceApi.runCommand(cmd.key)
        // output.value = r.data.output
        await new Promise(r => setTimeout(r, 1200))
        output.value = `$ ${cmd.artisan}\n✓ Command executed successfully.`
        toast.success(`${cmd.label} completed.`)
    } catch {
        output.value = `$ ${cmd.artisan}\n✗ Command failed.`
        toast.error(`${cmd.label} failed.`)
    } finally {
        running.value = null
    }
}
</script>

<style scoped>
.space-y-5>*+* {
    margin-top: 20px;
}

.badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
}

.badge--green {
    background: #dcfce7;
    color: #15803d;
}

.badge--red {
    background: #fee2e2;
    color: #dc2626;
}

.commands-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.command-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
}

.command-card__info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.command-card__icon {
    width: 18px;
    height: 18px;
    color: #64748b;
    flex-shrink: 0;
}

.command-card__title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 2px;
}

.command-card__cmd {
    font-size: 0.7rem;
    color: #94a3b8;
    font-family: monospace;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.command-btn {
    font-size: 0.78rem;
    padding: 6px 12px;
    flex-shrink: 0;
}

.command-output {
    margin-top: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

.command-output__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 600;
}

.output-clear {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 0.72rem;
}

.command-output__body {
    background: #0f172a;
    color: #86efac;
    padding: 12px 14px;
    font-family: monospace;
    font-size: 0.8rem;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
}

@media (max-width: 640px) {
    .commands-grid {
        grid-template-columns: 1fr;
    }
}
</style>