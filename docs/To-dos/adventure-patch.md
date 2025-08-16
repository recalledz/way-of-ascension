
doc to-do implementation for adventure patch
---

## **1. Status Effects (Elemental + Debuffs)**

We tie each effect to **damage type** + **secondary gameplay impact**:

| Status                       | Source                          | Effect                                                                  | Scaling / Stacking                                        |
| ---------------------------- | ------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| **Poison (Wood)**            | Nunchaku, certain manuals       | DoT: X% of damage dealt per tick; high max stacks                       | Scales on hit damage; up to 20 stacks; refreshes duration |
| **Enfeeble (Dark Qi / Yin)** | Affix, debuff spells            | Increases Qi cost of skills by 20%, reduces crit chance by 15%          | Duration 5–10s; not stackable                             |
| **Burn (Fire)**              | Sword, wand, scepter            | DoT: % of target’s *max HP* per tick (low %, so best vs high-HP bosses) | Does not stack, refreshes duration                        |
| **Stun (Physical)**          | Hammer, palm, sword crits       | Cancels actions for duration (1–3s)                                     | Short DR (diminishing returns) if reapplied quickly       |
| **Interrupt (Physical)**     | Fist, spear, nunchaku           | Cancels **charging/casting** abilities                                  | Instant effect, no duration                               |
| **Chill (Water)**            | Wand, chakram, spear manuals    | –20% attack/cast speed & +20% cooldowns                                 | Stacks to 5 → Freeze                                      |
| **Freeze (Water)**           | 5 Chill stacks                  | Stun equivalent, + next hit deals 2× dmg                                | Consumes Chill stacks                                     |
| **Entombed (Earth)**         | Hammer, scepter                 | –20% melee damage                                                       | 10s, not stackable                                        |
| **Ionized (Metal)**          | Lightning manuals, chakram crit | Shields take 2× dmg                                                     | 8s duration                                               |

⚖️ **Balance hook**: each element/status gets a **natural counter** (enemies immune or resistant by element). Bosses can have “status thresholds” (e.g. takes 3 stuns → gains temporary stun resist).


---

## **3. Expanded Combat Stats**

New stats interact with both player + enemy:

* **Accuracy** – chance to hit (opposed by Dodge)
* **Dodge** – chance to evade (Agility heavy)
* **Defense** – reduces physical damage (flat/%)
* **Spell Damage** – scales all magical/elemental damage
* **Status Effect Chance** – raises likelihood of proc (e.g. poison 20% → 35%)
* **Status Effect Resistance** – lowers proc chance or duration
* **Cooldown Reduction** – % reduction to ability cooldowns
* **Casting Speed** – lowers cast time for spells/abilities
* **Crit Chance & Crit Damage** – self-explanatory
* **Qi Cost Reduction** – efficiency with abilities

⚖️ These give you **itemization depth** (gear can roll on these) and let different disciples/specs shine.

---

## **4. Equipment & Loot**

* **Tiers**:

  * **Common (Gray)** – weak, no bonus stats.
  * **Uncommon (Green)** – +1 minor stat.
  * **Rare (Blue)** – +2–3 stats, small affix.
  * **Epic (Purple)** – unique affixes (e.g. 15% chance to Freeze).
  * **Legendary (Gold/Red)** – weapon-defining affix (e.g. Chakram ricochets).

* **Drop Locations**:

  * **Basic gear** – mobs in overworld.
  * **Rare/Epic** – elite enemies, sect trials, dungeon bosses.
  * **Legendary** – boss tribulations, unique sect forges.

* **Damage Numbers**:

  * Weapon DPS = `(Base Weapon Power × Quality Multiplier) × (1 + Proficiency%)`
  * Example: Sword (Base 10) + Rare (×1.5) + Proficiency (20%) = 18 DPS.

---

## **5. Crafting / Forging**

* **Materials**: Ore (metal/earth), Herbs (wood/poison), Monster Essences (status), Special Drops (boss).
* **Process**:

  1. Gather mats via disciples’ tasks (mining, hunting, cooking).
  2. Forge at sect forge.
  3. Random roll quality/tier, but player can *temper* with Qi to reroll or boost stats.
* **Interactions**: Forged gear can gain elemental affinity (e.g. Fire-forged sword burns).
* **Upgrading**: Old gear can be refined with new mats, preserving affixes → keeps progression smooth.

---

## **6. Weapon Art & Animations**

* **Differentiate weapons by silhouette + attack rhythm**:

  * Fist → rapid jabs (short arc).
  * Palm → wide flat strikes (pulsing stun wave).
  * Sword → fluid arcs.
  * Spear → thrust with forward lunge.
  * Nunchaku → spinning blur.
  * Chakram → thrown projectile with return arc.
  * Hammer → overhead slam with shockwave.
  * Wand → channel beam / flick.
  * Focus → glowing shield aura.
  * Scepter → heavy swing with elemental burst.

* Animations can be **minimalist flashes/silhouettes** for idle readability (don’t need full character rigs).

---

## **7. Enemy Weaknesses**

Each enemy type should have:

* **Elemental Weakness/Resistance** (fire immune, weak to water).
* **Status Resistances** (bosses resist stun > freeze).
* **Armor Type** (light → weak vs hammer; heavy → weak vs poison).
* **AI Hooks**: Some enemies focus healers, some spam AoE, others kite.

---

## **8. Enemy Abilities**

Boss/elite abilities to make combat dynamic:

* **Charged Slam** (interrupt required).
* **Summon Adds** (waves of small enemies).
* **Shield Phase** (must break with Ionized).
* **Elemental Aura** (standing in it burns/freeze/chills).
* **Tribulation Storm** (massive AoE requiring shield/Qi).

---

## **9. Affix Qi Enemies**

* **Affixes**: “Flaming”, “Toxic”, “Stunning”, “Regenerating” — random extra powers.
* **Drops**: Special **Qi-infused mats**.
* **Use**: Cooked into **food items** that restore Qi or grant temporary buffs (e.g. Fire Pepper Stew → +20% Fire damage for 5m).

---
