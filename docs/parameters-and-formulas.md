# Parameters and Formulas Reference

## Base Stats
- **HP**: 100
- **Qi Shield**: 0
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
| Physique | +3 HP, +1 carry capacity |
| Mind | +1% Qi Shield refill efficiency, +6% Qi Shield capacity |
| Agility | +2% dodge chance |

## Physique-Derived Bonuses
- **HP**: `Physique * 3` additional maximum HP.
- **Carry Capacity**: `Physique` extra units of carrying capacity.

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

## Qi Shield
- Absorbs damage before HP and does not regenerate during combat.
- Max Shield: `baseShield × (1 + Mind × 0.06)`.
- Refill cost per shield point: `cost = 2 / (1 + Mind × 0.01)`, floored to 25% of base.
- Refill occurs after encounters or periodically out of combat, consuming Qi.

## Attack Damage Calculation
1. **Weapon base** – start with the weapon's base damage for each type (physical, fire, etc.).
2. **Per-type multipliers** – for each damage type multiply by:
   - weapon mods
   - type multipliers from stats or effects
   - weapon-class bonuses
3. **Sum** the adjusted damage of all types.
4. **Global multipliers** – apply global damage bonuses (proficiency, buffs, attack speed, etc.).
5. **Armor/resists** – apply the target's armor or resistance for each damage type.

### Example
Weapon deals 100 physical and 50 fire base damage. It has +20% physical and +50% fire mods, +10% physical and +25% fire type multipliers, a sword bonus of +15% physical, a +30% global buff, and the target has 25% physical resist and 10% fire resist.

- **Per-type**: `physical = 100 × 1.20 × 1.10 × 1.15 = 151.8`; `fire = 50 × 1.50 × 1.25 = 93.75`
- **Sum**: `151.8 + 93.75 = 245.55`
- **Global**: `245.55 × 1.30 = 319.215`
- **After resists**: `physical = 151.8 × 1.30 × (1 - 0.25) ≈ 148.0`; `fire = 93.75 × 1.30 × (1 - 0.10) ≈ 109.7`
- **Final total**: `148.0 + 109.7 ≈ 257.7 damage`

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
