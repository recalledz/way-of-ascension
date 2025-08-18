Smart move. Treat “balance” as its own mini‑product with data + pure math, not sprinkled constants. Here’s a setup that scales and stays sane.

1) Folder layout (clean separation)

/src/balance/
  params/
    v1/
      core.json            // universal knobs (global)
      combat.json          // damage, crit, defense, stun, elements
      progression.json     // XP gain, XP req curve, realm scaling
      loot.json            // drop rates, rarity weights
      economy.json         // vendor costs, crafting costs
    presets/
      dev.json             // overrides for faster testing
      beta.json            // public test tuning
      prod.json            // live tuning (minimal deltas)
  formulas/
    index.js               // exports pure functions (no state)
    combat.js              // dmg/mit/crit/element/status math
    progression.js         // xp_gain, xp_req, realm power curve
    loot.js                // rarity rolls, affix tier gates
    economy.js             // costs, refunds, conversions
  schemas/
    params.schema.json     // JSON Schema to validate all params
  CHANGELOG.md             // human log: what changed & why

Rule: params = data only. formulas = pure functions that read params (injected), return numbers, never mutate game state.

2) Load/merge strategy (predictable precedence)

Load v1/*.json → deep‑merge → base config.

Apply environment preset (dev/beta/prod) as overrides (only changed keys).

Cache a single BALANCE object. Expose a helper:

import { getBalance } from '@/balance/loader' // returns frozen BALANCE

Add a seed field in core.json for reproducible RNG in balance sims.


Precedence: core < domain files < environment preset

3) Versioning & safety rails

Version under /params/v1/. Breaking change? Create /v2/, keep /v1/ for migrations/rollbacks.

Validate every boot with JSON Schema (types, ranges, enums). On failure: log key path + reject start in dev; fallback to last‑known‑good in prod.

Clamp helpers in formulas: clamp01, softcap(x,k), ceilToStep(x, step) to avoid runaway numbers.


4) Contract for formulas (pure & documented)

Each formula file exports small, stateless functions that take inputs + BALANCE and return numbers. Examples:

combat.js

dps(attack, stats, BALANCE)

critChance(stats, BALANCE)

mitigation(defense, BALANCE)

elementProcChance(element, isCrit, stats, BALANCE)

stunGainFromHit(damageDealt, targetMaxHP, BALANCE)  ← uses your stun‑bar rules

finalHit(dmgRoll, attacker, defender, context, BALANCE)


progression.js

xpGain(zone, streak, modifiers, BALANCE)

xpReq(level, BALANCE)  ← single source of truth for the curve

realmReq(stage, realm, BALANCE)


loot.js

rollRarity(ilvl, zone, BALANCE)

rollAffixTier(ilvl, material, BALANCE)


economy.js

craftCost(recipeId, qualityTarget, BALANCE)

upgradeCost(tier, BALANCE)


All functions must be deterministic given inputs (stochastic parts get a RNG seeded in context).

5) Parameter design (tidy & minimal)

Keep knobs grouped, named, and unit‑clear.

combat.json (excerpt)

{
  "crit": { "base": 0.05, "perAgility": 0.0008, "multBase": 1.5, "multPerMind": 0.002 },
  "phys": { "armorK": 85, "minDamage": 1 },
  "elements": {
    "baseProc": 0.10,          // 10% default
    "critProc": 1.0,           // 100% on crit
    "resCap": 0.75,
    "penCap": 0.5
  },
  "stun": {
    "barPerDamageOfMaxHP": 100,   // gain = (dmg/maxHP)*this
    "decayPerSecond": 6,
    "durationSec": 1.0
  }
}

progression.json (excerpt)

{
  "xpGain": { "zoneBase": { "peacefulLands": 5, "forestEdge": 9 }, "streakMult": 0.02 },
  "xpReq": { "base": 50, "growth": 1.12, "stepEvery": 10, "stepBonus": 1.06 },
  "realm": { "stageBase": 100, "stageGrowth": 1.25, "failPenalty": 0.12 }
}

loot.json (excerpt)

{
  "rarityWeights": { "common": 70, "uncommon": 22, "rare": 6, "epic": 1.8, "legendary": 0.2 },
  "bossRarityUpgradeChance": 0.2,
  "affixTiersByIlvl": { "T3": [1,10], "T2": [11,20], "T1": [21,999] }
}

6) Live tuning workflow (fast iteration)

Add a balance overlay (dev only): dropdown to switch preset (dev/beta/prod), sliders for a few hot knobs (crit base, element baseProc, stun decay).

Hot‑reload params: re‑validate, rebuild BALANCE, emit an event balance:updated. Game systems read from getBalance() each tick or subscribe to the event.

Telemetry: log histograms to console (dev) for DPM, TTK, stun uptime, XP/hr, drop rarity distribution over N kills.


7) Golden tests (prevent silent regressions)

Add a tiny test harness that runs with seeded RNG:

Combat golden: given (attacker, defender), simulate 10k hits → assert mean DPS, crit rate, proc rates within tolerances.

Progression golden: assert xpReq(1..50) monotonic, check key milestones (e.g., level 10 req within ±10%).

Loot golden: simulate 50k kills → rarity distribution within ±1.5% of target.


Even without a full test framework, dump results and diff JSON snapshots.

8) Decision log (CHANGELOG discipline)

Every param change gets an entry:

## 2025‑08‑11 v1.12
- crit.base 0.04 → 0.05 (+25% early crit feel)
- stun.decayPerSecond 8 → 6 (stun chains less likely)
- xpReq.growth 1.10 → 1.12 (slightly slower mid)
Rationale: early fights felt flat; stun too sticky in swarm; midgame stretching.

9) Governance & knobs hygiene

Prefer few high‑leverage knobs over many micro‑knobs.

All rates are unit‑clear (per second, fraction 0–1, or percent basis).

Enforce sane bounds in schema (e.g., elements.baseProc 0–0.5).

Document each key inline with desc fields if you like.


10) How this plugs into your code today

Replace scattered constants with calls like:

import { getBalance } from '@/balance/loader';
import { finalHit } from '@/balance/formulas/combat';
const B = getBalance();
const result = finalHit(roll, attacker, defender, ctx, B);

Anywhere you need XP, damage, drop rolls—pull from formulas with B injected. No game code should read raw params directly.



---

If you want, I’ll draft:

a ready‑to‑paste params.schema.json (validates shapes, types, bounds),

skeleton formulas/combat.js signatures,

and a tiny dev overlay JSON editor spec so you can hot‑tune in‑game.


