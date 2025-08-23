import { S, save } from '../../shared/state.js';
import { calculatePlayerCombatAttack, calculatePlayerAttackRate, qCap } from '../progression/selectors.js';
import { initializeFight, processAttack } from '../combat/mutators.js';
import { refillShieldFromQi } from '../combat/logic.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { getAbilitySlots } from '../ability/selectors.js';
import { rollLoot, toLootTableKey } from '../loot/logic.js'; // WEAPONS-INTEGRATION
import { WEAPONS } from '../weaponGeneration/data/weapons.js'; // WEAPONS-INTEGRATION
import { rollGearDropForZone } from '../gearGeneration/selectors.js';
import { addToInventory } from '../inventory/mutators.js';
import { ABILITIES } from '../ability/data/abilities.js';
import { performAttack, decayStunBar } from '../combat/attack.js'; // STATUS-REFORM
import { chanceToHit } from '../combat/hit.js';
import { tryCastAbility, processAbilityQueue } from '../ability/mutators.js';
import { ENEMY_DATA } from './data/enemies.js';
import { setText, log } from '../../shared/utils/dom.js';
import { applyRandomAffixes } from '../affixes/logic.js';
import { AFFIXES } from '../affixes/data/affixes.js';
import { gainProficiency, gainProficiencyFromEnemy } from '../proficiency/mutators.js';
import { ZONES, getZoneById, getAreaById, isZoneUnlocked, isAreaUnlocked } from './data/zones.js'; // MAP-UI-UPDATE
import { ZONES as ZONE_IDS } from './data/zoneIds.js';
import { addSessionLoot, claimSessionLoot, forfeitSessionLoot } from '../loot/mutators.js'; // EQUIP-CHAR-UI
import { updateLootTab } from '../loot/ui/lootTab.js';
import {
  playSlashArc,
  playThrustLine,
  playRingShockwave,
  playBeam,
  playChakram,
  playShieldDome,
  playSparkBurst,
  setFxTint
} from '../combat/ui/index.js';
import { updateZoneButtons, updateAreaGrid } from './ui/zoneUI.js';
import { updateAdventureProgressBar } from './ui/progressBar.js';
import { updateFoodSlots } from '../cooking/ui/cookControls.js';

// Use centralized zone data from zones.js - old ADVENTURE_ZONES removed

const loggedResistTypes = new Set();
function logEnemyResists(enemy) {
  if (enemy && !loggedResistTypes.has(enemy.type)) {
    console.log('[resist]', enemy.type, enemy.resists);
    loggedResistTypes.add(enemy.type);
  }
}

function getCombatPositions() {
  const svg = document.getElementById('combatFx');
  const playerEl = document.querySelector('.combatant.player');
  const enemyEl = document.querySelector('.combatant.enemy');
  if (!svg || !playerEl || !enemyEl) return null;
  const rect = svg.getBoundingClientRect();
  // If SVG hasn't been laid out yet, its rect can be 0x0 which would cause NaN (0/0)
  if (!rect || rect.width === 0 || rect.height === 0) return null;
  const pRect = playerEl.getBoundingClientRect();
  const eRect = enemyEl.getBoundingClientRect();
  const from = {
    x: ((pRect.right - rect.left) / rect.width) * 100,
    y: ((pRect.top + pRect.height / 2 - rect.top) / rect.height) * 50,
  };
  const to = {
    x: ((eRect.left - rect.left) / rect.width) * 100,
    y: ((eRect.top + eRect.height / 2 - rect.top) / rect.height) * 50,
  };
  // Validate computed values
  if (!Number.isFinite(from.x) || !Number.isFinite(from.y) || !Number.isFinite(to.x) || !Number.isFinite(to.y)) {
    return null;
  }
  return { svg, from, to };
}

// Subtle red-and-break visual on death
function triggerDeathBreak(target) {
  const sel = target === 'enemy' ? '.combatant.enemy' : '.combatant.player';
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('death-break');
  setTimeout(() => el.classList.remove('death-break'), 600);
}

// Adventure zone and area UI helpers
export function ensureAdventure() {
  if (!S.adventure) {
    S.adventure = {
      currentZone: 0,
      currentArea: 0,
      selectedZone: 0,
      selectedArea: 0,
      totalKills: 0,
      areasCompleted: 0,
      zonesUnlocked: 1,
      killsInCurrentArea: 0,
      bestiary: {},
      inCombat: false,
      areaProgress: {}, // Track kills per area: { "0-0": { kills: 5, bossDefeated: true }, ... }
      unlockedAreas: { "0-0": true } // Track unlocked areas
    };
  }
  // Ensure new properties exist for existing saves
  if (!S.adventure.areaProgress) S.adventure.areaProgress = {};
  if (!S.adventure.unlockedAreas) S.adventure.unlockedAreas = { "0-0": true };
}

// MAP-UI-UPDATE: Area selection by ID with save persistence
export function selectAreaById(zoneId, areaId, areaIndex) {
  const zone = getZoneById(zoneId);
  if (!zone) return false;

  const zoneIndex = ZONES.findIndex(z => z.id === zoneId);
  if (zoneIndex === -1) return false;

  // Check if area is unlocked
  if (!isAreaUnlocked(zoneId, areaId, S)) {
    log('Area is locked!');
    return false;
  }

  // Update adventure state
  S.adventure.selectedZone = zoneIndex;
  S.adventure.currentZone = zoneIndex;
  S.adventure.currentArea = areaIndex;

  // Reset combat state
  S.adventure.currentEnemy = null;
  S.adventure.enemyHP = 0;
  S.adventure.playerHP = S.hpMax;

  log(`Traveled to ${zone.areas[areaIndex].name} in ${zone.name}`);

  // Save state persistence
  save();

  return true;
}

export function updateBattleDisplay() {
  ensureAdventure();
  const playerHP = S.adventure.playerHP || S.hp || 100;
  const playerMaxHP = S.hpMax || 100;
  setText('playerHealthText', `${Math.round(playerHP)}/${Math.round(playerMaxHP)}`);
  const playerHealthFill = document.getElementById('playerHealthFill');
  if (playerHealthFill) {
    const playerHealthPct = (playerHP / playerMaxHP) * 100;
    playerHealthFill.style.width = `${playerHealthPct}%`;
  }
  const playerQi = S.qi || 0;
  const playerMaxQi = qCap(S);
  setText('playerQiText', `${Math.round(playerQi)}/${Math.round(playerMaxQi)}`);
  const playerQiFill = document.getElementById('playerQiFill');
  if (playerQiFill) {
    const playerQiPct = playerMaxQi ? (playerQi / playerMaxQi) * 100 : 0;
    playerQiFill.style.width = `${playerQiPct}%`;
  }
  const playerAttack = calculatePlayerCombatAttack(S);
  const playerAttackRate = calculatePlayerAttackRate(S);
  setText('playerAttack', Math.round(playerAttack));
  setText('playerAttackRate', `${playerAttackRate.toFixed(1)}/s`);
  setText('combatAttackRate', `${playerAttackRate.toFixed(1)}/s`);
  if (S.adventure.inCombat && S.adventure.currentEnemy) {
    const enemy = S.adventure.currentEnemy;
    const enemyHP = S.adventure.enemyHP || 0;
    const enemyMaxHP = S.adventure.enemyMaxHP || 0;
    setText('enemyName', enemy.name || 'Unknown Enemy');
    setText('enemyHealthText', `${Math.round(enemyHP)}/${Math.round(enemyMaxHP)}`);
    setText('enemyAttack', Math.round(enemy.attack || 0));
    setText('enemyAttackRate', `${(enemy.attackRate || 1.0).toFixed(1)}/s`);
    const enemyQiFill = document.getElementById('enemyQiFill');
    if (enemy.qiMax) {
      const enemyQi = S.adventure.enemyQi || 0;
      setText('enemyQiText', `${Math.round(enemyQi)}/${Math.round(enemy.qiMax)}`);
      if (enemyQiFill) {
        const enemyQiPct = (enemyQi / enemy.qiMax) * 100;
        enemyQiFill.style.width = `${enemyQiPct}%`;
      }
    } else {
      setText('enemyQiText', '—');
      if (enemyQiFill) enemyQiFill.style.width = '0%';
    }
    const affixEl = document.getElementById('enemyAffixes');
    if (affixEl) {
      if (enemy.affixes && enemy.affixes.length) {
        affixEl.innerHTML = enemy.affixes.map(a => {
          const info = AFFIXES[a] || {};
          const color = info.color || '#555';
          const desc = (info.desc || '').replace(/"/g, '&quot;');
          return `<div class="affix-tile" style="background:${color}" data-desc="${desc}">${a}</div>`;
        }).join('');
      } else {
        affixEl.innerHTML = '';
      }
    }
    const enemyHealthFill = document.getElementById('enemyHealthFill');
    if (enemyHealthFill && enemyMaxHP > 0) {
      const enemyHealthPct = (enemyHP / enemyMaxHP) * 100;
      enemyHealthFill.style.width = `${enemyHealthPct}%`;
    }
  } else {
    setText('enemyName', 'Select an area to begin');
    setText('enemyHealthText', '--/--');
    setText('enemyAttack', '--');
    setText('enemyAttackRate', '--/s');
    const enemyHealthFill = document.getElementById('enemyHealthFill');
    if (enemyHealthFill) enemyHealthFill.style.width = '0%';
    const enemyQiFill = document.getElementById('enemyQiFill');
    setText('enemyQiText', '--');
    if (enemyQiFill) enemyQiFill.style.width = '0%';
    const affixEl = document.getElementById('enemyAffixes');
    if (affixEl) affixEl.innerHTML = '';
  }
  const combatLog = document.getElementById('combatLog');
  if (combatLog && S.adventure.combatLog) {
    const recentLogs = S.adventure.combatLog.slice(-5);
    combatLog.innerHTML = recentLogs.map(l => `<div class="log-entry">${l}</div>`).join('');
    combatLog.scrollTop = combatLog.scrollHeight;
  }
}

export function updateAbilityBar() {
  const bar = document.getElementById('abilityBar');
  if (!bar) return;
  const slots = getAbilitySlots(S);
  const iconMap = { 'pointy-sword': '🗡️', 'game-icons:mighty-force': '💥' };
  bar.innerHTML = '';
  slots.forEach((slot, i) => {
    const card = document.createElement('div');
    card.className = 'ability-card';
    card.dataset.slot = i + 1;
    if (slot.abilityKey) {
      const def = ABILITIES[slot.abilityKey];
      card.innerHTML = `
        <div class="ability-name">${def.displayName}</div>
        <div class="ability-icon">${iconMap[def.icon] || def.icon}</div>
        <div class="qi-badge">${def.costQi} Qi</div>
        <div class="keybind">[${i + 1}]</div>
      `;
      const cdSec = (def.cooldownMs || 0) / 1000;
      card.title = `${def.displayName} — Cost ${def.costQi} Qi, CD ${cdSec}s`;
      if (slot.cooldownRemainingMs > 0) {
        const overlay = document.createElement('div');
        overlay.className = 'cooldown-overlay';
        overlay.textContent = Math.ceil(slot.cooldownRemainingMs / 1000);
        card.appendChild(overlay);
        card.classList.add('cooling');
      }
      if (slot.insufficientQi) card.classList.add('insufficient');
      card.addEventListener('click', () => {
        if (tryCastAbility(slot.abilityKey)) {
          S.qi -= ABILITIES[slot.abilityKey].costQi;
          flashAbilityCard(i + 1);
          updateAbilityBar();
        } else {
          shakeAbilityCard(i + 1);
        }
      });
    } else {
      card.classList.add('empty');
      card.innerHTML = `
        <div class="ability-name">—</div>
        <div class="ability-icon"></div>
        <div class="qi-badge"></div>
        <div class="keybind">[${i + 1}]</div>
      `;
    }
    bar.appendChild(card);
  });
}

function flashAbilityCard(index) {
  const el = document.querySelector(`.ability-card[data-slot='${index}']`);
  if (!el) return;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 150);
}

function shakeAbilityCard(index) {
  const el = document.querySelector(`.ability-card[data-slot='${index}']`);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 300);
}

export function updateAdventureCombat() {
  if (!S.adventure || !S.adventure.inCombat) return;
  processAbilityQueue(S);
  // If an ability reduced enemy HP to 0, resolve defeat immediately
  if (S.adventure.currentEnemy && S.adventure.enemyHP <= 0) {
    defeatEnemy();
    return;
  }
  if (S.adventure.currentEnemy && S.adventure.enemyHP > 0) {
    const playerAttackRate = calculatePlayerAttackRate(S);
    const weapon = getEquippedWeapon(S);
    console.log('[weapon]', weapon.key); // WEAPONS-INTEGRATION
    const now = Date.now();
    const deltaTime = (now - (S.adventure.lastCombatTick || now)) / 1000; // STATUS-REFORM
    S.adventure.lastCombatTick = now; // STATUS-REFORM
    S.adventure.playerStunBar = decayStunBar(S.adventure.playerStunBar, deltaTime); // STATUS-REFORM
    S.adventure.enemyStunBar = decayStunBar(S.adventure.enemyStunBar, deltaTime); // STATUS-REFORM
    if (!S.adventure.lastPlayerAttack) S.adventure.lastPlayerAttack = now;
    if (!S.adventure.lastEnemyAttack) S.adventure.lastEnemyAttack = now;
    const regen = S.adventure.currentEnemy.regen || 0;
    if (regen) {
      S.adventure.enemyHP = Math.min(S.adventure.enemyMaxHP, S.adventure.enemyHP + regen * S.adventure.enemyMaxHP);
    }
    if (now - S.adventure.lastPlayerAttack >= (1000 / playerAttackRate)) {
      S.adventure.lastPlayerAttack = now;
      const enemyDodge = S.adventure.currentEnemy?.stats?.dodge ?? S.adventure.currentEnemy?.dodge ?? 0;
      const hitP = chanceToHit(S.stats?.accuracy || 0, enemyDodge);
      if (Math.random() < hitP) {
        const playerAttack = calculatePlayerCombatAttack(S);
        const dmg = Math.max(1, Math.round(playerAttack));
        const dealt = processAttack(
          dmg,
          { target: S.adventure.currentEnemy, type: 'physical' },
          S
        );
        gainProficiencyFromEnemy(weapon.proficiencyKey, S.adventure.enemyMaxHP, S); // WEAPONS-INTEGRATION
        S.adventure.combatLog = S.adventure.combatLog || [];
        S.adventure.combatLog.push(`You deal ${dealt} damage to ${S.adventure.currentEnemy.name}`);
        const enemyState = { stunBar: S.adventure.enemyStunBar, hpMax: S.adventure.enemyMaxHP }; // STATUS-REFORM
        const mainKey = typeof S.equipment?.mainhand === 'string' ? S.equipment.mainhand : S.equipment?.mainhand?.key;
        performAttack(S, enemyState, { attackIsPhysical: true, physDamageDealt: dealt, usingPalm: mainKey === 'palm' }, S); // STATUS-REFORM
        S.adventure.enemyStunBar = enemyState.stunBar; // STATUS-REFORM
        const pos = getCombatPositions();
        if (pos) {
          setFxTint(pos.svg, weapon.animations?.tint || 'auto');
          (weapon.animations?.fx || []).forEach(fx => {
            switch (fx) {
              case 'slashArc':
                playSlashArc(pos.svg, pos.from, pos.to);
                break;
              case 'pierceThrust':
              case 'palmStrike':
                playThrustLine(pos.svg, pos.from, pos.to);
                break;
              case 'smash':
                playRingShockwave(pos.svg, pos.to, 20);
                break;
              case 'flurry': {
                const mid = { x: (pos.from.x + pos.to.x) / 2, y: pos.from.y };
                playSlashArc(pos.svg, pos.from, mid);
                setTimeout(() => playSlashArc(pos.svg, mid, pos.to), 80);
                playSparkBurst(pos.svg, pos.to);
                break;
              }
              case 'spinThrow':
                playChakram(pos.svg, pos.from, pos.to);
                break;
              case 'magicBolt':
              case 'smite':
                playBeam(pos.svg, pos.from, pos.to);
                break;
              default:
                break;
            }
          });
        }
        if (S.adventure.enemyHP <= 0) {
          defeatEnemy();
        }
      } else {
        S.adventure.combatLog = S.adventure.combatLog || [];
        S.adventure.combatLog.push('You miss!');
      }
    }
    if (S.adventure.enemyHP > 0 && S.adventure.currentEnemy) {
      const enemyAttackRate = S.adventure.currentEnemy.attackRate || 1.0;
      if (now - S.adventure.lastEnemyAttack >= (1000 / enemyAttackRate)) {
        S.adventure.lastEnemyAttack = now;
        const enemyAcc = S.adventure.currentEnemy?.stats?.accuracy ?? S.adventure.currentEnemy?.accuracy ?? 0;
        const playerDodge = S.stats?.dodge || 0;
        const hitP = chanceToHit(enemyAcc, playerDodge);
        if (Math.random() < hitP) {
          const enemyDamage = Math.round(S.adventure.currentEnemy.attack || 5);
          const taken = processAttack(
            enemyDamage,
            { target: S, type: 'physical' },
            S
          );
          S.adventure.combatLog.push(`${S.adventure.currentEnemy.name} deals ${taken} damage to you`);
          const playerState = { stunBar: S.adventure.playerStunBar, hpMax: S.hpMax }; // STATUS-REFORM
          performAttack(S.adventure.currentEnemy, playerState, { attackIsPhysical: true, physDamageDealt: taken }, S); // STATUS-REFORM
          S.adventure.playerStunBar = playerState.stunBar; // STATUS-REFORM
          if (weapon.typeKey === 'focus') {
            const pos = getCombatPositions();
            if (pos) {
              setFxTint(pos.svg, weapon.animations?.tint || 'auto');
              playShieldDome(pos.svg, pos.from, 25);
            }
          }
          if (S.adventure.playerHP <= 0) {
            // Subtle visual cue for player death
            try { triggerDeathBreak('player'); } catch (_) {}
            S.adventure.inCombat = false;
            S.adventure.combatLog.push('You have been defeated!');
            log('Defeated in combat! Returning to safety...', 'bad');
            forfeitSessionLoot(); // EQUIP-CHAR-UI
            updateLootTab(); // EQUIP-CHAR-UI
            S.qi = 0;
            if (typeof globalThis.stopActivity === 'function') {
              globalThis.stopActivity('adventure');
            } else {
              S.activities.adventure = false;
            }
            const btn = document.getElementById('startBattleButton');
            if (btn) {
              btn.textContent = '⚔️ Start Battle';
              btn.classList.remove('warn');
              btn.classList.add('primary');
              btn.disabled = false;
            }
            updateActivityAdventure();
            const { gained, qiSpent } = refillShieldFromQi(S);
            if (gained > 0) log(`Your Qi reforms ${gained} shield (${qiSpent.toFixed(1)} Qi).`);
          }
        } else {
          S.adventure.combatLog.push(`${S.adventure.currentEnemy.name} misses you`);
        }
      }
    }
  }
}

function defeatEnemy() {
  if (!S.adventure || !S.adventure.currentEnemy) return;
  const enemy = S.adventure.currentEnemy;
  // Subtle visual cue for enemy defeat
  try { triggerDeathBreak('enemy'); } catch (_) {}
  const isBoss = S.adventure.isBossFight;
  const areaKey = `${S.adventure.currentZone}-${S.adventure.currentArea}`;
  
  S.adventure.totalKills++;
  if (!isBoss) {
    S.adventure.killsInCurrentArea++;
    // Update persistent area progress
    if (!S.adventure.areaProgress[areaKey]) {
      S.adventure.areaProgress[areaKey] = { kills: 0, bossDefeated: false };
    }
    S.adventure.areaProgress[areaKey].kills = S.adventure.killsInCurrentArea;
  } else {
    // Mark boss as defeated for this area
    if (!S.adventure.areaProgress[areaKey]) {
      S.adventure.areaProgress[areaKey] = { kills: S.adventure.killsInCurrentArea, bossDefeated: false };
    }
    S.adventure.areaProgress[areaKey].bossDefeated = true;
    
    // Unlock next area when boss is defeated
    const currentZone = ZONES[S.adventure.currentZone];
    if (currentZone && currentZone.areas) {
      const nextAreaIndex = S.adventure.currentArea + 1;
      if (nextAreaIndex < currentZone.areas.length) {
        const nextAreaKey = `${S.adventure.currentZone}-${nextAreaIndex}`;
        S.adventure.unlockedAreas[nextAreaKey] = true;
        log(`New area unlocked: ${currentZone.areas[nextAreaIndex].name}!`, 'excellent');
      } else {
        // Unlock first area of next zone
        const nextZoneIndex = S.adventure.currentZone + 1;
        if (nextZoneIndex < ZONES.length) {
          const nextZoneAreaKey = `${nextZoneIndex}-0`;
          S.adventure.unlockedAreas[nextZoneAreaKey] = true;
          S.adventure.zonesUnlocked = Math.max(S.adventure.zonesUnlocked, nextZoneIndex + 1);
          log(`New zone unlocked: ${ZONES[nextZoneIndex].name}!`, 'excellent');
        }
      }
    }
  }
  
  S.adventure.bestiary = S.adventure.bestiary || {};
  const enemyType = enemy.type || enemy.name;
  S.adventure.bestiary[enemyType] = (S.adventure.bestiary[enemyType] || 0) + 1;
  updateBestiaryList();
  S.adventure.combatLog = S.adventure.combatLog || [];
  
  const zone = ZONES[S.adventure.currentZone];
  const area = zone?.areas?.[S.adventure.currentArea];
  const lootEntries = enemy.loot ? Object.entries(enemy.loot) : [];
  lootEntries.forEach(([item, qty]) => {
    addSessionLoot({ key: item, type: WEAPONS[item] ? 'weapon' : 'mat', qty, source: area?.name });
  });

  if (enemy.drops) {
    Object.entries(enemy.drops).forEach(([item, chance]) => {
      if (Math.random() < chance) {
        addSessionLoot({ key: item, type: WEAPONS[item] ? 'weapon' : 'mat', qty: 1, source: area?.name });
        lootEntries.push([item, 1]);
      }
    });
  }

  if (S.flags?.weaponsEnabled) { // WEAPONS-INTEGRATION
    const tableKey = toLootTableKey(area?.id || zone?.id);
    const drop = rollLoot(tableKey);
    if (drop) {
      addSessionLoot({ key: drop, type: WEAPONS[drop] ? 'weapon' : 'mat', qty: 1, source: area?.name });
      lootEntries.push([drop, 1]);
    }

    const gear = rollGearDropForZone(ZONE_IDS.STARTING);
    if (gear) {
      addToInventory(gear, S);
      lootEntries.push([gear.name, 1]);
    }
  }
  
  // Boss bonus rewards
  if (isBoss) {
    const bonusXP = Math.max(1, Math.round(enemy.hp / 10));
    const weapon = getEquippedWeapon(S);
    gainProficiency(weapon.proficiencyKey, bonusXP, S);
    S.adventure.combatLog.push(`💀 Boss defeated! Bonus XP: ${bonusXP}`);
  }
  
  if (lootEntries.length) {
    const lootText = lootEntries.map(([i, q]) => `${q} ${i}`).join(', ');
    const prefix = isBoss ? '💀 Boss defeated!' : `${enemy.name} defeated!`;
    S.adventure.combatLog.push(`${prefix} Loot: ${lootText}`);
    log(`${prefix} Loot: ${lootText}`, isBoss ? 'excellent' : 'good');
  } else {
    const prefix = isBoss ? '💀 Boss defeated!' : `${enemy.name} defeated!`;
    S.adventure.combatLog.push(prefix);
    log(prefix, isBoss ? 'excellent' : 'good');
  }
  
  S.hp = S.adventure.playerHP;
  S.adventure.inCombat = false;
  S.adventure.isBossFight = false;
  S.adventure.currentEnemy = null;
  const { enemyHP, enemyMax } = initializeFight({ hp: 0 });
  S.adventure.enemyHP = enemyHP;
  S.adventure.enemyMaxHP = enemyMax;

  const { gained, qiSpent } = refillShieldFromQi(S);
  if (gained > 0) log(`Your Qi reforms ${gained} shield (${qiSpent.toFixed(1)} Qi).`);

  if (S.activities.adventure && S.adventure.playerHP > 0 && !isBoss) {
    startAdventureCombat();
    updateActivityAdventure();
  }
  updateLootTab(); // EQUIP-CHAR-UI
}

export function instakillCurrentEnemy() {
  if (S.adventure && S.adventure.currentEnemy) {
    S.adventure.enemyHP = 0;
    defeatEnemy();
  }
}



export function generateBossEnemy() {
  if (!S.adventure) return null;
  const currentZone = ZONES[S.adventure.selectedZone || 0];
  if (!currentZone || !currentZone.areas) return null;
  
  // Get all enemies from current zone
  const zoneEnemies = currentZone.areas.map(area => area.enemy);
  const randomEnemyType = zoneEnemies[Math.floor(Math.random() * zoneEnemies.length)];
  const baseEnemyData = ENEMY_DATA[randomEnemyType];
  
  if (!baseEnemyData) return null;
  
  // Create boss version with 2x stats
  const bossData = {
    ...baseEnemyData,
    name: `${baseEnemyData.name} Boss`,
    hp: Math.round(baseEnemyData.hp * 2),
    attack: Math.round(baseEnemyData.attack * 2),
    attackRate: baseEnemyData.attackRate,
    // Enhanced loot - double the quantities
    loot: {},
    drops: {}
  };
  
  // Double loot quantities
  if (baseEnemyData.loot) {
    Object.entries(baseEnemyData.loot).forEach(([item, qty]) => {
      bossData.loot[item] = qty * 2;
    });
  }
  
  // Improve drop chances slightly
  if (baseEnemyData.drops) {
    Object.entries(baseEnemyData.drops).forEach(([item, chance]) => {
      bossData.drops[item] = Math.min(1.0, chance * 1.5);
    });
  }
  
  return { bossData, originalType: randomEnemyType };
}

export function startBossCombat() {
  if (!S.adventure) return;
  const bossInfo = generateBossEnemy();
  if (!bossInfo) {
    log('Failed to generate boss enemy!', 'bad');
    return;
  }
  
  const { bossData, originalType } = bossInfo;
  const { enemyHP, enemyMax, atk, def } = initializeFight(bossData);
  const h = { enemyHP, enemyMax, eAtk: atk, eDef: def, regen: 0, affixes: [] };
  
  // Bosses get more affixes
  applyRandomAffixes(h);
  applyRandomAffixes(h); // Apply twice for more challenge
  
  S.adventure.inCombat = true;
  S.adventure.isBossFight = true;
  S.adventure.currentEnemy = {
    ...bossData,
    type: originalType,
    attack: Math.round(h.eAtk),
    defense: Math.round(h.eDef),
    armor: Math.round(h.eDef),
    regen: h.regen,
    affixes: h.affixes
  };
  S.adventure.enemyHP = h.enemyHP;
  S.adventure.enemyMaxHP = h.enemyMax;
  S.adventure.playerHP = Math.round(S.hp);
  S.adventure.lastPlayerAttack = 0;
  S.adventure.lastEnemyAttack = 0;
  S.adventure.combatLog = S.adventure.combatLog || [];
  S.adventure.combatLog.push(`💀 A powerful ${bossData.name} emerges!`);
  log(`Boss challenge started: ${bossData.name}!`, 'excellent');
  logEnemyResists(S.adventure.currentEnemy);
}

export function startAdventureCombat() {
  if (!S.adventure) return;
  S.adventure.selectedZone = S.adventure.selectedZone || 0;
  S.adventure.selectedArea = S.adventure.selectedArea || 0;
  S.adventure.currentZone = S.adventure.selectedZone;
  S.adventure.currentArea = S.adventure.selectedArea;
  const currentZone = ZONES[S.adventure.selectedZone];
  if (!currentZone || !currentZone.areas) return;
  const currentArea = currentZone.areas[S.adventure.selectedArea];
  if (!currentArea || !currentArea.enemy) return;
  const enemyType = currentArea.enemy;
  const enemyData = ENEMY_DATA[enemyType];
  if (!enemyData) {
    log(`Enemy data not found for ${enemyType}`, 'bad');
    return;
  }
  const { enemyHP, enemyMax, atk, def } = initializeFight(enemyData);
  const h = { enemyHP, enemyMax, eAtk: atk, eDef: def, regen: 0, affixes: [] };
  applyRandomAffixes(h);
  S.adventure.inCombat = true;
  S.adventure.isBossFight = false;
  S.adventure.currentEnemy = {
    ...enemyData,
    type: enemyType,
    attack: Math.round(h.eAtk),
    defense: Math.round(h.eDef),
    armor: Math.round(h.eDef),
    regen: h.regen,
    affixes: h.affixes
  };
  S.adventure.enemyHP = h.enemyHP;
  S.adventure.enemyMaxHP = h.enemyMax;
  S.adventure.playerHP = Math.round(S.hp);
  S.adventure.lastPlayerAttack = 0;
  S.adventure.lastEnemyAttack = 0;
  S.adventure.combatLog = S.adventure.combatLog || [];
  S.adventure.combatLog.push(`A ${enemyData.name} appears!`);
  logEnemyResists(S.adventure.currentEnemy);
}

export function progressToNextArea() {
  if (!S.adventure) return;
  const currentZone = ZONES[S.adventure.selectedZone || 0];
  if (!currentZone || !currentZone.areas) return;
  const currentArea = currentZone.areas[S.adventure.selectedArea || 0];
  if (!currentArea) return;
  
  const areaKey = `${S.adventure.selectedZone}-${S.adventure.selectedArea}`;
  const progress = S.adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };
  
  if (S.adventure.killsInCurrentArea < currentArea.killReq) {
    log('Area not yet cleared! Defeat more enemies first.', 'bad');
    return;
  }
  
  if (!progress.bossDefeated) {
    log('Boss must be defeated before progressing!', 'bad');
    return;
  }
  
  if (S.adventure.selectedArea < currentZone.areas.length - 1) {
    const nextAreaIndex = S.adventure.selectedArea + 1;
    const nextAreaKey = `${S.adventure.selectedZone}-${nextAreaIndex}`;
    
    if (!S.adventure.unlockedAreas[nextAreaKey]) {
      log('Next area is not unlocked yet!', 'bad');
      return;
    }
    
    S.adventure.selectedArea = nextAreaIndex;
    S.adventure.currentArea = S.adventure.selectedArea;
    
    // Load progress for new area
    const newAreaProgress = S.adventure.areaProgress[nextAreaKey] || { kills: 0, bossDefeated: false };
    S.adventure.killsInCurrentArea = newAreaProgress.kills;
    
    S.adventure.areasCompleted++;
    const newArea = currentZone.areas[S.adventure.selectedArea];
    log(`Advanced to ${newArea.name}!`, 'good');
  } else if (S.adventure.selectedZone < ZONES.length - 1) {
    const nextZoneIndex = S.adventure.selectedZone + 1;
    const nextZoneAreaKey = `${nextZoneIndex}-0`;
    
    if (!S.adventure.unlockedAreas[nextZoneAreaKey]) {
      log('Next zone is not unlocked yet!', 'bad');
      return;
    }
    
    S.adventure.selectedZone = nextZoneIndex;
    S.adventure.currentZone = S.adventure.selectedZone;
    S.adventure.selectedArea = 0;
    S.adventure.currentArea = 0;
    
    // Load progress for new zone's first area
    const newAreaProgress = S.adventure.areaProgress[nextZoneAreaKey] || { kills: 0, bossDefeated: false };
    S.adventure.killsInCurrentArea = newAreaProgress.kills;
    
    S.adventure.zonesUnlocked = Math.max(S.adventure.zonesUnlocked, S.adventure.selectedZone + 1);
    const newZone = ZONES[S.adventure.selectedZone];
    log(`Advanced to ${newZone.name}!`, 'excellent');
  } else {
    log('You have reached the end of available content!', 'neutral');
  }
  updateActivityAdventure();
}

export function selectArea(areaIndex) {
  if (!S.adventure) return false;

  const areaKey = `${S.adventure.selectedZone}-${areaIndex}`;
  const isUnlocked = S.adventure.unlockedAreas[areaKey] || false;

  if (!isUnlocked) {
    log('This area is locked! Complete previous areas first.', 'bad');
    return false;
  }

  S.adventure.selectedArea = areaIndex;
  S.adventure.currentArea = areaIndex;

  // Load kills for this area
  const progress = S.adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };
  S.adventure.killsInCurrentArea = progress.kills;

  const currentZone = ZONES[S.adventure.selectedZone || 0];
  if (currentZone && currentZone.areas && currentZone.areas[areaIndex]) {
    const selectedArea = currentZone.areas[areaIndex];
    log(`Selected area: ${selectedArea.name}`, 'good');
  }

  return true;
}

export function selectZone(zoneIndex) {
  if (!S.adventure) return false;
  S.adventure.selectedZone = zoneIndex;
  S.adventure.currentZone = zoneIndex;
  S.adventure.selectedArea = 0;
  S.adventure.currentArea = 0;
  S.adventure.killsInCurrentArea = 0;
  const selectedZone = ZONES[zoneIndex];
  if (selectedZone) {
    log(`Selected zone: ${selectedZone.name}`, 'good');
  }
  return true;
}

export function retreatFromCombat() {
  if (!S.adventure) return;
  if (S.adventure.inCombat) {
    S.hp = S.adventure.playerHP;
    S.adventure.inCombat = false;
    S.adventure.currentEnemy = null;
    const { enemyHP, enemyMax } = initializeFight({ hp: 0 });
    S.adventure.enemyHP = enemyHP;
    S.adventure.enemyMaxHP = enemyMax;
    S.adventure.combatLog = S.adventure.combatLog || [];
    S.adventure.combatLog.push('You retreated from combat.');
    claimSessionLoot(); // EQUIP-CHAR-UI
    updateLootTab(); // EQUIP-CHAR-UI
  }
}

export function updateProgressButton() {
  if (!S.adventure) return;
  const progressBtn = document.getElementById('progressButton');
  const bossBtn = document.getElementById('challengeBossButton');
  if (!progressBtn) return;
  const currentZone = ZONES[S.adventure.selectedZone || 0];
  if (!currentZone || !currentZone.areas) return;
  const currentArea = currentZone.areas[S.adventure.selectedArea || 0];
  if (!currentArea) return;
  
  const areaKey = `${S.adventure.selectedZone}-${S.adventure.selectedArea}`;
  const progress = S.adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };
  const isAreaCleared = S.adventure.killsInCurrentArea >= currentArea.killReq;
  const isBossDefeated = progress.bossDefeated;
  
  // Progress button only enabled after boss is defeated
  progressBtn.disabled = !isBossDefeated;
  if (isBossDefeated) {
    progressBtn.textContent = 'Progress to Next Area';
  } else if (isAreaCleared) {
    progressBtn.textContent = 'Defeat Boss to Progress';
  } else {
    progressBtn.textContent = `Clear Area (${S.adventure.killsInCurrentArea}/${currentArea.killReq})`;
  }
  
  // Show boss button when area is cleared but boss not defeated
  if (bossBtn) {
    if (isAreaCleared && !isBossDefeated) {
      bossBtn.style.display = 'inline-block';
      bossBtn.disabled = S.adventure.inCombat;
    } else {
      bossBtn.style.display = 'none';
    }
  }
}

let tabsInitialized = false;

export function setupAdventureTabs() {
  if (tabsInitialized) return;
  const tabButtons = document.querySelectorAll('.adventure-tab-btn');
  tabButtons.forEach(button => {
    button.onclick = () => {
      const tabName = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.adventure-tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      button.classList.add('active');
      const content = document.getElementById(tabName + 'Tab');
      if (content) {
        content.classList.add('active');
        content.style.display = 'block';
      }
      if (tabName === 'loot') {
        updateLootTab();
      }
    };
  });
  tabsInitialized = true;
}

function findEnemyInfo(type) {
  for (const zone of ZONES) {
    for (const area of zone.areas) {
      if (area.enemy === type) {
        return { zone: zone.name, area: area.name, killReq: area.killReq };
      }
    }
  }
  return null;
}

function updateBestiaryList() {
  if (!S.adventure || !S.adventure.bestiary) return;
  const list = document.getElementById('bestiaryList');
  if (!list) return;
  const entries = Object.entries(S.adventure.bestiary);
  if (entries.length === 0) {
    list.innerHTML = '<div class="muted">Defeat enemies to unlock their information...</div>';
    return;
  }
  list.innerHTML = '';
  entries.forEach(([type, kills]) => {
    const data = ENEMY_DATA[type];
    const info = findEnemyInfo(type);
    const killReq = info ? info.killReq : 0;
    const entry = document.createElement('div');
    entry.className = 'bestiary-entry';

    const header = document.createElement('div');
    header.className = 'bestiary-header';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'bestiary-name';
    nameDiv.textContent = data ? data.name : type;

    const killsDiv = document.createElement('div');
    killsDiv.className = 'bestiary-kills';
    killsDiv.textContent = `Kills: ${kills}`;

    header.appendChild(nameDiv);
    header.appendChild(killsDiv);
    entry.appendChild(header);

    if (!killReq || kills >= killReq) {
      if (data) {
        const stats = document.createElement('div');
        stats.className = 'bestiary-stats';

        const hp = document.createElement('div');
        hp.className = 'bestiary-stat';
        hp.innerHTML = `<span>HP</span><span>${data.hp}</span>`;
        stats.appendChild(hp);

        const atk = document.createElement('div');
        atk.className = 'bestiary-stat';
        atk.innerHTML = `<span>ATK</span><span>${data.attack}</span>`;
        stats.appendChild(atk);

        const rate = document.createElement('div');
        rate.className = 'bestiary-stat';
        rate.innerHTML = `<span>Rate</span><span>${data.attackRate}/s</span>`;
        stats.appendChild(rate);

        entry.appendChild(stats);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'bestiary-info';

        const zoneDiv = document.createElement('div');
        zoneDiv.className = 'bestiary-zone';
        zoneDiv.textContent = info ? `${info.zone} - ${info.area}` : '';
        infoDiv.appendChild(zoneDiv);

        const lootDiv = document.createElement('div');
        lootDiv.className = 'bestiary-loot';
        if (data.loot) {
          lootDiv.textContent = Object.entries(data.loot)
            .map(([k, v]) => `${k}${v ? ` x${v}` : ''}`)
            .join(', ');
        }
        infoDiv.appendChild(lootDiv);

        entry.appendChild(infoDiv);
      }
    } else {
      const locked = document.createElement('div');
      locked.className = 'bestiary-locked';
      locked.textContent = `Defeat ${killReq - kills} more to unlock details`;
      entry.appendChild(locked);
    }

    list.appendChild(entry);
  });
}


export function updateActivityAdventure() {
  ensureAdventure();
  if (!S.adventure.bestiary) {
    S.adventure.bestiary = {};
  }
  const currentZone = ZONES[S.adventure.selectedZone || S.adventure.currentZone || 0];
  if (currentZone && currentZone.areas) {
    const currentArea = currentZone.areas[S.adventure.selectedArea || S.adventure.currentArea || 0];
    if (currentArea) {
      setText('currentLocationText', `${currentZone.name} - ${currentArea.name}`);
      setText('killsRequired', `${S.adventure.killsInCurrentArea}/${currentArea.killReq}`);
    } else {
      setText('currentLocationText', 'Unknown Area');
      setText('killsRequired', '0/0');
    }
  } else {
    setText('currentLocationText', 'Unknown Zone');
    setText('killsRequired', '0/0');
  }
  setText('totalKills', S.adventure.totalKills);
  setText('areasCompleted', S.adventure.areasCompleted);
  setText('zonesUnlocked', S.adventure.zonesUnlocked);
  {
    const equipped = getEquippedWeapon(S);
    setText('currentWeapon', equipped?.displayName || 'Fists'); // WEAPONS-INTEGRATION
  }
  const baseAttack = Math.round(calculatePlayerCombatAttack(S));
  setText('baseDamage', baseAttack);
  updateZoneButtons();
  updateAreaGrid();
  updateAdventureProgressBar(selectAreaById); // MAP-UI-UPDATE
  updateBattleDisplay();
  updateAbilityBar();
  updateAdventureCombat();
  updateFoodSlots(S);
  updateProgressButton();
  updateBestiaryList();
}

// Ability keybind input
document.addEventListener('keydown', e => {
  if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= 6) {
    const slots = getAbilitySlots(S);
    const slot = slots[num - 1];
    if (slot?.abilityKey) {
      if (tryCastAbility(slot.abilityKey)) {
        S.qi -= ABILITIES[slot.abilityKey].costQi;
        flashAbilityCard(num);
        updateAbilityBar();
      } else {
        shakeAbilityCard(num);
      }
    }
  }
});
