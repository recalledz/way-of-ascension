# 🤖 AI Assistant Verification Protocol

**🚨 MANDATORY ENFORCEMENT: Every AI assistant MUST run validation scripts before ANY changes. 🚨**

**AUTOMATED ENFORCEMENT ACTIVE:** This protocol is now automatically enforced via validation scripts.

## 1. MANDATORY ENFORCEMENT COMMANDS

**EVERY AI ASSISTANT MUST RUN THESE COMMANDS BEFORE ANY CHANGES:**

```bash
# Step 1: Run mandatory validation (BLOCKS changes if failed)
node scripts/validate-structure.js

# Step 2: If validation fails, auto-update documentation
node scripts/validate-structure.js --auto-update

# Step 3: Re-run validation to confirm fix
node scripts/validate-structure.js
```

**🚫 AI CHANGES ARE AUTOMATICALLY BLOCKED UNTIL VALIDATION PASSES 🚫**

## 2. Structure Verification Protocol

**Before making ANY changes to the codebase:**

1. **Run validation script** - `node scripts/validate-structure.js`
2. **Read current project-structure.md** to understand the project layout
3. **Verify file locations** match the documented structure
4. **Update project-structure.md** if discrepancies are found

## 2. Automated Verification Checklist

**Run these commands to verify structure:**

```bash
# Check if all documented files exist
find . -name "*.js" -o -name "*.md" -o -name "*.html" -o -name "*.css" | sort

# List directory structure
tree -I 'node_modules|.git' -a

# Check for new files not in documentation
ls -la src/game/ src/data/ data/ ui/ docs/
```

## 3. When to Update project-structure.md

**ALWAYS update when:**
- ✅ Adding new files or directories
- ✅ Moving/renaming existing files
- ✅ Changing file purposes or responsibilities
- ✅ Adding new game systems or features
- ✅ Modifying the state structure significantly
- ✅ Creating new documentation files

## 4. Update Process

**Step-by-step process:**

1. **Detect Changes**: Use `list_dir` and `find_by_name` tools to scan structure
2. **Compare**: Check against current project-structure.md content
3. **Document**: Update the file tree and descriptions
4. **Verify**: Ensure all new files have purpose descriptions

## 5. Required Documentation for New Files

**Every new file MUST include:**
- **Purpose**: What the file does
- **Key Functions**: Main exports/functions (for .js files)
- **When to modify**: Guidelines for future changes
- **Dependencies**: What it imports/requires

## 6. Structure Validation Commands

**AI assistants should run these verification commands:**

```javascript
// Verify core game files exist
const coreFiles = [
  'src/game/state.js',
  'src/features/progression/logic.js',
  'src/features/adventure/logic.js',
  'ui/index.js',
  'ui/realm.js',
  'index.html',
  'style.css'
];

// Check each file exists and document if missing
coreFiles.forEach(file => {
  // Use Read tool to verify file exists
  // Update project-structure.md if file is missing or new
});
```

## 7. Mandatory Pre-Change Verification

**Before ANY code modification:**

```markdown
1. [ ] Read docs/project-structure.md
2. [ ] Verify current file structure with list_dir
3. [ ] Check if changes will affect documented structure
4. [ ] Update documentation BEFORE making changes
5. [ ] Verify all new files are documented
```

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
2. **Logic**: Add calculation functions to `src/features/progression/logic.js`
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
1. Add to `src/features/progression/data/laws.js`
2. Define skill tree structure
3. Add bonus calculation logic
4. Add UI rendering for skill trees

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

- **New calculations**: `src/features/progression/logic.js`
- **New state properties**: `src/game/state.js` in `defaultState()`
- **New UI elements**: `ui/index.js` in appropriate render functions
- **New game data**: `src/features/progression/data/` in appropriate files
- **New activities**: Activity logic in tick system, UI in activity cards
- **New buildings**: SECT_BUILDINGS configuration in `ui/index.js`
- **Save migrations**: `src/game/migrations.js`
- **Event handlers**: `ui/index.js` in `initUI()` function

## 8. Documentation Standards

**File descriptions must include:**

```markdown
#### `filename.js` - Brief Description
**Purpose**: What this file does
**Key Functions**: 
- `functionName()` - What it does
- `anotherFunction()` - What it does
**Dependencies**: What it imports
**When to modify**: When to change this file
**Size**: Approximate file size if >10KB
```

## 9. Error Prevention

**Common mistakes to avoid:**
- ❌ Creating files without updating documentation
- ❌ Moving files without updating paths in project-structure.md
- ❌ Adding new directories without documenting their purpose
- ❌ Changing file responsibilities without updating descriptions

## 10. Verification Script Template

**AI assistants should use this pattern:**

```javascript
// 1. Check current structure
const currentStructure = await scanProjectStructure();

// 2. Compare with documented structure  
const documentedStructure = await readDocStructure();

// 3. Find discrepancies
const newFiles = findNewFiles(currentStructure, documentedStructure);
const missingFiles = findMissingFiles(currentStructure, documentedStructure);

// 4. Update documentation
if (newFiles.length > 0 || missingFiles.length > 0) {
  await updateDocStructure(newFiles, missingFiles);
}
```

## 11. Integration with Memory System

**AI assistants should:**
- Create memories for significant structural changes
- Reference project-structure.md in memory creation
- Update memories when file purposes change
- Use memories to maintain consistency across conversations

---

## 🔄 Continuous Maintenance Protocol

**This document MUST be updated whenever:**
- New files are added to the project
- Existing files are moved or renamed  
- File purposes or responsibilities change
- New directories are created
- Dependencies between files change

**Failure to maintain this documentation will result in:**
- Inconsistent code organization
- Difficulty for future AI assistants to understand the project
- Potential breaking changes due to misunderstanding file purposes
- Loss of project knowledge and context

---

## 📋 VERIFICATION CHECKLIST FOR AI ASSISTANTS

**Before completing any task:**
- [ ] Structure verified against project-structure.md
- [ ] New files documented with purpose and functions
- [ ] File tree updated if changes made
- [ ] Dependencies and relationships documented
- [ ] File size estimates updated for large files
- [ ] Integration points with existing systems noted

---

## 💻 Runtime and Browser Verification

**After implementing changes, AI assistants MUST perform runtime verification:**

1.  **Launch the Game**: Start the local development server if it's not already running.
2.  **Open Browser Preview**: Use the `browser_preview` tool to open a browser window for the game.
3.  **Check for Console Errors**:
    *   Open the developer console in the browser preview.
    *   Look for any new errors or warnings that appeared after the changes.
    *   Document and fix any errors found.
4.  **Visually Verify UI Changes**:
    *   Confirm that the UI changes are rendered correctly as intended.
    *   Interact with the new UI components to ensure they are functional.
    *   Check for any visual glitches, layout issues, or broken styles.
5.  **Confirm Functionality**:
    *   Test the new feature or fix to ensure it works as expected.
    *   For example, if a button was added, click it and verify the expected action occurs.
    *   Check relevant game state values in the console (`S` object) to confirm they are updated correctly.

---

## 🚨 Critical Reminders

1. **ALWAYS read docs/project-structure.md first**
2. **Use list_dir to verify current structure**
3. **Update documentation BEFORE making changes**
4. **Document every new file with complete information**
5. **Create memories for structural changes**
6. **Follow the verification checklist**

This protocol ensures consistent project organization and knowledge preservation across all AI interactions.
