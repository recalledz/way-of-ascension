export default {
  fields: {
    realm: { min: 0 },
    stage: { min: 0 }
  },
  monotonic: [
    { field: 'realm', direction: 'nondecreasing' },
    { field: 'stage', direction: 'nondecreasing' }
  ]
};
