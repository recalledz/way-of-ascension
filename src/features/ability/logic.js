import { processAttack } from '../../game/combat.js';
import { getEquippedWeapon } from '../inventory/selectors.js';

export function resolveAbilityHit(abilityKey, state) {
  switch (abilityKey) {
    case 'powerSlash':
      resolvePowerSlash(state);
      break;
    default:
      break;
  }
}

function resolvePowerSlash(state) {
  const weapon = getEquippedWeapon(state);
  const roll = Math.floor(Math.random() * (weapon.base.max - weapon.base.min + 1)) + weapon.base.min;
  const raw = Math.round(1.3 * roll);
  let dealt = 0;
  state.adventure.enemyHP = processAttack(
    state.adventure.enemyHP,
    raw,
    { target: state.adventure.currentEnemy, type: 'physical', onDamage: d => (dealt = d) }
  );
  state.adventure.combatLog.push(`You used Power Slash for ${dealt} Physical damage.`);
  if (dealt > 0) {
    const healed = Math.min(5, state.hpMax - state.hp);
    state.hp += healed;
    state.adventure.playerHP = state.hp;
    state.adventure.combatLog.push('You recovered 5 HP.');
    showHeal(healed);
  }
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
