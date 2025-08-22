import { clamp } from "../features/progression/selectors.js";
import { qCap, qiRegenPerSec, fCap, foundationGainPerSec } from "../features/progression/selectors.js";
import { refillShieldFromQi } from "../features/combat/logic.js";
import { updateBreakthrough } from "../features/progression/index.js";
import { advanceMining } from "../features/mining/logic.js";
import { tickPhysiqueTraining } from "../features/physique/mutators.js";
import { isAutoMeditate, isAutoAdventure } from "../features/automation/selectors.js";
import { toggleAutoMeditate } from "../features/automation/mutators.js";
import { updateAdventureCombat } from "../features/adventure/logic.js";
import { tickAbilityCooldowns } from "../features/ability/mutators.js";
import { advanceEffects } from "../shared/effects.js";
import { log } from "../shared/utils/dom.js";

export function gameTick(root, dtMs = 1000) {
  root.time++;

  tickAbilityCooldowns(dtMs);
  advanceEffects(root, dtMs);

  // Passive Qi & HP when not in combat
  root.qi = clamp(root.qi + qiRegenPerSec(root), 0, qCap(root));
  if (!(root.adventure?.inCombat)) {
    root.hp = clamp(root.hp + 1, 0, root.hpMax);
    if (root.adventure) root.adventure.playerHP = root.hp;
    const { gained, qiSpent } = refillShieldFromQi(root);
    if (gained > 0) log(`Your Qi reforms ${gained} shield (${qiSpent.toFixed(1)} Qi).`);
  }

  // Activity: Cultivation
  if (root.activities?.cultivation) {
    const gain = foundationGainPerSec(root);
    root.foundation = clamp(root.foundation + gain, 0, fCap(root));
  }

  // Passive systems
  advanceMining(root);

  // Physique training
  const sessionEnd = tickPhysiqueTraining(root);
  if (sessionEnd) log(`Training session complete! ${sessionEnd.hits} hits for ${sessionEnd.xp} XP`, 'good');

  // Back-compat auto modes
  if (isAutoMeditate() && Object.values(root.activities ?? {}).every(a => !a)) {
    const gain = foundationGainPerSec(root) * 0.5;
    root.foundation = clamp(root.foundation + gain, 0, fCap(root));
  }
  if (isAutoAdventure() && !root.activities?.adventure) {
    // The actual start is handled by UI hooks; we just honor the flag here.
  }

  updateBreakthrough();

  if (root.activities?.adventure && root.adventure?.inCombat) {
    updateAdventureCombat();
  }
}
