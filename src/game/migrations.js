import { migrations as ability } from '../features/ability/migrations.js';
import { migrations as adventure } from '../features/adventure/migrations.js';
import { migrations as alchemy } from '../features/alchemy/migrations.js';
import { migrations as affixes } from '../features/affixes/migrations.js';
import { migrations as combat } from '../features/combat/migrations.js';
import { migrations as cooking } from '../features/cooking/migrations.js';
import { migrations as forging } from '../features/forging/migrations.js';
import { migrations as inventory } from '../features/inventory/migrations.js';
import { migrations as karma } from '../features/karma/migrations.js';
import { migrations as loot } from '../features/loot/migrations.js';
import { migrations as mining } from '../features/mining/migrations.js';
import { migrations as gathering } from '../features/gathering/migrations.js';
import { migrations as physique } from '../features/physique/migrations.js';
import { migrations as proficiency } from '../features/proficiency/migrations.js';
import { migrations as progression } from '../features/progression/migrations.js';
import { migrations as sect } from '../features/sect/migrations.js';
import { migrations as weaponGeneration } from '../features/weaponGeneration/migrations.js';

const migrations = [
  ...progression,
  ...sect,
  ...proficiency,
  ...alchemy,
  ...inventory,
  ...cooking,
  ...forging,
  ...ability,
  ...adventure,
  ...affixes,
  ...combat,
  ...karma,
  ...loot,
  ...mining,
  ...gathering,
  ...physique,
  ...weaponGeneration,
];

export const SAVE_VERSION = migrations.length;

export function runMigrations(save){
  let ver = save.ver || 0;
  while(ver < migrations.length){
    migrations[ver](save);
    ver++;
  }
  save.ver = ver;
}
