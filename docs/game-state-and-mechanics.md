# Game State and Mechanics Overview

This document summarizes the currently implemented systems in **Way of Ascension**.
It is based on the source code and describes how the game ticks, how stats are
applied and how players progress through training, combat, adventure and sect
management.

## Game Loop

The core controller initializes feature state, loads saves and advances the game
at a fixed step of 100 ms. Each tick updates registered features, processes Mind
training and dispatches `TICK` events before rendering and saving the game state
again【F:src/game/GameController.js†L13-L53】.

## Stats and Status Effects

Temporary conditions such as **Bruise**, **Fracture** or **Qi Disruption** are
modeled as status entries with duration, stack limits and rule modifiers. Some
statuses scale with attributes like Physique or Mind, and special flags handle
stun immunity and weakened states【F:src/data/status.ts†L1-L55】.

The Physique attribute grants permanent bonuses. Each Physique level awards one
Physique point. For every point the player gains +3 maximum HP and +1
carry capacity, with helper functions for the training mini‑game to step the
cursor and evaluate timing accuracy【F:src/features/physique/logic.js†L7-L69】.

## Combat and Abilities

Abilities are defined with Qi costs, cooldowns, cast times and tags. Examples
include **Power Slash** for sword users, **Flowing Palm** martial technique, and
spells like **Fireball** and **Lightning Step**【F:src/features/ability/data/abilities.js†L1-L66】.

Attacks can apply status effects either through explicit ability rules or by the
weapon’s elemental type. Elemental mappings such as fire→burn or water→chill are
handled by the combat system before physical attack processing【F:src/features/combat/data/statusesByElement.js†L1-L8】【F:src/features/combat/attack.js†L1-L24】.

Weapon proficiency grows with combat; experience gained scales with an enemy’s
maximum HP divided by 30, and accumulated proficiency provides a soft‑capped
bonus multiplier【F:src/features/proficiency/logic.js†L9-L24】.

## Adventure

Zones are structured as arrays of areas, each with kill requirements and unique
loot. The starting region, **Peaceful Lands**, contains early areas such as
Forest Edge, Meadow Path and Creek Crossing that introduce enemies like Forest
Rabbit or Wild Boar【F:src/features/adventure/data/zones.js†L4-L60】.

Enemy entries specify combat stats and drop tables. For example, the Forest
Rabbit has 45 HP, 3 attack and can drop stones and wood, while the Honey Bee has
a higher attack rate and may drop honey【F:src/features/adventure/data/enemies.js†L1-L41】.

## Training Systems

Mind training revolves around reading manuals. Each manual defines its category,
XP rate, required level and stat weights, providing bonuses such as increased HP
or attack rate when levelled【F:src/features/mind/data/manuals.js†L1-L60】.

Physique training uses a timing mini‑game: players move a cursor and attempt hits
within good or perfect zones. Rewards scale with timing streaks, granting more
XP for consecutive perfect hits【F:src/features/physique/logic.js†L26-L69】.

## Resources and Automation

Mining lets players choose a resource and gain materials over time. Base rates
for stones, iron and ice are modified by mining level, and experience from
mining levels up the profession to increase efficiency【F:src/features/mining/logic.js†L4-L44】.
Gathering provides a similar loop for chopping wood, yielding lumber over time and occasionally granting rare Spirit Wood【F:src/features/gathering/logic.js†L4-L24】.

## Sect Development

Sect buildings unlock with cultivation progress and provide bonuses. Early
structures like the **Meditation Mat** boost Qi regeneration and foundation
gain, while the **Spirit Well** increases Qi capacity. Resource buildings such
as the **Herbal Garden** and **Spirit Mine** enhance yields of herbs or ore as
they are upgraded【F:src/features/sect/data/buildings.js†L1-L72】.

---
This document will evolve as new features are implemented and existing systems
are refined.
