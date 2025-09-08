import { strict as assert } from 'node:assert';
import { alchemyState } from './state.js';
import { getAlchemyLevel, getLab, getKnownRecipes, getOutputs, getResistanceFor } from './selectors.js';
import { startConcoct, finishConcoct, cancelConcoct, toggleQiDrain } from './mutators.js';

const state = { alchemy: structuredClone(alchemyState) };

// selectors
assert.equal(getAlchemyLevel(state), 1);
assert.equal(getLab(state).slots, 2);
assert.ok(getKnownRecipes(state).qi);
assert.deepEqual(getResistanceFor('none', state), { rp: 0, rpCap: 0 });

// toggle setting
toggleQiDrain(state, false);
assert.equal(state.alchemy.settings.qiDrainEnabled, false);

// mutators
const job = { id: 'j1', output: 'pill', tier: 1, qty: 2, exp: 50, t: 1 };
assert.ok(startConcoct(state, job));
assert.equal(getLab(state).activeJobs.length, 1);

finishConcoct(state, 'j1');
assert.equal(getLab(state).activeJobs.length, 0);
assert.equal(getOutputs(state).pill.qty, 2);
assert.equal(getAlchemyLevel(state), 1);

startConcoct(state, { id: 'j2', output: 'x', t:1 });
assert.equal(getLab(state).activeJobs.length, 1);
cancelConcoct(state, 'j2');
assert.equal(getLab(state).activeJobs.length, 0);

state.alchemy.resistance.qi = { rp: 5, rpCap: 10 };
assert.deepEqual(getResistanceFor('qi', state), { rp: 5, rpCap: 10 });

console.log('Alchemy tests passed');
