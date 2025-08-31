import { S, save } from '../../../shared/state.js';

const STORAGE_KEY = 'astralTreeAllocated';
// Starting nodes must match the roots in the astral_tree.json dataset
// so that the player can purchase their first node. The previous values
// referenced non-existent ids which prevented the purchase button from
// ever appearing. Use the actual root id instead: 4054 corresponds to
// the 'max Qi +50' node seen on load.
const START_NODES = new Set([4054]);

const BASIC_ROTATION = [
  { desc: '+2% Foundation Gain', bonus: { foundationGainPct: 2 } },
  { desc: '+2% Cultivation Speed', bonus: { cultivationSpeedPct: 2 } },
  { desc: '+2% Manual Comprehension', bonus: { manualComprehensionPct: 2 } },
  { desc: '+1% Breakthrough Chance', bonus: { breakthroughChancePct: 1 } },
  { desc: '+2% Qi Regeneration', bonus: { qiRegenPct: 2 } },
  { desc: '2% max qi', bonus: { maxQiPct: 2 } },
];

const NOTABLES = {
  50: {
    effects: ['+12% Manual Comprehension', '+10% Cultivation Speed'],
    bonus: { manualComprehensionPct: 12, cultivationSpeedPct: 10 },
  },
  75: {
    effects: ['+20% Manual Comprehension', '+10% Cast Speed', '+10% Spell Damage'],
    bonus: { manualComprehensionPct: 20, castSpeedPct: 10, spellDamagePct: 10 },
  },
  76: {
    effects: ['+18% Summon Damage', 'Your summons taunt on their first hit (10s cd)', '+10% Gathering Speed'],
    bonus: { summonDamagePct: 18, summonTaunt: true, gatheringSpeedPct: 10 },
  },
  82: {
    effects: ['+22% Armor', '−12% Cooldowns', 'Cannot be Stunned while Qi Shield > 0'],
    bonus: { armorPct: 22, cooldownPct: -12, stunImmuneShield: true },
  },
  90: {
    effects: ['+20% Accuracy', '+10% Physical Penetration', 'Auras reserve −10% Qi'],
    bonus: { accuracyPct: 20, physicalPenPct: 10, auraReservePct: -10 },
  },
  91: {
    effects: ['Gain additional Physical Bonus Damage equal to (100% − your current Breakthrough Chance) on hit'],
    bonus: { thresholdFury: true },
  },
  100: {
    effects: ['+18% Fire Damage', 'After using an ability: +30% Attack Speed for 4s (8s cd)'],
    bonus: { fireDamagePct: 18, tempoAttackSpeedPct: 30 },
  },
  101: {
    effects: ['+12% Physical Damage', 'Hits vs Ignited enemies: +25% Stun', '+10% Fire Resistance'],
    bonus: { physicalDamagePct: 12, igniteStunPct: 25, fireResistPct: 10 },
  },
  109: {
    effects: ['+18% Crit Damage', '+4% Crit Chance', 'After a Critical Strike: +20% Dodge for 2s (8s cd)'],
    bonus: { critDamagePct: 18, critChancePct: 4, critDodgeBuffPct: 20 },
  },
  110: {
    effects: ['+15% Attack Speed', '+10% Cast Speed'],
    bonus: { attackSpeedPct: 15, castSpeedPct: 10 },
  },
};

function buildManifest(nodes) {
  const manifest = {};
  const basicIds = nodes
    .filter(n => n.type === 'basic')
    .map(n => n.id)
    .sort((a, b) => a - b);
  basicIds.forEach((id, idx) => {
    const rot = BASIC_ROTATION[idx % BASIC_ROTATION.length];
    manifest[id] = { cost: 10, effects: [rot.desc], bonus: rot.bonus };
  });
  Object.entries(NOTABLES).forEach(([id, data]) => {
    manifest[Number(id)] = { cost: 30, ...data };
  });
  return manifest;
}

function loadAllocations() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveAllocations(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  save();
}

export function mountAstralTreeUI() {
  const openBtn = document.getElementById('openAstralTree');
  const overlay = document.getElementById('astralSkillTreeOverlay');
  const closeBtn = document.getElementById('closeAstralTree');
  if (!openBtn || !overlay || !closeBtn) return;

  let prevOverflowY = '';
  let prevDocOverflowY = '';

  openBtn.addEventListener('click', () => {
    overlay.style.display = 'block';
    prevOverflowY = document.body.style.overflowY;
    prevDocOverflowY = document.documentElement.style.overflowY;
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflowY = 'hidden';
    const el = document.getElementById('astralInsight');
    if (el) el.textContent = `Insight: ${S.astralPoints || 0}`;
  });

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    document.body.style.overflowY = prevOverflowY || '';
    document.documentElement.style.overflowY = prevDocOverflowY || '';
  });

  buildTree().catch(err => console.error('Failed to build Astral Tree', err));
}

async function buildTree() {
  const svg = document.getElementById('astralTreeSvg');
  const overlay = document.getElementById('astralSkillTreeOverlay');
  const zoomInBtn = document.getElementById('astralZoomIn');
  const zoomOutBtn = document.getElementById('astralZoomOut');
  if (!svg || !overlay) return;
  svg.innerHTML = '';

  const existing = document.getElementById('astralTreeTooltip');
  if (existing) existing.remove();
  const tooltip = document.createElement('div');
  tooltip.id = 'astralTreeTooltip';
  tooltip.className = 'astral-tooltip';
  tooltip.style.display = 'none';
  overlay.appendChild(tooltip);

  function positionTooltip(evt) {
    tooltip.style.left = `${evt.clientX + 10}px`;
    tooltip.style.top = `${evt.clientY + 10}px`;
  }

  function showTooltip(evt, n) {
    const info = manifest[n.id] || {};
    const lines = [n.label, `Cost: ${info.cost ?? '-'}`];
    if (info.effects) lines.push(...info.effects);
    tooltip.innerHTML = lines.join('<br>');

    if (isAllocatable(n.id, allocated, adj, manifest)) {
      const btn = document.createElement('button');
      btn.textContent = 'Purchase';
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!isAllocatable(n.id, allocated, adj, manifest)) return;
        const info2 = manifest[n.id];
        if ((S.astralPoints || 0) < (info2?.cost || 0)) return;
        S.astralPoints -= info2.cost;
        allocated.add(n.id);
        applyEffects(n.id, manifest);
        saveAllocations(allocated);
        updateInsight();
        refreshClasses();
        hideTooltip();
      });
      tooltip.appendChild(document.createElement('br'));
      tooltip.appendChild(btn);
    }

    tooltip.style.display = 'block';
    positionTooltip(evt);
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  const res = await fetch(new URL('../data/astral_tree.json', import.meta.url));
  const treeData = await res.json();

  const nodes = treeData.nodes;
  const edges = treeData.edges;
  const manifest = buildManifest(nodes);

  const insightEl = document.getElementById('astralInsight');
  function updateInsight() {
    if (insightEl) insightEl.textContent = `Insight: ${S.astralPoints || 0}`;
  }
  updateInsight();

  const nodeById = {};
  nodes.forEach(n => (nodeById[n.id] = n));

  const adj = {};
  edges.forEach(e => {
    adj[e.from] = adj[e.from] || [];
    adj[e.from].push(e.to);
    adj[e.to] = adj[e.to] || [];
    adj[e.to].push(e.from);
  });

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs) - 50;
  const maxX = Math.max(...xs) + 50;
  const minY = Math.min(...ys) - 50;
  const maxY = Math.max(...ys) + 50;
  const treeWidth = maxX - minX;
  const treeHeight = maxY - minY;

  // Center on the initial "max Qi +50" node shown in the screenshot
  const startNode =
    nodes.find(n => n.label === 'max Qi +50') || nodes[0];
  const centerX = startNode.x;
  const centerY = startNode.y;
  const INITIAL_ZOOM = 5;

  const viewBox = {
    x: centerX - treeWidth / (2 * INITIAL_ZOOM),
    y: centerY - treeHeight / (2 * INITIAL_ZOOM),
    width: treeWidth / INITIAL_ZOOM,
    height: treeHeight / INITIAL_ZOOM,
  };

  function applyViewBox() {
    svg.setAttribute(
      'viewBox',
      `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    );
  }

  applyViewBox();

  function zoom(factor, cx = viewBox.x + viewBox.width / 2, cy = viewBox.y + viewBox.height / 2) {
    viewBox.width *= factor;
    viewBox.height *= factor;
    viewBox.x = cx - viewBox.width / 2;
    viewBox.y = cy - viewBox.height / 2;
    applyViewBox();
  }

  const ZOOM_STEP = 0.8;
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoom(ZOOM_STEP));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoom(1 / ZOOM_STEP));

  // Wheel zoom
  svg.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = viewBox.x + (mx / rect.width) * viewBox.width;
      const cy = viewBox.y + (my / rect.height) * viewBox.height;
      zoom(factor, cx, cy);
    },
    { passive: false }
  );

  // Panning
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  svg.addEventListener('mousedown', e => {
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    svg.classList.add('dragging');
  });
  svg.addEventListener('mousemove', e => {
    if (!isPanning) return;
    const dx = (e.clientX - startX) * (viewBox.width / svg.clientWidth);
    const dy = (e.clientY - startY) * (viewBox.height / svg.clientHeight);
    viewBox.x -= dx;
    viewBox.y -= dy;
    startX = e.clientX;
    startY = e.clientY;
    applyViewBox();
  });
  window.addEventListener('mouseup', () => {
    isPanning = false;
    svg.classList.remove('dragging');
  });

  // Touch interactions
  let touchMode = null; // 'pan' or 'pinch'
  let lastTouchX = 0;
  let lastTouchY = 0;
  let pinchDist = 0;
  let pinchCx = 0;
  let pinchCy = 0;

  svg.addEventListener(
    'touchstart',
    e => {
      if (e.touches.length === 1) {
        touchMode = 'pan';
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        touchMode = 'pinch';
        const [t1, t2] = e.touches;
        pinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const rect = svg.getBoundingClientRect();
        const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
        pinchCx = viewBox.x + (midX / rect.width) * viewBox.width;
        pinchCy = viewBox.y + (midY / rect.height) * viewBox.height;
      }
    },
    { passive: false }
  );

  svg.addEventListener(
    'touchmove',
    e => {
      e.preventDefault();
      if (touchMode === 'pan' && e.touches.length === 1) {
        const dx = (e.touches[0].clientX - lastTouchX) * (viewBox.width / svg.clientWidth);
        const dy = (e.touches[0].clientY - lastTouchY) * (viewBox.height / svg.clientHeight);
        viewBox.x -= dx;
        viewBox.y -= dy;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        applyViewBox();
      } else if (touchMode === 'pinch' && e.touches.length === 2) {
        const [t1, t2] = e.touches;
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const factor = pinchDist / dist;
        zoom(factor, pinchCx, pinchCy);
        pinchDist = dist;
      }
    },
    { passive: false }
  );

  window.addEventListener('touchend', e => {
    if (e.touches.length === 0) touchMode = null;
  });

  const allocated = loadAllocations();
  S.astralTreeBonuses = {};
  allocated.forEach(id => applyEffects(id, manifest));

  const nodeEls = {};
  const edgeEls = [];

  edges.forEach(e => {
    const a = nodeById[e.from];
    const b = nodeById[e.to];
    if (!a || !b) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('class', `connector ${a.group.toLowerCase()}`);
    svg.appendChild(line);
    edgeEls.push({ el: line, from: e.from, to: e.to });
  });

  nodes.forEach(n => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    // Increase node sizes: basic nodes 50% larger, notables 100% larger
    const r = n.type === 'notable' ? 16 : 6;
    circle.setAttribute('r', r);
    circle.setAttribute('class', `node ${n.group.toLowerCase()} ${n.type}`);

    circle.addEventListener('click', e => {
      e.stopPropagation();
      showTooltip(e, n);
    });

    nodeEls[n.id] = circle;
    svg.appendChild(circle);
  });

  svg.addEventListener('click', hideTooltip);

  function refreshClasses() {
    nodes.forEach(n => {
      const el = nodeEls[n.id];
      el.classList.toggle('taken', allocated.has(n.id));
      el.classList.toggle(
        'allocatable',
        !allocated.has(n.id) && isAllocatable(n.id, allocated, adj, manifest)
      );
    });
    edgeEls.forEach(e => {
      const active = allocated.has(e.from) && allocated.has(e.to);
      e.el.classList.toggle('active', active);
    });
  }

  refreshClasses();
}

function isAllocatable(id, allocated, adj, manifest) {
  if (allocated.has(id)) return false;
  const info = manifest[id];
  if (!info) return false;
  if ((S.astralPoints || 0) < info.cost) return false;
  if (allocated.size === 0) return START_NODES.has(id);
  const neighbors = adj[id] || [];
  return neighbors.some(n => allocated.has(n));
}

function applyEffects(id, manifest) {
  const info = manifest[id];
  if (!info || !info.bonus) return;
  const bonuses = S.astralTreeBonuses || (S.astralTreeBonuses = {});
  for (const [k, v] of Object.entries(info.bonus)) {
    bonuses[k] = (bonuses[k] || 0) + v;
  }
}

