# Combat Stats Analysis & Recommendations

## Current Implementation Status

### ✅ **Already Implemented**
- **Critical Chance** - `S.stats.criticalChance` (base 0.05, scales with dexterity)
- **Attack Speed** - `S.stats.attackSpeed` (base 1.0, scales with dexterity)
- **Cooldown Reduction** - `S.stats.cooldownReduction` (scales with dexterity)
- **Defense** - `calcDef()` function with physique scaling and realm bonuses
- **Adventure Speed** - `S.stats.adventureSpeed` for exploration speed

### ❌ **Missing from Current Implementation**
- **Accuracy** - Not implemented (all attacks hit)
- **Dodge** - Not implemented (no evasion mechanics)
- **Spell Damage** - Partially implemented as `spellPowerMult` but unused in combat
- **Status Effect Chance** - Not implemented
- **Status Effect Resistance** - Not implemented
- **Casting Speed** - Not implemented
- **Qi Cost Reduction** - Not implemented

## Recommended Combat Stats Expansion

### **Priority 1: Core Combat Mechanics**

**Accuracy vs Dodge System:**
```javascript
// Add to S.stats in state.js
accuracy: 0.95,      // Base 95% hit chance
dodge: 0.05,         // Base 5% dodge chance (agility-based)

// Combat calculation
hitChance = Math.max(0.05, playerAccuracy - enemyDodge);
```

**Spell Power Integration:**
```javascript
// Already exists as spellPowerMult in getStatEffects()
// Needs integration with combat system for elemental abilities
spellDamage: 1.0,    // Base spell damage multiplier
```

### **Priority 2: Status Effects Framework**

**Status Effect Stats:**
```javascript
statusEffectChance: 0.0,     // Bonus to proc chance
statusEffectResistance: 0.0, // Reduction to incoming effects
statusEffectDuration: 1.0,   // Duration multiplier
```

**Implementation Pattern:**
- Weapon/ability-based status effects (poison, burn, freeze)
- Mind attribute affects status effect potency
- Physique affects status effect resistance

### **Priority 3: Advanced Combat Stats**

**Qi Efficiency:**
```javascript
qiCostReduction: 0.0,  // Percentage reduction in ability costs
castingSpeed: 1.0,     // Speed multiplier for channeled abilities
```

**Critical Hit System Enhancement:**
```javascript
criticalDamage: 1.5,   // Base crit damage multiplier (currently missing)
```

## Integration with Existing Systems

### **Attribute Scaling Recommendations**

**Physique:**
- Physical damage: ✅ Implemented (5% per point)
- Physical defense: ✅ Implemented (3% per point)
- Status effect resistance: ❌ **Add this**
- HP scaling: ❌ **Consider adding**

**Mind:**
- Spell damage: ✅ Implemented (6% per point)
- Status effect potency: ❌ **Add this**
- Qi cost reduction: ❌ **Add this**
- Casting speed: ❌ **Add this**

**Dexterity:**
- Attack speed: ✅ Implemented (4% per point)
- Critical chance: ✅ Implemented (0.5% per point)
- Dodge chance: ❌ **Add this**
- Accuracy: ❌ **Add this**

**Comprehension:**
- Foundation gain: ✅ Implemented (5% per point)
- Learning speed: ✅ Implemented (4% per point)
- Status effect duration reduction: ❌ **Consider adding**

## Implementation Priority

### **Phase 1: Essential Combat**
1. **Accuracy/Dodge system** - Core hit/miss mechanics
2. **Critical damage multiplier** - Complete the crit system
3. **Spell damage integration** - Use existing spellPowerMult in combat

### **Phase 2: Status Effects**
1. **Status effect framework** - Base system for buffs/debuffs
2. **Status chance/resistance stats** - Player control over effects
3. **Weapon-based status effects** - Poison daggers, burning swords, etc.

### **Phase 3: Advanced Features**
1. **Qi cost reduction** - Ability efficiency
2. **Casting speed** - Channeled ability mechanics
3. **Enhanced attribute scaling** - HP from physique, etc.

## Balance Considerations

**Stat Scaling Guidelines:**
- Keep base values meaningful (don't require high stats to function)
- Diminishing returns on extreme stat investment
- Maintain attribute diversity (no single "best" stat)
- Consider realm progression impact on stat effectiveness

**Combat Pacing:**
- Accuracy/dodge should enhance strategy, not create frustration
- Status effects should be tactical, not overwhelming
- Critical hits should feel impactful but not dominate damage

## Current Strengths to Preserve

The existing system has solid foundations:
- **Attribute-based scaling** works well
- **Realm progression integration** is smooth  
- **Law bonuses system** provides good customization
- **Weapon proficiency system** adds depth
- **Building bonuses** create meaningful progression choices

## Comparison with Original Documentation

The original `combat-stats.md` listed these stats:
- **Accuracy** ❌ Missing
- **Dodge** ❌ Missing  
- **Defense** ✅ Implemented
- **Spell Damage** ⚠️ Partially implemented
- **Status Effect Chance** ❌ Missing
- **Status Effect Resistance** ❌ Missing
- **Cooldown Reduction** ✅ Implemented
- **Casting Speed** ❌ Missing
- **Crit Chance & Crit Damage** ⚠️ Chance implemented, damage missing
- **Qi Cost Reduction** ❌ Missing

**Recommendation:** Update the original documentation to reflect current implementation status and provide a roadmap for missing features.
