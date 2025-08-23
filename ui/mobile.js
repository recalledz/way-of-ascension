// Handles responsive canvas sizing and touch controls for mobile devices
const canvas = document.getElementById('gameCanvas') || document.querySelector('canvas');

function resizeCanvas() {
  if (!canvas) return;
  const ratio = canvas.width / canvas.height || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w / h > ratio) {
    canvas.style.height = `${h}px`;
    canvas.style.width = `${h * ratio}px`;
  } else {
    canvas.style.width = `${w}px`;
    canvas.style.height = `${w / ratio}px`;
  }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

function dispatchArrow(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

let startX = 0;
let startY = 0;

window.addEventListener('touchstart', e => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});

window.addEventListener('touchend', e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    dispatchArrow(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
  } else {
    dispatchArrow(dy > 0 ? 'ArrowDown' : 'ArrowUp');
  }
});

window.addEventListener('touchmove', e => {
  // prevent default scrolling during game interaction
  if (canvas) e.preventDefault();
}, { passive: false });
