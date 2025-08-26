const NS = 'http://www.w3.org/2000/svg';

let active = 0;
const MAX_FX = 25;
let reduceMotion = false;
try {
  reduceMotion = localStorage.getItem('reduce-motion') === '1';
} catch {}

export function setReduceMotion(v) {
  reduceMotion = v;
}

function spawn(svg, el, duration = 400) {
  if (!svg || reduceMotion || active >= MAX_FX) return;
  active++;
  svg.appendChild(el);
  setTimeout(() => {
    if (el.parentNode === svg) svg.removeChild(el);
    active--;
  }, duration);
}

export function setFxTint(svg, tint = 'auto') {
  if (!svg) return;
  const map = {
    auto: ['#fff', '#ddd'],
    blue: ['#6cf', '#39f'],
    red: ['#ff9a00', '#ff0000'],
    green: ['#9f9', '#0f0'],
    yellow: ['#fffa8b', '#ffd700'],
  };
  const [a, b] = map[tint] || map.auto;
  svg.style.setProperty('--fx-a', a);
  svg.style.setProperty('--fx-b', b);
}

export function playSlashArc(svg, from, to) {
  const path = document.createElementNS(NS, 'path');
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 10;
  path.setAttribute('d', `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`);
  path.classList.add('fx-stroke');
  spawn(svg, path, 400);
}

export function playThrustLine(svg, from, to) {
  // Validate inputs to avoid NaN SVG attributes
  const valid = (
    svg && from && to &&
    Number.isFinite(from.x) && Number.isFinite(from.y) &&
    Number.isFinite(to.x) && Number.isFinite(to.y)
  );
  if (!valid) {
    // Silently ignore invalid thrusts to prevent console SVG errors
    return;
  }
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('x1', String(from.x));
  line.setAttribute('y1', String(from.y));
  line.setAttribute('x2', String(to.x));
  line.setAttribute('y2', String(to.y));
  line.classList.add('fx-thrust');
  spawn(svg, line, 300);
}

export function playRingShockwave(svg, center, radius = 20, gradientId) {
  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', center.x);
  circle.setAttribute('cy', center.y);
  circle.setAttribute('r', 0);
  circle.style.setProperty('--fx-radius', radius);
  circle.classList.add('fx-ring');
  if (gradientId) {
    circle.style.stroke = `url(#${gradientId})`;
  }
  spawn(svg, circle, 600);
}

function playRuneCircle(svg, at) {
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', `translate(${at.x - 50},${at.y - 50})`);
  g.classList.add('fx-rotate');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', '#rune-circle');
  g.appendChild(use);
  spawn(svg, g, 600);
}

export function playBeam(svg, from, to) {
  playRuneCircle(svg, from);
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('x1', from.x);
  line.setAttribute('y1', from.y);
  line.setAttribute('x2', to.x);
  line.setAttribute('y2', to.y);
  line.classList.add('fx-beam');
  spawn(svg, line, 400);
}

export function playChakram(svg, from, to) {
  const g = document.createElementNS(NS, 'g');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', '#rune-circle');
  g.appendChild(use);
  svg.appendChild(g);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let start;
  const duration = 600;
  function animate(ts) {
    if (!start) start = ts;
    const t = ts - start;
    const p = t / duration;
    const progress = p <= 0.5 ? p * 2 : (1 - p) * 2;
    const x = from.x + dx * progress;
    const y = from.y + dy * progress;
    g.setAttribute('transform', `translate(${x - 50},${y - 50})`);
    if (p < 1) {
      requestAnimationFrame(animate);
    } else {
      svg.removeChild(g);
    }
  }
  if (!reduceMotion && active < MAX_FX) {
    active++;
    requestAnimationFrame(animate);
    setTimeout(() => { active--; }, duration);
  } else if (svg.contains(g)) {
    svg.removeChild(g);
  }
}

export function playFireball(svg, from, to) {
  playBeam(svg, from, to);
  setTimeout(() => playRingShockwave(svg, to, 8, 'elem-fire'), 350);
}

export function playShieldDome(svg, center, radius = 25) {
  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', center.x);
  circle.setAttribute('cy', center.y);
  circle.style.setProperty('--fx-radius', radius);
  circle.classList.add('fx-shield');
  spawn(svg, circle, 600);
}

export function playSparkBurst(svg, center) {
  playRingShockwave(svg, center, 6);
}

export { reduceMotion };
