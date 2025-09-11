import { S, save } from '../../shared/state.js';
import { calculatePlayerCombatAttack, calculatePlayerAttackRate, qCap } from '../progression/selectors.js';
import { initializeFight, processAttack } from '../combat/mutators.js';
import { refillShieldFromQi, ARMOR_K, ARMOR_CAP } from '../combat/logic.js';
import { getEquippedWeapon } from '../inventory/selectors.js';
import { getAbilitySlots, getAbilityDamage } from '../ability/selectors.js';
import { getWeaponProficiencyBonuses } from '../proficiency/selectors.js';
import { rollLoot, toLootTableKey } from '../loot/logic.js'; // WEAPONS-INTEGRATION
import { WEAPONS } from '../weaponGeneration/data/weapons.js'; // WEAPONS-INTEGRATION
import { rollGearDropForZone } from '../gearGeneration/selectors.js';
import { addToInventory } from '../inventory/mutators.js';
import { ABILITIES } from '../ability/data/abilities.js';
import { performAttack } from '../combat/attack.js'; // STATUS-REFORM
import { tickStunDecay, initStun, STUN_THRESHOLD, DECAY_PER_SECOND } from '../../engine/combat/stun.js';
import { chanceToHit, DODGE_BASE } from '../combat/hit.js';
import { tryCastAbility, processAbilityQueue } from '../ability/mutators.js';
import { ENEMY_DATA } from './data/enemies.js';
import { setText, setFill, log } from '../../shared/utils/dom.js';
import { on, emit } from '../../shared/events.js';
import { applyRandomAffixes } from '../affixes/logic.js';
import { AFFIXES } from '../affixes/data/affixes.js';
import { gainProficiency, gainProficiencyFromEnemy } from '../proficiency/mutators.js';
import { ZONES, getZoneById, getAreaById, getDungeonById, isZoneUnlocked, isAreaUnlocked } from './data/zones.js'; // MAP-UI-UPDATE
import { ZONES as ZONE_IDS } from './data/zoneIds.js';
import { addSessionLoot, claimSessionLoot, forfeitSessionLoot } from '../loot/mutators.js'; // EQUIP-CHAR-UI
import { updateLootTab } from '../loot/ui/lootTab.js';
import { renderPillIcons } from '../alchemy/ui/pillIcons.js';
import {
  playSlashArc,
  playThrustLine,
  playPalmHit,
  playRingShockwave,
  playBeam,
  playChakram,
  playShieldDome,
  playSparkBurst,
  playFireball,
  setFxTint,
  showFloatingText
} from '../combat/ui/index.js';
import { updateZoneButtons, updateAreaGrid } from './ui/zoneUI.js';
import { updateAdventureProgressBar } from './ui/progressBar.js';
import { updateFoodSlots } from '../cooking/ui/cookControls.js';
import { stopActivity as stopActivityMut } from '../activity/mutators.js';

// Use centralized zone data from zones.js - old ADVENTURE_ZONES removed

const RARITY_NAMES = ['normal', 'magic', 'rare', 'epic', 'legendary'];

export const COMMON_CORE_CHANCE = 0.01;
export const MAGIC_CORE_CHANCE = 0.05;
export const RARE_CORE_CHANCE = 0.1;
export const EPIC_CORE_CHANCE = 0.2;
export const LEGENDARY_CORE_CHANCE = 0.3;

const CORE_DROP_CHANCE = {
  normal: COMMON_CORE_CHANCE,
  magic: MAGIC_CORE_CHANCE,
  rare: RARE_CORE_CHANCE,
  epic: EPIC_CORE_CHANCE,
  legendary: LEGENDARY_CORE_CHANCE,
};

const ENEMY_RARITY_COLORS = {
  normal: '',
  magic: '#3b82f6',
  rare: '#fbbf24',
  epic: '#a855f7',
  legendary: '#f87171',
};

function rarityFromAffixCount(count) {
  return RARITY_NAMES[Math.min(count, RARITY_NAMES.length - 1)];
}

const loggedResistTypes = new Set();
const DUNGEON_COOLDOWN_MS = 60 * 60 * 1000;
const AILMENT_ICONS = {
  poison: '☠️',
  burn: '🔥',
  chill: '❄️',
  entomb: '🪨',
  ionize: '⚡',
  enfeeble: '💀',
  stun: '💢',
  interrupt: '🚫'
};
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

on('ABILITY:FX', ({ abilityKey }) => {
  if (abilityKey === 'lightningStep') {
    const pos = getCombatPositions();
    if (pos) {
      setFxTint(pos.svg, 'yellow');
      playSparkBurst(pos.svg, pos.from);
    }
  } else if (abilityKey === 'fireball') {
    const pos = getCombatPositions();
    if (pos) {
      const svgRect = pos.svg.getBoundingClientRect();
      const enemyEl = document.querySelector('.combatant.enemy');
      if (enemyEl) {
        const eRect = enemyEl.getBoundingClientRect();
        const to = {
          x: ((eRect.left + eRect.width / 2 - svgRect.left) / svgRect.width) * 100,
          y: ((eRect.top + eRect.height / 2 - svgRect.top) / svgRect.height) * 50,
        };
        setFxTint(pos.svg, 'red');
        playFireball(pos.svg, pos.from, to);
      }
    }
  }
});

function showCastBar(castTimeMs) {
  const bar = document.getElementById('playerCastBar');
  const fill = document.getElementById('playerCastFill');
  const enemyBar = document.getElementById('enemyCastBar');
  if (enemyBar) enemyBar.style.display = 'none';
  if (!bar || !fill) return;
  bar.style.display = 'block';
  fill.style.transition = 'none';
  fill.style.width = '0%';
  void fill.offsetWidth;
  fill.style.transition = `width ${castTimeMs}ms linear`;
  fill.style.width = '100%';
}

function hideCastBar() {
  const bar = document.getElementById('playerCastBar');
  const fill = document.getElementById('playerCastFill');
  if (!bar || !fill) return;
  fill.style.transition = 'none';
  fill.style.width = '0%';
  bar.style.display = 'none';
}

on('CAST:START', ({ castTimeMs }) => showCastBar(castTimeMs));
on('CAST:END', hideCastBar);

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
      unlockedAreas: { "0-0": true }, // Track unlocked areas
      discoveredDungeons: [],
      dungeonCooldowns: {}
    };
  }
  // Ensure new properties exist for existing saves
  if (!S.adventure.areaProgress) S.adventure.areaProgress = {};
  if (!S.adventure.unlockedAreas) S.adventure.unlockedAreas = { "0-0": true };
  if (!S.adventure.discoveredDungeons) S.adventure.discoveredDungeons = [];
  if (!S.adventure.dungeonCooldowns) S.adventure.dungeonCooldowns = {};
}

function renderAilments(entity, id) {
  const el = document.getElementById(id);
  if (!el) return;
  const now = Date.now();
  const pieces = [];
  if (entity?.statuses) {
    for (const [key, inst] of Object.entries(entity.statuses)) {
      const dur = inst.duration ?? 0;
      if (dur <= 0) continue;
      const icon = AILMENT_ICONS[key] || '❔';
      pieces.push(`<div class="ailment" title="${key}"><span class="icon">${icon}</span><span class="stack">${inst.stacks || 1}</span><span class="duration">${dur.toFixed(1)}s</span></div>`);
    }
  }
  if (entity?.ailments) {
    for (const [key, inst] of Object.entries(entity.ailments)) {
      const icon = AILMENT_ICONS[key] || '❔';
      let remaining = inst.expires;
      if (remaining > 1e6) remaining = (remaining - now) / 1000;
      pieces.push(`<div class="ailment" title="${key}"><span class="icon">${icon}</span><span class="stack">${inst.stacks || 1}</span><span class="duration">${remaining.toFixed(1)}s</span></div>`);
    }
  }
  el.innerHTML = pieces.join('');
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
  const hpFrac = playerMaxHP ? playerHP / playerMaxHP : 0;
  const shieldMax = S.shield?.max || 0;
  const shieldCur = S.shield?.current || 0;
  const shieldFrac = shieldMax ? shieldCur / shieldMax : 0;
  setText('playerName', 'You');
  setText('playerHealthText', `${Math.round(playerHP)}/${Math.round(playerMaxHP)}`);
  setFill('playerHealthFill', hpFrac);
  setFill('advHpMaskRect', hpFrac);
  setFill('advShieldFill', shieldFrac);
  const advOverlay = document.getElementById('advShieldOverlay');
  if (advOverlay) advOverlay.style.display = shieldFrac > 0 ? '' : 'none';
  const playerQi = S.qi || 0;
  const playerMaxQi = qCap(S);
  setText('playerQiText', `${Math.round(playerQi)}/${Math.round(playerMaxQi)}`);
  const playerQiFill = document.getElementById('playerQiFill');
  if (playerQiFill) {
    const playerQiPct = playerMaxQi ? (playerQi / playerMaxQi) * 100 : 0;
    playerQiFill.style.width = `${playerQiPct}%`;
  }
  renderPillIcons(S, 'adventurePillIcons', 'adventure');
  const playerStunFill = document.getElementById('playerStunFill');
  const playerStunBarEl = document.getElementById('playerStunBar');
  const playerStunGauge = S.adventure.playerStunBar || 0;
  if (playerStunFill) {
    const pct = playerStunGauge / STUN_THRESHOLD;
    playerStunFill.style.width = `${pct * 100}%`;
    const hue = 39 * (1 - pct);
    playerStunFill.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
  }
  if (playerStunBarEl) {
    const show = S.adventure.inCombat && playerStunGauge > 1;
    playerStunBarEl.style.display = show ? 'block' : 'none';
    playerStunBarEl.classList.toggle('stun-flash', playerStunGauge >= STUN_THRESHOLD * 0.9 && playerStunGauge < STUN_THRESHOLD);
    playerStunBarEl.classList.toggle('stun-shake', playerStunGauge >= STUN_THRESHOLD);
    const statuses = S.statuses || {};
    const info = [
      `Gauge: ${Math.round(playerStunGauge)}`,
      `Threshold: ${STUN_THRESHOLD}`,
      `Decay: ${DECAY_PER_SECOND}/s`
    ];
    if (statuses.stunWeakened) info.push('stunWeakened active');
    if (statuses.stunImmune) info.push('stunImmune active');
    playerStunBarEl.title = info.join('\n');
  }
  const atkProfile = calculatePlayerCombatAttack(S);
  const playerPhysAtk = atkProfile.phys;
  const totalAtk = atkProfile.phys + Object.values(atkProfile.elems).reduce((a, b) => a + b, 0);
  let playerAttackRate = calculatePlayerAttackRate(S);
  if (S.lightningStep) {
    playerAttackRate *= S.lightningStep.attackSpeedMult;
  }
  const atkEl = document.getElementById('playerAttack');
  if (atkEl) atkEl.title = `ATK: ${Math.round(totalAtk)}`;
  const rateEl = document.getElementById('playerAttackRate');
  if (rateEl) rateEl.title = `Rate: ${playerAttackRate.toFixed(1)}/s`;
  setText('combatAttackRate', `${playerAttackRate.toFixed(1)}/s`);
  setText('qiShield', `${S.shield?.current || 0}/${S.shield?.max || 0}`);
  renderAilments(S, 'playerAilments');

  // Calculate physical mitigation against the strongest enemy in the current zone
  let mitPct = 0;
  const armor = S.derivedStats?.armor || 0;
  const zone = ZONES[S.adventure.currentZone];
  if (armor > 0 && zone?.areas?.length) {
    let maxEnemyAtk = 0;
    zone.areas.forEach(a => {
      const atk = ENEMY_DATA[a.enemy]?.attack || 0;
      if (atk > maxEnemyAtk) maxEnemyAtk = atk;
    });
    if (maxEnemyAtk > 0) {
      mitPct = Math.min(ARMOR_CAP, armor / (armor + ARMOR_K * maxEnemyAtk));
    }
  }
  const mitEl = document.getElementById('playerMitigation');
  if (mitEl) mitEl.title = `Mit: ${Math.round(mitPct * 100)}%`;
  if (S.adventure.inCombat && S.adventure.currentEnemy) {
    const enemy = S.adventure.currentEnemy;
    const enemyHP = S.adventure.enemyHP || 0;
    const enemyMaxHP = S.adventure.enemyMaxHP || 0;
    const nameEl = document.getElementById('enemyName');
    if (nameEl) {
      const rarity = enemy.rarity || 'normal';
      const prefix = rarity !== 'normal' ? `${rarity[0].toUpperCase()}${rarity.slice(1)} ` : '';
      const color = ENEMY_RARITY_COLORS[rarity];
      const inner = `${prefix}${enemy.name || 'Unknown Enemy'}`;
      nameEl.innerHTML = color ? `<span class="rarity-${rarity}">${inner}</span>` : inner;
    }
    setText('enemyHealthText', `${Math.round(enemyHP)}/${Math.round(enemyMaxHP)}`);
    const enemyAtkEl = document.getElementById('enemyAttack');
    if (enemyAtkEl) enemyAtkEl.title = `ATK: ${Math.round(enemy.attack || 0)}`;
    const enemyRateEl = document.getElementById('enemyAttackRate');
    if (enemyRateEl) enemyRateEl.title = `Rate: ${(enemy.attackRate || 1.0).toFixed(1)}/s`;
    const enemyMitEl = document.getElementById('enemyMitigation');
    if (enemyMitEl) {
      let eMitPct = 0;
      const eArmor = enemy.armor || 0;
      if (eArmor > 0 && playerPhysAtk > 0) {
        eMitPct = Math.min(ARMOR_CAP, eArmor / (eArmor + ARMOR_K * playerPhysAtk));
      }
      enemyMitEl.title = `Mit: ${Math.round(eMitPct * 100)}%`;
    }
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
    const stunFill = document.getElementById('enemyStunFill');
    const stunBarEl = document.getElementById('enemyStunBar');
    const stunGauge = S.adventure.enemyStunBar || 0;
    if (stunFill) {
      const pct = stunGauge / STUN_THRESHOLD;
      stunFill.style.width = `${pct * 100}%`;
      const hue = 39 * (1 - pct);
      stunFill.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    }
    if (stunBarEl) {
      const show = stunGauge > 1;
      stunBarEl.style.display = show ? 'block' : 'none';
      stunBarEl.classList.toggle('stun-flash', stunGauge >= STUN_THRESHOLD * 0.9 && stunGauge < STUN_THRESHOLD);
      stunBarEl.classList.toggle('stun-shake', stunGauge >= STUN_THRESHOLD);
      const statuses = enemy.statuses || {};
      const info = [
        `Gauge: ${Math.round(stunGauge)}`,
        `Threshold: ${STUN_THRESHOLD}`,
        `Decay: ${DECAY_PER_SECOND}/s`
      ];
      if (statuses.stunWeakened) info.push('stunWeakened active');
      if (statuses.stunImmune) info.push('stunImmune active');
      stunBarEl.title = info.join('\n');
    }
  } else {
    setText('enemyName', 'Select an area to begin');
    setText('enemyHealthText', '--/--');
    const enemyAtkEl = document.getElementById('enemyAttack');
    if (enemyAtkEl) enemyAtkEl.title = 'ATK: --';
    const enemyRateEl = document.getElementById('enemyAttackRate');
    if (enemyRateEl) enemyRateEl.title = 'Rate: --/s';
    const enemyMitEl = document.getElementById('enemyMitigation');
    if (enemyMitEl) enemyMitEl.title = 'Mit: --';
    const enemyHealthFill = document.getElementById('enemyHealthFill');
    if (enemyHealthFill) enemyHealthFill.style.width = '0%';
    const enemyQiFill = document.getElementById('enemyQiFill');
    setText('enemyQiText', '--');
    if (enemyQiFill) enemyQiFill.style.width = '0%';
    const affixEl = document.getElementById('enemyAffixes');
    if (affixEl) affixEl.innerHTML = '';
    const enemyAilEl = document.getElementById('enemyAilments');
    if (enemyAilEl) enemyAilEl.innerHTML = '';
    const enemyStunFill = document.getElementById('enemyStunFill');
    if (enemyStunFill) {
      enemyStunFill.style.width = '0%';
      enemyStunFill.style.backgroundColor = 'hsl(39, 100%, 50%)';
    }
    const enemyStunBar = document.getElementById('enemyStunBar');
    if (enemyStunBar) {
      enemyStunBar.classList.remove('stun-flash', 'stun-shake');
      enemyStunBar.title = `Gauge: 0\nThreshold: ${STUN_THRESHOLD}\nDecay: ${DECAY_PER_SECOND}/s`;
      enemyStunBar.style.display = 'none';
    }
  }
  const combatLog = document.getElementById('combatLog');
  if (combatLog && S.adventure.combatLog) {
    const recentLogs = S.adventure.combatLog.slice(-5);
    combatLog.innerHTML = recentLogs.map(l => `<div class="log-entry">${l}</div>`).join('');
    combatLog.scrollTop = combatLog.scrollHeight;
  }
}

const ABILITY_ICON_MAP = {
  'pointy-sword': '🗡️',
  'game-icons:mighty-force': '💥',
  'game-icons:fireball': '🔥',
};

function renderAbilityIcon(icon) {
  if (ABILITY_ICON_MAP[icon]) return ABILITY_ICON_MAP[icon];
  return icon.includes(':')
    ? `<iconify-icon icon="${icon}" aria-hidden="true"></iconify-icon>`
    : icon;
}

let currentAbilityTooltip = null;
let currentAbilityKey = null;
let tooltipFromTouch = false;

function hideAbilityTooltip() {
  if (currentAbilityTooltip) {
    currentAbilityTooltip.remove();
    currentAbilityTooltip = null;
  }
  currentAbilityKey = null;
  tooltipFromTouch = false;
}

function showAbilityTooltip(anchor, abilityKey, fromTouch = false) {
  hideAbilityTooltip();
  const tooltip = document.createElement('div');
  tooltip.className = 'item-tooltip';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'tooltip-close';
  closeBtn.textContent = '✖';
  closeBtn.onclick = hideAbilityTooltip;
  tooltip.appendChild(closeBtn);

  const content = document.createElement('div');
  content.className = 'tooltip-content';
  content.innerHTML = abilityDetailsHTML(abilityKey);
  tooltip.appendChild(content);

  document.body.appendChild(tooltip);
  const rect = anchor.getBoundingClientRect();
  const tRect = tooltip.getBoundingClientRect();
  let left = rect.right + 8;
  let top = rect.top + rect.height / 2 - tRect.height / 2;
  if (left + tRect.width > window.innerWidth - 8) left = rect.left - tRect.width - 8;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  if (top + tRect.height > window.innerHeight - 8) top = window.innerHeight - tRect.height - 8;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  currentAbilityTooltip = tooltip;
  currentAbilityKey = abilityKey;
  tooltipFromTouch = fromTouch;
}

function abilityDetailsHTML(key) {
  const def = ABILITIES[key];
  if (!def) return '';
  const weapon = getEquippedWeapon(S);
  const mods = S.abilityMods?.[key] || {};
  const isSpell = def.tags?.includes('spell');
  const speedMult =
    isSpell && weapon.classKey === 'focus'
      ? getWeaponProficiencyBonuses(S).speedMult
      : 1;
  const castTimeMs = Math.round(
    def.castTimeMs *
      (1 + (mods.castTimePct || 0) / 100) /
      (1 + (S.astralTreeBonuses?.castSpeedPct || 0) / 100) /
      speedMult
  );
  const cooldownMs = Math.round(
    def.cooldownMs *
      (1 + (mods.cooldownPct || 0) / 100) *
      (1 + (S.astralTreeBonuses?.cooldownPct || 0) / 100) /
      speedMult
  );
  const dmg = getAbilityDamage(key, S);
  const rows = [];
  rows.push(`<div class="stat-row"><span class="label">Qi Cost</span><span class="value">${def.costQi}</span></div>`);
  if (castTimeMs > 0)
    rows.push(`<div class="stat-row"><span class="label">Cast</span><span class="value">${(castTimeMs / 1000).toFixed(2)}s</span></div>`);
  rows.push(`<div class="stat-row"><span class="label">Cooldown</span><span class="value">${(cooldownMs / 1000).toFixed(2)}s</span></div>`);
  if (dmg !== null)
    rows.push(`<div class="stat-row"><span class="label">Damage</span><span class="value">${dmg}</span></div>`);
  const rawIcon = renderAbilityIcon(def.icon);
  const iconHtml = rawIcon.includes('iconify-icon')
    ? rawIcon.replace('<iconify-icon', '<iconify-icon class="weapon-icon"')
    : `<span class="weapon-icon">${rawIcon}</span>`;
  const header = `<div class="tooltip-header">${iconHtml}<span class="tooltip-name">${def.displayName}</span></div>`;
  const core = `<div class="tooltip-core">${rows.join('')}</div>`;
  const desc = def.description ? `<div class="tooltip-implicit">${def.description}</div>` : '';
  const footer = def.tags?.length
    ? `<div class="tooltip-footer"><div class="tags">Tags: ${def.tags.join(', ')}</div></div>`
    : '';
  return header + core + desc + footer;
}

let lastAbilityHTML = '';
export function updateAbilityBar() {
  const bar = document.getElementById('abilityBar');
  if (!bar) return;
  const slots = getAbilitySlots(S);
  const weapon = getEquippedWeapon(S);
  let html = '';
  const slotData = [];
  slots.forEach((slot, i) => {
    if (slot.abilityKey) {
      const def = ABILITIES[slot.abilityKey];
      const dmg = getAbilityDamage(slot.abilityKey, S);
      const mods = S.abilityMods?.[slot.abilityKey] || {};
      const isSpell = def.tags?.includes('spell');
      const speedMult =
        isSpell && weapon.classKey === 'focus'
          ? getWeaponProficiencyBonuses(S).speedMult
          : 1;
      const castTimeMs = Math.round(
        def.castTimeMs *
          (1 + (mods.castTimePct || 0) / 100) /
          (1 + (S.astralTreeBonuses?.castSpeedPct || 0) / 100) /
          speedMult
      );
      const dmgLine = dmg !== null ? `<div class="ability-damage">${dmg}</div>` : '';
      const castLine = castTimeMs > 0 ? `<div class="ability-cast-time">${(castTimeMs / 1000).toFixed(2)}s</div>` : '';
      const cooldownMs = Math.round(
        def.cooldownMs *
          (1 + (mods.cooldownPct || 0) / 100) *
          (1 + (S.astralTreeBonuses?.cooldownPct || 0) / 100) /
          speedMult
      );
      let content = `
        <div class="ability-title">
          <div class="ability-name">${def.displayName}</div>
          ${dmgLine}
          ${castLine}
        </div>
        <div class="ability-icon">${renderAbilityIcon(def.icon)}</div>
        <div class="qi-badge">${def.costQi} Qi</div>
        <div class="keybind">[${i + 1}]</div>
      `;
      if (slot.cooldownRemainingMs > 0) {
        content += `<div class="cooldown-overlay">${Math.ceil(slot.cooldownRemainingMs / 1000)}</div>`;
      }
      const classes = ['ability-card'];
      if (slot.cooldownRemainingMs > 0) classes.push('cooling');
      if (slot.insufficientQi) classes.push('insufficient');
      html += `<div class="${classes.join(' ')}" data-slot="${i + 1}">${content}</div>`;
      slotData.push({ abilityKey: slot.abilityKey });
    } else {
      html += `<div class="ability-card empty" data-slot="${i + 1}">
        <div class="ability-name">—</div>
        <div class="ability-icon"></div>
        <div class="qi-badge"></div>
        <div class="keybind">[${i + 1}]</div>
      </div>`;
      slotData.push({ abilityKey: null });
    }
  });
  if (html === lastAbilityHTML) return;
  const reopenKey = tooltipFromTouch ? currentAbilityKey : null;
  hideAbilityTooltip();
  lastAbilityHTML = html;
  bar.innerHTML = html;
  Array.from(bar.children).forEach((card, i) => {
    const data = slotData[i];
    if (data.abilityKey) {
        let pressTimer;
        let longPress = false;
        let startX;
        let startY;
        const showTip = () => {
          longPress = true;
          showAbilityTooltip(card, data.abilityKey, true);
        };
      card.addEventListener('mouseenter', () => {
        tooltipFromTouch = false;
        showAbilityTooltip(card, data.abilityKey);
      });
      card.addEventListener('mouseleave', () => {
        if (!tooltipFromTouch) hideAbilityTooltip();
      });
        card.addEventListener(
          'touchstart',
          (e) => {
            e.preventDefault();
            longPress = false;
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            pressTimer = setTimeout(showTip, 500);
          },
          { passive: false }
        );
      card.addEventListener(
        'touchmove',
        (e) => {
          const t = e.touches[0];
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          if (Math.hypot(dx, dy) > 10) {
            clearTimeout(pressTimer);
          }
          e.preventDefault();
        },
        { passive: false }
      );
      card.addEventListener(
        'touchend',
        (e) => {
          clearTimeout(pressTimer);
          e.preventDefault();
          if (longPress) {
            longPress = false;
            return;
          }
          hideAbilityTooltip();
          if (tryCastAbility(data.abilityKey)) {
            S.qi -= ABILITIES[data.abilityKey].costQi;
            flashAbilityCard(i + 1);
            updateAbilityBar();
          } else {
            shakeAbilityCard(i + 1);
          }
        },
        { passive: false }
      );
      card.addEventListener('contextmenu', (e) => e.preventDefault());
      card.addEventListener('click', () => {
        if (tooltipFromTouch) {
          tooltipFromTouch = false;
          return;
        }
        hideAbilityTooltip();
        if (tryCastAbility(data.abilityKey)) {
          S.qi -= ABILITIES[data.abilityKey].costQi;
          flashAbilityCard(i + 1);
          updateAbilityBar();
        } else {
          shakeAbilityCard(i + 1);
        }
      });
    }
  });
  if (reopenKey) {
    const idx = slotData.findIndex((d) => d.abilityKey === reopenKey);
    if (idx !== -1) {
      showAbilityTooltip(bar.children[idx], reopenKey, true);
    }
  }
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
    let playerAttackRate = calculatePlayerAttackRate(S);
    if (S.lightningStep) {
      playerAttackRate *= S.lightningStep.attackSpeedMult;
    }
    const weapon = getEquippedWeapon(S);
    console.log('[weapon]', weapon.key); // WEAPONS-INTEGRATION
    const now = Date.now();
    if (S.lightningStep && S.lightningStep.expiresAt <= now) {
      delete S.lightningStep;
    }
    const deltaTime = (now - (S.adventure.lastCombatTick || now)) / 1000; // STATUS-REFORM
    S.adventure.lastCombatTick = now; // STATUS-REFORM
    tickStunDecay(S, deltaTime, now); // STATUS-REFORM
    S.adventure.playerStunBar = S.stun?.value || 0; // STATUS-REFORM
    if (S.adventure.currentEnemy) {
      tickStunDecay(S.adventure.currentEnemy, deltaTime, now); // STATUS-REFORM
      S.adventure.enemyStunBar = S.adventure.currentEnemy.stun?.value || 0; // STATUS-REFORM
    }
    if (!S.adventure.lastPlayerAttack) S.adventure.lastPlayerAttack = now;
    if (!S.adventure.lastEnemyAttack) S.adventure.lastEnemyAttack = now;
    const regen = S.adventure.currentEnemy.regen || 0;
    if (regen) {
      S.adventure.enemyHP = Math.min(S.adventure.enemyMaxHP, S.adventure.enemyHP + regen * S.adventure.enemyMaxHP);
    }
    if (!S.currentCast && now - S.adventure.lastPlayerAttack >= (1000 / playerAttackRate)) {
      S.adventure.lastPlayerAttack = now;
      const enemyDodge = (S.adventure.currentEnemy?.stats?.dodge ?? S.adventure.currentEnemy?.dodge ?? 0) + DODGE_BASE;
      const hitP = chanceToHit(S.derivedStats?.accuracy || 0, enemyDodge);
      if (Math.random() < hitP) {
        const critChance = S.attributes?.criticalChance || 0;
        const isCrit = Math.random() < critChance;
        const critMult = isCrit ? 2 : 1;
        const profile = {
          phys: S.adventure.playerAtkProfile?.phys || 0,
          elems: { ...(S.adventure.playerAtkProfile?.elems || {}) },
        };
        let externalMult = 1;
        if (S.lightningStep) {
          externalMult *= S.lightningStep.damageMult;
          const cd = S.abilityCooldowns?.lightningStep || 0;
          if (cd > 0) {
            S.abilityCooldowns.lightningStep = Math.max(0, cd - 1_000);
          }
        }
        if (S.lightningStep) {
          profile.elems.metal = (profile.elems.metal || 0) + profile.phys;
          profile.phys = 0;
        }
        const typeMults = {};
        if (profile.phys > 0) {
          typeMults.physical =
            1 + (S.astralTreeBonuses?.physicalDamagePct || 0) / 100;
        }
        for (const elem of Object.keys(profile.elems)) {
          const key = `${elem}DamagePct`;
          typeMults[elem] = 1 + (S.astralTreeBonuses?.[key] || 0) / 100;
        }
        const { total: dealt, components } = processAttack(
          profile,
          weapon,
          {
            attacker: S,
            target: S.adventure.currentEnemy,
            nowMs: now,
            typeMults,
            globalMult: externalMult * critMult,
          },
          S
        );
        gainProficiencyFromEnemy(weapon.classKey, S.adventure.enemyMaxHP, S); // WEAPONS-INTEGRATION
        S.adventure.combatLog = S.adventure.combatLog || [];
        const parts = [];
        if (components.phys) parts.push(`${components.phys} physical`);
        for (const [elem, val] of Object.entries(components.elems)) {
          parts.push(`${val} ${elem}`);
        }
        const compText = parts.length ? ` (${parts.join(', ')})` : '';
        S.adventure.combatLog.push(`You deal ${dealt} damage to ${S.adventure.currentEnemy.name}${compText}`);
        const enemyEl = document.querySelector('.combatant.enemy');
        if (enemyEl) {
          if (components.phys) {
            showFloatingText({
              targetEl: enemyEl,
              result: isCrit ? 'crit' : 'hit',
              amount: components.phys,
              element: 'phys',
            });
          }
          for (const [elem, val] of Object.entries(components.elems)) {
            if (val) {
              showFloatingText({
                targetEl: enemyEl,
                result: isCrit ? 'crit' : 'hit',
                amount: val,
                element: elem,
              });
            }
          }
        }
        S.adventure.enemyStunBar = S.adventure.currentEnemy.stun?.value || 0; // STATUS-REFORM
        performAttack(S, S.adventure.currentEnemy, { weapon, profile, isCrit, physDamage: components.phys }, S); // STATUS-REFORM
        const pos = getCombatPositions();
        if (pos) {
          setFxTint(pos.svg, weapon.animations?.tint || 'auto');
          (weapon.animations?.fx || []).forEach(fx => {
            switch (fx) {
              case 'slashArc':
                playSlashArc(pos.svg, pos.from, pos.to);
                break;
              case 'pierceThrust':
                playThrustLine(pos.svg, pos.from, pos.to);
                break;
              case 'palmStrike':
                playPalmHit(pos.svg, pos.to);
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
        const enemyEl = document.querySelector('.combatant.enemy');
        if (enemyEl) {
          showFloatingText({ targetEl: enemyEl, result: 'miss' });
        }
      }
    }
    if (S.adventure.enemyHP > 0 && S.adventure.currentEnemy) {
      const enemyAttackRate = S.adventure.currentEnemy.attackRate || 1.0;
      if (now - S.adventure.lastEnemyAttack >= (1000 / enemyAttackRate)) {
        S.adventure.lastEnemyAttack = now;
        const enemyAcc = S.adventure.currentEnemy?.stats?.accuracy ?? S.adventure.currentEnemy?.accuracy ?? 0;
        const playerDodge = S.derivedStats?.dodge || 0;
        const hitP = chanceToHit(enemyAcc, playerDodge);
        if (Math.random() < hitP) {
          const critChance = S.adventure.currentEnemy?.stats?.criticalChance ?? S.adventure.currentEnemy?.criticalChance ?? 0;
          const isCrit = Math.random() < critChance;
          const baseDamage = Math.round(Number(S.adventure.currentEnemy.attack) || 5);
          const enemyDamage = isCrit ? baseDamage * 2 : baseDamage;
          const profile = {
            phys: enemyDamage,
            elems: { ...(S.adventure.currentEnemy.attackElems || {}) },
          };
          const { total: taken, components } = processAttack(
            profile,
            undefined,
            { attacker: S.adventure.currentEnemy, target: S, nowMs: now },
            S
          );
          const parts = [];
          if (components.phys) parts.push(`${components.phys} physical`);
          for (const [elem, val] of Object.entries(components.elems)) {
            parts.push(`${val} ${elem}`);
          }
          const compText = parts.length ? ` (${parts.join(', ')})` : '';
          S.adventure.combatLog.push(`${S.adventure.currentEnemy.name} deals ${taken} damage to you${compText}`);
          const playerEl = document.querySelector('.combatant.player');
          if (playerEl) {
            if (components.phys) {
              showFloatingText({
                targetEl: playerEl,
                result: isCrit ? 'crit' : 'hit',
                amount: components.phys,
                element: 'phys',
              });
            }
            for (const [elem, val] of Object.entries(components.elems)) {
              if (val) {
                showFloatingText({
                  targetEl: playerEl,
                  result: isCrit ? 'crit' : 'hit',
                  amount: val,
                  element: elem,
                });
              }
            }
          }
          performAttack(S.adventure.currentEnemy, S, { profile, isCrit, physDamage: components.phys }, S); // STATUS-REFORM
          S.adventure.playerStunBar = S.stun?.value || 0; // STATUS-REFORM
          if (weapon.classKey === 'focus') {
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
            stopActivityMut(S, 'adventure');
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
          const playerEl = document.querySelector('.combatant.player');
          if (playerEl) {
            showFloatingText({ targetEl: playerEl, result: 'miss' });
          }
        }
      }
    }
  }
  renderAilments(S, 'playerAilments');
  if (S.adventure.currentEnemy) {
    renderAilments(S.adventure.currentEnemy, 'enemyAilments');
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

    const zoneObj = ZONES[S.adventure.currentZone];
    const discoverable = zoneObj?.dungeons?.filter(d => d.discoverAtStage - 1 === S.adventure.currentArea);
    if (discoverable) {
      discoverable.forEach(d => {
        if (!S.adventure.discoveredDungeons.includes(d.id)) {
          const chance = Math.max(0, 0.10 - S.adventure.currentArea * 0.01);
          if (Math.random() < chance) {
            S.adventure.discoveredDungeons.push(d.id);
            log?.(`You discovered the dungeon: ${d.name}!`, 'excellent');
          }
        }
      });
    }
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

  emit('ADVENTURE:KILL', { zone: S.adventure.currentZone, area: S.adventure.currentArea });

  S.adventure.bestiary = S.adventure.bestiary || {};
  const enemyType = enemy.type || enemy.name;
  S.adventure.bestiary[enemyType] = (S.adventure.bestiary[enemyType] || 0) + 1;
  updateBestiaryList();
  S.adventure.combatLog = S.adventure.combatLog || [];
  
  const zone = ZONES[S.adventure.currentZone];
  const area = zone?.areas?.[S.adventure.currentArea];
  const lootEntries = enemy.loot ? Object.entries(enemy.loot) : [];
  lootEntries.forEach(([item, qty]) => {
    addSessionLoot({ key: item, type: WEAPONS[item] ? 'weapon' : 'material', qty, source: area?.name });
  });

  if (enemy.drops) {
    const dropMult = 1 + (S.gearBonuses?.dropRateMult || 0);
    Object.entries(enemy.drops).forEach(([item, chance]) => {
      if (Math.random() < Math.min(1, chance * dropMult)) {
        addSessionLoot({ key: item, type: WEAPONS[item] ? 'weapon' : 'material', qty: 1, source: area?.name });
        lootEntries.push([item, 1]);
      }
    });
  }

  const coreChance = CORE_DROP_CHANCE[enemy.rarity || 'normal'] || 0;
  if (Math.random() < coreChance) {
    const coreItem = { key: 'cores', type: 'material', qty: 1, name: 'core', source: area?.name };
    addSessionLoot(coreItem);
    lootEntries.push(['core', 1]);
    const msg = '💎 A core drops!';
    S.adventure.combatLog.push(msg);
    log(msg, 'good');
  }

  if (S.flags?.weaponsEnabled) { // WEAPONS-INTEGRATION
    const tableKey = toLootTableKey(area?.id || zone?.id);
    const drop = rollLoot(tableKey);
    if (drop) {
      addSessionLoot({ key: drop, type: WEAPONS[drop] ? 'weapon' : 'material', qty: 1, source: area?.name });
      lootEntries.push([drop, 1]);
    }

    const gear = rollGearDropForZone(ZONE_IDS.STARTING, (S.adventure.currentArea ?? 0) + 1);
    if (gear) {
      addToInventory(gear, S);
      lootEntries.push([gear.name, 1]);
    }
  }
  
  // Boss bonus rewards
  if (isBoss) {
    const bonusXP = Math.max(1, Math.round(enemy.hp / 10));
    const weapon = getEquippedWeapon(S);
    gainProficiency(weapon.classKey, bonusXP, S);
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
  // zone and area already defined earlier in this function

  if (S.adventure.dungeonState) {
    const ds = S.adventure.dungeonState;
    const dungeon = getDungeonById(ds.zoneId, ds.dungeonId);
    ds.floor++;
    if (!dungeon || ds.floor >= dungeon.floors.length) {
      log(`Cleared ${dungeon?.name || 'dungeon'}!`, 'excellent');
      delete S.adventure.dungeonState;
    }
  }

  // Continue combat even after reaching kill requirements
  if (S.activities.adventure && S.adventure.playerHP > 0 && !isBoss && !S.adventure.dungeonState) {
    startAdventureCombat();
  }

  updateActivityAdventure();
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
  // Retreat from current enemy if still in combat
  if (S.adventure.inCombat) {
    retreatFromCombat();
  }
  const bossInfo = generateBossEnemy();
  if (!bossInfo) {
    log('Failed to generate boss enemy!', 'bad');
    return;
  }
  
  const { bossData, originalType } = bossInfo;
  const { enemyHP, enemyMax, atk, armor } = initializeFight(bossData);
  const h = { enemyHP, enemyMax, eAtk: atk, eArmor: armor, regen: 0, affixes: [] };

  // Bosses get more affixes
  applyRandomAffixes(h);
  const affixCount = applyRandomAffixes(h); // Apply twice for more challenge
  const rarity = rarityFromAffixCount(affixCount);

  S.adventure.inCombat = true;
  S.adventure.isBossFight = true;
  S.adventure.currentEnemy = {
    ...bossData,
    type: originalType,
    attack: Math.round(h.eAtk),
    armor: Math.round(h.eArmor),
    regen: h.regen,
    affixes: h.affixes,
    rarity,
    hpMax: h.enemyMax,
    hp: h.enemyHP
  };
  initStun(S.adventure.currentEnemy);
  initStun(S);
  S.adventure.enemyStunBar = S.adventure.currentEnemy.stun.value;
  S.adventure.playerStunBar = S.stun.value;
  S.adventure.enemyHP = h.enemyHP;
  S.adventure.enemyMaxHP = h.enemyMax;
  S.adventure.playerHP = Math.round(S.hp);
  S.adventure.playerAtkProfile = calculatePlayerCombatAttack(S);
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
  const { enemyHP, enemyMax, atk, armor } = initializeFight(enemyData);
  const h = { enemyHP, enemyMax, eAtk: atk, eArmor: armor, regen: 0, affixes: [] };
  const affixCount = applyRandomAffixes(h);
  const rarity = rarityFromAffixCount(affixCount);
  S.adventure.inCombat = true;
  S.adventure.isBossFight = false;
  S.adventure.currentEnemy = {
    ...enemyData,
    type: enemyType,
    attack: Math.round(h.eAtk),
    armor: Math.round(h.eArmor),
    regen: h.regen,
    affixes: h.affixes,
    rarity,
    hpMax: h.enemyMax,
    hp: h.enemyHP
  };
  initStun(S.adventure.currentEnemy);
  initStun(S);
  S.adventure.enemyStunBar = S.adventure.currentEnemy.stun.value;
  S.adventure.playerStunBar = S.stun.value;
  S.adventure.enemyHP = h.enemyHP;
  S.adventure.enemyMaxHP = h.enemyMax;
  S.adventure.playerHP = Math.round(S.hp);
  S.adventure.playerAtkProfile = calculatePlayerCombatAttack(S);
  S.adventure.lastPlayerAttack = 0;
  S.adventure.lastEnemyAttack = 0;
  S.adventure.combatLog = S.adventure.combatLog || [];
  const rarityLabel = rarity !== 'normal' ? `${rarity[0].toUpperCase()}${rarity.slice(1)} ` : '';
  S.adventure.combatLog.push(`A ${rarityLabel}${enemyData.name} appears!`);
  logEnemyResists(S.adventure.currentEnemy);
}

export function startDungeon(zoneId, dungeonId) {
  ensureAdventure();
  const dungeon = getDungeonById(zoneId, dungeonId);
  if (!dungeon) return;
  const last = S.adventure.dungeonCooldowns[dungeonId] || 0;
  if (Date.now() - last < DUNGEON_COOLDOWN_MS) {
    log('This dungeon is still recovering.', 'bad');
    return;
  }
  S.adventure.dungeonState = { zoneId, dungeonId, floor: 0 };
  S.adventure.dungeonCooldowns[dungeonId] = Date.now();
  S.activities = S.activities || {};
  S.activities.adventure = true;
  startDungeonEncounter();
  updateProgressButton();
}

function startDungeonEncounter() {
  const ds = S.adventure.dungeonState;
  if (!ds) return;
  const dungeon = getDungeonById(ds.zoneId, ds.dungeonId);
  const floor = dungeon?.floors[ds.floor];
  if (!floor) return;
  const enemyType = floor.enemy;
  const base = ENEMY_DATA[enemyType];
  if (!base) {
    log(`Enemy data not found for ${enemyType}`, 'bad');
    return;
  }
  const enemyData = { ...base, hp: base.hp * 2, attack: base.attack * 2, element: dungeon.element };
  const { enemyHP, enemyMax, atk, armor } = initializeFight(enemyData);
  const h = { enemyHP, enemyMax, eAtk: atk, eArmor: armor, regen: 0, affixes: [] };
  const affixCount = applyRandomAffixes(h);
  const rarity = rarityFromAffixCount(affixCount);
  S.adventure.inCombat = true;
  S.adventure.isBossFight = !!floor.boss;
  S.adventure.currentEnemy = {
    ...enemyData,
    type: enemyType,
    attack: Math.round(h.eAtk),
    armor: Math.round(h.eArmor),
    regen: h.regen,
    affixes: h.affixes,
    rarity,
    hpMax: h.enemyMax,
    hp: h.enemyHP
  };
  initStun(S.adventure.currentEnemy);
  initStun(S);
  S.adventure.enemyStunBar = S.adventure.currentEnemy.stun.value;
  S.adventure.playerStunBar = S.stun.value;
  S.adventure.enemyHP = h.enemyHP;
  S.adventure.enemyMaxHP = h.enemyMax;
  S.adventure.playerHP = Math.round(S.hp);
  S.adventure.playerAtkProfile = calculatePlayerCombatAttack(S);
  S.adventure.lastPlayerAttack = 0;
  S.adventure.lastEnemyAttack = 0;
  S.adventure.combatLog = [`Entering ${dungeon.name} - Floor ${ds.floor + 1}`];
  const rarityLabel = rarity !== 'normal' ? `${rarity[0].toUpperCase()}${rarity.slice(1)} ` : '';
  S.adventure.combatLog.push(`A ${rarityLabel}${enemyData.name} appears!`);
  logEnemyResists(S.adventure.currentEnemy);
}

export function progressDungeonEncounter() {
  if (!S.adventure?.dungeonState || S.adventure.inCombat) return;
  startDungeonEncounter();
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
  if (S.adventure.isBossFight || S.adventure.dungeonState) {
    S.adventure.combatLog = S.adventure.combatLog || [];
    S.adventure.combatLog.push('Retreat is impossible inside a dungeon.');
    log('Retreat is impossible inside a dungeon.', 'bad');
    return;
  }
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

  if (S.adventure.dungeonState) {
    const ds = S.adventure.dungeonState;
    const dungeon = getDungeonById(ds.zoneId, ds.dungeonId);
    const isLast = ds.floor >= (dungeon?.floors.length || 1) - 1;
    progressBtn.disabled = S.adventure.inCombat;
    progressBtn.textContent = isLast ? 'Challenge Boss' : 'Next Encounter';
    if (bossBtn) bossBtn.style.display = 'none';
    return;
    }
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
    const isBossFight = S.adventure.isBossFight;
    if (isAreaCleared && !isBossDefeated && !isBossFight) {
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
  // Base combat preview on the zone the player is currently exploring
  const currentZone = ZONES[S.adventure.currentZone || 0];
  let currentArea = null;
  if (currentZone && currentZone.areas) {
    currentArea = currentZone.areas[S.adventure.currentArea || 0];
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
  const atkPreview = calculatePlayerCombatAttack(S);
  const baseAttack = Math.round(
    atkPreview.phys + Object.values(atkPreview.elems).reduce((a, b) => a + b, 0)
  );
  setText('baseDamage', baseAttack);
  const enemyData = currentArea ? ENEMY_DATA[currentArea.enemy] : null;
  if (enemyData) {
    const enemyDodge = (enemyData.stats?.dodge ?? enemyData.dodge ?? 0) + DODGE_BASE;
    const hitP = chanceToHit(S.derivedStats?.accuracy || 0, enemyDodge);
    setText('hitChance', `${Math.round(hitP * 100)}%`);
    const enemyAcc = enemyData.stats?.accuracy ?? enemyData.accuracy ?? 0;
    const evadeP = 1 - chanceToHit(enemyAcc, S.derivedStats?.dodge || 0);
    setText('evadeChance', `${Math.round(evadeP * 100)}%`);
  } else {
    setText('hitChance', '--');
    setText('evadeChance', '--');
  }
  setText('qiShield', `${S.shield?.current || 0}/${S.shield?.max || 0}`);
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
