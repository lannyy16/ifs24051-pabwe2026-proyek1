import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Konfigurasi build & dev server frontend.
// Pengujian dikonfigurasi di vitest.config.js pada root repository.
export default defineConfig({
  plugins: [react()],
});
