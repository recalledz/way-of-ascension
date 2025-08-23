const MAX_NODES = 24;
const pool = [];
const active = [];
let enabled = true;

function createNode() {
  const el = document.createElement('div');
  el.className = 'fct';
  el.style.position = 'absolute';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '9999';
  el.style.willChange = 'transform, opacity';
  return el;
}

function obtainNode() {
  let el = pool.pop();
  if (el) return el;
  if (active.length >= MAX_NODES) {
    el = active.shift();
    el.getAnimations().forEach(a => a.cancel());
    if (el.parentNode) el.parentNode.removeChild(el);
    return el;
  }
  return createNode();
}

function recycle(el) {
  const idx = active.indexOf(el);
  if (idx !== -1) active.splice(idx, 1);
  el.textContent = '';
  el.removeAttribute('class');
  el.className = 'fct';
  if (el.parentNode) el.parentNode.removeChild(el);
  pool.push(el);
}

export function setFloatingTextEnabled(v) {
  enabled = v;
}

export function showFloatingText({ targetEl, result, amount = 0 }) {
  if (!enabled || !targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const baseX = rect.left + rect.width / 2 + window.scrollX;
  const baseY = rect.top + window.scrollY;
  const node = obtainNode();

  // Prepare text
  let text = '';
  if (result === 'miss') text = 'Miss';
  else text = result === 'crit' ? `${amount}!` : String(amount);
  node.textContent = text;
  node.className = `fct fct-${result}`;
  node.style.visibility = 'hidden';
  document.body.appendChild(node);

  const { offsetWidth: w, offsetHeight: h } = node;
  let x = baseX - w / 2;
  let y = baseY - h;
  const jitterX = (Math.random() * 6 + 12) * (Math.random() < 0.5 ? -1 : 1);
  const jitterY = Math.random() * 8;
  x += jitterX;
  y -= jitterY;
  x = Math.min(Math.max(x, window.scrollX), window.scrollX + vw - w);
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.visibility = 'visible';

  const size = Math.max(12, Math.min(32, rect.width / 3));
  node.style.fontSize = `${result === 'crit' ? size * 1.3 : size}px`;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const distance = prefersReducedMotion ? 20 : 40 + Math.random() * 30;
  const duration = prefersReducedMotion ? 400 : 600 + Math.random() * 300;
  const dx = jitterX;

  const keyframes = [];
  if (result === 'crit' && !prefersReducedMotion) {
    keyframes.push({ transform: `translate(${dx}px,0) scale(1)`, opacity: 1, offset: 0 });
    keyframes.push({ transform: `translate(${dx}px,0) scale(1.25)`, opacity: 1, offset: 0.1 });
    keyframes.push({ transform: `translate(${dx}px,0) scale(1)`, opacity: 1, offset: 0.2 });
  } else if (result === 'miss' && !prefersReducedMotion) {
    keyframes.push({ transform: `translate(${dx - 4}px,0)`, opacity: 1, offset: 0 });
    keyframes.push({ transform: `translate(${dx + 4}px,0)`, opacity: 1, offset: 0.05 });
    keyframes.push({ transform: `translate(${dx}px,0)`, opacity: 1, offset: 0.1 });
  } else {
    keyframes.push({ transform: `translate(${dx}px,0)`, opacity: 1, offset: 0 });
  }
  keyframes.push({ transform: `translate(${dx}px,-${distance}px)`, opacity: 0, offset: 1 });

  const anim = node.animate(keyframes, { duration, easing: 'ease-out' });
  active.push(node);
  anim.onfinish = () => recycle(node);
}

export { enabled as floatingTextEnabled };
