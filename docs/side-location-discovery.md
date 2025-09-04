# Side-Location Discovery

This document outlines the design for discovering optional locations after defeating enemies in Adventure.

## Concept

Each enemy defeat emits a lightweight `KILL` event. A new **side-locations** feature listens to this event and rolls for discovery.

Side locations come in two classes:

1. **Persistent nodes** – permanent Mining or Gathering spots that become available once discovered.
2. **One-time locales** – timed or single-use locations claimed once before expiring (details in a later patch).

## Discovery Rules

- **Trigger**: every enemy kill in an eligible Adventure stage.
- **Cooldown**: after a successful discovery, a one-hour internal cooldown prevents additional discoveries.
- **Chance**: Stage 1 has a 10 % base chance. Each later stage in the same region reduces the chance by 10 % (Stage 2 = 9 %, etc.).
- **Empty stages**: if all discoverables in a stage are already found, a successful roll yields nothing.

### Pools and Caps

- Each stage defines a pool of remaining discoveries.
- Global caps prevent overpopulation (e.g., at most one active one-time locale per stage).

## Classes and Behavior

### Persistent Nodes

These “found spots” add options to Mining or Gathering panels and never expire.

Examples in **Peaceful Lands**:

- **Iron Ore Deposit** (Stage 2) – yields Iron Ore with a small chance of Ore Dust. Appears in Mining as a new node.
- **Herb Garden** (Stage 5) – produces Herbs with a rare Aromatic Herb. Appears in Gathering as a new node.

## User Interface

- Adventure tab shows a count of pending discoveries. Display requires a minimum Agility level.
- Each locale uses a card UI listing name, flavor text, effects, timer, and action buttons.
- Persistent discoveries appear automatically in Mining/Gathering lists marked with a “NEW” tag.

## Persistence

- Persistent nodes save as owned spots.
- One-time locales save their remaining time and are removed silently if expired on load.

