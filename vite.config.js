import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@ecom/ui": resolve(__dirname, "src/ecom-ui"),
    },
    dedupe: ["@heroicons/vue", "lucide-vue-next", "vue", "vue-toastification", "date-fns"],
  },
  server: {
    port: 3001,
    proxy: { "/api": { target: "https://multi_functional_ecommerce_and_affiliate_platform_api.test", changeOrigin: true } },
  },
});
