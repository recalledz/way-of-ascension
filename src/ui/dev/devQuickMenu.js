// src/ui/dev/devQuickMenu.js
// UI-only mini dev menu: no gameplay imports. Uses window.__* hooks if present,
// and emits DEV:SET_SEED if the event bus is available.

let mounted = false;

function el(tag, props = {}, children = []) {
  const n = document.createElement(tag);
  Object.assign(n, props);
  for (const c of children) n.append(typeof c === "string" ? document.createTextNode(c) : c);
  return n;
}

function callIf(fnName, ...args) {
  const fn = window[fnName];
  if (typeof fn === "function") return fn(...args);
}

function emitDev(type, payload) {
  try {
    // optional event bus: src/shared/events.js exports global 'emit' on window?
    if (typeof window.emit === "function") return window.emit(type, payload);
    // fallback: dispatch a DOM event others can listen for
    window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  } catch {}
}

export function mountDevQuickMenu() {
  if (mounted) return; mounted = true;

  // Top-right toggle button
  const btn = el("button", { id: "devQuickBtn", textContent: "Dev" });
  Object.assign(btn.style, {
    position: "fixed", top: "8px", right: "8px", zIndex: 9999,
    padding: "6px 10px", borderRadius: "8px",
    border: "1px solid #2b3a55", background: "#0b0f14", color: "#e8f0ff",
    cursor: "pointer"
  });

  // Panel
  const panel = el("div", { id: "devQuickPanel" });
  Object.assign(panel.style, {
    position: "fixed", top: "42px", right: "8px", zIndex: 9999,
    minWidth: "280px", padding: "10px 12px",
    borderRadius: "12px", border: "1px solid #2b3a55",
    background: "#0b0f14cc", color: "#e8f0ff", backdropFilter: "blur(2px)",
    display: "none"
  });

  const title = el("div", { textContent: "DEV MENU" });
  title.style.cssText = "font:600 12px ui-monospace,monospace; margin-bottom:8px; opacity:.9;";
  panel.appendChild(title);

  const row = (label, controlEl) => {
    const r = el("div"); r.style.cssText = "display:flex; align-items:center; gap:8px; margin:6px 0;";
    const l = el("div", { textContent: label }); l.style.cssText = "flex:0 0 96px; opacity:.8;";
    r.append(l, controlEl); return r;
  };
  const smallBtn = (txt, on) => {
    const b = el("button", { textContent: txt });
    Object.assign(b.style, { padding: "4px 8px", borderRadius: "6px",
      border: "1px solid #3a4c77", background: "#142034", color: "#cfe", cursor: "pointer" });
    b.onclick = on; return b;
  };

  // Loop controls (use window.__ if available; disable if missing)
  const loopWrap = el("div");
  loopWrap.style.display = "flex"; loopWrap.style.gap = "6px";
  const pauseB  = smallBtn("Pause",  () => callIf("__PAUSE"));
  const resumeB = smallBtn("Resume", () => callIf("__RESUME"));
  const stepB   = smallBtn("Step",   () => callIf("__STEP"));
  loopWrap.append(pauseB, resumeB, stepB);
  panel.appendChild(row("Loop", loopWrap));

  // Speed (only if getters/setters present)
  const speedWrap = el("div"); speedWrap.style.display = "flex"; speedWrap.style.gap = "8px"; speedWrap.style.alignItems = "center";
  const speedInput = el("input"); speedInput.type = "range"; speedInput.min = "0.1"; speedInput.max = "4"; speedInput.step = "0.1";
  const getSpeed = () => Number(callIf("__GET_SPEED") ?? 1);
  const setSpeed = (v) => callIf("__SET_SPEED", v);
  speedInput.value = String(getSpeed());
  const speedVal = el("span", { textContent: getSpeed().toFixed(1) + "x" });
  speedInput.oninput = () => { const v = Number(speedInput.value) || 1; setSpeed(v); speedVal.textContent = v.toFixed(1) + "x"; };
  if (typeof window.__GET_SPEED === "function" && typeof window.__SET_SPEED === "function") {
    speedWrap.append(speedInput, speedVal);
    panel.appendChild(row("Speed", speedWrap));
  }

  // RNG seed (emit event first; if no bus, try __SET_SEED)
  const seedWrap = el("div"); seedWrap.style.display = "flex"; seedWrap.style.gap = "6px";
  const seedIn = el("input"); seedIn.placeholder = "seed (e.g. 42)";
  Object.assign(seedIn.style, { width: "120px", padding: "4px 6px",
    borderRadius: "6px", border: "1px solid #2b3a55", background: "#0b1422", color: "#e8f0ff" });
  const seedBtn = smallBtn("Set", () => {
    const seed = seedIn.value || "1234";
    emitDev("DEV:SET_SEED", { seed });
    callIf("__SET_SEED", seed);
  });
  seedWrap.append(seedIn, seedBtn);
  panel.appendChild(row("RNG", seedWrap));

  // Misc tools
  const erudaBtn = smallBtn("Console", () => {
    if (!window.eruda) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/eruda";
      s.onload = () => window.eruda && window.eruda.init();
      document.head.appendChild(s);
    } else {
      try { window.eruda.destroy(); } catch {}
    }
  });
  panel.appendChild(row("Tools", erudaBtn));

  // Consolidate existing dev panels if present (non-breaking)
  // Move any #debugPanel/#debugConsole into our panel
  setTimeout(() => {
    const existing = document.getElementById("debugPanel") || document.getElementById("debugConsole");
    if (existing && !panel.contains(existing)) {
      existing.style.display = "block";
      existing.style.position = "static";
      existing.style.bottom = existing.style.left = "";
      const hdr = el("div", { textContent: "Existing Debug" });
      hdr.style.cssText = "margin-top:8px; font:600 12px ui-monospace,monospace; opacity:.9;";
      const wrap = el("div");
      wrap.style.cssText = "max-height:180px; overflow:auto; border-top:1px solid #2b3a55; margin-top:6px; padding-top:6px;";
      wrap.appendChild(existing);
      panel.append(hdr, wrap);
    }
  }, 0);

  // Toggle
  btn.onclick = () => { panel.style.display = panel.style.display === "none" ? "block" : "none"; };

  document.body.append(btn, panel);
}

