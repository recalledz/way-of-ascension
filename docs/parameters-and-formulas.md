# Parameters and Formulas Reference

## Base Stats
- **HP**: 100
- **Base Attack**: 5
- **Base Defense**: 2
- **Starting Stats**:

| Stat | Default |
| ---- | ------- |
| Physique | 10 |
| Mind | 10 |
| Agility | 10 |
| Dexterity | 10 |
| Comprehension | 10 |
| Critical Chance | 5% |
| Attack Speed | 1.0× |
| Cooldown Reduction | 0% |
| Adventure Speed | 1.0× |

## Attribute Effects
All attribute levels grant **+1% talent**.

| Attribute | Bonus per Level |
| --- | --- |
| Physique | +5 HP, +1 carry capacity |
| Mind | +6% energy shield |
| Agility | +2% dodge chance |

## Cultivation Stats
- **Qi**: 100
- **Qi Regeneration**: 1 per second
- **Talent Multiplier**: 1.0
- **Foundation Multiplier**: 1.0
- **Pill Effect Multiplier**: 1.0
- **Building Multiplier**: 1.0

### Foundation Gain
`foundationGainPerSec = qiRegenPerSec * 0.8 * talent * (1 + (Comprehension - 10) * 0.05) * foundationMult * lawMult * buildingMult * pillMult`

### Talent and Comprehension
- **Talent** acts as a direct multiplier on cultivation progress. Higher Talent means proportionally faster foundation gain.
- **Comprehension** boosts cultivation efficiency and learning speed. Each point above 10 adds +5% foundation gain via `(1 + (Comprehension - 10) * 0.05)` and grants +4% learning speed.

## Attack Damage Calculation
1. `baseDamage = random(min, max) * attackRate`
2. `scale = physiqueMultiplier * Physique + agilityMultiplier * Agility + mindMultiplier * Mind`
3. `damage = baseDamage * (1 + scale) * proficiencyBonus`
4. `damage = round(damage * weaponDamageMultiplier)` (if the weapon defines `damageMultiplier`)
5. `finalDamage = damage * (1 - targetResist[element])`

## Skill XP Requirements
All skills start with `expMax = 100`.

| Skill | Multiplier | Formula |
| ----- | ---------- | ------- |
| Physique | 1.4× | `expMax = floor(expMax * 1.4)` |
| Mining | 1.3× | `expMax = floor(expMax * 1.3)` |
| Cooking | 1.2× | `expMax = floor(expMax * 1.2)` |

## Activity Starting Stats

- **Physique**: level 1, `expMax` 100, stamina 100/100
- **Mining**: level 1, `expMax` 100, starts with `stones` unlocked
- **Cooking**: level 1, `expMax` 100
- **Adventure**: zone 0 area 0, progress 0/100
