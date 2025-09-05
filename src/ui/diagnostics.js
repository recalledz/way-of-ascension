import { configReport } from "../config.js";
import { debugFeatureVisibility } from "../features/index.js";

export function mountDiagnostics(state) {
  const report = configReport();
  const hud = document.createElement("div");
  hud.style.position = "fixed";
  hud.style.bottom = "4px";
  hud.style.right = "4px";
  hud.style.width = "10px";
  hud.style.height = "10px";
  hud.style.borderRadius = "50%";
  hud.style.background = report.isProd ? "red" : "green";
  hud.style.zIndex = "9999";
  hud.style.cursor = "pointer";
  hud.title = "Diagnostics";
  document.body.appendChild(hud);

  function open() {
    const report = configReport();
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.color = "#fff";
    overlay.style.zIndex = "10000";
    overlay.style.overflow = "auto";

    const close = document.createElement("button");
    close.textContent = "Close";
    close.style.position = "absolute";
    close.style.top = "10px";
    close.style.right = "10px";
    close.onclick = () => overlay.remove();
    overlay.appendChild(close);

    const container = document.createElement("div");
    container.style.padding = "20px";
    overlay.appendChild(container);

    const summary = document.createElement("pre");
    summary.textContent = `mode: ${report.mode}\nprovider: ${report.envProvider}\nbundler: ${report.bundlerGuess}`;
    container.appendChild(summary);

    if (report.warnings.length) {
      const warn = document.createElement("div");
      warn.style.color = "yellow";
      warn.textContent = "Warnings:\n" + report.warnings.join("\n");
      container.appendChild(warn);
    }

    const table1 = document.createElement("table");
    table1.style.marginTop = "10px";
    table1.border = "1";
    const h1 = table1.insertRow();
    ["flag", "rawValue", "parsedValue", "source"].forEach((h) => {
      const th = h1.insertCell();
      th.textContent = h;
    });
    for (const [k, v] of Object.entries(report.flags)) {
      const row = table1.insertRow();
      row.insertCell().textContent = k;
      row.insertCell().textContent = String(v.rawValue ?? "");
      row.insertCell().textContent = String(v.parsedValue);
      row.insertCell().textContent = v.source;
    }
    container.appendChild(table1);

    const vis = debugFeatureVisibility(state);
    const table2 = document.createElement("table");
    table2.style.marginTop = "20px";
    table2.border = "1";
    const h2 = table2.insertRow();
    ["featureKey", "flag", "unlock", "visible", "reason"].forEach((h) => {
      const th = h2.insertCell();
      th.textContent = h;
    });
    for (const [k, v] of Object.entries(vis)) {
      const row = table2.insertRow();
      row.insertCell().textContent = k;
      row.insertCell().textContent = String(v.flagAllowed);
      row.insertCell().textContent = String(v.unlockAllowed);
      row.insertCell().textContent = String(v.visible);
      row.insertCell().textContent = v.reason;
    }
    container.appendChild(table2);

    document.body.appendChild(overlay);
  }

  hud.addEventListener("click", open);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      open();
    }
  });
}
