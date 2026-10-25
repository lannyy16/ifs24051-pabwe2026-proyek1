
import { defineConfig } from "vitest/config";
import fs from "node:fs";
import path from "node:path";

const reportPath = path.resolve("coverage/lcov.info");

process.on("exit", () => {
  if (!fs.existsSync(reportPath)) {
    return;
  }

  let report = fs.readFileSync(reportPath, "utf8");

  // Sesuaikan jalur frontend/src menjadi root src.
  report = report.replace(
    /^SF:frontend[\\/]+src[\\/]+/gm,
    "SF:src/"
  );

  // Seragamkan pemisah jalur menjadi slash (/).
  report = report.replace(/^SF:(.*)$/gm, (_, filePath) => {
    return `SF:${filePath.replace(/\\/g, "/")}`;
  });

  fs.writeFileSync(reportPath, report, "utf8");

  console.log("Jalur coverage LCOV telah disesuaikan.");
});

export default defineConfig({
  test: {
    include: [
      "frontend/src/**/*.{test,spec}.{js,jsx,ts,tsx}"
    ],

    environment: "node",

    coverage: {
      provider: "v8",

      reporter: ["text", "html", "lcov"],

      include: [
        "frontend/src/services/**/*.js"
      ],

      exclude: [
        "frontend/src/**/*.test.js",
        "frontend/src/**/*.spec.js"
      ],

      reportsDirectory: "coverage"
    }
  }
});
