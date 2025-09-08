import assert from 'node:assert';
import { alchemyState } from './state.js';
import { startConcoct, finishConcoct, cancelConcoct, toggleQiDrain } from './mutators.js';
import { getAlchemyLevel, getLab, getKnownRecipes, getOutputs, getResistanceFor } from './selectors.js';

const root = { alchemy: structuredClone(alchemyState) };

assert.strictEqual(getAlchemyLevel(root), 1);
assert.strictEqual(getLab(root).slots, 2);
assert.deepStrictEqual(getKnownRecipes(root), { qi: true });

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

console.log('alchemy selectors/mutators ok');
