import { LAWS } from '../data/laws.js';
import { S } from '../../../shared/state.js';
import { setText } from '../../../shared/utils/dom.js';
import { on, emit } from '../../../shared/events.js';
import { selectLaw, learnSkill } from '../mutators.js';
import { canLearnSkill } from '../logic.js';


export function updateLawsDisplay(){
  // Update law points display
  if(document.getElementById('lawPoints')){
    setText('lawPoints', S.laws.points);
  }
  
  // Update selected law display
  if(document.getElementById('selectedLaw')){
    const selectedText = S.laws.selected ? LAWS[S.laws.selected].name : 'None';
    setText('selectedLaw', selectedText);
  }
  
  // Update law selection buttons
  renderLawSelection();
  
  
  // Update skill trees
  renderSkillTrees();
}

export function renderLawSelection(){
  const container = document.getElementById('lawSelection');
  if(!container) return;
  
  container.innerHTML = '';
  
  if(S.laws.unlocked.length === 0){
    container.innerHTML = '<p class="muted">Laws unlock at Foundation stage.</p>';
    return;
  }
  
  S.laws.unlocked.forEach(lawKey => {
    const law = LAWS[lawKey];
    const isSelected = S.laws.selected === lawKey;
    const div = document.createElement('div');
    div.className = 'card law-card';
    if(isSelected) div.classList.add('selected');
    
    div.innerHTML = `
      <h4>${law.icon} ${law.name} ${isSelected ? '(Selected)' : ''}</h4>
      <p class="muted">${law.desc}</p>
      <div class="law-bonuses">
        ${Object.entries(law.bonuses).map(([key, value]) => {
          let bonus = '';
          if(key === 'atk') bonus = `+${Math.round((value-1)*100)}% ATK`;
          else if(key === 'def') bonus = `+${Math.round((value-1)*100)}% DEF`;
          else if(key === 'qiRegen') bonus = `+${Math.round((value-1)*100)}% Qi Regen`;
          else if(key === 'resourceYield') bonus = `+${Math.round((value-1)*100)}% Resources`;
          else if(key === 'alchemySuccess') bonus = `+${Math.round((value-1)*100)}% Alchemy`;
          else if(key === 'pillEffectiveness') bonus = `+${Math.round((value-1)*100)}% Pills`;
          else if(key === 'critChance') bonus = `+${Math.round(value*100)}% Crit`;
          return bonus ? `<span class="bonus">${bonus}</span>` : '';
        }).join('')}
      </div>
    `;

    if (!isSelected) {
      const btn = document.createElement('button');
      btn.className = 'btn primary';
      btn.textContent = 'Select Law';
      btn.addEventListener('click', () => {
        selectLaw(lawKey);
        emit('RENDER');
        updateLawsDisplay();
      });
      div.appendChild(btn);
    }

    container.appendChild(div);
  });
}

export function renderSkillTrees(){
  const container = document.getElementById('skillTrees');
  if(!container || !S.laws.selected) return;
  
  const law = LAWS[S.laws.selected];
  const tree = S.laws.trees[S.laws.selected];
  
  container.innerHTML = `<h4>${law.icon} ${law.name} Skill Tree</h4>`;
  
  const skillsDiv = document.createElement('div');
  skillsDiv.className = 'skills-grid';
  
  Object.entries(law.tree).forEach(([skillKey, skill]) => {
    const isLearned = tree[skillKey];
    const canLearn = canLearnSkill(S.laws.selected, skillKey);
    
    const skillDiv = document.createElement('div');
    skillDiv.className = `skill-node ${isLearned ? 'learned' : ''} ${canLearn ? 'available' : ''}`;
    
    skillDiv.innerHTML = `
      <div class="skill-name">${skill.name}</div>
      <div class="skill-desc">${skill.desc}</div>
      <div class="skill-cost">Cost: ${skill.cost} points</div>
      ${isLearned ? '<div class="learned-badge">✓</div>' : ''}
    `;

    if (!isLearned && canLearn) {
      const btn = document.createElement('button');
      btn.className = 'btn small';
      btn.textContent = 'Learn';
      btn.addEventListener('click', () => {
        learnSkill(S.laws.selected, skillKey);
        emit('RENDER');
        updateLawsDisplay();
      });
      skillDiv.appendChild(btn);
    }

    skillsDiv.appendChild(skillDiv);
  });
  
  container.appendChild(skillsDiv);
}

export function mountLawDisplay() {
  on('RENDER', updateLawsDisplay);
  updateLawsDisplay();
}
