Love that. Let’s split combat styles (Fist, Palm) from equipment so styles drive your core damage and feel, while items like wraps only augment them. Here’s a drop-in plan with code stubs and starter numbers.

1) Add a Style registry

src/data/styles.ts

export type StyleKey = 'fist' | 'palm';
export interface StyleDef {
  key: StyleKey;
  displayName: string;
  // cadence is about feel; damage comes from proficiency + manuals
  cadence: { attackRate: number; combo?: number[] }; // e.g., [0.7, 0.7] = 2-hit flurry, each ×base
  scales: { physique: number; agility: number; mind: number };
  tags: string[]; // ['melee','internal'?]
  statusHooks?: { onHit?: string; onCrit?: string };
  defaultAbilityKey?: string; // shows as signature if no manual overrides
}

export const STYLES: Record<StyleKey, StyleDef> = {
  fist: {
    key: 'fist',
    displayName: 'Iron Fist',
    cadence: { attackRate: 1.0, combo: [1] }, // quick single hits
    scales: { physique: 0.6, agility: 0.25, mind: 0.15 },
    tags: ['melee'],
    statusHooks: { onCrit: 'bruiseMinor' },    // raw damage theme
    defaultAbilityKey: 'boneBreaker',
  },
  palm: {
    key: 'palm',
    displayName: 'Open Palm',
    cadence: { attackRate: 1.2, combo: [0.55, 0.55] }, // 2 light waves
    scales: { physique: 0.2, agility: 0.4, mind: 0.4 },
    tags: ['melee','internal'],
    statusHooks: { onHit: 'staggerMinor', onCrit: 'qiDisruptMinor' },
    defaultAbilityKey: 'flowingPalm',
  },
};

> Keep your weapon registry for swords/spears as-is. Styles are used when no weapon overrides are equipped.




---

2) Damage = Proficiency × Manual, not gear

Create a predictable, style-only base that grows from proficiency and gets flavored by manuals. Items only multiply or add utility.

src/data/proficiencies.ts

export type ProficiencyKey = 'fist' | 'palm' | /* existing */ string;
export interface ProficiencyDef {
  key: ProficiencyKey;
  displayName: string;
  // base style power per level (before attributes/manuals/mods)
  baseAtLevel: (lvl: number) => number; // “stylePower”
  // small always-on bumps for the style
  perLevel?: Partial<{
    critChanceAdd: number;
    statusPotencyMultAdd: number;
  }>;
}

export const PROFICIENCIES: Record<ProficiencyKey, ProficiencyDef> = {
  fist: {
    key: 'fist',
    displayName: 'Fist Arts',
    baseAtLevel: L => 2 + 1.25 * Math.pow(L, 1.08), // starter curve
    perLevel: { critChanceAdd: 0.002 },              // +0.2% crit/level
  },
  palm: {
    key: 'palm',
    displayName: 'Palm Arts',
    baseAtLevel: L => 1.6 + 1.15 * Math.pow(L, 1.1),
    perLevel: { statusPotencyMultAdd: 0.01 },        // +1% ctrl/level
  },
};

Manuals layer: unlock abilities + add themed multipliers.

src/data/manuals.ts

export type ManualKey = 'stoneCrusherFist' | 'flowingPalmManual';
export interface ManualDef {
  key: ManualKey;
  style: StyleKey;
  displayName: string;
  // mastery level is a small integer (0..10) you level by training/reading
  passivesAt: (mastery: number) => {
    styleDamageMult: number;       // affects only this style
    statusPotencyMult?: number;    // Palm disruption control
    critDamageMult?: number;       // Fist brutality
  };
  unlockAbilityKeys?: string[];
}

export const MANUALS: Record<ManualKey, ManualDef> = {
  stoneCrusherFist: {
    key: 'stoneCrusherFist',
    style: 'fist',
    displayName: 'Stone-Crusher Fist',
    passivesAt: m => ({
      styleDamageMult: 0.05 + 0.02 * m,   // 7% at m=1 → 25% at m=10
      critDamageMult:  0.05 + 0.015 * m,
    }),
    unlockAbilityKeys: ['boneBreaker'],   // ensure signature present
  },
  flowingPalmManual: {
    key: 'flowingPalmManual',
    style: 'palm',
    displayName: 'Flowing Palm Manual',
    passivesAt: m => ({
      styleDamageMult: 0.03 + 0.018 * m,  // 4.8% → 21% by m=10
      statusPotencyMult: 0.06 + 0.02 * m, // disruption grows fast
    }),
    unlockAbilityKeys: ['flowingPalm'],
  },
};

Damage pipeline (engine side):

// Given actor with style S, proficiency level PL, manual M (mastery ML), attributes A
const style = STYLES[S];
const prof = PROFICIENCIES[S];
const manual = currentManualForStyle(S); // nullable
const baseStylePower = prof.baseAtLevel(PL);         // ← main driver
const attrMult =
  1 + (style.scales.physique * A.physique +
       style.scales.agility  * A.agility  +
       style.scales.mind     * A.mind) * 0.01;       // 1% per point weight

const manualPassives = manual ? manual.passivesAt(ML) : {styleDamageMult:0};
const gearStyleMult = sumStyleMultipliersFromItems(S, actor.items); // wraps etc.

const styleDamagePerHit =
  baseStylePower * attrMult *
  (1 + (manualPassives.styleDamageMult ?? 0) + gearStyleMult);

Cadence/combos apply after: each hit uses combo multiplier (Palm has 2 hits ×0.55).


---

3) Abilities key off the style, not weapon

Update your ability registry to support requiresStyle.

src/data/abilities.ts

export interface AbilityDef {
  key: string; displayName: string; icon: string;
  costQi: number; cooldownMs: number; castTimeMs: number;
  tags: string[];
  requiresStyle?: StyleKey;        // NEW
  effect: (ctx: Ctx) => Promise<void>;
}

export const ABILITIES = {
  flowingPalm: {
    key: 'flowingPalm',
    displayName: 'Flowing Palm',
    icon: 'game-icons/open-palm',
    costQi: 10, cooldownMs: 6000, castTimeMs: 300,
    tags: ['weapon-skill','internal'],
    requiresStyle: 'palm',
    effect: async (ctx) => {
      const base = ctx.getStyleDamagePerHit('palm');
      for (let i = 0; i < 2; i++) {
        ctx.consumeQi(5);
        await ctx.waitMs(120);
        ctx.scheduleHit({
          damage: 0.65 * base, tags: ['physical','internal'],
          onHit: t => {
            ctx.applyStatus(t, 'staggerMinor', 1);
            ctx.healActor(ctx.caster, 3);
          }
        });
      }
    }
  },
  boneBreaker: {
    key: 'boneBreaker',
    displayName: 'Bone Breaker',
    icon: 'game-icons/knockout',
    costQi: 8, cooldownMs: 5000, castTimeMs: 250,
    tags: ['weapon-skill','physical'],
    requiresStyle: 'fist',
    effect: async (ctx) => {
      const base = ctx.getStyleDamagePerHit('fist');
      ctx.scheduleHit({
        damage: 1.3 * base,
        tags: ['physical'],
        onHit: t => ctx.applyStatus(t, 'fractureMinor', 1),
      });
    }
  },
};


---

4) Items: wraps become style augments, not the style

Add a new slot so gear doesn’t occupy mainhand: slot: 'wraps'. Wraps only boost when the matching style is active.

src/data/items.ts

export interface ItemDef {
  key: string; displayName: string; icon?: string;
  slot: 'wraps' | 'mainhand' | 'offhand' | /* … */;
  tier: number; tags?: string[];
  styleMods?: Partial<{
    appliesWhenStyle: StyleKey;
    styleDamageMultAdd: number;
    statusPotencyMultAdd: number;
    attackRateMultAdd: number;
  }>;
}

export const ITEMS = {
  palmWrapsSimple: {
    key: 'palmWrapsSimple',
    displayName: 'Palm Wraps',
    slot: 'wraps',
    tier: 1, tags: ['palm'],
    styleMods: { appliesWhenStyle: 'palm', styleDamageMultAdd: 0.06 },
  },
  ironPalmWraps: {
    key: 'ironPalmWraps',
    displayName: 'Iron Palm Wraps',
    slot: 'wraps',
    tier: 2, tags: ['palm','metal'],
    styleMods: {
      appliesWhenStyle: 'palm',
      styleDamageMultAdd: 0.10,
      statusPotencyMultAdd: 0.12,
    },
  },
  oakenKnuckles: {
    key: 'oakenKnuckles',
    displayName: 'Oaken Knuckles',
    slot: 'wraps',
    tier: 2, tags: ['fist','wood'],
    styleMods: {
      appliesWhenStyle: 'fist',
      styleDamageMultAdd: 0.10,
      attackRateMultAdd: 0.05, // slightly faster jabs
    },
  },
} as const;

Engine hook:

function sumStyleMultipliersFromItems(style: StyleKey, items: ItemDef[]) {
  let mult = 0;
  for (const it of items) {
    const m = it.styleMods;
    if (m?.appliesWhenStyle === style) mult += (m.styleDamageMultAdd ?? 0);
  }
  return mult;
}


---

5) Statuses (unchanged intent, clarified names)

src/data/status.ts

export const STATUSES = {
  bruiseMinor:      { key:'bruiseMinor', displayName:'Bruise', durationMs:3000, stackCap:5,
                      rules:{ dmgTakenMult: 1.01 }, scalesWith:'physique' },
  fractureMinor:    { key:'fractureMinor', displayName:'Fracture', durationMs:4000, stackCap:3,
                      rules:{ armorMult: 0.98 },     scalesWith:'physique' },
  staggerMinor:     { key:'staggerMinor', displayName:'Stagger', durationMs:1200, stackCap:3,
                      rules:{ attackSpeedMult: 0.9, moveSpeedMult: 0.9 }, scalesWith:'mind' },
  qiDisruptMinor:   { key:'qiDisruptMinor', displayName:'Qi Disruption', durationMs:3000, stackCap:5,
                      rules:{ regenWaterPerSecAdd:-0.2, maxQiMult:0.99 }, scalesWith:'mind' },
};


---

6) UI wiring (light)

Style selector: a small toggle in the combat bar when no weapon is equipped: Fist | Palm.

Manual slot: one slot per style (shows manual name + mastery stars).

Wraps slot: new equipment slot that displays boosts only when the matching style is active.

Ability strip: show abilities where requiresStyle === currentStyle and any unlocked by the equipped manual.



---

7) Quick migration steps

1. Remove palm as a weapon from WEAPONS if you added it earlier; keep swords/spears etc.


2. Add styles.ts and wire actor.currentStyle. If mainhand weapon is equipped, weapon overrides style as usual; if not, use currentStyle.


3. Switch ability gating from requiresWeaponKey → requiresStyle. Keep backward compat by supporting both keys for now.


4. Add wraps slot. Add basic wraps to T1–T2 loot tables and a forge recipe.


5. Pipe the new damage formula into your hit scheduling.




---

8) Starter balance checkpoints

L5 Fist (no manual, no wraps): baseAtLevel(5) ≈ 2 + 1.25*5^1.08 ≈ 8.7; 1.0s cadence → ~8.7 DPS before attrs.

L5 Palm (no manual, no wraps): ≈ 7.5; 2×0.55 combo every 1.2s → ~6.9 DPS before attrs, but frequent Stagger and Qi Disruption make TTK similar on equal-tier mobs.

A +10 Physique Fist disciple adds ~6% damage (weights × 1% rule).

Flowing Palm with manual m=5 and Iron Palm Wraps: styleDamageMult ≈ 0.03+0.018*5 + 0.10 = 0.22; plus +0.12 status potency → control noticeably stronger than fists’ raw DPS.



---

9) QA checklist

Unequipped mainhand uses currentStyle.

Equipping Iron Palm Wraps doesn’t change style by itself; swapping to Palm activates their bonuses.

Manuals show correct passives and unlocked abilities; mastery increments adjust passives live.

Ability filter respects requiresStyle.

Status icons and stack behavior appear as defined.


If you want, I can package this as a PR-ready patch list (file diffs + TODOs) or tune the curves to your current enemy HP/TTK targets.

