export default {
  fields: {
    level: { min: 0 }
  },
  monotonic: [
    { field: 'level', direction: 'nondecreasing' },
    { field: 'level', direction: 'nondecreasing' }
  ]
};
