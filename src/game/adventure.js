import { S } from './state.js';
import { calculatePlayerCombatAttack, calculatePlayerAttackRate, getFistBonuses } from './engine.js';
import { initializeFight, processAttack } from './combat.js';
import { ENEMY_DATA } from '../../data/enemies.js';
import { setText, setFill, log } from './utils.js';
import { applyRandomAffixes, AFFIXES } from './affixes.js';
import { gainProficiency, getProficiency } from './systems/proficiency.js';

// Adventure zones and enemy data
export const ADVENTURE_ZONES = [
  {
    name: 'Peaceful Lands',
    description: 'A serene area perfect for beginners',
    unlockReq: { zone: 0, area: 0 },
    areas: [
      { name: 'Forest Edge', enemy: 'Forest Rabbit', killReq: 5 },
      { name: 'Meadow Path', enemy: 'Wild Boar', killReq: 8 },
      { name: 'Creek Crossing', enemy: 'River Frog', killReq: 10 },
      { name: 'Flower Field', enemy: 'Honey Bee', killReq: 12 },
      { name: 'Old Oak Grove', enemy: 'Tree Sprite', killReq: 15 },
      { name: 'Mossy Rocks', enemy: 'Stone Lizard', killReq: 18 },
      { name: 'Babbling Brook', enemy: 'Water Snake', killReq: 20 },
      { name: 'Sunny Clearing', enemy: 'Grass Wolf', killReq: 25 },
      { name: 'Ancient Ruins', enemy: 'Ruin Guardian', killReq: 30 },
      { name: 'Forest Heart', enemy: 'Forest Spirit', killReq: 40 }
    ]
  },
  {
    name: 'Dark Woods',
    description: 'Twisted trees hide dangerous creatures',
    unlockReq: { zone: 0, area: 10 },
    areas: [
      { name: 'Shadow Path', enemy: 'Shadow Wolf', killReq: 50 },
      { name: 'Twisted Grove', enemy: 'Dark Treant', killReq: 60 },
      { name: 'Cursed Pond', enemy: 'Cursed Toad', killReq: 70 },
      { name: 'Thorn Thicket', enemy: 'Thorn Beast', killReq: 80 },
      { name: "Witch's Hut", enemy: 'Corrupted Familiar', killReq: 90 },
      { name: 'Dead Tree Circle', enemy: 'Wraith', killReq: 100 },
      { name: 'Nightmare Clearing', enemy: 'Nightmare Hound', killReq: 120 },
      { name: 'Bone Yard', enemy: 'Skeleton Warrior', killReq: 140 },
      { name: 'Dark Altar', enemy: 'Dark Cultist', killReq: 160 },
      { name: "Shadow Lord's Lair", enemy: 'Shadow Lord', killReq: 200 }
    ]
  },
  {
    name: 'Mountain Peaks',
    description: 'High altitude challenges await the brave',
    unlockReq: { zone: 1, area: 10 },
    areas: [
      { name: 'Rocky Trail', enemy: 'Mountain Goat', killReq: 250 },
      { name: 'Wind Caves', enemy: 'Wind Elemental', killReq: 300 },
      { name: 'Ice Fields', enemy: 'Frost Bear', killReq: 350 },
      { name: 'Crystal Cavern', enemy: 'Crystal Golem', killReq: 400 },
      { name: "Eagle's Nest", enemy: 'Giant Eagle', killReq: 450 },
      { name: 'Storm Peak', enemy: 'Lightning Hawk', killReq: 500 },
      { name: 'Avalanche Zone', enemy: 'Ice Titan', killReq: 600 },
      { name: "Dragon's Perch", enemy: 'Young Dragon', killReq: 700 },
      { name: 'Sky Temple', enemy: 'Sky Guardian', killReq: 800 },
      { name: 'Peak Summit', enemy: 'Mountain King', killReq: 1000 }
    ]
  }
];

// Fist proficiency handling
export function updateFistProficiencyDisplay() {
  const { value, bonus } = getProficiency('fist', S);
  setText('fistLevel', Math.floor(value));
  setText('fistExp', value.toFixed(0));
  setText('fistExpMax', '');
  setFill('fistExpFill', Math.min(value / 100, 1));
  setText('fistBonus', bonus.toFixed(2));
}

// Adventure zone and area UI helpers
function ensureAdventure() {
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

export function updateZoneButtons() {
  ensureAdventure();
  const zoneContainer = document.getElementById('zoneButtons');
  if (zoneContainer) {
    zoneContainer.innerHTML = '';
    ADVENTURE_ZONES.forEach((zone, index) => {
      if (index < (S.adventure.zonesUnlocked || 1)) {
        const button = document.createElement('button');
        button.className = 'btn zone-btn' + (index === (S.adventure.selectedZone || 0) ? ' active' : '');
        button.textContent = zone.name;
        button.onclick = () => selectZone(index);
        zoneContainer.appendChild(button);
      }
    });
  }
}

export function updateAreaGrid() {
  ensureAdventure();
  const areaContainer = document.getElementById('areaGrid');
  if (areaContainer) {
    const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
    if (currentZone && currentZone.areas) {
      areaContainer.innerHTML = '';
      currentZone.areas.forEach((area, index) => {
        const button = document.createElement('button');
        const areaKey = `${S.adventure.selectedZone}-${index}`;
        const isUnlocked = S.adventure.unlockedAreas[areaKey] || false;
        const isActive = index === (S.adventure.selectedArea || 0);
        const progress = S.adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };
        
        button.className = 'btn area-btn' + (isActive ? ' active' : '') + (!isUnlocked ? ' disabled' : '');
        button.textContent = area.name;
        button.disabled = !isUnlocked;
        
        if (isUnlocked) {
          const statusText = progress.bossDefeated ? ' ✓' : (progress.kills >= area.killReq ? ' 👹' : ` (${progress.kills}/${area.killReq})`);
          button.textContent += statusText;
          button.onclick = () => selectArea(index);
        } else {
          button.textContent += ' 🔒';
        }
        
        areaContainer.appendChild(button);
      });
    }
  }
}

// MAP-UI-UPDATE: New horizontal progress bar functionality
export function updateAdventureProgressBar() {
  ensureAdventure();
  const progressBar = document.getElementById('adventureProgressBar');
  if (!progressBar) return;
  
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
  if (!currentZone || !currentZone.areas) return;
  
  progressBar.innerHTML = '';
  
  // Create segments for each area in the current zone
  currentZone.areas.forEach((area, index) => {
    const areaKey = `${S.adventure.selectedZone}-${index}`;
    const isUnlocked = S.adventure.unlockedAreas[areaKey] || false;
    const isCurrent = index === (S.adventure.currentArea || 0) && (S.adventure.selectedZone === S.adventure.currentZone);
    const progress = S.adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };
    
    const segment = document.createElement('div');
    segment.className = 'progress-segment';
    
    if (isUnlocked) {
      segment.classList.add('unlocked');
      segment.textContent = area.name.split(' ')[0]; // Show first word of area name
      segment.title = `${area.name} - ${progress.kills}/${area.killReq} kills`;
      
      if (progress.bossDefeated) {
        segment.innerHTML += ' ✓';
      }
    } else {
      segment.classList.add('locked');
      segment.innerHTML = '<span class="lock-icon">🔒</span>';
      segment.title = `${area.name} - Locked`;
    }
    
    if (isCurrent) {
      segment.classList.add('current');
      
      // Add player icon to current segment
      const playerIcon = document.createElement('div');
      playerIcon.className = 'player-icon';
      playerIcon.innerHTML = '🪷'; // Lotus icon
      segment.appendChild(playerIcon);
    }
    
    // Add click handler for unlocked areas
    if (isUnlocked) {
      segment.onclick = () => selectArea(index);
      segment.style.cursor = 'pointer';
    }
    
    progressBar.appendChild(segment);
  });
  
  // Update kill progress display
  const currentArea = currentZone.areas[S.adventure.currentArea || 0];
  const currentAreaKey = `${S.adventure.currentZone}-${S.adventure.currentArea}`;
  const currentProgress = S.adventure.areaProgress[currentAreaKey] || { kills: 0, bossDefeated: false };
  
  const killsDisplay = document.getElementById('killsRequired');
  if (killsDisplay && currentArea) {
    killsDisplay.textContent = `${currentProgress.kills}/${currentArea.killReq}`;
  }
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
  const playerAttack = calculatePlayerCombatAttack();
  const playerAttackRate = calculatePlayerAttackRate();
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

export function updateAdventureCombat() {
  if (!S.adventure || !S.adventure.inCombat) return;
  if (S.adventure.currentEnemy && S.adventure.enemyHP > 0) {
    const playerAttack = calculatePlayerCombatAttack();
    const playerAttackRate = calculatePlayerAttackRate();
    const now = Date.now();
    if (!S.adventure.lastPlayerAttack) S.adventure.lastPlayerAttack = now;
    if (!S.adventure.lastEnemyAttack) S.adventure.lastEnemyAttack = now;
    const enemyDef = S.adventure.currentEnemy.defense || 0;
    const regen = S.adventure.currentEnemy.regen || 0;
    if (regen) {
      S.adventure.enemyHP = Math.min(S.adventure.enemyMaxHP, S.adventure.enemyHP + regen * S.adventure.enemyMaxHP);
    }
    if (now - S.adventure.lastPlayerAttack >= (1000 / playerAttackRate)) {
      const dmg = Math.max(1, Math.round(playerAttack - enemyDef * 0.6));
      S.adventure.enemyHP = processAttack(S.adventure.enemyHP, dmg);
      S.adventure.lastPlayerAttack = now;
      gainProficiency('fist', Math.round(playerAttack), S);
      updateFistProficiencyDisplay();
      S.adventure.combatLog = S.adventure.combatLog || [];
      S.adventure.combatLog.push(`You deal ${dmg} damage to ${S.adventure.currentEnemy.name}`);
      if (S.adventure.enemyHP <= 0) {
        defeatEnemy();
      }
    }
    if (S.adventure.enemyHP > 0 && S.adventure.currentEnemy) {
      const enemyAttackRate = S.adventure.currentEnemy.attackRate || 1.0;
      if (now - S.adventure.lastEnemyAttack >= (1000 / enemyAttackRate)) {
        const enemyDamage = Math.round(S.adventure.currentEnemy.attack || 5);
        S.adventure.playerHP = processAttack(S.adventure.playerHP, enemyDamage);
        S.hp = S.adventure.playerHP;
        S.adventure.lastEnemyAttack = now;
        S.adventure.combatLog.push(`${S.adventure.currentEnemy.name} deals ${enemyDamage} damage to you`);
        if (S.adventure.playerHP <= 0) {
          S.adventure.inCombat = false;
          S.adventure.combatLog.push('You have been defeated!');
          log('Defeated in combat! Returning to safety...', 'bad');
        }
      }
    }
  }
}

function defeatEnemy() {
  if (!S.adventure || !S.adventure.currentEnemy) return;
  const enemy = S.adventure.currentEnemy;
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
    const currentZone = ADVENTURE_ZONES[S.adventure.currentZone];
    if (currentZone && currentZone.areas) {
      const nextAreaIndex = S.adventure.currentArea + 1;
      if (nextAreaIndex < currentZone.areas.length) {
        const nextAreaKey = `${S.adventure.currentZone}-${nextAreaIndex}`;
        S.adventure.unlockedAreas[nextAreaKey] = true;
        log(`New area unlocked: ${currentZone.areas[nextAreaIndex].name}!`, 'excellent');
      } else {
        // Unlock first area of next zone
        const nextZoneIndex = S.adventure.currentZone + 1;
        if (nextZoneIndex < ADVENTURE_ZONES.length) {
          const nextZoneAreaKey = `${nextZoneIndex}-0`;
          S.adventure.unlockedAreas[nextZoneAreaKey] = true;
          S.adventure.zonesUnlocked = Math.max(S.adventure.zonesUnlocked, nextZoneIndex + 1);
          log(`New zone unlocked: ${ADVENTURE_ZONES[nextZoneIndex].name}!`, 'excellent');
        }
      }
    }
  }
  
  S.adventure.bestiary = S.adventure.bestiary || {};
  const enemyType = enemy.type || enemy.name;
  S.adventure.bestiary[enemyType] = (S.adventure.bestiary[enemyType] || 0) + 1;
  updateBestiaryList();
  S.adventure.combatLog = S.adventure.combatLog || [];
  
  const lootEntries = enemy.loot ? Object.entries(enemy.loot) : [];
  lootEntries.forEach(([item, qty]) => {
    S[item] = (S[item] || 0) + qty;
  });
  
  if (enemy.drops) {
    Object.entries(enemy.drops).forEach(([item, chance]) => {
      if (Math.random() < chance) {
        S[item] = (S[item] || 0) + 1;
        lootEntries.push([item, 1]);
      }
    });
  }
  
  // Boss bonus rewards
  if (isBoss) {
    const bonusXP = Math.floor(enemy.attack * 2);
    gainProficiency('fist', bonusXP, S);
    updateFistProficiencyDisplay();
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
  
  if (S.activities.adventure && S.adventure.playerHP > 0 && !isBoss) {
    startAdventureCombat();
    updateActivityAdventure();
  }
}

export function generateBossEnemy() {
  if (!S.adventure) return null;
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
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
}

export function startAdventureCombat() {
  if (!S.adventure) return;
  S.adventure.selectedZone = S.adventure.selectedZone || 0;
  S.adventure.selectedArea = S.adventure.selectedArea || 0;
  S.adventure.currentZone = S.adventure.selectedZone;
  S.adventure.currentArea = S.adventure.selectedArea;
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone];
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
}

export function progressToNextArea() {
  if (!S.adventure) return;
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
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
  } else if (S.adventure.selectedZone < ADVENTURE_ZONES.length - 1) {
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
    const newZone = ADVENTURE_ZONES[S.adventure.selectedZone];
    log(`Advanced to ${newZone.name}!`, 'excellent');
  } else {
    log('You have reached the end of available content!', 'neutral');
  }
  updateActivityAdventure();
}

export function selectArea(areaIndex) {
  if (!S.adventure) return;
  
  const areaKey = `${S.adventure.selectedZone}-${areaIndex}`;
  const isUnlocked = S.adventure.unlockedAreas[areaKey] || false;
  
  if (!isUnlocked) {
    log('This area is locked! Complete previous areas first.', 'bad');
    return;
  }
  
  S.adventure.selectedArea = areaIndex;
  S.adventure.currentArea = areaIndex;
  
  // Load kills for this area
  const progress = S.adventure.areaProgress[areaKey] || { kills: 0, bossDefeated: false };
  S.adventure.killsInCurrentArea = progress.kills;
  
  updateActivityAdventure();
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
  if (currentZone && currentZone.areas && currentZone.areas[areaIndex]) {
    const selectedArea = currentZone.areas[areaIndex];
    log(`Selected area: ${selectedArea.name}`, 'good');
  }
}

export function selectZone(zoneIndex) {
  if (!S.adventure) return;
  S.adventure.selectedZone = zoneIndex;
  S.adventure.currentZone = zoneIndex;
  S.adventure.selectedArea = 0;
  S.adventure.currentArea = 0;
  S.adventure.killsInCurrentArea = 0;
  updateActivityAdventure();
  const selectedZone = ADVENTURE_ZONES[zoneIndex];
  if (selectedZone) {
    log(`Selected zone: ${selectedZone.name}`, 'good');
  }
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
    log('Retreated from combat safely.', 'neutral');
  }
}

export function updateProgressButton() {
  if (!S.adventure) return;
  const progressBtn = document.getElementById('progressButton');
  const bossBtn = document.getElementById('challengeBossButton');
  if (!progressBtn) return;
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
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
    if (isAreaCleared && !isBossDefeated && !S.adventure.inCombat) {
      bossBtn.style.display = 'inline-block';
      bossBtn.disabled = false;
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
      if (tabName === 'equipment') {
        updateFoodSlots();
      }
    };
  });
  tabsInitialized = true;
}

export function updateFoodSlots() {
  if (!S.foodSlots) {
    S.foodSlots = {
      slot1: null,
      slot2: null,
      slot3: null,
      lastUsed: 0,
      cooldown: 5000
    };
  }
  setText('rawMeatCount', S.meat || 0);
  setText('inventoryRawMeat', S.meat || 0);
  setText('inventoryCookedMeat', S.cookedMeat || 0);
  setText('inventoryRawMeatAdventure', S.meat || 0);
  setText('inventoryCookedMeatAdventure', S.cookedMeat || 0);
  const cookInput = document.getElementById('cookAmount');
  if (cookInput) {
    cookInput.max = S.meat || 0;
    if (parseInt(cookInput.value) > (S.meat || 0)) {
      cookInput.value = Math.max(1, S.meat || 0);
    }
  }
}

function findEnemyInfo(type) {
  for (const zone of ADVENTURE_ZONES) {
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
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || S.adventure.currentZone || 0];
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
  setText('currentWeapon', 'Fists');
  const fistBase = 5 + getFistBonuses().damage;
  setText('baseDamage', fistBase);
  setText('physiqueDamageBonus', `+${Math.floor((S.stats.physique - 10) * 2)}`);
  updateFistProficiencyDisplay();
  updateZoneButtons();
  updateAreaGrid();
  updateAdventureProgressBar(); // MAP-UI-UPDATE
  updateBattleDisplay();
  updateAdventureCombat();
  updateFoodSlots();
  updateProgressButton();
  updateBestiaryList();
}
