/* Realm-specific logic and UI updates */

import { REALMS } from '../data/realms.js';
import { LAWS } from '../data/laws.js';
import { S } from '../src/game/state.js';
import {
  clamp,
  qCap,
  qiRegenPerSec,
  fCap,
  foundationGainPerSec,
  powerMult
} from '../src/game/engine.js';
import { qs, setText, log } from './dom.js';

export function getRealmName(tier) {
  return REALMS[tier].name;
}

export function updateRealmUI() {
  const r = REALMS[S.realm.tier];
  setText('realmName', `${r.name} ${S.realm.stage}`);
  setText('realmDisplay', `${r.name} ${S.realm.stage}`);

  const btChance = breakthroughChance();
  setText('btChance', Math.floor(btChance * 100));

  if (btChance > 0) {
    const realm = REALMS[S.realm.tier];
    const stageMultiplier = 1 - (S.realm.stage - 1) * 0.05;
    const realmPenalty = S.realm.tier * 0.02;
    const html = document.getElementById('breakthroughDetails');
    if (html) {
      html.innerHTML = `<small>Base: ${(realm.bt * 100).toFixed(1)}% | Stage penalty: ${((1 - stageMultiplier) * 100).toFixed(1)}% | Realm penalty: ${(realmPenalty * 100).toFixed(1)}%</small>`;
    }
  }
}

export function updateActivityCultivation() {
  setText('realmNameActivity', `${REALMS[S.realm.tier].name} ${S.realm.stage}`);
  updateCurrentRealmHeader();
  
  // Update foundation text (inline above Qi bar)
  const prevFoundation = parseInt(document.getElementById('foundValSilhouette').textContent) || 0;
  const currentFoundation = Math.floor(S.foundation);
  const maxFoundation = fCap();
  
  setText('foundValSilhouette', currentFoundation);
  setText('foundCapSilhouette', maxFoundation);
  
  // Flash effect when foundation increases
  const foundationNumbers = document.querySelector('.foundation-inline');
  if (foundationNumbers && currentFoundation > prevFoundation) {
    foundationNumbers.classList.add('flash');
    setTimeout(() => foundationNumbers.classList.remove('flash'), 600);
  }
  
  // Pulse effect when at max foundation
  if (foundationNumbers) {
    if (currentFoundation >= maxFoundation) {
      foundationNumbers.classList.add('pulse-max');
    } else {
      foundationNumbers.classList.remove('pulse-max');
    }
  }
  
  // Update qi display below silhouette
  setText('qiValSilhouette', Math.floor(S.qi));
  setText('qiCapSilhouette', qCap());
  setText('qiRegenActivity', qiRegenPerSec().toFixed(1));
  setText('foundationRate', foundationGainPerSec().toFixed(1));
  setText('btChanceActivity', (breakthroughChance() * 100).toFixed(1) + '%');
  setText('powerMultActivity', powerMult().toFixed(1) + 'x');

  // Update qi fill bar in silhouette
  const qiFillSilhouette = document.getElementById('qiFillSilhouette');
  if (qiFillSilhouette) {
    qiFillSilhouette.style.width = (S.qi / qCap() * 100) + '%';
  }

  const startBtn = document.getElementById('startCultivationActivity');
  if (startBtn) {
    startBtn.textContent = S.activities.cultivation ? 'Stop Cultivating' : 'Start Cultivating';
    startBtn.onclick = () => S.activities.cultivation ? stopActivity('cultivation') : startActivity('cultivation');
  }

  const btBtn = document.getElementById('breakthroughBtnActivity');
  if (btBtn) {
    if (S.breakthrough && S.breakthrough.inProgress) {
      btBtn.textContent = `Breakthrough in Progress... (${Math.ceil(S.breakthrough.timeRemaining)}s)`;
      btBtn.disabled = true;
      btBtn.classList.add('disabled');
    } else {
      btBtn.textContent = 'Attempt Breakthrough';
      btBtn.disabled = false;
      btBtn.classList.remove('disabled');
    }

    btBtn.onclick = () => {
      tryBreakthrough();
    };
  }

  const statsCard = document.getElementById('cultivationStatsCard');
  if (statsCard) {
    statsCard.style.display = S.activities.cultivation ? 'block' : 'none';
  }

  if (S.activities.cultivation) {
    if (!S.cultivation) {
      S.cultivation = {
        talent: 1.0,
        comprehension: 1.0,
        foundationMult: 1.0,
        pillMult: 1.0,
        buildingMult: 1.0
      };
    }

    setText('cultivationTalent', (S.cultivation.talent || 1.0).toFixed(1) + 'x');
    setText('cultivationComprehension', (S.cultivation.comprehension || 1.0).toFixed(1) + 'x');
    setText('cultivationFoundationMult', (S.cultivation.foundationMult || 1.0).toFixed(1) + 'x');
    setText('cultivationPillMult', (S.cultivation.pillMult || 1.0).toFixed(1) + 'x');
    setText('cultivationBuildingMult', (S.cultivation.buildingMult || 1.0).toFixed(1) + 'x');
  }

  updateCultivationProgressionTree();
  setupCultivationTabs();
  setupProgressToggle();
  updateCultivationVisualization();
}

export function updateCultivationProgressionTree() {
  const container = document.getElementById('cultivationProgressionTree');
  if (!container) return;

  const realmData = [
    { icon: '🌱', name: 'Mortal', desc: 'The beginning of your cultivation journey' },
    { icon: '⚡', name: 'Qi Refining', desc: 'Learning to gather and refine spiritual energy' },
    { icon: '🏔️', name: 'Foundation', desc: 'Building a solid cultivation foundation' },
    { icon: '💎', name: 'Core Formation', desc: 'Forming your spiritual core' },
    { icon: '👶', name: 'Nascent Soul', desc: 'Birth of your nascent soul' },
    { icon: '🌟', name: 'Soul Transformation', desc: 'Transforming your very essence' },
    { icon: '🔥', name: 'Void Refining', desc: 'Refining the void within' },
    { icon: '🌌', name: 'Body Integration', desc: 'Integrating body and soul' },
    { icon: '🏛️', name: 'Mahayana', desc: 'The great vehicle of cultivation' },
    { icon: '✨', name: 'Tribulation', desc: 'Facing heavenly tribulation' },
    { icon: '👑', name: 'True Immortal', desc: 'Achieving true immortality' }
  ];

  container.innerHTML = '';

  realmData.forEach((realm, index) => {
    const realmNode = document.createElement('div');
    realmNode.className = 'realm-node';

    if (index < S.realm.tier) {
      realmNode.classList.add('completed');
    } else if (index === S.realm.tier) {
      realmNode.classList.add('current');
    } else {
      realmNode.classList.add('locked');
    }

    const realmInfo = REALMS[index];
    const stages = realmInfo ? realmInfo.stages : 9;

    realmNode.innerHTML = `
      <div class="realm-icon">${realm.icon}</div>
      <div class="realm-info">
        <div class="realm-name">${realm.name}</div>
        <div class="realm-description">${realm.desc}</div>
        <div class="realm-stages">
          ${Array.from({ length: stages }, (_, stageIndex) => {
            const stageNumber = stageIndex + 1;
            let stageClass = 'stage-dot';

            if (index < S.realm.tier) {
              stageClass += ' completed';
            } else if (index === S.realm.tier && stageNumber < S.realm.stage) {
              stageClass += ' completed';
            } else if (index === S.realm.tier && stageNumber === S.realm.stage) {
              stageClass += ' current';
            }

            return `<div class="${stageClass}" title="Stage ${stageNumber}"></div>`;
          }).join('')}
        </div>
      </div>
    `;

    container.appendChild(realmNode);
  });
}

export function setupCultivationTabs() {
  const tabButtons = document.querySelectorAll('.cultivation-tab-btn');
  tabButtons.forEach(button => {
    button.onclick = () => {
      const tabName = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.cultivation-tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      button.classList.add('active');
      const content = document.getElementById(tabName + 'SubTab');
      if (content) {
        content.classList.add('active');
        content.style.display = 'block';
      }
    };
  });
}

export function updateCurrentRealmHeader() {
  const realmData = [
    { icon: '🌱', name: 'Mortal', desc: 'The beginning of your cultivation journey' },
    { icon: '⚡', name: 'Qi Refining', desc: 'Learning to gather and refine spiritual energy' },
    { icon: '🏔️', name: 'Foundation', desc: 'Building a solid cultivation foundation' },
    { icon: '💎', name: 'Core Formation', desc: 'Forming your spiritual core' },
    { icon: '👶', name: 'Nascent Soul', desc: 'Birth of your nascent soul' },
    { icon: '🌟', name: 'Soul Transformation', desc: 'Transforming your very essence' },
    { icon: '🔥', name: 'Void Refining', desc: 'Refining the void within' },
    { icon: '🌌', name: 'Body Integration', desc: 'Integrating body and soul' },
    { icon: '🏛️', name: 'Mahayana', desc: 'The great vehicle of cultivation' },
    { icon: '✨', name: 'Tribulation', desc: 'Facing heavenly tribulation' },
    { icon: '👑', name: 'True Immortal', desc: 'Achieving true immortality' }
  ];

  const currentRealm = realmData[S.realm.tier] || realmData[0];
  const realmInfo = REALMS[S.realm.tier];
  const stages = realmInfo ? realmInfo.stages : 9;

  setText('currentRealmName', currentRealm.name);
  setText('currentRealmDesc', currentRealm.desc);
  
  const iconElement = document.getElementById('currentRealmIcon');
  if (iconElement) {
    iconElement.textContent = currentRealm.icon;
  }

  const stagesContainer = document.getElementById('currentRealmStages');
  if (stagesContainer) {
    stagesContainer.innerHTML = Array.from({ length: stages }, (_, stageIndex) => {
      const stageNumber = stageIndex + 1;
      let stageClass = 'stage-dot';
      
      if (stageNumber < S.realm.stage) {
        stageClass += ' completed';
      } else if (stageNumber === S.realm.stage) {
        stageClass += ' current';
      }

      return `<div class="${stageClass}" title="Stage ${stageNumber}"></div>`;
    }).join('');
  }
}

export function updateCultivationVisualization() {
  const foundationFill = document.getElementById('foundationFill');
  const yinYangContainer = document.getElementById('yinYangContainer');
  const cultivationViz = document.getElementById('cultivationVisualization');
  
  if (!foundationFill || !yinYangContainer || !cultivationViz) return;

  // Update foundation fill as liquid filling the silhouette
  const foundationPercent = Math.max(0, Math.min(100, (S.foundation / fCap()) * 100));
  foundationFill.style.setProperty('--fill-height', `${foundationPercent}%`);
  foundationFill.style.opacity = '1'; // Always visible when element exists

  // Update realm-based styling
  const realmClasses = [
    'realm-mortal', 'realm-qi-refining', 'realm-foundation', 
    'realm-core-formation', 'realm-nascent-soul', 'realm-soul-transformation'
  ];
  
  // Remove all realm classes
  realmClasses.forEach(cls => cultivationViz.classList.remove(cls));
  
  // Add current realm class
  const realmNames = ['mortal', 'qi-refining', 'foundation', 'core-formation', 'nascent-soul', 'soul-transformation'];
  const currentRealmClass = `realm-${realmNames[S.realm.tier] || 'mortal'}`;
  cultivationViz.classList.add(currentRealmClass);

  // Update breakthrough proximity effects
  const btChance = breakthroughChance();
  if (btChance > 0.7) {
    cultivationViz.classList.add('near-breakthrough');
  } else {
    cultivationViz.classList.remove('near-breakthrough');
  }

  // Adjust pulse speed based on cultivation activity and breakthrough proximity
  const yinYang = document.getElementById('cultivationYinYang');
  const innerGlow = document.getElementById('innerGlow');
  
  if (yinYang && innerGlow) {
    if (S.activities.cultivation) {
      // Faster pulse when actively cultivating
      const pulseSpeed = btChance > 0.5 ? '2s' : '2.5s';
      yinYang.style.animationDuration = pulseSpeed;
      innerGlow.style.animationDuration = pulseSpeed;
    } else {
      // Slower pulse when idle
      yinYang.style.animationDuration = '4s';
      innerGlow.style.animationDuration = '4s';
    }
  }
}

function showCultivationProgressModal() {
  const overlay = document.getElementById('cultivationProgressionOverlay');
  if (!overlay) return;

  overlay.style.display = 'flex';
  updateCultivationProgressionTree();

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      hideCultivationProgressModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function hideCultivationProgressModal() {
  const overlay = document.getElementById('cultivationProgressionOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

export function setupProgressToggle() {
  const toggleBtn = document.getElementById('toggleProgressBtn');
  const closeBtn = document.getElementById('closeProgressBtn');
  const overlay = document.getElementById('cultivationProgressionOverlay');
  const backdrop = overlay?.querySelector('.modal-backdrop');

  if (toggleBtn) {
    toggleBtn.onclick = showCultivationProgressModal;
  }

  if (closeBtn) {
    closeBtn.onclick = hideCultivationProgressModal;
  }

  if (backdrop) {
    backdrop.onclick = hideCultivationProgressModal;
  }
}

export function breakthroughChance(){
  if(S.qi < qCap()*0.99 || S.foundation < fCap()*0.99) return 0;

  const realm = REALMS[S.realm.tier];
  let base = realm.bt;

  const stageMultiplier = 1 - (S.realm.stage - 1) * 0.05;
  const realmPenalty = S.realm.tier * 0.02;

  base = base * stageMultiplier - realmPenalty;

  const ward = S.pills.ward>0 ? 0.15 : 0;
  const alchemyBonus = S.alchemy.successBonus * 0.1;
  const buildingBonus = S.buildingBonuses.breakthroughBonus || 0;
  const cultivationBonus = (S.cultivation.talent - 1) * 0.1;

  const totalChance = base + ward + alchemyBonus + buildingBonus + cultivationBonus;

  return clamp(totalChance, 0.01, 0.95);
}

export function tryBreakthrough(){
  const haveQi = S.qi >= qCap()*0.99; const haveFound = S.foundation >= fCap()*0.99;
  if(!haveQi || !haveFound){
    log(`Requirements: Qi ${Math.floor(100*S.qi/qCap())}% & Foundation ${Math.floor(100*S.foundation/fCap())}%`, 'bad');
    return;
  }

  if(S.breakthrough && S.breakthrough.inProgress) {
    log('Breakthrough already in progress!', 'bad');
    return;
  }

  if(!S.breakthrough) {
    S.breakthrough = {
      inProgress: false,
      timeRemaining: 0,
      totalTime: 0
    };
  }

  const minTime = 3;
  const maxTimeBase = 10 + (S.realm.tier * 10);
  const mindReduction = (S.stats.mind - 10) * 0.02;
  const maxTime = Math.max(minTime + 1, maxTimeBase * (1 - mindReduction));

  const duration = minTime + Math.random() * (maxTime - minTime);

  S.breakthrough.inProgress = true;
  S.breakthrough.timeRemaining = duration;
  S.breakthrough.totalTime = duration;

  if(S.pills.ward>0){ S.pills.ward--; }

  log(`Breakthrough initiated! Duration: ${duration.toFixed(1)} seconds...`, 'neutral');
}

export function updateBreakthrough() {
  if(!S.breakthrough || !S.breakthrough.inProgress) return;

  S.breakthrough.timeRemaining -= 1;

  if(S.breakthrough.timeRemaining <= 0) {
    const ch = breakthroughChance();

    if(Math.random() < ch) {
      S.qi = 0;
      S.foundation = 0;
      advanceRealm();
      log('Breakthrough succeeded! Realm advanced.', 'good');
    } else {
      S.qi = 0;
      S.foundation = Math.max(0, S.foundation - Math.ceil(fCap() * 0.25));
      S.hp = Math.max(1, S.hp - Math.ceil(S.hpMax * 0.2));
      log('Tribulation backlash! Breakthrough failed.', 'bad');
    }

    S.breakthrough.inProgress = false;
    S.breakthrough.timeRemaining = 0;
    S.breakthrough.totalTime = 0;
  }
}

export function advanceRealm(){
  const wasRealmAdvancement = S.realm.stage > REALMS[S.realm.tier].stages;
  const oldRealm = S.realm.tier;

  S.realm.stage++;
  if(S.realm.stage > REALMS[S.realm.tier].stages){ S.realm.tier++; S.realm.stage = 1; }

  const currentRealm = REALMS[S.realm.tier];
  log(`Advanced to ${currentRealm.name} ${S.realm.stage}!`, 'good');

  if(wasRealmAdvancement) {
    const realmBonus = Math.max(1, Math.floor(S.realm.tier * 1.5));
    S.atkBase += realmBonus * 2;
    S.defBase += realmBonus;
    S.hpMax += Math.floor(S.hpMax * 0.25);
    S.hp = S.hpMax;

    if (!S.cultivation) {
      S.cultivation = {
        talent: 1.0, foundationMult: 1.0,
        pillMult: 1.0, buildingMult: 1.0
      };
    }
    if (!S.stats) {
      S.stats = {
        physique: 10, mind: 10, dexterity: 10, comprehension: 10,
        criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
      };
    }

    S.cultivation.talent += 0.15;
    S.cultivation.foundationMult += 0.08;

    const realmStatPoints = 3 + S.realm.tier;
    S.stats.physique += Math.ceil(realmStatPoints * 0.3);
    S.stats.mind += Math.ceil(realmStatPoints * 0.25);
    S.stats.dexterity += Math.ceil(realmStatPoints * 0.25);
    S.stats.comprehension += Math.ceil(realmStatPoints * 0.2);
    S.stats.criticalChance += 0.01;

    const powerGain = currentRealm.power / REALMS[oldRealm].power;
    log(`Realm breakthrough! Power increased by ${powerGain.toFixed(1)}x! ATK +${realmBonus * 2}, DEF +${realmBonus}, HP +25%`, 'good');
    log(`Cultivation enhanced! Talent +15%, Comprehension +10%, Foundation Mult +8%`, 'good');
  } else {
    const stageBonus = Math.max(1, Math.floor((S.realm.tier + 1) * 0.5));
    S.atkBase += stageBonus;
    S.defBase += Math.floor(stageBonus * 0.7);
    S.hpMax += Math.floor(S.hpMax * 0.08);
    S.hp = Math.min(S.hpMax, S.hp + Math.floor(S.hpMax * 0.5));

    if (!S.cultivation) {
      S.cultivation = {
        talent: 1.0, foundationMult: 1.0,
        pillMult: 1.0, buildingMult: 1.0
      };
    }
    if (!S.stats) {
      S.stats = {
        physique: 10, mind: 10, dexterity: 10, comprehension: 10,
        criticalChance: 0.05, attackSpeed: 1.0, cooldownReduction: 0, adventureSpeed: 1.0
      };
    }

    S.cultivation.talent += 0.03;

    const stageStatPoints = 1 + Math.floor(S.realm.tier * 0.5);
    const statDistribution = Math.random();
    if (statDistribution < 0.4) {
      S.stats.physique += stageStatPoints;
    } else if (statDistribution < 0.7) {
      S.stats.comprehension += stageStatPoints;
    } else if (statDistribution < 0.85) {
      S.stats.mind += stageStatPoints;
    } else {
      S.stats.dexterity += stageStatPoints;
    }

    log(`Stage breakthrough! ATK +${stageBonus}, DEF +${Math.floor(stageBonus * 0.7)}, HP +8%`, 'good');
    log(`Cultivation improved! Talent +3%, Comprehension +2%`, 'good');
  }

  checkLawUnlocks();
  awardLawPoints();
}

export function checkLawUnlocks(){
  for(const lawKey in LAWS){
    const law = LAWS[lawKey];
    if(!S.laws.unlocked.includes(lawKey)){
      if(S.realm.tier >= law.unlockReq.realm && S.realm.stage >= law.unlockReq.stage){
        S.laws.unlocked.push(lawKey);
        log(`${law.name} is now available for selection!`, 'good');
      }
    }
  }
}

export function awardLawPoints(){
  let points = 0;
  if(S.realm.tier >= 2) points += 2;
  if(S.realm.tier >= 3) points += 3;
  if(S.realm.tier >= 4) points += 5;

  if(S.realm.stage === 1 && S.realm.tier > 0) points += S.realm.tier;
  if(S.realm.stage === 5) points += 1;
  if(S.realm.stage === 9) points += 2;

  if(points > 0){
    S.laws.points += points;
    log(`Gained ${points} Law Points!`, 'good');
  }
}

export function initRealmUI(){
  const breakthroughBtn = qs('#breakthroughBtn');
  if (breakthroughBtn) breakthroughBtn.addEventListener('click', tryBreakthrough);
}
