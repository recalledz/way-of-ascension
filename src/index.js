import { initApp } from "./ui/app.js";
import { configReport } from "./config.js";

const report = configReport();
if (report.isProd) {
  const active = Object.entries(report.flags)
    .filter(([k, v]) => k.startsWith('FEATURE_') && v.parsedValue)
    .map(([k]) => k)
    .join(', ') || 'none';
  console.log(`[Way of Ascension] Flags active (prod): ${active}`);
} else {
  console.groupCollapsed('[Way of Ascension] Flag Report');
  console.table(report.flags);
  console.groupEnd();
}

initApp();
