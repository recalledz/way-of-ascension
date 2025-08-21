
🤖 AI Assistant Verification Protocol (Feature-First & Doc-Sync Enforced)

🚨 BLOCKING: No AI (or human) changes may land unless structure and docs validation pass.

1) Mandatory commands (must run before any edit)

# Validate codebase + docs alignment (BLOCKS on failure)
node scripts/validate-structure.js

# If it fails, try auto-doc sync (updates project-structure.md & ARCHITECTURE.md stubs)
node scripts/validate-structure.js --auto-update-docs

# Re-run to confirm
node scripts/validate-structure.js

> If validation still fails, STOP and fix the reported items in docs/project-structure.md and/or docs/ARCHITECTURE.md before proceeding.




---

2) Architecture (source of truth) — what the validator enforces

App Shell & Engine

src/ui/app.js: the only bootstrap (create controller, registerAllFeatures(), mount sidebar/debug, start loop).

src/game/GameController.js: runs the loop, calls feature tick(), emits TICK/RENDER.

src/ui/sidebar.js / src/ui/debug.js: global UI only (no gameplay logic).


Feature folders (src/features/<feature>/)

state.js: initial slice (_v included).

selectors.js: read-only helpers (pure).

logic.js: rules/math (pure, no DOM, no state writes).

mutators.js: the only writers to the slice (can call logic, may emit events).

ui/*.js: DOM rendering & event handlers only (no state writes, no rules; call mutators/selectors).

migrations.js: per-slice migrations.

index.js (or feature.js): descriptor

export const <name>Feature = {
  key: "<sliceKey>",
  initialState: () => ({ ...defaults, _v: 0 }),
  init(root, ctx) {},          // subscribe to events, optional mount
  tick(root, dtMs, now, ctx) {}, // optional
  nav: { id, label, order, visible(root), onSelect(root, ctx) }, // optional
  mount: fn, // temporary until all UIs move to init()
};


Cross-feature rules

Communicate via events (intents) and selectors (facts).

❌ No cross-slice writes outside an owning feature’s mutators.js.

❌ No DOM in mutators/logic/selectors.

❌ No gameplay logic in src/shared/**.



---

3) Doc-Sync: REQUIRED updates for every structural change

You MUST update both docs:

1. docs/project-structure.md — the living file tree & file purposes

Add/move/rename files & folders

Short “Purpose / Key Exports / When to modify / Dependencies” for each new or changed file

Keep a high-level tree (trim verbose nodes like node_modules)



2. docs/ARCHITECTURE.md — design rules & contracts

If you add/rename entry points (e.g., app.js), reflect in App Shell section

If you add a feature or split a subfeature (e.g., activity, laws), add its responsibilities and boundaries

If a slice shape changes, bump _v and mention the migration in the Migrations section

Keep the Feature Descriptor Contract verbatim (the validator checks it)




Doc update checklist (blocking)

[ ] project-structure.md file tree reflects new/renamed/removed files

[ ] Each new/changed file has a brief Purpose / Key Functions / Dependencies / When to modify

[ ] ARCHITECTURE.md includes any new features & lifecycle contracts impacted

[ ] If you touched tick/loop/boot, the App Shell & GameController sections are updated

[ ] If you changed slice shape: _v bumped + migration documented



---

4) Automated verification (what the validator should check)

> Ensure scripts/validate-structure.js implements or is updated to include these checks:



Structure & Contract

Every src/features/*/ has state.js, selectors.js, logic.js, mutators.js, migrations.js, and descriptor (index.js/feature.js).

Descriptor exposes key and initialState(), optional init/tick/nav/mount.


Architecture purity

In features/**/ui/*.js: forbid root. writes, S imports, Math.random() rules, setInterval/requestAnimationFrame.

In features/**/(mutators|logic|selectors).js: forbid DOM access (document, window, createElement, querySelector).

In src/shared/**: forbid imports from src/features/** and references to slice keys.


App Shell integrity

Ensure src/ui/app.js exists and imports no gameplay modules.

Ensure GameController does not use engineTick and calls tickFeatures.


Migrations

Each feature migrations.js exports a migrator and bumps _v.

src/shared/migrations.js (or src/game/migrations.js if that’s your location) calls all feature migrators.


Doc-Sync

docs/project-structure.md file list matches actual tree (allow listed ignores).

docs/ARCHITECTURE.md contains the Feature Descriptor Contract block and “App Shell / GameController” sections.

If new files appear without an entry in project-structure.md → fail.

If descriptors/sections are missing in ARCHITECTURE.md → fail.


> Optional: --auto-update-docs can append missing doc stubs (tree + “Purpose” boilerplates), but still fail if human review is required.




---

5) Pre-change checklist (engine + docs)

[ ] Ran node scripts/validate-structure.js (passed)

[ ] Read docs/project-structure.md and docs/ARCHITECTURE.md

[ ] Planned where code lives by feature (state/logic/mutators/selectors/ui)

[ ] Confirmed cross-feature effects use events/selectors

[ ] Updated both docs (structure + architecture) and re-ran validation



---

6) Runtime verification

After the change:

1. Start the game, open in browser


2. Console is clean (no import/path/timer errors)


3. UI responds; events fire; state updates via mutators only


4. RENDER refreshes feature UIs; loop runs via GameController


5. Saves load; migrations applied




---

7) Forbidden patterns (auto-fail)

UI files mutating root/S or computing rules

DOM usage in mutators/logic/selectors

Cross-slice writes outside owning mutators

Feature logic inside app.js or GameController

New files without entries in both docs

New/changed slice shapes without _v bump + migration doc



---

8) Required doc templates

project-structure.md entry template

#### `src/features/physique/mutators.js`
**Purpose:** Slice writers for Physique (sessions, hits, XP, level-ups)  
**Key Functions:** `startTrainingSession`, `executeHit`, `endTrainingSession`, `tickPhysique`  
**Dependencies:** `./logic.js`, `../../shared/events.js`  
**When to modify:** When changing Physique rules/flows or adding new user actions

ARCHITECTURE.md feature template

### Physique Feature
- **State:** `level, exp, expMax, stamina, session*, cursor*` (_v bumped on schema change)
- **Mutators:** only writer; emits `PHYSIQUE:*` events for UI feedback
- **Logic:** pure rules (hit windows, streaks, level curve)
- **UI:** `ui/trainingGame.js`, DOM only; calls mutators; listens on `RENDER`
- **Tick:** `tickPhysique` called by GameController
- **Interactions:** reads progression bonuses via selectors; no cross-slice writes


---

9) Commit/PR checklist (must be in PR description)

[ ] validate-structure.js passed locally

[ ] Updated docs/project-structure.md (file tree + entries)

[ ] Updated docs/ARCHITECTURE.md (app shell/feature sections)

[ ] Added/updated per-feature migrations (_v bump) if slice changed

[ ] No forbidden patterns (UI writes, DOM in mutators/logic, etc.)

[ ] Manual runtime smoke test done



---

compare against the file tree,

check for the descriptor block in ARCHITECTURE.md,

and fail on UI writes / DOM-in-mutators with concrete file+line reports.


