export default {
  fields: {
    time: { min: 0 },
    base: { min: 0 },
    xp: { min: 0 }
  },
  monotonic: [
    { field: 'time', direction: 'nondecreasing' },
    { field: 'xp', direction: 'nondecreasing' }
  ]
};
