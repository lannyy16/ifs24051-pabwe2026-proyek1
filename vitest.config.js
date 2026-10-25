
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target:
          "https://ifs24051-pabwe2026-proyek1-backend.vercel.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },

  test: {
    // Menjalankan test menggunakan environment Node.js.
    environment: "node",

    // Lokasi file pengujian yang benar.
    include: [
      "frontend/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],

    // Konfigurasi coverage.
    coverage: {
      provider: "v8",

      reporter: ["text", "html", "lcov"],

      // Hasil coverage disimpan di folder coverage root.
      reportsDirectory: "./coverage",

      // Hanya file service aplikasi yang dihitung.
      include: [
        "frontend/src/services/**/*.{js,jsx,ts,tsx}",
      ],

      // File test tidak ikut dihitung sebagai kode aplikasi.
      exclude: [
        "frontend/src/**/*.test.js",
        "frontend/src/**/*.test.jsx",
        "frontend/src/**/*.test.ts",
        "frontend/src/**/*.test.tsx",
        "frontend/src/**/*.spec.js",
        "frontend/src/**/*.spec.jsx",
        "frontend/src/**/*.spec.ts",
        "frontend/src/**/*.spec.tsx",
      ],
    },
  },
});
