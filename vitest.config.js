import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["frontend/src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["frontend/src/services/**/*.js"],
      exclude: [
        "frontend/src/**/*.test.js",
        "frontend/src/**/*.spec.js"
      ]
    }
  }
});