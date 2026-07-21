import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Layout
import AdminLayout from "@/components/layout/AdminLayout.vue";

// Auth
import LoginPage from "@/pages/LoginPage.vue";

// Dashboard
import DashboardPage from "@/pages/DashboardPage.vue";

// Products
import ProductsPage from "@/pages/products/ProductsPage.vue";
import ProductFormPage from "@/pages/products/ProductFormPage.vue";
import ProductDetail from "@/pages/products/ProductDetail.vue";

// Orders
import OrdersPage from "@/pages/orders/OrdersPage.vue";
import OrderDetailPage from "@/pages/orders/OrderDetailPage.vue";
import TransactionsPage from "@/pages/orders/TransactionsPage.vue";
import TransactionDetailPage from "@/pages/orders/TransactionDetailPage.vue";

// Users
import UsersPage from "@/pages/users/UsersPage.vue";
import UserDetailPage from "@/pages/users/UserDetailPage.vue";
import AdminsPage from "@/pages/users/AdminsPage.vue";
import AdminDetailPage from "@/pages/users/AdminDetailPage.vue";
import RolesPage from "@/pages/users/RolesPage.vue";
import RoleDetailPage from "@/pages/users/RoleDetailPage.vue";
import PermissionsPage from "@/pages/users/PermissionsPage.vue";

// Categories
import CategoriesPage from "@/pages/categories/CategoriesPage.vue";

// Brands
import BrandsPage from "@/pages/brands/BrandsPage.vue";

// Vendors
import VendorsPage from "@/pages/vendors/VendorsPage.vue";
import VendorDetailPage from "@/pages/vendors/VendorDetailPage.vue";
import ShopsPage from "@/pages/vendors/ShopsPage.vue";
import ShopDetailPage from "@/pages/vendors/ShopDetailPage.vue";

// Coupons
import CouponsPage from "@/pages/coupons/CouponsPage.vue";

// Marketing
import CampaignsPage from "@/pages/marketing/CampaignsPage.vue";
import CampaignDetailPage from "@/pages/marketing/CampaignDetailPage.vue";

// Invoices
import SaleInvoicesPage from "@/pages/invoices/SaleInvoicesPage.vue";
import SaleInvoiceCreatePage from "@/pages/invoices/SaleInvoiceCreatePage.vue";
import SaleInvoiceDetailPage from "@/pages/invoices/SaleInvoiceDetailPage.vue";
import PurchaseInvoicesPage from "@/pages/invoices/PurchaseInvoicesPage.vue";
import PurchaseInvoiceCreatePage from "@/pages/invoices/PurchaseInvoiceCreatePage.vue";
import PurchaseInvoiceDetailPage from "@/pages/invoices/PurchaseInvoiceDetailPage.vue";

// Chat
import ChatPage from "@/pages/chat/ChatPage.vue";
import NotificationsPage from "@/pages/chat/NotificationsPage.vue";

// Reviews
import ReviewsPage from "@/pages/reviews/ReviewsPage.vue";

// Affiliate
import AffiliatePage from "@/pages/affiliate/AffiliatePage.vue";

// CMS
import CmsPage from "@/pages/cms/CmsPage.vue";

// Banners
import BannersPage from "@/pages/banners/BannersPage.vue";

// Emails
import EmailsPage from "@/pages/emails/EmailsPage.vue";

// Reports
import ReportsPage from "@/pages/reports/ReportsPage.vue";
import CustomerReportsPage from "@/pages/reports/CustomerReportsPage.vue";
import ProductReportsPage from "@/pages/reports/ProductReportsPage.vue";
import VendorReportsPage from "@/pages/reports/VendorReportsPage.vue";
import ShopReportsPage from "@/pages/reports/ShopReportsPage.vue";
import AffiliateReportsPage from "@/pages/reports/AffiliateReportsPage.vue";
import CouponReportsPage from "@/pages/reports/CouponReportsPage.vue";
import CampaignReportsPage from "@/pages/reports/CampaignReportsPage.vue";
import ReviewReportsPage from "@/pages/reports/ReviewReportsPage.vue";
import NotificationReportsPage from "@/pages/reports/NotificationReportsPage.vue";
import EmailReportsPage from "@/pages/reports/EmailReportsPage.vue";
import SystemReportsPage from "@/pages/reports/SystemReportsPage.vue";

// Settings
import SettingsLayout from "@/pages/settings/SettingsLayout.vue";
import GeneralSettings from "@/pages/settings/GeneralSettings.vue";
import ShippingSettings from "@/pages/settings/ShippingSettings.vue";
import SeoSettings from "@/pages/settings/SeoSettings.vue";
import SocialSettings from "@/pages/settings/SocialSettings.vue";
import BrandingSettings from "@/pages/settings/BrandingSettings.vue";
import MailSettings from "@/pages/settings/MailSettings.vue";
import ReverbSettings from "@/pages/settings/ReverbSettings.vue";
import PaymentSettings from "@/pages/settings/PaymentSettings.vue";
import TaxSettings from "@/pages/settings/TaxSettings.vue";
import NotificationSettings from "@/pages/settings/NotificationSettings.vue";
import CustomerSettings from "@/pages/settings/CustomerSettings.vue";
import LegalSettings from "@/pages/settings/LegalSettings.vue";
import LocalizationSettings from "@/pages/settings/LocalizationSettings.vue";
import SecuritySettings from "@/pages/settings/SecuritySettings.vue";
import MaintenanceSettings from "@/pages/settings/MaintenanceSettings.vue";
import ThemeSettings from "@/pages/settings/ThemeSettings.vue";

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
                component: DashboardPage,
            },

            // Products
            {
                path: "products",
                name: "products",
                component: ProductsPage,
            },
            {
                path: "products/create",
                name: "products-create",
                component: ProductFormPage,
            },
            {
                path: "products/:id/edit",
                name: "products-edit",
                component: ProductFormPage,
            },
            {
                path: '/products/:id',
                name: 'product-detail',
                component: ProductDetail,
                meta: { requiresAuth: true }
            },

            // Orders
            {
                path: "orders",
                name: "orders",
                component: OrdersPage,
            },
            {
                path: "orders/:id",
                name: "orders-detail",
                component: OrderDetailPage,
            },
            {
                path: "transactions",
                name: "transactions",
                component: TransactionsPage,
            },
            {
                path: "transactions/:id",
                name: "transactions-detail",
                component: TransactionDetailPage,
            },

            // Users
            {
                path: "users",
                name: "users",
                component: UsersPage,
            },
            {
                path: "users/:id",
                name: "users-detail",
                component: UserDetailPage,
            },
            {
                path: "admins",
                name: "admins",
                component: AdminsPage,
            },
            {
                path: "admins/:id",
                name: "admins-detail",
                component: AdminDetailPage,
            },
            {
                path: "roles",
                name: "roles",
                component: RolesPage,
            },
            {
                path: "roles/:id",
                name: "roles-detail",
                component: RoleDetailPage,
            },
            {
                path: "permissions",
                name: "permissions",
                component: PermissionsPage,
            },

            // Categories
            {
                path: "categories",
                name: "categories",
                component: CategoriesPage,
            },

            // Brands
            {
                path: "brands",
                name: "brands",
                component: BrandsPage,
            },

            // Vendors / Shops
            {
                path: "vendors",
                name: "vendors",
                component: VendorsPage,
            },
            {
                path: "vendors/pending",
                name: "vendors-pending",
                component: VendorsPage,
            },
            {
                path: "vendors/:id",
                name: "vendors-detail",
                component: VendorDetailPage,
            },
            {
                path: "shops",
                name: "shops",
                component: ShopsPage,
            },
            {
                path: "shops/pending",
                name: "shops-pending",
                component: ShopsPage,
            },
            {
                path: "shops/:id",
                name: "shops-detail",
                component: ShopDetailPage,
            },

            // Coupons
            {
                path: "coupons",
                name: "coupons",
                component: CouponsPage,
            },

            // Reviews
            {
                path: "reviews",
                name: "reviews",
                component: ReviewsPage,
            },

            // Marketing
            {
                path: "campaigns",
                name: "campaigns",
                component: CampaignsPage,
            },
            {
                path: "campaigns/:id",
                name: "campaigns-detail",
                component: CampaignDetailPage,
            },

            // Affiliate
            {
                path: "affiliate",
                name: "affiliate",
                component: AffiliatePage,
            },

            // CMS
            {
                path: "cms",
                name: "cms",
                component: CmsPage,
            },

            // Banners
            {
                path: "banners",
                name: "banners",
                component: BannersPage,
            },

            // Invoices
            {
                path: "invoices/sales",
                name: "invoices.sales",
                component: SaleInvoicesPage,
            },
            {
                path: "invoices/sales/create",
                name: "invoices.sales.create",
                component: SaleInvoiceCreatePage,
            },
            {
                path: "invoices/sales/:id/edit",
                name: "invoices.sales.edit",
                component: SaleInvoiceCreatePage,
            },
            {
                path: "invoices/sales/:id",
                name: "invoices.sales.detail",
                component: SaleInvoiceDetailPage,
            },
            {
                path: "invoices/purchases",
                name: "invoices.purchases",
                component: PurchaseInvoicesPage,
            },
            {
                path: "invoices/purchases/create",
                name: "invoices.purchases.create",
                component: PurchaseInvoiceCreatePage,
            },
            {
                path: "invoices/purchases/:id",
                name: "invoices.purchases.detail",
                component: PurchaseInvoiceDetailPage,
            },

            // Emails
            {
                path: "emails",
                name: "emails",
                component: EmailsPage,
            },

            // Chat
            {
                path: "messages",
                name: "messages",
                component: ChatPage,
            },
            {
                path: "notifications",
                name: "notifications",
                component: NotificationsPage,
            },

            // Reports
            {
                path: "reports",
                name: "reports",
                component: ReportsPage,
            },
            {
                path: "reports/customer",
                name: "reports.customer",
                component: CustomerReportsPage,
            },
            {
                path: "reports/product",
                name: "reports.product",
                component: ProductReportsPage,
            },
            {
                path: "reports/vendor",
                name: "reports.vendor",
                component: VendorReportsPage,
            },
            {
                path: "reports/shop",
                name: "reports.shop",
                component: ShopReportsPage,
            },
            {
                path: "reports/affiliate",
                name: "reports.affiliate",
                component: AffiliateReportsPage,
            },
            {
                path: "reports/coupon",
                name: "reports.coupon",
                component: CouponReportsPage,
            },
            {
                path: "reports/campaign",
                name: "reports.campaign",
                component: CampaignReportsPage,
            },
            {
                path: "reports/review",
                name: "reports.review",
                component: ReviewReportsPage,
            },
            {
                path: "reports/notification",
                name: "reports.notification",
                component: NotificationReportsPage,
            },
            {
                path: "reports/email",
                name: "reports.email",
                component: EmailReportsPage,
            },
            {
                path: "reports/system",
                name: "reports.system",
                component: SystemReportsPage,
            },

            // Settings
            {
                path: "settings",
                component: SettingsLayout,
                redirect: { name: "settings.general" },
                children: [
                    {
                        path: "general",
                        name: "settings.general",
                        component: GeneralSettings,
                    },
                    {
                        path: "shipping",
                        name: "settings.shipping",
                        component: ShippingSettings,
                    },
                    {
                        path: "seo",
                        name: "settings.seo",
                        component: SeoSettings,
                    },
                    {
                        path: "social",
                        name: "settings.social",
                        component: SocialSettings,
                    },
                    {
                        path: "branding",
                        name: "settings.branding",
                        component: BrandingSettings,
                    },
                    {
                        path: "mail",
                        name: "settings.mail",
                        component: MailSettings,
                    },
                    {
                        path: "reverb",
                        name: "settings.reverb",
                        component: ReverbSettings,
                    },
                    {
                        path: "payment",
                        name: "settings.payment",
                        component: PaymentSettings,
                    },
                    {
                        path: "tax",
                        name: "settings.tax",
                        component: TaxSettings
                    },
                    {
                        path: "notifications",
                        name: "settings.notifications",
                        component: NotificationSettings,
                    },
                    {
                        path: "customers",
                        name: "settings.customers",
                        component: CustomerSettings,
                    },
                    {
                        path: "legal",
                        name: "settings.legal",
                        component: LegalSettings
                    },
                    {
                        path: "localization",
                        name: "settings.localization",
                        component: LocalizationSettings,
                    },
                    {
                        path: "security",
                        name: "settings.security",
                        component: SecuritySettings,
                    },
                    {
                        path: "maintenance",
                        name: "settings.maintenance",
                        component: MaintenanceSettings,
                    },
                    {
                        path: "theme",
                        name: "settings.theme",
                        component: ThemeSettings,
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
