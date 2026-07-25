import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Layout (keep eager — needed immediately)
import AdminLayout from "@/components/layout/AdminLayout.vue";

// Auth (keep eager — needed immediately for login page)
import LoginPage from "@/pages/LoginPage.vue";

const routes = [
    {
        path: "/login",
        name: "login",
        component: LoginPage,
        meta: { guest: true },
    },

    {
        path: "/",
        component: AdminLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "",
                name: "dashboard",
                component: () => import("@/pages/DashboardPage.vue"),
            },

            // Products
            {
                path: "products",
                name: "products",
                component: () => import("@/pages/products/ProductsPage.vue"),
            },
            {
                path: "products/create",
                name: "products-create",
                component: () => import("@/pages/products/ProductFormPage.vue"),
            },
            {
                path: "products/:id/edit",
                name: "products-edit",
                component: () => import("@/pages/products/ProductFormPage.vue"),
            },
            {
                path: '/products/:id',
                name: 'product-detail',
                component: () => import("@/pages/products/ProductDetail.vue"),
                meta: { requiresAuth: true }
            },

            // Orders
            {
                path: "orders",
                name: "orders",
                component: () => import("@/pages/orders/OrdersPage.vue"),
            },
            {
                path: "orders/:id",
                name: "orders-detail",
                component: () => import("@/pages/orders/OrderDetailPage.vue"),
            },
            {
                path: "transactions",
                name: "transactions",
                component: () => import("@/pages/orders/TransactionsPage.vue"),
            },
            {
                path: "transactions/:id",
                name: "transactions-detail",
                component: () => import("@/pages/orders/TransactionDetailPage.vue"),
            },

            // Users
            {
                path: "users",
                name: "users",
                component: () => import("@/pages/users/UsersPage.vue"),
            },
            {
                path: "users/:id",
                name: "users-detail",
                component: () => import("@/pages/users/UserDetailPage.vue"),
            },
            {
                path: "admins",
                name: "admins",
                component: () => import("@/pages/users/AdminsPage.vue"),
            },
            {
                path: "admins/:id",
                name: "admins-detail",
                component: () => import("@/pages/users/AdminDetailPage.vue"),
            },
            {
                path: "roles",
                name: "roles",
                component: () => import("@/pages/users/RolesPage.vue"),
            },
            {
                path: "roles/:id",
                name: "roles-detail",
                component: () => import("@/pages/users/RoleDetailPage.vue"),
            },
            {
                path: "permissions",
                name: "permissions",
                component: () => import("@/pages/users/PermissionsPage.vue"),
            },

            // Categories
            {
                path: "categories",
                name: "categories",
                component: () => import("@/pages/categories/CategoriesPage.vue"),
            },

            // Brands
            {
                path: "brands",
                name: "brands",
                component: () => import("@/pages/brands/BrandsPage.vue"),
            },

            // Vendors / Shops
            {
                path: "vendors",
                name: "vendors",
                component: () => import("@/pages/vendors/VendorsPage.vue"),
            },
            {
                path: "vendors/pending",
                name: "vendors-pending",
                component: () => import("@/pages/vendors/VendorsPage.vue"),
            },
            {
                path: "vendors/:id",
                name: "vendors-detail",
                component: () => import("@/pages/vendors/VendorDetailPage.vue"),
            },
            {
                path: "shops",
                name: "shops",
                component: () => import("@/pages/vendors/ShopsPage.vue"),
            },
            {
                path: "shops/pending",
                name: "shops-pending",
                component: () => import("@/pages/vendors/ShopsPage.vue"),
            },
            {
                path: "shops/:id",
                name: "shops-detail",
                component: () => import("@/pages/vendors/ShopDetailPage.vue"),
            },

            // Coupons
            {
                path: "coupons",
                name: "coupons",
                component: () => import("@/pages/coupons/CouponsPage.vue"),
            },

            // Reviews
            {
                path: "reviews",
                name: "reviews",
                component: () => import("@/pages/reviews/ReviewsPage.vue"),
            },

            // Marketing
            {
                path: "campaigns",
                name: "campaigns",
                component: () => import("@/pages/marketing/CampaignsPage.vue"),
            },
            {
                path: "campaigns/:id",
                name: "campaigns-detail",
                component: () => import("@/pages/marketing/CampaignDetailPage.vue"),
            },

            // Affiliate
            {
                path: "affiliate",
                name: "affiliate",
                component: () => import("@/pages/affiliate/AffiliatePage.vue"),
            },

            // CMS
            {
                path: "cms",
                name: "cms",
                component: () => import("@/pages/cms/CmsPage.vue"),
            },

            // Banners
            {
                path: "banners",
                name: "banners",
                component: () => import("@/pages/banners/BannersPage.vue"),
            },

            // Invoices
            {
                path: "invoices/sales",
                name: "invoices.sales",
                component: () => import("@/pages/invoices/SaleInvoicesPage.vue"),
            },
            {
                path: "invoices/sales/create",
                name: "invoices.sales.create",
                component: () => import("@/pages/invoices/SaleInvoiceCreatePage.vue"),
            },
            {
                path: "invoices/sales/:id/edit",
                name: "invoices.sales.edit",
                component: () => import("@/pages/invoices/SaleInvoiceCreatePage.vue"),
            },
            {
                path: "invoices/sales/:id",
                name: "invoices.sales.detail",
                component: () => import("@/pages/invoices/SaleInvoiceDetailPage.vue"),
            },
            {
                path: "invoices/purchases",
                name: "invoices.purchases",
                component: () => import("@/pages/invoices/PurchaseInvoicesPage.vue"),
            },
            {
                path: "invoices/purchases/create",
                name: "invoices.purchases.create",
                component: () => import("@/pages/invoices/PurchaseInvoiceCreatePage.vue"),
            },
            {
                path: "invoices/purchases/:id/edit",
                name: "invoices.purchases.edit",
                component: () => import("@/pages/invoices/PurchaseInvoiceCreatePage.vue"),
            },
            {
                path: "invoices/purchases/:id",
                name: "invoices.purchases.detail",
                component: () => import("@/pages/invoices/PurchaseInvoiceDetailPage.vue"),
            },

            // Emails
            {
                path: "emails",
                name: "emails",
                component: () => import("@/pages/emails/EmailsPage.vue"),
            },

            // Chat
            {
                path: "chat-dashboard",
                name: "chat-dashboard",
                component: () => import("@/pages/chat/ChatDashboardPage.vue"),
            },
            {
                path: "messages",
                name: "messages",
                component: () => import("@/pages/chat/ChatPage.vue"),
            },
            {
                path: "notifications",
                name: "notifications",
                component: () => import("@/pages/chat/NotificationsPage.vue"),
            },

            // Activity Log
            {
                path: "activity-log",
                name: "activity-log",
                component: () => import("@/pages/system/ActivityLogPage.vue"),
            },

            // Reports
            {
                path: "reports",
                name: "reports",
                component: () => import("@/pages/reports/ReportsPage.vue"),
            },
            {
                path: "reports/customer",
                name: "reports.customer",
                component: () => import("@/pages/reports/CustomerReportsPage.vue"),
            },
            {
                path: "reports/product",
                name: "reports.product",
                component: () => import("@/pages/reports/ProductReportsPage.vue"),
            },
            {
                path: "reports/vendor",
                name: "reports.vendor",
                component: () => import("@/pages/reports/VendorReportsPage.vue"),
            },
            {
                path: "reports/shop",
                name: "reports.shop",
                component: () => import("@/pages/reports/ShopReportsPage.vue"),
            },
            {
                path: "reports/affiliate",
                name: "reports.affiliate",
                component: () => import("@/pages/reports/AffiliateReportsPage.vue"),
            },
            {
                path: "reports/coupon",
                name: "reports.coupon",
                component: () => import("@/pages/reports/CouponReportsPage.vue"),
            },
            {
                path: "reports/campaign",
                name: "reports.campaign",
                component: () => import("@/pages/reports/CampaignReportsPage.vue"),
            },
            {
                path: "reports/review",
                name: "reports.review",
                component: () => import("@/pages/reports/ReviewReportsPage.vue"),
            },
            {
                path: "reports/notification",
                name: "reports.notification",
                component: () => import("@/pages/reports/NotificationReportsPage.vue"),
            },
            {
                path: "reports/email",
                name: "reports.email",
                component: () => import("@/pages/reports/EmailReportsPage.vue"),
            },
            {
                path: "reports/system",
                name: "reports.system",
                component: () => import("@/pages/reports/SystemReportsPage.vue"),
            },

            // Settings
            {
                path: "settings",
                component: () => import("@/pages/settings/SettingsLayout.vue"),
                redirect: { name: "settings.general" },
                children: [
                    {
                        path: "general",
                        name: "settings.general",
                        component: () => import("@/pages/settings/GeneralSettings.vue"),
                    },
                    {
                        path: "shipping",
                        name: "settings.shipping",
                        component: () => import("@/pages/settings/ShippingSettings.vue"),
                    },
                    {
                        path: "seo",
                        name: "settings.seo",
                        component: () => import("@/pages/settings/SeoSettings.vue"),
                    },
                    {
                        path: "social",
                        name: "settings.social",
                        component: () => import("@/pages/settings/SocialSettings.vue"),
                    },
                    {
                        path: "branding",
                        name: "settings.branding",
                        component: () => import("@/pages/settings/BrandingSettings.vue"),
                    },
                    {
                        path: "mail",
                        name: "settings.mail",
                        component: () => import("@/pages/settings/MailSettings.vue"),
                    },
                    {
                        path: "reverb",
                        name: "settings.reverb",
                        component: () => import("@/pages/settings/ReverbSettings.vue"),
                    },
                    {
                        path: "payment",
                        name: "settings.payment",
                        component: () => import("@/pages/settings/PaymentSettings.vue"),
                    },
                    {
                        path: "tax",
                        name: "settings.tax",
                        component: () => import("@/pages/settings/TaxSettings.vue"),
                    },
                    {
                        path: "notifications",
                        name: "settings.notifications",
                        component: () => import("@/pages/settings/NotificationSettings.vue"),
                    },
                    {
                        path: "customers",
                        name: "settings.customers",
                        component: () => import("@/pages/settings/CustomerSettings.vue"),
                    },
                    {
                        path: "legal",
                        name: "settings.legal",
                        component: () => import("@/pages/settings/LegalSettings.vue"),
                    },
                    {
                        path: "localization",
                        name: "settings.localization",
                        component: () => import("@/pages/settings/LocalizationSettings.vue"),
                    },
                    {
                        path: "security",
                        name: "settings.security",
                        component: () => import("@/pages/settings/SecuritySettings.vue"),
                    },
                    {
                        path: "maintenance",
                        name: "settings.maintenance",
                        component: () => import("@/pages/settings/MaintenanceSettings.vue"),
                    },
                    {
                        path: "theme",
                        name: "settings.theme",
                        component: () => import("@/pages/settings/ThemeSettings.vue"),
                    },
                ],
            },
        ],
    },

    { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    if (to.meta.requiresAuth && !auth.isLoggedIn) return next("/login");
    if (to.meta.guest && auth.isLoggedIn) return next("/");

    next();
});

export default router;
