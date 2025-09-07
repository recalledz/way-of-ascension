// src/ui/dev/devQuickMenu.js
// UI-only mini dev menu. Uses window.__* hooks if present and emits events
// through the shared bus for debugging helpers.

import { emit } from '../../shared/events.js';
import { S } from '../../shared/state.js';
import { rollWeaponDropForZone } from '../../features/weaponGeneration/selectors.js';
import { rollGearDropForZone } from '../../features/gearGeneration/selectors.js';
import { addToInventory } from '../../features/inventory/mutators.js';
import { ZONES as ZONE_IDS } from '../../features/adventure/data/zoneIds.js';
import { qCap, fCap } from '../../features/progression/selectors.js';
import { advanceRealm } from '../../features/progression/mutators.js';
import { mountAllFeatureUIs } from '../../features/index.js';
import { updateQiAndFoundation } from '../../features/progression/ui/qiDisplay.js';
import { log } from '../../shared/utils/dom.js';

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

  // Mind debug helpers
  const mindWrap = el("div");
  mindWrap.style.display = "flex";
  mindWrap.style.gap = "6px";
  const manualBtn = smallBtn("Manual+1", () => emit('mind/manuals/debugLevelUp', { root: S }));
  mindWrap.append(manualBtn);
  panel.appendChild(row("Mind", mindWrap));

  // Astral point helpers
  const astralWrap = el("div");
  astralWrap.style.display = "flex";
  astralWrap.style.gap = "6px";
  const astralBtn = smallBtn("+100", () => {
    S.astralPoints = (S.astralPoints || 0) + 100;
    const v = Math.round(S.astralPoints || 0);
    const insightEl = document.getElementById('astralInsight');
    if (insightEl) insightEl.textContent = `Insight: ${v}`;
    const miniEl = document.getElementById('astralInsightMini');
    if (miniEl) miniEl.textContent = `Insight: ${v}`;
  });
  astralWrap.append(astralBtn);
  panel.appendChild(row("Astral", astralWrap));

  // Qi helpers
  const qiWrap = el("div");
  qiWrap.style.display = "flex";
  qiWrap.style.gap = "6px";
  const qiBtn = smallBtn("Max", () => {
    S.qi = qCap(S);
    updateQiAndFoundation();
  });
  qiWrap.append(qiBtn);
  panel.appendChild(row("Qi", qiWrap));

  // Foundation helpers
  const foundationWrap = el("div");
  foundationWrap.style.display = "flex";
  foundationWrap.style.gap = "6px";
  const foundationBtn = smallBtn("Max", () => {
    S.foundation = fCap(S);
    updateQiAndFoundation();
  });
  foundationWrap.append(foundationBtn);
  panel.appendChild(row("Foundation", foundationWrap));

  // Breakthrough helpers
  const btWrap = el("div");
  btWrap.style.display = "flex";
  btWrap.style.gap = "6px";
  const btBtn = smallBtn("Success", () => {
    const info = advanceRealm(S);
    S.qi = 0;
    S.foundation = 0;
    mountAllFeatureUIs(S);
    updateQiAndFoundation();
    log(`[dev] Breakthrough to ${info.realmName} ${info.stage}`, 'good');
  });
  btWrap.append(btBtn);
  panel.appendChild(row("Breakthrough", btWrap));

  // Loot generators
  const lootWrap = el("div");
  lootWrap.style.display = "flex";
  lootWrap.style.gap = "6px";
  const zoneIn = el("input");
  zoneIn.placeholder = "zone";
  zoneIn.value = ZONE_IDS.STARTING;
  Object.assign(zoneIn.style, {
    width: "100px",
    padding: "4px 6px",
    borderRadius: "6px",
    border: "1px solid #2b3a55",
    background: "#0b1422",
    color: "#e8f0ff",
  });
  const stageIn = el("input");
  stageIn.type = "number";
  stageIn.value = "1";
  stageIn.min = "1";
  Object.assign(stageIn.style, {
    width: "40px",
    padding: "4px 6px",
    borderRadius: "6px",
    border: "1px solid #2b3a55",
    background: "#0b1422",
    color: "#e8f0ff",
  });
  const weaponBtn = smallBtn("Weapon", () => {
    const z = zoneIn.value || ZONE_IDS.STARTING;
    const stage = parseInt(stageIn.value, 10) || 1;
    const drop = rollWeaponDropForZone(z, stage);
    if (drop) {
      addToInventory(drop, S);
      console.log('[dev] generated weapon', drop);
    } else {
      console.log('[dev] no weapon drop', z);
    }
  });
  const gearBtn = smallBtn("Gear", () => {
    const z = zoneIn.value || ZONE_IDS.STARTING;
    const stage = parseInt(stageIn.value, 10) || 1;
    const drop = rollGearDropForZone(z, stage);
    if (drop) {
      addToInventory(drop, S);
      console.log('[dev] generated gear', drop);
    } else {
      console.log('[dev] no gear drop', z);
    }
  });
  lootWrap.append(zoneIn, stageIn, weaponBtn, gearBtn);
  panel.appendChild(row("Loot", lootWrap));

  // Auto-mount console using Eruda
  const consoleHdr = el("div", { textContent: "Console" });
  consoleHdr.style.cssText = "margin-top:8px; font:600 12px ui-monospace,monospace; opacity:.9;";
  const consoleWrap = el("div");
  consoleWrap.style.cssText = "max-height:180px; overflow:auto; border-top:1px solid #2b3a55; margin-top:4px;";
  panel.append(consoleHdr, consoleWrap);

  (function loadConsole() {
    function initEruda() {
      try {
        window.eruda.init();
        const container = document.querySelector(".eruda");
        if (container) {
          container.style.position = "static";
          container.style.height = "160px";
          container.style.width = "100%";
          consoleWrap.appendChild(container);
        }
      } catch {}
    }
    if (!window.eruda) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/eruda";
      s.onload = initEruda;
      document.head.appendChild(s);
    } else {
      initEruda();
    }
  })();

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

