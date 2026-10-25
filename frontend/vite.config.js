
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

      include: ["src/services/**/*.js"],

      exclude: [
        "src/**/*.test.js",
        "src/**/*.spec.js",
      ],
    },
  },
});
