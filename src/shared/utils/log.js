export function log(msg, cls = '') {
  const el = document.getElementById('log');
  if (!el) return;
  const p = document.createElement('p');
  if (cls) p.className = cls;
  p.textContent = msg;
  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
}
