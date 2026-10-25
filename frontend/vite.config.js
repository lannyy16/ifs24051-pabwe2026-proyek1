
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },

  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],

      // Mengukur coverage pada service yang diuji
      include: ["src/services/**/*.js"],

      exclude: [
        "src/**/*.test.js",
        "src/**/*.spec.js"
      ]
    }
  }
});
