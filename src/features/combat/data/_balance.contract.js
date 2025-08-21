export default {
  fields: {
    duration: { min: 0 },
    tickRate: { min: 0 },
    maxStacks: { min: 1 }
  },
  monotonic: [
    { field: 'duration', direction: 'nondecreasing' },
    { field: 'maxStacks', direction: 'nondecreasing' }
  ]
};
