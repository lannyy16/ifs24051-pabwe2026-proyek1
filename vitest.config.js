
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const rootReact = fileURLToPath(
  new URL("./node_modules/react", import.meta.url)
);

const rootReactDOM = fileURLToPath(
  new URL("./node_modules/react-dom", import.meta.url)
);

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: /^react$/,
        replacement: rootReact,
      },
      {
        find: /^react\/(.+)$/,
        replacement: `${rootReact}/$1`,
      },
      {
        find: /^react-dom$/,
        replacement: rootReactDOM,
      },
      {
        find: /^react-dom\/(.+)$/,
        replacement: `${rootReactDOM}/$1`,
      },
    ],
  },

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
    environment: "jsdom",

    include: [
      "frontend/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",

      include: [
        "frontend/src/services/**/*.{js,jsx,ts,tsx}",
      ],

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
