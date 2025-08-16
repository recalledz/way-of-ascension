# Way of Ascension - Document Structure & AI Guidelines

This document outlines the project structure and coding conventions for the Way of Ascension cultivation game. **AI assistants must update this document when making structural changes.**

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
│   └── enemies.js                # Enemy data for adventure zones
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
    ├── doc-structure.md          # This file - project structure
    ├── adventure-patch.md        # Adventure system expansion plans
    ├── combo-system.md           # Combat combo system design
    ├── cultivation-ui-style.md   # UI styling guidelines
    └── weapons-guidlines.md      # Weapon system design guidelines
├── eslint.config.mjs      # Linting configuration
└── README.md              # Project documentation
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

#### `helpers.js` - Utility Functions
**Purpose**: Shared utility functions
**When to modify**: Add reusable helper functions

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
**Structure**:
```javascript
export const LAWS = {
  sword: {
    name: 'Sword Law',
    desc: 'Description',
    icon: '⚔️',
    unlockReq: { realm: 2, stage: 1 },
    bonuses: { atk: 1.2, critChance: 0.1 },
    tree: { /* skill tree */ }
  }
};
```
**When to modify**: Add new laws, modify skill trees, adjust bonuses

#### `enemies.js` - Enemy Data
**Purpose**: Define enemies for combat and adventure systems
**When to modify**: Add new enemies, adjust combat balance

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

## Code Patterns and Conventions

### State Management
- Global state object `S` imported from `state.js`
- All state changes should go through the global `S` object
- Call `save()` after significant state changes
- Use `defaultState()` pattern for new state properties

### Activity System
- Only one activity can be active at a time via `S.activities`
- Each activity has its own data container in state
- Activities are controlled by boolean flags in `S.activities`
- Foundation gain happens in `tick()` when `S.activities.cultivation` is true

### UI Updates
- Use `updateAll()` to refresh entire UI
- Use `setText(id, value)` and `setFill(id, ratio)` for updates
- Specialized render functions for complex UI sections
- Event listeners attached in `initUI()`

### Calculation Functions
- Pure functions that take state as input
- Return calculated values without side effects
- Handle missing state properties gracefully with defaults
- Use consistent naming: `calcX()`, `getXBonuses()`, `xPerSec()`

### Data Structure
- Configuration data in separate files under `data/`
- Use consistent object structures across similar systems
- Include unlock requirements, costs, and effects
- Support for scaling costs and progressive unlocks

### Save System
- Version-based migration system
- Increment `SAVE_VERSION` when changing save structure
- Add migration logic in `runMigrations()`
- Graceful handling of missing or corrupted saves

## Adding New Features

### New Game Systems
1. **State**: Add state properties to `defaultState()` in `state.js`
2. **Logic**: Add calculation functions to `engine.js`
3. **UI**: Add render functions and event handlers to `ui/index.js`
4. **Data**: Add configuration files to `data/` if needed
5. **Migration**: Update save version and add migration if needed

### New Activities
1. Add activity flag to `S.activities` in `defaultState()`
2. Add activity data container to state
3. Add activity logic to tick system
4. Add UI elements and event handlers
5. Add activity card to HTML structure

### New Resources/Currencies
1. Add to state in `defaultState()`
2. Add display elements to UI
3. Add to resource calculation functions
4. Add to save/load system
5. Add icons and formatting

### New Buildings/Upgrades
1. Add to building configuration (likely in `ui/index.js` SECT_BUILDINGS)
2. Add unlock requirements and effects
3. Add to building bonus calculation system
4. Add to building render system

### New Laws/Skills
1. Add to `data/laws.js`
2. Define skill tree structure
3. Add bonus calculation logic
4. Add UI rendering for skill trees

## Memory Integration Notes

Based on the provided memory, key implementation details for breathing/meditation features:
- Foundation gained via `foundationGainPerSec()` in `tick()` function
- Activities system: `S.activities.cultivation` boolean controls active cultivation
- UI structure: Single-file build, tabs system, `updateAll()` for UI updates
- Save/load: `save()` and `load()` functions with localStorage
- Logging: `log()` function for game events
- Need to hook exhale events into existing tick system for save/load compatibility

## Best Practices

1. **Consistency**: Follow existing patterns and naming conventions
2. **State Management**: Always use the global state object `S`
3. **UI Updates**: Use centralized update functions
4. **Error Handling**: Handle missing state properties gracefully
5. **Performance**: Avoid expensive calculations in render loops
6. **Modularity**: Keep related functionality together
7. **Documentation**: Comment complex calculations and game mechanics
8. **Testing**: Test save/load functionality when modifying state
9. **Migration**: Always provide migration path for save data changes
10. **Balance**: Consider game balance implications of new features

## Common Locations for Code

- **New calculations**: `src/game/engine.js`
- **New state properties**: `src/game/state.js` in `defaultState()`
- **New UI elements**: `ui/index.js` in appropriate render functions
- **New game data**: `data/` directory in appropriate files
- **New activities**: Activity logic in tick system, UI in activity cards
- **New buildings**: SECT_BUILDINGS configuration in `ui/index.js`
- **Save migrations**: `src/game/migrations.js`
- **Event handlers**: `ui/index.js` in `initUI()` function

This structure ensures maintainable, consistent code that integrates well with the existing game systems.
