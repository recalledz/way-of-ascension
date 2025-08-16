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
├── index.html                    # Main HTML file with game UI
├── style.css                     # Global styles and CSS
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Dependency lock file
├── eslint.config.mjs             # ESLint configuration
├── README.md                     # Project documentation
├── .git/                         # Git repository data
├── .windsurf/                    # Windsurf IDE configuration
│   └── rules/
│       └── way-of-ascension.md   # Project-specific rules
├── browser-tools-mcp/            # Browser tools MCP server
│   ├── browser-tools-mcp/        # MCP server implementation
│   ├── browser-tools-server/     # Server components
│   ├── chrome-extension/         # Chrome extension files
│   └── docs/                     # MCP documentation
├── node_modules/                 # NPM dependencies (auto-generated)
├── data/                         # Static game data
│   ├── laws.js                   # Law definitions and bonuses
│   ├── realms.js                 # Realm progression data
│   ├── enemies.js                # Enemy data for adventure zones
│   └── zones.js                  # Zone/area data structure with progressive unlock system
├── src/                          # Core game logic
│   ├── game/                     # Game systems
│   │   ├── state.js              # Game state management & save/load
│   │   ├── engine.js             # Core calculations & formulas
│   │   ├── combat.js             # Combat system mechanics
│   │   ├── adventure.js          # Adventure system with areas/bosses
│   │   ├── affixes.js            # Enemy affixes and modifiers
│   │   ├── utils.js              # Utility functions
│   │   ├── helpers.js            # Helper functions
│   │   ├── migrations.js         # Save data migration system
│   │   └── systems/              # Specialized game systems
│   │       └── weapons.js        # Weapon system implementation
│   └── data/                     # Dynamic game data
│       ├── lootTables.js         # Loot generation tables
│       ├── status.js             # Status effects definitions
│       └── weapons.js            # Weapon definitions & stats
├── ui/                           # User interface
│   ├── index.js                  # Main UI controller (90KB+)
│   ├── realm.js                  # Realm-specific UI components
│   └── dom.js                    # DOM utility functions
└── docs/                         # Documentation
    ├── project-structure.md      # This file - project structure
    ├── ai-verification-protocol.md # AI assistant verification guidelines
    ├── adventure-patch.md        # Adventure system expansion plans
    ├── combo-system.md           # Combat combo system design
    ├── cultivation-ui-style.md   # UI styling guidelines
    ├── weapons-guidlines.md      # Weapon system design guidelines
    └── To-dos/                   # Task-specific documentation
        ├── affixes-expansion.md  # Affix system expansion plans
        ├── boss-specific-affixes.md # Boss ability specifications
        └── enemy-weakness.md     # Enemy weakness system
```

## File Responsibilities

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
