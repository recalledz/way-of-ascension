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
├── data/
│   ├── enemies.js
│   ├── laws.js
│   ├── realms.js
│   └── zones.js
├── docs/
│   ├── To-dos/
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
│   │   ├── status-effects.md
│   │   ├── ui-improvements.md
│   │   └── weapons-guidlines.md
│   ├── ai-verification-protocol.md
│   ├── cultivation-ui-style.md
│   ├── proficiency.md
│   └── project-structure.md
├── node_modules/
├── scripts/
│   ├── test-node.js
│   └── validate-structure.js
├── src/
│   ├── data/
│   │   ├── lootTables.js
│   │   ├── status.js
│   │   ├── statusesByElement.js
│   │   └── weapons.js
│   ├── game/
│   │   ├── combat/
│   │   │   ├── attack.js
│   │   │   └── statusEngine.js
│   │   ├── systems/
│   │   │   ├── inventory.js
│   │   │   ├── loot.js
│   │   │   ├── proficiency.js
│   │   │   ├── sessionLoot.js
│   │   │   └── weapons.js
│   │   ├── adventure.js
│   │   ├── affixes.js
│   │   ├── combat.js
│   │   ├── engine.js
│   │   ├── helpers.js
│   │   ├── migrations.js
│   │   ├── state.js
│   │   └── utils.js
│   └── ui/
│       ├── fx/
│       │   └── fx.js
│       └── panels/
│           ├── CharacterPanel.js
│           └── EquipmentPanel.js
├── ui/
│   ├── components/
│   │   └── progressBar.js
│   ├── dom.js
│   ├── index.js
│   ├── panels/
│   │   └── equipment.js
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
- `To-dos/ui-improvements.md` – Planned UI improvements and enhancements.

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

#### `engine.js` - Game Calculations
**Purpose**: Core game mechanics and calculations
**Key Functions**:
- `qCap()`, `qiRegenPerSec()` - Qi system calculations
- `fCap()`, `foundationGainPerSec()` - Foundation system
- `calcAtk()`, `calcDef()` - Combat calculations
- `getLawBonuses()` - Law system bonuses
- `getStatEffects()` - Stat system effects

**When to modify**: Add new calculation functions, modify existing formulas, add bonus systems

#### `adventure.js` - Adventure System
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
- `showTooltip()`, `hideTooltip()` - Progress segment tooltips
- `selectAreaById()` - Area selection and navigation

**Dependencies**: `data/zones.js` for zone/area data structure
**When to modify**: Add new zones/areas, modify combat mechanics, adjust boss system, enhance map UI

#### `migrations.js` - Save Migration System
**Purpose**: Handle save data structure changes between versions
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

#### `systems/loot.js` - Loot Rolling Utilities
**Purpose**: Provides weighted random item selection based on zone loot tables.
**Key Functions**: `rollLoot()`, `toLootTableKey()`.
**When to modify**: Adjust loot algorithms or add new drop behaviors.

#### `systems/inventory.js` - Inventory Management
**Purpose**: Adds, removes, and equips items in the player's inventory and equipment slots.
**Key Functions**: `addToInventory()`, `removeFromInventory()`, `equipItem()`, `unequip()`.
**When to modify**: Expand inventory features or adjust equip logic.

#### `systems/sessionLoot.js` - Session Loot Buffer
**Purpose**: Temporarily stores loot until claimed or forfeited after a session.
**Key Functions**: `addSessionLoot()`, `claimSessionLoot()`, `forfeitSessionLoot()`.
**When to modify**: Change how loot is staged or distributed post-combat.

### Data Configuration (`data/`)

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

#### `enemies.js` - Enemy Data
**Purpose**: Define enemies for combat and adventure systems
**When to modify**: Add new enemies, adjust combat balance

#### `zones.js` - Zone/Area Data Structure
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

#### `panels/equipment.js` - Equipment Panel UI
**Purpose**: Renders the player's inventory of weapons and armor in the equipment panel. Allows equipping weapons.
**Key Functions**:
- `renderEquipmentPanel()`: Main function to draw the weapon and armor lists.
- `createWeaponElement()`: Creates the DOM element for a single weapon.
- `createArmorElement()`: Creates the DOM element for a single piece of armor.
**Dependencies**: `state.js`, `data/weapons.js`, `dom.js`
**When to modify**: When changing how equipment is displayed or interacted with in the UI.

#### `panels/equipment.js` - Equipment Panel
**Purpose**: Handles rendering and interaction for the player's equipment inventory.
**When to modify**: Add new equipment slots, change equipment UI behavior.

#### `panels/EquipmentPanel.js` - Weapon Inventory Panel
**Purpose**: Displays weapons, allowing equip, scrap, and detail actions.
**Key Functions**: `equipWeapon()`, `renderEquipmentPanel()`.
**When to modify**: Adjust weapon handling UI or extend equipment features.

#### `panels/CharacterPanel.js` - Character Equipment Panel
**Purpose**: Shows equipped items and inventory with actions to equip, use, scrap, or filter gear.
**Key Functions**: `renderCharacterPanel()`, `setupCharacterTab()`.
**When to modify**: Modify character gear interface or inventory interactions.

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
