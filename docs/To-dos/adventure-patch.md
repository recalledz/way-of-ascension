
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




