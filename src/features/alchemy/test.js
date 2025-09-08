import assert from 'node:assert';
import { alchemyState } from './state.js';
import { startConcoct, cancelConcoct } from './mutators.js';
import { getLab } from './selectors.js';
import { tickAlchemy } from './logic.js';

// Basic selectors
const root = { alchemy: structuredClone(alchemyState), qi: 10, notifications: [] };
assert.strictEqual(getLab(root).slots, 2);

// Queue behavior and automatic start
root.alchemy.lab.slots = 1;
startConcoct({ time: 1 }, root);
startConcoct({ time: 1 }, root);
assert.strictEqual(root.alchemy.lab.activeJobs.length, 1);
assert.strictEqual(root.alchemy.lab.queue.length, 1);
tickAlchemy(root, 1000);
assert.strictEqual(root.alchemy.lab.activeJobs.length, 1);
assert.strictEqual(root.alchemy.lab.queue.length, 0);
tickAlchemy(root, 1000);
assert.strictEqual(root.alchemy.lab.activeJobs.length, 0);

// Qi drain scaling and pause/resume
const root2 = { alchemy: structuredClone(alchemyState), qi: 1.5, notifications: [] };
root2.alchemy.settings.qiDrainEnabled = true;
const jid = startConcoct({ time: 5 }, root2);
tickAlchemy(root2, 1000);
assert.strictEqual(root2.alchemy.lab.paused, false);
assert.ok(Math.abs(root2.qi - 0.5) < 1e-8);
assert.ok(Math.abs(root2.alchemy.lab.activeJobs[0].remaining - 4) < 1e-8);
tickAlchemy(root2, 1000);
assert.strictEqual(root2.alchemy.lab.paused, true);
assert.ok(Math.abs(root2.alchemy.lab.activeJobs[0].remaining - 4) < 1e-8);
assert.ok(root2.notifications.find(n => n.id === 'alchemy-no-qi'));
root2.qi = 2;
tickAlchemy(root2, 1000);
assert.strictEqual(root2.alchemy.lab.paused, false);
assert.ok(Math.abs(root2.alchemy.lab.activeJobs[0].remaining - 3) < 1e-8);
cancelConcoct(jid, root2);

// Drain scales with active slots
const root3 = { alchemy: structuredClone(alchemyState), qi: 10, notifications: [] };
root3.alchemy.settings.qiDrainEnabled = true;
startConcoct({ time: 10 }, root3);
startConcoct({ time: 10 }, root3);
tickAlchemy(root3, 1000);
assert.ok(Math.abs(root3.qi - 7.75) < 1e-8);

// Notification when starting with no qi
const root4 = { alchemy: structuredClone(alchemyState), qi: 0, notifications: [] };
root4.alchemy.settings.qiDrainEnabled = true;
startConcoct({ time: 1 }, root4);
assert.strictEqual(root4.alchemy.lab.activeJobs.length, 0);
assert.strictEqual(root4.alchemy.lab.queue.length, 1);
assert.ok(root4.notifications.find(n => n.id === 'alchemy-no-qi'));

console.log('alchemy logic ok');

