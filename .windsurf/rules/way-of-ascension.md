---
trigger: manual
---

## 0) Hard contracts (don’t break these)

* **Single-file build:** app boots from `index.html` with embedded CSS/JS. If you split files, keep `index.html` working at all times.
* **Tabs contract:** nav buttons go in `#tabs`; each content panel is `#activity-{tabId}`; exactly **one** `.activity` visible.
* **Stable IDs:** anything referenced by logic (bars, counters, buttons) must keep its `id`. If you rename, update *all* readers.
* **State object:** every field **must** exist in default state; UI **must** guard against `undefined/NaN`.


## 1) “Pause & plan” triggers (Windsurf should prompt a plan)

* Changing **save schema**, **breakthrough math**, **combat loop**, **regen**, or **yield** multipliers.
* Adding/removing a **tab** or a **long-term currency**.
* Renaming/removing any **DOM id** used by logic.

Plan must state: *what files/IDs change, numbers touched (with bounds), migration steps, and a revert path*.

## 2) Save schema rules (versioned, never wipe)

* **Version key:** bump a schema version anytime you add/rename fields.
* **Migration path:** when loading, if a field is missing → set a sane default; if renamed → copy then delete old; arrays/objects → ensure shape exists.
* **UI guards:** all progress text shows percent and hard-coerces to numbers; bars never render `NaN`.
* **Zero-risk import/export:** export includes schema version; import must migrate before applying.

## 3) UI/UX rules

* **Tabs:** keep 5–7 visible; unlock extra tabs gradually; on mobile, prefer accordion over overflow.
* **Bars:** unique color per system; always show `value/cap` and `%`; animation ≤ 400 ms; no strobing.
* **Tooltips:** never carry critical info; provide touch-safe inline hints for mobile.
* **Mobile first:** no horizontal scroll; tap targets ≥ 36 px; readable at 360 px wide.
* **Status clarity:** top chips show Realm, Qi, HP, Stones; don’t bury core loop stats.

## 4) Balance guardrails

* **Qi regen:** per change ≤ ±20% from previous baseline.
* **Breakthrough success floor:** absolute cap **< 90%** even with buffs.
* **Alchemy success:** per change ≤ ±10% per recipe; salvage > 0 always.
* **Gather yields:** additive by default; multiplicative requires a note + rationale.
* **Combat TTK:** higher tiers must not produce shorter average TTK than lower tiers unless explicitly documented.

Keep a tiny balance sheet (even a comment block): before/after for Qi cap, regen/s, breakthrough chance at cap.

## 5) Feature add protocol (generic, works for any new system)

When adding **any** new mechanic (currency, building line, ritual, etc.):

1. **State:** define base fields (current/cap/points/flags), defaults, and include in migration.
2. **Unlock path:** gate behind an existing tab or building; add an explicit unlock log message.
3. **UI:** add a tab or a panel in the most relevant existing tab; bar + value/cap + brief “how it’s earned/spent”.
4. **Math hooks:** decide which existing formulas it multiplies/adds into; keep ordering consistent (Upgrades × Karma × NewSystem).
5. **Earning & sinks:** at least one **passive** source, one **active** source, and one **short-term sink** plus one **permanent sink**.
6. **Telemetry (lightweight):** log first earn, first spend, and first overflow events to the in-game log for visibility.

## 6) Testing checklist (run after every session)

* **Cold start:** no console errors; all chips show numbers; no `NaN`.
* **Tabs:** all switch; exactly one panel visible; mobile 360×640 still usable.
* **Loop:** meditate → regen ticks → bar updates; attempt breakthrough → success/fail handles HP and resets correctly.
* **Alchemy:** queue add/cancel/collect; success & salvage both occur.
* **Combat:** select beast → start hunt → cooldowns display → victory/defeat resolves; HP never negative.
* **Save:** export/import same version; migration path works from an older export.
* **Performance:** tick loop steady; UI responsive; no memory bloat after 10 minutes idle.

## 7) Conflict & crash prevention

* Never read nested fields without verifying parents exist.
* Any cooldown display must coalesce missing timers to `0s`.
* Any cap must be `max(1, cap)` before division; bars clamp 0–100%.
* Guard against double-starts (e.g., starting a hunt when one is active); log a friendly denial.

## 8) Content/config discipline

* Keep tunable numbers in one place (constants block). If you later externalize to JSON, keep the loader tolerant of missing keys and use defaults.
* Narrative strings live together; avoid scattering hard-coded text across logic.


## 9) Windsurf task snippets (how you instruct it)

* **“Add a new system”**
  *Plan change scope, list state fields + defaults, specify unlock gate, specify UI panel location/ids, list formulas touched, outline migration, produce a before/after numbers table.*
* **“Tighten early-game regen”**
  *Propose two options ≤ ±15%; show effect on 60-sec qi gain and Wolf TTK; pick one; update constants; run smoke test.*
* **“Guard crashes”**
  *Search for reads of nested state; add guards and default coalescing; ensure all bars/text show numeric output.*

## 10) Opinionated sanity checks

* If a change makes any early action strictly dominated, revert or rebalance; every core action should have a viable niche.
* If you can’t explain a new multiplier’s order (pre/post other multipliers) in one sentence, you probably need an additive buff instead.
* If a feature requires more than two UI components and one bar, consider shipping it in two steps.

