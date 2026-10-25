
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
    environment: "node",

    include: [
      "src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],

    coverage: {
      provider: "v8",

      reporter: ["text", "html", "lcov"],

      reportsDirectory: "../coverage",

      // Hanya menghitung coverage file service.
      include: ["src/services/**/*.{js,jsx,ts,tsx}"],

      // File pengujian tidak dihitung sebagai kode aplikasi.
      exclude: [
        "src/**/*.test.js",
        "src/**/*.test.jsx",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.js",
        "src/**/*.spec.jsx",
        "src/**/*.spec.ts",
        "src/**/*.spec.tsx",
      ],
    },
  },
});
