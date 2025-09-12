import {
  defineConfig
} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7676,
    host: true, // biar bisa diakses dari browser/device lain
  },
});
