# Way of Ascension – Architecture Overview

This document describes the **current architecture** of the Way‑of‑Ascension codebase after the initial migration from a purely layer‑based structure (e.g. `src/data/`, `src/game/`) towards a more **feature‑oriented** organisation.  The goal of a feature‑oriented structure is to keep all the code related to a particular system in one place, improving cohesion and discoverability:contentReference[oaicite:0]{index=0}.  This guide is intended for contributors and AI assistants to understand where different kinds of code live, how they interact and how to extend the project safely.

## High‑level structure

At the root of the repository you will find the following top‑level folders:

| Folder            | Purpose |
|-------------------|---------|
| `src/features/`   | **Feature modules**.  Each subfolder under `features` encapsulates all the data definitions, state slice, mutators, selectors, business logic and any UI components needed for a single game system. |
| `src/shared/`     | Cross-feature utilities and root state. Includes the composed `state.js`, aggregated `mutators.js`/`selectors.js`, event bus and save/load helpers. |
| `src/game/`       | **Legacy game logic**.  This folder now primarily hosts the `GameController` and any remaining legacy systems pending migration. |
| `src/data/`       | Shared static data that has not yet been migrated into feature modules.  Examples include loot tables, status definitions and ability lists. |
| `src/ui/`         | Legacy user interface code organised by view or component.  Feature UIs being added in the new structure live inside `src/features/<feature>/ui`. |
| `docs/`           | Project documentation (design guides, UI style guidelines, proficiency explanation, etc.).  This file lives here. |

Other folders such as `scripts/` (build or deployment scripts) and `index.html` remain unchanged from the previous structure.

#### Runtime Orchestration: GameController

`GameController` is the orchestrator for the runtime: it boots the game, runs the fixed‑step main loop, emits events and handles simple routing such as `state.app.mode`. It deliberately avoids business logic; each feature owns its own rules. Features register `init` and `tick` hooks with a central registry; the controller invokes these ticks each step.

#### Events Bus

A tiny pub/sub lives in `src/shared/events.js` exposing `on`, `off` and `emit`. The controller emits `TICK` (fixed step) and `RENDER` (per frame). Feature UIs subscribe to `RENDER` to redraw, and systems can listen to `TICK` for simulation updates. Mutators can also broadcast domain events; for example `startActivity` emits `ACTIVITY:START` with the root state and activity name so features like mining can initialise themselves without direct dependencies. Ability mutators emit `ABILITY:HEAL` with the healed amount so the UI can show floating heal numbers.

#### Entrypoint & Bootstrap

`src/ui/app.js` exports `initApp()`, which creates the game controller, mounts feature UIs via `mountAllFeatureUIs(state)`, mounts debug helpers and starts the loop. `src/index.js` is a minimal entry that simply calls `initApp()`.

#### State Access Rules

Selectors read from state and mutators write to state. User interfaces never mutate state directly.

#### Cross-feature access

`src/shared/selectors.js` and `src/shared/mutators.js` re-export each feature's API. Features that need data or behaviour from another slice import through this shared layer, keeping dependencies explicit and avoiding deep relative paths.

### Dev Tools
- Mini dev menu at `src/ui/dev/devQuickMenu.js` (always available; top-right).
- Uses `window.__PAUSE/__RESUME/__STEP/__GET_SPEED/__SET_SPEED` if present.
- Emits `DEV:SET_SEED` for RNG; features/controller may listen to it.
- If `#debugPanel` exists, it is displayed inside the menu.

#### Migration Process (Incremental)

Keep `progression/logic.js` intact for now; migrate features one at a time (loot → inventory → affixes → ability → combat → adventure → engine). After a feature is migrated, remove its responsibilities from `progression/logic.js` and replace them with registered `tick` hooks or `TICK` listeners.

#### PR Checklist (Short)

* Entry uses `GameController` only; no duplicate loops or timers exist elsewhere.
* New or changed UIs subscribe to `RENDER`.
* State writes go through mutators; reads use selectors.
* Architecture doc and structure map are updated.

## Feature folders

Each feature folder under `src/features` follows a consistent internal layout:

* **`data/`** – Static data definitions specific to the feature.
* **`state.js`** – The default state slice for the feature, exported as a plain object.  For example, the `weaponGenerationState` contains a single `generated` property used to hold the currently generated weapon:contentReference[oaicite:1]{index=1}.
* **`logic.js`** – Pure functions implementing the core calculations of the feature.  For instance, `generateWeapon()` composes a weapon object by combining a base type with an optional material:contentReference[oaicite:2]{index=2}.
* **`mutators.js`** – Functions that modify the feature’s state slice.  They act as the sole entry point for state mutations, helping you track where changes occur.  The weapon generation mutator, for example, writes a generated weapon into `weaponGenerationState.generated`:contentReference[oaicite:3]{index=3}.
* **`selectors.js`** – Functions that read values from the feature’s state.  They often wrap logic functions to calculate derived values.  The `rollWeaponDropForZone()` selector samples the appropriate loot table and returns a generated weapon based on the current zone:contentReference[oaicite:4]{index=4}.
* **`ui/`** – Feature‑specific UI modules.  These typically import selectors to display state and call mutators in response to user actions.

### Feature Descriptor Contract (key + initialState())
Every feature exports a descriptor object with a unique `key` and an `initialState()` function. The registry uses this contract to compose the root state and bootstrap feature hooks.

```js
export const <name>Feature = {
  key: "<sliceKey>",
  initialState: () => ({ ...defaults, _v: 0 }),
};
```
### Proficiency feature

The **Proficiency** module tracks a player’s mastery of different weapon types.  It exposes a `proficiencyState` slice with a `proficiency` map:contentReference[oaicite:5]{index=5}.  The logic file defines `gainProficiency()` and `getProficiency()`; the latter returns both the raw proficiency value and a bonus calculated via a soft‑capping formula:contentReference[oaicite:6]{index=6}.  Mutators simply delegate to the logic functions, ensuring all state changes pass through a single place:contentReference[oaicite:7]{index=7}.  The selectors mirror the logic and provide an additional helper to derive weapon damage/speed bonuses based on the equipped weapon:contentReference[oaicite:8]{index=8}.

On the UI side, `weaponProficiencyDisplay.js` updates HTML elements to display the player’s current proficiency level, progress and bonus.  It imports the equipped weapon selector from `src/features/inventory/selectors.js` and uses feature data (`WEAPON_TYPES` and `WEAPON_ICONS`) for labels and icons:contentReference[oaicite:9]{index=9}.

### Weapon Generation feature

The **Weapon Generation** module is responsible for constructing and dropping weapons.  Its data folder defines base weapon types (`WEAPON_TYPES`) with their stats, scaling and optional signature abilities:contentReference[oaicite:10]{index=10}.  The `logic.js` file provides `generateWeapon()`, which creates a weapon item combining type and material and returns an object with name, base stats and ability keys:contentReference[oaicite:11]{index=11}.  It also defines helper types and composition functions.

The `mutators.js` file writes a generated weapon into the state slice and exposes a `clearGeneratedWeapon()` helper to reset it:contentReference[oaicite:12]{index=12}.  Selectors include `getGeneratedWeapon()` and `rollWeaponDropForZone()`, which uses weighted loot tables to return a randomly generated weapon based on the current zone:contentReference[oaicite:13]{index=13}.

Weapon generation data includes `weaponTypes.js`, `weapons.js`, `weaponIcons.js` and `materials.stub.js`.  The `weaponTypes.js` file defines the base DPS, scaling and tags for each weapon type and references signature abilities that are still stubs for later implementation:contentReference[oaicite:14]{index=14}.  The `weapons.js` file builds a list of default weapon items using `generateWeapon()` and exports convenience objects like `WEAPON_FLAGS` and `WEAPON_CONFIG` for quick lookups:contentReference[oaicite:15]{index=15}.

### Automation feature

The **Automation** module stores flags for enabling background actions such as meditation and adventuring.
Its `state.js` defines `automationState` and an `initialState()` helper that adds version metadata.
`logic.js` contains pure calculations like `isAnyAutomationEnabled()` for derived checks.
Mutators flip automation flags while selectors read them, and `migrations.js` exports an array for save upgrades.

## Legacy `src/game` modules

The original `src/game` folder has largely been superseded.  With the root state and helpers moved into `src/shared/`, this directory now primarily houses `GameController.js` as a bridge for the legacy world.  Any remaining legacy systems will continue to be migrated into `src/features` until the folder can be retired entirely.

## Future migration plan

To complete the transition to a feature‑oriented structure, each remaining system will be moved into its own feature folder.  A suggested order is:

1. **Loot systems** – create `features/loot` and migrate `sessionLoot.js`, `loot.js` and related data tables.
2. **Inventory** – migrate `inventory.js` and UI components into `features/inventory`.
3. **Affixes** – migrate `affixes.js` into a `features/affixes` folder with its own data and logic.
4. **Ability system** – move `abilitySystem.js` to `features/ability` and refactor the ability resolution switch statement into a handler registry.
5. **Combat** – encapsulate combat logic (`combat.js` and `combat/`) into `features/combat`, including attack, hit, status and damage functions.
6. **Adventure and engine** – migrate the adventure loop and progression engine into dedicated features (`features/adventure`, `features/engine`) once the dependencies above are resolved.

Each migration should follow the pattern demonstrated by proficiency and weapon generation:

* Define a local state slice in `state.js` and add default values.
* Refactor pure computations into `logic.js`.
* Expose controlled state mutations via `mutators.js`.
* Provide selectors that read or derive values from the state.
* Move any feature‑specific UI into a `ui/` subfolder.

## Extending the system

When adding a new game mechanic or extending an existing feature, follow these guidelines:

1. **Decide if it is a new feature.**  If the mechanic has its own data, state and UI, create a new folder under `src/features`.  Otherwise, extend the existing feature.
2. **Define your data.**  Place static definitions (e.g. new weapon types, abilities or status effects) under `data/` within the feature.  Keep these modules pure – they should not reference the game state or mutate anything.
3. **Add state fields.**  Export a default state slice from `state.js` for persistent values.  Do **not** modify the root `state.js` directly; instead, compose slices in the root or through a state management library.
4. **Implement logic.**  Put pure functions in `logic.js` and write unit tests if possible.
5. **Use mutators.**  To change state, call functions from `mutators.js`.  This makes it easy to find where state changes occur.
6. **Expose selectors.**  Provide functions in `selectors.js` to read data from your state slice.  Consumers (UI, other features) should never access state fields directly.
7. **Build UI components.**  If your feature needs user interaction, put UI modules in `ui/` and import selectors and mutators as needed.

Following these steps ensures that all code related to a feature stays together and that the boundary between data, logic, state mutation, and presentation remains clear.  Over time this organisation will simplify navigation, reduce coupling and make adding new content more predictable:contentReference[oaicite:17]{index=17}.

## Balance

Static data within each feature is paired with a `_balance.contract.js` file.
Contracts define acceptable ranges for key numeric fields and include
monotonic checks so that values progress in a single direction. The
`scripts/balance-validate.js` utility evaluates these contracts and can be
run with `npm run lint:balance`. Contracts may also specify design targets
and tolerances to guide tuning without introducing regressions.


---

## Appendix: Architecture Contracts (auto-appended by validator)

### App Shell
- **src/ui/app.js** is the only UI bootstrap (create controller, `registerAllFeatures()`, mount sidebar/debug, start loop).
- No gameplay logic inside app shell.

### GameController
- Owns the loop, calls feature `tick(root, dt)`, emits `TICK` and `RENDER`.

### Feature Descriptor Contract
```js
export const <name>Feature = {
  key: "<sliceKey>",
  initialState: () => ({ ...defaults, _v: 0 }),
  init(root, ctx) {},                // subscribe to events, optional mount
  tick(root, dtMs, now, ctx) {},     // optional
  nav: { id, label, order, visible(root), onSelect(root, ctx) }, // optional
  mount: fn, // temporary bridge until all UIs move to init()
};
```
