import fs from "node:fs";
import path from "node:path";

const reportPath = path.resolve("coverage/lcov.info");

if (!fs.existsSync(reportPath)) {
  console.error("File coverage/lcov.info tidak ditemukan.");
  process.exit(1);
}

let report = fs.readFileSync(reportPath, "utf8");

report = report.replace(
  /^SF:frontend[\\/]+src[\\/]+/gm,
  "SF:src/"
);

fs.writeFileSync(reportPath, report, "utf8");

console.log("Jalur coverage telah disesuaikan ke root src.");