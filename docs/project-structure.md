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
├── astral-tree-prototype/
│   ├── astral-tree-v3.0.html
│   ├── astral-tree-v4.html
│   ├── template-tree/
│   │   ├── astral_tree-base-structure.json
│   │   ├── astral_tree-v2.0.json
│   │   └── astral_tree_pentagon.json
│   └── workoround-tree.html
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
│   ├── balance-protocol.md
│   ├── cultivation-ui-style.md
│   ├── game-state-and-mechanics.md
│   ├── proficiency.md
│   ├── parameters-and-formulas.md
│   ├── side-location-discovery.md
│   ├── tutorial.md
│   ├── project-structure.md
│   └── ARCHITECTURE.md
├── node_modules/
├── scripts/
│   ├── balance-validate.js
│   ├── scan-codex-output.js
│   ├── scan-env-usage.js
│   ├── start.js
│   └── validate-structure.js
├── src/
│   ├── config.js
│   ├── index.js
│   ├── data/
│   │   └── status.ts
│   ├── engine/
│   │   ├── combat/
│   │   │   └── stun.js
│   │   ├── enemyPP.js
│   │   ├── pp.js
│   │   ├── ppHistory.js
│   │   └── ppLog.js
│   ├── lib/
│   │   ├── index.js
│   │   └── power/
│   │       ├── ehp.js
│   │       ├── index.js
│   │       ├── pp.js
│   │       └── pp.test.js
│   ├── features/
│   │   ├── adventure/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   ├── enemies.js
│   │   │   │   ├── zoneIds.js
│   │   │   │   └── zones.js
│   │   │   ├── ui/
│   │   │   │   ├── adventureDisplay.js
│   │   │   │   ├── progressBar.js
│   │   │   │   └── zoneUI.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── ui.js
│   │   │   ├── selectors.js
│   │   │   └── state.js
│   │   ├── index.js
│   │   ├── registry.js
│   │   ├── devUnlock.js
│   │   ├── ability/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   └── abilities.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── ui.js
│   │   │   ├── selectors.js
│   │   │   └── state.js
│   │   ├── accessories/
│   │   │   ├── data/
│   │   │   │   └── rings.js
│   │   │   ├── logic.js
│   │   │   └── selectors.js
│   │   ├── affixes/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   └── affixes.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   └── state.js
│   │   ├── combat/
│   │   │   ├── attack.js
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   ├── ailments.js
│   │   │   │   ├── status.js
│   │   │   │   ├── statusesByElement.js
│   │   │   │   └── ailments.js
│   │   │   ├── hit.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── statusEngine.js
│   │   │   └── ui/
│   │   │       ├── combatStats.js
│   │   │       ├── floatingText.js
│   │   │       ├── fx.js
│   │   │       └── index.js
│   │   ├── cooking/
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── index.js
│   │   │   └── ui/
│   │   │       ├── cookControls.js
│   │   │       └── cookingDisplay.js
│   │   ├── inventory/
│   │   │   ├── data/
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── index.js
│   │   │   └── ui/
│   │   │       ├── CharacterPanel.js
│   │   │       ├── resourceDisplay.js
│   │   │       └── weaponChip.js
│   │   ├── loot/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   ├── lootTables.js
│   │   │   │   ├── lootTables.gear.js
│   │   │   │   ├── lootTables.weapons.js
│   │   │   │   └── lootTables.rings.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── qualityWeights.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── index.js
│   │   │   └── ui/
│   │   │       └── lootTab.js
│   │   ├── proficiency/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   └── .gitkeep
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── index.js
│   │   │   └── ui/
│   │   │       └── weaponProficiencyDisplay.js
│   │   ├── progression/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   ├── astral_tree.json
│   │   │   │   ├── laws.js
│   │   │   │   └── realms.js
│   │   │   ├── insight.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── index.js
│   │   │   └── ui/
│   │   │       ├── cultivationSidebar.js
│   │   │       ├── lawDisplay.js
│   │   │       ├── lawsHUD.js
│   │   │       ├── qiDisplay.js
│   │   │       ├── qiOrb.js
│   │   │       ├── realm.js
│   │   │       └── astralTree.js
│   │   ├── sect/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   └── buildings.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── index.js
│   │   │   └── ui/
│   │   │       └── sectScreen.js
│   │   ├── library/
│   │   │   └── ui/
│   │   │       └── libraryDisplay.js
│   │   ├── karma/
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   └── ui/
│   │   │       ├── karmaDisplay.js
│   │   │       └── karmaHUD.js
│   │   ├── alchemy/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   └── recipes.js
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── index.js
│   │   │   └── ui/
│   │   │       ├── alchemyDisplay.js
│   │   │       └── pillIcons.js
│   │   ├── mind/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   ├── manuals.js
│   │   │   │   └── talismans.js
│   │   │   ├── index.js
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── puzzles/
│   │   │   │   └── sequenceMemory.js
│   │   │   └── ui/
│   │   │       ├── mindMainTab.js
│   │   │       ├── mindPuzzlesTab.js
│   │   │       ├── mindReadingTab.js
│   │   │       └── mindStatsTab.js
│   │   ├── mining/
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   └── ui/
│   │   │       └── miningDisplay.js
│   │   ├── forging/
│   │   │   ├── logic.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   ├── migrations.js
│   │   │   └── ui/
│   │   │       └── forgingDisplay.js
│   │   ├── physique/
│   │   │   ├── logic.js
│   │   │   ├── migrations.js
│   │   │   ├── mutators.js
│   │   │   ├── selectors.js
│   │   │   ├── state.js
│   │   │   └── ui/
│   │   │       ├── physiqueDisplay.js
│   │   │       └── trainingGame.js
│   │   ├── talismans/
│   │   │   └── data/
│   │   │       └── talismans.js
│   │   ├── gearGeneration/
│   │   │   ├── data/
│   │   │   │   ├── _balance.contract.js
│   │   │   │   ├── gearBases.js
│   │   │   │   ├── gearIcons.js
│   │   │   │   └── modifiers.js
│   │   │   ├── imbuement.js
│   │   │   ├── logic.js
│   │   │   └── selectors.js
│   │   └── weaponGeneration/
│   │       ├── data/
│   │       │   ├── _balance.contract.js
│   │       │   ├── materials.stub.js
│   │       │   ├── weaponIcons.js
│   │       │   ├── weaponClasses.js
│   │       │   ├── weaponTypes.js
│   │       │   └── weapons.js
│   │       ├── index.js
│   │       ├── logic.js
│   │       ├── migrations.js
│   │       ├── mutators.js
│   │       ├── selectors.js
│   │       └── state.js
│   │   ├── tutorial/
│   │   │   ├── logic.js
│   │   │   └── state.js
│   ├── game/
│   │   ├── GameController.js
│   │   └── migrations.js
│   ├── shared/
│   │   ├── events.js
│   │   ├── mutators.js
│   │   ├── saveLoad.js
│   │   ├── selectors.js
│   │   ├── state.js
│   │   ├── telemetry.js
│   │   ├── tunables.js
│   │   └── utils/
│   │       ├── dom.js
│   │       ├── hp.js
│   │       ├── number.js
│   │       └── stats.js
│   └── ui/
│       ├── app.js
│       ├── diagnostics.js
│       ├── dev/
│       │   ├── balanceTuner.js
│       │   └── devQuickMenu.js
│       ├── notifications.js
│       ├── sidebar.js
│       ├── tutorialBox.js
│       ├── tutorialPopups.js
│       └── weaponSelectOverlay.js
├── ui/
│   └── index.js
├── README.md
├── CHANGELOG.md
├── eslint.config.mjs
├── index.html
├── package-lock.json
├── package.json
├── server.js
├── src/features/ability/index.js
├── src/features/activity/index.js
├── src/features/activity/mutators.js
├── src/features/activity/selectors.js
├── src/features/activity/state.js
├── src/features/activity/ui/activityUI.js
├── src/features/adventure/index.js
├── src/features/adventure/ui/mapUI.js
├── src/features/affixes/index.js
├── src/features/automation/index.js
├── src/features/automation/logic.js
├── src/features/automation/migrations.js
├── src/features/automation/mutators.js
├── src/features/automation/selectors.js
├── src/features/automation/state.js
├── src/features/combat/index.js
├── src/features/karma/index.js
├── src/features/law/index.js
├── src/features/mining/index.js
├── src/features/gathering/index.js
├── src/features/gathering/logic.js
├── src/features/gathering/migrations.js
├── src/features/gathering/mutators.js
├── src/features/gathering/selectors.js
├── src/features/gathering/state.js
├── src/features/gathering/ui/
│   └── gatheringDisplay.js
├── src/features/sideLocations/index.js
├── src/features/sideLocations/logic.js
├── src/features/sideLocations/state.js
├── src/features/agility/index.js
├── src/features/agility/logic.js
├── src/features/agility/mutators.js
├── src/features/agility/selectors.js
├── src/features/agility/state.js
├── src/features/agility/ui/agilityDisplay.js
├── src/features/agility/ui/trainingGame.js
├── src/features/astralTree/index.js
├── src/features/catching/
│   ├── data/
│   │   └── icons.js
│   ├── index.js
│   ├── logic.js
│   ├── mutators.js
│   ├── state.js
│   └── ui/
│       └── catchingDisplay.js
├── src/features/forging/index.js
├── src/features/physique/index.js
├── src/features/alchemy/consumableEffects.js
├── src/features/alchemy/data/pills.js
├── src/features/alchemy/test.js
├── src/features/settings/ui/settingsDisplay.js
├── src/features/tutorial/steps.js
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
- `docs/side-location-discovery.md` – Design for discovering optional side locations during Adventure.

### Shared Modules (`src/shared/`)

#### `state.js` - Root Game State
**Purpose**: Composes feature state slices, handles migrations and persistence
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
    physique: 10, mind: 10, agility: 10, comprehension: 10,
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
  auto: { meditate: true, adventure: false }
}
```

**When to modify**: Add new state properties, modify save structure, add migration logic

#### `mutators.js` and `selectors.js` - Aggregated APIs
Re-export mutators and selectors from individual features to provide a central access layer for cross-feature interactions.

#### `utils/dom.js` - DOM Helpers
Utility functions for querying elements, updating text/fill styles and logging to the on-screen log.

#### `utils/hp.js` - HP Utilities
Contains `initHp()` to create `{ hp, hpMax }` objects from a maximum value.

#### `utils/number.js` - Number Formatting Helpers
Formats large numbers with shorthand suffixes (k, m, b, t).

#### `utils/stats.js` - Stat Utilities
Merges base stats with modifier objects.

#### `src/features/progression/logic.js` - Game Calculations
**Purpose**: Core progression mechanics and calculations
**Key Functions**:
- `qCap()`, `qiRegenPerSec()` - Qi system calculations
- `fCap()`, `foundationGainPerSec()` - Foundation system
- `calculatePlayerCombatAttack()`, `calcArmor()` - Combat calculations
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

#### `src/features/adventure/mutators.js` - Adventure Mutators
Stateful helpers for manipulating adventure progression.
- `startAdventure()` - Create and initialize the `S.adventure` state container.
- `retreatFromCombat()` - Retreat from combat and apply Qi penalty.
- `resetQiOnRetreat()` - Reset Qi to zero when the player dies while retreating.

#### `src/features/adventure/ui/adventureDisplay.js` - Adventure Sidebar Display
**Purpose**: Renders adventure progress and current area in the sidebar.
**When to modify**: Adjust adventure sidebar presentation or add new metrics.

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

#### `game/migrations.js` - Save Migration System
**Purpose**: Handle save data structure changes between versions

#### `src/features/ability/state.js` - Ability State Slice
Tracks ability cooldown timers and pending action queue.

#### `src/features/ability/mutators.js` - Ability Mutators
Validate casts, tick cooldowns, apply ability results, and emit events for UI effects.

#### `src/features/ability/selectors.js` - Ability Selectors
Expose ability slots and cooldown information using inventory data.

#### `src/features/ability/logic.js` - Ability Resolution
Pure computations describing ability effects like Power Slash damage and healing.

#### `src/features/ability/data/abilities.js` - Ability Definitions
Defines metadata for active abilities such as cost and cooldown.

#### `src/features/ability/ui.js` - Ability UI Helpers
Listens for `ABILITY:HEAL` events and displays floating heal numbers.

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

#### `src/features/loot/qualityWeights.js` - Quality Weight Helper
**Purpose**: Rolls a weapon or gear quality based on weighted chances.
**Key Functions**: `rollQualityKey()`, `rollRarity()`.
**When to modify**: Adjust default quality or rarity probabilities or introduce zone-specific distributions.

#### `src/features/loot/data/lootTables.gear.js` - Gear Loot Tables
**Purpose**: Defines starter zone body gear drops and their weights.
**When to modify**: Add or rebalance gear drops for zones.

#### `src/features/loot/data/lootTables.rings.js` - Ring Loot Tables
**Purpose**: Defines ring drops and weights for each zone.
**When to modify**: Adjust ring availability or balance drop rates.

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
  { name: 'Mortal', cap: 100, fcap: 50, baseRegen: 1, armor: 1, power: 1, bt: 0.8 },
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

#### `weaponClasses.js` - Weapon Classes
**Purpose**: Defines high-level weapon classes (e.g., swords, spears) used for shared effects and proficiency.
**When to modify**: Add or rename weapon classes.

### User Interface (`ui/`)

#### `index.js` - Main UI Controller
**Purpose**: UI management, event handling, display updates
**Key Functions**:
- `initUI()` - Initialize UI elements and event listeners
- `updateAll()` - Update all UI displays
- `setText()`, `setFill()` - UI utility functions
- Render functions: `renderBuildings()`, etc.

**UI Update Pattern**:
```javascript
function updateAll() {
  // Update displays
  setText('elementId', value);
  setFill('fillId', ratio);

  // Call specialized render functions
  renderBuildings();
  // etc.
}
```

**When to modify**: Add new UI elements, modify display logic, add event handlers

#### `src/features/progression/ui/realm.js` - Realm UI Components
**Purpose**: Realm-specific UI components and cultivation displays
**When to modify**: Add new realm UI features, modify cultivation interface

#### `src/features/progression/ui/qiOrb.js` - Qi Orb Visual Effects
**Purpose**: Updates the Qi Orb's appearance when foundation approaches its maximum.
**When to modify**: Change Qi Orb styling or foundation threshold behavior.

#### `src/features/progression/ui/cultivationSidebar.js` - Cultivation Activity Tab
**Purpose**: Injects the cultivation activity into the sidebar when the feature is visible.
**When to modify**: Adjust cultivation tab layout or mounting logic.

#### `src/features/inventory/ui/CharacterPanel.js` - Equipment & Inventory Panel
**Purpose**: Single source for rendering equipped items and inventory with actions to equip, use, scrap, filter, and view details.
**Key Functions**: `renderEquipmentPanel()`, `setupEquipmentTab()`.
**When to modify**: Adjust character gear interface or inventory interactions.

#### `src/features/inventory/ui/resourceDisplay.js` - Resource Sidebar Display
**Purpose**: Shows counts of inventory resources in the sidebar.
**When to modify**: Update when adding new resource types or changing sidebar layout.

#### `src/ui/app.js` - Application Shell
**Purpose**: Placeholder root for composing high-level UI modules.
**When to modify**: Implement global UI bootstrap or layout logic.

#### `src/ui/diagnostics.js` - Diagnostics Overlay
**Purpose**: Displays runtime environment flag report and feature visibility inspector. Includes HUD dot and keyboard shortcut.
**When to modify**: Update when adding new diagnostics fields or UI.

#### `src/ui/sidebar.js` - Sidebar Activity Renderer
**Purpose**: Builds the sidebar activity list and progress displays.
**When to modify**: Adjust sidebar activities or their presentation.

#### `src/ui/notifications.js` - Notification Tray
**Purpose**: Manages the sidebar notification tray and overlay, showing up to three notifications and a full list modal.
**When to modify**: Adjust notification display, dismissal behavior, or overlay layout.

#### `src/ui/dev/devQuickMenu.js`
**Purpose:** Tiny top-right Dev button and menu. Uses existing `window.__*` hooks when available, emits `DEV:SET_SEED` for RNG, and exposes a Mind helper to level up the active manual for debugging.

#### `src/ui/dev/balanceTuner.js`
**Purpose:** Optional slider panel for adjusting tunable multipliers at runtime.
**Key Functions:**
- `mountBalanceTuner()` mounts the panel when enabled.
- `ENABLE_BALANCE_TUNER` feature flag toggle.

#### `src/features/inventory/ui/weaponChip.js` - Weapon Chip HUD
**Purpose**: Initializes and updates the weapon display chip in the top HUD.
**When to modify**: Change weapon HUD logic or appearance.

#### `src/features/proficiency/index.js` - Proficiency Feature Registration
**Purpose**: Registers the proficiency slice and hooks into the feature registry.

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
- `getWeaponProficiencyBonuses(state)` – compute damage and speed multipliers for the equipped weapon.

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

#### `src/features/progression/index.js` - Progression Feature Exports
**Purpose**: Re-exports realm UI hooks and mutators for easier consumption.

#### `src/features/progression/logic.js` - Progression Calculations
**Purpose**: Core formulas for cultivation and combat stats.
**Key Functions**: `fCap(state)`, `calculatePlayerCombatAttack(state)`, `breakthroughChance(state)`.

#### `src/features/progression/insight.js` - Insight Gain Tick
**Purpose**: Computes Insight accumulation each tick based on Foundation gain and current activity.
**Key Functions**: `tickInsight(state, dtSec)`.

#### `src/features/progression/data/realms.js` - Cultivation Realms
**Purpose**: Define realm tiers and their properties.

#### `src/features/progression/data/laws.js` - Cultivation Laws
**Purpose**: Define law bonuses and skill trees.

#### `src/features/progression/ui/qiDisplay.js` - Qi and Foundation HUD
**Purpose**: Updates Qi and Foundation bars in the UI.

#### `src/features/progression/ui/lawDisplay.js` - Law Selection UI
**Purpose**: Shows available laws and their details.

#### `src/features/progression/ui/lawsHUD.js` - Active Laws HUD
**Purpose**: Displays learned laws and bonuses in the HUD.

#### `src/features/progression/ui/astralTree.js` - Astral Skill Tree UI
**Purpose**: Renders the astral skill tree overlay, loads `astral_tree.json`, manages node allocation, and applies bonuses.

#### `src/features/progression/data/astral_tree.json` - Astral Tree Layout
**Purpose**: Stores node coordinates and edge connections for the astral skill tree. Used by the UI to render the graph and compute adjacency.
**Key Functions**: n/a

#### `astral-tree-prototype/astral-tree-v3.0.html` - Prototype Tree v3
**Purpose**: Legacy prototype of the astral skill tree layout (version 3.0) used for early design tests.
**Key Functions**: n/a

#### `astral-tree-prototype/astral-tree-v4.html` - Prototype Tree v4
**Purpose**: Updated prototype of the astral skill tree layout (version 4) for layout experimentation.
**Key Functions**: n/a

#### `astral-tree-prototype/template-tree/astral_tree-base-structure.json` - Base Structure Template
**Purpose**: JSON template describing a minimal base structure for astral tree layouts.
**Key Functions**: n/a

#### `astral-tree-prototype/template-tree/astral_tree_pentagon.json` - Pentagon Template
**Purpose**: JSON template providing a pentagon-style layout for astral tree experimentation.
**Key Functions**: n/a

#### `astral-tree-prototype/template-tree/astral_tree-v2.0.json` - v2 Template
**Purpose**: JSON template for an earlier v2 astral tree layout used in experimentation.
**Key Functions**: n/a

#### `astral-tree-prototype/workoround-tree.html` - Workaround Tree Prototype
**Purpose**: Experimental HTML prototype exploring alternate tree rendering workarounds.
**Key Functions**: n/a

### UI Effects (`src/features/combat/ui/`)

#### `fx.js` - SVG Combat Effects
**Purpose**: Utility functions for spawning and animating combat visual effects using SVG.
**Key Functions**: `playSlashArc()`, `playThrustLine()`, `playRingShockwave()`, `playBeam()`, `playChakram()`, `playShieldDome()`, `playSparkBurst()`, `setFxTint()`, `setReduceMotion()`.
**When to modify**: Extend or adjust visual effect primitives.

#### `src/features/combat/ui/floatingText.js` - Floating Combat Text
**Purpose**: Renders animated combat text (damage numbers, misses, critical hits) above HP bars.
**Key Functions**: `showFloatingText()`, `setFloatingTextEnabled()`.
**When to modify**: Change floating combat text behavior or styling.

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

### Start Script (`scripts/start.js`)

**Purpose**: Loads environment variables from `.env` files and boots the local server.
**When to modify**: Adjust startup or environment-loading behavior.

### Env Usage Scan (`scripts/scan-env-usage.js`)

**Purpose**: Prints any direct `process.env` or `import.meta.env` references outside `src/config.js`.
**When to modify**: Update scanning patterns or ignore rules.

### Config (`src/config.js`)

**Purpose**: Centralized environment and feature flag configuration derived from Vercel/Vite envs.
**When to modify**: Change feature flag handling or defaults.

### Changelog (`CHANGELOG.md`)
**Purpose**: Tracks notable changes, additions, and fixes across versions.
**When to modify**: Whenever implementing new features or documenting releases.

## Recent Snapshot

Paths added:

- `src/game/GameController.js` – orchestrator
- `src/shared/events.js`
- `src/shared/saveLoad.js`
- `src/features/index.js` – UI bootstrap
- `src/features/registry.js` – Feature registration hooks
- `src/ui/app.js` – creates the controller, mounts feature UIs and starts the loop
- `src/index.js` – minimal entry that calls `initApp()`
- `docs/ARCHITECTURE.md`
- `docs/To-dos/stats-to-implement.md`
- `src/shared/utils/number.js` - number formatting helper
- `src/features/activity/state.js` – activity state slice
- `src/features/activity/selectors.js` – activity selectors
- `src/features/activity/mutators.js` – activity mutators
- `src/features/activity/ui/activityUI.js` – activity UI helpers
- `src/shared/telemetry.js` - runtime counters for debugging
- `src/shared/tunables.js` - non-persistent balance multipliers
- `src/ui/dev/balanceTuner.js` - optional dev panel for tuning
- `src/features/adventure/ui/mapUI.js` – adventure map UI
- `src/features/automation/logic.js` – automation logic helpers
- `src/features/automation/migrations.js` – automation save migrations
- `src/features/automation/mutators.js` – automation mutators
- `src/features/automation/selectors.js` – automation selectors
- `src/features/automation/state.js` – automation state slice
- `src/features/combat/ui/floatingText.js` – floating combat text renderer

#### `src/game/GameController.js` - Game Orchestrator
**Purpose**: Boots the game, runs the fixed-step loop, emits events and handles simple routing.

#### `src/shared/events.js` - Events Bus
**Purpose**: Tiny pub/sub (`on`, `off`, `emit`) for global game events.

#### `src/shared/saveLoad.js` - Persistence Helpers
**Purpose**: Load and save game state, including debounced autosave.

#### `src/shared/telemetry.js` - Telemetry Utilities
**Purpose**: Tracks lightweight counters and timers for debugging.
**Key Functions**:
- `incCounter(key, by)`
- `getCounter(key)`
- `resetCounters(prefix)`
- `withTimer(name, fn)`
- `snapshotTelemetry()`

#### `src/shared/tunables.js` - Runtime Balance Overrides
**Purpose**: Provides adjustable multipliers for combat and progression without touching saves.
**Key Functions**:
- `getTunable(key, fallback)`
- `setTunable(key, value)`
- `resetTunables()`
- `getAllTunables()`

#### `src/features/index.js` - Feature UI Bootstrap
**Purpose**: Central place to mount all feature user interfaces.

#### `src/features/registry.js` - Feature Registry
**Purpose**: Collects feature `init` and `tick` hooks and exposes helpers to initialise slices and advance ticks.

#### `src/features/devUnlock.js` - Dev Unlock Helpers
**Purpose**: Forces core game systems unlocked when `DEV_UNLOCK_PRESET` is set to `"all"`.

#### `src/ui/app.js` - App Bootstrap
**Purpose**: Creates the controller, mounts feature UIs and debug tools, then starts the game loop.

#### `src/index.js` - Entrypoint
**Purpose**: Minimal entry that calls `initApp()`.

#### `docs/ARCHITECTURE.md` - Architecture Overview
**Purpose**: Documents the controller, events bus and bootstrap pattern.

#### `docs/To-dos/stats-to-implement.md` - Stats Roadmap
**Purpose**: Lists game stats that still need implementation.

#### `src/features/activity/state.js` - Activity State
**Purpose**: Ensures activity flags exist on the root state object.
**Key Functions**: `ensureActivities(state)`.

#### `src/features/activity/selectors.js` - Activity Selectors
**Purpose**: Helpers for reading activity state.
**Key Functions**: `getActiveActivity(state)`, `getSelectedActivity(state)`.

#### `src/features/activity/mutators.js` - Activity Mutators
**Purpose**: Select, start, and stop activities while emitting events. `startActivity` broadcasts `ACTIVITY:START` with the root state and activity name.
**Key Functions**: `selectActivity(state, name)`, `startActivity(state, name)`, `stopActivity(state, name)`.

#### `src/features/activity/ui/activityUI.js` - Activity UI
**Purpose**: Mounts sidebar listeners and refreshes visible activity panels.
**Key Functions**: `mountActivityUI(state)`, `updateActivitySelectors(state)`, `updateCurrentTaskDisplay(state)`.

#### `src/features/adventure/ui/mapUI.js` - Adventure Map UI
**Purpose**: Renders the zone/area selection map overlay.
**Key Functions**: `showMapOverlay()`, `hideMapOverlay()`.

#### `src/features/automation/state.js` - Automation State
**Purpose**: Defines default automation flags and provides `initialState()`.
**Key Exports**: `automationState`, `initialState()`.

#### `src/features/automation/logic.js` - Automation Logic
**Purpose**: Pure helpers for automation calculations.
**Key Functions**: `slice(root)`, `isAnyAutomationEnabled(root)`.

#### `src/features/automation/migrations.js` - Automation Migrations
**Purpose**: Save migrations for automation slice.
**Key Exports**: `migrations` array.

#### `src/features/automation/mutators.js` - Automation Mutators
**Purpose**: Toggles options such as auto-meditate and auto-adventure.
**Key Functions**: `toggleAutoMeditate(value, state)`, `toggleAutoAdventure(value, state)`.

#### `src/features/automation/selectors.js` - Automation Selectors
**Purpose**: Reads automation settings from state.
**Key Functions**: `isAutoMeditate(state)`, `isAutoAdventure(state)`.

### Engine (`src/engine/`)
- `src/engine/combat/stun.js` – Handles stun accumulation, decay, and status application.
- `src/engine/pp.js` – Computes offensive, defensive, and total power points for the player.
- `src/engine/enemyPP.js` – Enemy-focused power helpers mirroring player PP formulas.
- `src/engine/ppHistory.js` – Maintains rolling PP samples for hourly and overall averages.
- `src/engine/ppLog.js` – Logs PP events and supports downloading the log as CSV.

### Shared Library (`src/lib/`)
- `src/lib/index.js` – Root exports for shared helper modules.
- `src/lib/power/ehp.js` – Effective HP calculations (armor, dodge, resistances).
- `src/lib/power/index.js` – Aggregates power-related helpers.
- `src/lib/power/pp.js` – Core power point math and utilities.
- `src/lib/power/pp.test.js` – Unit tests for power point formulas.

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
- `src/features/combat/data/ailments.js` – Ailment definitions and their effects.
- `src/features/combat/ui/combatStats.js` – Displays player and enemy combat statistics.

#### `src/features/combat/data/ailments.js` - Ailment Definitions
**Purpose**: Enumerates poison, burn, chill and other ailments with durations, stack limits and effect callbacks.
**When to modify**: Add new ailments or adjust existing damage-over-time and debuff behaviour.

### Karma Feature (`src/features/karma/`)
- `src/features/karma/state.js` – Stores karma points and purchased bonuses.
- `src/features/karma/logic.js` – Derives combat and regeneration bonuses from karma.
- `src/features/karma/mutators.js` – Modifies karma points and upgrade values.
- `src/features/karma/selectors.js` – Accessors for karma points and bonus values.
- `src/features/karma/ui/karmaDisplay.js` – Displays karma information in the cultivation stats tab.
- `src/features/karma/ui/karmaHUD.js` – Shows karma gain in the sidebar HUD.

### Mind Feature (`src/features/mind/`)
- `src/features/mind/state.js` – Stores mind XP, multipliers, manual progress and puzzle counts.
- `src/features/mind/logic.js` – Calculates XP gains, level thresholds and applies manual or talisman effects.
- `src/features/mind/mutators.js` – Starts/stops reading, crafts talismans, handles puzzles and debug manual level-ups.
- `src/features/mind/selectors.js` – Accessors for current mind stats and progress.
- `src/features/mind/index.js` – Bundles mind exports and event listeners.
- `src/features/mind/data/manuals.js` – Manual definitions with requirements, timers and max levels.
- `src/features/mind/data/talismans.js` – Crafting recipes for talismans.
- `src/features/mind/data/_balance.contract.js` – Balance snapshot for mind-related data.
- `src/features/mind/ui/mindMainTab.js` – Renders summary view for the Mind feature.
- `src/features/mind/ui/mindPuzzlesTab.js` – Displays puzzle progress and multiplier info.
- `src/features/mind/ui/mindReadingTab.js` – Lists manuals and controls reading actions.
- `src/features/mind/ui/mindStatsTab.js` – Shows cumulative manual bonuses.
- `src/features/mind/puzzles/sequenceMemory.js` – Implements the sequence memory puzzle used for mind training.

### Talismans Feature (`src/features/talismans/`)
- `src/features/talismans/data/talismans.js` – Definitions for equipable talismans with utility bonuses.

### Mining Feature (`src/features/mining/`)
- `src/features/mining/state.js` – Tracks mining level, experience, unlocked resources and yields.
- `src/features/mining/logic.js` – Handles mining rates, resource gains and experience progression.
- `src/features/mining/mutators.js` – External wrappers to modify mining state and listeners for `ACTIVITY:START` to apply default values.
- `src/features/mining/selectors.js` – Provides accessors for mining state and derived rates.
- `src/features/mining/ui/miningDisplay.js` – Updates mining activity and sidebar displays.

### Gathering Feature (`src/features/gathering/`)
- `src/features/gathering/index.js` – Gathering feature descriptor.
- `src/features/gathering/state.js` – Tracks gathering level, experience, unlocked resources and yields.
  - `src/features/gathering/logic.js` – Handles resource gathering rates with chances for Spirit Wood and Aromatic Herbs.
- `src/features/gathering/mutators.js` – External wrappers to modify gathering state and listeners for `ACTIVITY:START`.
- `src/features/gathering/selectors.js` – Provides accessors for gathering state and derived rates.
- `src/features/gathering/migrations.js` – Save migrations for gathering slice (currently none).
  - `src/features/gathering/ui/gatheringDisplay.js` – Updates gathering activity and sidebar displays.

### Agility Feature (`src/features/agility/`)
- `src/features/agility/state.js` – Tracks agility training progress and level.
- `src/features/agility/logic.js` – Calculates training effects.
- `src/features/agility/mutators.js` – Starts and ends agility training sessions.
- `src/features/agility/selectors.js` – Accessors for agility state and cursor position.
- `src/features/agility/ui/agilityDisplay.js` – Shows agility stats and start/stop controls.
- `src/features/agility/ui/trainingGame.js` – Mini-game UI for agility training.
- `src/features/agility/index.js` – Agility feature descriptor.

### Catching Feature (`src/features/catching/`)
- `src/features/catching/index.js` – Catching feature descriptor.
- `src/features/catching/state.js` – Tracks caught creatures, hunger, and taming progress.
- `src/features/catching/logic.js` – Handles hunger decay and catch timers.
- `src/features/catching/mutators.js` – Starts catch attempts, consuming nets and scheduling completion.
- `src/features/catching/data/icons.js` – Maps creature names to icon identifiers.
- `src/features/catching/ui/catchingDisplay.js` – UI for selecting locations, catching, and taming creatures.

### Side Locations Feature (`src/features/sideLocations/`)
- `src/features/sideLocations/state.js` – Tracks discovered nodes and discovery cooldown.
- `src/features/sideLocations/logic.js` – Listens for adventure kills to unlock new resource nodes.
- `src/features/sideLocations/index.js` – Side locations feature descriptor.

### Forging Feature (`src/features/forging/`)
- `src/features/forging/state.js` – Tracks forging level, experience, and current forging job.
- `src/features/forging/logic.js` – Calculates tier times, costs, and applies forging results.
- `src/features/forging/mutators.js` – Starts forging jobs and advances progress each tick.
- `src/features/forging/migrations.js` – Ensures forging state exists in saves and initializes defaults.
- `src/features/forging/selectors.js` – Helpers to read forging state.
- `src/features/forging/ui/forgingDisplay.js` – Renders forging panel and sidebar info.

### Physique Feature (`src/features/physique/`)
- `src/features/physique/state.js` – Tracks physique training progress and stamina.
- `src/features/physique/logic.js` – Calculates bonuses from the physique stat such as HP and carry capacity.
- `src/features/physique/mutators.js` – Handles gaining physique experience and stamina changes.
- `src/features/physique/selectors.js` – Accessors for physique levels, experience, stamina, and bonuses.
- `src/features/physique/ui/physiqueDisplay.js` – Renders physique progress and bonuses in the UI.
 - `src/features/physique/ui/trainingGame.js` – UI for the physique training mini-game; logic and state updates live in `logic.js` and `mutators.js`.

### Alchemy Feature
- `src/features/alchemy/index.js` – Registers alchemy hooks.
- `src/features/alchemy/data/recipes.js` – Basic pill recipes with brew times and rewards.
- `src/features/alchemy/data/pills.js` – Metadata for pill lines and classification for inventory.
- `src/features/alchemy/logic.js` – Tick handler that advances brew timers.
- `src/features/alchemy/mutators.js` – Start/complete brews and unlock new recipes.
- `src/features/alchemy/selectors.js` – Accessors for brewing queue and success chance calculations.
- `src/features/alchemy/state.js` – Base alchemy stats including level, XP, and known recipes.
- `src/features/alchemy/ui/alchemyDisplay.js` – UI for managing the alchemy cauldron.
- `src/features/alchemy/ui/pillIcons.js` – Renders active pill timers as icons.
- `src/features/alchemy/consumableEffects.js` – Applies status effects when consuming pills and handles exclusivity.
- `src/features/alchemy/test.js` – Unit tests covering alchemy selectors and mutators.

### Cooking Feature (`src/features/cooking/`)
- `src/features/cooking/state.js` – Cooking level, experience, and success bonus.
- `src/features/cooking/mutators.js` – Manage cooking actions and food slot equipment.
- `src/features/cooking/selectors.js` – Access success bonus and other cooking state.
- `src/features/cooking/logic.js` – Handle cooking and food slot logic, returning data for the UI.
- `src/features/cooking/ui/cookControls.js` – Update cook amount input and food slot counts.
- `src/features/cooking/ui/cookingDisplay.js` – Sidebar display for cooking progress.

### Gear Generation Feature (`src/features/gearGeneration/`)
- `src/features/gearGeneration/logic.js` – Generates gear from base definitions and materials.
- `src/features/gearGeneration/selectors.js` – Rolls zone gear drops using gear loot tables.
- `src/features/gearGeneration/imbuement.js` – Defines imbuement tiers, multipliers, and zone element themes.
- `src/features/gearGeneration/data/gearBases.js` – Base armor definitions (body, head, feet).
- `src/features/gearGeneration/data/gearIcons.js` – Icon mappings for gear slots.
- `src/features/gearGeneration/data/_balance.contract.js` – Balance contract placeholder for gear generation.
- `src/features/gearGeneration/data/modifiers.js` – Modifier definitions used by gear and weapon generation.

### Weapon Generation Feature (`src/features/weaponGeneration/`)
- `src/features/weaponGeneration/index.js` – Registers weapon generation hooks.
- `src/features/weaponGeneration/state.js` – Holds the currently generated weapon.
- `src/features/weaponGeneration/logic.js` – Generates weapons from base types and materials.
- `src/features/weaponGeneration/mutators.js` – Writes generated weapons into state.
- `src/features/weaponGeneration/selectors.js` – Helpers to roll and access generated weapons.
- `src/features/weaponGeneration/data/weaponClasses.js` – Lists shared weapon classes used for proficiency.

### Accessories Feature (`src/features/accessories/`)
- `src/features/accessories/data/rings.js` – Base ring definitions and stats.
- `src/features/accessories/logic.js` – Generates rings and applies minor modifiers.
- `src/features/accessories/selectors.js` – Rolls ring drops using ring loot tables.

### Core Data (`src/data/`)
- `src/data/status.ts` – Global status effect definitions.

### Sect Feature (`src/features/sect/`)
- `src/features/sect/index.js` – Registers sect hooks.
- `src/features/sect/state.js` – Sect buildings and resources.
- `src/features/sect/mutators.js` – Mutators for building and upgrading sect structures.
- `src/features/sect/selectors.js` – Accessors for sect data.
- `src/features/sect/logic.js` – Core sect calculations and mechanics.
- `src/features/sect/data/buildings.js` – Building definitions and costs.
- `src/features/sect/ui/sectScreen.js` – UI for managing the sect.

### Activity Feature (`src/features/activity/`)
- `src/features/activity/state.js` – Ensures the activity flags exist on the root state.
- `src/features/activity/selectors.js` – Helpers to read the active and selected activities.
- `src/features/activity/mutators.js` – Start, stop, or select activities and emit related events.
- `src/features/activity/ui/activityUI.js` – Mounts sidebar listeners and updates visible activity panels.

### Adventure Feature (`src/features/adventure/`)
- `src/features/adventure/ui/mapUI.js` – Displays the area selection map overlay.

### Automation Feature (`src/features/automation/`)
- `src/features/automation/state.js` – Default automation flags and `initialState()` helper.
- `src/features/automation/logic.js` – Pure helpers for automation calculations.
- `src/features/automation/migrations.js` – Save migrations for automation feature.
- `src/features/automation/mutators.js` – Toggles automation options like auto-meditate and auto-adventure.
- `src/features/automation/selectors.js` – Reads automation settings from state.

### Astral Tree Feature (`src/features/astralTree/`)
- `src/features/astralTree/index.js` – Astral Tree feature descriptor controlling nav visibility.

### Library Feature (`src/features/library/`)
- `src/features/library/ui/libraryDisplay.js` – Displays tutorial journal entries in the Library tab.

### Law Feature (`src/features/law/`)
- `src/features/law/index.js` – Law feature descriptor gating law navigation on Qi-refining.

### Feature Migration Files
- `src/features/ability/migrations.js` – Save migrations for ability feature.
- `src/features/adventure/migrations.js` – Save migrations for adventure feature.
- `src/features/alchemy/migrations.js` – Save migrations for alchemy feature.
- `src/features/affixes/migrations.js` – Save migrations for affixes feature.
- `src/features/automation/migrations.js` – Save migrations for automation feature.
- `src/features/combat/migrations.js` – Save migrations for combat feature.
- `src/features/cooking/migrations.js` – Save migrations for cooking feature.
- `src/features/inventory/migrations.js` – Save migrations for inventory and equipment.
- `src/features/karma/migrations.js` – Save migrations for karma feature.
- `src/features/loot/migrations.js` – Save migrations for loot system.
- `src/features/mining/migrations.js` – Save migrations for mining feature.
- `src/features/physique/migrations.js` – Save migrations for physique feature.
- `src/features/proficiency/migrations.js` – Save migrations for weapon proficiencies.
- `src/features/progression/migrations.js` – Save migrations for core progression stats.
- `src/features/sect/migrations.js` – Save migrations for sect buildings and bonuses.
- `src/features/weaponGeneration/migrations.js` – Save migrations for weapon generation.

### Feature Descriptors
- `src/features/ability/index.js` – Ability feature descriptor.
- `src/features/activity/index.js` – Activity feature descriptor.
- `src/features/adventure/index.js` – Adventure feature descriptor.
- `src/features/affixes/index.js` – Affixes feature descriptor.
- `src/features/automation/index.js` – Automation feature descriptor.
- `src/features/combat/index.js` – Combat feature descriptor.
- `src/features/cooking/index.js` – Cooking feature descriptor.
- `src/features/inventory/index.js` – Inventory feature descriptor.
- `src/features/karma/index.js` – Karma feature descriptor.
- `src/features/loot/index.js` – Loot feature descriptor.
- `src/features/mining/index.js` – Mining feature descriptor.
- `src/features/physique/index.js` – Physique feature descriptor.
- `src/features/alchemy/index.js` – Alchemy feature descriptor.
- `src/features/proficiency/index.js` – Proficiency feature descriptor.
- `src/features/progression/index.js` – Progression feature descriptor.
- `src/features/sect/index.js` – Sect feature descriptor.
- `src/features/weaponGeneration/index.js` – Weapon generation feature descriptor.
- `src/features/agility/index.js` – Agility feature descriptor.
- `src/features/sideLocations/index.js` – Side locations feature descriptor.
 - `src/features/gathering/index.js` – Gathering feature descriptor.
 - `src/features/forging/index.js` – Forging feature descriptor.
 - `src/features/catching/index.js` – Catching feature descriptor.
 - `src/features/mind/index.js` – Mind feature descriptor.
- `src/features/astralTree/index.js` – Astral Tree feature descriptor.
- `src/features/law/index.js` – Law feature descriptor.

### Settings Feature (`src/features/settings/`)
- `src/features/settings/ui/settingsDisplay.js` – Handles Settings tab navigation and displays session statistics.

## Tutorial Feature

- `docs/tutorial.md` – explains the tutorial flow and reset options.
- `src/features/tutorial/state.js` – stores tutorial step and completion flag.
- `src/features/tutorial/logic.js` – evaluates player actions and advances steps.
- `src/ui/tutorialBox.js` – displays on-screen guidance during the tutorial.
- `src/ui/tutorialPopups.js` – shows contextual tutorial pop ups when actions are performed.
- `src/ui/weaponSelectOverlay.js` – overlay to choose a starting weapon after unlocking Adventure.
- `src/features/tutorial/steps.js` – Step definitions and triggers for tutorial progression.
