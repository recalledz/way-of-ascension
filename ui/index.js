// Thin front-end bootstrap that ensures the app shell initializes
// before feature modules are loaded.
import { initApp } from '../src/ui/app.js';

// Initialize the shell and then dynamically import the feature-first entry.
(async () => {
  await initApp();
  await import('../src/index.js');
})();
