/* Realm-specific logic and UI updates */

import { REALMS } from '../data/realms.js';
import { LAWS } from '../data/laws.js';
import { S } from '../../../shared/state.js';
import {
  qCap,
  qiRegenPerSec,
  fCap,
  foundationGainPerSec,
  powerMult,
  breakthroughChance,
  mortalStage
} from '../selectors.js';
import { advanceRealm } from '../mutators.js';
import { qs, setText, log } from '../../../shared/utils/dom.js';
import { isProd } from '../../../config.js';
import { mountAllFeatureUIs } from '../../index.js';
import { startActivity as startActivityMut, stopActivity as stopActivityMut } from '../../activity/mutators.js';

let pendingAstralUnlock = false;

export function getRealmName(tier) {
  return REALMS[tier].name;
}

export function updateRealmUI() {
  const r = REALMS[S.realm.tier];
  setText('realmName', `${r.name} ${S.realm.stage}`);
  setText('realmDisplay', `${r.name} ${S.realm.stage}`);

  const btChance = breakthroughChance(S);
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
  const maxFoundation = fCap(S);
  
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
  const cap = qCap(S);
  setText('qiCapSilhouette', cap);
  setText('qiRegenActivity', qiRegenPerSec(S).toFixed(1));
  setText('foundationRate', foundationGainPerSec(S).toFixed(1));
  setText('astralInsightMini', `Insight: ${Math.round(S.astralPoints || 0)}`);
  setText('btChanceActivity', (breakthroughChance(S) * 100).toFixed(1) + '%');
  setText('powerMultActivity', powerMult(S).toFixed(1) + 'x');

  // Update qi fill bar in silhouette
  const qiFillSilhouette = document.getElementById('qiFillSilhouette');
  if (qiFillSilhouette) {
    qiFillSilhouette.style.width = (S.qi / cap * 100) + '%';
  }

  const startBtn = document.getElementById('startCultivationActivity');
  if (startBtn) {
    startBtn.textContent = S.activities.cultivation ? 'Stop Cultivating' : 'Start Cultivating';
    startBtn.onclick = () =>
      S.activities.cultivation
        ? stopActivityMut(S, 'cultivation')
        : startActivityMut(S, 'cultivation');
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

  const buffTimer = document.getElementById('breakthroughBuffTimer');
  if (buffTimer) {
    const inst = S.statuses?.pill_meridian_opening_t1;
    if (inst) {
      const secs = Math.ceil(inst.duration);
      buffTimer.textContent = `Meridian-Opening Dan: ${secs}s`;
      buffTimer.style.display = '';
      buffTimer.classList.toggle('pulse', secs <= 3);
    } else {
      buffTimer.style.display = 'none';
      buffTimer.classList.remove('pulse');
    }
  }

  const statsCard = document.getElementById('cultivationStatsCard');
  if (statsCard) {
    statsCard.style.display = 'block';
  }

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

let fillAnimation;

function animateFoundationFill(targetPercent) {
  const foundationFill = document.getElementById('foundationFill');
  if (!foundationFill) return;
  const start = parseFloat(foundationFill.style.getPropertyValue('--fill-height')) || 0;
  const startTime = performance.now();
  const duration = 1000;
  foundationFill.classList.add('filling');
  foundationFill.style.opacity = '1';

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = start + (targetPercent - start) * progress;
    foundationFill.style.setProperty('--fill-height', `${value}%`);
    if (progress < 1) {
      fillAnimation = requestAnimationFrame(step);
    } else {
      foundationFill.classList.remove('filling');
    }
  }

  cancelAnimationFrame(fillAnimation);
  fillAnimation = requestAnimationFrame(step);
}

export function updateCultivationVisualization() {
  const foundationFill = document.getElementById('foundationFill');
  const yinYangContainer = document.getElementById('yinYangContainer');
  const cultivationViz = document.getElementById('cultivationVisualization');

  if (!foundationFill || !yinYangContainer || !cultivationViz) return;

  // Update foundation fill as liquid filling the silhouette
  const foundationPercent = Math.max(0, Math.min(100, (S.foundation / fCap(S)) * 100));
  animateFoundationFill(foundationPercent);

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
  const btChance = breakthroughChance(S);
  const breakthroughReady =
    S.qi >= qCap(S) * 0.99 && S.foundation >= fCap(S) * 0.99;
  if (breakthroughReady && btChance > 0.7) {
    cultivationViz.classList.add('near-breakthrough');
  } else {
    cultivationViz.classList.remove('near-breakthrough');
  }
  // Indicate active breakthrough state for intensified visuals
  if (S.breakthrough && S.breakthrough.inProgress) {
    cultivationViz.classList.add('breakthrough');
  } else {
    cultivationViz.classList.remove('breakthrough');
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

function showBreakthroughResult(success, info = {}) {
  const overlay = document.getElementById('breakthroughResultOverlay');
  const title = document.getElementById('breakthroughResultTitle');
  const body = document.getElementById('breakthroughResultBody');
  if (!overlay || !title || !body) return;

  if (success) {
    title.textContent = 'Breakthrough Succeeded!';
    body.innerHTML = `<p class="good">Advanced to ${info.realmName} ${info.stage}.</p>` +
      `<p>Stats increased:</p><ul><li>${info.statMsg}</li><li>${info.extraMsg}</li></ul>`;
  } else {
    title.textContent = 'Breakthrough Failed';
    body.innerHTML = '<p class="bad">Tribulation backlash! Breakthrough failed.</p>';
  }

  overlay.style.display = 'flex';
}

function hideBreakthroughResult() {
  const overlay = document.getElementById('breakthroughResultOverlay');
  if (overlay) overlay.style.display = 'none';
  if (pendingAstralUnlock) {
    pendingAstralUnlock = false;
    showAstralTreeUnlockOverlay();
  }
}

function showAstralTreeUnlockOverlay() {
  const overlay = document.getElementById('astralTreeUnlockOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
}

function hideAstralTreeUnlockOverlay() {
  const overlay = document.getElementById('astralTreeUnlockOverlay');
  if (overlay) overlay.style.display = 'none';
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

export function tryBreakthrough(){
  const haveQi = S.qi >= qCap(S)*0.99; const haveFound = S.foundation >= fCap(S)*0.99;
  if(!haveQi || !haveFound){
    log(`Requirements: Qi ${Math.floor(100*S.qi/qCap(S))}% & Foundation ${Math.floor(100*S.foundation/fCap(S))}%`, 'bad');
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

  const progressFill = document.getElementById('breakthroughProgressFill');
  if (progressFill) progressFill.style.width = '0%';

  if(S.pills.ward>0){ S.pills.ward--; }

  log(`Breakthrough initiated! Duration: ${duration.toFixed(1)} seconds...`, 'neutral');
}

export function updateBreakthrough() {
  if(!S.breakthrough || !S.breakthrough.inProgress) return;

  S.breakthrough.timeRemaining -= 1;

  const progressFill = document.getElementById('breakthroughProgressFill');
  if (progressFill && S.breakthrough.totalTime > 0) {
    const pct = (1 - (S.breakthrough.timeRemaining / S.breakthrough.totalTime)) * 100;
    progressFill.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  if(S.breakthrough.timeRemaining <= 0) {
    const ch = breakthroughChance(S);

    if(Math.random() < ch) {
      S.qi = 0;
      S.foundation = 0;
      const info = advanceRealm(S);
      log('Breakthrough succeeded! Realm advanced.', 'good');
      showBreakthroughResult(true, info);
      mountAllFeatureUIs(S);
      if (isProd && info.type === 'stage' && mortalStage(S) === 2) {
        pendingAstralUnlock = true;
      }
    } else {
      S.qi = 0;
      S.foundation = Math.max(0, S.foundation - Math.ceil(fCap(S) * 0.25));
      S.hp = Math.max(1, S.hp - Math.ceil(S.hpMax * 0.2));
      log('Tribulation backlash! Breakthrough failed.', 'bad');
      showBreakthroughResult(false);
    }

    S.breakthrough.inProgress = false;
    S.breakthrough.timeRemaining = 0;
    S.breakthrough.totalTime = 0;
  }
}


export function initRealmUI(){
  const breakthroughBtn = qs('#breakthroughBtn');
  if (breakthroughBtn) breakthroughBtn.addEventListener('click', tryBreakthrough);

  const closeBtn = qs('#closeBreakthroughResultBtn');
  const overlay = qs('#breakthroughResultOverlay');
  const backdrop = overlay?.querySelector('.modal-backdrop');
  if (closeBtn) closeBtn.addEventListener('click', hideBreakthroughResult);
  if (backdrop) backdrop.addEventListener('click', hideBreakthroughResult);

  const closeAstralBtn = qs('#closeAstralTreeUnlockBtn');
  const astralOverlay = qs('#astralTreeUnlockOverlay');
  const astralBackdrop = astralOverlay?.querySelector('.modal-backdrop');
  if (closeAstralBtn) closeAstralBtn.addEventListener('click', hideAstralTreeUnlockOverlay);
  if (astralBackdrop) astralBackdrop.addEventListener('click', hideAstralTreeUnlockOverlay);
}

