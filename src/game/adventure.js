import { S } from './state.js';
import { calculatePlayerCombatAttack, calculatePlayerAttackRate, getFistBonuses } from './engine.js';
import { initializeFight, processAttack } from './combat.js';
import { ENEMY_DATA } from '../../data/enemies.js';
import { setText, setFill, log } from './utils.js';
import { applyRandomAffixes, AFFIXES } from './affixes.js';

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
export function gainFistXP(amount) {
  if (!S.proficiencies) return;
  const prof = S.proficiencies.fist;
  prof.exp += amount;
  while (prof.exp >= prof.expMax) {
    prof.exp -= prof.expMax;
    prof.level++;
    prof.expMax = Math.floor(prof.expMax * 1.5);
    log(`Fist proficiency reached level ${prof.level}!`, 'good');
  }
  updateFistProficiencyDisplay();
}

export function updateFistProficiencyDisplay() {
  if (!S.proficiencies) return;
  const prof = S.proficiencies.fist;
  setText('fistLevel', prof.level);
  setText('fistExp', Math.floor(prof.exp));
  setText('fistExpMax', prof.expMax);
  setFill('fistExpFill', prof.exp / prof.expMax);
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
      inCombat: false
    };
  }
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
        button.className = 'btn area-btn' + (index === (S.adventure.selectedArea || 0) ? ' active' : '');
        button.textContent = area.name;
        button.onclick = () => selectArea(index);
        areaContainer.appendChild(button);
      });
    }
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
      gainFistXP(Math.round(playerAttack));
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
  S.adventure.totalKills++;
  S.adventure.killsInCurrentArea++;
  S.adventure.bestiary = S.adventure.bestiary || {};
  const enemyType = enemy.type || enemy.name;
  S.adventure.bestiary[enemyType] = (S.adventure.bestiary[enemyType] || 0) + 1;
  updateBestiaryList();
  S.adventure.combatLog = S.adventure.combatLog || [];
  S.adventure.combatLog.push(`${enemy.name} defeated!`);
  if (enemy.drops && enemy.drops.meat && Math.random() < enemy.drops.meat) {
    const meatGained = 1;
    S.meat = (S.meat || 0) + meatGained;
    S.adventure.combatLog.push(`Found ${meatGained} raw meat!`);
  }
  S.hp = S.adventure.playerHP;
  S.adventure.inCombat = false;
  S.adventure.currentEnemy = null;
  const { enemyHP, enemyMax } = initializeFight({ hp: 0 });
  S.adventure.enemyHP = enemyHP;
  S.adventure.enemyMaxHP = enemyMax;
  log(`Defeated ${enemy.name}! Kills: ${S.adventure.totalKills}`, 'good');
  if (S.activities.adventure && S.adventure.playerHP > 0) {
    startAdventureCombat();
    updateActivityAdventure();
  }
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
  log(`Combat started with ${enemyData.name} in ${currentArea.name}!`, 'neutral');
}

export function progressToNextArea() {
  if (!S.adventure) return;
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
  if (!currentZone || !currentZone.areas) return;
  const currentArea = currentZone.areas[S.adventure.selectedArea || 0];
  if (!currentArea) return;
  if (S.adventure.killsInCurrentArea < currentArea.killReq) {
    log('Area not yet cleared! Defeat more enemies first.', 'bad');
    return;
  }
  if (S.adventure.selectedArea < currentZone.areas.length - 1) {
    S.adventure.selectedArea++;
    S.adventure.currentArea = S.adventure.selectedArea;
    S.adventure.killsInCurrentArea = 0;
    S.adventure.areasCompleted++;
    const newArea = currentZone.areas[S.adventure.selectedArea];
    log(`Advanced to ${newArea.name}!`, 'good');
  } else if (S.adventure.selectedZone < ADVENTURE_ZONES.length - 1) {
    S.adventure.selectedZone++;
    S.adventure.currentZone = S.adventure.selectedZone;
    S.adventure.selectedArea = 0;
    S.adventure.currentArea = 0;
    S.adventure.killsInCurrentArea = 0;
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
  S.adventure.selectedArea = areaIndex;
  S.adventure.currentArea = areaIndex;
  S.adventure.killsInCurrentArea = 0;
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
  const progressBtn = document.getElementById('progressToNextStageBtn');
  if (!progressBtn) return;
  const currentZone = ADVENTURE_ZONES[S.adventure.selectedZone || 0];
  if (!currentZone || !currentZone.areas) return;
  const currentArea = currentZone.areas[S.adventure.selectedArea || 0];
  if (!currentArea) return;
  const isAreaCleared = S.adventure.killsInCurrentArea >= currentArea.killReq;
  progressBtn.disabled = !isAreaCleared;
  progressBtn.textContent = isAreaCleared ? 'Progress to Next Area' : `Clear Area (${S.adventure.killsInCurrentArea}/${currentArea.killReq})`;
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
  updateBattleDisplay();
  updateAdventureCombat();
  updateFoodSlots();
  updateProgressButton();
  updateBestiaryList();
}
