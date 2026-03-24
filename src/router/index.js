import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: { guest: true },
  },

  {
    path: "/",
    component: () => import("@/components/layout/AdminLayout.vue"),
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

      // Reports
      {
        path: "reports",
        name: "reports",
        component: () => import("@/pages/reports/ReportsPage.vue"),
      },

      // Settings
      {
        path: "settings",
        name: "settings",
        component: () => import("@/pages/settings/SettingsPage.vue"),
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
