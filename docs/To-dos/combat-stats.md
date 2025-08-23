# Combat Stats Implementation Status

## ✅ Implemented Stats

* **Critical Chance** - `S.stats.criticalChance` (base 0.05, scales with dexterity)
* **Attack Speed** - `S.stats.attackSpeed` (base 1.0, scales with dexterity)
* **Cooldown Reduction** - `S.stats.cooldownReduction` (scales with dexterity)
* **Defense** - `calcDef()` function with realm bonuses
* **Adventure Speed** - `S.stats.adventureSpeed` for exploration speed

## 📝 Pending Implementation

### Core Combat Stats
* **Accuracy** - Base 95% hit chance, opposed by target's dodge
* **Dodge** - Base 5% dodge chance, scales with Agility
* **Armor Penetration** - Reduces target's armor effectiveness
* **Armor Shred** - Temporary debuff that reduces target armor

### Status Effects
* **Status Effect Chance** - Increases proc chance for effects
* **Status Effect Resistance** - Reduces incoming effect chance/duration
* **Elemental Resistances** - Specific resistances for different damage types

### Resource Management
* **Qi Cost Reduction** - Reduces Qi cost of abilities
* **Qi Regeneration** - Rate of Qi recovery during combat

### Special Combat Stats
* **Casting Speed** - Reduces cast time for spells/abilities
* **Movement Speed** - Affects positioning and kiting ability
* **Life Steal** - % of damage dealt returned as health

## 🔄 Stat Interactions
- **Accuracy vs Dodge**: `hitChance = Math.max(0.05, attacker.accuracy - target.dodge)`
- **Armor Mitigation**: Physical damage reduction based on defense
- **Status Effects**: Chance to apply based on attacker's stats vs target's resistances

## 📊 Scaling Factors
- Primary attributes (Strength, Dexterity, etc.) affect different stats
- Equipment and manuals provide flat or percentage bonuses
- Some stats have diminishing returns at higher values