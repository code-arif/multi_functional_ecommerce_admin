<template>
    <div class="space-y-6">
        <BreadcrumbHeader :items="breadcrumbItems">
            <div class="flex items-center gap-2">
                <router-link to="/vendors"
                    class="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5">
                    <ArrowLeftIcon class="w-3.5 h-3.5" />
                    Back to Vendors
                </router-link>

                <template v-if="vendor && vendor.status === 'pending'">
                    <button @click="approveVendor"
                        class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm">
                        <CheckIcon class="w-3.5 h-3.5" />
                        Approve Vendor
                    </button>
                    <button @click="openRejectModal"
                        class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm">
                        <XMarkIcon class="w-3.5 h-3.5" />
                        Reject
                    </button>
                </template>
            </div>
        </BreadcrumbHeader>

        <!-- Loading -->
        <div v-if="loading" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
            <svg class="w-8 h-8 animate-spin mx-auto mb-3"
                :style="{ color: 'var(--color-primary)' }" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading vendor details...
        </div>

        <template v-else-if="vendor">
            <!-- Status Alerts Banner -->
            <div v-if="vendor.status === 'pending'"
                class="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <ClockIcon class="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold">New Vendor Application Pending Approval</h4>
                        <p class="text-xs text-amber-700">
                            Registered on {{ formatDate(vendor.created_at) }}. Please review shop details, settlement bank account, and KYC documents below before activating.
                        </p>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button @click="approveVendor"
                        class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1">
                        <CheckIcon class="w-4 h-4" /> Approve Now
                    </button>
                    <button @click="openRejectModal"
                        class="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1">
                        <XMarkIcon class="w-4 h-4" /> Reject
                    </button>
                </div>
            </div>

            <div v-else-if="vendor.status === 'rejected'"
                class="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-start justify-between gap-3 shadow-xs">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                        <XMarkIcon class="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold">Vendor Application Rejected</h4>
                        <p class="text-xs text-rose-700 mt-0.5">
                            Reason: <span class="font-medium">{{ vendor.rejection_reason || 'No specific reason provided' }}</span>
                        </p>
                    </div>
                </div>
                <button @click="makePendingVendor"
                    class="px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-100 text-rose-700 text-xs font-semibold shrink-0 transition">
                    Set to Pending Review
                </button>
            </div>

            <div v-else-if="vendor.status === 'suspended'"
                class="p-4 rounded-xl border border-orange-200 bg-orange-50 text-orange-900 flex items-start justify-between gap-3 shadow-xs">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                        <NoSymbolIcon class="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h4 class="text-sm font-bold">Vendor Account Suspended</h4>
                        <p class="text-xs text-orange-700 mt-0.5">
                            Reason: <span class="font-medium">{{ vendor.rejection_reason || 'No specific reason provided' }}</span>
                        </p>
                    </div>
                </div>
                <button @click="approveVendor"
                    class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition">
                    Reactivate Vendor
                </button>
            </div>

            <!-- Shop Header / Banner -->
            <div class="card overflow-hidden">
                <div class="h-32 md:h-40 relative overflow-hidden bg-slate-100">
                    <img
                        :src="vendor.banner_url || vendor.cover_image || defaultVendorBanner"
                        :alt="`${vendor.shop_name || 'Vendor'} banner`"
                        class="w-full h-full object-cover object-center"
                    />
                    <div
                        class="absolute inset-0 pointer-events-none"
                        :style="{ background: 'linear-gradient(to top, rgba(15, 23, 42, 0.14), transparent 55%)' }"
                    ></div>
                </div>
                <div class="px-6 pt-4 pb-6 relative bg-white">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                            <div class="w-20 h-20 md:w-24 md:h-24 -mt-14 sm:-mt-16 relative z-10 rounded-2xl overflow-hidden border-4 bg-white shrink-0 shadow-lg"
                                :style="{ borderColor: 'var(--surface)' }">
                                <img v-if="vendor.logo_url || vendor.shop_logo"
                                    :src="vendor.logo_url || vendor.shop_logo"
                                    :alt="vendor.shop_name"
                                    class="w-full h-full object-cover" />
                                <div v-else class="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                                    :style="{ backgroundColor: 'var(--color-primary)' }">
                                    {{ (vendor.shop_name || vendor.name)?.charAt(0)?.toUpperCase() || 'V' }}
                                </div>
                            </div>
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2.5">
                                    <h2 class="text-xl md:text-2xl font-black" :style="{ color: 'var(--text-primary)' }">
                                        {{ vendor.shop_name || vendor.name }}
                                    </h2>
                                    <StatusBadge :value="vendor.status" />
                                </div>
                                <div class="flex flex-wrap items-center gap-3 mt-1.5 text-xs" :style="{ color: 'var(--text-muted)' }">
                                    <span v-if="vendor.slug" class="font-mono text-gray-500 font-medium">@{{ vendor.slug }}</span>
                                    <span>•</span>
                                    <span>Representative: <strong class="font-semibold text-gray-700">{{ vendor.user?.name || vendor.name || 'N/A' }}</strong></span>
                                    <span>•</span>
                                    <span>Registered: {{ formatDate(vendor.created_at) }}</span>
                                    <span v-if="vendor.approved_at">• Approved: {{ formatDate(vendor.approved_at) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Status Selector Box -->
                        <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
                            <span class="text-xs font-semibold text-gray-500">Status:</span>
                            <SelectBox v-model="newStatus" :options="statusOptions" size="sm" class="w-36" @change="updateStatus" />
                        </div>
                    </div>

                    <!-- Financial & Performance Quick Stats -->
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t"
                        :style="{ borderColor: 'var(--border)' }">
                        <div class="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
                            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                <CurrencyDollarIcon class="w-3.5 h-3.5 text-emerald-600" /> Wallet Balance
                            </p>
                            <p class="text-lg md:text-xl font-black text-emerald-700">
                                ৳{{ Number(vendor.wallet_balance || 0).toLocaleString() }}
                            </p>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
                            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                <BanknotesIcon class="w-3.5 h-3.5 text-blue-600" /> Total Earned
                            </p>
                            <p class="text-lg md:text-xl font-black" :style="{ color: 'var(--text-primary)' }">
                                ৳{{ Number(vendor.total_earned || 0).toLocaleString() }}
                            </p>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
                            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                <ArrowDownTrayIcon class="w-3.5 h-3.5 text-purple-600" /> Withdrawn
                            </p>
                            <p class="text-lg md:text-xl font-black" :style="{ color: 'var(--text-primary)' }">
                                ৳{{ Number(vendor.total_withdrawn || 0).toLocaleString() }}
                            </p>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center relative group">
                            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                <ScaleIcon class="w-3.5 h-3.5 text-amber-600" /> Commission
                            </p>
                            <p class="text-lg md:text-xl font-black" :style="{ color: 'var(--color-primary)' }">
                                {{ vendor.commission_rate ?? 0 }}%
                            </p>
                            <div class="flex items-center justify-center gap-1.5 mt-0.5">
                                <span class="text-[10px] text-gray-400 capitalize">{{ vendor.commission_type || 'percentage' }}</span>
                                <button
                                    @click="openCommissionModal"
                                    class="text-[10px] font-semibold text-emerald-700 hover:underline"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                        <div class="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center col-span-2 sm:col-span-1">
                            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                                <ShoppingBagIcon class="w-3.5 h-3.5 text-indigo-600" /> Catalog & Orders
                            </p>
                            <p class="text-lg md:text-xl font-black" :style="{ color: 'var(--text-primary)' }">
                                {{ vendor.products_count ?? vendor.products?.length ?? 0 }} <span class="text-xs font-normal text-gray-500">products</span>
                            </p>
                            <span class="text-[10px] text-gray-400">{{ vendor.total_orders ?? vendor.orders?.length ?? 0 }} orders</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content 2-Column Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Column (1/3): Shop & Legal Identity -->
                <div class="space-y-6">
                    <!-- Owner & Representative Info -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4 flex items-center gap-2 pb-2 border-b"
                            :style="{ color: 'var(--text-primary)', borderColor: 'var(--border-light)' }">
                            <UserIcon class="w-4 h-4 text-emerald-600" />
                            Owner & Representative
                        </h3>
                        <div class="space-y-3.5 text-xs">
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <UserIcon class="w-4 h-4 text-gray-500" />
                                </div>
                                <div class="min-w-0">
                                    <p class="font-bold text-sm text-gray-800">{{ vendor.user?.name || vendor.name || '—' }}</p>
                                    <p class="text-[11px] text-gray-400">Account Holder / Representative</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <EnvelopeIcon class="w-4 h-4 text-gray-500" />
                                </div>
                                <div class="min-w-0">
                                    <a :href="`mailto:${vendor.email || vendor.user?.email}`" class="font-semibold text-emerald-700 hover:underline block truncate">
                                        {{ vendor.email || vendor.user?.email || '—' }}
                                    </a>
                                    <p class="text-[11px] text-gray-400">Official Shop Email</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <PhoneIcon class="w-4 h-4 text-gray-500" />
                                </div>
                                <div class="min-w-0">
                                    <a :href="`tel:${vendor.phone || vendor.user?.phone}`" class="font-semibold text-gray-800 hover:underline block">
                                        {{ vendor.phone || vendor.user?.phone || '—' }}
                                    </a>
                                    <p class="text-[11px] text-gray-400">Contact Number</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Legal Business Entity Profile -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4 flex items-center gap-2 pb-2 border-b"
                            :style="{ color: 'var(--text-primary)', borderColor: 'var(--border-light)' }">
                            <IdentificationIcon class="w-4 h-4 text-blue-600" />
                            Legal Entity & Tax Profile
                        </h3>
                        <div class="space-y-3 text-xs">
                            <div class="flex justify-between items-start py-1">
                                <span class="text-gray-500 font-medium">Business Entity:</span>
                                <span class="font-bold text-gray-800 text-right">
                                    {{ vendor.profile?.business_type || 'Sole Proprietorship / Individual' }}
                                </span>
                            </div>
                            <div class="flex justify-between items-start py-1 border-t border-gray-100">
                                <span class="text-gray-500 font-medium">Trade License / Reg #:</span>
                                <span class="font-mono font-bold text-gray-800 text-right">
                                    {{ vendor.profile?.business_registration_number || '—' }}
                                </span>
                            </div>
                            <div class="flex justify-between items-start py-1 border-t border-gray-100">
                                <span class="text-gray-500 font-medium">NID / Tax ID:</span>
                                <span class="font-mono font-bold text-gray-800 text-right">
                                    {{ vendor.profile?.tax_id || '—' }}
                                </span>
                            </div>
                            <div v-if="vendor.profile?.website" class="flex justify-between items-start py-1 border-t border-gray-100">
                                <span class="text-gray-500 font-medium">Website:</span>
                                <a :href="vendor.profile.website" target="_blank" class="text-emerald-700 font-medium hover:underline inline-flex items-center gap-1">
                                    Visit Site <ArrowTopRightOnSquareIcon class="w-3 h-3" />
                                </a>
                            </div>
                            <div v-if="vendor.profile?.social_facebook || vendor.profile?.social_instagram || vendor.profile?.social_youtube"
                                class="pt-2 border-t border-gray-100">
                                <p class="text-[11px] font-semibold text-gray-500 mb-1.5">Social Channels:</p>
                                <div class="flex flex-wrap gap-2">
                                    <a v-if="vendor.profile.social_facebook" :href="vendor.profile.social_facebook" target="_blank"
                                        class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium hover:underline">
                                        Facebook
                                    </a>
                                    <a v-if="vendor.profile.social_instagram" :href="vendor.profile.social_instagram" target="_blank"
                                        class="px-2 py-0.5 rounded bg-pink-50 text-pink-700 text-[11px] font-medium hover:underline">
                                        Instagram
                                    </a>
                                    <a v-if="vendor.profile.social_youtube" :href="vendor.profile.social_youtube" target="_blank"
                                        class="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[11px] font-medium hover:underline">
                                        YouTube
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Warehouse & Pickup Address -->
                    <div class="card p-5">
                        <h3 class="font-bold text-sm mb-4 flex items-center gap-2 pb-2 border-b"
                            :style="{ color: 'var(--text-primary)', borderColor: 'var(--border-light)' }">
                            <MapPinIcon class="w-4 h-4 text-rose-600" />
                            Warehouse & Pickup Address
                        </h3>

                        <div v-if="vendor.addresses && vendor.addresses.length > 0" class="space-y-3">
                            <div v-for="addr in vendor.addresses" :key="addr.uuid"
                                class="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1.5 text-xs">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-gray-800">{{ addr.label || 'Warehouse Location' }}</span>
                                    <span v-if="addr.is_default" class="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        Default Pickup
                                    </span>
                                </div>
                                <p class="text-gray-700 leading-relaxed font-medium">
                                    {{ addr.address_line_1 }}
                                    <span v-if="addr.address_line_2">, {{ addr.address_line_2 }}</span>
                                </p>
                                <div class="text-[11px] text-gray-500 flex flex-wrap gap-x-2">
                                    <span><strong>City:</strong> {{ addr.city || '—' }}</span>
                                    <span v-if="addr.state">• <strong>State:</strong> {{ addr.state }}</span>
                                    <span v-if="addr.postal_code">• <strong>Postal:</strong> {{ addr.postal_code }}</span>
                                    <span>• <strong>Country:</strong> {{ addr.country || 'Bangladesh' }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-4 text-xs text-gray-400">
                            <MapPinIcon class="w-6 h-6 mx-auto mb-1 text-gray-300" />
                            No pickup address registered
                        </div>
                    </div>

                    <!-- Store Bio / Description -->
                    <div v-if="vendor.description" class="card p-5">
                        <h3 class="font-bold text-sm mb-2" :style="{ color: 'var(--text-primary)' }">
                            Store Description & Categories
                        </h3>
                        <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {{ vendor.description }}
                        </p>
                    </div>
                </div>

                <!-- Right Column (2/3): Bank Accounts, KYC Documents, Products & Orders -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- SETTLEMENT BANK ACCOUNTS (CORE REQUEST) -->
                    <div class="card p-6">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-2"
                            :style="{ borderColor: 'var(--border-light)' }">
                            <div>
                                <h3 class="font-bold text-base flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
                                    <CreditCardIcon class="w-5 h-5 text-emerald-600" />
                                    Settlement & Bank Accounts (Payout)
                                </h3>
                                <p class="text-xs text-gray-500 mt-0.5">
                                    Marketplace vendor proceeds and sales revenues are disbursed directly to these settlement accounts.
                                </p>
                            </div>
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                                {{ vendor.bank_accounts?.length || 0 }} Account(s)
                            </span>
                        </div>

                        <!-- Bank Accounts List -->
                        <div v-if="vendor.bank_accounts && vendor.bank_accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                            <div v-for="acc in vendor.bank_accounts" :key="acc.uuid"
                                class="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/60 shadow-xs hover:shadow-md transition space-y-3.5 relative">
                                
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                            :class="acc.mobile_banking_provider ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'">
                                            <DevicePhoneMobileIcon v-if="acc.mobile_banking_provider" class="w-5 h-5" />
                                            <BuildingOfficeIcon v-else class="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 class="font-bold text-sm text-gray-900">
                                                {{ acc.mobile_banking_provider ? `${acc.mobile_banking_provider} Merchant` : (acc.bank_name || 'Bank Account') }}
                                            </h4>
                                            <span class="text-[11px] font-semibold text-gray-500">
                                                {{ acc.mobile_banking_provider ? 'Mobile Financial Service (MFS)' : (acc.branch_name || 'Commercial Bank') }}
                                            </span>
                                        </div>
                                    </div>
                                    <span v-if="acc.is_default"
                                        class="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                        Default Payout
                                    </span>
                                </div>

                                <div class="space-y-2 pt-2 border-t border-gray-100 text-xs">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-500 font-medium">Beneficiary / Account Name:</span>
                                        <span class="font-bold text-gray-900 text-right">{{ acc.account_name || '—' }}</span>
                                    </div>

                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-500 font-medium">
                                            {{ acc.mobile_banking_provider ? 'Mobile Wallet Number:' : 'Account / IBAN Number:' }}
                                        </span>
                                        <span class="font-mono font-bold text-sm text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100">
                                            {{ acc.account_number || acc.mobile_banking_number || '—' }}
                                        </span>
                                    </div>

                                    <template v-if="!acc.mobile_banking_provider">
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-500 font-medium">Branch Location:</span>
                                            <span class="font-medium text-gray-700">{{ acc.branch_name || 'Head / Main Branch' }}</span>
                                        </div>
                                        <div v-if="acc.routing_number" class="flex justify-between items-center">
                                            <span class="text-gray-500 font-medium">Routing Number:</span>
                                            <span class="font-mono font-medium text-gray-700">{{ acc.routing_number }}</span>
                                        </div>
                                        <div v-if="acc.swift_code" class="flex justify-between items-center">
                                            <span class="text-gray-500 font-medium">SWIFT / BIC Code:</span>
                                            <span class="font-mono font-medium text-gray-700">{{ acc.swift_code }}</span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="p-8 text-center text-sm rounded-xl border border-dashed border-gray-300 mt-4 bg-gray-50">
                            <CreditCardIcon class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p class="font-semibold text-gray-700">No Settlement Bank Accounts Added</p>
                            <p class="text-xs text-gray-500 mt-1">The vendor has not configured any direct wire bank account or mobile wallet yet.</p>
                        </div>
                    </div>

                    <!-- KYC & VERIFICATION DOCUMENTS -->
                    <div class="card p-6">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-2"
                            :style="{ borderColor: 'var(--border-light)' }">
                            <div>
                                <h3 class="font-bold text-base flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
                                    <DocumentCheckIcon class="w-5 h-5 text-blue-600" />
                                    KYC Verification Documents
                                </h3>
                                <p class="text-xs text-gray-500 mt-0.5">
                                    Government-issued trade licenses, tax identification, and personal verification files.
                                </p>
                            </div>
                            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                                {{ vendor.documents?.length || 0 }} Document(s)
                            </span>
                        </div>

                        <!-- Documents List -->
                        <div v-if="vendor.documents && vendor.documents.length > 0" class="divide-y divide-gray-100 mt-3">
                            <div v-for="doc in vendor.documents" :key="doc.uuid"
                                class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div class="flex items-start gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <DocumentTextIcon class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h4 class="font-bold text-sm text-gray-900">{{ formatDocType(doc.type) }}</h4>
                                            <StatusBadge :value="doc.status" />
                                        </div>
                                        <p class="text-xs text-gray-500 mt-0.5">
                                            Document Ref / Number: <strong class="font-mono text-gray-700">{{ doc.document_number || 'N/A' }}</strong>
                                        </p>
                                        <p v-if="doc.verified_at" class="text-[11px] text-emerald-600 mt-0.5 font-medium">
                                            Verified on {{ formatDate(doc.verified_at) }}
                                        </p>
                                        <p v-if="doc.rejection_reason" class="text-[11px] text-rose-600 mt-0.5 font-medium">
                                            Rejected: {{ doc.rejection_reason }}
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    <a v-if="doc.document_url" :href="doc.document_url" target="_blank"
                                        class="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition inline-flex items-center gap-1">
                                        View File <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                                    </a>
                                    <template v-if="doc.status === 'pending'">
                                        <button @click="verifyDocument(doc)"
                                            class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs">
                                            <CheckIcon class="w-3.5 h-3.5" /> Verify
                                        </button>
                                        <button @click="openDocRejectModal(doc)"
                                            class="px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center gap-1">
                                            <XMarkIcon class="w-3.5 h-3.5" /> Reject
                                        </button>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-else class="p-8 text-center text-sm rounded-xl border border-dashed border-gray-300 mt-4 bg-gray-50">
                            <DocumentCheckIcon class="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p class="font-semibold text-gray-700">No KYC Documents Uploaded</p>
                            <p class="text-xs text-gray-500 mt-1">Vendor has not uploaded Trade License or National ID attachments yet.</p>
                        </div>
                    </div>

                    <!-- Products Catalog -->
                    <div class="card overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b"
                            :style="{ borderColor: 'var(--border-light)' }">
                            <h3 class="font-bold text-sm flex items-center gap-1.5" :style="{ color: 'var(--text-primary)' }">
                                <ShoppingBagIcon class="w-4 h-4 text-emerald-600" />
                                Store Products ({{ vendor.products?.length || 0 }})
                            </h3>
                            <span class="text-xs text-gray-500">Showing top {{ Math.min(vendor.products?.length || 0, 5) }}</span>
                        </div>
                        <div v-if="vendor.products?.length" class="divide-y divide-gray-100">
                            <div v-for="p in vendor.products.slice(0, 5)" :key="p.id"
                                class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition cursor-pointer"
                                @click="$router.push(`/products/${p.id}`)">
                                <div class="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                    <img v-if="p.thumbnail || p.image" :src="p.thumbnail || p.image" :alt="p.name"
                                        class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                                        No img
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-semibold truncate text-gray-800">{{ p.name }}</p>
                                    <div class="flex items-center gap-2 text-xs text-gray-500">
                                        <span>৳{{ Number(p.price || 0).toLocaleString() }}</span>
                                        <span>•</span>
                                        <span>{{ p.total_sold || 0 }} sold</span>
                                    </div>
                                </div>
                                <span class="text-xs font-semibold" :class="p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'">
                                    {{ p.stock > 0 ? `${p.stock} in stock` : 'Out of stock' }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="p-8 text-center text-sm text-gray-400">
                            <ShoppingBagIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No products listed yet
                        </div>
                    </div>

                    <!-- Recent Orders -->
                    <div class="card overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b"
                            :style="{ borderColor: 'var(--border-light)' }">
                            <h3 class="font-bold text-sm flex items-center gap-1.5" :style="{ color: 'var(--text-primary)' }">
                                <ClipboardDocumentListIcon class="w-4 h-4 text-blue-600" />
                                Recent Orders ({{ vendor.orders?.length || 0 }})
                            </h3>
                            <span class="text-xs text-gray-500">Latest 5 orders</span>
                        </div>
                        <table v-if="vendor.orders?.length" class="w-full">
                            <thead>
                                <tr>
                                    <th class="table-header">Order</th>
                                    <th class="table-header">Status</th>
                                    <th class="table-header">Items</th>
                                    <th class="table-header text-right">Total</th>
                                    <th class="table-header text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in vendor.orders.slice(0, 5)" :key="order.id"
                                    class="table-row cursor-pointer"
                                    @click="$router.push(`/orders/${order.id}`)">
                                    <td class="table-cell">
                                        <p class="font-semibold text-sm text-gray-800">#{{ order.order_number }}</p>
                                    </td>
                                    <td class="table-cell">
                                        <StatusBadge :value="order.status" />
                                    </td>
                                    <td class="table-cell text-sm text-gray-600">
                                        {{ order.items_count || order.total_items || '-' }}
                                    </td>
                                    <td class="table-cell text-right font-bold text-sm text-emerald-700">
                                        ৳{{ Number(order.total_amount || 0).toLocaleString() }}
                                    </td>
                                    <td class="table-cell text-right text-xs text-gray-500">
                                        {{ formatDate(order.created_at) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-else class="p-8 text-center text-sm text-gray-400">
                            <ClipboardDocumentListIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No orders placed yet
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Reject/Suspend Reason Modal -->
        <Teleport to="body">
            <div v-if="reasonModal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeReasonModal" />
                <div class="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
                                <NoSymbolIcon v-if="reasonModal.action === 'suspend'" class="w-5 h-5" />
                                <XMarkIcon v-else class="w-5 h-5" />
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900">
                                    {{ reasonModal.action === 'suspend' ? 'Suspend Vendor' : 'Reject Application' }}
                                </h3>
                                <p class="text-xs text-gray-500">
                                    Please provide a reason to notify the merchant.
                                </p>
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="submitReasonAction" class="p-6 space-y-4">
                        <div>
                            <label class="label mb-1.5 block text-xs font-bold text-gray-700">Reason for {{ reasonModal.action }}</label>
                            <textarea
                                v-model="reasonModal.reason"
                                rows="4"
                                required
                                placeholder="Explain why the application is being rejected or suspended..."
                                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-xs outline-none focus:border-emerald-600 text-gray-800"
                            ></textarea>
                        </div>
                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button type="button" @click="closeReasonModal" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" :disabled="reasonModal.submitting" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition">
                                {{ reasonModal.submitting ? 'Processing...' : 'Confirm Action' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Document Reject Modal -->
        <Teleport to="body">
            <div v-if="docRejectModal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDocRejectModal" />
                <div class="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
                                <XMarkIcon class="w-5 h-5" />
                            </div>
                            <div>
                                <h3 class="text-sm font-bold text-gray-900">Reject KYC Document</h3>
                                <p class="text-xs text-gray-500">Explain why this document is invalid or rejected.</p>
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="submitDocReject" class="p-6 space-y-4">
                        <div>
                            <label class="label mb-1.5 block text-xs font-bold text-gray-700">Rejection Feedback</label>
                            <textarea
                                v-model="docRejectModal.reason"
                                rows="3"
                                required
                                placeholder="e.g. Expired license or blurry image, please re-upload a clear copy..."
                                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-xs outline-none focus:border-emerald-600 text-gray-800"
                            ></textarea>
                        </div>
                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button type="button" @click="closeDocRejectModal" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" :disabled="docRejectModal.submitting" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition">
                                {{ docRejectModal.submitting ? 'Rejecting...' : 'Reject Document' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>

        <!-- Edit Commission Modal -->
        <Teleport to="body">
            <div v-if="commissionModal.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="commissionModal.show = false" />
                <div class="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
                                <ScaleIcon class="w-4 h-4" />
                            </div>
                            <h3 class="text-sm font-bold text-gray-900">Edit Vendor Commission</h3>
                        </div>
                        <button @click="commissionModal.show = false" class="text-gray-400 hover:text-gray-600">
                            <XMarkIcon class="w-5 h-5" />
                        </button>
                    </div>
                    <form @submit.prevent="submitCommission" class="p-6 space-y-4">
                        <div>
                            <label class="label mb-1.5 block text-xs font-bold text-gray-700">Commission Type</label>
                            <SelectBox
                                v-model="commissionModal.type"
                                :options="[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed (৳)' }]"
                                size="sm"
                                full-width
                            />
                        </div>
                        <div>
                            <label class="label mb-1.5 block text-xs font-bold text-gray-700">Commission Rate *</label>
                            <input
                                v-model.number="commissionModal.rate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-600"
                            />
                        </div>
                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button type="button" @click="commissionModal.show = false" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" :disabled="commissionModal.submitting" class="btn-primary text-xs px-4 py-2">
                                {{ commissionModal.submitting ? 'Saving...' : 'Save Commission' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import BreadcrumbHeader from '@ecom/ui/components/BreadcrumbHeader.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { vendorApi } from '@/api/vendor'
import defaultVendorBanner from '@/assets/default-vendor-banner.jpg'
import {
    BuildingStorefrontIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CreditCardIcon,
    BanknotesIcon,
    DocumentTextIcon,
    DocumentCheckIcon,
    IdentificationIcon,
    GlobeAltIcon,
    BuildingOfficeIcon,
    UserIcon,
    StarIcon,
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    NoSymbolIcon,
    XMarkIcon,
    CheckIcon,
    ArrowTopRightOnSquareIcon,
    ArrowLeftIcon,
    ScaleIcon,
    CurrencyDollarIcon,
    ArrowDownTrayIcon,
    DevicePhoneMobileIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()
const vendor = ref(null)
const loading = ref(true)
const newStatus = ref('')

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'rejected', label: 'Rejected' },
]

const breadcrumbItems = computed(() => [
  { label: 'Vendors', to: '/vendors', icon: BuildingStorefrontIcon },
  { label: vendor.value?.shop_name || vendor.value?.name || 'Vendor Details' }
])

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDocType(type) {
    if (!type) return 'Document'
    const map = {
        trade_license: 'Trade License',
        nid: 'National ID (NID)',
        tin: 'Tax Identification (TIN)',
        passport: 'Passport',
        bank_statement: 'Bank Statement / Cheque',
    }
    return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const reasonModal = reactive({
    show: false,
    action: 'reject', // 'reject' or 'suspend'
    reason: '',
    submitting: false,
})

function closeReasonModal() {
    reasonModal.show = false
    reasonModal.reason = ''
    reasonModal.submitting = false
    if (vendor.value) {
        newStatus.value = vendor.value.status
    }
}

function openRejectModal() {
    reasonModal.action = 'reject'
    reasonModal.reason = ''
    reasonModal.show = true
}

async function approveVendor() {
    try {
        await vendorApi.approve(route.params.id)
        toast.success('Vendor approved and activated successfully')
        if (vendor.value) {
            vendor.value.status = 'active'
            vendor.value.is_active = true
            vendor.value.is_pending = false
            newStatus.value = 'active'
        }
    } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to approve vendor')
    }
}

async function makePendingVendor() {
    try {
        await vendorApi.makePending(route.params.id)
        toast.success('Vendor marked as pending review')
        if (vendor.value) {
            vendor.value.status = 'pending'
            vendor.value.is_pending = true
            vendor.value.is_active = false
            newStatus.value = 'pending'
        }
    } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to update vendor status')
    }
}

async function submitReasonAction() {
    if (!reasonModal.reason.trim()) return
    reasonModal.submitting = true
    try {
        if (reasonModal.action === 'suspend') {
            await vendorApi.suspend(route.params.id, reasonModal.reason)
            toast.success('Vendor suspended successfully')
            if (vendor.value) {
                vendor.value.status = 'suspended'
                vendor.value.is_active = false
                vendor.value.rejection_reason = reasonModal.reason
            }
        } else {
            await vendorApi.reject(route.params.id, reasonModal.reason)
            toast.success('Vendor application rejected')
            if (vendor.value) {
                vendor.value.status = 'rejected'
                vendor.value.is_active = false
                vendor.value.is_pending = false
                vendor.value.rejection_reason = reasonModal.reason
            }
        }
        if (vendor.value) {
            newStatus.value = vendor.value.status
        }
        reasonModal.show = false
    } catch (e) {
        const msg = e.response?.data?.message || `Failed to ${reasonModal.action} vendor`
        toast.error(msg)
    } finally {
        reasonModal.submitting = false
    }
}

async function updateStatus() {
    const status = newStatus.value
    if (!vendor.value || status === vendor.value.status) return

    if (status === 'active') {
        await approveVendor()
    } else if (status === 'rejected') {
        openRejectModal()
    } else if (status === 'suspended') {
        reasonModal.action = 'suspend'
        reasonModal.reason = ''
        reasonModal.show = true
    } else if (status === 'pending') {
        await makePendingVendor()
    }
}

// Document Verification Logic
const docRejectModal = reactive({
    show: false,
    document: null,
    reason: '',
    submitting: false,
})

function openDocRejectModal(doc) {
    docRejectModal.document = doc
    docRejectModal.reason = ''
    docRejectModal.show = true
}

function closeDocRejectModal() {
    docRejectModal.show = false
    docRejectModal.document = null
    docRejectModal.reason = ''
    docRejectModal.submitting = false
}

async function verifyDocument(doc) {
    try {
        await vendorApi.verifyDocument(doc.uuid || doc.id)
        toast.success(`${formatDocType(doc.type)} verified successfully`)
        doc.status = 'verified'
        doc.verified_at = new Date().toISOString()
    } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to verify document')
    }
}

async function submitDocReject() {
    if (!docRejectModal.reason.trim() || !docRejectModal.document) return
    docRejectModal.submitting = true
    try {
        const doc = docRejectModal.document
        await vendorApi.rejectDocument(doc.uuid || doc.id, docRejectModal.reason)
        toast.success(`${formatDocType(doc.type)} rejected`)
        doc.status = 'rejected'
        doc.rejection_reason = docRejectModal.reason
        closeDocRejectModal()
    } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to reject document')
    } finally {
        docRejectModal.submitting = false
    }
}

const commissionModal = reactive({
    show: false,
    rate: 10,
    type: 'percentage',
    submitting: false,
})

function openCommissionModal() {
    commissionModal.rate = Number(vendor.value?.commission_rate ?? 10)
    commissionModal.type = vendor.value?.commission_type || 'percentage'
    commissionModal.show = true
}

async function submitCommission() {
    commissionModal.submitting = true
    try {
        await vendorApi.updateCommission(route.params.id, {
            commission_rate: commissionModal.rate,
            commission_type: commissionModal.type,
        })
        if (vendor.value) {
            vendor.value.commission_rate = commissionModal.rate
            vendor.value.commission_type = commissionModal.type
        }
        toast.success('Commission rate updated successfully')
        commissionModal.show = false
    } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to update commission')
    } finally {
        commissionModal.submitting = false
    }
}

async function fetchVendor() {
    try {
        loading.value = true
        const res = await vendorApi.show(route.params.id)
        vendor.value = res.data.data
        newStatus.value = vendor.value.status
    } catch (err) {
        console.error('Vendor details error:', err)
        toast.error('Failed to load vendor details')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchVendor()
})
</script>
