import assert from 'node:assert';
import { alchemyState } from './state.js';
import { startConcoct, finishConcoct, cancelConcoct, toggleQiDrain } from './mutators.js';
import { getAlchemyLevel, getLab, getKnownRecipes, getOutputs, getResistanceFor } from './selectors.js';
import { applyManualEffects } from '../mind/logic.js';
import { getManual } from '../mind/data/manuals.js';
import { learnSkill } from '../progression/mutators.js';
import { progressionState } from '../progression/state.js';

global.document = { getElementById: () => null };

const root = { alchemy: structuredClone(alchemyState), stats: { mind: 10 } };

assert.strictEqual(getAlchemyLevel(root), 1);
assert.strictEqual(getLab(root).slots, 2);
assert.deepStrictEqual(getKnownRecipes(root), {});

const id = startConcoct({ time: 1, output: { itemKey: 'potion', qty: 1, tier: 0 }, exp: 10 }, root);
assert.strictEqual(getLab(root).activeJobs.length, 1);
finishConcoct(id, root);
assert.strictEqual(getLab(root).activeJobs.length, 0);
assert.strictEqual(getOutputs(root).potion.qty, 1);

const id2 = startConcoct({ time: 1 }, root);
cancelConcoct(id2, root);
assert.strictEqual(getLab(root).activeJobs.length, 0);

toggleQiDrain(true, root);
assert.strictEqual(root.alchemy.settings.qiDrainEnabled, true);
assert.deepStrictEqual(getResistanceFor('qi', root), { rp: 0, rpCap: 0 });

// manual unlock
const manual = getManual('mentalDisciplineI');
applyManualEffects(root, manual, 1);
assert.ok(root.alchemy.knownRecipes.insight);

// law unlock
const root2 = { ...structuredClone(progressionState), alchemy: structuredClone(alchemyState) };
root2.laws.unlocked.push('alchemy');
root2.laws.points = 100;
learnSkill('alchemy', 'basic_alchemy', root2);
assert.ok(root2.alchemy.knownRecipes.qi);

console.log('alchemy selectors/mutators ok');
