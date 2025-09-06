import { devUnlockPreset } from "../config.js";
import { selectProgress } from "../shared/selectors.js";
import { advanceRealm, unlockAstralNode } from "./progression/mutators.js";
import { forceBuild } from "./sect/mutators.js";

export function applyDevUnlockPreset(state) {
  if (devUnlockPreset !== 'all') return;
  const prog = state.progression || state;
  while (selectProgress.mortalStage(prog) < 5) advanceRealm(prog);
  while (!selectProgress.isQiRefiningReached(prog) || selectProgress.realmStage(prog) < 2) {
    advanceRealm(prog);
  }
  unlockAstralNode(4060, prog);
  unlockAstralNode(4061, prog);
  unlockAstralNode(4062, prog);
  forceBuild(state, 'alchemy');
  forceBuild(state, 'kitchen');
}
