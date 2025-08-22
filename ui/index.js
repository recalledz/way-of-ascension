// Thin front-end bootstrap that delegates to the feature-first game entry.
import { initApp } from '../src/ui/app.js';

// Initialize global UI shell (currently a no-op placeholder).
initApp();

// Load the core game controller and feature modules.
import('../src/index.js');
