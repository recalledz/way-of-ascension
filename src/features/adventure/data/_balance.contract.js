export default {
  fields: {
    killReq: { min: 1 }
  },
  monotonic: [
    { field: 'killReq', direction: 'nondecreasing' },
    { field: 'killReq', direction: 'nondecreasing' }
  ]
};
