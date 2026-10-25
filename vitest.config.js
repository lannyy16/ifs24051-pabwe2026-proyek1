import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Paksa satu salinan React (milik root) agar tidak terjadi dua instance
// React ketika frontend/ juga memiliki node_modules sendiri.
const rootReact = fileURLToPath(new URL("./node_modules/react", import.meta.url));
const rootReactDOM = fileURLToPath(
  new URL("./node_modules/react-dom", import.meta.url),
);

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: /^react$/, replacement: rootReact },
      { find: /^react\/(.+)$/, replacement: `${rootReact}/$1` },
      { find: /^react-dom$/, replacement: rootReactDOM },
      { find: /^react-dom\/(.+)$/, replacement: `${rootReactDOM}/$1` },
    ],
  },

  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    include: ["frontend/src/**/*.{test,spec}.{js,jsx,ts,tsx}"],

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["frontend/src/**/*.{js,jsx}"],
      exclude: ["frontend/src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    },
  },
});
