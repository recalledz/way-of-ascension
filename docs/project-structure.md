# Way of Ascension - Project Structure

## Project Overview

Way of Ascension is a browser-based cultivation/idle game built with vanilla JavaScript. The game features:
- Cultivation mechanics (Qi, Foundation, Realms)
- Adventure system with combat and boss challenges
- Law comprehension system
- Sect management
- Manual learning system
- Weapon proficiency system
- Area progression with unlocking mechanics

## Complete File Structure

```
way-of-ascension/
├── .windsurf/
│   ├── ai-enforcement.js
│   ├── pre-commit-hook.js
│   └── rules/
│       └── way-of-ascension.md
├── browser-tools-mcp/
│   ├── browser-tools-mcp/
│   │   ├── README.md
│   │   ├── mcp-server.ts
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── browser-tools-server/
│   │   ├── lighthouse/
│   │   ├── README.md
│   │   ├── browser-connector.ts
│   │   ├── package.json
│   │   ├── server.ts
│   │   └── tsconfig.json
│   ├── chrome-extension/
│   │   ├── background.js
│   │   ├── devtools.html
│   │   ├── devtools.js
│   │   ├── manifest.json
│   │   ├── panel.html
│   │   └── panel.js
│   └── docs/
│       ├── mcp-docs.md
│       └── mcp.md
├── docs/
│   ├── To-dos/
│   │   ├── Balance.md
│   │   ├── affixes-expansion.md
│   │   ├── animations-per-weapon.md
│   │   ├── boss-specific-affixes.md
│   │   ├── combat-stats-analysis.md
│   │   ├── combat-stats.md
│   │   ├── combo-system.md
│   │   ├── crafting-forginf.md
│   │   ├── enemy-weakness.md
│   │   ├── equipment.md
│   │   ├── manual-system.md
│   │   ├── manuals.md
│   │   ├── Palms-and-fists.md
│   │   ├── status-effects.md
│   │   ├── ui-improvements.md
│   │   ├── weapons-guidlines.md
│   │   └── stats-to-implement.md
│   ├── ai-verification-protocol.md
│   ├── cultivation-ui-style.md
│   ├── proficiency.md
│   ├── parameters-and-formulas.md
│   ├── project-structure.md
│   └── ARCHITECTURE.md
├── node_modules/
├── scripts/
│   ├── test-node.js
│   └── validate-structure.js
├── src/
│   ├── index.js
│   ├── features/
│   │   ├── adventure/
│   │   │   ├── data/
│   │   │   │   ├── enemies.js
│   │   │   │   ├── zoneIds.js
│   │   │   │   └── zones.js
│   │   │   ├── ui/
│   │   │   │   ├── progressBar.js
│   │   │   │   └── zoneUI.js
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   └── state.js
│   │   ├── index.js
│   │   ├── ability/
│   │   │   ├── data/
│   │   │   │   └── abilities.js
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   └── state.js
│   │   ├── affixes/
│   │   │   ├── data/
│   │   │   │   └── affixes.js
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   └── state.js
│   │   ├── combat/
│   │   │   ├── attack.js
│   │   │   ├── data/
│   │   │   │   ├── status.js
│   │   │   │   └── statusesByElement.js
│   │   │   ├── hit.js
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── statusEngine.js
│   │   │   └── ui/
│   │   ├── inventory/
│   │   │   ├── data/
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   └── ui/
│   │   │       ├── CharacterPanel.js
│   │   │       └── weaponChip.js
│   │   ├── loot/
│   │   │   ├── data/
│   │   │   │   ├── lootTables.js
│   │   │   │   └── lootTables.weapons.js
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   └── ui/
│   │   │       └── lootTab.js
│   │   ├── proficiency/
│   │   │   ├── data/
│   │   │   │   └── .gitkeep
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   └── ui/
│   │   │       └── weaponProficiencyDisplay.js
│   │   ├── progression/
│   │   │   ├── data/
│   │   │   │   ├── laws.js
│   │   │   │   └── realms.js
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   └── ui/
│   │   └── weaponGeneration/
│   │       ├── data/
│   │       │   ├── materials.stub.js
│   │       │   ├── weaponIcons.js
│   │       │   ├── weaponTypes.js
│   │       │   └── weapons.js
│   │       ├── logic.js
│   │       ├── mutators.js
│   │       ├── selectors.js
│   │       └── state.js
│   ├── game/
│   │   ├── GameController.js
│   │   ├── systems/
│   │   │   ├── loot.js
│   │   │   └── sessionLoot.js
│   │   ├── helpers.js
│   │   ├── migrations.js
│   │   ├── state.js
│   │   └── utils.js
│   ├── shared/
│   │   ├── events.js
│   │   └── saveLoad.js
│   └── ui/
│       ├── fx/
│       │   └── fx.js
│       └── sidebar.js
├── ui/
│   ├── components/
│   │   └── progressBar.js
│   ├── index.js
│   └── realm.js
├── README.md
├── CHANGELOG.md
├── eslint.config.mjs
├── index.html
├── package-lock.json
├── package.json
├── server.js
└── style.css
```

## File Responsibilities

### Documentation (`docs/`)
- `proficiency.md` – Weapon proficiency XP formula and level benefits.
- `docs/To-dos/ui-improvements.md` – Planned UI improvements and enhancements.
- `docs/To-dos/Balance.md` – Balance system notes and parameter guidelines.
- `docs/To-dos/Palms-and-fists.md` – Concept notes for palm and fist weapon styles.
- `parameters-and-formulas.md` – Base stats, cultivation stats, activity starting stats, damage formulas, and skill XP scaling reference.
- `To-dos/Balance.md` – Notes on planned balance adjustments.

### Core Game Logic (`src/game/`)

#### `state.js` - Game State Management
**Purpose**: Central state management, save/load functionality
**Key Functions**:
- `defaultState()` - Defines initial game state structure
- `loadSave()` - Loads game from localStorage
- `save()` - Saves current state to localStorage
- `setState()` - Updates global state reference

**State Structure**:
```javascript
S = {
  // Core progression
  ver: SAVE_VERSION,
  time: 0,
  qi: 100, qiMax: 100, qiRegenPerSec: 1,
  foundation: 0,
  realm: { tier: 0, stage: 1 },
  
  // Resources
  stones: 0, herbs: 0, ore: 0, wood: 0, cores: 0,
  pills: { qi: 0, body: 0, ward: 0 },
  
  // Stats system
  stats: {
    physique: 10, mind: 10, dexterity: 10, comprehension: 10,
    criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
  },
  
  // Activity system (only one active at a time)
  activities: {
    cultivation: false, physique: false, mining: false, adventure: false, cooking: false
  },
  
  // Activity data containers
  physique: { level: 1, exp: 0, expMax: 100, stamina: 100, maxStamina: 100 },
  mining: { level: 1, exp: 0, expMax: 100, unlockedResources: ['stones'], selectedResource: 'stones', resourcesGained: 0 },
  adventure: { /* adventure state */ },
  
  // Systems
  alchemy: { level: 1, xp: 0, queue: [], maxSlots: 1, successBonus: 0, unlocked: false, knownRecipes: ['qi'] },
  laws: { selected: null, unlocked: [], points: 0, trees: { sword: {}, formation: {}, alchemy: {} } },
  buildings: {}, // Building levels: {building_key: level}
  buildingBonuses: { /* calculated bonuses */ },
  
  // Auto systems
  auto: { meditate: true, brewQi: false, hunt: false }
}
```

**When to modify**: Add new state properties, modify save structure, add migration logic

#### `src/features/progression/logic.js` - Game Calculations
**Purpose**: Core progression mechanics and calculations
**Key Functions**:
- `qCap()`, `qiRegenPerSec()` - Qi system calculations
- `fCap()`, `foundationGainPerSec()` - Foundation system
- `calcAtk()`, `calcDef()` - Combat calculations
- `getLawBonuses()` - Law system bonuses
- `getStatEffects()` - Stat system effects

**When to modify**: Add new calculation functions, modify existing formulas, add bonus systems

#### `src/features/adventure/logic.js` - Adventure System
**Purpose**: Adventure zones, combat, boss challenges, area progression, map UI
**Key Functions**:
- `startAdventureCombat()` - Initialize regular combat
- `startBossCombat()` - Initialize boss fights
- `updateActivityAdventure()` - Update adventure UI
- `progressToNextArea()` - Handle area progression
- `defeatEnemy()` - Handle enemy defeat and loot
- `updateAdventureProgressBar()` - Render horizontal progress bar with zone areas
- `showMapOverlay()`, `hideMapOverlay()` - Map modal display
- `updateMapContent()` - Populate map accordion with unlocked zones/areas
- `selectAreaById()` - Area selection and navigation

**Dependencies**: `src/features/adventure/data/zones.js` for zone/area data structure
**When to modify**: Add new zones/areas, modify combat mechanics, adjust boss system, enhance map UI

#### `combat/hit.js` - Hit Chance Calculation
**Purpose**: Calculates chance for an attack to hit based on accuracy and dodge with scaling and caps.
**Key Functions**:
- `chanceToHit(accuracy, dodge)` – computes final hit probability.

#### `abilitySystem.js` - Active Ability Handling
**Purpose**: Manages casting validation, cooldown timers, and resolving ability effects.
**Key Functions**:
- `tryCastAbility(key)` – validate and trigger ability casts, deduct Qi, start cooldowns.
- `tickAbilityCooldowns(dt)` – decrement cooldown timers each game tick.
- `processAbilityQueue(state)` – resolve queued ability actions like Power Slash damage and healing.

#### `selectors.js` - Centralized State Selectors
**Purpose**: Provides derived state accessors. Never read state fields directly; use selectors.
**Key Functions**:
- `getEquippedWeapon(state)` – retrieve the currently equipped weapon.
- `getAbilitySlots(state)` – derive six ability slots from the equipped weapon.

#### `migrations.js` - Save Migration System
**Purpose**: Handle save data structure changes between versions

#### `src/features/ability/state.js` - Ability State Slice
Tracks ability cooldown timers and pending action queue.

#### `src/features/ability/mutators.js` - Ability Mutators
Validate casts, tick cooldowns, and process queued ability actions.

#### `src/features/ability/selectors.js` - Ability Selectors
Expose ability slots and cooldown information using inventory data.

#### `src/features/ability/logic.js` - Ability Resolution
Resolves ability effects like Power Slash damage and healing.

#### `src/features/ability/data/abilities.js` - Ability Definitions
Defines metadata for active abilities such as cost and cooldown.

#### `src/features/affixes/state.js` - Affix Feature State
Holds affix-related tracking data.

#### `src/features/affixes/logic.js` - Affix Logic
Utilities for applying affixes to generated items.

#### `src/features/affixes/mutators.js` - Affix Mutators
State mutations for affix acquisition and assignment.

#### `src/features/affixes/selectors.js` - Affix Selectors
Expose affix information for UI and logic layers.

#### `src/features/inventory/ui/CharacterPanel.js` - Character Panel UI
Renders the player's equipment and inventory interface.

#### `src/features/inventory/ui/weaponChip.js` - Weapon Chip UI
Displays a compact summary of the equipped weapon.

**Pattern**:
```javascript
export const SAVE_VERSION = 5;
export function runMigrations(save) {
  if (save.ver < 2) { /* migration logic */ }
  if (save.ver < 3) { /* migration logic */ }
  // etc.
}
```
**When to modify**: When changing save data structure, increment SAVE_VERSION and add migration logic

#### `features/loot/logic.js` - Loot Rolling Utilities
**Purpose**: Provides weighted random item selection based on zone loot tables.
**Key Functions**: `rollLoot()`, `toLootTableKey()`, `onEnemyDefeated()`.
**When to modify**: Adjust loot algorithms or add new drop behaviors.

#### `src/features/inventory/mutators.js` - Inventory Management
**Purpose**: Adds, removes, and equips items in the player's inventory and equipment slots.
**Key Functions**: `addToInventory()`, `removeFromInventory()`, `equipItem()`, `unequip()`.
**When to modify**: Expand inventory features or adjust equip logic.

#### `src/features/inventory/logic.js` - Equipment Calculations
**Purpose**: Computes derived player stats and determines valid equip slots.
**Key Functions**: `recomputePlayerTotals()`, `canEquip()`.
**When to modify**: Adjust stat calculations or equip rules.

#### `src/features/inventory/selectors.js` - Inventory Selectors
**Purpose**: Provides helper accessors for inventory and equipment state.
**Key Functions**: `getInventory()`, `getEquipment()`, `getEquippedWeapon()`.
**When to modify**: Expose additional inventory state helpers.

#### `src/features/inventory/state.js` - Inventory State Slice
**Purpose**: Defines default `inventory` and `equipment` state structures.
**When to modify**: Change initial inventory or equipment layout.

#### `features/loot/mutators.js` - Session Loot Buffer
**Purpose**: Temporarily stores loot until claimed or forfeited after a session.
**Key Functions**: `addSessionLoot()`, `claimSessionLoot()`, `forfeitSessionLoot()`.
**When to modify**: Change how loot is staged or distributed post-combat.

### Data Configuration (`src/features/progression/data/`)

#### `realms.js` - Cultivation Realms
**Purpose**: Define cultivation progression tiers
**Structure**:
```javascript
export const REALMS = [
  { name: 'Mortal', cap: 100, fcap: 50, baseRegen: 1, atk: 1, def: 1, power: 1, bt: 0.8 },
  // ... more realms
];
```
**When to modify**: Add new cultivation realms, adjust realm balance

#### `laws.js` - Cultivation Laws
**Purpose**: Define cultivation law systems and skill trees
**When to modify**: Add new laws, modify skill trees, adjust bonuses

#### `src/features/adventure/data/enemies.js` - Enemy Data
**Purpose**: Define enemies for combat and adventure systems
**When to modify**: Add new enemies, adjust combat balance

#### `src/features/adventure/data/zones.js` - Zone/Area Data Structure
**Purpose**: Centralized zone and area definitions with progressive unlock system
**Key Functions**:
- `getZoneById()` - Retrieve zone by ID
- `getAreaById()` - Retrieve area by zone/area ID
- `isZoneUnlocked()` - Check if zone is accessible
- `isAreaUnlocked()` - Check if area is accessible
- `getNextArea()`, `getNextZone()` - Navigation helpers

**Structure**:
```javascript
export const ZONES = [
  {
    id: 'peaceful-lands',
    name: 'Peaceful Lands',
    description: 'A serene area perfect for beginners',
    element: 'nature',
    color: '#4ade80',
    unlockReq: null, // Always unlocked
    areas: [
      { 
        id: 'forest-edge', 
        name: 'Forest Edge', 
        enemy: 'Forest Rabbit', 
        killReq: 5,
        description: 'Gentle creatures roam the forest edge',
        loot: { stones: 2, meat: 1 }
      }
      // ... more areas
    ]
  }
  // ... more zones
];
```
**When to modify**: Add new zones/areas, modify unlock requirements, adjust loot tables

#### `weaponIcons.js` - Weapon Type Icons
**Purpose**: Maps weapon type keys to Iconify icon names for UI display.
**When to modify**: Add or update icons when introducing new weapon types.

### User Interface (`ui/`)

#### `index.js` - Main UI Controller
**Purpose**: UI management, event handling, display updates
**Key Functions**:
- `initUI()` - Initialize UI elements and event listeners
- `updateAll()` - Update all UI displays
- `setText()`, `setFill()` - UI utility functions
- Render functions: `renderBuildings()`, `renderKarma()`, etc.

**UI Update Pattern**:
```javascript
function updateAll() {
  // Update displays
  setText('elementId', value);
  setFill('fillId', ratio);
  
  // Call specialized render functions
  renderBuildings();
  renderKarma();
  // etc.
}
```

**When to modify**: Add new UI elements, modify display logic, add event handlers

#### `realm.js` - Realm UI Components
**Purpose**: Realm-specific UI components and cultivation displays
**When to modify**: Add new realm UI features, modify cultivation interface

#### `components/progressBar.js` - Reusable Progress Bar Component
**Purpose**: Provides reusable functions to create and update standardized progress bars throughout the UI.
**Key Functions**:
- `createProgressBar()`: Creates a new progress bar component.
- `updateProgressBar()`: Updates an existing progress bar's value and text.
**Dependencies**: Vanilla JS, follows structure in `style.css`.
**When to modify**: When changing the fundamental structure or style of all progress bars.

#### `src/features/inventory/ui/CharacterPanel.js` - Equipment & Inventory Panel
**Purpose**: Single source for rendering equipped items and inventory with actions to equip, use, scrap, filter, and view details.
**Key Functions**: `renderEquipmentPanel()`, `setupEquipmentTab()`.
**When to modify**: Adjust character gear interface or inventory interactions.

#### `src/ui/sidebar.js` - Sidebar Activity Renderer
**Purpose**: Builds the sidebar activity list and progress displays.
**When to modify**: Adjust sidebar activities or their presentation.

#### `src/features/inventory/ui/weaponChip.js` - Weapon Chip HUD
**Purpose**: Initializes and updates the weapon display chip in the top HUD.
**When to modify**: Change weapon HUD logic or appearance.

#### `src/features/proficiency/state.js` - Proficiency Feature State
**Purpose**: Maintains the player's proficiency map keyed by weapon type.
**When to modify**: Adjust underlying storage of proficiency values.

#### `src/features/proficiency/logic.js` - Proficiency Calculations
**Purpose**: Provides core functions for gaining and querying proficiency.
**Key Functions**:
- `gainProficiency(key, amount, state)` – increment proficiency for a weapon type.
- `getProficiency(key, state)` – retrieve proficiency value and bonus multiplier.

#### `src/features/proficiency/mutators.js` - Proficiency Mutators
**Purpose**: State-aware wrappers around proficiency logic.
**Key Functions**: `gainProficiency(key, amount, state)`.

#### `src/features/proficiency/selectors.js` - Proficiency Selectors
**Purpose**: Read-only helpers to derive proficiency data and bonuses.
**Key Functions**:
- `getProficiency(key, state)` – get stored proficiency and bonus.
- `getWeaponProficiencyBonuses(state)` – compute damage and speed bonuses for the equipped weapon.

#### `src/features/proficiency/ui/weaponProficiencyDisplay.js` - Proficiency HUD
**Purpose**: Updates HUD elements showing weapon proficiency levels and progress.
**When to modify**: Adjust proficiency display or formatting.

#### `src/features/progression/state.js` - Progression State Slice
**Purpose**: Stores realm, cultivation, and law info for the player.

#### `src/features/progression/mutators.js` - Progression Mutators
**Purpose**: Advance realms and manage law selection and unlocking.
**Key Functions**: `advanceRealm(state)`, `selectLaw(lawKey, state)`.

#### `src/features/progression/selectors.js` - Progression Selectors
**Purpose**: Expose derived values like qi capacity, regeneration, and law bonuses.
**Key Functions**: `qCap(state)`, `qiRegenPerSec(state)`, `getLawBonuses(state)`.

#### `src/features/progression/logic.js` - Progression Calculations
**Purpose**: Core formulas for cultivation and combat stats.
**Key Functions**: `fCap(state)`, `calcAtk(state)`, `breakthroughChance(state)`.

#### `src/features/progression/data/realms.js` - Cultivation Realms
**Purpose**: Define realm tiers and their properties.

#### `src/features/progression/data/laws.js` - Cultivation Laws
**Purpose**: Define law bonuses and skill trees.

### UI Effects (`src/ui/fx/`)

#### `fx.js` - SVG Combat Effects
**Purpose**: Utility functions for spawning and animating combat visual effects using SVG.
**Key Functions**: `playSlashArc()`, `playThrustLine()`, `playRingShockwave()`, `playBeam()`, `playChakram()`, `playShieldDome()`, `playSparkBurst()`, `setFxTint()`, `setReduceMotion()`.
**When to modify**: Extend or adjust visual effect primitives.

### HTML Structure (`index.html`)
**Purpose**: Main game interface structure
**Key Elements**:
- Tab system for different game sections
- Activity cards for the activity system
- Resource displays and progress bars
- Modal dialogs for complex interactions

**When to modify**: Add new UI sections, modify layout structure

### Styling (`style.css`)
**Purpose**: Game visual styling
**When to modify**: Add new styles, modify visual appearance

### Server (`server.js`)

**Purpose**: A simple Node.js server to serve the game's static files for local development.
**Dependencies**: `http`, `fs`, `path`
**When to modify**: If server configuration, port, or file handling logic needs to change.

### Changelog (`CHANGELOG.md`)
**Purpose**: Tracks notable changes, additions, and fixes across versions.
**When to modify**: Whenever implementing new features or documenting releases.

## Recent Snapshot

Paths added:

- `src/game/GameController.js` – orchestrator
- `src/shared/events.js`
- `src/shared/saveLoad.js`
- `src/features/index.js` – UI bootstrap
- `src/index.js` – entry that bootstraps and starts the controller
- `docs/ARCHITECTURE.md`
- `docs/To-dos/stats-to-implement.md`

#### `src/game/GameController.js` - Game Orchestrator
**Purpose**: Boots the game, runs the fixed-step loop, emits events and handles simple routing.

#### `src/shared/events.js` - Events Bus
**Purpose**: Tiny pub/sub (`on`, `off`, `emit`) for global game events.

#### `src/shared/saveLoad.js` - Persistence Helpers
**Purpose**: Load and save game state, including debounced autosave.

#### `src/features/index.js` - Feature UI Bootstrap
**Purpose**: Central place to mount all feature user interfaces.

#### `src/index.js` - Entrypoint
**Purpose**: Minimal bootstrap that creates the controller, mounts feature UIs and starts the game.

#### `docs/ARCHITECTURE.md` - Architecture Overview
**Purpose**: Documents the controller, events bus and bootstrap pattern.

#### `docs/To-dos/stats-to-implement.md` - Stats Roadmap
**Purpose**: Lists game stats that still need implementation.

### Combat Feature (`src/features/combat/`)
- `src/features/combat/logic.js` – Core combat calculations such as armor mitigation and shield handling.
- `src/features/combat/mutators.js` – Stateful combat helpers (`initializeFight`, `processAttack`, `applyStatus`).
- `src/features/combat/state.js` – Shape of combat-related state values (enemy HP, stun bars).
- `src/features/combat/selectors.js` – Accessors for combat state like enemy HP and stun bars.
- `src/features/combat/attack.js` – Applies status effects and stun bar changes when attacks land.
- `src/features/combat/hit.js` – Chance-to-hit utilities.
- `src/features/combat/statusEngine.js` – Internal status effect stacking and duration handler.
- `src/features/combat/data/status.js` – Definitions for all status effects.
- `src/features/combat/data/statusesByElement.js` – Maps elements to their default status applications.
