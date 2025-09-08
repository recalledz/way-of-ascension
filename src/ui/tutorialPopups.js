import { on } from '../shared/events.js';

export function mountAbilityTutorialPopup(state) {
  on('ABILITY:CAST', () => {
    if (state.tutorial?.abilityPopupShown) return;
    state.tutorial = state.tutorial || {};
    state.tutorial.abilityPopupShown = true;
    showAbilityPopup();
  });
}

function showAbilityPopup() {
  if (document.getElementById('abilityTutorialOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'abilityTutorialOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content tutorial-card">
      <div class="card-header">
        <h4>Abilities</h4>
        <button class="btn small ghost close-btn">×</button>
      </div>
      <p>Each base type weapon comes with an ability. Abilities usually cost qi to use and have a set cooldown before it can be used again. More abilities may be learned or equipped through laws or manuals. Abilities may be equipped in character menu abilities sub tab</p>
    </div>`;
  document.body.appendChild(overlay);

  function close() { overlay.remove(); }
  overlay.querySelector('.close-btn').addEventListener('click', close);
  overlay.querySelector('.modal-backdrop').addEventListener('click', close);
}
