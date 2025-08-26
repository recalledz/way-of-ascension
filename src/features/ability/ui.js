import { on } from '../../shared/events.js';
import { playFireball, setFxTint } from '../combat/ui/index.js';

export function setupAbilityUI() {
  on('ABILITY:HEAL', ({ amount }) => {
    showHeal(amount);
  });
  on('ABILITY:CAST', ({ abilityKey }) => {
    if (abilityKey === 'fireball') {
      const pos = getCombatPositions();
      if (pos) {
        setFxTint(pos.svg, 'red');
        playFireball(pos.svg, pos.from, pos.to);
      }
    }
  });
}

function showHeal(amount) {
  const el = document.getElementById('hpVal');
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const note = document.createElement('div');
  note.className = 'heal-float';
  note.textContent = `+${amount}`;
  note.style.left = rect.left + 'px';
  note.style.top = rect.top - 20 + 'px';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1000);
}

function getCombatPositions() {
  const svg = document.getElementById('combatFx');
  const playerEl = document.querySelector('.combatant.player');
  const enemyEl = document.querySelector('.combatant.enemy');
  if (!svg || !playerEl || !enemyEl) return null;
  const rect = svg.getBoundingClientRect();
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
  if (!Number.isFinite(from.x) || !Number.isFinite(from.y) || !Number.isFinite(to.x) || !Number.isFinite(to.y)) return null;
  return { svg, from, to };
}
