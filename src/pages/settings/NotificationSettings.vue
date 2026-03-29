<template>
    <SettingsCard :icon="Bell" title="Notification Settings" description="Configure email and system notifications"
        :saving="saving" @save="save">
        <p class="section-label">Order Notifications (Admin)</p>
        <div class="toggle-row" v-for="n in adminNotifs" :key="n.key">
            <div class="toggle-info">
                <span class="toggle-info__title">{{ n.label }}</span>
                <span class="toggle-info__desc">{{ n.desc }}</span>
            </div>
            <label class="toggle">
                <input type="checkbox" v-model="form[n.key]" true-value="1" false-value="0" />
                <span class="toggle__slider"></span>
            </label>
        </div>

        <hr class="divider" />
        <p class="section-label">Customer Notifications</p>
        <div class="toggle-row" v-for="n in customerNotifs" :key="n.key">
            <div class="toggle-info">
                <span class="toggle-info__title">{{ n.label }}</span>
                <span class="toggle-info__desc">{{ n.desc }}</span>
            </div>
            <label class="toggle">
                <input type="checkbox" v-model="form[n.key]" true-value="1" false-value="0" />
                <span class="toggle__slider"></span>
            </label>
        </div>

        <hr class="divider" />
        <p class="section-label">Admin Notification Email</p>
        <div class="field">
            <label class="label">Notify Admin Email</label>
            <input v-model="form.admin_notification_email" type="email" class="input" placeholder="admin@ecoshop.com" />
            <span class="hint">All admin alerts will be sent to this address</span>
        </div>
    </SettingsCard>
</template>

<script setup>
import { Bell } from 'lucide-vue-next'
import SettingsCard from '../components/SettingsCard.vue'
import { useSettings } from '../useSettings'

const adminNotifs = [
    { key: 'notify_admin_new_order', label: 'New Order', desc: 'Get notified when a new order is placed' },
    { key: 'notify_admin_order_cancel', label: 'Order Cancelled', desc: 'Get notified when an order is cancelled' },
    { key: 'notify_admin_low_stock', label: 'Low Stock Alert', desc: 'Get notified when product stock is low' },
    { key: 'notify_admin_new_review', label: 'New Review', desc: 'Get notified on new product review' },
]

const customerNotifs = [
    { key: 'notify_customer_order_confirm', label: 'Order Confirmation', desc: 'Send confirmation email on order' },
    { key: 'notify_customer_shipped', label: 'Order Shipped', desc: 'Notify customer when order ships' },
    { key: 'notify_customer_delivered', label: 'Order Delivered', desc: 'Notify customer on delivery' },
    { key: 'notify_customer_invoice', label: 'Invoice Email', desc: 'Send invoice PDF with order email' },
]

const keys = [
    ...adminNotifs.map(n => n.key),
    ...customerNotifs.map(n => n.key),
    'admin_notification_email',
]
const { form, saving, save } = useSettings(keys, 'Notifications')
</script>

<style scoped>
.field {
    margin-top: 14px;
}
</style>