// src/features/mind/puzzles/sequenceMemory.js
// Implements a simple sequence memory puzzle similar to "Simon".
// Shows a sequence of rune buttons with audio/visual cues and verifies
// user input. On success, awards puzzle multiplier via solvePuzzle.

import { solvePuzzle } from '../mutators.js';
import { save } from '../../../shared/state.js';

const RUNES = [
  { icon: 'mdi:triangle-outline', color: '#f87171', freq: 440 },
  { icon: 'mdi:square-outline', color: '#60a5fa', freq: 520 },
  { icon: 'mdi:circle-outline', color: '#34d399', freq: 600 },
  { icon: 'mdi:diamond-outline', color: '#fbbf24', freq: 700 },
];

function playTone(freq, dur = 200) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur / 1000);
    osc.stop(ctx.currentTime + dur / 1000);
  } catch (e) {
    // ignore audio errors (e.g., unsupported browser)
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calcDifficulty(len, delay) {
  let diff = Math.max(0, len - 3);
  if (delay < 700) diff += 1;
  if (delay < 500) diff += 1;
  return diff;
}

export function startSequenceMemoryTest(S, { length = 3, delay = 800 } = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content card sequence-memory-card">
      <div class="card-header">
        <h4>Sequence Memory</h4>
        <button class="btn small ghost close-btn">×</button>
      </div>
      <div class="memory-runes"></div>
      <div class="memory-msg">Watch the sequence</div>
    </div>`;
  document.body.appendChild(overlay);

    const close = () => {
      overlay.remove();
      resolve(false);
    };
    overlay.querySelector('.modal-backdrop').addEventListener('click', close);
    overlay.querySelector('.close-btn').addEventListener('click', close);

  const runeWrap = overlay.querySelector('.memory-runes');
  const msg = overlay.querySelector('.memory-msg');

  const runeEls = RUNES.map((r, idx) => {
    const btn = document.createElement('button');
    btn.className = 'rune-btn';
    btn.dataset.idx = String(idx);
    btn.style.setProperty('--clr', r.color);
    btn.innerHTML = `<iconify-icon icon="${r.icon}" aria-hidden="true"></iconify-icon>`;
    runeWrap.appendChild(btn);
    return btn;
  });

  const sequence = Array.from({ length }, () => Math.floor(Math.random() * RUNES.length));

  let accepting = false;
  let pos = 0;

  async function playback() {
    accepting = false;
    msg.textContent = 'Watch the sequence';
    for (const idx of sequence) {
      const el = runeEls[idx];
      el.classList.add('active');
      playTone(RUNES[idx].freq);
      await wait(delay);
      el.classList.remove('active');
      await wait(200);
    }
    msg.textContent = 'Repeat the sequence';
    accepting = true;
  }

    function success() {
      accepting = false;
      msg.textContent = 'Correct!';
      const diff = calcDifficulty(sequence.length, delay);
      solvePuzzle(S, diff);
      save?.();
      setTimeout(() => {
        overlay.remove();
        resolve(true);
      }, 600);
    }

  function failure() {
    accepting = false;
    msg.textContent = 'Incorrect';
    setTimeout(() => {
      pos = 0;
      playback();
    }, 1000);
  }

  runeEls.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!accepting) return;
      const idx = parseInt(btn.dataset.idx, 10);
      const el = runeEls[idx];
      el.classList.add('active');
      playTone(RUNES[idx].freq);
      setTimeout(() => el.classList.remove('active'), 200);
      if (sequence[pos] === idx) {
        pos += 1;
        if (pos >= sequence.length) {
          success();
        }
      } else {
        failure();
      }
    });
  });

    playback();
  });
}

export default startSequenceMemoryTest;
