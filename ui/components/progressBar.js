/**
 * Creates a standardized progress bar component.
 * @param {object} config - The configuration for the progress bar.
 * @param {string} config.id - The base ID for the progress bar elements.
 * @param {string} config.label - The text label to display.
 * @param {number} config.value - The current value.
 * @param {number} config.max - The maximum value.
 * @returns {HTMLElement} The progress bar component.
 */
export function createProgressBar({ id, label, value, max }) {
  const container = document.createElement('div');
  container.className = 'progress-bar-container';
  container.id = `${id}-container`;

  const labelEl = document.createElement('div');
  labelEl.className = 'progress-label';
  labelEl.textContent = label;
  container.appendChild(labelEl);

  const barEl = document.createElement('div');
  barEl.className = 'progress-bar';

  const textEl = document.createElement('div');
  textEl.className = 'progress-text';
  textEl.id = `${id}-text`;
  textEl.textContent = `${value} / ${max}`;
  barEl.appendChild(textEl);

  const fillEl = document.createElement('div');
  fillEl.className = 'progress-fill';
  fillEl.id = `${id}-fill`;
  fillEl.style.width = `${(value / max) * 100}%`;
  barEl.appendChild(fillEl);

  container.appendChild(barEl);

  return container;
}

/**
 * Updates an existing progress bar.
 * @param {object} config - The configuration for the update.
 * @param {string} config.id - The base ID of the progress bar to update.
 * @param {number} config.value - The new current value.
 * @param {number} config.max - The new maximum value.
 */
export function updateProgressBar({ id, value, max, text }) {
  const fillEl = document.getElementById(`${id}-fill`);
  const textEl = document.getElementById(`${id}-text`);

  if (fillEl) {
    fillEl.style.width = `${(max > 0 ? (value / max) * 100 : 0)}%`;
  }
  if (textEl) {
    textEl.textContent = text !== undefined ? text : `${value} / ${max}`;
  }
}
